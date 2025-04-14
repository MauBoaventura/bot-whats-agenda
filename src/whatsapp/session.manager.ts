import { UserSession } from './flows/user-session.interface';
import { ConversationState } from './flows/conversation-state.enum';

export class SessionManager {
  private sessions = new Map<string, UserSession>();

  getSession(user: string): UserSession {
    return (
      this.sessions.get(user) ?? { state: ConversationState.NONE, data: {} }
    );
  }

  setSession(user: string, session: UserSession): void {
    this.sessions.set(user, session);
  }

  clearSession(user: string): void {
    this.sessions.delete(user);
  }
}
