import { CHAT_LABEL, HISTORY_LABEL } from "../Constants/index";

const Menu = ({ activeMenuItem, setActiveMenuItem }) => {
  const activeStyle =
    "inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 cursor-pointer";
  const inactiveStyle =
    "inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 cursor-pointer";

  const getCorrectStyle = (label) =>
    activeMenuItem === label ? activeStyle : inactiveStyle;

  return (
    <div className="text-sm font-medium text-center text-gray-500 border-b w-full">
      <ul className="flex flex-wrap -mb-px justify-around">
        <li className="mr-2">
          <p
            className={getCorrectStyle(CHAT_LABEL)}
            onClick={() => setActiveMenuItem(CHAT_LABEL)}
          >
            Chat
          </p>
        </li>
        <li className="mr-2">
          <p
            className={getCorrectStyle(HISTORY_LABEL)}
            onClick={() => setActiveMenuItem(HISTORY_LABEL)}
          >
            History
          </p>
        </li>
      </ul>
    </div>
  );
};

export default Menu;
