export const AI_CONFIG = {
  model: {
    chat: "gemini-3.6-flash",
    embedding: "text-embedding-004"
  },
  chunking: {
    maxChunkSize: 500,
    overlap: 50
  },
  retrieval: {
    numCandidates: 100,
    limit: 6,
    minScoreThreshold: 0.65
  },
  cache: {
    ttlSeconds: 60 * 60
  },
  rateLimit: {
    windowMs: 60 * 1000,
    maxPerWindow: 10
  },
  request: {
    timeoutMs: 10000
  },
  toolLoop: {
    maxIterations: 5
  }
};