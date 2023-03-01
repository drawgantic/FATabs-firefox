let img: HTMLImageElement
let a: HTMLAnchorElement | null

let click: (e: MouseEvent) => void
if (/.*:\/\/(?:fur|derpi)booru\.org\/(?!images)/.test(document.URL)) {
	click = (e) => {
		let match = img.src.match(
			/https:\/\/(derpicdn\.net|furrycdn\.org)\/img\/(\d+\/\d+\/\d+)\/(\d+)\/\w+\.(\w+)/)
		if (match) {
			const ext = (match[4] === 'gif') ? 'webm' : match[4]
			const src = `https://${match[1]}/img/view/${match[2]}/${match[3]}.${ext}`
			const artist = img.alt.match(/(?:artist|editor):([0-9A-Za-z-_ ]+)/)
			const filename = (artist ? artist[1].replace(/[_ ]/g, '-') + '_' : '')
			               + match[3] + '.' + ext
			browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename })
		}
	}
} else if (/.*:\/\/(?:fur|derpi)booru\.org\/images/.test(document.URL)) {
	click = (e) => {
		const src = img.src
		const dot = src.lastIndexOf('.')
		const tag = src.substring(src.lastIndexOf('/')+1, dot)
		const meta: HTMLMetaElement | null =
			document.querySelector('meta[name="description"]')
		const artist = meta && meta.content.match(/(?:artist|editor):([0-9A-Za-z-_ ]+)/)
		const filename = (artist ? artist[1].replace(/[_ ]/g, '-') + '_' : '')
		               + tag + src.substring(dot)
		browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename })
	}
} else if (/.*:\/\/www.furaffinity.net\/(?!view)/.test(document.URL)) {
	click = (e) => {
		let match = (a ? a.href : img.baseURI).match(/\/view\/\d+/)
		if (match) {
			fetch("https://www.furaffinity.net" + match[0])
			.then((response) => response.text())
			.then((text) => {
				const view = text.match(/src="(\/\/d.furaffinity.net\/.*?)"/)
				if (view) {
					browser.runtime.sendMessage({ type: 'btn', src: `https:${view[1]}` })
				}
			})
		}
	}
} else if (/.*:\/\/twitter\.com/.test(document.URL)) {
	click = (e) => {
		let src = img.src
		const q = src.indexOf('?')
		const s = src.substring(0, (q > 0) && q || undefined)
		const ext = (q > 0) &&
			new URLSearchParams(src.substring(q)).get('format') || 'jpg'
		const artist = (a ? a.href : img.baseURI).match(
			/.*:\/\/twitter\.com\/([a-zA-Z0-9_]+)/)
		const filename = (artist ? artist[1].replace(/_/g, '-') + '_' : '')
		               + s.substring(s.lastIndexOf('/') + 1) + '.' + ext
		src = s + '?format=' + ext + '&name=orig'
		browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename })
	}
} else {
	click = (e) => browser.runtime.sendMessage({ type: 'btn', src: img.src })
}

const btn = document.createElement('div')
btn.id = 'fatabs'
btn.title = 'Download Image'
btn.addEventListener('click', (e) => {
	click(e)
	e.stopPropagation()
	e.preventDefault()
})

document.addEventListener('mouseover', (e) => {
	const t = e.target
	if (t instanceof HTMLImageElement
	 && (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
		img = t
		a = t.closest('a');
		(a || img).before(btn)
	} else if (btn !== t && a !== t) {
		btn.remove()
	}
})
