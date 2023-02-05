// let browser = chrome;

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
		for (const tab of tabs.slice(start, end)) {
			await new Promise(r => setTimeout(r, 1125));
			if (cancelled) {
				break;
			}
			if (tab.id === undefined) {
				continue;
			}
			let id = tab.id;
			try {
				browser.scripting.executeScript({ target: {tabId: id}, func: () => {
					return (<HTMLAnchorElement>document
						.getElementsByClassName('download')[0].firstChild).href;
				}}).then( (img) => {
					if (img.length > 0) {
						browser.downloads.download({ url: img[0].result, saveAs: false });
						browser.tabs.remove(id);
					}
				});
			} catch (err) {
				console.error(`failed to execute script: ${err}`);
			}
		}
	}, (reason) => {
		console.error(`Error: ${reason}`);
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
