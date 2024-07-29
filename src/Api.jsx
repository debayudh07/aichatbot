import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.0-pro',
});

const generationConfig = {
  temperature: 0.9,
  topP: 1,
  maxOutputTokens: 2048,
  responseMimeType: 'text/plain',
};

export const sendMessage = async (message) => {
  // Check if the message contains a question about the creator of the website
  const creatorKeywords = ["who's the creator", "who created", "creator of the website", "made this website"];
  const lowerCaseMessage = message.toLowerCase();

  for (const keyword of creatorKeywords) {
    if (lowerCaseMessage.includes(keyword)) {
      return "The creator of this website is my maestro Debayudh.";
    }
  }

  // Proceed with the AI model if no keywords are detected
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(message);
  return result.response.text();
};
