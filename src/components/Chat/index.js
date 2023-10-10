import React, {useState, useRef, useEffect} from "react";
import {sendChatGptRequest, creatingQuestions, checkingQuestions} from "../Helpers/request";

const setSessionData = (name, value) => {
  try {
    sessionStorage.setItem(name, value);
  } catch (e) {
    console.error("Failed to save session data:", e);
  }
};

const Chat = ({ getEditorText, setFormattedValue, state }) => {
  const chatContainerRef = useRef(null);
  const [chatMessages, setChatMessages] = useState(state);
  const [message, setMessage] = useState("")

  useEffect(() => {
    scrollToBottom();
  })

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const updateChatMessages = (newMessages) => {
    setChatMessages(newMessages);
    setSessionData('chatMessages', JSON.stringify(newMessages));
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

      for (let i = 0; i < 3 ; i++){

        const questions = await creatingQuestions(getEditorText());
        
        const gptResponse = await sendChatGptRequest(message, getEditorText());
        const gptResponseChat = gptResponse.split("---")[1];
        const gptResponseEditor = gptResponse.split("---")[0];

        const confirmedQuestions = await checkingQuestions(gptResponseEditor, questions);

        if (confirmedQuestions === "True"){

          updateChatMessages([...chatMessages, {
            id: chatMessages.length + 1,
            author: "User",
            text: message,
          }, {
            id: chatMessages.length + 2,
            author: "Bot",
            text: gptResponseChat,
          }]);
    
          const value = gptResponseEditor.replace(/(?:\r\n|\r|\n|\\n)/g, '\n').trim().replace(/\n/g, '<br>');
          setFormattedValue(value);
          break;
        }
      }
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
      <div className="flex-grow overflow-y-auto max-h-[22rem]" ref={chatContainerRef} >
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
