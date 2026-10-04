import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import { EntryScreen, hasEntered, rememberEntry } from './components/EntryScreen';
import { Carousel } from './components/Carousel';
import { Travel } from './components/Travel';
import { assets, profile, projects } from './content';
import { SmoothScroll, ViewportLayer } from './components/SmoothScroll';
import { Icon } from './components/Icon';
import ScrollFloat from './components/ScrollFloat';
import { ProjectArtwork } from './components/ProjectArtwork';
import { ProjectVideo } from './components/ProjectVideo';
import { useEditorialReveal } from './components/useEditorialReveal';
import { enterPage, leavePage, pageElements, settled } from './components/pageMotion';

const Model = lazy(() => import('./components/Model').then(module => ({ default: module.Model })));

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

function useRoute() {
  const [path, setPath] = useState(() => normalizePath(location.pathname));
  const currentPath = useRef(path);
  const previousPath = useRef<string | null>(null);
  const animations = useRef<Animation[]>([]);
  const revision = useRef(0);
  const pendingPath = useRef<string | null>(null);
  const stop = () => { animations.current.forEach(animation => animation.cancel()); animations.current = []; };
  const commit = (next: string) => {
    previousPath.current = currentPath.current;
    currentPath.current = next;
    pendingPath.current = null;
    flushSync(() => setPath(next));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  useEffect(() => {
    const pop = () => {
      revision.current++; stop();
      commit(normalizePath(location.pathname));
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const motionChange = () => { if (reduced.matches) animations.current.forEach(animation => animation.finish()); };
    reduced.addEventListener('change', motionChange);
    addEventListener('popstate', pop);
    return () => { revision.current++; stop(); removeEventListener('popstate', pop); reduced.removeEventListener('change', motionChange); };
  }, []);
  useLayoutEffect(() => {
    stop();
    const keepIdentity = [previousPath.current, path].every(value => value === '/' || value === '/about');
    animations.current = enterPage(pageElements(keepIdentity), matchMedia('(prefers-reduced-motion: reduce)').matches);
    return stop;
  }, [path]);
  const navigate = async (destination: string) => {
    const next = normalizePath(destination);
    if (next === pendingPath.current) return;
    const request = ++revision.current;
    pendingPath.current = null;
    if (next === currentPath.current) { stop(); return; }
    pendingPath.current = next;
    const keepIdentity = [currentPath.current, next].every(value => value === '/' || value === '/about');
    const leaving = leavePage(pageElements(keepIdentity), matchMedia('(prefers-reduced-motion: reduce)').matches);
    stop();
    animations.current = leaving;
    await settled(animations.current);
    if (request !== revision.current) return;
    history.pushState({}, '', next);
    commit(next);
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
    setStatus(profile.email);
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
  const biography = useRef<HTMLElement>(null);
  useEditorialReveal(biography);
  return <main className="about-view">
    <ViewportLayer when="desktop"><button className="globe-link" aria-label="Explore my world" onClick={() => navigate('/travel')}>
      <Suspense fallback={<div className="model"/>}><Model src={assets.globe}/></Suspense>
      <span>Click my world</span>
    </button></ViewportLayer>
    <section className="biography" aria-label="About" ref={biography}>
      <p><strong>{profile.introductionLead}</strong>, {profile.introduction}</p>
      <p>{profile.biography}</p>
      <div className="recognitions"><h2>Selected disciplines:</h2><ul><li>Motion design</li><li>Graphic design</li><li>Brand identity</li><li>Art direction</li></ul></div>
    </section>
  </main>;
}

function ProjectView({ slug, navigate }: { slug: string; navigate: (route: string) => void }) {
  const project = projects.find(item => item.slug === slug);
  if (!project) return <main className="not-found"><h1>Project not found</h1><button onClick={() => navigate('/')}>Back to Home</button></main>;
  const index = projects.indexOf(project);
  const nextProject = projects[(index + 1) % projects.length];
  return <main className={`project-view ${project.video ? 'project-view--video' : ''}`}>
    <ViewportLayer when="desktop"><header className="project-identity"><div style={{viewTransitionName: 'identity'}}><h1>{project.title}</h1><p className="project-category">{project.category}</p></div>
      <ViewportLayer when="mobile"><nav className="project-controls" aria-label="Project controls">
        <Control label={`Next project: ${nextProject.title}`} onClick={() => navigate(`/project/${nextProject.slug}`)}><Icon name="next"/></Control>
        <Control label="Minimise project" onClick={() => navigate('/')}><Icon name="collapse"/></Control>
      </nav></ViewportLayer>
    </header></ViewportLayer>
    <div className="project-detail">
      {project.video ? <ProjectVideo key={project.slug} project={project}/> : <section className="project-slide" style={{viewTransitionName: 'project-media'}} aria-label={`${project.title} artwork`}><ProjectArtwork project={project} expanded index={index}/></section>}
      {project.sections.map(section => <section key={section.title} className="project-description" aria-label={section.title}>
        <div className="project-copy project-copy--animated">
          <ScrollFloat scrollStart="top bottom" scrollEnd="clamp(bottom bottom-=12%)" stagger={0.02}>{section.title}</ScrollFloat>
          <ScrollFloat as="p" scrollStart="top bottom" scrollEnd="clamp(bottom bottom-=12%)" stagger={0.02}>{section.body}</ScrollFloat>
        </div>
      </section>)}
    </div>
  </main>;
}

function Portfolio() {
  const { path, navigate } = useRoute();
  const [selected, setSelected] = useState(0);
  const home = path === '/'; const about = path === '/about'; const travel = path === '/travel';
  const projectSlug = path.startsWith('/project/') ? path.slice(9) : '';
  useEffect(() => {
    const index = projects.findIndex(project => project.slug === projectSlug);
    if (index >= 0) setSelected(index);
  }, [projectSlug]);
  useEffect(() => {
    document.title = `${profile.name} — ${home ? profile.title : about ? 'About' : travel ? 'My world' : projects.find(project => project.slug === projectSlug)?.title ?? 'Not found'}`;
    document.body.dataset.page = home ? 'home' : about ? 'about' : travel ? 'travel' : 'project';
  }, [path, home, about, travel, projectSlug]);
  useEffect(() => {
    const target = document.querySelector<HTMLElement>('h1') ?? document.getElementById('main');
    target?.setAttribute('tabindex', '-1');
    target?.focus({ preventScroll: true });
  }, [path]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') navigate(travel ? '/about' : '/'); };
    addEventListener('keydown', escape); return () => removeEventListener('keydown', escape);
  }, [path]);
  return <>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus({ preventScroll: true }); }}>Skip to content</a>
    <SmoothScroll route={path}><div key={path} id="main" tabIndex={-1} className={`app page-${home ? 'home' : about ? 'about' : travel ? 'travel' : 'project'}`}>
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
  return <>
    {entered && <Portfolio/>}
    <AnimatePresence>{!entered && <EntryScreen key="entry" onEnter={() => { rememberEntry(); setEntered(true); }}/>}</AnimatePresence>
  </>;
}
