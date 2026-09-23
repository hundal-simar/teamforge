import express from "express";
import Conversation from "../models/Conversation.js";
import { askGemini, streamGemini, chatWithTools } from "../utils/geminiClient.js";
import { chatRateLimit } from "../middlewares/chatRateLimit.js";
import { retrieveAndAnswer } from "../utils/rag.js";
import { cachedRetrieveAndAnswer } from "../utils/ragCache.js";
import protect from "../middlewares/protect.js";

const router = express.Router();


router.post("/", protect, chatRateLimit, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id; 

    let conversation = req.params.conversationId
      ? await Conversation.findById(req.params.conversationId)
      : await Conversation.create({ userId, messages: [] });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.messages.push({ role: "user", content: message });

    const reply = await askGemini(conversation.messages);

    conversation.messages.push({ role: "model", content: reply });
    await conversation.save();

    res.json({ conversationId: conversation._id, reply });
  } catch (err) {
    console.error(err);
    res.status(err.message?.includes("429") ? 429 : 500).json({
      error: "Assistant is a bit busy, try again in a moment."
    });
  }
});


router.post("/stream", protect, chatRateLimit, async (req, res) => {
  const { message } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    await streamGemini(
      [{ role: "user", content: message }],
      piece => res.write(`data: ${JSON.stringify({ text: piece })}\n\n`)
    );
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error(err);
    res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    res.end();
  }

  req.on("close", () => res.end());
});

router.post("/ask-docs", protect, chatRateLimit, async (req, res) => {
  try {
    const { question } = req.body;
    const result = await cachedRetrieveAndAnswer(question, retrieveAndAnswer);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Assistant is a bit busy, try again in a moment." });
  }
});



router.post("/assistant", protect, chatRateLimit, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    let conversation;
    if (conversationId) {
       conversation =
       await Conversation.findById(
       conversationId
    );
  }

    if (!conversation) {
      conversation =
      await Conversation.create({
      userId: req.user._id,
      messages: []
    });
  }

  conversation.messages.push({
     role: "user",
     content: message
  });

    const { reply, toolsUsed } = await chatWithTools(conversation.messages, req.user._id);

    conversation.messages.push({
      role: "model",
      content: reply
    });
    await conversation.save();

    res.json({ reply, toolsUsed, conversationId: conversation._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Assistant is a bit busy, try again in a moment." });
  }
});

router.post("/:conversationId", protect, chatRateLimit, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id; 

    let conversation = req.params.conversationId
      ? await Conversation.findById(req.params.conversationId)
      : await Conversation.create({ userId, messages: [] });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.messages.push({ role: "user", content: message });

    const reply = await askGemini(conversation.messages);

    conversation.messages.push({ role: "model", content: reply });
    await conversation.save();

    res.json({ conversationId: conversation._id, reply });
  } catch (err) {
    console.error(err);
    res.status(err.message?.includes("429") ? 429 : 500).json({
      error: "Assistant is a bit busy, try again in a moment."
    });
  }
});


export default router;