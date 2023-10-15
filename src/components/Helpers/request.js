import axios from "axios";

export const invokeLLM = async (prompt, tokens) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const apiUrl = "http://localhost:3000/api/learn";

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo-instruct",
        prompt: prompt,
        max_tokens: tokens,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const gptResponse = response.data;
    return gptResponse;
  } catch (error) {
    console.error("OpenAI Error:", error);
  }
};