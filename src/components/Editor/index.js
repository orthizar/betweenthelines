import "react-quill/dist/quill.snow.css";

import React, { useState } from "react";

import ReactQuill from "react-quill";

import nspell from 'nspell';

var lang = 'en_US';
const aff = await fetch(`dictionaries/${lang}/${lang}.aff`).then((r) => r.text());
const dic = await fetch(`dictionaries/${lang}/${lang}.dic`).then((r) => r.text());
console.log(aff, dic)
const spell = nspell({aff: aff, dic: dic});


const Editor = ({ editorRef, formattedValue, setFormattedValue }) => {
  const [spellCheckCorrections, setSpellCheckCorrections] = useState([]);
  const [currentCorrection, setCurrentCorrection] = useState(null);
  const [editorSuggestions, setEditorSuggestions] = useState([]);


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
    if (correction !== currentCorrection) {
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
      setCurrentCorrection(correction);
      setEditorSuggestions(getSuggestions(correction));
    }
  };

  const deselectCorrection = () => {
    setEditorSuggestions([]);
    setCurrentCorrection(null);
  };



  const spellCheck = () => {
    const text = editorRef.current.editor.getText();
    const words = text.split(/[\n\s]/);
    return words.map((word) => {
      var cleanWord = word.replace(/[^a-zA-Z'-]/g, "");
      var wordStart = word.indexOf(cleanWord);
      var wordEnd = word.length;
      if (wordStart === -1) {
        cleanWord = word;
        wordStart = 0;
      } else {
        wordEnd = wordStart + cleanWord.length;
      }
      return !spell.correct(cleanWord) && {
        start: text.indexOf(word),
        end: text.indexOf(word) + wordEnd,
        word: cleanWord,
      }
    }).filter((word) => word);
  }

  const getSuggestions = (correction) => {
    const suggestions = spell.suggest(correction.word).slice(0, 5);
    return suggestions;
  }
  const handleSuggestionClick = (event, suggestion) => {
    event.preventDefault();
    const correction = currentCorrection;
    const text = editorRef.current.editor.getText();
    const newText = text.substring(0, correction.start) + suggestion + text.substring(correction.end);
    editorRef.current.editor.setText(newText, "silent");
    deselectCorrection();
    clearHighlighting();
    setSpellCheckCorrections(spellCheck());
    highlightCorrections(spellCheckCorrections);
  }


  return (
    <>
      <div className="p-2 border rounded-md h-10">
        {editorSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={(event) => handleSuggestionClick(event, suggestion)}
            className={`text-black py-1 px-2 rounded text-sm w-1/5`}
          >
            {suggestion}
          </button>
        ))}
      </div>
      <div className="mb-6 flex-grow">
        <ReactQuill
          ref={editorRef}
          theme="snow"
          placeholder="Enter your text here"
          value={formattedValue}
          className="w-full h-full border rounded-md resize-none text-lg"
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
                  deselectCorrection();
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
    </>
  );
};

export default Editor;
