/** Replace content here without editing the layout or interaction components. */
export const profile = {
  name: 'Dhrex Cañezo',
  title: 'Motion Designer',
  email: 'chulda.graphics2022@gmail.com',
  social: { x: 'https://x.com/dhrexinmotion', linkedin: 'https://www.linkedin.com/in/dhrex-cañezo' },
  introductionLead: 'Motion Designer',
  introduction: 'focused on creating thoughtful visual experiences through motion, design, and storytelling.',
  biography: 'I’m Dhrex Cañezo, a multimedia designer specialising in motion design, with a background in graphic design, branding, and creative direction. I enjoy turning ideas into clear, engaging visuals—combining strong design with purposeful movement.',
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
  stills?: { src: string; alt: string }[];
}

const videoHost = 'https://pub-8843028733224946913b21df4054c3ae.r2.dev';

export const projects: Project[] = [
  {
    slug: 'project-01', title: 'Frameshot AI', category: 'Introduction Film',
    color: '#101010', accent: '#eeeeee', cover: '/assets/projects/frameshot.jpg', duration: '0:22',
    video: `${videoHost}/Frameshot%20AI%20Introduction%20Video.mp4`,
    stills: [
      { src: '/assets/work-frames/frameshot-4.jpg', alt: 'Film previews in the Frameshot AI workflow' },
      { src: '/assets/work-frames/frameshot-2.jpg', alt: 'Frameshot AI world and agent diagram' },
      { src: '/assets/work-frames/frameshot-3.jpg', alt: 'Connected creative workflow in Frameshot AI' },
    ],
    sections: [{ title: 'Overview', body: 'An introduction to Frameshot AI, combining kinetic typography, interface details, and a connected workflow for characters, continuity, and AI trailers.' }],
  },
  {
    slug: 'project-02', title: 'Higgsfield', category: 'Avoid AI Slop',
    color: '#151512', accent: '#eeeeee', cover: '/assets/projects/higgsfield.jpg', duration: '0:54',
    video: `${videoHost}/Higgsfield%20Avoid%20AI%20Slop%20Clean_1.mp4`,
    stills: [
      { src: '/assets/work-frames/higgsfield-2.jpg', alt: 'Character crossing a city bridge in the Higgsfield film' },
      { src: '/assets/work-frames/higgsfield-3.jpg', alt: 'Character beside a vending machine' },
      { src: '/assets/work-frames/higgsfield-4.jpg', alt: 'Riverside character scene from the Higgsfield film' },
    ],
    sections: [{ title: 'Overview', body: 'A Seedance 2.5 showcase for Higgsfield. Character-led city scenes and product overlays follow the journey from a reference image to a finished sequence.' }],
  },
  {
    slug: 'project-03', title: 'Moodboards & Storyboards', category: 'Product Film',
    color: '#101010', accent: '#eeeeee', cover: '/assets/projects/moodboards.jpg', duration: '0:38',
    video: `${videoHost}/Moodboards%20%26%20Storyboards%20Final%202.mp4`,
    stills: [
      { src: '/assets/work-frames/moodboards-3.jpg', alt: 'Visual reference collage in Moodboards and Storyboards' },
      { src: '/assets/work-frames/moodboards-2.jpg', alt: 'Tennis imagery used as a visual reference' },
      { src: '/assets/work-frames/moodboards-4.jpg', alt: 'Moodboard export interface' },
    ],
    sections: [{ title: 'Overview', body: 'A StillSearch product film about turning visual references into moodboards and storyboards, moving from search and composition to camera direction and export.' }],
  },
  {
    slug: 'project-04', title: 'StillSearch', category: 'Launch Film',
    color: '#101010', accent: '#eeeeee', cover: '/assets/projects/stillsearch.jpg', duration: '0:40',
    video: `${videoHost}/StillSearch%20Launch%20Video.mp4`,
    stills: [
      { src: '/assets/work-frames/stillsearch-3.jpg', alt: 'Community image grid in StillSearch' },
      { src: '/assets/work-frames/stillsearch-2.jpg', alt: 'Search beyond words typography from the StillSearch launch film' },
      { src: '/assets/work-frames/stillsearch-4.jpg', alt: 'StillSearch brand identity' },
    ],
    sections: [{ title: 'Overview', body: 'A launch film for StillSearch, introducing visual search through composition, subjects, image references, and frames shared by the community.' }],
  },
  {
    slug: 'project-05', title: 'Demo Reel 2026', category: 'Selected Work',
    color: '#171717', accent: '#eeeeee', cover: '/assets/projects/reel.jpg', duration: '0:38',
    video: `${videoHost}/Video%20Demo%20Reel%202026.mp4`,
    stills: [
      { src: '/assets/work-frames/reel-1.jpg', alt: 'Graphic design work presented in the 2026 demo reel' },
      { src: '/assets/work-frames/reel-2.jpg', alt: 'Brand design montage from the demo reel' },
      { src: '/assets/work-frames/reel-3.jpg', alt: 'AI-assisted design montage from the demo reel' },
    ],
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
