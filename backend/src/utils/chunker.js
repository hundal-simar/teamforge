import { AI_CONFIG } from "../config/aiConfig.js"

function chunkText(text, maxChunkSize = AI_CONFIG.chunking.maxChunkSize, overlap = AI_CONFIG.chunking.overlap) {
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length <= maxChunkSize) {
      current = current ? current + "\n\n" + para : para;
    } else {
      if (current) chunks.push(current);

      if (para.length > maxChunkSize) {
        // paragraph itself too big — hard split with overlap
        let start = 0;
        while (start < para.length) {
          chunks.push(para.slice(start, start + maxChunkSize));
          start += maxChunkSize - overlap;
        }
        current = "";
      } else {
        current = para;
      }
    }
  }
  if (current) chunks.push(current);

  return chunks;
}

export { chunkText };