const formatInstrucions = {
    email: `
The text must be in the format of an email.
Parts of an email:
- Opening
- Body
- Closing
- Signature`.trim(),
};

export const transformTextPrompt = (text, format, transformationCommand) => {
    return `
Execute the following transformation commands for me.
Use the following format:

Text: the source text you want to transform
Format: the format the text should be in
Transformation: the transformations you should do to the source text
Thought: you should always think about what to do
Output: the transformed text in the correct format
Observation: Describe what you did in max 15 words

Begin! Remember to use the correct format.
Text: ${text}
Format: ${formatInstrucions[format]}
Transformation: ${transformationCommand}`.trim();
};

