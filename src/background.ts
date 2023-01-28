let cancelled: boolean;

function cancelDownload(): void {
	cancelled = true;
}

function downloadImages(left: number = 0, right: number = 0): void {
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
			let id: number = tab.id;
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
	});
}
