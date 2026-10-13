(() => {
	let img: HTMLImageElement;
	let a: HTMLAnchorElement;

	const btn = document.createElement('img');
	btn.id = 'fatabs';
	btn.title = 'Download Image';
	btn.src = browser.runtime.getURL('images/download.svg');
	btn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		const url = img.src;
		a.dataset.fav = '0';
		void fetch(a.href).then((response) => response.text()).then((text) => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(text, 'text/html');
			const m: HTMLImageElement | null
				= doc.querySelector("div[typeof='ImageObject'] img");
			if (m) {
				const src = m.src;
				let s: number | undefined = src.indexOf('?');
				let u: number | undefined;
				if (s == -1) {
					s = undefined; u = undefined;
				} else {
					u = url.indexOf('?');
				}
				const name =
					url.slice(url.lastIndexOf('/', u) + 1, url.lastIndexOf('-', u)) +
					src.slice(src.lastIndexOf('.', s), s);

				const sep = name.lastIndexOf('_');
				const by = name.lastIndexOf('_', sep - 1);
				const filename = name.slice(by + 1, sep) + '_' + name.slice(0, by - 3)
					+ '.' + name.slice(sep + 1);
				void browser.runtime.sendMessage(
					{ type: 'btn', src: src, filename: filename });
			}
		});
	});

	document.addEventListener('mouseover', (e) => {
		const t = e.target;
		if (t === btn) {
			return;
		}
		if (t instanceof HTMLAnchorElement) {
			const next = t.nextElementSibling;
			const prev = t.previousElementSibling;
			const neph = (next && next.firstChild instanceof HTMLImageElement ?
				next.firstChild : (prev && prev.firstChild instanceof HTMLImageElement ?
					prev.firstChild : null));
			if (neph && (neph.offsetWidth >= 190 || neph.offsetHeight >= 190)) {
				btn.className = '';
				if (img !== neph) {
					(a = t).prepend(btn);
					img = neph;
				}
			} else {
				btn.className = 'hide';
			}
		} else if (t instanceof HTMLImageElement
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
