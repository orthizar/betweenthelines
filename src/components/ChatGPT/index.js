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
  const editorRef = React.useRef(null);
  const [w] = useWindowSize();

  const getPlainText = () => {
    if (editorRef.current) {
      return editorRef.current.editor.getText();
    }
  };

  const MobileSwitchButton = ({ text }) => {
    const textId = text.toLowerCase();

    return (
      <button
        className={`px-4 py-2 ${
          activeTab === textId ? "bg-blue-500 text-white" : "bg-gray-300"
        }`}
        onClick={() => setActiveTab(textId)}
      >
        {text}
      </button>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col sm:flex-row items-center justify-center">
      <div className="fixed top-4 left-5/9 flex mb-4 sm:hidden">
        <MobileSwitchButton text="Chat" />
        <MobileSwitchButton text="Editor" />
      </div>
      <div className="sm:flex w-3/4 max-w-6xl h-[37rem]">
        {activeTab === "chat" || w > 640 ? (
          <WindowControl
            setActiveVersion={setActiveVersion}
            setTextWithHtml={setTextWithHtml}
            getPlainText={getPlainText}
            activeVersion={activeVersion}
          />
        ) : null}
        <div
          className={`bg-white shadow-xl p-8 rounded-lg flex-grow flex flex-col  ${
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
                editorRef={editorRef}
              />
            ) : null}
            {activeTab === "editor" || w > 640 ? (
              <Utilities
                setTextWithHtml={setTextWithHtml}
                editorRef={editorRef}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatGPT;
