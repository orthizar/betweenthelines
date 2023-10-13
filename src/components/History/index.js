import React, { useEffect, useState } from "react";
import {
  deleteVersion,
  getTextFromVersion,
  getVersions,
  saveVersion,
} from "../Helpers/versions";

import { RiDeleteBin6Line } from "react-icons/ri";
import classNames from "classnames";
import { sendVersionNameRequest } from "../Helpers/request";

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
  const [titles, setTitles] = useState({});

  const doesTextExist = (currentText) =>
    getVersions().some(({ text }) => text.trim() === currentText.trim());

  const handleVersionPress = (versionId) => {
    const currentTextInEditor = getPlainText();
    const editorIsNotEmpty = currentTextInEditor.length > 1;
    const pressedVersionText = getTextFromVersion(versionId);

    !doesTextExist(currentTextInEditor) &&
      editorIsNotEmpty &&
      saveVersion(versionId, currentTextInEditor);

    setTextWithHtml(pressedVersionText);
    setActiveVersion(versionId);
  };

  useEffect(() => {
    const versionPromises = getVersions().map((version) => {
      return sendVersionNameRequest(version.text).then((result) => ({
        id: version.id,
        title: result,
      }));
    });

    Promise.all(versionPromises).then((titleResults) => {
      const titlesObject = {};
      titleResults.forEach((result) => {
        titlesObject[result.id] = result.title;
      });
      setTitles(titlesObject);
    });
  }, []);
  return (
    <div className="overflow-y-scroll">
      {!getVersions().length && (
        <p className="mb-3 text-gray-500 dark:text-gray-400 m-full text-center">
          No history yet
        </p>
      )}
      {getVersions().map((version) => {
        const versionId = version.id;
        const title = titles[versionId] || "";
        return (
          <div
            className={classNames(
              commonStyles,
              activeVersion === version.id ? activeStyles : inActiveStyles
            )}
            key={versionId}
            onClick={() => handleVersionPress(versionId)}
          >
            <div className="pt-3">
              <p className="mb-3 text-gray-500 dark:text-gray-600">{title}</p>
              <p className="mb-3 text-gray-500 dark:text-gray-400 truncate overflow-hidden text-ellipsis">
                {version.description}
              </p>
            </div>
            <RiDeleteBin6Line
              className="text-red-600 cursor-pointer"
              size={20}
              onClick={() => deleteVersion(versionId)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default History;
