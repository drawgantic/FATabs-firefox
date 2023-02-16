let running = false;
let cancelled: boolean;

function cancelDownload(): void {
	cancelled = true;
}

function downloadImages(left = 0, right = 0): void {
	if (running) {
		return;
	}
	running = true;

	browser.tabs.query({ url: "*://*.furaffinity.net/view/*" })
	.then( async (tabs) => {
		let start = 0, end = tabs.length;
		if (left) {
			for (const tab of tabs) {
				if (left <= tab.index) {
					end = tabs.indexOf(tab);
					break;
				}
			}
		} else if (right) {
			for (const tab of tabs) {
				if (right < tab.index) {
					start = tabs.indexOf(tab);
					break;
				}
			}
		}

		cancelled = false;
		let id: number | undefined = undefined;
		for (const tab of tabs.slice(start, end)) {
			if (id !== undefined) {
				browser.tabs.remove(id);
			}

			await new Promise( (r) => setTimeout(r, 1125) );
			id = tab.id;
			if (id === undefined) {
				continue;
			}
			if (cancelled) {
				break;
			}

			try {
				browser.scripting.executeScript({ target: {tabId: id}, func: () => {
					return (<HTMLAnchorElement>document
						.getElementsByClassName('download')[0].firstChild).href;
				}}).then( (img) => {
					if (img.length > 0) {
						browser.downloads.download({ url: img[0].result, saveAs: false });
					}
				});
			} catch (err) {
				console.error(`failed to execute script: ${err}`);
			}
		}

		browser.tabs.query({ windowType: 'normal' })
		.then( (all) => {
			if (all.length > 1 && id !== undefined) {
				browser.tabs.remove(id);
			}
		}, (err) => {
			console.error(`Count Error: ${err}`);
		});
	}, (err) => {
		console.error(`Walk Error: ${err}`);
	});
	running = false;
}

function downloadImage(src: string, link: string | undefined) {
	const end = src.indexOf('?');
	let img = src.substring(0, end > 0 ? end : undefined);
	let fname: string | undefined = undefined;

	const twitter = link?.match(/.*?:\/\/twitter\.com\/([a-zA-Z0-9_]+)/);
	if (twitter) {
		let ext = new URLSearchParams(src.substring(end)).get('format');
		ext = ext ? ext : 'jpg';
		fname = twitter[1].replace(/_/g, '-') + '_'
		      + img.substring(img.lastIndexOf('/') + 1) + '.' + ext;
		img += '?format=' + ext + '&name=orig';
	}

	browser.downloads.download({ url: img, filename: fname, saveAs: false });
}

browser.contextMenus.create({
	id: 'fatabs.menu.download',
	title: 'Download image',
	contexts: ['image']
});

browser.runtime.onMessage.addListener( (request) => {
	if (request.cancel) {
		cancelDownload();
	} else if (request.left) {
		downloadImages(request.left, 0);
	} else if (request.right) {
		downloadImages(0, request.right);
	} else if (request.src) {
		downloadImage(request.src, request.link);
	} else {
		downloadImages();
	}
});

browser.contextMenus.onClicked.addListener( (info, tab) => {
	if (info.menuItemId === 'fatabs.menu.download' && info.srcUrl) {
		downloadImage(info.srcUrl, info.linkUrl);
	}
});
