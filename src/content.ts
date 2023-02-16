let btn = document.createElement('div')
btn.id = 'fatabs-button'
btn.title = 'Download Image'
btn.style.visibility = 'hidden'

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
		btn.style.visibility = 'visible'
	} else if (target !== btn) {
		btn.style.visibility = 'hidden'
	}
})


let ready = () => document.body.appendChild(btn)
if (document.readyState !== 'loading') {
	ready()
} else {
	document.addEventListener('DOMContentLoaded', ready)
}
