import { GoogleGenerativeAI } from '@google/generative-ai';
import Sentiment from 'sentiment';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const sentimentAnalyzer = new Sentiment();

// Retry function with exponential backoff
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(model, prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if (error.message.includes('429') && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(`Rate limit hit, retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
}

export const generateKrishnaResponse = async (userMessage, history = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const sentimentScore = sentimentAnalyzer.analyze(userMessage).score;
    const isPositive = sentimentScore > 0;
    const isNegative = sentimentScore < 0;
    const historyText = history.slice(-3).map((msg) => `${msg.role === 'user' ? 'Arjuna' : 'Krishna'}: ${msg.content}`).join('\n');

    let prompt;
    if (isPositive) {
      prompt = `As Krishna, respond to Arjuna's positive message "${userMessage}" with an encouraging, upbeat tone, keeping it concise and natural, reflecting a divine yet relatable personality. Previous context: ${historyText}`;
    } else if (isNegative) {
      prompt = `As Krishna, provide a calming and supportive response to Arjuna's negative concern "${userMessage}". Use a soothing tone inspired by Indian mythology, but keep it natural and tailored, avoiding excessive flourish. Previous context: ${historyText}`;
    } else {
      prompt = `As Krishna, respond to Arjuna's neutral statement "${userMessage}" with a balanced, conversational tone, offering wisdom or acknowledgment as a divine friend, keeping it concise. Previous context: ${historyText}`;
    }

    const result = await generateWithRetry(model, prompt);
    const response = await result.response.text();
    return { response, sentiment: isNegative ? 'negative' : (isPositive ? 'positive' : 'neutral') };
  } catch (error) {
    console.error('Gemini API error:', error);
    return { response: 'Krishna is here to guide you. Please try again.', sentiment: '' };
  }
};

// New export for standalone sentiment scoring
export const getSentimentScore = (input) => {
  return sentimentAnalyzer.analyze(input).score; // Returns -ve, 0, or +ve
};