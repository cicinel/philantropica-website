(() => {
  const word = document.querySelector('.site-footer .footer-word');
  if (!word || word.dataset.overscrollAnchor) return;

  // Keep the existing footer geometry as the anchor. Render the complete word
  // in a viewport layer so the footer cannot crop it during Safari rubber-band.
  const ink = document.createElement('div');
  ink.className = 'footer-word-overscroll';
  ink.textContent = word.textContent;
  ink.setAttribute('aria-hidden', 'true');
  Object.assign(ink.style, {
    position: 'fixed', top: '0', left: '0', margin: '0', padding: '0',
    border: '0', pointerEvents: 'none', whiteSpace: 'pre', zIndex: '0',
  });
  document.body.append(ink);
  let x = 0, y = 0, height = 0, frame = 0;

  function paint() {
    frame = 0;
    const top = y - window.scrollY;
    ink.style.transform = `translate3d(${x - window.scrollX}px,${top}px,0)`;
    ink.style.visibility = top < innerHeight && top + height > 0 ? 'visible' : 'hidden';
  }

  function measure() {
    const style = getComputedStyle(word);
    const rect = word.getBoundingClientRect();
    for (const name of [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontStretch',
      'fontKerning', 'fontFeatureSettings', 'fontVariationSettings',
      'fontOpticalSizing', 'letterSpacing', 'lineHeight', 'color',
      'textAlign', 'textTransform', 'textRendering', 'webkitFontSmoothing',
    ]) ink.style[name] = style[name];
    ink.style.width = `${rect.width}px`;
    x = rect.left + window.scrollX;
    y = rect.top + window.scrollY;
    height = rect.height;
    paint();
    word.style.visibility = 'hidden';
    word.dataset.overscrollAnchor = 'true';
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  measure();
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  new ResizeObserver(measure).observe(document.body);
  document.fonts?.ready.then(measure);
})();

