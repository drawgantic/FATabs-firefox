(() => {
	let img: HTMLImageElement;
	let a: HTMLAnchorElement;

	const btn = document.createElement('img');
	btn.id = 'fatabs';
	btn.title = 'Download Image';
	btn.src = browser.runtime.getURL('images/download.svg');
	btn.addEventListener('click', (e) => {
		a.dataset.fav = '0';
		const m = /(derpicdn\.net|furrycdn\.org)\/img\/(\d+\/\d+\/\d+)\/(\d+)\/\w+\.(\w+)/
			.exec(img.src);
		if (!m) {
			return;
		}
		const ext = (m[4] === 'gif') ? 'webm' : m[4];
		const src = `https://${m[1]}/img/view/${m[2]}/${m[3]}.${ext}`;
		const artist = /(?:artist|editor):([0-9A-Za-z-_ ]+)/.exec(img.alt);
		const filename =
			(artist ? artist[1].replace(/[_ ]/g, '-') + '_' : '') + m[3] + '.' + ext;
		void browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename });
		e.preventDefault();
	});

	document.addEventListener('mouseover', (e) => {
		const t = e.target;
		if (t === btn || t === a) {
			return;
		}
		if (t instanceof HTMLImageElement
			&& (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			btn.className = '';
			if (img !== t) {
				const anc = t.closest('a');
				if (anc) {
					(a = anc).prepend(btn);
					img = t;
				}
			}
		} else {
			btn.className = 'hide';
		}
	});
})();
