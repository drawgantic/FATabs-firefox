const btn = document.createElement('div')
btn.id = 'fatabs-button'
btn.title = 'Download Image'

let src: string
let link: string
btn.addEventListener('click', (e) => {
	e.preventDefault()
	browser.runtime.sendMessage({ src: src, link: link })
})

document.addEventListener('mouseover', (e) => {
	const target = <HTMLImageElement>e.target
	if (target.tagName === 'IMG'
	 && target.offsetWidth >= 260 && target.offsetHeight >= 260) {
		let a = target.closest('a')
		link = a ? a.href : target.baseURI
		src = target.src
		target.before(btn)
	} else if (target !== btn) {
		btn.remove()
	}
})

let ready = () => document.dispatchEvent(new Event('mouseover'))
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', ready)
} else {
	ready()
}
