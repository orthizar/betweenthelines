import React, { useEffect, useRef, useState } from "react";

import { BiImageAdd } from "react-icons/bi";
import { BsStars } from "react-icons/bs";
import { annotateImage } from "../Helpers/image";
import { createVersion } from "../Helpers/versions";
import { invokePipeline } from "../Helpers/refine";
import { suggest } from "../Helpers/learn";
import { useCallback } from "react";

const setSessionData = (name, value) => {
  try {
    sessionStorage.setItem(name, value);
  } catch (e) {
    console.error("Failed to save session data:", e);
  }
};

const Chat = ({
  getPlainText,
  setTextWithHtml,
  state,
  shouldRefine,
  workingSource,
  setWorkingSource,
  setActiveVersion,
}) => {
  const chatContainerRef = useRef(null);
  const chatInputRef = useRef(null);
  const [chatMessages, setChatMessages] = useState(state);
  const [image, setImage] = useState(null);
  const [imageAnnotations, setImageAnnotations] = useState(null);
  const [chatInputDisabled, setChatInputDisabled] = useState(false);
  const [message, setMessage] = useState("");
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    scrollToBottom();
  });

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const updateChatMessages = (newMessages) => {
    setChatMessages(newMessages);
    setSessionData("chatMessages", JSON.stringify(newMessages));
  };

  const isMyMessage = (author) => author === "User";

  const sendMessage = async () => {
    if (message.trim() !== "") {
      setWorkingSource("chat");
      var messages;
      if (image !== null) {
        messages = [
          ...chatMessages,
          {
            id: chatMessages.length + 1,
            author: "User",
            image: image,
          },
          {
            id: chatMessages.length + 2,
            author: "User",
            text: message,
          },
        ];
      } else {
        messages = [
          ...chatMessages,
          {
            id: chatMessages.length + 1,
            author: "User",
            text: message,
          },
        ];
      }

      setMessage("");
      setImage(null);
      setImageAnnotations(null);
      updateChatMessages(messages);
      setChatInputDisabled(true);
      for await (const transformed of invokePipeline(
        getPlainText(),
        imageAnnotations,
        message,
        shouldRefine
      )) {
        if (transformed.output === undefined) {
          if (transformed !== messages[messages.length - 1].text) {
            messages = [
              ...messages,
              {
                id: messages.length + 1,
                author: "Bot",
                text: transformed,
              },
            ];
            updateChatMessages(messages);
          }
        } else {
          const transformedText = transformed.output;
          const value = transformedText
            .replace(/(?:\r\n|\r|\n|\\n)/g, "\n")
            .trim()
            .replace(/\n/g, "<br>");
          setTextWithHtml(value);
          const newActiveVersion = createVersion(
            message,
            getPlainText(),
            value
          );
          setActiveVersion(newActiveVersion);
          setChatInputDisabled(false);
          setWorkingSource(null);
          setSuggestion(null);
          return;
        }
      }
      setChatInputDisabled(false);
      setWorkingSource(null);
      setSuggestion(null);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setImage(reader.result);

        const annotations = await annotateImage(reader.result);
        setImageAnnotations(annotations);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const getPlainTextCallback = useCallback(() => {
    return getPlainText();
  }, [getPlainText]);

  useEffect(() => {
    if (suggestion === null) {
      const messages = chatMessages
        .filter((message) => isMyMessage(message.author))
        .map((message) => message.text);
      console.log("suggest");
      suggest(getPlainTextCallback(), messages).then((suggestion) => {
        setSuggestion(suggestion);
      });
    }
  }, [chatMessages, suggestion, getPlainTextCallback]);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="overflow-y-auto max-h-80" ref={chatContainerRef}>
        <div className="overflow-y-auto px-4">
          {chatMessages.map((chatMessage) => (
            <div
              key={chatMessage.id}
              className={`flex flex-col mb-3 ${
                isMyMessage(chatMessage.author) ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`text-xs mb-1 ${
                  isMyMessage(chatMessage.author)
                    ? "text-gray-600 mr-1"
                    : "text-gray-600 ml-1"
                }`}
              >
                {!isMyMessage(chatMessage.author) && (
                  <div className="text-xs mb-1 text-gray-600">
                    {chatMessage.author}
                  </div>
                )}
              </div>
              <div className={"max-w-[15rem]"}>
                <div
                  className={`relative p-3 rounded-lg ${
                    isMyMessage(chatMessage.author)
                      ? "bg-blue-200 text-right mr-1"
                      : "bg-gray-200 ml-1"
                  }`}
                >
                  {chatMessage.text && <p>{chatMessage.text}</p>}
                  {chatMessage.image && (
                    <img
                      src={chatMessage.image}
                      alt="Uploaded content"
                      className="max-w-full max-h-40"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="">
        <button
          className="text-xs w-full p-1 border rounded-md text-left text-gray mb-2 flex items-center"
          onClick={() => {
            setMessage(suggestion);
            setSuggestion(null);
            setTimeout(() => chatInputRef.current.focus(), 0);
          }}
          disabled={chatInputDisabled || suggestion === null}
        >
          <BsStars className="flex-shrink-0 mr-2" />{" "}
          {suggestion !== null ? suggestion : "Please wait..."}
        </button>
        <textarea
          ref={chatInputRef}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => setTimeout(() => handleKeyDown(event), 0)}
          placeholder={
            chatInputDisabled ? "Please wait..." : "Type your message here..."
          }
          disabled={chatInputDisabled}
          value={message}
          className="w-full p-2 border rounded-md resize-none mb-2"
          rows="2"
          maxLength={280}
        ></textarea>
        <div className="flex justify-between gap-1">
          <input
            type="file"
            id="image-input"
            onChange={handleImageChange}
            accept="image/*"
            className="mb-2 hidden"
          ></input>
          <label htmlFor="image-input">
            <div className="bg-blue-500 h-10 w-10 p-1 text-white rounded flex items-center justify-center cursor-pointer">
              {image ? (
                <img
                  src={image}
                  alt="Uploaded content"
                  className="max-w-full max-h-full"
                />
              ) : (
                <BiImageAdd className="text-lg text-white cursor-pointer" />
              )}
            </div>
          </label>
          <button
            onClick={sendMessage}
            className="w-full bg-blue-500 h-10 text-white rounded"
            disabled={workingSource !== null}
          >
            {workingSource === "chat" ? (
              <div className="inline-block h-7 w-7 animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite] rounded-full border-4 border-solid border-current border-r-transparent align-[-0.25em] text-white" />
            ) : (
              <p className="m-2">Send</p>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
