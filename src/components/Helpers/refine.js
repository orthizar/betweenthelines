import {
  answerQuestionsPrompt,
  enrichTextPrompt,
  generateQuestionsPrompt,
  transformTextPrompt,
  validateAnswersPrompt,
} from "./prompts";

import { invokeLLM } from "./request";

const maxRetries = 10;

export async function* invokePipeline(text, imageDescription, transformationCommand, refine) {
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
          yield await Promise.resolve(
            "Transforming text per your request."
          );
          transformed = await transformText(
            text,
            imageDescription,
            transformationCommand,
            format
          );
          yield await Promise.resolve(transformed.observation);
          step++;
        }
        if (!refine) {
          step = 15;
        }
        if (step === 1) {
          yield await Promise.resolve(
            "Generating questions for self-checking."
          );
          questions = await generateQuestions(text);
          step++;
        }
        if (step === 2) {
          yield await Promise.resolve("Checking question answerability.");
          sourceAnswers = await answerQuestions(text, questions);
          step++;
        }
        if (step === 3) {
          const verifiedSourceAnswers = await validateAnswers(
            text,
            questions,
            sourceAnswers
          );
          goodQuestions = verifiedSourceAnswers
            .filter((answer) => answer.valid)
            .map((answer) => answer.question);
          step++;
        }
        if (step === 4) {
          yield await Promise.resolve("Answering questions for self-checking.");
          transformedAnswers = await answerQuestions(
            transformed.output,
            goodQuestions
          );
          step++;
        }
        if (step === 5) {
          yield await Promise.resolve("Verifying questions for self-checking.");
          const verifiedTransformedAnswers = await validateAnswers(
            transformed.output,
            goodQuestions,
            transformedAnswers
          );
          var hasFailedAnswers = verifiedTransformedAnswers.some(
            (answer) => !answer.valid
          );
          var nValidAnswers = verifiedTransformedAnswers.filter(
            (answer) => answer.valid
          ).length;
          yield await Promise.resolve(
            "Text information score: " +
              nValidAnswers +
              "/" +
              goodQuestions.length
          );
          step++;
        }
        if (step > 5 && step <= 14) {
          while (hasFailedAnswers && step <= 14) {
            if ((step - 6) % 2 === 0) {
              yield await Promise.resolve(
                "Enriching text with missing information."
              );
              transformed = await enrichText(
                text,
                transformed,
                goodQuestions,
                transformationCommand,
                format
              );
              yield await Promise.resolve(transformed.observation);
              step++;
            }
            if ((step - 6) % 2 === 1) {
              yield await Promise.resolve(
                "Answering questions for self-checking."
              );
              enrichedAnswers = await answerQuestions(
                transformed.output,
                goodQuestions
              );
              step++;
            }
            if ((step - 6) % 2 === 2) {
              yield await Promise.resolve(
                "Verifying questions for self-checking."
              );
              const verifiedenrichedAnswers = await validateAnswers(
                transformed.output,
                goodQuestions,
                enrichedAnswers
              );
              hasFailedAnswers = verifiedenrichedAnswers.some(
                (answer) => !answer.valid
              );
              nValidAnswers = verifiedenrichedAnswers.filter(
                (answer) => answer.valid
              ).length;
              yield await Promise.resolve(
                "Text information score: " +
                  nValidAnswers +
                  "/" +
                  goodQuestions.length
              );
              step++;
            }
          }
        }
        if (step > 5) {
          yield await Promise.resolve("Applying changes to the text.");
          yield await Promise.resolve(transformed);
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
}

const getMaxTokens = (prompt) => {
  return 4096 - ~~(prompt.length / 3.5);
};

const transformText = async (text, imageAnnotations, transformationCommand, format) => {
  const prompt = transformTextPrompt(text, imageAnnotations, transformationCommand, format);
  const transformedText = await invokeLLM(prompt, getMaxTokens(prompt));
  const parsedOutput = transformedText.match(
    /[\n.]*Thought:\n*(.*)Output:\n*(.*)Observation:\n*(.*)/is
  );
  const transformed = {
    thought: parsedOutput[1].trim(),
    output: parsedOutput[2].trim(),
    observation: parsedOutput[3].trim(),
  };
  return transformed;
};

const generateQuestions = async (text) => {
  const prompt = generateQuestionsPrompt(text);
  const generatedQuestions = await invokeLLM(prompt, getMaxTokens(prompt));
  const parsedOutput = generatedQuestions
    .matchAll(/[\n.]*Question:(.*)/gim)
    .toArray();
  const questions = parsedOutput.map((question) => question[1].trim());
  return questions;
};

const answerQuestions = async (text, questions) => {
  const prompt = answerQuestionsPrompt(text, questions);
  const answeredQuestions = await invokeLLM(prompt, getMaxTokens(prompt));
  const parsedOutput = answeredQuestions
    .matchAll(/[\n.]*Question:(.*)[\n.]*Answer:(.*)/gim)
    .toArray();
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
  const parsedOutput = validatedAnswers
    .matchAll(/[\n.]*Question:(.*)[\n.]*Answer:(.*)[\n.]*Valid:(.*)/gim)
    .toArray();
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

const enrichText = async (
  text,
  transformedText,
  questions,
  transformationCommand,
  format
) => {
  const prompt = enrichTextPrompt(
    text,
    transformedText,
    questions,
    transformationCommand,
    format
  );
  const enrichedText = await invokeLLM(prompt, getMaxTokens(prompt));
  const parsedOutput = enrichedText.match(
    /[\n.]*Thought:\n*(.*)Output:\n*(.*)Observation:\n*(.*)/is
  );
  const enriched = {
    thought: parsedOutput[1].trim(),
    output: parsedOutput[2].trim(),
    observation: parsedOutput[3].trim(),
  };
  return enriched;
};
