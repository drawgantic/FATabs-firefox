interface BskyProfile {
	handle: string;
}

(() => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	function getInfo(el: HTMLImageElement | HTMLVideoElement): RegExpMatchArray | null {
		const r_post = /\/profile\/([^\.]+).*\/post\/(.+)/;
		const m = el.baseURI.match(r_post);
		if (m) {
			return m;
		} else {
			let top = el.parentElement;
			for (let i = 0; i < 13; i++) {
				// @ts-ignore
				top = top.parentElement;
			}
			if (!top) {
				return null;
			}
			for (const a of top.getElementsByTagName("a")) {
				const n = a.href.match(r_post);
				if (n) {
					return n;
				}
			}
		}
		return null;
	}

	function getIndex(elem: HTMLImageElement | HTMLVideoElement): number {
		// @ts-ignore
		let top = elem.parentElement.parentElement.parentElement
			.parentElement.parentElement.parentElement.parentElement;
		const elems = !top ? [] : Array.from(top.querySelectorAll(
			'img:not([id="fatabs"]), video'));
		for (let i = 0; i < elems.length; i++) {
			if (elems[i] === elem) {
				return i + 1;
			}
		}
		return 0;
	}

	async function doRequest(
		did: string,
		cid: string,
		info: RegExpMatchArray | null,
		idx: number,
	): Promise<void> {
		const get = 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=';
		const handle = info ? info[1] : await fetch(get + did, { headers: headers })
			.then((profile) => profile.json())
			.then((json) => (json as BskyProfile).handle.split('.')[0]);
		const getBlob = 'https://bsky.social/xrpc/com.atproto.sync.getBlob'
			+ `?did=${did}&cid=${cid}`;
		void fetch(getBlob, { headers: headers })
			.then((response) => {
				const filename = `${handle}_${info ? info[2] : cid}.${idx}.0`;
				void browser.runtime.sendMessage(
					{ type: 'btn', src: response.url, filename: filename });
			});
	}

	let img: HTMLImageElement | HTMLVideoElement;

	const btn = document.createElement('img');
	btn.id = 'fatabs';
	btn.title = 'Download Image';
	btn.src = browser.runtime.getURL('images/download.svg');

	btn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		if (btn.parentElement) {
			btn.parentElement.dataset.fav = '0';
		}
		const info = getInfo(img);
		const idx = getIndex(img);

		if (img instanceof HTMLImageElement) {
			const arr = img.src.split('/');
			doRequest(arr[6], arr[7], info, idx);
			return;
		}
		// video
		const vid = img;
		if (vid.poster != "") {
			const arr = vid.poster.split('/');
			doRequest(arr[4], arr[5], info, idx);
			return;
		}
		const sources = Array.from(vid.getElementsByTagName("source"))
			.filter((s: HTMLSourceElement) => s.type == "video/mp4");
		if (sources.length > 0) {
			const src = sources[0].src;
			const filename = (info ?
				`${info[1]}_${info[2]}` : src.substring(src.lastIndexOf('/') + 1)
			) + `.${idx}.0`;
			void browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename });
		}
	});

	let prev_target: EventTarget | null = null;

	document.addEventListener('mouseover', (e) => {
		const t = e.target;
		if (t === btn || t === prev_target) {
			return;
		}
		prev_target = t;
		const is_img = t instanceof HTMLImageElement;
		let candidate: HTMLImageElement | HTMLVideoElement | null = null;
		let sibling: ChildNode = t as ChildNode;

		if (is_img && (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			candidate = sibling = t;
		} else if (t instanceof HTMLButtonElement) {
			check: {
				{
					const par = t.parentElement && t.parentElement.previousSibling;
					const sib = par && (
						par instanceof HTMLButtonElement ? par.previousSibling : par
					) || t.previousSibling;
					const vid = sib && sib.firstChild;
					if (vid && vid instanceof HTMLVideoElement) {
						candidate = vid;
						sibling = sib;
						break check;
					}
				} {
					const vid = t.nextSibling && t.nextSibling.nextSibling;
					if (vid && vid instanceof HTMLVideoElement) {
						candidate = vid;
					}
				}
			}
		}
		if (candidate !== null) {
			btn.className = '';
			if (img !== candidate) {
				img = candidate;
				sibling.before(btn);
				btn.title = 'Download Video';
			}
		} else {
			btn.className = 'hide';
		}
	});
})();
