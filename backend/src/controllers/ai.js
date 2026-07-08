const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
const Problem = require('../models/problem');

const problemCache = new Map();

const problemchatai = async (req, res) => {
    try {
        const { problemId, userCode, chatHistory = [], language = "c++", newQuestion = "" } = req.body;

        if (!problemId) {
            return res.status(400).json({ error: "Problem ID is required." });
        }

        let problemDetails;
        if (problemCache.has(problemId)) {
            problemDetails = problemCache.get(problemId);
        } else {
            problemDetails = await Problem.findById(problemId).select('title description constraints referencesolution');
            if (!problemDetails) {
                return res.status(404).json({ error: "Problem not found." });
            }
            problemCache.set(problemId, problemDetails);
        }

        const refSolutionObj = problemDetails.referencesolution?.find(rs => rs.language === language);
        const refSolutionCode = refSolutionObj ? refSolutionObj.code : "No reference solution provided for this language.";

        const systemInstruction = `
            CRITICAL BEHAVIORAL RULE:
            You are a specialized Socratic coding coach for the competitive programming platform Zcode. Your ONLY purpose is to help the user with the specific coding problem provided in the context, or to answer general computer science questions.
            If the user asks about topics completely unrelated to programming, computer science, or the current problem (for example: history, recipes, writing essays, or general knowledge), you MUST refuse to answer. Respond strictly with: "I am a Zcode programming coach. I can only help you with coding and computer science questions. Let's get back to solving this problem!"

            CRITICAL INSTRUCTION REGARDING THE REFERENCE SOLUTION:
            I am providing you with the Reference Solution below. This is for YOUR EYES ONLY. You must use this reference solution to understand the optimal approach and to figure out where the user's code is going wrong. 
            UNDER NO CIRCUMSTANCES are you allowed to show the user the reference solution. You must not copy-paste it, you must not translate it into another language for them, and you must not write the exact lines of code they need. You may only use it to formulate short, Socratic hints (e.g., "Take a look at your loop bounds—should you be stopping at n-1?"). Keep your answers brief (under 4 sentences).
                    `;

        const staticContext = `
            --- PROBLEM SETTINGS ---
            Title: ${problemDetails.title}
            Description: ${problemDetails.description}
            Constraints: ${JSON.stringify(problemDetails.constraints)}

            --- REFERENCE SOLUTION (SECRET) ---
            Language: ${language}
            ${refSolutionCode}
            ------------------------
                    `;

        const recentHistory = chatHistory.slice(-6); 
        
        let formattedHistory = "--- RECENT CHAT HISTORY ---\n";
        if (recentHistory.length === 0) {
            formattedHistory += "(No recent history)\n";
        } else {
            recentHistory.forEach((msg) => {
                const role = msg.role === 'model' || msg.role === 'ai' ? 'Coach' : 'User';
                const text = msg.text || msg.content || (typeof msg === 'string' ? msg : JSON.stringify(msg));
                formattedHistory += `${role}: ${text}\n`;
            });
        }
        
        const userPrompt = `
            ${staticContext}
            ${formattedHistory}

            --- USER'S CURRENT LIVE CODE ---
            ${userCode || "(No code provided)"}

            --- NEW QUESTION FROM USER ---
            ${newQuestion || "Can you review my code and give me a hint?"}
                    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                maxOutputTokens: 1000 
            }
        }); 

        let aiResponse = response.text;
        // const codeBlockCount = (aiResponse.match(/```/g) || []).length;
        // if (codeBlockCount >= 2 && aiResponse.length > 300) {
        //     aiResponse = "I can't provide the exact code, but I suggest reviewing the logic around your current implementation!";
        // }

        res.status(200).json({ reply: aiResponse });

    } catch (err) {
        console.error("AI Coach Error:", err);
        if (err.status === 429 || (err.message && err.message.includes('429'))) {
            return res.status(429).json({ reply: "The coaching servers are a bit busy right now! Please wait 15 seconds and try again." });
        }
        res.status(500).json({ error: "An error occurred with the AI Coach." });
    }
}

module.exports = { problemchatai };