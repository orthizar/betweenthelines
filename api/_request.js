import axios from "axios";

export const invokeLLM = async (prompt, tokens) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/completions";

  try {
    const response = await axios.post(apiUrl, {
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      max_tokens: tokens,
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    const gptResponse = response.data.choices[0].text;
    return gptResponse;
  } catch (error) {
    console.error("OpenAI Error:", error);
  }
};