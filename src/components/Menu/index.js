import { CHAT_LABEL, HISTORY_LABEL } from "../Constants/index";

const Menu = ({ activeMenuItem, setActiveMenuItem }) => {
  const activeLiStyle =
    "w-20 inline-block border-b-2 border-blue-600 rounded-t-lg active";
  const inactiveLiStyle =
    "w-20 inline-block border-b-2 border-transparent rounded-t-lg hover:border-gray-300 cursor-pointer";
  const activePStyle =
    "inline-block p-4 text-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 cursor-pointer";
  const inactivePStyle =
    "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 cursor-pointer";

  const getCorrectLiStyle = (label) =>
    activeMenuItem === label ? activeLiStyle : inactiveLiStyle;

  const getCorrectPStyle = (label) =>
    activeMenuItem === label ? activePStyle : inactivePStyle;

  return (
    <div className="text-sm font-medium text-center text-gray-500 border-b w-full">
      <ul className="flex -mb-px justify-around">
        <li className={getCorrectLiStyle(CHAT_LABEL)}>
          <p
            className={getCorrectPStyle(CHAT_LABEL)}
            onClick={() => setActiveMenuItem(CHAT_LABEL)}
          >
            Chat
          </p>
        </li>
        <li className={getCorrectLiStyle(HISTORY_LABEL)}>
          <p
            className={getCorrectPStyle(HISTORY_LABEL)}
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
