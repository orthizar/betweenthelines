import { CHAT_LABEL, HISTORY_LABEL } from "../Constants";
import React, { useState } from "react";

import Chat from "../Chat";
import History from "../History";
import Menu from "../Menu";

const getSessionData = (name) => {
    try {
        return sessionStorage.getItem(name);
    } catch (e) {
        console.error("Failed to retrieve session data:", e);
        return null;
    }
};

const WindowControl = ({ getEditorText, setFormattedValue }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("chat");

    const cookieValue = getSessionData('chatMessages');
    const initialChatMessages = cookieValue ? JSON.parse(cookieValue) : [{ id: 1, author: "Bot", text: "Hello, how may I help you?" }];

    const activeComponent =
    (activeMenuItem === CHAT_LABEL && (
      <Chat
        getEditorText={getEditorText}
        setFormattedValue={setFormattedValue}
        state={initialChatMessages}
      />
    )) ||
    (activeMenuItem === HISTORY_LABEL && <History />);

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
