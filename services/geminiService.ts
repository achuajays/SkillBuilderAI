import { RawDayPlan, QuizQuestion, LearningPlan } from '../types';
import { supabase } from './supabaseClient';

const planResponseSchema = {
    type: "object",
    properties: {
        plan: {
            type: "array",
            description: "The learning plan, with one entry per day.",
            items: {
                type: "object",
                properties: {
                    day: { type: "number", description: "The day number, starting from 1." },
                    title: { type: "string", description: "A concise title for the day's topic." },
                    lessons: {
                        type: "array",
                        description: "A list of 2-4 key lesson points for the day.",
                        items: { type: "string" }
                    },
                    practiceTask: { type: "string", description: "A short, practical task to apply the lessons." }
                },
                required: ["day", "title", "lessons", "practiceTask"]
            }
        }
    },
    required: ["plan"]
};

const quizResponseSchema = {
    type: "object",
    properties: {
        quiz: {
            type: "array",
            description: "The list of quiz questions.",
            items: {
                type: "object",
                properties: {
                    questionText: { type: "string", description: "The text of the multiple-choice question." },
                    options: {
                        type: "array",
                        description: "An array of 4 possible answers.",
                        items: { type: "string" }
                    },
                    correctAnswerIndex: { type: "number", description: "The 0-based index of the correct answer in the 'options' array." },
                    explanation: { type: "string", description: "A brief explanation of why the correct answer is right." }
                },
                required: ["questionText", "options", "correctAnswerIndex", "explanation"]
            }
        }
    },
    required: ["quiz"]
};

async function callGeminiAPI(payload: any): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        throw new Error('User not authenticated');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-api`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'generate',
            payload
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
    }

    return await response.json();
}

export const generatePlan = async (skill: string, duration: number): Promise<RawDayPlan[]> => {
    const prompt = `Create a ${duration}-day microlearning plan for a complete beginner to learn "${skill}". Each day must have a clear title, 2 to 4 distinct lesson points, and a single practical task. The plan should be progressive and easy to follow.`;
    
    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: planResponseSchema,
                temperature: 0.7,
            },
        };

        const response = await callGeminiAPI(payload);
        
        if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
            throw new Error("API returned an empty response.");
        }

        const text = response.candidates[0].content.parts[0].text;
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

export const generateQuiz = async (plan: LearningPlan): Promise<QuizQuestion[]> => {
    const topics = plan.days.map(d => d.title).join(', ');
    const questionCount = Math.min(10, Math.max(5, plan.duration));

    const prompt = `You are a quiz generator. Create a quiz with exactly ${questionCount} multiple-choice questions to test a beginner's understanding of the skill "${plan.skill}". The quiz should cover these topics: ${topics}. For each question, provide the question text, exactly 4 answer options, the 0-based index of the correct answer, and a brief explanation for the correct answer. Ensure the questions are relevant for a beginner and cover a range of the provided topics.`;

    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: quizResponseSchema,
                temperature: 0.8,
            },
        };

        const response = await callGeminiAPI(payload);

        if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
            throw new Error("API returned an empty response for the quiz.");
        }

        const text = response.candidates[0].content.parts[0].text;
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

// Create a simple AI chat interface for the Chat component
export const ai = {
    chats: {
        create: (config: any) => {
            return {
                sendMessageStream: async function* (options: { message: string }) {
                    try {
                        const payload = {
                            contents: [{ parts: [{ text: options.message }] }],
                            generationConfig: {
                                temperature: 0.7,
                            },
                            systemInstruction: config.config?.systemInstruction ? {
                                parts: [{ text: config.config.systemInstruction }]
                            } : undefined
                        };

                        const response = await callGeminiAPI(payload);
                        
                        if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
                            throw new Error("API returned an empty response.");
                        }

                        const text = response.candidates[0].content.parts[0].text;
                        
                        // Simulate streaming by yielding chunks
                        const words = text.split(' ');
                        for (let i = 0; i < words.length; i++) {
                            yield { text: words[i] + (i < words.length - 1 ? ' ' : '') };
                            // Small delay to simulate streaming
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                    } catch (error) {
                        throw error;
                    }
                }
            };
        }
    }
};