let cancelled: boolean;

function cancelDownload(): void {
	cancelled = true;
}

function downloadImages(amount: number = 0): void {
	browser.tabs.query({ url: "*://*.furaffinity.net/view/*" })
	.then( async (tabs) => {
		if (amount <= 0 || amount > tabs.length) {
			amount = tabs.length;
		}
		cancelled = false;
		for (const tab of tabs.slice(0, amount)) {
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
