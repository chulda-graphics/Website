import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { assets, profile, projects } from './content';
import { Icon } from './components/Icon';
import { ProjectArtwork } from './components/ProjectArtwork';

const Model = lazy(() => import('./components/Model').then(module => ({ default: module.Model })));

function useRoute() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const pop = () => setPath(location.pathname);
    addEventListener('popstate', pop); return () => removeEventListener('popstate', pop);
  }, []);
  const navigate = (next: string) => {
    if (next === location.pathname) return;
    history.pushState({}, '', next); setPath(next); window.scrollTo({ top: 0, behavior: 'instant' });
  };
  return { path, navigate };
}

function Control({ label, active, onClick, children, className = '', disabled = false, expanded }: {
  label: string; active?: boolean; onClick: () => void; children: ReactNode; className?: string; disabled?: boolean; expanded?: boolean;
}) {
  return <button className={`control ${active ? 'active' : ''} ${className}`} aria-label={label} title={label} onClick={onClick} disabled={disabled} aria-expanded={expanded}>{children}</button>;
}

function Identity({ about, navigate }: { about: boolean; navigate: (route: string) => void }) {
  const [social, setSocial] = useState(about);
  const [status, setStatus] = useState('');
  useEffect(() => { setSocial(about); setStatus(''); }, [about]);
  async function copyEmail() {
    if (!profile.email) { setStatus('Contact details coming soon'); return; }
    try { await navigator.clipboard.writeText(profile.email); setStatus('Email copied'); }
    catch { setStatus(profile.email); }
  }
  function openSocial(url: string) {
    if (!url) { setStatus('Social link coming soon'); return; }
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return <header className="identity">
    <div className="identity-text"><h1>{profile.name}</h1><p>{profile.title}</p></div>
    <nav className={`identity-controls ${social ? 'social-open' : ''}`} aria-label="Main navigation">
      {about ? <Control label="Back to Home" active onClick={() => navigate('/')}><Icon name="back" /></Control> :
        !social && <Control label="Open About Page" onClick={() => navigate('/about')}><Icon name="person" /></Control>}
      {!about && <Control label={social ? 'Close Social Links' : 'Open Social Links'} active={social} expanded={social} onClick={() => { setSocial(!social); setStatus(''); }}><Icon name={social ? 'back' : 'chat'} /></Control>}
      {social && <>
        <Control label="Copy email" onClick={copyEmail}><Icon name="mail" /></Control>
        <Control label="X (Twitter)" onClick={() => openSocial(profile.social.x)}><Icon name="x" /></Control>
        <Control label="LinkedIn" onClick={() => openSocial(profile.social.linkedin)}><Icon name="linkedin" /></Control>
      </>}
      <span role="status" className="contact-status">{status}</span>
    </nav>
  </header>;
}

function Carousel({ navigate, selected, setSelected }: { navigate: (path: string) => void; selected: number; setSelected: (value: number) => void }) {
  const last = useRef(0);
  const gesture = useRef({ x: 0, y: 0 });
  const selectedRef = useRef(selected); selectedRef.current = selected;
  const [moving, setMoving] = useState(false);
  const transition = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (document.activeElement?.classList.contains('project-card')) {
      document.querySelector<HTMLAnchorElement>('.project-card.is-current')?.focus({ preventScroll: true });
    }
  }, [selected]);
  function step(direction: number) {
    const now = performance.now(); if (now - last.current < 700) return;
    last.current = now; setMoving(true);
    setSelected((selectedRef.current + direction + projects.length) % projects.length);
    clearTimeout(transition.current); transition.current = setTimeout(() => setMoving(false), 650);
  }
  useEffect(() => {
    const wheel = (event: WheelEvent) => { if (Math.abs(event.deltaY) < 8) return; event.preventDefault(); step(Math.sign(event.deltaY)); };
    const key = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(event.key)) {
        event.preventDefault(); step(['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1);
      }
    };
    addEventListener('wheel', wheel, { passive: false }); addEventListener('keydown', key);
    return () => { removeEventListener('wheel', wheel); removeEventListener('keydown', key); clearTimeout(transition.current); };
    // The selected index is read from a ref so input listeners remain stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <section className={`carousel ${moving ? 'is-moving' : ''}`} aria-label="Selected projects"
    onTouchStart={event => { gesture.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
    onTouchEnd={event => { const dy = gesture.current.y - event.changedTouches[0].clientY; if (Math.abs(dy) > 35) step(Math.sign(dy)); }}>
    <div className="card-stack stack-above" aria-hidden="true"><i/><i/><i/></div>
    <div className="project-stage">
      {projects.map((project, index) => <a key={project.slug} className={`project-card ${selected === index ? 'is-current' : ''}`} href={`/project/${project.slug}`}
        aria-label={`Open ${project.title}`} aria-hidden={selected !== index} tabIndex={selected === index ? 0 : -1}
        onClick={event => { event.preventDefault(); navigate(`/project/${project.slug}`); }}>
        <ProjectArtwork project={project} index={index} />
      </a>)}
    </div>
    <div className="card-stack stack-below" aria-hidden="true"><i/><i/><i/></div>
    <div className="pagination" aria-label="Select project">
      {projects.map((project, index) => <button key={project.slug} className={index === selected ? 'selected' : ''} aria-label={`Show ${project.title}`} aria-current={index === selected ? 'true' : undefined} onClick={() => setSelected(index)}><span/></button>)}
    </div>
    <span className="sr-only" aria-live="polite">{projects[selected].title}, {selected + 1} of {projects.length}</span>
  </section>;
}

function About({ navigate }: { navigate: (route: string) => void }) {
  return <main className="about-view">
    <button className="globe-link" aria-label="Open the travel gallery" onClick={() => navigate('/travel')}>
      <Suspense fallback={<div className="model"/>}><Model src={assets.globe}/></Suspense>
      <span>Click to travel</span>
    </button>
    <section className="biography" aria-label="About">
      <p><strong>{profile.introduction}</strong></p>
      <p>{profile.biography}</p>
      <div className="recognitions"><h2>Selected disciplines:</h2><ul><li>Digital design</li><li>Art direction</li><li>Brand experiences</li><li>Motion & interaction</li></ul></div>
      <p>{profile.availability}</p>
    </section>
  </main>;
}

function Travel({ navigate }: { navigate: (route: string) => void }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  return <main className="travel-view" aria-label="Travel gallery" onPointerMove={event => setOffset({ x: (event.clientX / innerWidth - .5) * 25, y: (event.clientY / innerHeight - .5) * 15 })}>
    <div className="travel-scene" style={{ '--move-x': `${offset.x}px`, '--move-y': `${offset.y}px` } as CSSProperties}>
      {[0,1,2,3,4].map(index => <div key={index} className={`travel-frame travel-frame-${index}`}><span>Travel {String(index + 1).padStart(2, '0')}</span></div>)}
      <div className="aircraft"><Suspense fallback={null}><Model src={assets.aircraft} kind="aircraft" /></Suspense></div>
    </div>
    <button className="travel-return" aria-label="Return to the about page" onClick={() => navigate('/about')}><span className="departure-code" aria-hidden="true"><i>T</i><i>B</i><i>D</i></span><span>Click to return</span></button>
  </main>;
}

function ProjectView({ slug, navigate }: { slug: string; navigate: (route: string) => void }) {
  const project = projects.find(item => item.slug === slug);
  const [info, setInfo] = useState(false);
  const [message, setMessage] = useState('');
  if (!project) return <main className="not-found"><h1>Project not found</h1><button onClick={() => navigate('/')}>Back to Home</button></main>;
  const index = projects.indexOf(project);
  return <main className="project-view">
    <header className="project-identity"><h1>{project.title}</h1><p>{project.category}</p>
      <nav aria-label="Project controls">
        <Control label="Toggle Project Info" active={info} expanded={info} onClick={() => setInfo(!info)}><Icon name="info"/></Control>
        <Control label="Open Project External Link" onClick={() => project.url ? window.open(project.url, '_blank', 'noopener,noreferrer') : setMessage('Project link coming soon')}><Icon name="external"/></Control>
      </nav><span className="project-status" role="status">{message}</span>
    </header>
    <Control className="project-close" label="Back to Home" onClick={() => navigate('/')}><Icon name="collapse"/></Control>
    <div className={`project-detail ${info ? 'show-info' : ''}`}>
      {project.sections.map((section, sectionIndex) => <section key={section.title} className="project-slide" aria-label={section.title}>
        {info ? <div className="project-copy"><h2>{section.title}</h2><p>{section.body}</p></div> : <ProjectArtwork project={project} expanded index={index + sectionIndex}/>}
      </section>)}
      <button className="next-project" onClick={() => navigate(`/project/${projects[(index + 1) % projects.length].slug}`)}>Next project<br/><span>{projects[(index + 1) % projects.length].title}</span></button>
    </div>
  </main>;
}

export function App() {
  const { path, navigate } = useRoute();
  const [selected, setSelected] = useState(0);
  const home = path === '/'; const about = path === '/about'; const travel = path === '/travel';
  const projectSlug = path.startsWith('/project/') ? path.slice(9) : '';
  useEffect(() => {
    document.title = `${profile.name} — ${home ? profile.title : about ? 'About' : travel ? 'Travel' : projects.find(project => project.slug === projectSlug)?.title ?? 'Not found'}`;
    document.body.dataset.page = home ? 'home' : about ? 'about' : travel ? 'travel' : 'project';
  }, [path, home, about, travel, projectSlug]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') navigate(travel ? '/about' : '/'); };
    addEventListener('keydown', escape); return () => removeEventListener('keydown', escape);
  }, [path]);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div id="main" className={`app page-${home ? 'home' : about ? 'about' : travel ? 'travel' : 'project'}`}>
      {(home || about) && <Identity about={about} navigate={navigate}/>}
      {home && <Carousel navigate={navigate} selected={selected} setSelected={setSelected}/>}
      {about && <About navigate={navigate}/>}
      {travel && <Travel navigate={navigate}/>}
      {projectSlug && <ProjectView key={projectSlug} slug={projectSlug} navigate={navigate}/>}
      {!home && !about && !travel && !projectSlug && <main className="not-found"><h1>Page not found</h1><button onClick={() => navigate('/')}>Back to Home</button></main>}
    </div>
  </>;
}
