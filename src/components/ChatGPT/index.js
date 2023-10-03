import React, { useState } from "react";

import { BsCheckLg } from "react-icons/bs";
import { GoCopy } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";
// import { GrammarlyEditorPlugin } from "@grammarly/editor-sdk-react";
import axios from "axios";

const ChatGPT = () => {
  const [gptResponse, setGptResponse] = useState(null);
  const [inputValue, setInputValue] = useState();
  const [isCopied, setIsCopied] = useState(false);

  const sendGptRequest = async (inputText, improvementType) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const apiUrl =
      "https://api.openai.com/v1/engines/text-davinci-003/completions";

    try {
      const response = await axios.post(
        apiUrl,
        {
          prompt: `Make this text ${improvementType} and correct all spelling mistakes : ${inputText}`,
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
      setGptResponse(gptResponse);
      setInputValue(gptResponse);
    } catch (error) {
      console.error("Fehler bei der API-Anfrage:", error);
    }
  };

  const buttons = [
    { id: "improve-button", label: "Improve", color: "#5f76a5" },
    { id: "professional-button", label: "Professional", color: "#4c7937" },
    { id: "colloquially-button", label: "Colloquially", color: "#794e37" },
    { id: "persuasive-button", label: "Persuasive", color: "#374c79" },
  ];

  const ButtonGroup = () =>
    buttons.map((button) => (
      <button
        key={button.id}
        onClick={(event) => handleSubmit(event, button.label)}
        className="textStyleButton"
        style={{ backgroundColor: button.color }}
      >
        {button.label}
      </button>
    ));

  const handleSubmit = (event, improvementType) => {
    event.preventDefault();
    sendGptRequest(inputValue, improvementType);
  };

  const handleDelete = (event) => {
    event.preventDefault();
    setGptResponse("");
    setInputValue("");
    setIsCopied(false);
  };

  const handleCopy = (event) => {
    event.preventDefault();
    navigator.clipboard.writeText(gptResponse).then(() => {
      setIsCopied(true);
    });
  };

  return (
    <div>
      <div>
        <div>
          <textarea
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Enter your text here"
            value={inputValue}
          ></textarea>
          <div>
            <div>
              <ButtonGroup />
            </div>
            <div>
              {isCopied ? <BsCheckLg /> : <GoCopy onClick={handleCopy} />}
              <RiDeleteBin6Line onClick={handleDelete} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatGPT;
