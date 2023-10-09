import React, { useState } from "react";

import classNames from "classnames";

const History = ({ versions, insertActiveVersionEditor }) => {
  const [activeVersion, setActiveVersion] = useState();

  const commonStyles =
    "w-full h-20 mb-5 w-full h-20 mb-5 shadow-md p-2 cursor-pointer rounded-lg";
  const activeStyles = "bg-gray-300";
  const inActiveStyles = "bg-gray-200";

  const handleVersionPress = (versionIndex) => {
    setActiveVersion(versionIndex);
    insertActiveVersionEditor(versionIndex);
  };

  return (
    <div className="overflow-y-scroll">
      {!versions.length && (
        <p className="mb-3 text-gray-500 dark:text-gray-400 m-full text-center">
          No history yet
        </p>
      )}
      {versions.reverse().map((version, index) => {
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
