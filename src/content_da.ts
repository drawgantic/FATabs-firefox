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
		a.dataset.dl = '1'
		e.preventDefault()
	})

	document.addEventListener('mouseover', (e) => {
		const t = e.target
		if (t instanceof HTMLAnchorElement && t.nextElementSibling
		 && t.nextElementSibling.firstChild) {
			const sib = t.nextElementSibling.firstChild
			if (sib instanceof HTMLImageElement
			 && (sib.offsetWidth >= 190 || sib.offsetHeight >= 190)) {
				btn.className = ''
				if (img !== sib) {
					(a = t).prepend(btn)
					img = sib
				}
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
		} else if (btn !== t) {
			btn.className = 'hide'
		}
	})
})()
