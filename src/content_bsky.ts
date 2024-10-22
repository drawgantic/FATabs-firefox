(() => {
	let img: HTMLImageElement | HTMLVideoElement;

	const btn = document.createElement('img');
	btn.id = 'fatabs';
	btn.title = 'Download Image';
	btn.src = browser.runtime.getURL('images/download.svg');

	btn.addEventListener('click', (e) => {
		if (btn.parentElement) {
			btn.parentElement.dataset.fav = '0';
		}
		if (img instanceof HTMLImageElement) {
			const arr = img.src.split('/');
			const did = arr[6];
			const cid_ext = arr[7].split('@');
			const cid = cid_ext[0];
			const ext = (cid_ext[1] == 'jpeg') ? 'jpg' : cid_ext[1];
			void browser.runtime.sendMessage(
				{ type: 'bsky', did: did, cid: cid, ext: ext });
		} else { // video
			const arr = img.poster.split('/');
			const did = arr[4];
			const cid = arr[5];
			void browser.runtime.sendMessage(
				{ type: 'bsky', did: did, cid: cid, ext: 'mp4' });
		}
		e.stopPropagation();
		e.preventDefault();
	});

	document.addEventListener('mouseover', (e) => {
		const t = e.target;
		if (t === btn) {
			return;
		}
		if (t instanceof HTMLImageElement
			&& (t.offsetWidth >= 190 || t.offsetHeight >= 190)) {
			btn.className = '';
			if (img !== t) {
				img = t;
				img.before(btn);
				btn.title = 'Download Image';
			}
		} else if (t instanceof HTMLButtonElement) {
			let par: ChildNode | null, sib: ChildNode | null, vid: ChildNode | null;
			if ((par = t.parentElement) && (sib = par.previousSibling)
				&& (vid = sib.firstChild) && vid instanceof HTMLVideoElement) {
				btn.className = '';
				if (img !== vid) {
					img = vid;
					sib.before(btn);
					btn.title = 'Download Video';
				}
			} else {
				btn.className = 'hide';
			}
		} else {
			btn.className = 'hide';
		}
	});
})();
