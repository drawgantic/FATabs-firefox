namespace X {
	export interface Video {
		content_type: string;
		bitrate: number;
		url: string;
	}

	export interface VideoInfo {
		variants: Video[];
	}

	export interface Media {
		video_info: VideoInfo;
		expanded_url: string;
		media_url: string;
		id_str: string;
	}

	export interface Extended {
		media: Media[] | null;
	}

	export interface Tweet {
		extended_entities: Extended | null;
		quoted_status_id_str: string | null;
	}

	export interface GlobalObj {
		tweets: Record<string, Tweet>;
	}

	export interface Json {
		globalObjects: GlobalObj;
	}
}

(() => {
	function getHash(src: string): string {
		return src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'));
	}

	let img: HTMLImageElement | HTMLVideoElement;
	const reg = /.*:\/\/(?:x|twitter)\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/;

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
			const s = img.src.substring(0, q);
			const ext = img.src.substring(q + 8, img.src.indexOf('&', q + 8));
			const src = s + '?format=' + ext + '&name=orig';
			const idx = parseInt(input.substring(input.lastIndexOf('/') + 1));
			const filename = (m ? `${m[1].replace(/_/g, '-')}_${m[2]}.${idx.toString()}`
				: s.substring(s.lastIndexOf('/') + 1)) + '.' + ext;
			void browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename });
			return;
		}
		// video
		if (!m) {
			return;
		}
		const vid = img;
		const url = 'https://x.com/i/api/2/timeline/conversation/'
			+ m[2] + '.json?tweet_mode=extended&include_entities=false'
			+ '&include_user_entities=false';
		void fetch(url, { headers: headers })
			.then((result) => result.json())
			.then((json) => {
				const j = json as X.Json;
				let tweet = j.globalObjects.tweets[m[2]];
				let media = tweet.extended_entities?.media;
				let med: X.Media;
				if (!media && tweet.quoted_status_id_str) {
					tweet = j.globalObjects.tweets[tweet.quoted_status_id_str];
					media = tweet.extended_entities?.media;
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
		if (
			t instanceof HTMLImageElement
			&& (t.offsetWidth >= 190 || t.offsetHeight >= 190)
		) {
			btn.className = '';
			if (img !== t) {
				img = t;
				img.before(btn);
				btn.title = 'Download Image';
			}
		} else if (t instanceof HTMLDivElement) {
			let b: HTMLElement | null;
			const z = t.parentElement;
			const a = z && z.parentElement;
			const c = a && ((b = a.parentElement) && b.previousSibling
				|| a.previousSibling);
			const d = c && c.firstChild;
			const vid = d && d.firstChild;

			if (vid && vid instanceof HTMLVideoElement) {
				btn.className = '';
				if (img !== vid) {
					img = vid;
					c.before(btn);
					btn.title = 'Download Video';
				}
			} else {
				btn.className = 'hide';
			}
		} else {
			btn.className = 'hide';
		}
	});
})();
