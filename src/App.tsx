import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { EntryScreen, hasEntered, rememberEntry } from './components/EntryScreen';
import { Carousel } from './components/Carousel';
import { Travel } from './components/Travel';
import { assets, profile, projects } from './content';
import { SmoothScroll, ViewportLayer } from './components/SmoothScroll';
import { Icon } from './components/Icon';
import ScrollFloat from './components/ScrollFloat';
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
    const update = () => { history.pushState({}, '', next); flushSync(() => setPath(next)); window.scrollTo({ top: 0, behavior: 'instant' }); };
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(update);
    else update();
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
    <div className="identity-text" style={{viewTransitionName: 'identity'}}><h1>{profile.name}</h1><p>{profile.title}</p></div>
    <ViewportLayer when="mobile"><nav className={`identity-controls ${social ? 'social-open' : ''}`} aria-label="Main navigation">
      {about ? <Control label="Back to Home" active onClick={() => navigate('/')}><Icon name="back" /></Control> :
        !social && <Control label="Open About Page" onClick={() => navigate('/about')}><Icon name="person" /></Control>}
      {!about && <Control label={social ? 'Close Social Links' : 'Open Social Links'} active={social} expanded={social} onClick={() => { setSocial(!social); setStatus(''); }}><Icon name={social ? 'back' : 'chat'} /></Control>}
      {social && <>
        <Control label="Copy email" onClick={copyEmail}><Icon name="mail" /></Control>
        <Control label="X (Twitter)" onClick={() => openSocial(profile.social.x)}><Icon name="x" /></Control>
        <Control label="LinkedIn" onClick={() => openSocial(profile.social.linkedin)}><Icon name="linkedin" /></Control>
      </>}
      <span role="status" className="contact-status">{status}</span>
    </nav></ViewportLayer>
  </header>;
}

function About({ navigate }: { navigate: (route: string) => void }) {
  return <main className="about-view">
    <button className="globe-link" aria-label="Open the travel gallery" onClick={() => navigate('/travel')}>
      <Suspense fallback={<div className="model"/>}><Model src={assets.globe}/></Suspense>
      <span>Click to travel</span>
    </button>
    <section className="biography" aria-label="About">
      <p><strong>{profile.introductionLead}</strong> {profile.introduction}</p>
      <p>{profile.biography}</p>
      <div className="recognitions"><h2>Selected disciplines:</h2><ul><li>Digital design</li><li>Art direction</li><li>Brand experiences</li><li>Motion & interaction</li></ul></div>
      <p>{profile.availability}</p>
    </section>
  </main>;
}

function ProjectView({ slug, navigate }: { slug: string; navigate: (route: string) => void }) {
  const project = projects.find(item => item.slug === slug);
  const [info, setInfo] = useState(false);
  const [message, setMessage] = useState('');
  if (!project) return <main className="not-found"><h1>Project not found</h1><button onClick={() => navigate('/')}>Back to Home</button></main>;
  const index = projects.indexOf(project);
  return <main className="project-view">
    <ViewportLayer when="desktop"><header className="project-identity"><div style={{viewTransitionName: 'identity'}}><h1>{project.title}</h1><p className="project-category">{project.category}</p></div>
      <ViewportLayer when="mobile"><nav className="project-controls" aria-label="Project controls">
        <Control label="Toggle Project Info" active={info} expanded={info} onClick={() => setInfo(!info)}><Icon name="info"/></Control>
        <Control label="Open Project External Link" onClick={() => project.url ? window.open(project.url, '_blank', 'noopener,noreferrer') : setMessage('Project link coming soon')}><Icon name="external"/></Control>
      </nav></ViewportLayer><ViewportLayer when="mobile"><span className="project-status" role="status">{message}</span></ViewportLayer>
    </header></ViewportLayer>
    <ViewportLayer><Control className="project-close" label="Back to Home" onClick={() => navigate('/')}><Icon name="collapse"/></Control></ViewportLayer>
    <div className={`project-detail ${info ? 'show-info' : ''}`}>
      {project.sections.map((section, sectionIndex) => <section key={section.title} className="project-slide" style={{viewTransitionName: sectionIndex === 0 ? 'project-media' : 'none'}} aria-label={section.title}>
        {info ? <div className="project-copy project-copy--animated">
          <ScrollFloat scrollStart="top bottom" scrollEnd="clamp(bottom center)" stagger={0.02}>{section.title}</ScrollFloat>
          <ScrollFloat as="p" scrollStart="top bottom" scrollEnd="clamp(bottom center)" stagger={0.02}>{section.body}</ScrollFloat>
        </div> : <ProjectArtwork project={project} expanded index={index + sectionIndex}/>}
      </section>)}
      <button className="next-project" onClick={() => navigate(`/project/${projects[(index + 1) % projects.length].slug}`)}>Next project<br/><span>{projects[(index + 1) % projects.length].title}</span></button>
    </div>
  </main>;
}

function Portfolio() {
  const { path, navigate } = useRoute();
  const [selected, setSelected] = useState(3);
  const home = path === '/'; const about = path === '/about'; const travel = path === '/travel';
  const projectSlug = path.startsWith('/project/') ? path.slice(9) : '';
  useEffect(() => {
    const index = projects.findIndex(project => project.slug === projectSlug);
    if (index >= 0) setSelected(index);
  }, [projectSlug]);
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
    <SmoothScroll route={path}><div id="main" className={`app page-${home ? 'home' : about ? 'about' : travel ? 'travel' : 'project'}`}>
      {(home || about) && <Identity about={about} navigate={navigate}/>}
      {home && <Carousel navigate={navigate} selected={selected} setSelected={setSelected}/>}
      {about && <About navigate={navigate}/>}
      {travel && <Travel navigate={navigate}/>}
      {projectSlug && <ProjectView key={projectSlug} slug={projectSlug} navigate={navigate}/>}
      {!home && !about && !travel && !projectSlug && <main className="not-found"><h1>Page not found</h1><button onClick={() => navigate('/')}>Back to Home</button></main>}
    </div></SmoothScroll>
  </>;
}

export function App() {
  const [entered, setEntered] = useState(hasEntered);
  return entered ? <Portfolio/> : <EntryScreen onEnter={() => { rememberEntry(); setEntered(true); }}/>;
}
