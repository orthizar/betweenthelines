import { CHAT_LABEL, HISTORY_LABEL } from "../Constants";
import React, { useState } from "react";

import Chat from "../Chat";
import History from "../History";
import Menu from "../Menu";

const WindowControl = ({ getEditorText, setFormattedValue }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("chat");

  const activeComponent =
    (activeMenuItem === CHAT_LABEL && (
      <Chat
        getEditorText={getEditorText}
        setFormattedValue={setFormattedValue}
      />
    )) ||
    (activeMenuItem === HISTORY_LABEL && <History />);

  return (
    <div className="bg-white shadow-xl p-8 rounded-lg w-2/5 flex flex-col mr-6 max-h-[37rem] overflow-y-auto">
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
