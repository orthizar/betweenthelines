import React, { useLayoutEffect, useState } from "react";

import ButtonGroup from "../ButtonGroup";
import Editor from "../Editor";
import Utilities from "../Utilities";
import WindowControl from "../WIndowControl";

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

const ChatGPT = () => {
  const [textWithHTML, setTextWithHtml] = useState();
  const [activeVersion, setActiveVersion] = useState();
  const [activeTab, setActiveTab] = useState("editor");
  const [shouldRefine, setShouldRefine] = useState(false);
  const editorRef = React.useRef(null);
  const w = useWindowSize()[0];

  const getPlainText = () => {
    if (editorRef.current) {
      return editorRef.current.editor.getText();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col sm:flex-row items-center justify-center">
      {/* Tab navigation (only on mobile) */}
      <div className="fixed top-4 left-5/9 flex mb-4 sm:hidden">
        <button
          className={`px-4 py-2 ${
            activeTab === "chat" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          Chat
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "editor" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => setActiveTab("editor")}
        >
          Editor
        </button>
      </div>

      {/* Components for larger screens */}
      <div className="sm:flex w-[83%] h-[40rem] justify-between">
        {activeTab === "chat" || w > 640 ? (
          <WindowControl
            setActiveVersion={setActiveVersion}
            setTextWithHtml={setTextWithHtml}
            getPlainText={getPlainText}
            activeVersion={activeVersion}
            shouldRefine={shouldRefine}
          />
        ) : null}
        <div
          className={`bg-white shadow-xl p-8 sm:w-[65%] rounded-lg flex flex-col  ${
            activeTab === "chat" && !(w > 640) ? "hidden" : ""
          }`}
        >
          {activeTab === "editor" || w > 640 ? (
            <Editor
              setFormattedValue={setTextWithHtml}
              formattedValue={textWithHTML}
              editorRef={editorRef}
            />
          ) : null}
          <div className="flex justify-between items-center">
            {activeTab === "editor" || w > 640 ? (
              <ButtonGroup
                setActiveVersion={setActiveVersion}
                setTextWithHtml={setTextWithHtml}
                getPlainText={getPlainText}
                shouldRefine={shouldRefine}
              />
            ) : null}
            {activeTab === "editor" || w > 640 ? (
              <Utilities
                setTextWithHtml={setTextWithHtml}
                editorRef={editorRef}
                shouldRefine={shouldRefine}
                setShouldRefine={setShouldRefine}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatGPT;
