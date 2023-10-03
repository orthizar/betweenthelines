import React, { useState } from "react";

import { BsCheckLg } from "react-icons/bs";
import { GoCopy } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";
// import { GrammarlyEditorPlugin } from "@grammarly/editor-sdk-react";
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const ChatGPT = () => {
  const [gptResponse, setGptResponse] = useState(null);
  const [inputValue, setInputValue] = useState();
  const [formattedValue, setFormattedValue] = useState();
  const [isCopied, setIsCopied] = useState(false);
  const [gptCorrections, setGptCorrections] = useState([]);

  const sendGptRequest = async (inputText, improvementType) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const apiUrl =
      "https://api.openai.com/v1/completions";
    if (improvementType === "Correct") {
      try {
        const response = await axios.post(
          apiUrl,
          {
            model: "gpt-3.5-turbo-instruct",
            prompt: 'Task: Correct all mistakes in the text. Output: A json object with an array of all the corrections. Allowed types are "style", "spelling", "grammar". Use format with character range: { "corrections": [ { "index": 0, "length": 5, "correction": "Hello", "type": "spelling", "explanation": "Please check spelling." } ] }. Text: \n"' + inputText + '"\n\nDo not output anything else than JSON. Valid JSON Output: \n',
            max_tokens: 200,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );
        const responseData = await response.data.choices[0].text;
        console.log(responseData);
        console.log(JSON.parse(responseData));
        setGptCorrections(JSON.parse(responseData).corrections);
      } catch (error) {
        console.error("Fehler bei der API-Anfrage:", error);
      }
    }
      else {
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
    }
  };

  const buttons = [
    { id: "improve-button", label: "Improve", color: "#5f76a5" },
    { id: "professional-button", label: "Professional", color: "#4c7937" },
    { id: "colloquially-button", label: "Colloquially", color: "#794e37" },
    { id: "persuasive-button", label: "Persuasive", color: "#374c79" },
    { id: "correct-button", label: "Correct", color: "#79374c" },
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

  var modules = {
    toolbar: null,

  }
  return (
    <div>
      <div>
        <div>
          <ReactQuill
            theme="snow"
            placeholder="Enter your text here"
            value={formattedValue}
            onChange={(value, delta, source, editor) => {
              var plainText = editor.getText();
              setInputValue(plainText);
            }}
            modules={modules}
          />
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
