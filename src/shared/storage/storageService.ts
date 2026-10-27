import type { SessionResult, TaskConfig } from '../../features/trainer/types';
import { DEFAULT_CONFIG } from '../../features/trainer/levels';

const PROGRESS_KEY = 'mental-math-progress';
const USER_KEY = 'mental-math-user';

export interface UserProgress {
  currentConfig: TaskConfig;
  sessions: SessionResult[];
}

export const storageService = {
  // Работа с прогрессом
  async loadProgress(): Promise<UserProgress> {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return { currentConfig: DEFAULT_CONFIG, sessions: [] };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { currentConfig: DEFAULT_CONFIG, sessions: [] };
    }
  },

  async saveProgress(progress: UserProgress): Promise<void> {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  },

  async saveSession(session: SessionResult): Promise<void> {
    const progress = await this.loadProgress();
    progress.sessions.push(session);
    await this.saveProgress(progress);
  },

  // Работа с пользователем (Псевдо-авторизация)
  getUserName(): string | null {
    return localStorage.getItem(USER_KEY);
  },

  saveUserName(name: string): void {
    localStorage.setItem(USER_KEY, name);
  },

  logout(): void {
    localStorage.removeItem(USER_KEY);
  }
};