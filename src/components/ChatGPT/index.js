import "react-quill/dist/quill.snow.css";

import React, { useState, version } from "react";

import { BsCheckLg } from "react-icons/bs";
import { GoCopy } from "react-icons/go";
import ReactQuill from "react-quill";
import { RiDeleteBin6Line } from "react-icons/ri";
import axios from "axios";
import buttons from "./buttons.json";
import { generateUUIDv4 } from "../Helpers";

const ChatGPT = () => {
  const [gptResponse, setGptResponse] = useState(null);
  const [inputValue, setInputValue] = useState();
  const [formattedValue, setFormattedValue] = useState();
  const [isCopied, setIsCopied] = useState(false);
  const [gptCorrections, setGptCorrections] = useState([]);
  const editorRef = React.useRef(null);
  const [currentVersion, setCurrentVersion] = useState("original");
  const [versions, setVersions] = useState([
    { id: "original", name: "original", text: "test" },
  ]);

  const sendGptRequest = async (inputText, improvementType) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/completions";
    if (improvementType === "Correct") {
      try {
        const response = await axios.post(
          apiUrl,
          {
            model: "gpt-3.5-turbo-instruct",
            prompt:
              'Please output a json object with an array of all the mistakes in the text. Allowed types are "style", "spelling", "grammar". Use format with character range: { "corrections": [ { "index": 0, "length": 5, "correction": "Hello", "type": "spelling", "explanation": "Typo, change to \'Hello\'" } ] }. Text: \n"' +
              inputText +
              '"\n\nThe array should be empty if there are no mistakes. Do not output anything else than JSON. Valid JSON Output: \n',
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

        setGptCorrections(JSON.parse(responseData).corrections);
        // format quill editor text with corrections
        JSON.parse(responseData).corrections.forEach((correction) => {
          editorRef.current.editor.formatText(
            correction.index,
            correction.length,
            { color: "red" }
          );
        });
      } catch (error) {
        console.error("Fehler bei der API-Anfrage:", error);
      }
    } else {
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
        setVersions([...versions, { id: generateUUIDv4(), text: gptResponse }]);
      } catch (error) {
        console.error("Fehler bei der API-Anfrage:", error);
      }
    }
  };

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
  };

  const getCorrection = (index) => {
    for (var i = 0; i < gptCorrections.length; i++) {
      if (
        index >= gptCorrections[i].index &&
        index <= gptCorrections[i].index + gptCorrections[i].length
      ) {
        return gptCorrections[i];
      }
    }
    return null;
  };

  const Pager = () => (
    <nav aria-label="Page navigation example">
      <ul className="flex items-center -space-x-px h-8 text-sm">
        <li>
          <p className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
            <span className="sr-only">Previous</span>
            <svg
              className="w-2.5 h-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 1 1 5l4 4"
              />
            </svg>
          </p>
        </li>

        {versions.map((version, index) => (
          <li key={version.id}>
            <p
              className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={() => setCurrentVersion(version.id)}
            >
              {version.name === "original" ? version.name : index}
            </p>
          </li>
        ))}

        <li>
          <p className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
            <span className="sr-only">Next</span>
            <svg
              className="w-2.5 h-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </p>
        </li>
      </ul>
    </nav>
  );

  const getVersion = () => {
    const currentVersionObj = versions.find(
      (version) => version.id === currentVersion
    );
    if (currentVersionObj) {
      return currentVersionObj.text && currentVersionObj.text;
    }
    return "Original";
  };

  return (
    <div className="p-12 bg-gray-100 min-h-screen flex items-center justify-center flex-col">
      <div className="bg-white shadow-xl p-8 rounded-lg w-4/5 max-w-4xl flex flex-col">
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
              <GoCopy
                className="text-blue-600 cursor-pointer"
                size={28}
                onClick={handleCopy}
              />
            )}
            <RiDeleteBin6Line
              className="text-red-600 cursor-pointer"
              size={28}
              onClick={handleDelete}
            />
          </div>
        </div>
        <div className="mt-6 flex-grow">
          <ReactQuill
            ref={editorRef}
            theme="snow"
            placeholder="Enter your text here"
            value={formattedValue}
            className="w-full p-4 border rounded-md resize-none text-lg"
            onChange={(value, delta, source) => {
              if (source === "user") {
                const correction = getCorrection(delta.ops[0].retain);
                if (correction != null) {
                  editorRef.current.editor.removeFormat(
                    correction.index,
                    correction.length
                  );
                }
              } else {
                setFormattedValue(value);
              }
            }}
            modules={modules}
          />
        </div>
      </div>
      <div className="bg-white shadow-xl p-8 rounded-lg w-4/5 max-w-4xl flex flex-col mt-10 h-60 items-center justify-end">
        <div className="h-full w-full">{getVersion()}</div>
        <Pager />
      </div>
    </div>
  );
};

export default ChatGPT;
