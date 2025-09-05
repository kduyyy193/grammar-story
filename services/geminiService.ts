
import { GoogleGenAI, Type } from "@google/genai";
import type { GrammarError, Challenge, DailyTheme, TenseDetail } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function analyzeGrammar(text: string): Promise<GrammarError[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following text for grammar, spelling, and style errors. Please identify each error and provide a correction and a brief, simple explanation.

Text to analyze: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalText: {
                    type: Type.STRING,
                    description: "The original phrase or word with the error.",
                  },
                  correctedText: {
                    type: Type.STRING,
                    description: "The corrected version of the phrase or word.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "A simple, one-sentence explanation of the error.",
                  },
                  type: {
                    type: Type.STRING,
                    description: "The category of the error (e.g., Tense, Preposition, Spelling, Punctuation)."
                  },
                },
              },
            },
          },
        },
      },
    });

    const jsonResponse = JSON.parse(response.text);

    if (jsonResponse && jsonResponse.errors) {
       return jsonResponse.errors.map((error: Omit<GrammarError, 'id'>) => ({
        ...error,
        id: crypto.randomUUID(),
       }));
    }
    
    return [];

  } catch (error) {
    console.error("Error analyzing grammar:", error);
    throw new Error("Failed to get grammar analysis from AI. Please check your API key and try again.");
  }
}

export async function generateChallenges(theme: Omit<DailyTheme, 'theory'>): Promise<Challenge[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 30 'fill-in-the-blank' grammar challenges about '${theme.title}'. Provide a mix of 'Easy', 'Medium', and 'Hard' difficulties. For each challenge, provide a title, the story with '___' for blanks, a JSON array of the correct answers, and the difficulty level. The number of blanks must match the number of answers.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            challenges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  storyWithBlanks: { type: Type.STRING },
                  solution: { type: Type.ARRAY, items: { type: Type.STRING } },
                  level: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const jsonResponse = JSON.parse(response.text);

    if (jsonResponse && jsonResponse.challenges) {
      return jsonResponse.challenges.map((challenge: Omit<Challenge, 'id' | 'category'>) => ({
        ...challenge,
        id: crypto.randomUUID(),
        category: theme.category,
      }));
    }
    return [];

  } catch (error) {
    console.error("Error generating challenges:", error);
    throw new Error("Failed to generate new challenges from AI. Please try again later.");
  }
}

export async function generateDailyPrompt(theme: Omit<DailyTheme, 'theory'>): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create a short, simple, and creative story prompt for a user to practice the grammar rule: '${theme.title}'. The prompt should be one or two sentences long and easy for anyone to understand. For example, if the theme is 'Simple Past', a good prompt would be 'Imagine you found a mysterious old map yesterday. Write a short story about where it led you.'`,
        });

        const promptText = response.text.trim();
        if (!promptText) {
            throw new Error("AI returned an empty prompt.");
        }
        return promptText;

    } catch (error) {
        console.error("Error generating daily prompt:", error);
        throw new Error("Failed to generate a new story prompt from AI.");
    }
}

export async function generateTenseExamples(tense: TenseDetail): Promise<string[]> {
  try {
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Generate exactly 3 diverse and simple example sentences for the English tense: '${tense.name}'. The tense is defined as: '${tense.definition}'. The examples must be easy for a beginner to understand.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                examples: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
              },
            },
          }
      });
      
      const jsonResponse = JSON.parse(response.text);
      if (jsonResponse && jsonResponse.examples && jsonResponse.examples.length > 0) {
        return jsonResponse.examples;
      }
      throw new Error("AI returned no examples.");

  } catch (error) {
      console.error(`Error generating examples for ${tense.name}:`, error);
      return ["Could not load an example at this time."];
  }
}
