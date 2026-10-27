import FOOTER_OVERSCROLL from './footer-overscroll.js';

const ROOT = '/assets/product-demo/';
const FOOTER_SCRIPT = ROOT + 'footer-overscroll-20261026.js';
const CLEAN = '/assets/laptop-cleanup/';
const LAPTOP_VERSION = 'laptop-cleanup-20261026';
const VERSION = '6d7728ea3ace';
const STYLE = `<style id="seamless-product-demo-style">.hero-media:has(.product-video[data-product-demo]){aspect-ratio:4/3;background:#ededed;border-radius:12px;overflow:hidden;margin-bottom:0}.product-video[data-product-demo]{object-fit:contain;background:#ededed;border-radius:inherit}.product-video[data-product-demo]::-webkit-media-controls{display:none!important}.product-demo-wrap{min-width:0}.product-demo-wrap .hero-media{width:100%}@media(max-width:760px){.product-demo-wrap{margin-top:40px}.product-demo-wrap .hero-media{margin-top:0}}</style>`;

const COMPUTE_STYLE = `<style id="seamless-compute-compositing">/* Composite the illustration's pale background into the page surface. */
.compute-stage[data-five-computers]{isolation:isolate;background:var(--paper)}
.compute-stage[data-five-computers] .five-compute-video,
.compute-stage[data-five-computers] .stage-poster{filter:brightness(1.02);mix-blend-mode:darken}
</style>`;

const ABOUT_PARAGRAPHS = [
  'We started Seamless because our laptops weren’t powerful enough to run the games we wanted to play. We realized how much unused compute there is out there and how optimizing it could be an enabler for gamers, artists, engineers, AI researchers and others.',
  'We’re building a network to share that compute across people and devices, helping consumers and enterprises speed up processes and run apps that wouldn’t otherwise fit on their hardware. We believe the same network will eventually support wearable IoT devices and humanoid robots, where size and power limit onboard compute.'
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === FOOTER_SCRIPT) return new Response(request.method === 'HEAD' ? null : FOOTER_OVERSCROLL, {headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'public, max-age=86400'}});
    if (url.pathname === ROOT + 'details.html') return new Response('Not found', {status:404,headers:{'content-type':'text/plain','cache-control':'no-store'}});
    if (['/assets/laptop.glb','/assets/counterpart.js'].includes(url.pathname)) {
      const native = new URL(request.url); native.pathname = CLEAN + url.pathname.split('/').pop();
      return env.ASSETS.fetch(new Request(native, request));
    }
    if (url.pathname.startsWith(ROOT) || url.pathname.startsWith(CLEAN)) {
      const asset = await env.ASSETS.fetch(request);
      if (!url.pathname.endsWith('.mp4') || !asset.ok) return asset;
      const headers = new Headers(asset.headers);
      headers.set('accept-ranges','bytes');
      const range = request.headers.get('range');
      if (!range || asset.status === 206 || request.method !== 'GET') return new Response(asset.body,{status:asset.status,headers});
      const bytes = await asset.arrayBuffer();
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      let start = match?.[1] ? Number(match[1]) : Math.max(0,bytes.byteLength-Number(match?.[2]));
      let end = match?.[1] ? (match[2] ? Math.min(Number(match[2]),bytes.byteLength-1) : bytes.byteLength-1) : bytes.byteLength-1;
      if (!match || (!match[1] && !match[2]) || start > end || start >= bytes.byteLength) {
        headers.set('content-range',`bytes */${bytes.byteLength}`);headers.delete('content-length');
        return new Response(null,{status:416,headers});
      }
      headers.set('content-range',`bytes ${start}-${end}/${bytes.byteLength}`);
      headers.set('content-length',String(end-start+1));
      return new Response(bytes.slice(start,end+1),{status:206,headers});
    }
    const response = await fetch(request);
    const isHome = ['/','/index.html','/seamless','/seamless/'].includes(url.pathname);
    const isSitePage = isHome || /^\/(about|essays|mission)(\/|$)/.test(url.pathname);
    if (!['GET','HEAD'].includes(request.method) || !isSitePage || !response.ok || !response.headers.get('content-type')?.includes('text/html')) return response;
    let pageResponse = response;
    if (/^\/about(?:\/(?:index\.html)?)?$/.test(url.pathname)) {
      let paragraph = 0;
      pageResponse = new HTMLRewriter().on('.about-copy > p:not(.founder-intro)', {element(el) {
        if (paragraph < ABOUT_PARAGRAPHS.length) el.setInnerContent(ABOUT_PARAGRAPHS[paragraph++]);
      }}).transform(response);
    }
    const footer = new HTMLRewriter().on('.site-footer .footer-word', {element(el) {
      el.after(`<script src="${FOOTER_SCRIPT}" defer></script>`, {html:true});
    }}).transform(pageResponse);
    if (!isHome) {
      const headers = new Headers(footer.headers);
      headers.delete('etag');headers.delete('content-length');
      headers.set('cache-control','no-cache');
      headers.set('x-seamless-footer','overscroll-20261026');
      return new Response(footer.body,{status:footer.status,statusText:footer.statusText,headers});
    }
    const rewriter = new HTMLRewriter()
      .on('script[src^="/assets/support-source-video.js"]', {element(el) { el.setAttribute('src', CLEAN+'support-source-video.js?v='+LAPTOP_VERSION); }})
      .on('[data-five-computers] .stage-poster source', {element(el) { const src=el.getAttribute('srcset'); if(src?.startsWith('/assets/video/')) el.setAttribute('srcset',src.replace('/assets/video/',CLEAN+'video/')); }})
      .on('[data-five-computers] .stage-poster img', {element(el) { const src=el.getAttribute('src'); if(src?.startsWith('/assets/video/')) el.setAttribute('src',src.replace('/assets/video/',CLEAN+'video/')); }})
      .on('head', {element(el) {el.append(STYLE+COMPUTE_STYLE,{html:true});}})
      .on('video.product-video', {element(el) {
        if (el.getAttribute('src')) return;
        el.setAttribute('data-product-demo', VERSION);
        el.setAttribute('src', `${ROOT}seamless-${VERSION}.mp4`);
        el.setAttribute('poster',`${ROOT}desktop-${VERSION}.jpg`);
        el.setAttribute('preload','metadata');
        el.setAttribute('muted','');
        el.setAttribute('playsinline','');
        el.removeAttribute('controls');
        el.setAttribute('autoplay','');
        el.setAttribute('disablepictureinpicture','');
        el.setAttribute('disableremoteplayback','');
        el.setAttribute('loop','');
        el.setAttribute('aria-label','Seamless widget demonstration with sample computers, followed by a Blender render comparison at 4 times speed');
        el.setInnerContent(`Your browser does not support this video. <a href="${ROOT}seamless-${VERSION}.mp4">Watch the Seamless demo</a>.`,{html:true});
      }})
      .on('body', {element(el) {
        el.append(`<script src="${ROOT}playback-${VERSION}.js" defer></script>`,{html:true});
      }});
    const output = rewriter.transform(footer);
    const headers = new Headers(output.headers);
    headers.delete('etag');headers.delete('content-length');
    headers.set('cache-control','no-cache');
    headers.set('x-seamless-product-demo',VERSION);
    headers.set('x-seamless-laptop',LAPTOP_VERSION);
    headers.set('x-seamless-footer','overscroll-20261026');
    return new Response(output.body,{status:output.status,statusText:output.statusText,headers});
  }
};


