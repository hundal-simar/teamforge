import mongoose from "mongoose";
import KnowledgeChunk from "../models/KnowledgeChunk.js";
import { getEmbedding } from "./geminiClient.js"; 
import { AI_CONFIG } from "../config/aiConfig.js";

async function retrieveRelevantChunks(question, limit = AI_CONFIG.retrieval.limit) {
  const queryVector = await getEmbedding(question);

  const results = await KnowledgeChunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",        
        path: "embedding",
        queryVector,
        numCandidates: AI_CONFIG.retrieval.numCandidates,
        limit
      }
    },
    {
      $project: {
        text: 1,
        sourceRef: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]);

  return results;
}

export { retrieveRelevantChunks };