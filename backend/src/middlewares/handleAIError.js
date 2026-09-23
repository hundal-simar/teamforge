export function handleAIError(err, res) {
  console.error(err);

  if (err.message?.includes("timed out")) {
    return res.status(504).json({ error: "The assistant took too long to respond. Please try again." });
  }
  if (err.message?.includes("429")) {
    return res.status(429).json({ error: "Assistant is a bit busy, try again in a moment." });
  }
  return res.status(500).json({ error: "Something went wrong. Please try again." });
}

