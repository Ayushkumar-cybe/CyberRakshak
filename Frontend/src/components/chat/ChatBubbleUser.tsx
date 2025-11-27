import React from "react";

const ChatBubbleUser = ({ text }: any) => {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm shadow">
        {text}
      </div>
    </div>
  );
};

export default ChatBubbleUser;