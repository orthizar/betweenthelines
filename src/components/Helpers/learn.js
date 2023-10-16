import { invokeLLM } from "./request";
import { suggestPrompt } from "./prompts";

const maxRetries = 3;

export const suggest = async (text, messages) => {
  const prompt = suggestPrompt(text, messages);
  for (var retry = 0; retry < maxRetries; retry++) {
    try {
      const response = await invokeLLM(prompt);
      const parsedOutput = response.match(/[\n.]*Command:(.*)/is);
      const command = parsedOutput[1].trim().replace(/\W+$/, "");
      return command;
    } catch (error) {
      console.error(error);
    }
  }
  return null;
};
