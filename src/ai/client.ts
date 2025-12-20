import type { AssistantMessage, Profile, Project, TimelineItem } from '../types';
import { createAssistant } from './assistant';

export interface AssistantClient {
  ask(question: string): Promise<AssistantMessage>;
}

export class LocalAssistantClient implements AssistantClient {
  private assistant: ReturnType<typeof createAssistant>;

  constructor(context: { profile: Profile; projects: Project[]; timeline: TimelineItem[] }) {
    this.assistant = createAssistant(context);
  }

  async ask(question: string): Promise<AssistantMessage> {
    const content = this.assistant.answer(question);
    return { role: 'assistant', content };
  }
}
