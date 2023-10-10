import React, { useState } from "react";
import { sendButtonRequest, sendCorrectionRequest } from "../Helpers/request";

import ButtonGroup from "../ButtonGroup";
import Editor from "../Editor";
import Utilities from "../Utilities";
import WindowControl from "../WIndowControl";
import { createVersion } from "../Helpers/versions";

const ChatGPT = () => {
  const [formattedValue, setFormattedValue] = useState();
  const editorRef = React.useRef(null);
  const [currentEditorState, setCurrentEditorState] = useState("");

  const getCurrentTextInEditor = () => {
    return editorRef.current.editor.getText();
  };

  const handleButtonGroupSubmit = (event, improvementType) => {
    event.preventDefault();

    sendButtonRequest(editorRef, improvementType).then((result) => {
      createVersion(
        `Button: ${improvementType}`,
        getCurrentTextInEditor(),
        result
      );
      setFormattedValue(result);
    });
  };

  return (
    <div className="p-12 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="flex w-3/4 max-w-6xl h-[37rem]">
        <WindowControl
          getCurrentTextInEditor={getCurrentTextInEditor}
          setFormattedValue={setFormattedValue}
        />
        <div className="bg-white shadow-xl p-8 w-2/5 rounded-lg flex-grow flex flex-col">
          <Editor
            setFormattedValue={setFormattedValue}
            editorRef={editorRef}
            formattedValue={formattedValue}
          />
          <div className="flex justify-between items-center">
            <ButtonGroup handleSubmit={handleButtonGroupSubmit} />
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
