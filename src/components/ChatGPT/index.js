import React, { useState } from "react";

import ButtonGroup from "../ButtonGroup";
import Editor from "../Editor";
import Utilities from "../Utilities";
import WindowControl from "../WIndowControl";

const ChatGPT = () => {
  const [textWithHTML, setTextWithHtml] = useState();
  const [activeVersion, setActiveVersion] = useState();
  const editorRef = React.useRef(null);

  const getPlainText = () => {
    return editorRef.current.editor.getText();
  };

  return (
    <div className="p-12 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="flex w-3/4 max-w-6xl h-[37rem]">
        <WindowControl
          setActiveVersion={setActiveVersion}
          setTextWithHtml={setTextWithHtml}
          getPlainText={getPlainText}
          activeVersion={activeVersion}
        />
        <div className="bg-white shadow-xl p-8 w-2/5 rounded-lg flex-grow flex flex-col">
          <Editor
            setFormattedValue={setTextWithHtml}
            formattedValue={textWithHTML}
            editorRef={editorRef}
          />
          <div className="flex justify-between items-center">
            <ButtonGroup
              setActiveVersion={setActiveVersion}
              setTextWithHtml={setTextWithHtml}
              getPlainText={getPlainText}
              editorRef={editorRef}
            />
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
