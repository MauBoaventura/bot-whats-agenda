import { ConversationState } from './flows/conversation-state.enum';

// session.manager.ts
export class SessionManager {
  private sessions: Map<string, { state: ConversationState; data: any }> =
    new Map();

  getState(userId: string): ConversationState {
    return this.sessions.get(userId)?.state || ConversationState.NONE;
  }

  setState(userId: string, state: ConversationState): void {
    const currentSession = this.sessions.get(userId) || { data: {} };
    this.sessions.set(userId, { ...currentSession, state });
  }

  getData(userId: string): any {
    return this.sessions.get(userId)?.data || {};
  }

  setData(userId: string, data: any): void {
    const currentState = this.getState(userId);
    this.sessions.set(userId, { state: currentState, data });
  }

  resetState(userId: string): void {
    this.sessions.delete(userId);
  }

  updateData(userId: string, newData: any): void {
    const currentData = this.getData(userId);
    this.setData(userId, { ...currentData, ...newData });
  }
}
