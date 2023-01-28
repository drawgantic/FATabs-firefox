interface BackgroundPage extends Window {
	downloadImages(left?: number, right?: number): void;
	cancelDownload(): void;
}

let bg = <BackgroundPage>browser.extension.getBackgroundPage();
document.addEventListener("click", (e) => {
	if (e.target) {
		let target = <HTMLElement>e.target;
		switch (target.id) {
		case "img-download-left":
			browser.tabs.query({ active: true, currentWindow: true })
			.then( (active) => {
				bg.downloadImages(active[0].index, 0);
			});
			break;
		case "img-download-right":
			browser.tabs.query({ active: true, currentWindow: true })
			.then( (active) => {
				bg.downloadImages(0, active[0].index);
			});
			break;
		case "cancel-download":
			bg.cancelDownload();
			break;
		default:
			bg.downloadImages();
		}
		e.preventDefault();
	}
});
