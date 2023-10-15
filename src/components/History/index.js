import {
  getTextFromVersion,
  getVersions,
  saveVersion,
} from "../Helpers/versions";

import React from "react";
import classNames from "classnames";

const commonStyles =
  "w-full h-20 mb-5 w-full h-20 mb-5 shadow-md p-2 cursor-pointer rounded-lg";
const activeStyles = "bg-gray-300";
const inActiveStyles = "bg-gray-200";

const History = ({
  getPlainText,
  setTextWithHtml,
  activeVersion,
  setActiveVersion,
}) => {
  const doesTextExist = (currentText) =>
    getVersions().some(({ text }) => text.trim() === currentText.trim());

  const handleVersionPress = (versionId) => {
    const currentTextInEditor = getPlainText();
    const editorIsNotEmpty = currentTextInEditor.length > 1;
    const pressedVersionText = getTextFromVersion(versionId);

    !doesTextExist(currentTextInEditor) &&
      editorIsNotEmpty &&
      saveVersion(versionId, currentTextInEditor);

    setTextWithHtml(pressedVersionText.replace(/\n/g, "<br>"));
    setActiveVersion(versionId);
  };

  return (
    <div className="overflow-y-scroll">
      {!getVersions().length && (
        <p className="mb-3 text-gray-500 dark:text-gray-400 m-full text-center">
          No history yet
        </p>
      )}
      {getVersions().map((version) => {
        return (
          <div
            className={classNames(
              commonStyles,
              activeVersion === version.id ? activeStyles : inActiveStyles
            )}
            key={version.id}
            onClick={() => handleVersionPress(version.id)}
          >
            <p className="mb-3 text-gray-500 dark:text-gray-600">
              {version.id}
            </p>
            <p className="mb-3 text-gray-500 dark:text-gray-400 truncate overflow-hidden text-ellipsis">
              {version.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default History;
