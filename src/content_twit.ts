(() => {
	let img: HTMLImageElement | HTMLVideoElement
	const reg = /.*:\/\/(?:x|twitter)\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/

	const cookies: { [key: string]: string } = {}
	document.cookie.split(';').filter(n => n.indexOf('=') > 0).forEach((n) => {
		n.replace(/^([^=]+)=(.+)$/, (match, name, value) => {
			return cookies[name.trim()] = value.trim()
		})
	})
	const headers: { [key: string]: string } = {
		'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6'
			+ 'I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
		'x-twitter-active-user': 'yes',
		'x-twitter-client-language': cookies.lang,
		'x-csrf-token': cookies.ct0
	}
	if (cookies.ct0.length == 32) {
		headers['x-guest-token'] = cookies.gt
	}

	const btn = document.createElement('img')
	btn.id = 'fatabs'
	btn.title = 'Download Image'
	btn.src = browser.runtime.getURL('images/download.svg')
	btn.addEventListener('click', (e) => {
		if (btn.parentElement) {
			btn.parentElement.dataset.fav = '0'
		}
		let a: HTMLAnchorElement | null, b: HTMLElement | null
		const input = ( (a = img.closest('a')) || (a = (b = img.closest('article'))
			&& b.querySelector('a[href*="/status/"]')) )
			&& a.href || img.baseURI
		const m = input.match(reg)
		if (img instanceof HTMLImageElement) {
			const q = img.src.indexOf('?')
			const s = img.src.substring(0, q)
			const ext = img.src.substring(q + 8, img.src.indexOf('&', q + 8))
			const src = s + '?format=' + ext + '&name=orig'
			const idx = parseInt(input.substring(input.lastIndexOf('/') + 1))
			const filename = (m ? `${m[1].replace(/_/g, '-')}_${m[2]}.${idx}`
				: s.substring(s.lastIndexOf('/') + 1)) + '.' + ext
			browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename })
		} else if (img.src.startsWith('http')) { // gif
			const src = img.src
			const filename = (m ? `${m[1].replace(/_/g, '-')}_${m[2]}.` : '')
				+ src.substring(src.lastIndexOf('/') + 1)
			browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename })
		} else { // video
			if (!m) {
				return
			}
			const vid = img
			const url = 'https://x.com/i/api/2/timeline/conversation/'
				+ m[2] + '.json?tweet_mode=extended&include_entities=false'
				+ '&include_user_entities=false'
			fetch(url, {headers: headers})
			.then((result) => result.json())
			.then((json) => {
				let tweet = json.globalObjects.tweets[m[2]]
				let media = tweet.extended_entities && tweet.extended_entities.media
				if (!media && tweet.quoted_status_id_str) {
					tweet = json.globalObjects.tweets[tweet.quoted_status_id_str]
					media = tweet.extended_entities && tweet.extended_entities.media
				}
				let idx = 1
				if (!media) {
					return
				} else if (media.length > 1) {
					const n = vid.poster.match(/\/(\d+)\//)
					if (n) {
						const elem = media.find((x: any) => x.id_str == n[1])
						idx = media.indexOf(elem) + 1
						media = elem
					}
				} else {
					media = media[0]
				}
				const n = media.expanded_url.match(reg)
				const user_id = n[1]
				const status_id = n[2]
				const src: string = media.video_info.variants
					.filter((n: any) => n.content_type == 'video/mp4')
					.sort((a: any, b: any) => b.bitrate - a.bitrate)[0].url
				const filename = `${user_id.replace(/_/g, '-')}_${status_id}.${idx}.mp4`
				browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename })
			})
		}
		e.stopPropagation()
		e.preventDefault()
	})

	function findVideo(a: HTMLElement): ChildNode | null {
		let b: ChildNode | null, c: ChildNode | null
		return (c = (b = a.previousSibling) && b.firstChild) && c.firstChild
	}

	document.addEventListener('mouseover', (e) => {
		const t = e.target
		if (t === btn) {
			return
		}
		if (t instanceof HTMLImageElement
		 && (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			btn.className = ''
			if (img !== t) {
				img = t
				img.before(btn)
				btn.title = 'Download Image'
			}
		} else if (t instanceof HTMLDivElement) {
			const a = t.parentElement && t.parentElement.parentElement
			let b: HTMLElement | null, vid: ChildNode | null
			if (a && ( (b = a.parentElement) && (vid = findVideo(b))
			 || (vid = findVideo(a)) ) && vid instanceof HTMLVideoElement) {
				btn.className = ''
				if (img !== vid) {
					img = vid
					// @ts-ignore
					img.parentElement.parentElement.before(btn)
					btn.title = 'Download Video'
				}
			} else {
				btn.className = 'hide'
			}
		} else {
			btn.className = 'hide'
		}
	})
})()
