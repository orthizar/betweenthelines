import React, { useState } from "react";

import { BsCheckLg } from "react-icons/bs";
import { GoCopy } from "react-icons/go";
import { RiDeleteBin6Line, RiMagicFill, RiMagicLine } from "react-icons/ri";

const Utilities = ({ editorRef, setTextWithHtml, shouldRefine, setShouldRefine }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (event) => {
    event.preventDefault();
    navigator.clipboard.writeText(editorRef.current.editor.getText).then(() => {
      setIsCopied(true);
    });
  };

  return (

    <div className="space-x-4 flex items-center">
      {shouldRefine ? (
        <RiMagicFill
          className="cursor-pointer"
          color="#F4B400"
          size={28}
          onClick={() => setShouldRefine(false)}
        />
      ) : (
        <RiMagicLine
          className="cursor-pointer"
          color="#F4B400"
          size={28}
          onClick={() => setShouldRefine(true)}
        />
      )}
      {isCopied ? (
        <BsCheckLg color="#4285F4" size={28} />
      ) : (
        <GoCopy
          className="cursor-pointer"
          color="#4285F4"
          size={28}
          onClick={() => handleCopy()}
        />
      )}
      <RiDeleteBin6Line
        className="cursor-pointer"
        color="#DB4437"
        size={28}
        onClick={() => setTextWithHtml("")}
      />
    </div>
  );
};

export default Utilities;
