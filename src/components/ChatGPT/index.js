import React, {useCallback, useLayoutEffect, useState} from "react";
import { sendButtonRequest, sendCorrectionRequest } from "../Helpers/request";

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
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

const ChatGPT = () => {

  const [formattedValue, setFormattedValue] = useState();
  const editorRef = React.useRef(null);
  const [w,h] = useWindowSize();

  const getEditorText = () => {
    if (editorRef.current) {
      return editorRef.current.editor.getText();
    }
  };

  const handleSubmit = (event, improvementType) => {
    event.preventDefault();
    if (improvementType === "Correct") {
      sendCorrectionRequest(editorRef);
    } else {
      sendButtonRequest(editorRef, improvementType);
    }
  };
  const [activeTab, setActiveTab] = useState('editor');

  return (
      <div className="bg-gray-100 min-h-screen flex flex-col sm:flex-row items-center justify-center">

        {/* Tab navigation (only on mobile) */}
        <div className="fixed top-4 left-5/9 flex mb-4 sm:hidden">
          <button
              className={`px-4 py-2 ${activeTab === 'chat' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
              className={`px-4 py-2 ${activeTab === 'editor' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setActiveTab('editor')}
          >
            Editor
          </button>
        </div>

        {/* Components for larger screens */}
        <div className="sm:flex w-3/4 max-w-6xl h-[37rem]">
          {activeTab === 'chat' || w > 640 ? (
              <WindowControl
                  getEditorText={getEditorText}
                  setFormattedValue={setFormattedValue}
              />) : null}
          <div className={`bg-white shadow-xl p-8 rounded-lg flex-grow flex flex-col  ${activeTab === 'chat' && !(w > 640) ? 'hidden' : ''}`}>
            {activeTab === 'editor' || w > 640 ? (
            <Editor
                setFormattedValue={setFormattedValue}
                editorRef={editorRef}
                formattedValue={formattedValue}
            />
            ) : null }
            <div className="flex justify-between items-center">
              {activeTab === 'editor' || w > 640 ? (
              <ButtonGroup handleSubmit={handleSubmit} />
              ) : null}
              {activeTab === 'editor' || w > 640 ? (
              <Utilities
                  setFormattedValue={setFormattedValue}
                  editorRef={editorRef}
              />
              ) : null }
            </div>
            </div>
        </div>
      </div>
  );
};

export default ChatGPT;
