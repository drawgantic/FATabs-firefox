(() => {
	let img: HTMLImageElement
	let a: HTMLAnchorElement | null

	const btn = document.createElement('div')
	btn.id = 'fatabs'
	btn.title = 'Download Image'
	btn.addEventListener('click', (e) => {
		if (a) {
			fetch(a.href)
			.then((response) => response.text())
			.then((text) => {
				const view = text.match(/href="(\/\/d.furaffinity.net\/.*?)"/)
				if (view) {
					browser.runtime.sendMessage({ type: 'btn', src: `https:${view[1]}` })
				}
			})
		}
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
})()
