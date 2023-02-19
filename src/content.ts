let img: HTMLImageElement | HTMLVideoElement

const btn = document.createElement('div')
btn.id = 'fatabs-button'
btn.title = 'Download Image'
btn.addEventListener('click', (e) => {
	let src: string
	let filename: string | undefined

	if (img instanceof HTMLVideoElement) {
		let vid: HTMLSourceElement | null = img.querySelector('source')
		src = vid ? vid.src : img.src
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
		const a = img.closest('a')
		const link = a ? a.href : img.baseURI
		const twitter = link.match(/.*?:\/\/twitter\.com\/([a-zA-Z0-9_]+)/)
		if (twitter) {
			const end = src.indexOf('?')
			const s = src.substring(0, end > 0 ? end : undefined)
			let ext = new URLSearchParams(src.substring(end)).get('format')
			ext = ext ? ext : 'jpg'
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
	if ((e.target instanceof HTMLImageElement || e.target instanceof HTMLVideoElement)
	 && (e.target.offsetWidth >= 260 && e.target.offsetHeight >= 260)) {
		img = e.target
		const neighbor = (img instanceof HTMLVideoElement && img.parentElement) ?
			img.parentElement : img
		neighbor.before(btn)
	} else if (e.target !== btn) {
		btn.remove()
	}
})
