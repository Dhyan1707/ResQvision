import { GoogleGenerativeAI } from '@google/generative-ai';
import { envConfig } from './env.js';

let genAI = null;

if (envConfig.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(envConfig.GEMINI_API_KEY);
} else {
  console.warn('[WARNING] GEMINI_API_KEY is not configured in .env file.');
}

/**
 * Returns a generative model instance for blueprint generation.
 * Default model: 'gemini-1.5-flash' for speed and JSON structure reliability.
 */
export const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  if (!genAI) {
    if (!envConfig.GEMINI_API_KEY) {
      throw new Error('Google Gemini API Key is missing. Please set GEMINI_API_KEY in your .env file.');
    }
    genAI = new GoogleGenerativeAI(envConfig.GEMINI_API_KEY);
  }

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });
};

export default genAI;
