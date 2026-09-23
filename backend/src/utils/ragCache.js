import crypto from "crypto";
import redis from "../config/redis.js";
import { retrieveAndAnswer } from "./rag.js"; 
import { AI_CONFIG } from "../config/aiConfig.js";      

const CACHE_TTL_SECONDS = AI_CONFIG.cache.ttlSeconds;

function buildCacheKey(question) {
  const normalized = question.trim().toLowerCase().replace(/\s+/g, " ");
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return `rag:answer:${hash}`;
}

export async function cachedRetrieveAndAnswer(question, retrieveAndAnswer) {
  const key = buildCacheKey(question);
  const start = Date.now();

  const cached = await redis.get(key);
  if (cached) {
    console.log(`[cache HIT] ${Date.now() - start}ms`);
    return { ...JSON.parse(cached), cached: true };
  }

  const result = await retrieveAndAnswer(question);
  console.log(`[cache MISS] ${Date.now() - start}ms`);

  await redis.setEx(key, CACHE_TTL_SECONDS, JSON.stringify(result));
  return { ...result, cached: false };
}