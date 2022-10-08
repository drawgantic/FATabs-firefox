let bg = browser.extension.getBackgroundPage();
document.addEventListener("click", (e) => {
	if (e.target.id === "img-download-all") {
		bg.downloadImages();
	} else if (e.target.id === "img-download-10") {
		bg.downloadImages(10);
	} else if (e.target.id === "img-download-25") {
		bg.downloadImages(25);
	} else if (e.target.id === "img-download-50") {
		bg.downloadImages(50);
	}
	e.preventDefault();
});
