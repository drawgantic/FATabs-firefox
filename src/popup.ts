// let browser = chrome;

let manifest = browser.runtime.getManifest();
let header = document.getElementsByClassName("ext-version");
if (header.length > 0) {
	let text = document.createTextNode(manifest.version);
	header[0].appendChild(text);
}

document.addEventListener("click", (e) => {
	if (e.target) {
		let target = <HTMLElement>e.target;
		switch (target.id) {
		case "img-download-left":
			browser.tabs.query({ active: true, currentWindow: true })
			.then( (active) => {
				browser.runtime.sendMessage({left: active[0].index});
			});
			break;
		case "img-download-right":
			browser.tabs.query({ active: true, currentWindow: true })
			.then( (active) => {
				browser.runtime.sendMessage({right: active[0].index});
			});
			break;
		case "cancel-download":
			browser.runtime.sendMessage({cancel: true});
			break;
		default:
			browser.runtime.sendMessage({});
		}
		e.preventDefault();
	}
});
