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

  const [chatMessages, setChatMessages] = useState([
    {id: 1, author: 'User', text: 'Hallo! Wie geht es Ihnen?'},
    {id: 2, author: 'Ich', text: 'Mir geht es gut. Danke!'}
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
      sendChatGptRequest(newMessage.text, inputValue);
      setChatMessages([...chatMessages, newMessage]);
      setMessage('');
    }
  };

  const sendChatGptRequest = async(inputChat, inputText ) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/completions";

    try {
      const response = await axios.post(
          apiUrl,
          {
            model: "gpt-3.5-turbo-instruct",
            prompt: `This is my current Context: ${inputText}, Please do this Command: ${inputChat}, give me the Mail Body back`,
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
      setInputValue(gptResponse);
    } catch (error) {
      console.error("Fehler bei der API-Anfrage:", error);
    }

  };

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
    {id: "improve-button", label: "Improve", color: "bg-blue-400 hover:bg-blue-700"},
    {id: "professional-button", label: "Professional", color: "bg-green-400 hover:bg-green-700"},
    {id: "colloquially-button", label: "Colloquially", color: "bg-orange-400 hover:bg-orange-700"},
    {id: "persuasive-button", label: "Persuasive", color: "bg-indigo-400 hover:bg-indigo-700"},
  ];

  const ButtonGroup = () =>
      buttons.map((button) => (
          <button
              key={button.id}
              onClick={(event) => handleSubmit(event, button.label)}
              className="textStyleButton"
              style={{backgroundColor: button.color}}
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
        <textarea
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Hier Text eingeben..."
            value={inputValue}
            className="w-full p-4 border rounded-md resize-none text-lg"
            rows="15"
        ></textarea>
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
                      navigator.clipboard.writeText(inputValue);
                      setIsCopied(true);
                    }}/>
                )}
                <RiDeleteBin6Line className="text-red-600 cursor-pointer" size={28} onClick={() => setInputValue('')}/>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
export default ChatGPT;