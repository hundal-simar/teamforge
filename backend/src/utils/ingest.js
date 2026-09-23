import mongoose from "mongoose";
import KnowledgeChunk from "./models/KnowledgeChunk.js";
import { chunkText } from "./chunker.js";     
import { getEmbedding } from "./geminiClient.js"; 

async function ingestDocument(documentText, sourceRef) {
  const chunks = chunkText(documentText);

  for (const chunk of chunks) {
    const vector = await getEmbedding(chunk);
    await KnowledgeChunk.create({
      text: chunk,
      embedding: vector,
      sourceRef
    });
  }

  console.log(`Ingested ${chunks.length} chunks from ${sourceRef}`);
}

await mongoose.connect(process.env.MONGO_URI);
await ingestDocument(sampleDoc, "readme.md");
await mongoose.disconnect();