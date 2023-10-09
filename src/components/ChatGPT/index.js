import React, { useState } from "react";
import { sendButtonRequest, sendCorrectionRequest } from "../Helpers/request";

import ButtonGroup from "../ButtonGroup";
import Editor from "../Editor";
import Utilities from "../Utilities";
import WindowControl from "../WIndowControl";

const ChatGPT = () => {
  const [formattedValue, setFormattedValue] = useState();
  const [versions, setVersions] = useState([]);
  const editorRef = React.useRef(null);

  const getEditorText = () => {
    return editorRef.current.editor.getText();
  };

  const setFormattedValueWithHistory = (newFormattedValue, chatInput) => {
    console.log("versions", versions);

    setVersions([
      ...versions,
      {
        chatInput: chatInput,
        formattedValue: newFormattedValue,
      },
    ]);
    setFormattedValue(newFormattedValue);
  };

  const handleSubmit = (event, improvementType) => {
    event.preventDefault();
    setFormattedValueWithHistory(
      sendButtonRequest(editorRef, improvementType),
      ""
    );
  };

  // window.sessionStorage.setItem("key", "value");

  const insertActiveVersionEditor = (versionIndex) => {
    setFormattedValue(versions[versionIndex].formattedValue);
  };

  return (
    <div className="p-12 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="flex w-3/4 max-w-6xl h-[37rem]">
        <WindowControl
          getEditorText={getEditorText}
          setFormattedValueWithHistory={setFormattedValueWithHistory}
          versions={versions}
          insertActiveVersionEditor={insertActiveVersionEditor}
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
