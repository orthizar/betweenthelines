import React, { useState } from "react";

const History = ({ newVersion }) => {
  const [versions, setVersions] = useState([]);

  const Versions = () => {
    versions &&
      versions.map((version) => (
        <div className="border-b border-gray-200 w-full h-16 mb-5">
          <p className="mb-3 text-gray-500 dark:text-gray-600">{}</p>
          <p className="mb-3 text-gray-500 dark:text-gray-400">
            das ist der text
          </p>
        </div>
      ));
  };

  return <div className="overflow-y-scroll"></div>;
};

export default History;
