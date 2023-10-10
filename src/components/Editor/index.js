import "./quill.css";

import React, { useState, useEffect } from "react";

import ReactQuill from "react-quill";

import nspell from 'nspell';

var lang = 'en_US';
const aff = await fetch(`dictionaries/${lang}/${lang}.aff`).then((r) => r.text());
const dic = await fetch(`dictionaries/${lang}/${lang}.dic`).then((r) => r.text());
const spell = nspell({ aff: aff, dic: dic });

var editorBindingsInitialized = false;


const Editor = ({ editorRef, formattedValue, setFormattedValue }) => {
  const [spellCheckMistakes, setSpellCheckMistakes] = useState([]);
  const [currentMistake, setCurrentMistake] = useState(null);
  const [editorCorrections, setEditorCorrections] = useState([]);
  const [selectedCorrection, setSelectedCorrection] = useState(null);

  // Mistake checking
  const getMistakes = (text) => {
    const words = text.split(/[\n\s]/);
    var index = 0;
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
      const start = text.indexOf(word, index);
      const end = text.indexOf(word, index) + wordEnd;
      index = end;
      return !spell.correct(cleanWord) && {
        start: start,
        end: end,
        word: cleanWord,
      };
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
  };

  const navigateCorrections = () => {
    setSelectedCorrection((prevSelectedCorrection) => prevSelectedCorrection + 1)
  };

  const applyCorrection = (correction) => {
    console.log("apply correction", correction)
    console.log("current mistake", currentMistake)
    const mistake = currentMistake;
    const text = editorRef.current.editor.getText();
    const newText = text.substring(0, mistake.start) + correction + text.substring(mistake.start + correction.length);
    editorRef.current.editor.setText(newText, "silent");
    editorRef.current.editor.setSelection(mistake.start + correction.length, 0, "silent");
    deselectMistake();
    const mistakes = getMistakes(newText);
    setSpellCheckMistakes(mistakes);
    highlightMistakes(mistakes);
    blinkCorrection(mistake, correction);
  };

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
      setSelectedCorrection(null);
      setEditorCorrections(mistake.corrections || getCorrectionsForMistake(mistake));
    }
  };

  const deselectMistake = () => {
    setSelectedCorrection(null);
    setEditorCorrections([]);
    setCurrentMistake(null);
  };

  const blinkCorrection = (mistake, correction) => {
    editorRef.current.editor.formatText(mistake.start, correction.length, { color: "LightGreen" }, "silent");
    setTimeout(() => {
      editorRef.current.editor.removeFormat(mistake.start, correction.length, "silent");
    }, 500);
  }

  const previewCorrection = (correction) => {
    const currentSelection = editorRef.current.editor.getSelection();
    const mistake = currentMistake;
    const text = editorRef.current.editor.getText();
    const newText = text.substring(0, mistake.start) + correction + text.substring(mistake.end);
    editorRef.current.editor.setText(newText, "silent");
    const mistakes = getMistakes(newText);
    setSpellCheckMistakes(mistakes);
    highlightMistakes(mistakes);
    editorRef.current.editor.formatText(mistake.start, correction.length, { background: "LightGreen" }, "silent");
    editorRef.current.editor.setSelection(currentSelection, 0, "silent");
  }

  const unpreviewCorrection = (correction) => {
    const currentSelection = editorRef.current.editor.getSelection();
    const mistake = currentMistake;
    const text = editorRef.current.editor.getText();
    const newText = text.substring(0, mistake.start) + mistake.word + text.substring(mistake.start + correction.length);
    editorRef.current.editor.setText(newText, "silent");
    const mistakes = getMistakes(newText);
    setSpellCheckMistakes(mistakes);
    highlightMistakes(mistakes);
    editorRef.current.editor.setSelection(currentSelection, 0, "silent");
    selectMistake(mistake);
  }
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
    applyCorrection(correction);
  }

  const handleEditorChange = (value, delta, source, editor) => {
    setFormattedValue(value);
    if (source === "user") {
      const mistakes = getMistakes(editor.getText());
      setSpellCheckMistakes(mistakes);
      highlightMistakes(mistakes);
      deselectMistake();
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

  const handleEditorTab = (range, context) => {
    console.log("tab", range, context);
    if (context.format.background && context.format.background === "red") {
      navigateCorrections();
      return false;
    }
    return true;
  };

  const handleEditorEnter = (range, context) => {
    console.log("enter", range, context);
    console.log(editorCorrections, selectedCorrection, currentMistake)
    if (context.format.background && context.format.background === "red") {
      applyCorrection(editorCorrections[selectedCorrection % editorCorrections.length]);
      return false;
    }
    return true;
  };

  // Editor configuration

  const editorModules = {
    toolbar: null,
  };

  useEffect(() => {
    if (!editorBindingsInitialized) {
      editorRef.current.editor.keyboard.bindings[9].unshift(
        {
          key: 9,
          handler: handleEditorTab,
        },
      );
      editorRef.current.editor.keyboard.bindings[13].unshift(
        {
          key: 13,
          handler: handleEditorEnter,
        },
      );
      editorBindingsInitialized = true;
    }
  }, [editorRef, handleEditorEnter, handleEditorTab]);

  return (
    <>
      <div className="mb-2 p-2 border rounded-md h-14">
        {editorCorrections.map((correction, index) => (
          <button
            key={correction}
            onClick={(event) => handleCorrectionClick(event, correction)}
            onMouseEnter={() => previewCorrection(correction)}
            onMouseLeave={() => unpreviewCorrection(correction)}
            className={`text-black rounded text-sm w-1/5 ${selectedCorrection % editorCorrections.length === index ? "bg-gray-200" : "bg-white"}`}
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
