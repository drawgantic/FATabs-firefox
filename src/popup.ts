interface BackgroundPage extends Window {
	downloadImages(amount?: number): void;
	cancelDownload(): void;
}

let bg = <BackgroundPage>browser.extension.getBackgroundPage();
document.addEventListener("click", (e) => {
	if (e.target) {
		let target = <HTMLElement>e.target;
		if (target.id === "img-download-all") {
			bg.downloadImages();
		} else if (target.id === "img-download-10") {
			bg.downloadImages(10);
		} else if (target.id === "img-download-25") {
			bg.downloadImages(25);
		} else if (target.id === "img-download-50") {
			bg.downloadImages(50);
		} else if (target.id === "cancel-download") {
			bg.cancelDownload();
		}
		e.preventDefault();
	}
});
