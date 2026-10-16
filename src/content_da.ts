(() => {
	type NumOr = number | undefined;
	function findLast(str: string, search: string, pos?: NumOr): NumOr {
		const idx = str.lastIndexOf(search, pos);
		return idx >= 0 ? idx : undefined;
	}

	let img: HTMLImageElement;
	let a: HTMLElement;
	const trim = /^_+|_+$/g;

	const btn = document.createElement('img');
	btn.id = 'fatabs';
	btn.title = 'Download Image';
	btn.src = browser.runtime.getURL('images/download.svg');
	btn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		const src = img.src;
		a.dataset.fav = '0';
		if (a instanceof HTMLAnchorElement) {
			void fetch(a.href).then((response) => response.text()).then((text) => {
				const parser = new DOMParser();
				const doc = parser.parseFromString(text, 'text/html');
				const m: HTMLImageElement | null
					= doc.querySelector("div[typeof='ImageObject'] img");
				if (m) {
					const end = findLast(src, '-', findLast(src, '?'));
					const name = src.slice(src.lastIndexOf('/', end) + 1, end);

					const tag = name.lastIndexOf('_');
					const by = name.lastIndexOf('_by_', tag - 1);
					const artist = name.slice(by + 4, tag).replaceAll('_', '-');
					const title = name.slice(0, by).replace(trim, '');
					const filename = `${artist}_${title}.${name.slice(tag + 1)}.jpg`;
					void browser.runtime.sendMessage(
						{ type: 'btn', src: m.src, filename: filename });
				}
			});
		} else { // view page
			const artist = window.location.pathname.split('/')[1];
			const by_artist = "_by_" + artist.replaceAll('-', '_');
			let by: number;
			let str: string;
			if ((by = src.indexOf(by_artist)) >= 0) {
				str = src;
			} else if ((by = img.srcset.indexOf(by_artist)) >= 0) {
				str = img.srcset;
			} else {
				const end = findLast(src, '-', findLast(src, '?'));
				const title = src.slice(src.lastIndexOf('/', end) + 1, end);
				void browser.runtime.sendMessage(
					{ type: 'btn', src: img.src, filename: `${artist}_${title}` });
				return;
			}
			const title = str.slice(str.lastIndexOf('/', by) + 1, by).replace(trim, '');
			by += by_artist.length;
			const tag = str.slice(by + 1, str.indexOf('-', by));
			void browser.runtime.sendMessage(
				{ type: 'btn', src: img.src, filename: `${artist}_${title}.${tag}.jpg` });
		}
	});

	document.addEventListener('mouseover', (e) => {
		const t = e.target;
		if (t === btn) {
			return;
		}
		let div, elem;
		if (
			t instanceof HTMLImageElement
			&& (div = t.parentElement) instanceof HTMLDivElement
			&& (elem = div.parentElement) !== null
			&& (div.getAttribute("typeof") === "ImageObject"
				|| elem.tagName.toLowerCase() === "figure")
		) {
			btn.className = '';
			if (img !== t) {
				img = t;
				a = elem;
				a.prepend(btn);
			}
		} else {
			btn.className = 'hide';
		}
	});
})();
