import type { Profile, Project, TimelineItem } from '../types';

type AssistantContext = {
  profile: Profile;
  projects: Project[];
  timeline: TimelineItem[];
};

type Scored<T> = { item: T; score: number };

export function createAssistant({ profile, projects, timeline }: AssistantContext) {
  const profileText = [
    profile.name,
    profile.program,
    profile.location,
    ...profile.researchInterests,
    ...profile.affiliations,
    ...profile.coursework,
    ...profile.skills.programmingData,
    ...profile.skills.embeddedHardware,
    ...profile.skills.imaging3DXR
  ].join(' ').toLowerCase();

  const projectIndex = projects.map(project => ({
    project,
    text: [
      project.title,
      project.category,
      project.status,
      project.summary,
      project.problem,
      project.location,
      ...project.contributions,
      ...project.techStack,
      ...project.outcomes
    ].join(' ').toLowerCase()
  }));

  const timelineIndex = timeline.map(item => ({
    item,
    text: [item.type, item.title, item.details, item.location, item.year].join(' ').toLowerCase()
  }));

  function answer(question: string) {
    const query = question.trim().toLowerCase();
    const tokens = tokenize(query);

    if (!tokens.length) {
      return 'Try asking about a specific project, publication, or research interest.';
    }

    const projectScores = projectIndex.map(entry => ({
      item: entry.project,
      score: scoreText(tokens, entry.text)
    }));

    const timelineScores = timelineIndex.map(entry => ({
      item: entry.item,
      score: scoreText(tokens, entry.text)
    }));

    const profileScore = scoreText(tokens, profileText);

    const topProject = topScore(projectScores);
    const topTimeline = topScore(timelineScores);

    if (query.includes('publication') || query.includes('paper') || query.includes('thesis')) {
      return formatPublications(timeline);
    }

    if (query.includes('talk') || query.includes('exhibition') || query.includes('award')) {
      return formatTimeline(timeline);
    }

    if (query.includes('skill') || query.includes('interest') || query.includes('research')) {
      return formatProfile(profile);
    }

    if (topProject && topProject.score >= Math.max(profileScore, topTimeline?.score || 0)) {
      return formatProject(topProject.item);
    }

    if (topTimeline && topTimeline.score > 0) {
      return formatTimelineItem(topTimeline.item);
    }

    return `Danyal's work spans ${profile.researchInterests.join(', ')}. You can ask about a specific project or publication for more detail.`;
  }

  return { answer };
}

function tokenize(query: string) {
  return query
    .split(/\s+/)
    .map(token => token.replace(/[^a-z0-9-]/g, ''))
    .filter(token => token.length > 2);
}

function scoreText(tokens: string[], text: string) {
  return tokens.reduce((score, token) => (text.includes(token) ? score + 1 : score), 0);
}

function topScore<T>(items: Scored<T>[]): Scored<T> | null {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  return sorted[0]?.score ? sorted[0] : null;
}

function formatProject(project: Project) {
  return `${project.title} (${project.category}) - ${project.summary} Contributions: ${project.contributions.slice(0, 2).join('; ')}. Outcomes: ${project.outcomes.join('; ')}.`;
}

function formatPublications(items: TimelineItem[]) {
  const pubs = items.filter(item => item.type === 'Publication' || item.type === 'Thesis');
  return pubs
    .map(item => `${item.title} - ${item.details} (${item.year}).`)
    .join(' ');
}

function formatTimeline(items: TimelineItem[]) {
  const entries = items.filter(item => item.type !== 'Publication' && item.type !== 'Thesis');
  return entries
    .slice(0, 4)
    .map(item => `${item.year}: ${item.title} (${item.location}).`)
    .join(' ');
}

function formatTimelineItem(item: TimelineItem) {
  return `${item.title} (${item.type}, ${item.year}) - ${item.details}`;
}

function formatProfile(profile: Profile) {
  return `${profile.program}. Research interests include ${profile.researchInterests.join(', ')}. Skills include ${profile.skills.programmingData.slice(0, 3).join(', ')}.`;
}
