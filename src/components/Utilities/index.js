import React, { useState } from "react";

import { BsCheckLg } from "react-icons/bs";
import { GoCopy } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";

const Utilities = ({ editorRef, setFormattedValue }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (event) => {
    event.preventDefault();
    navigator.clipboard.writeText(editorRef.current.editor.getText).then(() => {
      setIsCopied(true);
    });
  };

  return (
    <div className="space-x-4 flex items-center">
      {isCopied ? (
        <BsCheckLg className="text-green-600" size={28} />
      ) : (
        <GoCopy
          className="text-blue-600 cursor-pointer"
          size={28}
          onClick={() => handleCopy()}
        />
      )}
      <RiDeleteBin6Line
        className="text-red-600 cursor-pointer"
        size={28}
        onClick={() => setFormattedValue("")}
      />
    </div>
  );
};

export default Utilities;
