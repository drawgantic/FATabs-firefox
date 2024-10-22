interface reqBase {
	type: string;
};
interface reqBtn extends reqBase {
	src: string; filename: string;
};
interface reqBsky extends reqBase {
	did: string; cid: string; ext: string;
};
interface Json {
	handle: string;
};

let running = false;
let cancelled: boolean;
const headers: Record<string, string> = {
	'Content-Type': 'application/json'
};

function cancelDownload(): void {
	cancelled = true;
}

function downloadImages(index: number | undefined = undefined) {
	if (running) {
		return;
	}
	running = true;
	cancelled = false;

	browser.tabs.query({ url: "*://*.furaffinity.net/view/*" })
		.then(async (tabs) => {
			let first = 0, last = tabs.length - 1;
			if (index !== undefined) {
				if (index < 0) {
					index = -index;
					for (const tab of tabs) {
						if (tab.index >= index) {
							last = tabs.indexOf(tab) - 1;
							break;
						}
					}
				} else {
					for (const tab of tabs) {
						if (tab.index > index) {
							first = tabs.indexOf(tab);
							break;
						}
					}
				}
			}

			for (let i = first; i <= last; i++) {
				await new Promise((r) => setTimeout(r, 1125));
				if (cancelled) {
					break;
				}

				const tab = tabs[i];
				if (tab.id === undefined) {
					continue;
				}
				const id: number = tab.id;
				browser.scripting.executeScript({
					target: { tabId: id }, func: () => {
						const a = document.getElementsByClassName('download')[0].firstChild;
						return (a && a instanceof HTMLAnchorElement) ? a.href : undefined;
					}
				}).then((img) => {
					if (img.length > 0 && img[0].result) {
						void browser.downloads.download(
							{ url: img[0].result as string, saveAs: false });
						if (i === last) {
							browser.tabs.query({ windowType: 'normal' })
								.then((all) => {
									if (all.length > 1) {
										void browser.tabs.remove(id);
									}
								}, (err: unknown) => {
									console.error(`Count Error: ${err as string}`);
								});
						} else {
							void browser.tabs.remove(id);
						}
					}
				}, (err: unknown) => {
					console.error(`Script Error: ${err as string}`);
				});
			}
		}, (err: unknown) => {
			console.error(`Walk Error: ${err as string}`);
		});
	running = false;
}

browser.runtime.onMessage.addListener((request: reqBase) => {
	switch (request.type) {
		case 'btn': {
			const r = request as reqBtn;
			void browser.downloads.download(
				{ url: r.src, filename: r.filename, saveAs: false });
			break;
		}
		case 'left':
			void browser.tabs.query({ active: true, currentWindow: true })
				.then((tab) => {
					if (tab[0].index > 0) {
						downloadImages(-tab[0].index);
					}
				});
			break;
		case 'right':
			void browser.tabs.query({ active: true, currentWindow: true })
				.then((tab) => {
					downloadImages(tab[0].index);
				});
			break;
		case 'cancel':
			cancelDownload();
			break;
		case 'bsky': {
			const r = request as reqBsky;
			const getProfile = 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile'
				+ `?actor=${r.did}`;
			void fetch(getProfile, { headers: headers })
				.then((profile) => profile.json())
				.then((json) => {
					const j = json as Json;
					const getBlob = 'https://bsky.social/xrpc/com.atproto.sync.getBlob'
						+ `?did=${r.did}&cid=${r.cid}`;
					void fetch(getBlob, { headers: headers })
						.then((response) => {
							const handle = j.handle.split('.')[0].replace(/_/g, '-');
							const filename = handle + '_' + r.cid + '.' + r.ext;
							void browser.downloads.download(
								{ url: response.url, filename: filename, saveAs: false });
						});
				});
			break;
		}
		default:
			downloadImages();
	}
});
