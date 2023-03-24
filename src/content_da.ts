(() => {
	let img: HTMLImageElement
	let a: HTMLAnchorElement | null

	const btn = document.createElement('img')
	btn.id = 'fatabs'
	btn.title = 'Download Image'
	btn.src = browser.runtime.getURL('images/download.png')
	btn.addEventListener('click', (e) => {
		if (a) {
			let src = img.src
			fetch(a.href)
			.then((response) => response.text())
			.then((text) => {
				const match = text.match(/(<div><img|<video).*?src="(.*?)"/)
				if (match) {
					let url = match[2]
					let filename: string
					if (match[1] == '<video') {
						filename = src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('-'))
						         + url.substring(url.lastIndexOf('.'))
					} else {
						let q = src.indexOf('?')
						filename = src.substring(
							src.lastIndexOf('/', q) + 1, src.lastIndexOf('-', q))
						q = url.indexOf('?')
						filename += url.substring(url.lastIndexOf('.', q), q)
					}
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
			if (img !== sib) {
				img = sib
				a = <HTMLAnchorElement>t;
				(a || img).before(btn)
			}
			btn.className = ''
		} else if (t instanceof HTMLImageElement
		 && (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			if (img !== t) {
				img = t
				a = img.closest('a');
				(a || img).before(btn)
			}
			btn.className = ''
		} else if (btn !== t) {
			btn.className = 'hide'
		}
	})
})()
