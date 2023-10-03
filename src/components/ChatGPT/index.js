import React, {useEffect, useState} from "react";

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
      "https://api.openai.com/v1/completions";

    try {
      const response = await axios.post(
        apiUrl,
        {
          model: "gpt-3.5-turbo-instruct",
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
    { id: "improve-button", label: "Improve", color: "bg-blue-600 hover:bg-blue-700" },
    { id: "professional-button", label: "Professional", color: "bg-green-600 hover:bg-green-700" },
    { id: "colloquially-button", label: "Colloquially", color: "bg-orange-600 hover:bg-orange-700" },
    { id: "persuasive-button", label: "Persuasive", color: "bg-indigo-600 hover:bg-indigo-700" },
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
      <div className="p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-xl p-8 rounded-lg w-4/5 max-w-4xl flex flex-col">
          <div className="mb-6 flex-grow">
          <textarea
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Enter your text here"
              value={inputValue}
              className="w-full p-4 border rounded-md resize-none text-lg"
              rows="7"
          ></textarea>
          </div>
          <div className="flex justify-between items-center">
            <div className="space-x-4">
              {buttons.map((button) => (
                  <button
                      key={button.id}
                      onClick={(event) => handleSubmit(event, button.label)}
                      className={`text-white py-2 px-5 rounded text-lg ${button.color}`}
                  >
                    {button.label}
                  </button>
              ))}
            </div>
            <div className="space-x-4 flex items-center">
              {isCopied ? (
                  <BsCheckLg className="text-green-600" size={28} />
              ) : (
                  <GoCopy className="text-blue-600 cursor-pointer" size={28} onClick={handleCopy} />
              )}
              <RiDeleteBin6Line className="text-red-600 cursor-pointer" size={28} onClick={handleDelete} />
            </div>
          </div>
        </div>
      </div>
  );
};

export default ChatGPT;
