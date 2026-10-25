import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import { profile, projects } from '../content';
import { Icon } from './Icon';
import { ViewportLayer } from './SmoothScroll';
import { uiSound } from './uiSound';

const spring = { type: 'spring' as const, stiffness: 220, damping: 30, mass: 1 };
const iconSpring = { type: 'spring' as const, stiffness: 280, damping: 30, mass: .8 };
type IconName = Parameters<typeof Icon>[0]['name'];
type Action = {
  slot: string; label: string; icon: IconName; onClick: () => void;
  active?: boolean; expanded?: boolean; success?: boolean;
  preview?: { src: string; title: string };
};

const NavigationControl = forwardRef<HTMLButtonElement, { action: Action; reduced: boolean }>(function NavigationControl({ action, reduced }, ref) {
  const [previewDismissed, setPreviewDismissed] = useState(false);
  const present = useIsPresent();
  return <motion.button ref={ref} type="button" layout={reduced ? false : 'position'}
    initial={reduced ? false : { scale: 0 }} animate={{ scale: 1 }}
    exit={{ scale: reduced ? 1 : 0, transition: { duration: reduced ? 0 : .16, ease: 'easeIn' } }}
    transition={{ layout: spring, scale: reduced ? { duration: 0 } : { duration: .26, ease: [.22, 1, .36, 1] } }}
    style={{ borderRadius: 18, pointerEvents: present ? 'auto' : 'none' }}
    aria-hidden={!present || undefined} tabIndex={present ? undefined : -1} disabled={!present}
    className={`control ${action.active ? 'active' : ''} ${action.success ? 'control--success' : ''} ${action.preview ? 'control--preview' : ''}`}
    data-slot={action.slot} aria-label={action.label} aria-expanded={action.expanded}
    title={action.preview ? undefined : action.label} onClick={action.onClick}
    data-preview-dismissed={previewDismissed || undefined}
    onPointerEnter={() => setPreviewDismissed(false)} onFocus={() => setPreviewDismissed(false)}
    onKeyDown={event => {
      if (action.preview && !previewDismissed && event.key === 'Escape') {
        event.stopPropagation(); setPreviewDismissed(true);
      }
    }}>
    <AnimatePresence initial={false}>
      <motion.span key={action.icon} className="navigation-icon"
        initial={reduced ? false : { scale: .94, rotate: -6 }} animate={{ scale: 1, rotate: 0 }}
        transition={reduced ? { duration: 0 } : iconSpring}>
        <Icon name={action.icon}/>
      </motion.span>
    </AnimatePresence>
    {action.preview && <span className="control-preview" aria-hidden="true">
      <img src={action.preview.src} alt="" width={320} height={180} decoding="async" draggable={false}/>
      <span>{action.preview.title}</span>
    </span>}
  </motion.button>;
});

/** Keep one live dock across route changes; only its contents and geometry change. */
export function Navigation({ path, navigate }: { path: string; navigate: (route: string) => void }) {
  const reduced = !!useReducedMotion();
  const dock = useRef<HTMLElement>(null);
  const [socialOpen, setSocialOpen] = useState(false);
  const [status, setStatus] = useState('');
  const about = path === '/about';
  const home = path === '/';
  const project = projects.find(item => path === `/project/${item.slug}`);
  const contacts = about || (home && socialOpen);
  const mode = contacts ? 'contacts' : project ? 'project' : 'home';
  const previousMode = useRef(mode);
  useEffect(() => { setSocialOpen(false); setStatus(''); }, [path]);
  useEffect(() => {
    if (status !== 'Email copied') return;
    const timeout = setTimeout(() => setStatus(''), 4000);
    return () => clearTimeout(timeout);
  }, [status]);
  useLayoutEffect(() => {
    if (previousMode.current !== mode && dock.current?.contains(document.activeElement)) {
      // Keep keyboard focus on the menu toggle rather than a repurposed social action.
      dock.current.querySelector<HTMLButtonElement>(`[data-slot="${mode === 'home' ? 'secondary' : 'primary'}"]`)?.focus({ preventScroll: true });
    }
    previousMode.current = mode;
  }, [mode]);
  function toggleSocial() {
    uiSound.play('click'); setSocialOpen(value => !value); setStatus('');
  }
  async function copyEmail() {
    setStatus(profile.email);
    try { await navigator.clipboard.writeText(profile.email); setStatus('Email copied'); uiSound.play('confirm'); }
    catch { setStatus(profile.email); }
  }
  function openSocial(url: string) { uiSound.play('click'); window.open(url, '_blank', 'noopener,noreferrer'); }
  let actions: Action[];
  if (project) {
    const next = projects[(projects.indexOf(project) + 1) % projects.length];
    actions = [
      { slot: 'primary', label: `Next project: ${next.title}`, icon: 'next', onClick: () => navigate(`/project/${next.slug}`), preview: next.cover ? { src: next.cover, title: next.title } : undefined },
      { slot: 'secondary', label: 'Minimise project', icon: 'collapse', onClick: () => navigate('/') },
    ];
  } else if (contacts) {
    actions = [
      { slot: 'primary', label: about ? 'Back to Home' : 'Close Social Links', icon: 'back', active: true, expanded: about ? undefined : true, onClick: about ? () => navigate('/') : toggleSocial },
      { slot: 'secondary', label: 'Copy email', icon: status === 'Email copied' ? 'check' : 'mail', success: status === 'Email copied', onClick: copyEmail },
      { slot: 'x', label: 'X (Twitter)', icon: 'x', onClick: () => openSocial(profile.social.x) },
      { slot: 'linkedin', label: 'LinkedIn', icon: 'linkedin', onClick: () => openSocial(profile.social.linkedin) },
    ];
  } else {
    actions = [
      { slot: 'primary', label: 'Open About Page', icon: 'person', onClick: () => navigate('/about') },
      { slot: 'secondary', label: 'Open Social Links', icon: 'chat', expanded: false, onClick: toggleSocial },
    ];
  }
  if (!home && !about && !project) return null;
  return <ViewportLayer><motion.div layoutRoot className="navigation-anchor">
    <motion.nav ref={dock} layout={!reduced} layoutDependency={mode} initial={false}
      transition={{ layout: reduced ? { duration: 0 } : spring }}
      style={{ borderRadius: 26, boxShadow: '0 12px 30px #18233312, inset 0 1px 0 #fff' }}
      className={`navigation-dock ${project ? 'project-controls' : 'identity-controls'} ${contacts ? 'social-open' : ''}`}
      aria-label={project ? 'Project controls' : 'Main navigation'} data-mode={mode}
      onKeyDown={event => {
        if (event.key === 'Escape' && home && socialOpen) { event.stopPropagation(); setSocialOpen(false); setStatus(''); }
      }}>
      <AnimatePresence initial={false} mode="popLayout">
        {actions.map(action => <NavigationControl key={action.slot} action={action} reduced={reduced}/>)}
      </AnimatePresence>
      <span role="status" className="contact-status">{status}</span>
    </motion.nav>
  </motion.div></ViewportLayer>;
}
