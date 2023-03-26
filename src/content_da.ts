(() => {
	let img: HTMLImageElement
	let a: HTMLAnchorElement

	const btn = document.createElement('img')
	btn.id = 'fatabs'
	btn.title = 'Download Image'
	btn.src = browser.runtime.getURL('images/download.png')
	btn.addEventListener('click', (e) => {
		const src = img.src
		fetch(a.href)
		.then((response) => response.text())
		.then((text) => {
			const match = text.match(/(?:<div><img|<video).*?src="(.*?)"/)
			if (match) {
				const url = match[1]
				let s: number | undefined = src.indexOf('?')
				let u: number | undefined
				if (s == -1) {
					s = undefined, u = undefined
				} else {
					u = url.indexOf('?')
				}
				const filename =
					src.substring(src.lastIndexOf('/', s) + 1, src.lastIndexOf('-', s)) +
					url.substring(url.lastIndexOf('.', u), u)
				browser.runtime.sendMessage(
					{ type: 'btn', src: url, filename: filename })
			}
		})
		a.dataset.fav = '0'
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
