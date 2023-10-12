import { invokeLLM } from "./request";

import { transformTextPrompt, generateQuestionsPrompt, answerQuestionsPrompt, validateAnswersPrompt, enrichTextPrompt } from "./prompts";

const maxRetries = 10;

export async function* invokePipeline(text, transformationCommand) {
    try {
        var transformed = undefined;
        var questions = undefined;
        var sourceAnswers = undefined;
        var goodQuestions = undefined;
        var transformedAnswers = undefined;
        var enrichedAnswers = undefined;
        var retry = 0;
        var step = 0;
        while (retry < maxRetries && step <= 15) {
            try {
                const format = "email";
                if (step === 0) {
                    console.debug("transformed")
                    transformed = await transformText(text, transformationCommand, format);
                    yield await Promise.resolve(transformed.thought);
                    step++;
                }
                if (step === 1) {
                    console.debug("questions")
                    yield await Promise.resolve("Generating questions for self-checking.");
                    questions = await generateQuestions(text);
                    step++;
                }
                if (step === 2) {
                    console.debug("sourceAnswers")
                    yield await Promise.resolve("Checking question answerability.");
                    sourceAnswers = await answerQuestions(text, questions);
                    step++;
                }
                if (step === 3) {
                    console.debug("verifiedSourceAnswers")
                    const verifiedSourceAnswers = await validateAnswers(text, questions, sourceAnswers);
                    goodQuestions = verifiedSourceAnswers.filter((answer) => answer.valid).map((answer) => answer.question);
                    step++;
                }
                if (step === 4) {
                    console.debug("transformedAnswers")
                    yield await Promise.resolve("Answering questions for self-checking.");
                    transformedAnswers = await answerQuestions(transformed.output, goodQuestions);
                    step++;
                }
                if (step === 5) {
                    console.debug("verifiedTransformedAnswers")
                    yield await Promise.resolve("Verifying questions for self-checking.");
                    const verifiedTransformedAnswers = await validateAnswers(transformed.output, goodQuestions, transformedAnswers);
                    var hasFailedAnswers = verifiedTransformedAnswers.some((answer) => !answer.valid);
                    var nValidAnswers = verifiedTransformedAnswers.filter((answer) => answer.valid).length;
                    yield await Promise.resolve("Text information score: " + nValidAnswers + "/" + goodQuestions.length);
                    step++;
                }
                if (step > 5 && step <= 14) {
                    var enriched = transformed;
                    while (hasFailedAnswers && step <= 14) {
                        if ((step - 6) % 2 === 0) {
                            console.debug("enriched")
                            yield await Promise.resolve("Enriching text with missing information.");
                            enriched = await enrichText(text, enriched, goodQuestions, transformationCommand, format);
                            yield await Promise.resolve(enriched.thought);
                            step++;
                        }
                        if ((step - 6) % 2 === 1) {
                            console.debug("enrichedAnswers")
                            yield await Promise.resolve("Answering questions for self-checking.");
                            enrichedAnswers = await answerQuestions(enriched.output, goodQuestions);
                            step++;
                        }
                        if ((step - 6) % 2 === 2) {
                            console.debug("verifiedenrichedAnswers")
                            yield await Promise.resolve("Verifying questions for self-checking.");
                            const verifiedenrichedAnswers = await validateAnswers(enriched.output, goodQuestions, enrichedAnswers);
                            hasFailedAnswers = verifiedenrichedAnswers.some((answer) => !answer.valid);
                            nValidAnswers = verifiedenrichedAnswers.filter((answer) => answer.valid).length;
                            yield await Promise.resolve("Text information score: " + nValidAnswers + "/" + goodQuestions.length);
                            step++;
                        }
                    }
                }
                if (step > 5) {
                    yield await Promise.resolve(enriched);
                    step++;
                }
            } catch (error) {
                console.error(error);
                retry++;
            }
        }
        if (retry >= maxRetries) {
            yield await Promise.resolve("Too many retries.");
        }
    } catch (error) {
        console.error(error);
        yield await Promise.resolve("Something went wrong. Please try again.");
        yield await Promise.resolve({
            output: text,
        });
    }
};

const getMaxTokens = (prompt) => {
    return 4096 - ~~(prompt.length / 3.5);
};

const transformText = async (text, transformationCommand, format) => {
    const prompt = transformTextPrompt(text, transformationCommand, format);
    const transformedText = await invokeLLM(prompt, getMaxTokens(prompt));
    const parsedOutput = transformedText.match(/(\n|.)*Thought:\n*(.*)Output:\n*(.*)Observation:\n*(.*)/si);
    const transformed = {
        thought: parsedOutput[2].trim(),
        output: parsedOutput[3].trim(),
        observation: parsedOutput[4].trim(),
    };
    return transformed;
};

const generateQuestions = async (text) => {
    const prompt = generateQuestionsPrompt(text);
    const generatedQuestions = await invokeLLM(prompt, getMaxTokens(prompt));
    const parsedOutput = generatedQuestions.matchAll(/[\n.]*Question:(.*)/mgi).toArray();
    const questions = parsedOutput.map((question) => question[1].trim());
    return questions;
};

const answerQuestions = async (text, questions) => {
    const prompt = answerQuestionsPrompt(text, questions);
    const answeredQuestions = await invokeLLM(prompt, getMaxTokens(prompt));
    const parsedOutput = answeredQuestions.matchAll(/[\n.]*Question:(.*)[\n.]*Answer:(.*)/mgi).toArray();
    const answers = parsedOutput.map((question) => {
        return {
            question: question[1].trim(),
            answer: question[2].trim(),
        };
    });
    questions.forEach((question) => {
        if (answers.find((answer) => answer.question === question) === undefined) {
            throw new Error("Not all questions were answered.");
        }
    });
    return answers;
};

const validateAnswers = async (text, questions, answers) => {
    const prompt = validateAnswersPrompt(text, questions, answers);
    const validatedAnswers = await invokeLLM(prompt, getMaxTokens(prompt));
    const parsedOutput = validatedAnswers.matchAll(/[\n.]*Question:(.*)[\n.]*Answer:(.*)[\n.]*Valid:(.*)/mgi).toArray();
    const results = parsedOutput.map((question) => {
        return {
            question: question[1].trim(),
            answer: question[2].trim(),
            valid: question[3].trim().toLowerCase() === "yes",
        };
    });
    if (results.length !== questions.length) {
        throw new Error("Number of questions and answers do not match.");
    }
    return results;
};

// the following function should be used to include the failed questions in the transformed text
const enrichText = async (text, transformedText, questions, transformationCommand, format) => {
    const prompt = enrichTextPrompt(text, transformedText, questions, transformationCommand, format);
    const enrichedText = await invokeLLM(prompt, getMaxTokens(prompt));
    const parsedOutput = enrichedText.match(/[\n|.]*Thought:\n*(.*)Output:\n*(.*)/si);
    const enriched = {
        thought: parsedOutput[1].trim(),
        output: parsedOutput[2].trim(),
    }
    return enriched;
}