import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { uiSound } from './uiSound';

const key = 'chulda:sound:v1';

export function SoundToggle() {
  const enabled = useSyncExternalStore(uiSound.subscribe, uiSound.getEnabled);
  useEffect(() => {
    try { uiSound.setEnabled(sessionStorage.getItem(key) === 'on'); } catch { /* Default is muted. */ }
    const hide = () => { if (document.hidden) uiSound.stop(); };
    const videoStart = (event: Event) => { if (event.target instanceof HTMLVideoElement) uiSound.stop(); };
    document.addEventListener('visibilitychange', hide);
    document.addEventListener('play', videoStart, true);
    return () => {
      uiSound.stop();
      document.removeEventListener('visibilitychange', hide);
      document.removeEventListener('play', videoStart, true);
    };
  }, []);
  const toggle = () => {
    const next = !enabled;
    uiSound.setEnabled(next);
    try { sessionStorage.setItem(key, next ? 'on' : 'off'); } catch { /* The in-memory toggle still works. */ }
  };
  return createPortal(<button type="button" className="sound-toggle" aria-label="Interface sounds" aria-pressed={enabled}
    title={enabled ? 'Mute interface sounds' : 'Enable interface sounds'} onClick={toggle}>
    <Icon name={enabled ? 'sound' : 'muted'} size={17}/><span>Sound {enabled ? 'on' : 'off'}</span>
  </button>, document.body);
}
