/**
 * In-memory sliding-window counter: at most `limit` events per key within
 * `windowMs`. Enough for one server process; reset on restart.
 */
export class RateLimit {
  private readonly events = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** Whether the key is still under its limit (without counting a new event). */
  allowed(key: string, now = Date.now()): boolean {
    return this.recent(key, now).length < this.limit;
  }

  hit(key: string, now = Date.now()): void {
    const list = this.recent(key, now);
    list.push(now);
    this.events.set(key, list);
    if (this.events.size > 10_000) this.prune(now);
  }

  reset(key: string): void {
    this.events.delete(key);
  }

  private recent(key: string, now: number): number[] {
    return (this.events.get(key) ?? []).filter((t) => now - t < this.windowMs);
  }

  private prune(now: number): void {
    for (const [key, list] of this.events) {
      if (list.every((t) => now - t >= this.windowMs)) this.events.delete(key);
    }
  }
}
