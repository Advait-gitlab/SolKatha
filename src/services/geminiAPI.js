// src/services/geminiAPI.js
// Krishna-style AI responses (user-facing, natural text)

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomVerse } from "./gita";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("⚠️ Gemini API key missing. Add VITE_GEMINI_API_KEY to .env");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(model, prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if (error.message.includes("429") && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Rate limit hit, retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries reached");
}

/**
 * Format Gemini output for the user
 * - Removes section headers
 * - Combines text into natural paragraphs
 */
function formatUserResponse(rawText) {
  return rawText
    .replace(/🌸 Empathy: ?/g, "")
    .replace(/🪷 Guidance: ?/g, "")
    .replace(/📜 Verse: ?/g, "")
    .trim();
}

/**
 * Generates a Krishna-style response for the user
 * @param {string} userInput
 * @param {Array} history - previous messages [{role, content}]
 * @returns {Promise<{response: string, verse: object}>}
 */
export const generateKrishnaResponse = async (userInput, history = []) => {
  try {
    const verse = getRandomVerse();

    // Detect if user wants a verse or motivation
    const wantsVerse = /(verse|motivate|quote)/i.test(userInput);

    const historyText = history
      .slice(-3)
      .map((msg) => `${msg.role === "user" ? "Arjuna" : "Krishna"}: ${msg.content}`)
      .join("\n");

    const prompt = `
You are Shri Krishna, as portrayed by Saurabh Raj Jain in Mahabharat (2013-2014).
Speak as if personally addressing Arjuna/Parth, directly and intimately.
- Your tone is calm, warm, deep, and measured, with a slow, meditative rhythm.
- Acknowledge feelings first, then guide with gentle firmness.
- Include subtle humor or playful hints when appropriate.
- Use varied, grounded analogies (clouds, rivers, gardens, kites, clay, sun, wind) and rotate them; do not repeat the same metaphor as in the last 4 turns.
- Always include one actionable first step the user can do *right now*; embed it naturally in the story or metaphor.
- Include a Bhagavad Gita verse only if the user explicitly asks for motivation, and weave it naturally into the advice.
- Keep responses concise, meditative, layered, and flowing like a conversation, not a list or tip sheet.

User input: "${userInput}"
Conversation history (last 5 turns):
${historyText}

Now respond as Shri Krishna, with all the above qualities.

${wantsVerse ? `Include this verse from the Bhagavad Gita:
Chapter ${verse.chapter}, Verse ${verse.verse}:
"${verse.text}"
Translation: "${verse.translation}"
Commentary: "${verse.commentary}"
` : ""}
`;

    const result = await generateWithRetry(model, prompt);
    const response = await result.response.text();
    return { response, sentiment: isNegative ? 'positive' : (isPositive ? 'positive' : 'neutral') };
  } catch (error) {
    console.error('Gemini API error:', error);
    return { response: 'Krishna is here to guide you. Please try again.', sentiment: '' };
  }
};