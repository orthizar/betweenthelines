export const correctionsPrompt = (text) => {
    return `
    Correct the following text delimited by triple quotes and provide corrections in a JSON array format. Only correct what is actually wrong. Use the following structure:
    {
        "corrections": [
            {
            "start": number,
            "end": number,
            "correction": string,
            "explanation": string
            }
        ]
    }

    If there are no mistakes, keep the array empty:
    {
        "corrections": []
    }

    start is the start index of the characters to be corrected.
    end is the end index of the characters to be corrected.
    Make sure that start and end are correct and the range can be replaced with the correction. The first character has index 0.
    Correction are the corrected characters.
    Explaination is to explain why the correction is necessary.
    Text to be corrected:
    """${text}"""`
}
export const improvementPrompt = (improvementType, text) => {
    return `Make this text ${improvementType} and correct all spelling mistakes : ${text}`;
}
export const chatPrompt = (chatText, text) => {
    return `
    User request:
    """${chatText}"""
    Edit the Editor text per user's request. Return the Editor text as is, if you do not understand the user's request.
    Output should contain your answer to the user, followed by a "---" and the text to be displayed in the editor.
    Editor text:
    """${text}"""
    Output:`;
}