interface BskyProfile {
	handle: string;
}

(() => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	function doRequest(did: string, cid: string, ext: string): void {
		const getProfile = 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile'
			+ `?actor=${did}`;
		void fetch(getProfile, { headers: headers })
			.then((profile) => profile.json())
			.then((json) => {
				const j = json as BskyProfile;
				const getBlob = 'https://bsky.social/xrpc/com.atproto.sync.getBlob'
					+ `?did=${did}&cid=${cid}`;
				void fetch(getBlob, { headers: headers })
					.then((response) => {
						const handle = j.handle.split('.')[0].replace(/_/g, '-');
						const filename = handle + '_' + cid + '.' + ext;
						void browser.runtime.sendMessage(
							{ type: 'btn', src: response.url, filename: filename });
					});
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
		if (img instanceof HTMLImageElement) {
			const arr = img.src.split('/');
			const cid = arr[7].split('@');
			doRequest(arr[6], cid[0], (cid[1] == 'jpeg') ? 'jpg' : cid[1]);
			return;
		}
		// video
		const vid = img;
		if (vid.poster != "") {
			const arr = vid.poster.split('/');
			doRequest(arr[4], arr[5], 'mp4');
			return;
		}
		const sources = Array.from(vid.getElementsByTagName("source"))
			.filter((s: HTMLSourceElement) => s.type == "video/mp4");
		if (sources.length > 0) {
			const src = sources[0].src;
			const filename = src.substring(src.lastIndexOf('/') + 1);
			void browser.runtime.sendMessage({ type: 'btn', src: src, filename: filename });
		}
	});

	document.addEventListener('mouseover', (e) => {
		const t = e.target;
		if (t === btn) {
			return;
		}
		let candidate: HTMLImageElement | HTMLVideoElement | null = null;
		let sibling: ChildNode = t as ChildNode;
		if (t instanceof HTMLImageElement
			&& (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			candidate = sibling = t;
		} else if (t instanceof HTMLButtonElement) {
			check: {
				{
					const par = t.parentElement;
					const psib = par && par.previousSibling;
					const sib = psib && (
						psib instanceof HTMLButtonElement ? psib.previousSibling : psib
					) || t.previousSibling;
					const vid = sib && sib.firstChild;
					if (vid && vid instanceof HTMLVideoElement) {
						candidate = vid;
						sibling = sib;
						break check;
					}
				} {
					const sib = t.nextSibling;
					const vid = sib && sib.nextSibling;
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
