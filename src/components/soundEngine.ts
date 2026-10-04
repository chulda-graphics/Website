export type SoundName = 'click' | 'navigate' | 'confirm';
export const soundSources: Record<SoundName, string> = {
  click: '/assets/audio/click.mp3',
  navigate: '/assets/audio/navigate.mp3',
  confirm: '/assets/audio/confirm.mp3',
};

type Player = Pick<HTMLAudioElement, 'play' | 'pause' | 'currentTime' | 'volume'>;

/** Lazy, opt-in cues. One voice at a time; unavailable audio never blocks an action. */
export function createSoundEngine(options: {
  create: (src: string) => Player;
  now: () => number;
  allowed: () => boolean;
}) {
  let enabled = false;
  let lastPlayed = -Infinity;
  let revision = 0;
  const players = new Map<SoundName, Player>();
  const listeners = new Set<() => void>();
  const requests = new Map<Player, number>();
  function stop() {
    revision++;
    players.forEach(player => {
      try { player.pause(); player.currentTime = 0; } catch { /* Audio may be unavailable. */ }
    });
  }
  function setEnabled(value: boolean) {
    if (enabled === value) return;
    enabled = value;
    if (!enabled) stop();
    listeners.forEach(listener => listener());
  }
  function play(name: SoundName) {
    if (!enabled || !options.allowed()) return;
    const now = options.now();
    if (now - lastPlayed < 100 && name !== 'confirm') return;
    try {
      let player = players.get(name);
      if (!player) { player = options.create(soundSources[name]); player.volume = .6; players.set(name, player); }
      stop();
      const request = revision;
      lastPlayed = now;
      const current = player;
      requests.set(current, request);
      void current.play().then(() => {
        if (requests.get(current) === request && (request !== revision || !enabled || !options.allowed())) current.pause();
      }).catch(() => { /* Autoplay restrictions, offline files, or unsupported audio are silent. */ });
    } catch { /* Optional sound must not interfere with navigation. */ }
  }
  return {
    play, stop, setEnabled,
    getEnabled: () => enabled,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}
