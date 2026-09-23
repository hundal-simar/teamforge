import { createTaskTool, allTools } from "./tools.js"; 
import { executeTool } from "./toolExecutor.js";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function fetchWithTimeout(url, options, timeoutMs = 60000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Gemini API request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}


function buildContents(history) {
  return history.map((message) => ({
    role: message.role,
    parts: [{ text: message.content }]
  }));
}

// Non-streaming chat call
export async function askGemini(history) {
  const url =
    `${BASE}/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: buildContents(history),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gemini API error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned no text response.");
  }

  return text;
}

// Streaming chat call
// onChunk(text) is called whenever new text arrives.
// signal is optional and allows cancellation via AbortController.
export async function streamGemini(
  history,
  onChunk,
  signal
) {
  const url =
    `${BASE}/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`;

  

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: buildContents(history),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    }),
    signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gemini API error ${response.status}: ${errorText}`
    );
  }

  if (!response.body) {
    throw new Error("No response stream received from Gemini.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, {
      stream: true
    });

    const lines = buffer.split("\n");

    // Keep incomplete line for next chunk
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) {
        continue;
      }

      const payload = line.slice(6).trim();

      if (!payload) {
        continue;
      }

      try {
        const json = JSON.parse(payload);

        const text =
          json.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          onChunk(text);
        }
      } catch {
        // Ignore malformed SSE events
      }
    }
  }

  // Process any remaining buffered data
  if (buffer.startsWith("data: ")) {
    try {
      const json = JSON.parse(buffer.slice(6).trim());

      const text =
        json.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        onChunk(text);
      }
    } catch {
      // Ignore trailing malformed data
    }
  }
}

export async function getEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text }] }
    })
  });

  const data = await response.json();
  return data.embedding.values; 
}

async function askWithTools(userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      tools: allTools
    })
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2)); // inspect the raw shape
  return data.candidates[0].content.parts[0];
}

async function chatWithTools(history, userId) {
  const url =
    `${BASE}/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

 const contents = history.map(msg => ({
  role: msg.role,
  parts: [
    {
      text: msg.content
    }
  ]
}));

  const toolsUsed = [];

  for (let i = 0; i < 5; i++) {
    console.log(`--- Gemini Step ${i + 1} ---`);

    console.log("Sending to Gemini:");
    console.log(
      JSON.stringify(
      {
      contents,
      //tools: allTools
     },
     null,
     2
    )
  );
    const response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents,
          tools: allTools
        })
      },
      30000
    ).then(r => r.json());

    if (response.error) {
      throw new Error(response.error.message);
   }

    console.log("FULL RESPONSE after gemini:");
    console.log(JSON.stringify(response, null, 2));

    if (!response.candidates?.length) {
      console.error("Gemini error:", response.error);

      return {
        reply:
          response.error?.message ||
          "Assistant encountered an error.",
        toolsUsed
      };
    }

    const modelContent = response.candidates[0].content;
    const part = modelContent.parts?.[0];

    if (!part) {
      return {
        reply: "Assistant returned an empty response.",
        toolsUsed
      };
    }

    // Final answer from Gemini
    if (!part.functionCall) {
      return {
        reply: part.text || "No response generated.",
        toolsUsed
      };
    }

    let result;
    console.log('before tool execution');

    try {
      result = await executeTool(
        part.functionCall.name,
        part.functionCall.args,
        userId
      );
    } catch (err) {
      console.error("Tool crashed:", err);

      result = {
        success: false,
        reason: "tool_execution_failed",
        message: err.message
      };
    }

    console.log("Tool result:", result);

    toolsUsed.push({
      name: part.functionCall.name,
      args: part.functionCall.args,
      result
    });

    // Preserve Gemini response exactly
    contents.push(modelContent);

    // Send tool result back to Gemini
    contents.push({
      role: "user",
      parts: [
        {
          functionResponse: {
            id: part.functionCall.id,
            name: part.functionCall.name,
            response: result
          }
        }
      ]
    });

    console.log("Updated contents for next Gemini call:", JSON.stringify(contents, null, 2));
  }

  return {
    reply: "I wasn't able to complete that after several steps.",
    toolsUsed
  };
}

export { chatWithTools };