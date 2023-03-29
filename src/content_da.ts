(() => {
	let img: HTMLImageElement
	let a: HTMLAnchorElement

	const btn = document.createElement('img')
	btn.id = 'fatabs'
	btn.title = 'Download Image'
	btn.src = browser.runtime.getURL('images/download.svg')
	btn.addEventListener('click', (e) => {
		const url = img.src
		a.dataset.fav = '0'
		fetch(a.href)
		.then((response) => response.text())
		.then((text) => {
			const m = text.match(/(?:<div><img|<video).*?src="(.*?)"/)
			if (m) {
				const src = m[1]
				let s: number | undefined = src.indexOf('?')
				let u: number | undefined
				if (s == -1) {
					s = undefined, u = undefined
				} else {
					u = url.indexOf('?')
				}
				const filename =
					url.substring(url.lastIndexOf('/', u) + 1, url.lastIndexOf('-', u)) +
					src.substring(src.lastIndexOf('.', s), s)
				browser.runtime.sendMessage(
					{ type: 'btn', src: src, filename: filename })
			}
		})
		e.preventDefault()
	})

	document.addEventListener('mouseover', (e) => {
		const t = e.target
		if (t === btn) {
			return
		}
		if (t instanceof HTMLAnchorElement) {
			const next = t.nextElementSibling
			const prev = t.previousElementSibling
			const neph         = (next && next.firstChild instanceof HTMLImageElement ?
				next.firstChild : (prev && prev.firstChild instanceof HTMLImageElement ?
				prev.firstChild : null))
			if (neph && (neph.offsetWidth >= 190 || neph.offsetHeight >= 190)) {
				btn.className = ''
				if (img !== neph) {
					(a = t).prepend(btn)
					img = neph
				}
			} else {
				btn.className = 'hide'
			}
		} else if (t instanceof HTMLImageElement
		 && (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			btn.className = ''
			if (img !== t) {
				const anc = t.closest('a')
				if (anc) {
					(a = anc).prepend(btn)
					img = t
				}
			}
		} else {
			btn.className = 'hide'
		}
	})
})()
