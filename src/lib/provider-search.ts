import { intents } from "./home-data";
import type { SearchOutcome } from "./assistant-task";

/** Searches the sample provider listings in home-data. These are mock records, not live availability. */
export function searchSampleListings(query: string | null): SearchOutcome {
  if (!query) {
    return {
      ok: false,
      error: "Tell me which kind of professional you need before I search.",
    };
  }
  const intent = intents.find((i) => i.tradeLabel === query);
  if (!intent) {
    return {
      ok: false,
      error: `Live search for ${query}s isn't connected yet, so I can't check who is available.`,
    };
  }
  return { ok: true, providers: [...intent.providers] };
}
