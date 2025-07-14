import { GoogleGenAI, Type } from "@google/genai";
import { RawDayPlan, QuizQuestion, LearningPlan } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const planResponseSchema = {
    type: Type.OBJECT,
    properties: {
        plan: {
            type: Type.ARRAY,
            description: "The learning plan, with one entry per day.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.NUMBER, description: "The day number, starting from 1." },
                    title: { type: Type.STRING, description: "A concise title for the day's topic." },
                    lessons: {
                        type: Type.ARRAY,
                        description: "A list of 2-4 key lesson points for the day.",
                        items: { type: Type.STRING }
                    },
                    practiceTask: { type: Type.STRING, description: "A short, practical task to apply the lessons." }
                },
                required: ["day", "title", "lessons", "practiceTask"]
            }
        }
    },
    required: ["plan"]
};

export const generatePlan = async (skill: string, duration: number): Promise<RawDayPlan[]> => {
    const prompt = `Create a ${duration}-day microlearning plan for a complete beginner to learn "${skill}". Each day must have a clear title, 2 to 4 distinct lesson points, and a single practical task. The plan should be progressive and easy to follow.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: planResponseSchema,
                temperature: 0.7,
            },
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("API returned an empty response.");
        }

        const parsedResponse = JSON.parse(text);

        if (!parsedResponse.plan || !Array.isArray(parsedResponse.plan)) {
             throw new Error("Invalid plan structure in API response.");
        }

        return parsedResponse.plan as RawDayPlan[];

    } catch (error) {
        console.error("Error generating plan with Gemini:", error);
        throw new Error("Failed to generate learning plan. The AI model might be busy or unavailable. Please try again later.");
    }
};


const quizResponseSchema = {
    type: Type.OBJECT,
    properties: {
        quiz: {
            type: Type.ARRAY,
            description: "The list of quiz questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: { type: Type.STRING, description: "The text of the multiple-choice question." },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of 4 possible answers.",
                        items: { type: Type.STRING }
                    },
                    correctAnswerIndex: { type: Type.NUMBER, description: "The 0-based index of the correct answer in the 'options' array." },
                    explanation: { type: Type.STRING, description: "A brief explanation of why the correct answer is right." }
                },
                required: ["questionText", "options", "correctAnswerIndex", "explanation"]
            }
        }
    },
    required: ["quiz"]
}

export const generateQuiz = async (plan: LearningPlan): Promise<QuizQuestion[]> => {
    const topics = plan.days.map(d => d.title).join(', ');
    const questionCount = Math.min(10, Math.max(5, plan.duration));

    const prompt = `You are a quiz generator. Create a quiz with exactly ${questionCount} multiple-choice questions to test a beginner's understanding of the skill "${plan.skill}". The quiz should cover these topics: ${topics}. For each question, provide the question text, exactly 4 answer options, the 0-based index of the correct answer, and a brief explanation for the correct answer. Ensure the questions are relevant for a beginner and cover a range of the provided topics.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizResponseSchema,
                temperature: 0.8,
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("API returned an empty response for the quiz.");
        }

        const parsedResponse = JSON.parse(text);

        if (!parsedResponse.quiz || !Array.isArray(parsedResponse.quiz)) {
            throw new Error("Invalid quiz structure in API response.");
        }

        return parsedResponse.quiz as QuizQuestion[];

    } catch (error) {
        console.error("Error generating quiz with Gemini:", error);
        throw new Error("Failed to generate quiz. The AI model might be busy or unavailable. Please try again later.");
    }
};