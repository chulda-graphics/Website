import { useRef, useState } from 'react';
import type { Project } from '../content';

export function ProjectVideo({ project }: { project: Project }) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  return <section className="project-slide project-video-slide" aria-label={`${project.title} video`}>
    <video ref={video} controls muted playsInline preload="none" poster={project.cover}
      aria-label={`${project.title} — ${project.category}`} src={project.video}
      onError={() => setFailed(true)} onLoadedData={() => setFailed(false)} />
    {failed && <div className="video-error" role="alert">
      <p>The video couldn’t load.</p>
      <button onClick={() => { setFailed(false); video.current?.load(); }}>Try again</button>
    </div>}
  </section>;
}
