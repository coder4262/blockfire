
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'undefined') {
    console.warn("Gemini API Key is missing. Tactical briefings will be disabled. Set GEMINI_API_KEY in your environment.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function getTacticalBriefing(score: number, weapon: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a tactical AI in a voxel warfare game. The player currently has a score of ${score} and is using the ${weapon}. Give a short (max 2 sentences) gritty tactical briefing or encouragement.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "Eyes sharp, soldier. The blocks aren't going to break themselves.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tactical comms down. Stay alert.";
  }
}
