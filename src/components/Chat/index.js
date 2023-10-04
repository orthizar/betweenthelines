import React, { useState } from "react";

import { sendChatGptRequest } from "../Helpers/request";

const Chat = ({ getEditorText, setFormattedValue }) => {
  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: "User", text: "Hello, how may I help you?" },
  ]);

  const [message, setMessage] = useState("");

  const isMyMessage = (author) => author === "Me";

  const sendMessage = async () => {
    if (message.trim() !== "") {
      const newMessage = {
        id: chatMessages.length + 1,
        author: "Ich",
        text: message,
      };
      const gptResponse = await sendChatGptRequest(message, getEditorText());
      console.log(gptResponse);
      setFormattedValue(gptResponse);
      setChatMessages([...chatMessages, newMessage]);
      setMessage("");
    }
  };

  return (
    <div className="bg-white shadow-xl p-8 rounded-lg w-2/5 flex flex-col mr-6 max-h-[37rem] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chat</h2>
      </div>
      <div className="mb-6 flex-grow overflow-y-auto">
        {chatMessages.map((chatMessage) => (
          <div
            key={chatMessage.id}
            className={`p-3 rounded-lg mb-3 ${
              isMyMessage(chatMessage.author)
                ? "bg-blue-200 text-right"
                : "bg-gray-200"
            }`}
          >
            <p>{chatMessage.text}</p>
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
