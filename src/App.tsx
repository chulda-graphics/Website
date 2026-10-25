import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import { EntryScreen, hasEntered, rememberEntry } from './components/EntryScreen';
import { Carousel } from './components/Carousel';
import { profile, projects } from './content';
import { SmoothScroll } from './components/SmoothScroll';
import { Navigation } from './components/Navigation';
import { ProjectArtwork } from './components/ProjectArtwork';
import { ProjectVideo } from './components/ProjectVideo';
import { useEditorialReveal } from './components/useEditorialReveal';
import { SoundToggle } from './components/SoundToggle';
import { uiSound } from './components/uiSound';
import { enterPage, leavePage, pageElements, settled } from './components/pageMotion';
import { captureProjectCover, type ProjectTransition } from './components/projectTransition';

import { normalizePath } from './routes';

function useRoute() {
  const [path, setPath] = useState(() => normalizePath(location.pathname));
  const currentPath = useRef(path);
  const previousPath = useRef<string | null>(null);
  const animations = useRef<Animation[]>([]);
  const revision = useRef(0);
  const pendingPath = useRef<string | null>(null);
  const pendingCover = useRef<ProjectTransition | null>(null);
  const activeCover = useRef<ProjectTransition | null>(null);
  const stop = () => {
    activeCover.current?.cancel(); activeCover.current = null;
    animations.current.forEach(animation => animation.cancel()); animations.current = [];
  };
  const commit = (next: string) => {
    previousPath.current = currentPath.current;
    currentPath.current = next;
    pendingPath.current = null;
    flushSync(() => setPath(next));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  useEffect(() => {
    if (location.pathname.replace(/\/+$/, '') === '/travel') history.replaceState(history.state, '', '/about');
    const pop = () => {
      if (location.pathname.replace(/\/+$/, '') === '/travel') history.replaceState(history.state, '', '/about');
      revision.current++; stop();
      pendingCover.current?.cancel(); pendingCover.current = null;
      commit(normalizePath(location.pathname));
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const motionChange = () => {
      if (reduced.matches) { animations.current.forEach(animation => animation.finish()); activeCover.current?.cancel(); }
    };
    reduced.addEventListener('change', motionChange);
    addEventListener('popstate', pop);
    return () => { revision.current++; stop(); pendingCover.current?.cancel(); removeEventListener('popstate', pop); reduced.removeEventListener('change', motionChange); };
  }, []);
  useLayoutEffect(() => {
    stop();
    const keepIdentity = [previousPath.current, path].every(value => value === '/' || value === '/about');
    const cover = pendingCover.current;
    pendingCover.current = null;
    const picture = cover ? document.querySelector<HTMLElement>(cover.returning
      ? `.stack-card[aria-hidden="false"][href="${previousPath.current}"]` : '.video-picture') : null;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sharedCover = !!(cover && picture && !reduced);
    const incoming = enterPage(pageElements(keepIdentity, sharedCover, cover?.returning), reduced, sharedCover);
    animations.current = incoming;
    if (sharedCover) { activeCover.current = cover; cover.play(picture, () => incoming.forEach(animation => animation.finish())); }
    else cover?.cancel();
    return stop;
  }, [path]);
  const navigate = async (destination: string) => {
    const next = normalizePath(destination);
    if (next === pendingPath.current) return;
    const request = ++revision.current;
    pendingPath.current = null;
    pendingCover.current?.cancel(); pendingCover.current = null;
    if (next === currentPath.current) { stop(); return; }
    pendingPath.current = next;
    uiSound.play('navigate');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const project = projects.find(item => `/project/${item.slug}` === next);
    const card = currentPath.current === '/' && project?.video && !reduced
      ? document.querySelector<HTMLElement>(`.stack-card[aria-hidden="false"][href="${next}"]`) : null;
    if (card) {
      stop();
      pendingCover.current = captureProjectCover(card);
      if (pendingCover.current) { history.pushState({}, '', next); commit(next); return; }
    }
    if (next === '/' && !reduced && projects.some(item => item.video && `/project/${item.slug}` === currentPath.current)) {
      stop();
      const picture = document.querySelector<HTMLElement>('.video-picture');
      pendingCover.current = picture ? captureProjectCover(picture, true) : null;
      if (pendingCover.current) { history.pushState({}, '', next); commit(next); return; }
    }
    const keepIdentity = [currentPath.current, next].every(value => value === '/' || value === '/about');
    const leaving = leavePage(pageElements(keepIdentity), reduced);
    stop();
    animations.current = leaving;
    await settled(animations.current);
    if (request !== revision.current) return;
    history.pushState({}, '', next);
    commit(next);
  };
  return { path, navigate };
}

function Identity() {
  return <header className="identity">
    <div className="identity-text" style={{viewTransitionName: 'identity'}}><h1>{profile.name}</h1><p>{profile.title}</p></div>
  </header>;
}

function About() {
  const biography = useRef<HTMLElement>(null);
  useEditorialReveal(biography);
  return <main className="about-view">
    <section className="biography" aria-label="About" ref={biography}>
      <div className="biography-window">
        <div className="window-titlebar"><span className="window-lights" aria-hidden="true"><i/><i/><i/></span><span>About me</span></div>
        <div className="biography-content">
          <div className="biography-copy"><p><strong>{profile.introductionLead}</strong>, {profile.introduction}</p>
          <p>{profile.biography}</p></div>
        </div>
        <div className="about-background">
          <section className="about-experience" aria-labelledby="experience-heading">
            <h2 id="experience-heading">Professional experiences</h2>
            <ul className="experience-list">
              {profile.experience.map(item => <li key={item.organisation}>
                <h3>{item.organisation}</h3>
                <p className="experience-role">{item.role}</p>
                <p className="experience-period">{item.period}</p>
              </li>)}
            </ul>
          </section>
          <div className="about-background-details">
            <section aria-labelledby="education-heading">
              <h2 id="education-heading">Education</h2>
              <h3>{profile.education.degree}</h3>
              <p>{profile.education.institution}</p>
              <p className="experience-period">{profile.education.period}</p>
            </section>
            <section aria-labelledby="leadership-heading">
              <h2 id="leadership-heading">Creative leadership</h2>
              <p>{profile.leadership}</p>
            </section>
          </div>
          <section className="about-toolkit" aria-labelledby="tools-heading">
            <h2 id="tools-heading">Selected tools</h2>
            <div className="tool-groups">
              {profile.toolGroups.map(group => <div className="tool-group" key={group.title}>
                <h3>{group.title}</h3>
                <ul className="about-tools">
                  {group.items.map(tool => <li key={tool.name}>
                    <span className="tool-icon" aria-hidden="true"><img src={tool.icon} alt="" width={18} height={18} loading="lazy" decoding="async"/></span>
                    <span>{tool.name}</span>
                  </li>)}
                </ul>
              </div>)}
            </div>
          </section>
        </div>
      </div>
    </section>
  </main>;
}

function ProjectView({ slug, navigate }: { slug: string; navigate: (route: string) => void }) {
  const stills = useRef<HTMLElement>(null);
  useEditorialReveal(stills, '.project-stills-grid img');
  const project = projects.find(item => item.slug === slug);
  if (!project) return <main className="not-found"><h1>Project not found</h1><button onClick={() => navigate('/')}>Back to Home</button></main>;
  const index = projects.indexOf(project);
  return <main className={`project-view ${project.video ? 'project-view--video' : ''}`}>
    <header className="project-identity"><div style={{viewTransitionName: 'identity'}}>

      <h1>{project.title}</h1><p className="project-category">{project.category}</p></div>
    </header>
    <div className="project-detail">
      {project.video ? <ProjectVideo key={project.slug} project={project}/> : <section className="project-slide" style={{viewTransitionName: 'project-media'}} aria-label={`${project.title} artwork`}><ProjectArtwork project={project} expanded index={index}/></section>}
      {project.sections.map((section) => <section key={section.title} className="project-description" aria-label={section.title}>
        <div className="project-copy">
          <div className="project-copy-heading">
            <h2>{section.title}</h2>

          </div>
          <p>{section.body}</p>
        </div>
      </section>)}
      {!!project.stills?.length && <section ref={stills} className="project-stills" aria-label="Project images">

        <div className="project-stills-grid">
          {project.stills.map(frame => <img key={frame.src} src={frame.src} alt={frame.alt} width={800} height={450} loading="lazy" decoding="async"/>)}
        </div>
      </section>}
    </div>
  </main>;
}

function Portfolio() {
  const { path, navigate } = useRoute();
  const [selected, setSelected] = useState(0);
  const home = path === '/'; const about = path === '/about';
  const projectSlug = path.startsWith('/project/') ? path.slice(9) : '';
  useEffect(() => {
    const index = projects.findIndex(project => project.slug === projectSlug);
    if (index >= 0) setSelected(index);
  }, [projectSlug]);
  useEffect(() => {
    document.title = `${profile.name} — ${home ? profile.title : about ? 'About' : projects.find(project => project.slug === projectSlug)?.title ?? 'Not found'}`;
    document.body.dataset.page = home ? 'home' : about ? 'about' : 'project';
  }, [path, home, about, projectSlug]);
  useEffect(() => {
    const target = document.querySelector<HTMLElement>('h1') ?? document.getElementById('main');
    target?.setAttribute('tabindex', '-1');
    target?.focus({ preventScroll: true });
  }, [path]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !document.fullscreenElement) navigate('/'); };
    addEventListener('keydown', escape); return () => removeEventListener('keydown', escape);
  }, [path]);
  return <>
    <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus({ preventScroll: true }); }}>Skip to content</a>
    <Navigation path={path} navigate={navigate}/>
    <SmoothScroll route={path}><div key={path} id="main" tabIndex={-1} className={`app page-${home ? 'home' : about ? 'about' : 'project'}`}>
      {(home || about) && <Identity/>}
      {home && <Carousel navigate={navigate} selected={selected} setSelected={setSelected}/>}
      {about && <About/>}
      {projectSlug && <ProjectView key={projectSlug} slug={projectSlug} navigate={navigate}/>}
      {!home && !about && !projectSlug && <main className="not-found"><h1>Page not found</h1><button onClick={() => navigate('/')}>Back to Home</button></main>}
    </div></SmoothScroll>
  </>;
}

export function App() {
  const [entered, setEntered] = useState(hasEntered);
  return <>
    <SoundToggle/>
    {entered && <Portfolio/>}
    <AnimatePresence>{!entered && <EntryScreen key="entry" onEnter={() => { rememberEntry(); setEntered(true); }}/>}</AnimatePresence>
  </>;
}
