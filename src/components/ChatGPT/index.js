import React, { useState } from "react";
import { sendButtonRequest, sendCorrectionRequest } from "../Helpers/request";

import ButtonGroup from "../ButtonGroup";
import Editor from "../Editor";
import Utilities from "../Utilities";
import WindowControl from "../WIndowControl";

const ChatGPT = () => {
  const [formattedValue, setFormattedValue] = useState();
  const editorRef = React.useRef(null);
  const [currentEditorState, setCurrentEditorState] = useState("");

  const getEditorText = () => {
    return editorRef.current.editor.getText();
  };

  const getVersions = () => {
    const versionsString = window.sessionStorage.getItem("versions");
    const versions = versionsString ? JSON.parse(versionsString) : [];

    return versions;
  };

  const setFormattedValueWithHistory = (newFormattedValue, chatInput) => {
    const versions = getVersions();

    console.log("xxx", getEditorText().length);

    if (getEditorText().length > 1) {
      const newVersion = {
        chatInput: chatInput,
        formattedValue: getEditorText(),
      };
      versions.push(newVersion);

      window.sessionStorage.setItem("versions", JSON.stringify(versions));
    }
    setFormattedValue(newFormattedValue);
  };

  const handleSubmit = (event, improvementType) => {
    event.preventDefault();

    sendButtonRequest(editorRef, improvementType).then((result) => {
      setFormattedValueWithHistory(result, `Button: ${improvementType}`);
    });
  };

  return (
    <div className="p-12 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="flex w-3/4 max-w-6xl h-[37rem]">
        <WindowControl
          getEditorText={getEditorText}
          setFormattedValueWithHistory={setFormattedValueWithHistory}
          setFormattedValue={setFormattedValue}
        />
        <div className="bg-white shadow-xl p-8 w-2/5 rounded-lg flex-grow flex flex-col">
          <Editor
            setFormattedValue={setFormattedValue}
            editorRef={editorRef}
            formattedValue={formattedValue}
          />
          <div className="flex justify-between items-center">
            <ButtonGroup handleSubmit={handleSubmit} />
            <Utilities
              setFormattedValue={setFormattedValue}
              editorRef={editorRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatGPT;
