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
      const gptResponse = await sendChatGptRequest(message, getEditorText());
      console.log(gptResponse);
      const gptResponseChat = gptResponse.split("---")[0];
      const gptResponseEditor = gptResponse.split("---")[1];
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        author: "User",
        text: message,
      }, {
        id: chatMessages.length + 2,
        author: "Bot",
        text: gptResponseChat,
      }]);
      setFormattedValue(gptResponseEditor);
      setMessage("");
    }
  };

  return (
    <div className="bg-white shadow-xl p-8 rounded-lg w-2/5 flex flex-col mr-6 max-h-[37rem] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chat</h2>
      </div>
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
              <div
                  className={`relative p-3 rounded-lg ${isMyMessage(chatMessage.author)
                      ? "bg-blue-200 text-right mr-1"  // Added right margin for user's messages
                      : "bg-gray-200 ml-1"             // Added left margin for other messages
                  }`}
              >
                <p>{chatMessage.text}</p>
              </div>
            </div>
        ))}
      </div>
      <div className="mt-auto">
        <textarea
          onChange={(event) => setMessage(event.target.value)}
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
