import React, { useState } from "react";
import {
  createVersion,
  getDescriptionFromVersion,
  getTextFromLatestVersion,
  getTextFromVersion,
  getVersion,
  getVersions,
} from "../Helpers/versions";

import classNames from "classnames";

const History = ({ getCurrentTextInEditor, setFormattedValue }) => {
  const [activeVersion, setActiveVersion] = useState();

  const commonStyles =
    "w-full h-20 mb-5 w-full h-20 mb-5 shadow-md p-2 cursor-pointer rounded-lg";
  const activeStyles = "bg-gray-300";
  const inActiveStyles = "bg-gray-200";

  const handleVersionPress = (versionId) => {
    const currentTextInEditor = getCurrentTextInEditor();
    const editorIsNotEmpty = currentTextInEditor.length < 1;
    const pressedVersionText = getTextFromVersion(versionId);
    const latestVersion = getTextFromLatestVersion(); // letztes item im array
    var isVersionChanged = latestVersion !== currentTextInEditor; // wenn das letzte item im arrray nicht genau gleich ist wie im editor ist es true
    const newVersionShouldBeCreated = isVersionChanged && editorIsNotEmpty;

    if (activeVersion !== undefined) {
      const currentVersion = getTextFromVersion(activeVersion); // die version auf welche man jetzt geclicktz hat

      isVersionChanged = currentVersion !== currentTextInEditor; // Wenn die version auf welche man jetzt geklickt hat nicht gleich ist wie das, was im editor is dann ist es verändert
    }

    newVersionShouldBeCreated &&
      createVersion("Automatic save", currentTextInEditor);

    setFormattedValue(pressedVersionText);
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
