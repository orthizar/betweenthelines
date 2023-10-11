// Transform the text per users request.
// Pipeline:
// 1 - Text transformation process
// 2 - Text information integrity check
// 3 - Text quality and format check
// 4 - Transformation command fullfillment check
// 5 - Text output
//
// Steps in brackets are dependencies. Steps can be run in parallel as long as dependencies are met. 
//
// 1.1. Generate transformed text from transformation command and source text.
// 2.1. Generate questions from source text.
// (1.1, 2.1) -> 2.2. Generate answers to questions from transformed text.
// (2.2) -> 2.3. Verify answers to source text.
// (2.3) -> 2.4. Regenerate transformed text from transformation command and source text and emphasize the inclusion of the failed questions.
// (2.4) -> 2.5. Combine the transformed text with the regenerated transformed text.
// (2.5) -> 2.6. Generate answers to source questions from combined text.
// (2.6) -> 2.7. Verify answers to source text.
// (2.7) -> 3.1. Check if the combined text is in format of the selected text form (email, letter, etc.) and does not have irregularities like trailing newlines or random characters.
// (if 3.1 failed) -> 3.2. Regenerate combined text with the correct format.
// (3.2) -> 3.3. Generate answers to source questions from regenerated combined text.
// (3.3) -> 3.4. Verify answers to source text.
// (3.4) -> 3.5. Check if the regenerated combined text is in format of the selected text form (email, letter, etc.) and does not have irregularities like trailing newlines or random characters.
// (if 3.5 failed) -> 3.6. Repeat 3.2-3.5 until the regenerated combined text is in the correct format.
// (if 3.5 successful) -> 4.1. Check if the resulting text transformation fullfills the transformation command.
// (if 4.1 failed) -> 4.2. Regenerate text with the missing transformations.

import { invokeLLM } from "./request";

export const invokePipeline = async (text, transformationCommand) => {
    console.debug("tranfomed")
    const transformed = await transform(text, transformationCommand);
    console.debug("questions")
    const questions = await generateQuestions(text);
    console.debug("sourceAnswers")
    const sourceAnswers = await answerQuestions(text, questions);
    console.debug("verifiedSourceAnswers")
    const verifiedSourceAnswers = await validateAnswers(text, questions, sourceAnswers);
    // remove questions that cannot be answered correctly from the source text
    const goodQuestions = verifiedSourceAnswers.filter((answer) => answer.valid).map((answer) => answer.question);
    console.debug("transformedAnswers")
    const transformedAnswers = await answerQuestions(transformed.output, goodQuestions);
    console.debug("verifiedTransformedAnswers")
    const verifiedTransformedAnswers = await validateAnswers(transformed.output, goodQuestions, transformedAnswers);
};

const transform = async (text, transformationCommand) => {
    const format = "email";
    const prompt = `
Execute the following transformation commands for me.
Use the following format:

Text: the source text you want to transform
Transformation: the transformations you should do to the source text
Thought: you should always think about what to do.
Output: the transformed text in format of the text form "${format}".
Observation: Describe what you did in max 15 words.

Begin! Remember to use the correct format.
Text: ${text}
Transformation: ${transformationCommand}`.trim();
    const tokens = 4096 - ~~(prompt.length/3.5);
    const transformedText = await invokeLLM(prompt, tokens);
    console.log("transform", "prompt", prompt);
    console.log("transform", "transformedText", transformedText);
    const parsedOutput = transformedText.match(/(\n|.)*Thought:\n*(.*)Output:\n*(.*)Observation:\n*(.*)/s);
    // console.log("transform", "parsedOutput", parsedOutput);
    const transformed = {
        thought: parsedOutput[1].trim(),
        output: parsedOutput[2].trim(),
        observation: parsedOutput[3].trim(),
    };
    console.log("transform", "transformed", transformed);
    return transformed; 
};

const generateQuestions = async (text) => {
    const prompt = `
Generate questions about the following text.
Use the following format:

Text: the source text you want to generate questions for

Question: the question you want to generate. The question should be about the content.
... (this is repeated for all questions max 10 questions)

Begin! Remember to use the correct format.
Text: ${text}`.trim();
    const tokens = 4096 - ~~(prompt.length/3.5);
    const generatedQuestions = await invokeLLM(prompt, tokens);
    console.log("generateQuestions", "prompt", prompt);
    console.log("generateQuestions", "generatedQuestions", generatedQuestions);
    const parsedOutput = generatedQuestions.matchAll(/[\n.]*Question:(.*)/mg).toArray();
    // console.log("generateQuestions", "parsedOutput", parsedOutput);
    const questions = parsedOutput.map((question) => question[1].trim());
    console.log("generateQuestions", "questions", questions);
    return questions;
};

const answerQuestions = async (text, questions) => {
    const formattedQuestions = "["+questions.join(",")+"]";
    const prompt = `
Answer the following questions.
Use the following format:

Text: the source text you want to answer questions for
Questions: the questions you want to answer, wrapped in square brackets

Question: the question you want to answer
Answer: the answer you want to give
... (this Question/Answer is repeated for all questions)

Begin! Remember to use the correct format.
Text: ${text}
Questions: ${formattedQuestions}`.trim();
    const tokens = 4096 - ~~(prompt.length/3.5);
    const answeredQuestions = await invokeLLM(prompt, tokens);
    console.log("answerQuestions", "prompt", prompt);
    console.log("answerQuestions", "answeredQuestions", answeredQuestions);
    const parsedOutput = answeredQuestions.matchAll(/[\n.]*Question:(.*)[\n.]*Answer:(.*)/mg).toArray();
    // console.log("answerQuestions", "parsedOutput", parsedOutput);
    const answers = parsedOutput.map((question) => {
        return {
            question: question[1].trim(),
            answer: question[2].trim(),
        };
    });
    console.log("answerQuestions", "answers", answers);
    return answers;
};

const validateAnswers = async (text, questions, answers) => {
    var formattedQuestions = "[";
    var formattedAnswers = "[";
    questions.forEach((question, index) => {
        formattedQuestions += question;
        formattedAnswers += answers.find((answer) => answer.question === question).answer;
        if (index < questions.length - 1) {
            formattedQuestions += ",";
            formattedAnswers += ",";
        }
    });
    formattedQuestions += "]";
    formattedAnswers += "]";
    const prompt = `
Verify the following answers.
Use the following format:

Text: the source text you want to verify the answers for
Questions: the questions you want to verify the answers for, wrapped in square brackets
Answers: the answers you want to verify, wrapped in square brackets

Question: the question you want to verify the answer for
Answer: the answer you want to verify
Valid: yes or no
... (this Question/Answer/Valid is repeated for all questions)

Begin! Remember to use the correct format.
Text: ${text}
Questions: ${formattedQuestions}
Answers: ${formattedAnswers}`.trim();
    const tokens = 4096 - ~~(prompt.length/3.5);
    console.log("validateAnswers", "tokens", tokens);
    const validatedAnswers = await invokeLLM(prompt, tokens);
    console.log("validateAnswers", "prompt", prompt);
    console.log("validateAnswers", "validateAnswers", validatedAnswers);
    const parsedOutput = validatedAnswers.matchAll(/[\n.]*Question:(.*)[\n.]*Answer:(.*)[\n.]*Valid:(.*)/mg).toArray();
    // console.log("validateAnswers", "parsedOutput", parsedOutput);
    const results = parsedOutput.map((question) => {
        return {
            question: question[1].trim(),
            answer: question[2].trim(),
            valid: question[3].trim().toLowerCase() === "yes",
        };
    });
    console.log("validateAnswers", "results", results);
    return results;
};
