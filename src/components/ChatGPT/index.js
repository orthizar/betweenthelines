import React, { useLayoutEffect, useState } from "react";

import ButtonGroup from "../ButtonGroup";
import Editor from "../Editor";
import Utilities from "../Utilities";
import WindowControl from "../WIndowControl";

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      // html clientWidth and clientHeight
      setSize([document.documentElement.clientWidth, document.documentElement.clientHeight]);
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
  const isDesktop = w >= 768;

  const getPlainText = () => {
    if (editorRef.current) {
      return editorRef.current.editor.getText();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col md:flex-row items-center justify-center">
      {/* Tab navigation (only on mobile) */}
      <div className="fixed top-4 left-5/9 flex mb-4 md:hidden">
        <button
          className={`px-4 py-2 ${activeTab === "tools" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          onClick={() => setActiveTab("tools")}
        >
          Tools
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "editor" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          onClick={() => setActiveTab("editor")}
        >
          Editor
        </button>
      </div>

      {/* Components for larger screens */}
      <div className="flex w-[83%] h-[40rem] justify-between ">
        {activeTab === "tools" || isDesktop ? (
          <WindowControl
            setActiveVersion={setActiveVersion}
            setTextWithHtml={setTextWithHtml}
            getPlainText={getPlainText}
            activeVersion={activeVersion}
            shouldRefine={shouldRefine}
          />
        ) : null}
        <div
          className={`bg-white shadow-xl p-8 w-full md:w-[65%] rounded-lg flex flex-col  ${activeTab === "tools" && !(isDesktop) ? "hidden" : ""
            }`}
        >
          {activeTab === "editor" || isDesktop ? (
            <Editor
              isDesktop={isDesktop}
              setFormattedValue={setTextWithHtml}
              formattedValue={textWithHTML}
              editorRef={editorRef}
            />
          ) : null}
          <div className="flex justify-between items-center">
            {isDesktop ? (
              <ButtonGroup
                setActiveVersion={setActiveVersion}
                setTextWithHtml={setTextWithHtml}
                getPlainText={getPlainText}
                shouldRefine={shouldRefine}
              />
            ) : null}
            {activeTab === "editor" || isDesktop ? (
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
