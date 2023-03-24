(() => {
	let img: HTMLImageElement
	let a: HTMLAnchorElement | null
	let dl: number

	const btn = document.createElement('img')
	btn.id = 'fatabs'
	btn.src = browser.runtime.getURL('images/download.png')
	btn.addEventListener('click', (e) => {
		if (a) {
			const d = dl
			fetch(a.href)
			.then((response) => response.text())
			.then((text) => {
				if (d) { // fav/unfav
					const m = text.match(new RegExp(`(/${d < 2 ? 'fav' : 'unfav'}/.*?)"`))
					if (m) {
						fetch('https://www.furaffinity.net'+m[1])
					}
				} else { // download
					const m = text.match(/(d.furaffinity.net\/.*?)"/)
					if (m) {
						browser.runtime.sendMessage({ type: 'btn', src: `https://${m[1]}` })
					}
				}
			})
			dl += (dl < 2) ? 1 : -1
			a.dataset.dl = dl.toString()
			btn.title = (dl < 2 ? 'Fav' : 'Unfave') + ' Image'
			e.preventDefault()
		}
	})

	document.addEventListener('mouseover', (e) => {
		const t = e.target
		if (t instanceof HTMLImageElement
		 && (t.offsetWidth >= 185 || t.offsetHeight >= 185)) {
			img = t
			let focus = t.closest('a')
			if (a !== focus) {
				a = focus
				img.before(btn)
				dl = parseInt(a && a.dataset.dl || '0')
				btn.title = (!dl ? 'Download' : (dl < 2 ? 'Fav' : 'Unfave')) + ' Image'
			}
			btn.className = ''
		} else if (btn !== t && a !== t) {
			btn.className = 'hide'
		}
	})
})()
