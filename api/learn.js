import { invokeLLM } from "./_request";

import { suggestPrompt } from "./_prompts";

const maxRetries = 3;

export const runtime = "edge";

export default async function learn(request, response) {
    const { text, messages } = await request.body;
    if (!text || !messages) {
        return response.status(400).json({
            error: "Invalid request body.",
        });
    };
    const prompt = suggestPrompt(text, messages);
    for (var retry = 0; retry < maxRetries; retry++) {
        try {
            const output = await invokeLLM(prompt);
            const parsedOutput = output.match(/[\n.]*Command:(.*)/si);
            const command = parsedOutput[1].trim();
            return response.status(200).json({
                command: command,
            });
        } catch (error) {
            console.error(error);
        }
    }
    return response.status(500).json({
        error: "Too many retries.",
    });
};