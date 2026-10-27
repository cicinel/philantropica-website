const host = document.querySelector('.fleet-scene');
const section = host.closest('.fleet');
const tabs = [...section.querySelectorAll('[data-peer-view]')];
const pauseButton = host.querySelector('.motion-toggle');
const poster = host.querySelector('.fleet-poster');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 760px)');
const query = new URLSearchParams(location.search);
const still = query.has('still') || query.has('fallback');
const descriptions = {
  "drones": {
    "text": [
      "Onboard models are constrained by each drone’s processing, memory and power limits. Seamless splits model execution across the swarm."
    ],
    "device": "drones"
  },
  "humanoids": {
    "text": [
      "Onboard models are constrained by each robot’s processors, memory and thermal limits. Seamless distributes their execution across connected robots."
    ],
    "device": "humanoids"
  },
  "iot": {
    "text": [
      "On smart glasses, rings and AI pins, compute is constrained by space, power and heat. Seamless offloads inference to connected phones and computers."
    ],
    "device": "devices"
  }
};
const titleWord = section.querySelector('.fleet-title-device');
let titleAnimation;
function updateDeviceTitle(device) {
  const changed = titleWord.textContent !== device;
  titleWord.textContent = device;
  if (!changed) return;
  titleAnimation?.cancel();
  if (!reduced.matches) {
    titleAnimation = titleWord.animate([
      { opacity: 0, transform: 'translateY(.12em)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 260, easing: 'cubic-bezier(.2,.65,.3,1)' });
  }
}
reduced.addEventListener('change', () => { if (reduced.matches) titleAnimation?.cancel(); });
const clips = new Map();
let family = descriptions[query.get('network')] ? query.get('network') : 'drones';
let active = null;
let near = false;
let visible = false;
let paused = false;
let playAttempt = 0;
let rate = 60;
let assessed = false;
let assessment = null;
const errors = [];
const asset = name => new URL('video/' + name + '?v=' + (name.startsWith('humanoids-') ? "robot-color-20261026" : 'seamless-loop-20261026'), import.meta.url).href;
function updatePoster() {
  const suffix = family === 'humanoids' && (reduced.matches || still) ? '-still' : '';
  poster.querySelector('source').srcset = asset(family + '-mobile' + suffix + '.jpg');
  const image = poster.querySelector('img');
  image.src = asset(family + '-desktop' + suffix + '.jpg');
  image.alt = (family === 'humanoids' ? 'Humanoid robots' : family === 'iot' ? 'Connected devices' : 'Drones') + ' sharing compute';
}
function key() { return family + '-' + (mobile.matches ? 'mobile' : 'desktop') + (!mobile.matches && rate === 90 ? '-90' : ''); }
async function assessFrameRate() {
  if (assessment) return assessment;
  assessment = (async () => {
    try {
      if (mobile.matches || navigator.connection?.saveData || !navigator.mediaCapabilities) return;
      const intervals = await new Promise(resolve => {
        const times = [];
        let previous;
        const timeout = setTimeout(() => resolve([]), 800);
        function frame(now) {
          if (previous !== undefined) times.push(now - previous);
          previous = now;
          if (times.length >= 16) { clearTimeout(timeout); resolve(times); }
          else requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
      intervals.sort((a, b) => a - b);
      const refresh = 1000 / intervals[Math.floor(intervals.length / 2)];
      if (!Number.isFinite(refresh) || refresh < 85) return;
      const capability = await navigator.mediaCapabilities.decodingInfo({
        type: 'file', video: { contentType: 'video/mp4; codecs="avc1.640034"', width: 2880, height: 1340, bitrate: 7000000, framerate: 90 },
      });
      if (capability.supported && capability.smooth && capability.powerEfficient) rate = 90;
    } catch { /* Keep the compatible recording when capability checks are unavailable. */ }
    finally { assessed = true; ensureClip(); }
  })();
  return assessment;
}
function syncButton() {
  pauseButton.hidden = reduced.matches || still;
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.setAttribute('aria-label', paused ? 'Play shared compute animation' : 'Pause shared compute animation');
}
function syncPlayback() {
  syncButton();
  if (!active) return;
  const shouldPlay = visible && !document.hidden && !paused && !reduced.matches && !still;
  const attempt = ++playAttempt;
  for (const clip of clips.values()) if (clip !== active || !shouldPlay) clip.pause();
  if (shouldPlay && active.paused) {
    const playing = active;
    playing.play().catch(() => {
      if (attempt === playAttempt && playing === active && visible && !document.hidden && !reduced.matches && !still) {
        paused = true;
        syncButton();
      }
    });
  }
}
function showFrame(clip) {
  if (clip !== active || reduced.matches || still) return;
  host.classList.add('video-ready');
  section.removeAttribute('aria-busy');
}
function ensureClip() {
  if (!near || reduced.matches || still || !assessed) return;
  const name = key();
  let clip = clips.get(name);
  if (!clip) {
    clip = document.createElement('video');
    clip.className = 'fleet-video';
    clip.muted = true;
    clip.defaultMuted = true;
    clip.loop = true;
    clip.playsInline = true;
    clip.preload = 'auto';
    clip.disablePictureInPicture = true;
    clip.setAttribute('aria-hidden', 'true');
    clip.setAttribute('tabindex', '-1');
    clip.dataset.clip = name;
    clip.poster = asset(name.replace('-90', '') + '.jpg');
    clip.addEventListener('loadeddata', () => { showFrame(clip); syncPlayback(); });
    clip.addEventListener('playing', () => showFrame(clip));
    clip.addEventListener('error', () => {
      errors.push({ clip: name, code: clip.error?.code });
      if (clip === active) { host.classList.remove('video-ready'); section.removeAttribute('aria-busy'); }
    });
    clips.set(name, clip);
    clip.src = asset(name + '.mp4');
  }
  if (active !== clip) {
    if (active) { active.pause(); active.remove(); }
    active = clip;
    host.insertBefore(clip, pauseButton);
  }
  if (clip.readyState >= 2) showFrame(clip);
  syncPlayback();
}
function select(next, updateUrl = true) {
  if (!descriptions[next]) return;
  family = next;
  if (active) active.pause();
  host.classList.remove('video-ready');
  const content = descriptions[family];
  updateDeviceTitle(content.device);
  section.querySelectorAll('[data-peer-copy]').forEach(panel => {
    const selected = panel.dataset.peerCopy === family;
    panel.classList.toggle('is-active', selected);
    panel.setAttribute('aria-hidden', String(!selected));
    panel.inert = !selected;
  });
  tabs.forEach(tab => {
    const selected = tab.dataset.peerView === family;
    tab.id = 'peer-tab-' + tab.dataset.peerView;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  host.dataset.peerFamily = family;
  host.dataset.peerSetting = family === 'iot' ? 'desk' : '';
  host.setAttribute('aria-labelledby', 'peer-tab-' + family);
  host.setAttribute('aria-label', content.text[0] + ' Connected devices process work and return results, without a central compute unit.');
  updatePoster();
  if (updateUrl) { const url = new URL(location.href); url.searchParams.set('network', family); history.replaceState(null, '', url); }
  if (near && !reduced.matches && !still) section.setAttribute('aria-busy', 'true');
  ensureClip();
  syncButton();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => select(tab.dataset.peerView));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus({preventScroll:true});
    select(tabs[next].dataset.peerView);
  });
});
pauseButton.addEventListener('click', () => { paused = !paused; syncPlayback(); });
new IntersectionObserver(([entry]) => { near = entry.isIntersecting; if (near) { assessFrameRate(); ensureClip(); } }, { rootMargin: '350px' }).observe(host);
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncPlayback(); }).observe(host);
document.addEventListener('visibilitychange', syncPlayback);
mobile.addEventListener('change', () => select(family, false));
reduced.addEventListener('change', () => { updatePoster(); if (reduced.matches) host.classList.remove('video-ready'); else ensureClip(); syncPlayback(); });
window.addEventListener('pagehide', () => { for (const clip of clips.values()) clip.pause(); });
window.addEventListener('pageshow', syncPlayback);
window.SeamlessVideo = {
  select,
  errors,
  get state() { return { family, clip: active?.dataset.clip ?? null, frameRate: !mobile.matches ? rate : 60, assessed, paused, visible, near, reduced: reduced.matches, loaded: [...clips.keys()], playing: !!active && !active.paused, time: active?.currentTime ?? 0 }; },
};
select(family, false);
