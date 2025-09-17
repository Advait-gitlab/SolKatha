// src/services/geminiAPI.js
// Wrapper around Google Gemini API to act as Shri Krishna

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomVerse } from "./gita";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("⚠️ Gemini API key missing. Add VITE_GEMINI_API_KEY to .env");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generates a Krishna-style response using Gemini.
 * Automatically includes a random Gita verse for context.
 * @param {string} userInput - The user's message
 * @returns {Promise<{response: string, verse: object}>}
 */
export async function generateKrishnaResponse(userInput) {
  try {
    const verse = getRandomVerse();

    // Prompt persona + verse + commentary context
    const prompt = `
You are Shri Krishna, the Divine Guide of Arjuna.
Your tone is wise, compassionate, and clear.
Speak directly, using simple metaphors from life if needed.

Use the following Bhagavad Gita verse and commentary as inspiration:
Verse (Chapter ${verse.chapter}, Verse ${verse.verse}):
"${verse.text}"

Translation: ${verse.translation}

Commentary by ${verse.author || "traditional commentary"}: ${verse.commentary}

User's question: "${userInput}"

Answer as Krishna would, in a few thoughtful lines.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return { response: text, verse };
  } catch (err) {
    console.error("Gemini API error:", err);
    return {
      response: "I am with you, but something went wrong with my connection.",
      verse: null
    };
  }
}
