(() => {
	let a: HTMLAnchorElement | HTMLDivElement;
	let img: HTMLImageElement;
	let fav: number;

	function download(page: string, url: string): void {
		const view = page.slice(page.slice(0, -1).lastIndexOf('/') + 1, -1);
		const name = url.slice(url.lastIndexOf('/') + 1);
		const tag = name.indexOf('.');
		const ext = name.lastIndexOf('.');
		const filename = name.slice(tag + 1, ext) + '.' + view + name.slice(ext);
		void browser.runtime.sendMessage(
			{ type: 'btn', src: url, filename: filename });
	}

	const btn = document.createElement('img');
	btn.id = 'fatabs';
	btn.src = browser.runtime.getURL('images/download.svg');
	btn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		if (a instanceof HTMLAnchorElement) {
			const prev = fav;
			fav = +!fav;
			btn.title = (fav ? 'UnFav' : 'Fav') + ' Image';
			a.dataset.fav = fav.toString();
			const page = a.href;
			void fetch(page).then((response) => response.text()).then((text) => {
				if (prev < 0) { // download
					const m = text.match(/(d\.furaffinity\.net\/art\/.*?)"/);
					if (m) {
						download(page, `https://${m[1]}`);
					}
				} else { // fav/unfav toggle
					const m = text.match(new RegExp(`(/${prev ? 'un' : ''}fav/.*?)"`));
					if (m) {
						void fetch(`https://www.furaffinity.net${m[1]}`);
					}
				}
			});
		} else { // view page
			a.dataset.fav = "0";
			download(a.baseURI, img.src);
		}
	});

	document.addEventListener('mouseover', (e) => {
		const t = e.target;
		if (t === btn) {
			return;
		}
		let candidate: HTMLAnchorElement | HTMLDivElement | null = null;
		if (t instanceof HTMLImageElement) {
			if (
				t.parentElement instanceof HTMLAnchorElement &&
				t.parentElement.closest("section.gallery")
			) {
				candidate = t.parentElement;
			} else if (
				t.parentElement instanceof HTMLDivElement &&
				t.parentElement.classList.contains("submission-image")
			) {
				candidate = t.parentElement;
				img = t;
			}
		}
		if (candidate !== null) {
			btn.className = '';
			if (a !== candidate) {
				a = candidate;
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
