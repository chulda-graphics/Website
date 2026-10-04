import { Icon } from './Icon';
import type { CSSProperties } from 'react';
import type { Project } from '../content';

export function ProjectArtwork({ project, expanded = false, index = 0 }: { project: Project; expanded?: boolean; index?: number }) {
  return <div className={`artwork ${!project.cover ? 'artwork-placeholder' : ''} ${expanded ? 'artwork-expanded' : ''}`} style={{ '--cover': project.color, '--accent': project.accent } as CSSProperties}>
    {project.cover ? <img src={project.cover} alt="" /> : <div className={`placeholder-layout composition-${index % 3}`} aria-hidden="true">
      <div className="mock-nav"><span>STUDIO / {project.slug.slice(-2)}</span><span>Selected work</span></div>
      <div className="mock-content"><span className="mock-kicker">A new perspective</span><span className="mock-title">Something<br/>considered.</span><div className="mock-panel"><span>{project.slug.slice(-2)}</span></div></div>
      <div className="mock-footer"><span>Portfolio project</span><span>Coming soon <Icon name="external"/></span></div>
    </div>}
    <span className="project-art-title">{project.title}</span>
  </div>;
}
