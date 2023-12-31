import { invokeLLM } from "./request";
import { getMaxTokens, suggestPrompt } from "./prompts";

const maxRetries = 3;

export const suggest = async (text, messages) => {
  const format = "email";
  const prompt = suggestPrompt(text, messages, format);
  for (var retry = 0; retry < maxRetries; retry++) {
    try {
      const response = await invokeLLM(prompt, getMaxTokens(prompt));
      const parsedOutput = response.match(/[\n.]*Command:(.*)/is);
      const command = parsedOutput[1].trim().replace(/\W+$/, "");
      return command;
    } catch (error) {
      console.error(error);
    }
  }
  return null;
};
