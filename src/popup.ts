const manifest = browser.runtime.getManifest();
const header = document.getElementsByClassName('ext-version');
if (header.length > 0) {
	const text = document.createTextNode(manifest.version);
	header[0].appendChild(text);
}

document.addEventListener('click', (e) => {
	if (e.target) {
		const target = <HTMLElement>e.target;
		switch (target.id) {
		case 'img-download-left':
			browser.tabs.query({ active: true, currentWindow: true })
			.then( (active) => {
				browser.runtime.sendMessage({left: active[0].index});
			});
			break;
		case 'img-download-right':
			browser.tabs.query({ active: true, currentWindow: true })
			.then( (active) => {
				browser.runtime.sendMessage({right: active[0].index});
			});
			break;
		case 'cancel-download':
			browser.runtime.sendMessage({cancel: true});
			break;
		default:
			browser.runtime.sendMessage({});
		}
		e.preventDefault();
	}
});
