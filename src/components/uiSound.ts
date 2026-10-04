import { createSoundEngine } from './soundEngine';

export const uiSound = createSoundEngine({
  create: src => new Audio(src),
  now: () => performance.now(),
  allowed: () => document.visibilityState === 'visible' &&
    ![...document.querySelectorAll('video')].some(video => !video.paused && !video.ended),
});
