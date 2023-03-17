(() => {
	let img: HTMLImageElement
	let a: HTMLAnchorElement | null

	const btn = document.createElement('div')
	btn.id = 'fatabs'
	btn.title = 'Download Image'
	btn.addEventListener('click', (e) => {
		let src = img.src
		let end = src.indexOf('?')
		let filename = src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('-', end))
		if (a) {
			fetch(a.href)
			.then((response) => response.text())
			.then((text) => {
				const match = text.match(/<div><img.*?src="(.*?)"/)
				if (match) {
					let url = match[1]
					end = url.indexOf('?')
					let fmt = url.substring(url.lastIndexOf('-', end), end)
					console.log(url)
					console.log(fmt)
					filename += url.substring(url.lastIndexOf('.', end), end)
					browser.runtime.sendMessage(
						{ type: 'btn', src: url, filename: filename })
				}
			})
		}
	})

	document.addEventListener('mouseover', (e) => {
		const t = e.target
		const sib = (<Element>t).nextElementSibling?.firstElementChild
		if (sib instanceof HTMLImageElement
		 && (sib.offsetWidth >= 190 || sib.offsetHeight >= 190)) {
			img = sib
			a = <HTMLAnchorElement>t
			a.before(btn)
		} else if (t instanceof HTMLImageElement
		 && (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			img = t
			a = t.closest('a');
			(a || img).before(btn)
		} else if (btn !== t && a !== t) {
			btn.remove()
		}
	})
})()
