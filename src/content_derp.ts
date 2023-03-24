(() => {
	let img: HTMLImageElement
	let a: HTMLAnchorElement | null

	const btn = document.createElement('img')
	btn.id = 'fatabs'
	btn.title = 'Download Image'
	btn.src = browser.runtime.getURL('images/download.png')
	btn.addEventListener('click', (e) => {
		let match = img.src.match(
			/https:\/\/(derpicdn\.net|furrycdn\.org)\/img\/(\d+\/\d+\/\d+)\/(\d+)\/\w+\.(\w+)/)
		if (match) {
			const ext = (match[4] === 'gif') ? 'webm' : match[4]
			const src = `https://${match[1]}/img/view/${match[2]}/${match[3]}.${ext}`
			const artist = img.alt.match(/(?:artist|editor):([0-9A-Za-z-_ ]+)/)
			const filename = (artist ? artist[1].replace(/[_ ]/g, '-') + '_' : '')
			               + match[3] + '.' + ext
			browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename })
		}
	})

	document.addEventListener('mouseover', (e) => {
		const t = e.target
		if (t instanceof HTMLImageElement
		 && (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			if (img !== t) {
				img = t
				a = img.closest('a');
				(a || img).before(btn)
			}
			btn.className = ''
		} else if (btn !== t && a !== t) {
			btn.className = 'hide'
		}
	})
})()
