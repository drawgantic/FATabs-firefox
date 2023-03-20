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
		 && (t.offsetWidth >= 185 || t.offsetHeight >= 185)) {
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
