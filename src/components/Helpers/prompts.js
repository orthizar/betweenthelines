const formatInstrucions = {
    email: `
The text must be in the format of an email.
Parts of an email body:
- Opening
- Content
- Closing
- Signature`.trim(),
};

export const transformTextPrompt = (text, transformationCommand, format) => {
    return `
Execute the following transformation commands for me.
Use the following format:

Text: the source text you want to transform
Layout: the layout the text should be in
Transformation: the transformations you should do to the source text. Do not make any changes that are not asked for.
Thought: you should always think about what to do
Output: the transformed text in the correct layout. Do not include part titles (e.g. "Opening", "Content", "Closing", "Signature") or any other information that is not part of the text.
Observation: Describe what you did in max 15 words

Begin! Remember to use the correct format.
Text: ${text}
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
        formattedAnswers += answers.find((answer) => answer.question === question).answer;
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

export const enrichTextPrompt = (text, transformedText, questions, transformationCommand, format) => {
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