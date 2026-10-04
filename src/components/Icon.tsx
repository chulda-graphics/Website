type IconName = 'person' | 'chat' | 'back' | 'mail' | 'x' | 'linkedin' | 'info' | 'external' | 'collapse';

export function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    person: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3-7 7-7s7 3 7 7"/></>,
    chat: <><path d="M20 11.5a8 8 0 0 1-8 8H5l-2 1 1.5-5A8 8 0 1 1 20 11.5Z"/><path d="M8 10h.01M14 10h.01M8 14h6"/></>,
    back: <path d="m14 6-6 6 6 6"/>,
    mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 7 8 6 8-6"/></>,
    x: <><path d="m5 4 14 16H15L1 4h4Z" transform="translate(2)"/><path d="m19 4-14 16"/></>,
    linkedin: <><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 10v7m0-10v.1M12 17v-7m0 3c0-4 5-4 5 0v4"/></>,
    info: <><circle cx="12" cy="12" r="8"/><path d="M12 11v5m0-9v.1"/></>,
    external: <><path d="M13 4h7v7m0-7-9 9M9 5H4v15h15v-5"/></>,
    collapse: <><path d="m3 3 6 6m0-5v5H4m17-6-6 6m5 0h-5V4M3 21l6-6m-5 0h5v5m12 1-6-6m0 5v-5h5"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
