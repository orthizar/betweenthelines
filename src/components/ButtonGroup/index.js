import React from "react";

const ButtonGroup = ({ handleSubmit }) => {
  const buttons = [
    {
      id: "improve-button",
      label: "Improve",
      color: "bg-blue-400 hover:bg-blue-700",
    },
    {
      id: "professional-button",
      label: "Professional",
      color: "bg-green-400 hover:bg-green-700",
    },
    {
      id: "colloquially-button",
      label: "Colloquially",
      color: "bg-orange-400 hover:bg-orange-700",
    },
    {
      id: "persuasive-button",
      label: "Persuasive",
      color: "bg-indigo-400 hover:bg-indigo-700",
    },
    {
      id: "correct-button",
      label: "Correct",
      color: "bg-red-600 hover:bg-red-700",
    },
  ];

  return (
    <div className="space-x-4">
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={(event) => handleSubmit(event, button.label)}
          className={`text-white py-1 px-2 rounded text-lg ${button.color}`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;
