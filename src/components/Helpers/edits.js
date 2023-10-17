import { invokeLLM } from "./request";
import { getMaxTokens, suggestEditPrompt, summarizeEditPrompt } from "./prompts";



export const suggestEdit = async (text, edits) => {
    console.log("Suggesting edit");
    console.log("edits", edits);
    const summaries = edits.map((edit) => edit.summary);
    const prompt = suggestEditPrompt(text, summaries);
    const response = await invokeLLM(prompt, getMaxTokens(prompt));
    const parsedOutput = response.match(/[\n.]*Edit:(.*)Edited Text:(.*)/is);
    const edit = {
        edit: parsedOutput[1].trim().replace(/\W+$/, ""),
        editedText: parsedOutput[2].trim().replace(/\W+$/, "")
    };
    console.log("edit", edit)
    return edit;
};

export const summarizeEdit = async (edit) => {
    const prompt = summarizeEditPrompt(edit);
    const response = await invokeLLM(prompt, getMaxTokens(prompt));
    const summary = response.match(/[\n.]*Summary:(.*)/is)[1].trim().replace(/\W+$/, "");
    console.log("summary", summary);
    return summary;
};