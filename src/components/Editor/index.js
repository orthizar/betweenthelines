import "react-quill/dist/quill.snow.css";

import React, { useState } from "react";

import ReactQuill from "react-quill";

const Editor = ({ editorRef, formattedValue, setFormattedValue }) => {
  const [gptCorrections, setGptCorrections] = useState([]);

  const editorModules = {
    toolbar: null,
  };

  const getCorrection = (index) => {
    for (var i = 0; i < gptCorrections.length; i++) {
      if (index >= gptCorrections[i].start && index <= gptCorrections[i].end) {
        return gptCorrections[i];
      }
    }
    return null;
  };

  const clearHighlighting = () => {
    editorRef.current.editor.removeFormat(
      0,
      editorRef.current.editor.getLength() - 1
    );
  };

  const highlightCorrections = (corrections) => {
    corrections.forEach((correction) => {
      editorRef.current.editor.formatText(
        correction.start,
        correction.end - correction.start,
        { color: "red" }
      );
    });
  };

  const selectCorrection = (correction) => {
    editorRef.current.editor.removeFormat(
      correction.start,
      correction.end - correction.start
    );
    editorRef.current.editor.formatText(
      correction.start,
      correction.end - correction.start,
      { background: "red" }
    );
  };

  return (
    <div className="mb-6 flex-grow">
      <ReactQuill
        ref={editorRef}
        theme="snow"
        placeholder="Enter your text here"
        value={formattedValue}
        className="w-full p-4 border rounded-md resize-none text-lg"
        onChange={(value, delta, source, editor) => {
          console.log(value, source);
          if (source === "user") {
            const correction = getCorrection(delta.ops[0].retain);
            console.log(correction);
            if (correction != null) {
              editorRef.current.editor.removeFormat(
                correction.start,
                correction.end - correction.start
              );
              // delete the correction and move all following corrections
              setGptCorrections(
                gptCorrections.filter((item) => item !== correction)
              );
              setGptCorrections(
                gptCorrections.map((item) => {
                  var index = 0;
                  var indexDelta = 0;
                  delta.ops.forEach((op) => {
                    if (op.retain) {
                      index += op.retain;
                    } else if (op.insert) {
                      index += op.insert.length;
                      indexDelta += op.insert.length;
                    } else if (op.delete) {
                      index -= op.delete;
                      indexDelta -= op.delete;
                    }
                  });
                  item.start -= indexDelta;
                  item.end -= indexDelta;
                  return item;
                })
              );
            }
          } else {
            setFormattedValue(value);
          }
        }}
        onChangeSelection={(selection, source, editor) => {
          console.log(selection, source);
          if (source === "user") {
            if (selection != null && selection.length === 0) {
              const correction = getCorrection(selection.index);
              if (correction != null) {
                selectCorrection(correction);
              } else {
                clearHighlighting();
                highlightCorrections(gptCorrections);
              }
            }
          }
        }}
        modules={editorModules}
      />
    </div>
  );
};

export default Editor;
