/** Replace content here without editing the layout or interaction components. */
export const profile = {
  name: 'Chulda Graphics',
  title: 'Designer',
  email: '',
  social: { x: '', linkedin: '' },
  introductionLead: 'Designer,',
  introduction: 'creating thoughtful digital experiences that bring together clear ideas, considered details, and interfaces that feel natural.',
  biography: 'More about my practice, background, and approach will be added here, along with selected collaborations and the thinking behind the work.',
  availability: 'For new projects and collaborations, get in touch.',
};

export interface Project {
  slug: string;
  title: string;
  category: string;
  color: string;
  accent: string;
  cover?: string;
  video?: string;
  url?: string;
  sections: { title: string; body: string }[];
}

export const projects: Project[] = [
  { slug: 'project-01', title: 'Project 01', category: 'Brand Experience', color: '#afb9b1', accent: '#eef0e8' },
  { slug: 'project-02', title: 'Project 02', category: 'Digital Experience', color: '#c9b8aa', accent: '#f4ece4' },
  { slug: 'project-03', title: 'Project 03', category: 'Art Direction', color: '#a6b5c3', accent: '#eaf0f3' },
  { slug: 'project-04', title: 'Project 04', category: 'Product Experience', color: '#c3c0a7', accent: '#f5f2e5' },
].map(project => ({
  ...project,
  sections: [
    { title: 'Mandate', body: 'Project overview coming soon. This space will introduce the brief, the context, and the goals behind the work.' },
    { title: 'Challenge', body: 'The key challenge and design constraints will be presented here, alongside the thinking that shaped the project.' },
    { title: 'Solution', body: 'The final approach, selected outcomes, and project details will be added here.' },
  ],
}));

// These paths are exported from the editable local Blender source.
export const assets = {
  globe: '/assets/models/globe-relief-v3.glb',
  cursor: '/assets/models/cursor-v2.glb',
};

// Off until a locally selected sound has been reviewed and added.
export const audio = { enabled: false, navigation: '' };
