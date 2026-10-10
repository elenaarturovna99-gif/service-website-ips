const COUNTER_ID = 113593674;

type Ym = (id: number, method: string, ...args: unknown[]) => void;

const getYm = (): Ym | undefined => (window as unknown as { ym?: Ym }).ym;

export const reachGoal = (goal: string, params?: Record<string, unknown>) => {
  getYm()?.(COUNTER_ID, "reachGoal", goal, params);
};

export const trackPageView = (url: string) => {
  getYm()?.(COUNTER_ID, "hit", url, { title: document.title, referer: document.referrer });
};
