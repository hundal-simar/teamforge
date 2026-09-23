import mongoose from "mongoose";

const knowledgeChunkSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    embedding: { type: [Number], required: true }, 
    sourceRef: { type: String } 
  },
  { timestamps: true }
);

export default mongoose.model("KnowledgeChunk", knowledgeChunkSchema);