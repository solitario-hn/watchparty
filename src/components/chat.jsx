import { SendToBackIcon } from "lucide-react";
import { useState } from "react";

export default function Chat() {
  const [messages, setmessages] = useState([
    {
      id: 1,
      user: "nunu",
      message: "ruk ja bhai",
      timestamp: "12:00:00",
    },
    {
      id: 2,
      user: "susu",
      message: "susu aari",
      timestamp: "12:01:00",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const handleSend = (event) => {
    console.log("sending message");
    event.preventDefault(); //to prevent function from breaking while ui updates
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    console.log("sending message");
    const newMessage = {
      id: messages.length() + 1,
      user: "you",
      message: inputText,
      timestamp: timeStr,
    };
    setmessages((prev) => [...prev, newMessage]); //to avoid rewriting the whole messages to new messages only.
    setInputText("");
  };
  return (
    <div className="flex flex-col w-full min-h-0  bg-[#77819a]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#2C2C38] scrollbar-track-transparent">
        {messages.map((eachText) => {
          return (
            <div key={eachText.id} className="felx flex-col">
              <div className="flex items-center gap-2 mb-1 px-1">
                <h1 className="text-xs font-semibold">{eachText.user}</h1>
                <p className="text-[10px] text-[#555574]">
                  {eachText.timestamp}
                </p>
              </div>
              <div
                className={`px-3 py-2 rounded-2xl text-sm font-sans break-words `}
              >
                {eachText.message}
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[#2C2C38] bg-[#1e1e2e] flex gap-2 items-center shrink-0"
      >
        <input
          placeholder="Join the chat"
          type="text"
          value={inputText}
          onChange={(event) => {
            setInputText(event.target.value);
          }}
          className="flex-1 h-9 px-3 bg-[#282838] border border-[#2C2C38] rounded-full text-xs text-white placeholder-[#555574] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all duration-300 font-mono"
        ></input>
        <button
          className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all duration-300 active:scale-95 shrink-0 cursor-pointer shadow-md shadow-blue-950/20"
          type="submit"
        >
          <SendToBackIcon />
        </button>
      </form>
    </div>
  );
}
