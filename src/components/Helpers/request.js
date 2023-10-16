import axios from "axios";

export const invokeLLM = async (prompt, tokens) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/completions";

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

    const gptResponse = response.data.choices[0].text;
    return gptResponse;
  } catch (error) {
    console.error("OpenAI Error:", error);
  }
};

export const sendImageRequest = async (imageData) => {
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  try {
    const response = await axios.post(
      apiUrl,
      {
        requests: [
          {
            image: { content: imageData.split(",")[1] }, // extract the base64 part
            features: 
            [
              { type: "LABEL_DETECTION" },
              { type: "DOCUMENT_TEXT_DETECTION" },
              { type: "LOGO_DETECTION" },
              { type: "WEB_DETECTION" },
              { type: "OBJECT_LOCALIZATION" }
            ]
          }
        ]

      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const annotations = response.data.responses[0];
    return annotations;
  } catch (error) {
    console.error("Google Vision error:", error);
  }
};