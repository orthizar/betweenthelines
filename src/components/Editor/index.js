import "react-quill/dist/quill.snow.css";

import React, { useState } from "react";

import ReactQuill from "react-quill";

import Typo from "typo-js";
var lang = "en_US";
const dictionary = new Typo(lang, false, false, { dictionaryPath: "typo/dictionaries" });

const Editor = ({ editorRef, formattedValue, setFormattedValue }) => {
  const [spellCheckCorrections, setSpellCheckCorrections] = useState([]);


  const editorModules = {
    toolbar: null,
  };

  const getSpellCheckCorrection = (index) => {
    for (var i = 0; i < spellCheckCorrections.length; i++) {
      if (index >= spellCheckCorrections[i].start && index <= spellCheckCorrections[i].end) {
        return spellCheckCorrections[i];
      }
    }
    return null;
  }

  const clearHighlighting = () => {
    editorRef.current.editor.removeFormat(
      0,
      editorRef.current.editor.getLength() - 1,
      "silent"
    );
  };

  const highlightCorrections = (corrections) => {
    corrections.forEach((correction) => {
      editorRef.current.editor.formatText(
        correction.start,
        correction.end - correction.start,
        { color: "red" },
        "silent"
      );
    });
  };

  const selectCorrection = (correction) => {
    editorRef.current.editor.removeFormat(
      correction.start,
      correction.end - correction.start,
      "silent"
    );
    editorRef.current.editor.formatText(
      correction.start,
      correction.end - correction.start,
      { background: "red" },
      "silent"
    );
  };

  const spellCheck = () => {
    const text = editorRef.current.editor.getText();
    const words = text.split(/[\n\s]/);
    return words.map((word) => {
      var cleanWord = word.replace(/\W/g, "");
      var wordStart = word.indexOf(cleanWord);
      var wordEnd = word.length;
      if (wordStart === -1) {
        cleanWord = word;
        wordStart = 0;
      } else {
        wordEnd = wordStart + cleanWord.length;
      }
      return !dictionary.check(cleanWord) && {
        start: text.indexOf(word),
        end: text.indexOf(word) + wordEnd,
        word: cleanWord,
      }
    }).filter((word) => word);
  }


  return (
    <div className="mb-6 flex-grow">
      <ReactQuill
        ref={editorRef}
        theme="snow"
        placeholder="Enter your text here"
        value={formattedValue}
        className="w-full p-4 border rounded-md resize-none text-lg"
        formats={
          ["color", "background"]
        }
        onChange={(value, delta, source, editor) => {
          if (source === "user" || source === "silent") {
            const corrections = spellCheck();
            setSpellCheckCorrections(corrections);
          }
          setFormattedValue(value);
        }}
        onChangeSelection={(selection, source, editor) => {
          console.log(selection)
          if (source === "user" || source === 'silent') {
            if (selection != null && selection.length === 0) {
              const correction = getSpellCheckCorrection(selection.index);
              if (correction != null) {
                clearHighlighting();
                highlightCorrections(spellCheckCorrections);
                selectCorrection(correction);
              } else {
                clearHighlighting();
                highlightCorrections(spellCheckCorrections);
              }
            } else {
              clearHighlighting();
              highlightCorrections(spellCheckCorrections);
            }
          }
        }}
        modules={editorModules}
      />
    </div>
  );
};

export default Editor;
