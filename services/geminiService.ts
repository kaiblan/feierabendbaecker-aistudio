
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function troubleshootFermentation(issue: string, context: any) {
  const prompt = `
    Dough Troubleshooting Context:
    - Issue: ${issue}
    - Current Process Step: ${context.stage}
    - Temperature: ${context.tempDough}°C
    - Bulk Progress: ${context.bulkDuration} mins

    Act as a professional bread scientist. Analyze the issue and provide:
    1. Immediate technical adjustment.
    2. Scientific explanation of what is happening (fermentation/enzyme activity).
    3. Prevention for future bakes.
    
    Format as technical lab notes. No conversational fluff.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      temperature: 0.3,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  return response.text;
}

export async function getKnowledgeArticle(topic: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain the scientific principle of "${topic}" in bread making. Focus on biochemical reactions, timing, and reproducibility. Professional technical tone.`,
  });
  return response.text;
}
