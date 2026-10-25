import { useEffect, useRef, useState } from 'react';
import type { Project } from '../content';
import { Icon } from './Icon';

const timeLabel = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function ProjectVideo({ project }: { project: Project }) {
  const video = useRef<HTMLVideoElement>(null);
  const player = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const lastAudibleVolume = useRef(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === player.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  async function togglePlayback() {
    if (!video.current) return;
    setMessage('');
    if (!video.current.paused) video.current.pause();
    else try { await video.current.play(); } catch { setMessage('Unable to play. Please try again.'); }
  }
  function syncVolume() {
    const media = video.current;
    if (!media) return;
    setMuted(media.muted); setVolume(media.volume);
    if (media.volume > 0) lastAudibleVolume.current = media.volume;
  }
  function changeVolume(percent: number) {
    const media = video.current;
    if (!media) return;
    media.volume = Math.min(1, Math.max(0, percent / 100));
    media.muted = media.volume === 0;
    syncVolume();
  }
  function toggleMute() {
    const media = video.current;
    if (!media) return;
    const silent = media.muted || media.volume === 0;
    if (silent && media.volume === 0) media.volume = lastAudibleVolume.current;
    media.muted = !silent;
    syncVolume();
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (player.current?.requestFullscreen) await player.current.requestFullscreen();
      else {
        const native = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
        if (native?.webkitEnterFullscreen) native.webkitEnterFullscreen();
        else setMessage('Fullscreen is unavailable in this browser.');
      }
    } catch { setMessage('Fullscreen is unavailable in this browser.'); }
  }
  return <section ref={player} className="project-slide project-video-slide" aria-label={`${project.title} video`}>
    <div className="video-picture">
      <img src={project.cover} alt="" hidden aria-hidden="true"/>
      <video ref={video} muted={muted} playsInline preload="metadata" poster={project.cover}
        aria-label={`${project.title} — ${project.category}`} src={project.video}
        onClick={togglePlayback} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)} onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
        onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onVolumeChange={syncVolume}
        onError={() => setFailed(true)} onLoadedData={() => setFailed(false)} />
      {failed && <div className="video-error" role="alert"><p>The video couldn’t load.</p>
        <button onClick={() => { setFailed(false); video.current?.load(); }}>Try again</button>
      </div>}
    </div>
    <div className="video-toolbar" role="group" aria-label="Video controls">
      <button className="video-action" aria-label={playing ? 'Pause video' : 'Play video'} onClick={togglePlayback}><Icon name={playing ? 'pause' : 'play'} weight="fill"/></button>
      <input className="video-progress" type="range" aria-label="Seek video" min={0} max={duration || 1} step={0.1}
        value={Math.min(time, duration || 1)} disabled={!duration} aria-valuetext={`${timeLabel(time)} of ${timeLabel(duration)}`}
        onChange={event => { const next = Number(event.target.value); if (video.current) video.current.currentTime = next; setTime(next); }}/>
      <span className="video-time" aria-hidden="true">{timeLabel(time)}</span>
      <div className="video-volume-controls" role="group" aria-label="Audio volume">
        <button className="video-action" aria-label={muted || volume === 0 ? 'Unmute video' : 'Mute video'} onClick={toggleMute}><Icon name={muted || volume === 0 ? 'muted' : 'sound'}/></button>
        <input className="video-volume" type="range" aria-label="Video volume" min={0} max={100} step={1}
          value={muted ? 0 : Math.round(volume * 100)}
          aria-valuetext={muted || volume === 0 ? 'Muted' : `${Math.round(volume * 100)}% volume`}
          title={`Volume: ${muted ? 0 : Math.round(volume * 100)}%`}
          onChange={event => changeVolume(Number(event.currentTarget.value))}/>
      </div>
      <button className="video-action" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={toggleFullscreen}><Icon name={fullscreen ? 'collapse' : 'expand'}/></button>
    </div>
    {message && <p className="video-message" role="status">{message}</p>}
  </section>;
}
