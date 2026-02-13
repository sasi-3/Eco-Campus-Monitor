
import { GoogleGenAI } from "@google/genai";
import { Reading } from "../types";

export const getEnvironmentalInsights = async (data: Reading[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const recentDataStr = JSON.stringify(data.slice(-10));
  
  const prompt = `
    Analyze the following environmental sensor data from a university campus and provide a short, professional summary (max 150 words). 
    Highlight any anomalies, health risks, or suggestions for energy savings.
    
    Data: ${recentDataStr}
    
    Format the response as markdown. Include categories like "Current Status", "Key Observations", and "Action Items".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The AI analysis is currently unavailable. Please check back later.";
  }
};
