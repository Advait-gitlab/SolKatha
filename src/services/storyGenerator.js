import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const generateStory = async (input) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Create a short Mahabharata-inspired story where Krishna advises Arjuna on "${input}". Keep it under 100 words, culturally resonant, and end with a positive lesson.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const getMultiModalAssets = (input) => {
  // Mock assets (replace with real API calls later)
  const imageUrl = `https://via.placeholder.com/300?text=${encodeURIComponent(input)}`; // Placeholder for Imagen
  const audioUrl = ""; // Placeholder for raga; add public MP3 URL or Web Audio API
  const artPrompt = `Draw a scene of Krishna guiding Arjuna in a ${input} context.`;
  return { imageUrl, audioUrl, artPrompt };
};