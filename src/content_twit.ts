namespace X {
	export interface Video {
		content_type: string;
		bitrate: number;
		url: string;
	}

	export interface Media {
		video_info: { variants: Video[]; };
		expanded_url: string;
		media_url: string;
		id_str: string;
	}

	export interface Tweet {
		extended_entities: { media: Media[] | null; } | null;
		quoted_status_id_str: string | null;
	}

	export interface Json {
		data: { tweetResult: { result: { legacy: Tweet; }; }; };
	}
}

(() => {
	function getHash(src: string): string {
		return src.slice(src.lastIndexOf('/') + 1, src.lastIndexOf('.'));
	}

	let img: HTMLImageElement | HTMLVideoElement;
	const reg = /.*:\/\/(?:x|twitter)\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/;

	const API_FEATURES = {
		articles_preview_enabled: false,
		c9s_tweet_anatomy_moderator_badge_enabled: false,
		communities_web_enable_tweet_community_results_fetch: false,
		creator_subscriptions_quote_tweet_preview_enabled: false,
		creator_subscriptions_tweet_preview_api_enabled: false,
		freedom_of_speech_not_reach_fetch_enabled: false,
		graphql_is_translatable_rweb_tweet_is_translatable_enabled: false,
		longform_notetweets_consumption_enabled: false,
		longform_notetweets_inline_media_enabled: false,
		longform_notetweets_rich_text_read_enabled: false,
		premium_content_api_read_enabled: false,
		profile_label_improvements_pcf_label_in_post_enabled: false,
		responsive_web_edit_tweet_api_enabled: false,
		responsive_web_enhance_cards_enabled: false,
		responsive_web_graphql_exclude_directive_enabled: false,
		responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
		responsive_web_graphql_timeline_navigation_enabled: false,
		responsive_web_grok_analysis_button_from_backend: false,
		responsive_web_grok_analyze_button_fetch_trends_enabled: false,
		responsive_web_grok_analyze_post_followups_enabled: false,
		responsive_web_grok_image_annotation_enabled: false,
		responsive_web_grok_share_attachment_enabled: false,
		responsive_web_grok_show_grok_translated_post: false,
		responsive_web_jetfuel_frame: false,
		responsive_web_media_download_video_enabled: false,
		responsive_web_twitter_article_tweet_consumption_enabled: false,
		rweb_tipjar_consumption_enabled: false,
		rweb_video_screen_enabled: false,
		standardized_nudges_misinfo: false,
		tweet_awards_web_tipping_enabled: false,
		tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
		tweetypie_unmention_optimization_enabled: false,
		verified_phone_label_enabled: false,
		view_counts_everywhere_api_enabled: false,
	};
	const API_FEATURES_ENCODED = encodeURIComponent(JSON.stringify(API_FEATURES));

	const API_VARS = {
		tweetId: "",
		with_rux_injections: false,
		includePromotedContent: false,
		withCommunity: false,
		withQuickPromoteEligibilityTweetFields: false,
		withBirdwatchNotes: false,
		withVoice: false,
		withV2Timeline: false,
	};

	const cookies: Record<string, string> = {};
	document.cookie.split(';').filter(n => n.indexOf('=') > 0).forEach((n) => {
		n.replace(/^([^=]+)=(.+)$/, (_, name: string, value: string) => {
			return cookies[name.trim()] = value.trim();
		});
	});
	const headers: Record<string, string> = {
		'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6'
			+ 'I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
		'x-twitter-active-user': 'yes',
		'x-twitter-client-language': cookies.lang,
		'x-csrf-token': cookies.ct0
	};
	if (cookies.ct0.length == 32) {
		headers['x-guest-token'] = cookies.gt;
	}

	const btn = document.createElement('img');
	btn.id = 'fatabs';
	btn.title = 'Download Image';
	btn.src = browser.runtime.getURL('images/download.svg');
	btn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		if (btn.parentElement) {
			btn.parentElement.dataset.fav = '0';
		}
		let a: HTMLAnchorElement | null;
		let b: HTMLElement | null;
		const input = ((a = img.closest('a') ?? ((b = img.closest('article'))
			&& b.querySelector('a[href*="/status/"][dir="ltr"]')
		)) && a.href) ?? img.baseURI;
		const m = input.match(reg);
		if (img instanceof HTMLImageElement) {
			const q = img.src.indexOf('?');
			const s = img.src.slice(0, q);
			const ext = img.src.slice(q + 8, img.src.indexOf('&', q + 8));
			const src = s + '?format=' + ext + '&name=orig';
			const idx = parseInt(input.slice(input.lastIndexOf('/') + 1));
			const filename = (m ? `${m[1].replace(/_/g, '-')}_${m[2]}.${idx.toString()}`
				: s.slice(s.lastIndexOf('/') + 1)) + '.' + ext;
			void browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename });
			return;
		}
		// video
		if (!m) {
			return;
		}
		const vid = img;
		const vars = { ...API_VARS, tweetId: m[2] };
		const url = `https://x.com/i/api/graphql/2ICDjqPd81tulZcYrtpTuQ/TweetResultByRestId`
			+ `?variables=${encodeURIComponent(JSON.stringify(vars))}`
			+ `&features=${API_FEATURES_ENCODED}`;

		void fetch(url, { headers: headers }).then((res) => res.json()).then((json) => {
			console.log(json);
			const j = json as X.Json;
			let tweet = j.data.tweetResult.result.legacy;
			let media = tweet.extended_entities?.media;
			let med: X.Media;
			if (!media && tweet.quoted_status_id_str) {
				// tweet = j.globalObjects.tweets[tweet.quoted_status_id_str];
				// media = tweet.extended_entities?.media;
				console.log(tweet.quoted_status_id_str);
				return;
			}
			let idx = 1;
			if (!media) {
				return;
			} else if (media.length > 1) {
				if (vid.src.startsWith('http')) { // gif
					const elem = media.find((x: X.Media) =>
						getHash(x.media_url) == getHash(vid.src));
					idx = elem ? media.indexOf(elem) + 1 : 0;
					med = elem ?? media[0];
				} else {
					const n = vid.poster.match(/\/(\d+)\//);
					if (n) {
						const elem = media.find((x: X.Media) => x.id_str == n[1]);
						idx = elem ? media.indexOf(elem) + 1 : 0;
						med = elem ?? media[0];
					} else {
						med = media[0];
					}
				}
			} else {
				med = media[0];
			}
			const n = med.expanded_url.match(reg);
			if (!n || n.length < 3) {
				return;
			}
			const user_id = n[1];
			const status_id = n[2];
			const src: string = med.video_info.variants
				.filter((n: X.Video) => n.content_type == 'video/mp4')
				.sort((a: X.Video, b: X.Video) => b.bitrate - a.bitrate)[0].url;
			const filename = `${user_id.replace(/_/g, '-')}_`
				+ `${status_id}.${idx.toString()}.mp4`;
			void browser.runtime.sendMessage(
				{ type: 'btn', src: src, filename: filename });
		});
	});

	document.addEventListener('mouseover', (e) => {
		const t = e.target;
		if (t === btn) {
			return;
		}
		const is_img = t instanceof HTMLImageElement;
		let candidate: HTMLImageElement | HTMLVideoElement | null = null;
		let sibling: ChildNode = t as ChildNode;

		if (is_img && (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			candidate = sibling = t;
		} else if (t instanceof HTMLDivElement) {
			const a = t.parentElement && t.parentElement.parentElement;
			const b = a && (a.parentElement && a.parentElement.previousSibling
				|| a.previousSibling);
			const vid = b && b.firstChild && b.firstChild.firstChild;

			if (vid && vid instanceof HTMLVideoElement) {
				candidate = vid;
				sibling = b;
			}
		}
		if (candidate !== null) {
			btn.className = '';
			if (img !== candidate) {
				img = candidate;
				sibling.before(btn);
				btn.title = 'Download Video';
			}
		} else {
			btn.className = 'hide';
		}
	});
})();
