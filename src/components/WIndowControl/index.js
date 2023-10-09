import { CHAT_LABEL, HISTORY_LABEL } from "../Constants";
import React, { useState } from "react";

import Chat from "../Chat/index";
import History from "../History/index";
import Menu from "../Menu/index";

const WindowControl = ({
  getEditorText,
  setFormattedValueWithHistory,
  setFormattedValue,
}) => {
  const [activeMenuItem, setActiveMenuItem] = useState("chat");

  const activeComponent =
    (activeMenuItem === CHAT_LABEL && (
      <Chat
        getEditorText={getEditorText}
        setFormattedValueWithHistory={setFormattedValueWithHistory}
      />
    )) ||
    (activeMenuItem === HISTORY_LABEL && (
      <History
        getEditorText={getEditorText}
        setFormattedValueWithHistory={setFormattedValueWithHistory}
        setFormattedValue={setFormattedValue}
      />
    ));

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
