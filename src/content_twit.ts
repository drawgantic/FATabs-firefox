(() => {
	let img: HTMLImageElement | HTMLVideoElement
	const reg = /.*:\/\/twitter\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/

	const btn = document.createElement('img')
	btn.id = 'fatabs'
	btn.title = 'Download Image'
	btn.src = browser.runtime.getURL('images/download.png')
	btn.addEventListener('click', (e) => {
		if (img instanceof HTMLImageElement) {
			// image handling
			let src = img.src
			const q = src.indexOf('?')
			const s = src.substring(0, (q > 0) && q || undefined)
			const ext = src.substring(q + 8, src.indexOf('&', q + 8))
			const a = img.closest('a')
			const m = (a && a.href || img.baseURI).match(reg)
			const filename = (m ? `${m[1].replace(/_/g, '-')}_${m[2]}.` : '')
				+ s.substring(s.lastIndexOf('/') + 1) + '.' + ext
			src = s + '?format=' + ext + '&name=orig'
			browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename })
		} else {
			// video handling
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

			const article = img.closest('article')
			const a: HTMLAnchorElement | null =
				article && article.querySelector('a[href*="/status/"]')
			const m = a && a.href.match(reg)
			if (!m) {
				return
			}
			const url = 'https://twitter.com/i/api/2/timeline/conversation/'
				+ m[2] + '.json?tweet_mode=extended&include_entities=false'
				+ '&include_user_entities=false'
			fetch(url, {headers: headers})
			.then((result) => result.json())
			.then((json) => {
				let tweet = json.globalObjects.tweets[m[2]]
				let user_id: string, status_id: string
				if (tweet.extended_entities) {
					user_id   = m[1]
					status_id = m[2]
				} else if (tweet.quoted_status_id_str) {
					const n = tweet.quoted_status_permalink.expanded.match(reg)
					user_id = n && n[1] || m[1]
					status_id = tweet.quoted_status_id_str
					tweet = json.globalObjects.tweets[status_id]
				} else {
					return
				}
				const media = tweet.extended_entities && tweet.extended_entities.media[0]
				if (!media) {
					return
				}
				const src: string = media.video_info.variants
					.filter((n: any) => n.content_type == 'video/mp4')
					.sort((a: any, b: any) => b.bitrate - a.bitrate)[0].url
				const dot = src.lastIndexOf('.')
				const name = src.substring(src.lastIndexOf('/', dot) + 1, dot)
				const filename = `${user_id.replace(/_/g, '-')}_${status_id}.${name}.mp4`
				browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename })
			})
		}
		if (btn.parentElement) {
			btn.parentElement.dataset.fav = '0'
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
