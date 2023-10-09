import "./quill.css";

import React, { useState } from "react";

import ReactQuill from "react-quill";

import nspell from 'nspell';

var lang = 'en_US';
const aff = await fetch(`dictionaries/${lang}/${lang}.aff`).then((r) => r.text());
const dic = await fetch(`dictionaries/${lang}/${lang}.dic`).then((r) => r.text());
const spell = nspell({ aff: aff, dic: dic });


const Editor = ({ editorRef, formattedValue, setFormattedValue }) => {
  const [spellCheckMistakes, setSpellCheckMistakes] = useState([]);
  const [currentMistake, setCurrentMistake] = useState(null);
  const [editorCorrections, setEditorCorrections] = useState([]);


  const editorModules = {
    toolbar: null,
  };

  // Mistake checking
  const getMistakes = (text) => {
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
  const getMistakeFromIndex = (index) => {
    for (var i = 0; i < spellCheckMistakes.length; i++) {
      if (index >= spellCheckMistakes[i].start && index <= spellCheckMistakes[i].end) {
        return spellCheckMistakes[i];
      }
    }
    return null;
  }

  // Corrections

  const getCorrectionsForMistake = (mistake) => {
    const corrections = spell.suggest(mistake.word).slice(0, 5);
    mistake.corrections = corrections;
    return corrections;
  }

  // Highlighting

  const clearHighlighting = () => {
    editorRef.current.editor.removeFormat(
      0,
      editorRef.current.editor.getLength() - 1,
      "silent"
    );
  };

  const highlightMistakes = (mistakes) => {
    clearHighlighting();
    mistakes.forEach((mistake) => {
      editorRef.current.editor.formatText(
        mistake.start,
        mistake.end - mistake.start,
        { color: "red" },
        "silent"
      );
    });
  };

  const selectMistake = (mistake) => {
    editorRef.current.editor.removeFormat(
      mistake.start,
      mistake.end - mistake.start,
      "silent"
    );
    editorRef.current.editor.formatText(
      mistake.start,
      mistake.end - mistake.start,
      { background: "red" },
      "silent"
    );
    if (JSON.stringify(mistake) !== JSON.stringify(currentMistake)) {
      setCurrentMistake(mistake);
      setEditorCorrections(mistake.corrections || getCorrectionsForMistake(mistake));
    }
  };

  const deselectMistake = () => {
    setEditorCorrections([]);
    setCurrentMistake(null);
  };

  // Event handlers

  const handleSelectionChange = (selection) => {
    const mistake = getMistakeFromIndex(selection.index);
    highlightMistakes(spellCheckMistakes);
    if (mistake != null) {
      selectMistake(mistake);
    } else {
      deselectMistake();
    }
  };

  const handleCorrectionClick = (event, correction) => {
    event.preventDefault();
    const mistake = currentMistake;
    const text = editorRef.current.editor.getText();
    const newText = text.substring(0, mistake.start) + correction + text.substring(mistake.end);
    editorRef.current.editor.setText(newText, "silent");
    editorRef.current.editor.setSelection(mistake.start + correction.length, 0, "silent");
    deselectMistake();
    const mistakes = getMistakes(newText);
    setSpellCheckMistakes(mistakes);
    highlightMistakes(mistakes);
  }

  const handleEditorChange = (value, delta, source, editor) => {
    setFormattedValue(value);
    if (source === "user") {
      const mistakes = getMistakes(editor.getText());
      setSpellCheckMistakes(mistakes);
      highlightMistakes(mistakes);
    }
  };

  const handleEditorChangeSelection = (selection, source, editor) => {
    if (source === "user") {
      if (selection != null && selection.length === 0) {
        handleSelectionChange(selection);
      } else {
        highlightMistakes(spellCheckMistakes);
      }
    }
  };

  return (
    <>
      <div className="mb-2 p-2 border rounded-md h-14">
        {editorCorrections.map((correction) => (
          <button
            key={correction}
            onClick={(event) => handleCorrectionClick(event, correction)}
            className={`text-black rounded text-sm w-1/5`}
          >
            {correction}
          </button>
        ))}
      </div>
      <div className="mb-6 h-full overflow-y-auto">
        <ReactQuill
          ref={editorRef}
          theme="snow"
          placeholder="Enter your text here..."
          value={formattedValue}
          className="w-full h-full border rounded-md text-lg"
          formats={
            ["color", "background"]
          }
          onChange={handleEditorChange}
          onChangeSelection={handleEditorChangeSelection}
          modules={editorModules}
        />
      </div>
    </>
  );
};

export default Editor;
