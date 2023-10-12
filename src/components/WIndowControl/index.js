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

const WindowControl = ({ getCurrentTextInEditor, setTextWithHtml }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("chat");

  const cookieValue = getSessionData("chatMessages");
  const initialChatMessages = cookieValue
    ? JSON.parse(cookieValue)
    : [{ id: 1, author: "Bot", text: "Hello, how may I help you?" }];

  const activeComponent =
    (activeMenuItem === CHAT_LABEL && (
      <Chat
        getCurrentTextInEditor={getCurrentTextInEditor}
        setTextWithHtml={setTextWithHtml}
        state={initialChatMessages}
      />
    )) ||
    (activeMenuItem === HISTORY_LABEL && (
      <History
        getCurrentTextInEditor={getCurrentTextInEditor}
        setTextWithHtml={setTextWithHtml}
      />
    ));

  return (
    <div className="bg-white shadow-xl p-8 rounded-lg w-2/5 flex flex-col mr-6">
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
