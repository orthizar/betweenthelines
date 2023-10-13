// learn user behavior based on previous chat messages and use that to predict the next message and suggest it to the user.

import { invokeLLM } from "./request";

import { suggestPrompt } from "./prompts";

export const suggest = async (text, messages) => {
    const prompt = suggestPrompt(text, messages);
    console.log(prompt);
    const response = await invokeLLM(prompt);
    console.log(response);
    const parsedOutput = response.match(/[\n.]*Command:(.*)/si);
    console.log(parsedOutput);
    const command = parsedOutput[1].trim();
    console.log(command);
    return command;
};