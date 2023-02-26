let img: HTMLImageElement | HTMLVideoElement | null

const btn = document.createElement('div')
btn.id = 'fatabs'
btn.title = 'Download Image'
btn.addEventListener('click', (e) => {
	if (!img) {
		return
	}
	let src: string
	let filename: string | undefined

	if (!img.src) {
		const vid = img.querySelector('source')
		if (!vid) {
			return
		}
		src = vid.src
	} else {
		src = img.src
	}

	const derp = document.URL.match(/.*:\/\/(?:fur|derpi)booru\.org\/images\/([0-9]+)/)
	if (derp) {
		const meta: HTMLMetaElement | null =
			document.querySelector('meta[name="description"]')
		const artist = meta?.content.match(/(?:artist|editor):([0-9A-Za-z-_ ]+)/)
		filename = (artist ? artist[1].replace(/[_ ]/g, '-') + '_' : '') + derp[1]
		         + src.substring(src.lastIndexOf('.'))
	} else {
		const link = img.closest('a')?.href || img.baseURI
		const twitter = link.match(/.*?:\/\/twitter\.com\/([a-zA-Z0-9_]+)/)
		if (twitter) {
			const q = src.indexOf('?')
			const s = src.substring(0, (q > 0) ? q : undefined)
			const ext = (q > 0) &&
				new URLSearchParams(src.substring(q)).get('format') || 'jpg'
			filename = twitter[1].replace(/_/g, '-') + '_'
			         + s.substring(s.lastIndexOf('/') + 1) + '.' + ext
			src = s + '?format=' + ext + '&name=orig'
		} else {
			filename = undefined
		}
	}
	browser.runtime.sendMessage({ type: 's', src: src, filename: filename })
	e.stopPropagation()
	e.preventDefault()
})

document.addEventListener('mouseover', (e) => {
	if (e.target === img) {
		return
	}
	if ((e.target instanceof HTMLImageElement || e.target instanceof HTMLVideoElement)
	 && (e.target.offsetWidth >= 240 && e.target.offsetHeight >= 240)) {
		img = e.target
		const neighbor = img instanceof HTMLVideoElement && img.parentElement || img
		neighbor.before(btn)
	} else if (e.target !== btn) {
		img = null
		btn.remove()
	}
})
