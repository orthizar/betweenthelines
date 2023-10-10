import React from "react";

const ButtonGroup = ({ handleSubmit }) => {
  const buttons = [
    {
      id: "improve-button",
      label: "Improve",
      color: "#4285F4",
    },
    {
      id: "professional-button",
      label: "Professional",
      color: "#DB4437",
    },
    {
      id: "colloquially-button",
      label: "Colloquially",
      color: "#F4B400",
    },
    {
      id: "persuasive-button",
      label: "Persuasive",
      color: "#0F9D58",
    },
  ];

  return (
    <div className="space-x-4">
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={(event) => handleSubmit(event, button.label)}
          style={{ backgroundColor: button.color }}
          className={`text-white py-1 px-2 rounded text-lg ${button.color}`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;
