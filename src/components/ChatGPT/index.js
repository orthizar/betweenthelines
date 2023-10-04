import React, {useEffect, useState} from "react";

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
  const editorRef = React.useRef(null);

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
            prompt: 'Please output a json object with an array of all the mistakes in the text. Allowed types are "style", "spelling", "grammar". Use format with character range: { "corrections": [ { "index": 0, "length": 5, "correction": "Hello", "type": "spelling", "explanation": "Typo, change to \'Hello\'" } ] }. Text: \n"' + inputText + '"\n\nThe array should be empty if there are no mistakes. Do not output anything else than JSON. Valid JSON Output: \n',
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
        // format quill editor text with corrections
        JSON.parse(responseData).corrections.forEach(correction => {
          editorRef.current.editor.formatText(correction.index, correction.length, { "color": "red" });
        });
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
    { id: "improve-button", label: "Improve", color: "bg-blue-600 hover:bg-blue-700" },
    { id: "professional-button", label: "Professional", color: "bg-green-600 hover:bg-green-700" },
    { id: "colloquially-button", label: "Colloquially", color: "bg-orange-600 hover:bg-orange-700" },
    { id: "persuasive-button", label: "Persuasive", color: "bg-indigo-600 hover:bg-indigo-700" },,
    { id: "correct-button", label: "Correct", color: "bg-red-600 hover:bg-red-700" },
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
  const getCorrection = (index) => {
    for (var i = 0; i < gptCorrections.length; i++) {
      if (index >= gptCorrections[i].index && index <= gptCorrections[i].index + gptCorrections[i].length) {
        return gptCorrections[i];
      }
    }
    return null;
  }
  return (
      <div className="p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-xl p-8 rounded-lg w-4/5 max-w-4xl flex flex-col">
          <div className="mb-6 flex-grow">
          <ReactQuill
            ref={editorRef}
            theme="snow"
            placeholder="Enter your text here"
            value={formattedValue}
            className="w-full p-4 border rounded-md resize-none text-lg"
            onChange={(value, delta, source, editor) => {
              console.log(value, source);
              if (source === "user") {
                const correction = getCorrection(delta.ops[0].retain)
                console.log(correction);
                if (correction != null) {
                  editorRef.current.editor.removeFormat(correction.index, correction.length)
                }
              } else {
                setFormattedValue(value);
              }
            }}
            modules={modules}
          />
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
