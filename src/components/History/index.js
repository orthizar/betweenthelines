import React, { useEffect, useState } from "react";
import {
  deleteAllVersions,
  deleteVersion,
  getTextFromVersion,
  getVersions,
  saveVersion,
} from "../Helpers/versions";

import { RiDeleteBin6Line } from "react-icons/ri";
import classNames from "classnames";

const commonStyles =
  "w-full h-20 mb-5 w-full h-20 shadow-md p-2 cursor-pointer rounded-lg flex flex-row items-center justify-between p-5";
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
    if (activeVersion !== versionId) {
      const currentTextInEditor = getPlainText();
      const editorIsNotEmpty = currentTextInEditor.length > 1;

      !doesTextExist(currentTextInEditor) &&
        editorIsNotEmpty &&
        saveVersion(activeVersion, currentTextInEditor);

      if (activeVersion) {
        const pressedVersionText = getTextFromVersion(versionId);
        setTextWithHtml(pressedVersionText);
      }
      setActiveVersion(versionId);
    }
  };

  const handleDelete = (versionId) => {
    deleteVersion(versionId);
    if (activeVersion === versionId) {
      setTextWithHtml("");
      setActiveVersion("");
    }
  };

  const handleDeleteAll = () => {
    deleteAllVersions();
    setTextWithHtml("");
    setActiveVersion("");
  };

  return (
    <>
      <div className="overflow-y-scroll h-full">
        {!getVersions().length && (
          <p className="mb-3 text-gray-500 dark:text-gray-400 m-full text-center">
            No history yet
          </p>
        )}
        {getVersions().map((version) => {
          const versionId = version.id;
          return (
            <div
              className={classNames(
                commonStyles,
                activeVersion === version.id ? activeStyles : inActiveStyles
              )}
              key={versionId}
              onClick={() => handleVersionPress(versionId)}
            >
              <div className="w-full">
                <div className="flex items-start justify-between">
                  <p className="text-gray-500 dark:text-gray-600">
                    {`Version ${versionId}`}
                  </p>
                  <RiDeleteBin6Line
                    className="text-red-600 cursor-pointer hover:text-red-700"
                    size={20}
                    onClick={() => handleDelete(versionId)}
                  />
                </div>
                <p className="mt-3 text-gray-500 dark:text-gray-400 truncate text-ellipsis overflow-hidden">
                  {version.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <button
        className="bg-red-500 hover:bg-red-700 w-full text-white p-2 rounded mt-5"
        onClick={handleDeleteAll}
      >
        Delete all versions
      </button>
    </>
  );
};

export default History;
