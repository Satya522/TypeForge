export type NavItem = {
  href: string;
  label: string;
  description?: string;
};

export type BrowseColumnData = {
  id: string;
  title: string;
  links: NavItem[];
};

export const primaryNavLinks: NavItem[] = [
  { href: '/learn', label: 'Learn' },
  { href: '/practice', label: 'Practice' },
  { href: '/map', label: 'Roadmap' },
  { href: '/games', label: 'Games' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/community', label: 'Community' },
];

export const browseAllSectionsLink: NavItem = {
  href: '/map',
  label: 'Browse all sections',
};

export const browseColumns: BrowseColumnData[] = [
  {
    id: 'learn',
    title: 'Learn',
    links: [
      { href: '/learn', label: 'Learning Paths', description: 'Structured routes for every skill level' },
      { href: '/learn/home-row', label: 'Home Row', description: 'Foundational drills for finger placement' },
      { href: '/learn/beginner', label: 'Beginner Lessons', description: 'Start with rhythm, posture, and basics' },
      { href: '/learn/advanced', label: 'Advanced Lessons', description: 'Push speed, flow, and precision further' },
      { href: '/story-mode', label: 'Story Mode', description: 'Narrative-driven practice with progression' },
    ],
  },
  {
    id: 'practice',
    title: 'Practice',
    links: [
      { href: '/custom-practice', label: 'Custom Practice', description: 'Paste your own text and drill it fast' },
      { href: '/code-practice', label: 'Code Practice', description: 'Type real developer snippets cleanly' },
      { href: '/ai-practice', label: 'AI Practice', description: 'Generate fresh material on demand' },
      { href: '/dictation', label: 'Dictation', description: 'Train with speech-led listening input' },
      { href: '/race', label: 'Race', description: 'Compete in quick live typing runs' },
    ],
  },
  {
    id: 'compete',
    title: 'Compete',
    links: [
      { href: '/leaderboard', label: 'Leaderboard', description: 'See where you rank across sessions' },
      { href: '/tournaments', label: 'Tournaments', description: 'Join scheduled events and brackets' },
      { href: '/achievements', label: 'Achievements', description: 'Unlock badges and streak milestones' },
      { href: '/achievements?view=challenges', label: 'Challenges', description: 'Try focused goals and milestone sprints' },
      { href: '/subscription', label: 'Premium', description: 'Access advanced tools and future perks' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    links: [
      { href: '/code-editor', label: 'Editor', description: 'Focused workspace for code typing' },
      { href: '/extension', label: 'Extension', description: 'Bring drills directly into your browser' },
      { href: '/languages', label: 'Languages', description: 'Switch layouts and script support' },
      { href: '/settings', label: 'Settings', description: 'Tune your profile, sound, and experience' },
      { href: '/ar', label: 'AR Lab', description: 'Explore experimental spatial practice ideas' },
    ],
  },

];

export const userNavLinks: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/analytics', label: 'Analytics' },
];

function normalizeNavPath(href: string) {
  return href.split('?')[0];
}

export function isNavPathActive(pathname: string, href: string) {
  const normalizedHref = normalizeNavPath(href);

  if (normalizedHref === '/') return pathname === '/';
  return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
}

export function isBrowsePathActive(pathname: string) {
  const primaryPaths = new Set(primaryNavLinks.map((link) => normalizeNavPath(link.href)));
  const browseExclusivePaths = browseColumns
    .flatMap((column) => column.links)
    .map((link) => normalizeNavPath(link.href))
    .filter((href) => !primaryPaths.has(href));

  return browseExclusivePaths.some((href) => pathname === href || pathname.startsWith(`${href}/`));
}

export function getCurrentNavLabel(pathname: string) {
  if (pathname === '/') return 'Home';

  const directMatch = [...primaryNavLinks, ...userNavLinks].find((link) => isNavPathActive(pathname, link.href));
  if (directMatch) return directMatch.label;

  const browseMatch = browseColumns
    .flatMap((column) => column.links)
    .find((link) => isNavPathActive(pathname, link.href));

  if (browseMatch) return browseMatch.label;

  return 'Home';
}
