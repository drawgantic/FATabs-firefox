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

			await new Promise(r => setTimeout(r, 1125));
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

browser.runtime.onMessage.addListener( function(request) {
	if (request.cancel) {
		cancelDownload();
	} else if (request.left) {
		downloadImages(request.left, 0);
	} else if (request.right) {
		downloadImages(0, request.right);
	} else {
		downloadImages();
	}
});
