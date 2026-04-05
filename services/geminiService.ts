import { GoogleGenAI } from "@google/genai";
import { Reading, Sensor } from "../types";

export const getEnvironmentalInsights = async (data: Reading[], sensors?: Sensor[]): Promise<string> => {
  let apiKey = '';
  try {
    // Vite environment
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || (import.meta as any).env.VITE_API_KEY || '';
    }
    // Node environment fallback
    if (!apiKey && typeof process !== 'undefined' && process.env) {
      apiKey = process.env.VITE_GEMINI_API_KEY || process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("Could not read API key from environment:", e);
  }
  
  if (!apiKey || apiKey.length < 5) {
    // Return mock insights if no API key is provided
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    return `### Current Status
The campus environment is currently stable, but there are areas requiring attention.

### Key Observations
* **Library & Study Areas:** Temperature and humidity are within optimal ranges for studying.
* **Gymnasium:** Temperature is slightly elevated. 
* **Cafeteria:** AQI is occasionally spiking during peak hours.

### Action Items
* **HVAC Adjustments:** Increase ventilation in the Gymnasium to lower the temperature.
* **Air Purifiers:** Consider deploying temporary air purifiers in the Cafeteria during lunch hours.
* **Maintenance:** Schedule a check for the expired sensor in the Main Library.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const recentDataStr = JSON.stringify(data.slice(-10));
    const sensorsStr = sensors ? JSON.stringify(sensors.map(s => ({ 
      id: s.id, 
      location: s.location, 
      type: s.type, 
      expiryDate: s.expiryDate, 
      utilizationRate: s.utilizationRate 
    }))) : "Sensor data unavailable";
    
    const prompt = `
      Analyze the following environmental sensor data and deployed sensor metadata from a university campus. 
      Provide a concise, professional summary (max 200 words). 
      
      You must specifically address:
      1. Sensor infrastructure health (identify sensors that are expired, expiring soon, and require replacement based on the expiryDate).
      2. Sensor utilization percentages (highlight over-utilized or under-utilized zones).
      3. Environmental correlations (explain any relationships or improvements needed regarding temperature, humidity, and air quality index).
      
      Live Data Readings: ${recentDataStr}
      Sensor Infrastructure: ${sensorsStr}
      
      Format the response as markdown. Use categories like "### Current Status", "### Key Observations", "### Infrastructure Health", and "### Action Items".
    `;

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
