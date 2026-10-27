(() => {
  const video = document.querySelector('video[data-product-demo]');
  if (!video) return;
  const figure = video.closest('figure');
  const wrap = document.createElement('div');
  wrap.className = 'product-demo-wrap';
  figure.before(wrap);wrap.append(figure);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  let userPaused = motion.matches;
  let automaticPause = false;
  video.muted = true;
  function play() {
    if (!userPaused && visible && !document.hidden && !motion.matches) video.play().catch(() => {});
  }
  function pause() {
    if (!video.paused) {automaticPause=true;video.pause();}
  }
  video.addEventListener('pause', () => {if(automaticPause) automaticPause=false;else userPaused=true;});
  video.addEventListener('play', () => {userPaused=false;});
  motion.addEventListener('change', () => {userPaused=motion.matches;if(motion.matches)pause();else play();});
  document.addEventListener('visibilitychange', () => {if(document.hidden)pause();else play();});
  new IntersectionObserver(entries => {visible=entries[0].isIntersecting;if(visible)play();else pause();},{threshold:0.1}).observe(video);
  if (motion.matches) pause();
  play();
})();
