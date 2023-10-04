import React, { useEffect, useState } from "react";

import { BsCheckLg } from "react-icons/bs";
import { GoCopy } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";
// import { GrammarlyEditorPlugin } from "@grammarly/editor-sdk-react";
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { correctionsPrompt, improvementPrompt, chatPrompt } from "./prompts";

const ChatGPT = () => {
  const [gptResponse, setGptResponse] = useState(null);
  const [formattedValue, setFormattedValue] = useState();
  const [gptCorrections, setGptCorrections] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const editorRef = React.useRef(null);

  const clearHighlighting = () => {
    editorRef.current.editor.removeFormat(0, editorRef.current.editor.getLength() - 1);
  };

  const highlightCorrections = (corrections) => {
    corrections.forEach(correction => {
      editorRef.current.editor.formatText(correction.start, correction.end - correction.start, { "color": "red" });
    });
  };

  const selectCorrection = (correction) => {
    editorRef.current.editor.removeFormat(correction.start, correction.end - correction.start)
    editorRef.current.editor.formatText(correction.start, correction.end - correction.start, { "background": "red" });
  };

  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: 'User', text: 'Hallo! Wie geht es Ihnen?' },
    { id: 2, author: 'Ich', text: 'Mir geht es gut. Danke!' }
  ]);

  const [message, setMessage] = useState('');

  const isMyMessage = (author) => author === 'Ich';

  const sendMessage = () => {
    if (message.trim() !== '') {
      const newMessage = {
        id: chatMessages.length + 1,
        author: 'Ich',
        text: message
      };
      sendChatGptRequest(newMessage.text);
      setChatMessages([...chatMessages, newMessage]);
      setMessage('');
    }
  };

  const sendChatGptRequest = async (inputChat) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/completions";

    try {
      const response = await axios.post(
        apiUrl,
        {
          model: "gpt-3.5-turbo-instruct",
          prompt: chatPrompt(inputChat, editorRef.current.editor.getText()),
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
      setGptResponse(gptResponse);
      setFormattedValue(gptResponse);
    } catch (error) {
      console.error("Fehler bei der API-Anfrage:", error);
    }

  };

  const sendGptRequest = async (inputText, improvementType) => {
    if (improvementType === "Correct") {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      const apiUrl =
        "https://api.openai.com/v1/completions";

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
        setGptCorrections(corrections);
      } catch (error) {
        console.error("Fehler bei der API-Anfrage:", error);
      }
    }
    else {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      const apiUrl =
        "https://api.openai.com/v1/completions";
      try {
        const response = await axios.post(
          apiUrl,
          {
            model: "gpt-3.5-turbo-instruct",
            prompt: improvementPrompt(improvementType, editorRef.current.editor.getText()),
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
        setFormattedValue(gptResponse);
      } catch (error) {
        console.error("Fehler bei der API-Anfrage:", error);
      }
    }
  };

  const buttons = [
    { id: "improve-button", label: "Improve", color: "bg-blue-400 hover:bg-blue-700" },
    { id: "professional-button", label: "Professional", color: "bg-green-400 hover:bg-green-700" },
    { id: "colloquially-button", label: "Colloquially", color: "bg-orange-400 hover:bg-orange-700" },
    { id: "persuasive-button", label: "Persuasive", color: "bg-indigo-400 hover:bg-indigo-700" },
    { id: "correct-button", label: "Correct", color: "bg-red-600 hover:bg-red-700" },
  ];

  const handleSubmit = (event, improvementType) => {
    event.preventDefault();
    sendGptRequest(editorRef.current.editor.getText(), improvementType);
  };

  const handleDelete = (event) => {
    event.preventDefault();
    setGptResponse("");
    setFormattedValue("");
    setIsCopied(false);
  };

  const handleCopy = (event) => {
    event.preventDefault();
    navigator.clipboard.writeText(gptResponse).then(() => {
      setIsCopied(true);
    });
  };
  const getCorrection = (index) => {
    for (var i = 0; i < gptCorrections.length; i++) {
      if (index >= gptCorrections[i].start && index <= gptCorrections[i].end) {
        return gptCorrections[i];
      }
    }
    return null;
  }
  var editorModules = {
    toolbar: null,

  }

  return (
    <div className="p-12 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="flex w-3/4 max-w-6xl h-[37rem]">
        {/* Chatbot-Bereich */}
        <div className="bg-white shadow-xl p-8 rounded-lg w-2/5 flex flex-col mr-6 max-h-[37rem] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Chat</h2>
          </div>
          <div className="mb-6 flex-grow overflow-y-auto">
            {chatMessages.map(chatMessage => (
              <div key={chatMessage.id}
                className={`p-3 rounded-lg mb-3 ${isMyMessage(chatMessage.author) ? "bg-blue-200 text-right" : "bg-gray-200"}`}>
                <p>{chatMessage.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-auto">
            <textarea
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Nachricht eingeben..."
              value={message}
              className="w-full p-2 border rounded-md resize-none mb-2"
              rows="3"
            ></textarea>
            <button onClick={sendMessage} className="w-full bg-blue-500 text-white p-2 rounded">Senden</button>
          </div>
        </div>

        {/* Hauptinhalt */}
        <div className="bg-white shadow-xl p-8 w-2/5 rounded-lg flex-grow flex flex-col">
          <div className="mb-6 flex-grow">
            {/* <textarea
              onChange={(event) => setFormattedValue(event.target.value)}
              placeholder="Hier Text eingeben..."
              value={editorRef.current.editor.getText()}
              className="w-full p-4 border rounded-md resize-none text-lg"
              rows="15"
            ></textarea> */}
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
                  editorRef.current.editor.removeFormat(correction.start, correction.end - correction.start)
                  // delete the correction and move all following corrections
                  setGptCorrections(gptCorrections.filter((item) => item !== correction));
                  setGptCorrections(gptCorrections.map((item) => {
                    var index = 0;
                    var indexDelta = 0;
                    delta.ops.forEach((op) => {
                      if (op.retain) {
                        index += op.retain;
                      } else if (op.insert) {
                        index += op.insert.length;
                        indexDelta += op.insert.length;
                      } else if (op.delete) {
                        index -= op.delete;
                        indexDelta -= op.delete;
                      }
                    });
                    item.start -= indexDelta;
                    item.end -= indexDelta;
                    return item;
                  }));
                }
              } else {
                setFormattedValue(value);
              }
            }}
            onChangeSelection={(selection, source, editor) => {
              console.log(selection, source);
              if (source === "user") {
                if (selection != null && selection.length === 0) {
                  const correction = getCorrection(selection.index);
                  if (correction != null) {
                    selectCorrection(correction);
                  } else {
                    clearHighlighting();
                    highlightCorrections(gptCorrections);
                  }
                }
              }
            }}
            modules={editorModules}
          />
          </div>
          <div className="flex justify-between items-center">
            <div className="space-x-4">
              {buttons.map((button) => (
                <button
                  key={button.id}
                  onClick={(event) => handleSubmit(event, button.label)}
                  className={`text-white py-1 px-2 rounded text-lg ${button.color}`}
                >
                  {button.label}
                </button>
              ))}
            </div>
            <div className="space-x-4 flex items-center">
              {isCopied ? (
                <BsCheckLg className="text-green-600" size={28} />
              ) : (
                <GoCopy className="text-blue-600 cursor-pointer" size={28} onClick={() => {
                  navigator.clipboard.writeText(editorRef.current.editor.getText());
                  setIsCopied(true);
                }} />
              )}
              <RiDeleteBin6Line className="text-red-600 cursor-pointer" size={28} onClick={() => setFormattedValue('')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ChatGPT;