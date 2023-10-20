import { CHAT_LABEL, HISTORY_LABEL } from "../Constants";
import React, { useState } from "react";

import Chat from "../Chat/index";
import History from "../History/index";
import Menu from "../Menu/index";

const getSessionData = (name) => {
  try {
    return sessionStorage.getItem(name);
  } catch (e) {
    console.error("Failed to retrieve session data:", e);
    return null;
  }
};

const WindowControl = ({
  getPlainText,
  setTextWithHtml,
  activeVersion,
  setActiveVersion,
  shouldRefine,
  workingSource,
  setWorkingSource,
}) => {
  const [activeMenuItem, setActiveMenuItem] = useState("chat");
  const cookieValue = getSessionData("chatMessages");

  const initialChatMessages = cookieValue
    ? JSON.parse(cookieValue)
    : [
        {
          id: 1,
          author: "Assistant",
          text: "Hello, how may I help you?",
        },
      ];

  const activeComponent =
    (activeMenuItem === CHAT_LABEL && (
      <Chat
        getPlainText={getPlainText}
        setTextWithHtml={setTextWithHtml}
        state={initialChatMessages}
        shouldRefine={shouldRefine}
        workingSource={workingSource}
        setWorkingSource={setWorkingSource}
        setActiveVersion={setActiveVersion}
      />
    )) ||
    (activeMenuItem === HISTORY_LABEL && (
      <History
        getPlainText={getPlainText}
        setTextWithHtml={setTextWithHtml}
        activeVersion={activeVersion}
        setActiveVersion={setActiveVersion}
      />
    ));

  return (
    <div className="bg-white shadow-xl p-8 rounded-lg w-full md:w-[32%] flex flex-none flex-col">
      <div className="flex justify-between items-center mb-4">
        <Menu
          activeMenuItem={activeMenuItem}
          setActiveMenuItem={setActiveMenuItem}
        />
      </div>
      {activeComponent}
    </div>
  );
};

export default WindowControl;
