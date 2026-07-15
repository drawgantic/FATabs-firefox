(() => {
	let a: HTMLAnchorElement;
	let fav: number;

	const btn = document.createElement('img');
	btn.id = 'fatabs';
	btn.src = browser.runtime.getURL('images/download.svg');
	btn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		const prev = fav;
		fav = +!fav;
		btn.title = (fav ? 'UnFav' : 'Fav') + ' Image';
		a.dataset.fav = fav.toString();
		void fetch(a.href)
			.then((response) => response.text())
			.then((text) => {
				if (prev < 0) { // download
					const m = text.match(/(d\.furaffinity\.net\/art\/.*?)"/);
					if (m) {
						var name = m[1].substring(m[1].lastIndexOf('/') + 1);
						const tag = name.indexOf('.');
						const ext = name.lastIndexOf('.');
						name = name.substring(tag + 1, ext) + '.'
							+ name.substring(0, tag) + name.substring(ext);
						void browser.runtime.sendMessage(
							{ type: 'btn', src: `https://${m[1]}`, filename: name });
					}
				} else { // fav/unfav toggle
					const m = text.match(new RegExp(`(/${prev ? 'un' : ''}fav/.*?)"`));
					if (m) {
						void fetch(`https://www.furaffinity.net${m[1]}`);
					}
				}
			});
	});

	document.addEventListener('mouseover', (e) => {
		const t = e.target;
		if (t === btn) {
			return;
		}
		if (
			t instanceof HTMLImageElement
			&& t.parentElement instanceof HTMLAnchorElement
			&& t.parentElement.closest("section.gallery")
		) {
			btn.className = '';
			if (a !== t.parentElement) {
				a = t.parentElement;
				a.prepend(btn);
				fav = parseInt(a.dataset.fav ?? '-1');
				btn.title = (fav == -1 ? 'Download' :
					(fav == 0 ? 'Fav' : 'UnFav')) + ' Image';
			}
		} else {
			btn.className = 'hide';
		}
	});
})();
