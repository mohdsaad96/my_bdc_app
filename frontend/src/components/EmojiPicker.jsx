import React from "react";

const EMOJIS = [
  "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😍",
  "😘","😎","🤩","🤔","🤨","😐","🙄","😏","😴","😭",
  "😤","😡","👍","👎","🙏","👏","🎉","🔥","❤️","💔",
];

const EmojiPicker = ({ onSelect }) => {
  return (
    <div className="bg-base-100 border rounded-lg shadow p-2 grid grid-cols-6 gap-2 w-48">
      {EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onSelect(e)}
          className="text-2xl flex items-center justify-center p-1 hover:bg-base-200 rounded"
        >
          {e}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
