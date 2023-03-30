(() => {
	let img: HTMLImageElement
	let a: HTMLAnchorElement
	let fav: number

	const btn = document.createElement('img')
	btn.id = 'fatabs'
	btn.src = browser.runtime.getURL('images/download.svg')
	btn.addEventListener('click', (e) => {
		const prev = fav
		fav = +!fav
		btn.title = fav ? 'Fav' : 'UnFav'
		a.dataset.fav = fav.toString()
		fetch(a.href)
		.then((response) => response.text())
		.then((text) => {
			if (prev < 0) { // download
				const m = text.match(/(d.furaffinity.net\/.*?)"/)
				if (m) {
					browser.runtime.sendMessage({ type: 'btn', src: `https://${m[1]}` })
				}
			} else { // (un)fav
				const m = text.match(new RegExp(`(/${prev ? 'un' : ''}fav/.*?)"`))
				if (m) {
					fetch(`https://www.furaffinity.net${m[1]}`)
				}
			}
		})
		e.preventDefault()
	})

	document.addEventListener('mouseover', (e) => {
		const t = e.target
		if (t === btn) {
			return
		}
		if (t instanceof HTMLImageElement
		 && (t.offsetWidth >= 180 || t.offsetHeight >= 180)) {
			btn.className = ''
			if (img !== t) {
				const anc = t.closest('a')
				if (anc) {
					(a = anc).prepend(btn)
					img = t
					fav = parseInt(a.dataset.fav || '-1')
					switch (fav) {
						case -1: btn.title = 'Download'; break
						case +0: btn.title = 'Fav'     ; break
						case +1: btn.title = 'UnFav'   ; break
					}
				}
			}
		} else {
			btn.className = 'hide'
		}
	})
})()
