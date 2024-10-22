(() => {
	let img: HTMLImageElement;
	let a: HTMLAnchorElement;
	let fav: number;

	const btn = document.createElement('img');
	btn.id = 'fatabs';
	btn.src = browser.runtime.getURL('images/download.svg');
	btn.addEventListener('click', (e) => {
		const prev = fav;
		fav = +!fav;
		btn.title = (fav ? 'UnFav' : 'Fav') + ' Image';
		a.dataset.fav = fav.toString();
		void fetch(a.href)
			.then((response) => response.text())
			.then((text) => {
				if (prev < 0) { // download
					const m = /(d\.furaffinity\.net\/.*?)"/.exec(text);
					if (m) {
						void browser.runtime.sendMessage(
							{ type: 'btn', src: `https://${m[1]}` });
					}
				} else { // (un)fav
					const m = new RegExp(`(/${prev ? 'un' : ''}fav/.*?)"`).exec(text);
					if (m) {
						void fetch(`https://www.furaffinity.net${m[1]}`);
					}
				}
			});
		e.preventDefault();
	});

	document.addEventListener('mouseover', (e) => {
		const t = e.target;
		if (t === btn) {
			return;
		}
		if (t instanceof HTMLImageElement
			&& (t.offsetWidth >= 180 || t.offsetHeight >= 180)) {
			btn.className = '';
			if (img !== t) {
				const anc = t.closest('a');
				if (anc) {
					(a = anc).prepend(btn);
					img = t;
					fav = parseInt(a.dataset.fav ?? '-1');
					btn.title = (fav == -1 ? 'Download' :
						(fav == 0 ? 'Fav' : 'UnFav')) + ' Image';
				}
			}
		} else {
			btn.className = 'hide';
		}
	});
})();
