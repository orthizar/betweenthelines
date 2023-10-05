import React, { useState } from "react";
import { sendChatGptRequest } from "../Helpers/request";

const setCookie = (name, value, min = 10) => {
  const date = new Date();
  date.setTime(date.getTime() + (min * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const cookieValue = getCookie('chatMessages');
const initialChatMessages = cookieValue ? JSON.parse(cookieValue) : [{ id: 1, author: "Bot", text: "Hello, how may I help you?" }];

const Chat = ({ getEditorText, setFormattedValue }) => {
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [message, setMessage] = useState("");

  const updateChatMessages = (newMessages) => {
    setChatMessages(newMessages);
    setCookie('chatMessages', JSON.stringify(newMessages));
  };

  const isMyMessage = (author) => author === "User";

  const sendMessage = async () => {
    if (message.trim() !== "") {
      updateChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        author: "User",
        text: message,
      }]);

      setMessage("");
      const gptResponse = await sendChatGptRequest(message, getEditorText());
      const gptResponseChat = gptResponse.split("---")[1];
      const gptResponseEditor = gptResponse.split("---")[0];
      updateChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        author: "User",
        text: message,
      }, {
        id: chatMessages.length + 2,
        author: "Bot",
        text: gptResponseChat,
      }]);
      
      console.log(gptResponseEditor.replace(/(?:\r\n|\r|\n|\\n)/g, '<br>'));
      const value = gptResponseEditor.replace(/(?:\r\n|\r|\n|\\n)/g, '<br>');
      setFormattedValue(value);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto max-h-[22rem]">
        <div className="mb-6 overflow-y-auto px-4">
          {chatMessages.map((chatMessage) => (
            <div key={chatMessage.id} className={`flex flex-col mb-3 ${isMyMessage(chatMessage.author) ? "items-end" : "items-start"}`}>
              <div className={`text-xs mb-1 ${isMyMessage(chatMessage.author) ? "text-gray-600 mr-1" : "text-gray-600 ml-1"}`}>
                {!isMyMessage(chatMessage.author) && (
                  <div className="text-xs mb-1 text-gray-600">
                    {chatMessage.author}
                  </div>
                )}
              </div>
              <div className={'max-w-[15rem]'}>
                <div
                  className={`relative p-3 rounded-lg ${isMyMessage(chatMessage.author)
                    ? "bg-blue-200 text-right mr-1"
                    : "bg-gray-200 ml-1"
                  }`}
                >
                  <p>{chatMessage.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="">
        <textarea
          onChange={(event) => setMessage(event.target.value)} onKeyDown={handleKeyDown}
          placeholder="Enter message..."
          value={message}
          className="w-full p-2 border rounded-md resize-none mb-2"
          rows="2"
          maxLength={280}
        ></textarea>
        <button
          onClick={sendMessage}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
