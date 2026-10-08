import { getStore } from '@netlify/blobs';

export type GameResponse = {
  id: string;
  startedAt: string;
  completedAt: string;
  attempts: string;
  accepted: boolean;
  chases: number;
};

type Acceptance = { chases: number };

function responseStore() {
  // The local SDK server uses the same storage protocol as hosted Netlify Blobs.
  // Production gets its authenticated site context from Netlify's Next.js adapter.
  const local = !process.env.NETLIFY && process.env.LOCAL_BLOBS_URL;
  return getStore({
    name: 'wonder-woman-responses',
    consistency: 'strong',
    ...(local ? {
      edgeURL: local,
      uncachedEdgeURL: local,
      siteID: 'aida-local',
      token: process.env.LOCAL_BLOBS_TOKEN ?? '',
    } : {}),
  });
}

export async function saveResponse(row: GameResponse) {
  const store = responseStore();
  await store.setJSON(`game-${row.id}`, { ...row, accepted: false, chases: 0 }, { onlyIfNew: true });
  // Separate immutable acceptance records prevent a delayed quiz save from
  // overwriting an acceptance, including concurrent retries across functions.
  if (row.accepted) {
    await store.setJSON(`accepted-${row.id}`, { chases: row.chases }, { onlyIfNew: true });
  }
}

export async function listResponses(): Promise<GameResponse[]> {
  const store = responseStore();
  const [{ blobs }, acceptances] = await Promise.all([
    store.list({ prefix: 'game-' }),
    store.list({ prefix: 'accepted-' }),
  ]);
  const acceptedKeys = new Set(acceptances.blobs.map(({ key }) => key));
  const records: GameResponse[] = [];
  // Limit concurrency when retrieving records, then return the latest 100.
  for (let i = 0; i < blobs.length; i += 20) {
    const batch = await Promise.all(blobs.slice(i, i + 20).map(async ({ key }) => {
      const row = await store.get(key, { type: 'json' }) as GameResponse | null;
      if (!row) return null;
      const acceptance = acceptedKeys.has(`accepted-${row.id}`)
        ? await store.get(`accepted-${row.id}`, { type: 'json' }) as Acceptance | null
        : null;
      return { ...row, accepted: Boolean(acceptance), chases: acceptance?.chases ?? 0 };
    }));
    for (const row of batch) if (row) records.push(row);
  }
  return records.sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 100);
}
