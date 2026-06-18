/** Browser-local favorite bridge ids. */
const KEY = "cruceep.favoriteBridges";

export const favoriteBridges = {
  list(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  toggle(id: string): string[] {
    const current = favoriteBridges.list();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    return next;
  },
};
