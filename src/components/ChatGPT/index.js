import React, { useLayoutEffect, useState } from "react";

import AnimatedBackground from "../AnimatedBackground";
import ButtonGroup from "../ButtonGroup";
import Editor from "../Editor";
import Utilities from "../Utilities";
import WindowControl from "../WIndowControl";

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
      ]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

const getSessionData = (name) => {
  try {
    return sessionStorage.getItem(name);
  } catch (e) {
    console.error("Failed to retrieve session data:", e);
    return null;
  }
};

const ChatGPT = () => {
  const [textWithHTML, setTextWithHtml] = useState(
    (getSessionData("editorText") || "").replace(/\n/g, "<br>")
  );
  const [activeVersion, setActiveVersion] = useState();
  const [activeTab, setActiveTab] = useState("editor");
  const [shouldRefine, setShouldRefine] = useState(false);
  const [workingSource, setWorkingSource] = useState(null);
  const editorRef = React.useRef(null);
  const w = useWindowSize()[0];
  const isDesktop = w >= 768;

  const getPlainText = () => {
    if (editorRef.current) {
      return editorRef.current.editor.getText();
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center">
      <div className="fixed top-4 left-5/9 flex mb-4 md:hidden">
        <button
          className={`px-4 py-2 ${
            activeTab === "tools" ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => setActiveTab("tools")}
        >
          Tools
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
      <div className="flex w-[83%] h-[40rem] justify-between ">
        {activeTab === "tools" || isDesktop ? (
          <WindowControl
            setActiveVersion={setActiveVersion}
            setTextWithHtml={setTextWithHtml}
            getPlainText={getPlainText}
            activeVersion={activeVersion}
            shouldRefine={shouldRefine}
            workingSource={workingSource}
            setWorkingSource={setWorkingSource}
          />
        ) : null}
        <div
          className={`bg-white shadow-xl p-8 w-full md:w-[65%] rounded-lg flex flex-col  ${
            activeTab === "tools" && !isDesktop ? "hidden" : ""
          }`}
        >
          {activeTab === "editor" || isDesktop ? (
            <Editor
              isDesktop={isDesktop}
              setFormattedValue={setTextWithHtml}
              formattedValue={textWithHTML}
              editorRef={editorRef}
              workingSource={workingSource}
            />
          ) : null}
          <div className="flex justify-between items-center">
            {isDesktop ? (
              <ButtonGroup
                setActiveVersion={setActiveVersion}
                setTextWithHtml={setTextWithHtml}
                getPlainText={getPlainText}
                shouldRefine={shouldRefine}
                workingSource={workingSource}
                setWorkingSource={setWorkingSource}
              />
            ) : null}
            {activeTab === "editor" || isDesktop ? (
              <Utilities
                setTextWithHtml={setTextWithHtml}
                getPlainText={getPlainText}
                shouldRefine={shouldRefine}
                setShouldRefine={setShouldRefine}
              />
            ) : null}
          </div>
        </div>
      </div>
      <AnimatedBackground />
    </div>
  );
};

export default ChatGPT;
