function downloadImages(amount = 0) {
	browser.tabs.query({ url: "*://*.furaffinity.net/view/*" })
	.then(async tabs => {
		if (amount <= 0 || amount > tabs.length) {
			amount = tabs.length;
		}
		for (const tab of tabs.slice(0, amount)) {
			await new Promise(r => setTimeout(r, 1500));
			browser.tabs.executeScript(tab.id, {
				code: "document.getElementsByClassName('download')[0].firstChild.href;"
			}).then(img => {
				if (img.length > 0) {
					browser.downloads.download({
						url: img[0],
						saveAs: false
					});
					browser.tabs.remove(tab.id);
				}
			});
		}
	});
}
