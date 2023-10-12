import React, { useState } from "react";
import { sendButtonRequest, sendCorrectionRequest } from "../Helpers/request";

import ButtonGroup from "../ButtonGroup";
import Editor from "../Editor";
import Utilities from "../Utilities";
import WindowControl from "../WIndowControl";
import { createVersion } from "../Helpers/versions";

const ChatGPT = () => {
  const [textWithHTML, setTextWithHtml] = useState();
  const editorRef = React.useRef(null);

  const getPlainText = () => {
    return editorRef.current.editor.getText();
  };

  const handleButtonGroupSubmit = (event, improvementType) => {
    event.preventDefault();

    sendButtonRequest(editorRef, improvementType).then((result) => {
      createVersion(`Button: ${improvementType}`, getPlainText(), result);
      setTextWithHtml(result);
    });
  };

  return (
    <div className="p-12 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="flex w-3/4 max-w-6xl h-[37rem]">
        <WindowControl
          getPlainText={getPlainText}
          setTextWithHtml={setTextWithHtml}
        />
        <div className="bg-white shadow-xl p-8 w-2/5 rounded-lg flex-grow flex flex-col">
          <Editor
            setFormattedValue={setTextWithHtml}
            editorRef={editorRef}
            formattedValue={textWithHTML}
          />
          <div className="flex justify-between items-center">
            <ButtonGroup handleSubmit={handleButtonGroupSubmit} />
            <Utilities
              setTextWithHtml={setTextWithHtml}
              editorRef={editorRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatGPT;
