import buttons from "./buttons.json";

const ButtonGroup = ({ handleSubmit }) => {
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
