interface RequestBase {
	type: string;
}

interface RequestButton extends RequestBase {
	src: string; filename: string;
}

let running = false;
let cancelled: boolean;

function cancelDownload(): void {
	cancelled = true;
}

function downloadImages(index: number | undefined = undefined): void {
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
						void browser.downloads.download({ url: img[0].result, saveAs: false });
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

browser.runtime.onMessage.addListener((request: RequestBase) => {
	switch (request.type) {
		case 'btn': {
			const r = request as RequestButton;
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
		default:
			downloadImages();
	}
});
