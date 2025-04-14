import { ConversationState } from './conversation-state.enum';

export interface UserSession {
  state: ConversationState;
  data: {
    date?: string;
    time?: string;
  };
}
