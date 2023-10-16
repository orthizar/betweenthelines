import { createVersion, getIndexFromLatestVersion } from "../Helpers/versions";

import React from "react";
import { invokePipeline } from "../Helpers/refine";

const buttons = [
  {
    id: "improve-button",
    label: "Improve",
    color: "#4285F4",
  },
  {
    id: "professional-button",
    label: "Professional",
    color: "#DB4437",
  },
  {
    id: "colloquially-button",
    label: "Colloquially",
    color: "#F4B400",
  },
  {
    id: "persuasive-button",
    label: "Persuasive",
    color: "#0F9D58",
  },
];

const ButtonGroup = ({
  setTextWithHtml,
  getPlainText,
  setActiveVersion,
  shouldRefine,
  workingSource,
  setWorkingSource,
}) => {
  const handleButtonGroupSubmit = async (event, improvementType) => {
    event.preventDefault();

    setWorkingSource(improvementType);

    const message = (improvementType) => {
      switch (improvementType) {
        case "Improve":
          return "Improve the text.";
        default:
          return "Make the text more " + improvementType.toLowerCase() + ".";
      }
    };

    for await (const transformed of invokePipeline(
      getPlainText(),
      message(improvementType),
      shouldRefine
    )) {
      if (transformed.output !== undefined) {
        const transformedText = transformed.output;
        const newText = transformedText
          .replace(/(?:\r\n|\r|\n|\\n)/g, "\n")
          .trim()
          .replace(/\n/g, "<br>");
        createVersion(transformed.observation, getPlainText(), newText);
        setTextWithHtml(newText);
        setWorkingSource(null);
        return;
      }
    }
    setWorkingSource(null);
    setActiveVersion(getIndexFromLatestVersion() + 2);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={(event) => handleButtonGroupSubmit(event, button.label)}
          style={{ backgroundColor: button.color }}
          className={`text-white py-1 px-2 rounded w-28 h-10 text-lg ${button.color}`}
          disabled={workingSource !== null}
        >
          {workingSource === button.label ? (
            <div className="inline-block h-7 w-7 animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite] rounded-full border-4 border-solid border-current border-r-transparent align-[-0.25em] text-white" />
          ) : (
            button.label
          )}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;
