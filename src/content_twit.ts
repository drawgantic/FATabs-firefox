(() => {
	let img: HTMLImageElement
	let a: HTMLAnchorElement | null

	const btn = document.createElement('img')
	btn.id = 'fatabs'
	btn.title = 'Download Image'
	btn.src = browser.runtime.getURL('images/download.png')
	btn.addEventListener('click', (e) => {
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
		e.stopPropagation()
		e.preventDefault()
	})

	document.addEventListener('mouseover', (e) => {
		const t = e.target
		if (t instanceof HTMLImageElement
		 && (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			img = t
			let focus = t.closest('a')
			if (a !== focus) {
				((a = focus) || img).before(btn)
			}
			btn.className = ''
		} else if (btn !== t && a !== t) {
			btn.className = 'hide'
		}
	})
})()
