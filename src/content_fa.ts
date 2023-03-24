(() => {
	let img: HTMLImageElement
	let a: HTMLAnchorElement
	let dl: number

	const btn = document.createElement('img')
	btn.id = 'fatabs'
	btn.src = browser.runtime.getURL('images/download.png')
	btn.addEventListener('click', (e) => {
		const fav = dl
		fetch(a.href)
		.then((response) => response.text())
		.then((text) => {
			if (fav) { // fav/unfav
				const m = text.match(new RegExp(`(/${fav < 2 ? 'fav' : 'unfav'}/.*?)"`))
				if (m) {
					fetch(`https://www.furaffinity.net${m[1]}`)
				}
			} else { // download
				const m = text.match(/(d.furaffinity.net\/.*?)"/)
				if (m) {
					browser.runtime.sendMessage({ type: 'btn', src: `https://${m[1]}` })
				}
			}
		})
		if (dl < 2) {
			dl++ ; btn.title = 'Fav Image'
		} else {
			dl-- ; btn.title = 'UnFav Image'
		}
		a.dataset.dl = dl.toString()
		e.preventDefault()
	})

	document.addEventListener('mouseover', (e) => {
		const t = e.target
		if (t instanceof HTMLImageElement
		 && (t.offsetWidth >= 185 || t.offsetHeight >= 185)) {
			btn.className = ''
			if (img !== t) {
				const anc = t.closest('a')
				if (anc) {
					(a = anc).prepend(btn)
					dl = parseInt(a.dataset.dl || '0')
					btn.title = (!dl ? 'Download' :
						(dl < 2 ? 'Fav' : 'Unfave')) + ' Image'
					img = t
				}
			}
		} else if (btn !== t) {
			btn.className = 'hide'
		}
	})
})()
