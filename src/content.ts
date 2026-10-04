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
  duration?: string;
  coverTone?: 'light' | 'dark';
  url?: string;
  sections: { title: string; body: string }[];
}

const videoHost = 'https://pub-8843028733224946913b21df4054c3ae.r2.dev';

export const projects: Project[] = [
  {
    slug: 'project-01', title: 'Frameshot AI', category: 'Introduction Film',
    color: '#101010', accent: '#eeeeee', cover: '/assets/projects/frameshot.jpg', duration: '0:22',
    video: `${videoHost}/Frameshot%20AI%20Introduction%20Video.mp4`,
    sections: [{ title: 'Overview', body: 'An introduction to Frameshot AI, combining kinetic typography, interface details, and a connected workflow for characters, continuity, and AI trailers.' }],
  },
  {
    slug: 'project-02', title: 'Higgsfield', category: 'Avoid AI Slop',
    color: '#151512', accent: '#eeeeee', cover: '/assets/projects/higgsfield.jpg', duration: '0:54',
    video: `${videoHost}/Higgsfield%20Avoid%20AI%20Slop%20Clean_1.mp4`,
    sections: [{ title: 'Overview', body: 'A Seedance 2.5 showcase for Higgsfield. Character-led city scenes and product overlays follow the journey from a reference image to a finished sequence.' }],
  },
  {
    slug: 'project-03', title: 'Moodboards & Storyboards', category: 'Product Film',
    color: '#101010', accent: '#eeeeee', cover: '/assets/projects/moodboards.jpg', duration: '0:38',
    video: `${videoHost}/Moodboards%20%26%20Storyboards%20Final%202.mp4`,
    sections: [{ title: 'Overview', body: 'A StillSearch product film about turning visual references into moodboards and storyboards, moving from search and composition to camera direction and export.' }],
  },
  {
    slug: 'project-04', title: 'StillSearch', category: 'Launch Film',
    color: '#101010', accent: '#eeeeee', cover: '/assets/projects/stillsearch.jpg', duration: '0:40',
    video: `${videoHost}/StillSearch%20Launch%20Video.mp4`,
    sections: [{ title: 'Overview', body: 'A launch film for StillSearch, introducing visual search through composition, subjects, image references, and frames shared by the community.' }],
  },
  {
    slug: 'project-05', title: 'Demo Reel 2026', category: 'Selected Work',
    color: '#f6f6f6', accent: '#eeeeee', cover: '/assets/projects/reel.jpg', coverTone: 'light', duration: '0:38',
    video: `${videoHost}/Video%20Demo%20Reel%202026.mp4`,
    sections: [{ title: 'Overview', body: 'A selection of graphic design, motion graphics, video editing, brand identity, and AI-assisted design, brought together in one reel.' }],
  },
];

// These paths are exported from the editable local Blender source.
export const assets = {
  globe: '/assets/models/globe-relief-v3.glb',
  cursor: '/assets/models/cursor-v2.glb',
};

// Off until a locally selected sound has been reviewed and added.
export const audio = { enabled: false, navigation: '' };
