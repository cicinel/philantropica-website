// A base URL serves shared assets; fragment links stay within this full-page variant.
document.addEventListener('click',event=>{
 const link=event.target.closest('a');if(!link||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const href=link.getAttribute('href');if(href?.startsWith('#')&&document.querySelector(href)){event.preventDefault();location.hash=href}
});
