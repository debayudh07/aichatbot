import { GoogleGenerativeAI } from '@google/generative-ai';

const CREATOR_KEYWORDS = [
  "who's the creator", 
  "who created", 
  "creator of the website", 
  "made this website"
];

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

const generationConfig = {
  temperature: 0.9,
  topP: 1,
  maxOutputTokens: 2048,
  responseMimeType: 'text/plain',
};

const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });

export const sendMessage = async (message) => {
  if (CREATOR_KEYWORDS.some(keyword => 
    message.toLowerCase().includes(keyword)
  )) {
    return "The creator of this website is my maestro Debayudh.";
  }

  const chatSession = model.startChat({ 
    generationConfig, 
    history: [] 
  });

  const result = await chatSession.sendMessage(message);
  return result.response.text();
};