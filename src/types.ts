export type Profile = {
  name: string;
  email: string;
  website: string;
  location: string;
  program: string;
  researchInterests: string[];
  affiliations: string[];
  coursework: string[];
  skills: {
    programmingData: string[];
    embeddedHardware: string[];
    imaging3DXR: string[];
  };
};

export type Project = {
  id: string;
  title: string;
  category: 'Research' | 'Hardware' | 'Artistic' | 'Coursework' | string;
  status: string;
  startDate: {
    label: string;
    precision: 'approx' | 'exact' | string;
  };
  location: string;
  summary: string;
  problem: string;
  contributions: string[];
  techStack: string[];
  outcomes: string[];
  links: {
    github: string | null;
    demo: string | null;
    paper: string | null;
  };
  gallery: {
    src: string;
    alt: string;
  }[];
};

export type TimelineItem = {
  type: string;
  year: string;
  title: string;
  details: string;
  location: string;
};

export type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type QualityLevel = 'auto' | 'high' | 'low';
