import { chatPrompt, correctionsPrompt, improvementPrompt, creatingQuestionsPromt, checkingQuestionsPromt} from "./prompts";

import axios from "axios";

export const sendChatGptRequest = async (inputChat, editorText) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/completions";

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo-instruct",
        prompt: chatPrompt(inputChat, editorText),
        max_tokens: 999,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gptResponse = response.data.choices[0].text;
    return gptResponse;
  } catch (error) {
    console.error("Fehler bei der API-Anfrage:", error);
  }
};

export const sendCorrectionRequest = async (editorRef) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/completions";

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo-instruct",
        prompt: correctionsPrompt(editorRef.current.editor.getText()),
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gptResponse = response.data.choices[0].text;
    const corrections = JSON.parse(gptResponse).corrections;
    return corrections;
  } catch (error) {
    console.error("Fehler bei der API-Anfrage:", error);
  }
};

export const sendButtonRequest = async (editorRef, improvementType) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/completions";
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo-instruct",
        prompt: improvementPrompt(
          improvementType,
          editorRef.current.editor.getText()
        ),
        max_tokens: 50,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const gptResponse = response.data.choices[0].text;
    return gptResponse;
  } catch (error) {
    console.error("Fehler bei der API-Anfrage:", error);
  }
};


export const creatingQuestions = async (editorText) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/completions";

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo-instruct",
        prompt: creatingQuestionsPromt(editorText),
        max_tokens: 999,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gptResponse = response.data.choices[0].text;
    return gptResponse;
  } catch (error) {
    console.error("Fehler bei der API-Anfrage:", error);
  }
};

export const checkingQuestions = async (editorText, questions) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/completions";

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo-instruct",
        prompt: checkingQuestionsPromt(editorText, questions),
        max_tokens: 999,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gptResponse = response.data.choices[0].text.replace(/\n/g, '');
    
    return gptResponse;
  } catch (error) {
    console.error("Fehler bei der API-Anfrage:", error);
  }
};
