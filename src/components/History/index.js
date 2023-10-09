import React, { useState } from "react";

import classNames from "classnames";

const History = ({
  insertActiveVersionEditor,
  getEditorText,
  setFormattedValue,
  setFormattedValueWithHistory,
}) => {
  const [activeVersion, setActiveVersion] = useState();

  const commonStyles =
    "w-full h-20 mb-5 w-full h-20 mb-5 shadow-md p-2 cursor-pointer rounded-lg";
  const activeStyles = "bg-gray-300";
  const inActiveStyles = "bg-gray-200";

  const getVersions = () => {
    const versionsString = window.sessionStorage.getItem("versions");
    const versions = versionsString ? JSON.parse(versionsString) : [];

    return versions;
  };

  const getLatestVersion = () => {
    const versions = getVersions();
    return versions[versions.length - 1].formattedValue;
  };

  const getVersion = (versionIndex) => {
    const versions = getVersions();
    return versions[versionIndex].formattedValue;
  };

  const handleVersionPress = (versionIndex) => {
    const pressedVersion = getVersion(versionIndex);
    const latestVersion = getLatestVersion();
    var isVersionChanged = latestVersion !== getEditorText();

    if (activeVersion !== undefined) {
      const previousVersion = getVersion(activeVersion);
      isVersionChanged = previousVersion !== getEditorText();
    }

    if (isVersionChanged) {
      setFormattedValueWithHistory(pressedVersion);
    } else {
      console.log("pressedVersion", pressedVersion);
      setFormattedValue(pressedVersion && pressedVersion);
    }
    setActiveVersion(versionIndex);
  };

  return (
    <div className="overflow-y-scroll">
      {!getVersions().length && (
        <p className="mb-3 text-gray-500 dark:text-gray-400 m-full text-center">
          No history yet
        </p>
      )}
      {getVersions().map((version, index) => {
        const VersionId = `Version-${index + 1}`;
        return (
          <div
            className={classNames(
              commonStyles,
              activeVersion === index ? activeStyles : inActiveStyles
            )}
            key={VersionId}
            onClick={() => handleVersionPress(index)}
          >
            <p className="mb-3 text-gray-500 dark:text-gray-600">{VersionId}</p>
            <p className="mb-3 text-gray-500 dark:text-gray-400 truncate overflow-hidden text-ellipsis">
              {version.chatInput}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default History;
