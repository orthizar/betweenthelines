import React, { useState } from "react";

import { sendChatGptRequest } from "../Helpers/request";

const Chat = ({ getEditorText, setFormattedValue }) => {
  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: "Bot", text: "Hello, how may I help you?" },
  ]);

  const [message, setMessage] = useState("");

  const isMyMessage = (author) => author === "User";

  const sendMessage = async () => {
    if (message.trim() !== "") {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        author: "User",
        text: message,
      }]);
      setMessage("");
      const gptResponse = await sendChatGptRequest(message, getEditorText());
      const gptResponseChat = gptResponse.split("---")[1];
      const gptResponseEditor = gptResponse.split("---")[0];
      setChatMessages([...chatMessages, {
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
    if (event.key === 'Enter' && !event.shiftKey) {  // Checking for Enter key press without Shift
      event.preventDefault();  // Prevent default Enter key behavior (like submitting a form)
      sendMessage();
    }
  };

  return (
    <div>
      <div className="mb-6 flex-grow overflow-y-auto px-4"> {/* Added padding on the x-axis to the main container */}
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
                        ? "bg-blue-200 text-right mr-1"  // Right-aligned for user's messages
                        : "bg-gray-200 ml-1"             // Left-aligned for other messages
                    }`}
                >
                    <p>{chatMessage.text}</p>
                </div>
              </div>
            </div>
        ))}
      </div>
      <div className="mt-auto">
        <textarea
          onChange={(event) => setMessage(event.target.value)} onKeyDown={handleKeyDown}
          placeholder="Enter message..."
          value={message}
          className="w-full p-2 border rounded-md resize-none mb-2"
          rows="3"
        ></textarea>
        <button
          onClick={sendMessage}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          send
        </button>
      </div>
    </div>
  );
};

export default Chat;
