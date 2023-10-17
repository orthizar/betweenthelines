export const getMaxTokens = (prompt) => {
  return 4096 - ~~(prompt.length / 3.5);
};
const formatInstrucions = {
  email: `
The text must be in the format of an email.
Parts of an email body:
- Opening
- Content
- Closing
- Signature`.trim(),
};

export const transformTextPrompt = (text, imageAnnotations, transformationCommand, format) => {
  const imageInstructions = `
Image Labels: the labels that describe the image, wrapped in square brackets.
Image Text: the text that is in the image, wrapped in square brackets.
Image Logos: the logos that are in the image, wrapped in square brackets.
Image Web: the web entities that are in the image, wrapped in square brackets.
Image Objects: the objects that are in the image, wrapped in square brackets.
`.trim();
  const formattedImageAnnotations = imageAnnotations ? `
Image Labels: ${imageAnnotations.labels ? "[" + imageAnnotations.labels.join(",") + "]" : "No labels found."}
Image Text: ${imageAnnotations.text ? "[" + imageAnnotations.text.join(",") + "]" : "No text found."}
Image Logos: ${imageAnnotations.logos ? "[" + imageAnnotations.logos.join(",") + "]" : "No logos found."}
Image Web: ${imageAnnotations.web ? "[" + imageAnnotations.web.join(",") + "]" : "No web entities found."}
Image Objects: ${imageAnnotations.objects ? "[" + imageAnnotations.objects.join(",") + "]" : "No objects found."}
`.trim() : "";
  return `
Execute the following transformation commands for me.
Use the following format:

Text: the source text you want to transform ${imageAnnotations ? "\n" + imageInstructions : ""}
Layout: the layout the text should be in
Transformation: the transformations you should do to the source text. Do not make any changes that are not asked for.
Thought: you should always think about what to do
Output: the transformed text in the correct layout. Do not include part titles (e.g. "Opening", "Content", "Closing", "Signature") or any other information that is not part of the text.
Observation: Describe what you did in max 15 words

Begin! Remember to use the correct format.
Text: ${text} ${imageAnnotations ? "\n" + formattedImageAnnotations : ""}
Layout: ${formatInstrucions[format]}
Transformation: ${transformationCommand}`.trim();
};

export const generateQuestionsPrompt = (text) => {
  return `
Generate questions about the following text.
Use the following format:

Text: the source text you want to generate questions for

Question: the question you want to generate. The question should be about the information contained in the text, not about the text itself (no formatting, no layout, no spelling, no grammar questions, etc.)
... (this is repeated for all questions max 5 questions)

Begin! Remember to use the correct format.
Text: ${text}`.trim();
};

export const answerQuestionsPrompt = (text, questions) => {
  const formattedQuestions = "[" + questions.join(",") + "]";
  return `
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
};

export const validateAnswersPrompt = (text, questions, answers) => {
  var formattedQuestions = "[";
  var formattedAnswers = "[";
  questions.forEach((question, index) => {
    formattedQuestions += question;
    formattedAnswers += answers.find(
      (answer) => answer.question === question
    ).answer;
    if (index < questions.length - 1) {
      formattedQuestions += ",";
      formattedAnswers += ",";
    }
  });
  formattedQuestions += "]";
  formattedAnswers += "]";
  return `
Verify the following answers.
Do not stop until all answers are verified.
Use the following format:

Text: the source text you want to verify the answers for
Questions: the list of questions you want to verify the answers for, wrapped in square brackets
Answers: the list of answers you want to verify, wrapped in square brackets

Question: the current question you want to verify the answer for
Answer: the current answer you want to verify
Valid: yes or no
... (this Question/Answer/Valid is repeated for all questions)

Begin! Remember to use the correct format.
Text: ${text}
Questions: ${formattedQuestions}
Answers: ${formattedAnswers}`.trim();
};

export const enrichTextPrompt = (
  text,
  transformedText,
  questions,
  transformationCommand,
  format
) => {
  const formattedQuestions = "[" + questions.join(",") + "]";
  return `
The text was transformed but is missing some information.
Include the information in the output but make sure to be in line with the transformation command.
Use the following format:

Text: the source text you want to transform
Transformation: the transformations you should do to the source text
Transformed Text: the transformed text that is missing information
Layout: the layout the text should be in
Information: the information you want to make sure is included in the transformed text
Thought: you should always think about what to do.
Output: the output text in the correct layout. Do not include part titles (e.g. "Opening", "Content", "Closing", "Signature") or any other information that is not part of the text.
Observation: Describe what you did in max 15 words

Begin! Remember to use the correct format.

Text: ${text}
Transformation: ${transformationCommand}
Transformed Text: ${transformedText}
Layout: ${formatInstrucions[format]}
Information: ${formattedQuestions}`.trim();
};

export const suggestPrompt = (text, messages, format) => {
  const formattedMessages =
    messages.length > 0
      ? messages.length === 1
        ? messages[0]
        : "[" + messages.join(",") + "]"
      : "No previous commands.";
  return `
Suggest ways to improve the text. Formulate the suggestion as a command.
Do not repeat previous commands, when not necessary.
Only suggest commands that are relevant for the text and can be applied to the text.
If text is empty, suggest a command to generate a ${format} template.
Use the following format:

Text: the source text you want to predict the next command for.
Commands: the previous commands that were applied to the text, wrapped in square brackets.
Command: the suggested command.

Begin! Remember to use the correct format.
Text: ${text}
Commands: ${formattedMessages}`.trim();
};

const suggestEditsPrompt = (text, edits) => {
  const formattedEdits = "TODO";
  return `
Suggest edits to the text that are in line with the previous edits from the user.
Use the following format:

Text: the source text you want to edit
Edits: the previous edits that were applied to the text, wrapped in square brackets
Edit: the suggested edit
Edited Text: the text after applying the suggested edit

Begin! Remember to use the correct format.
Text: ${text}
Edits: ${formattedEdits}`.trim();
};