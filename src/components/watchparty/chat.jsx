import {
  Sent02Icon,
  SentFreeIcons,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { SendToBackIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { socketClient } from "../socketclient";
import getUser from "../../utils/type";

export default function Chat() {
  const [messages, setmessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const handleSend = (event) => {
    event.preventDefault(); //to prevent function from breaking while ui updates
    if (!inputText.trim()) return;

    const newMessage = {
      keyId: Date.now(), //id for map
      user: getUser(),
      message: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    console.log(newMessage, "sender");
    setmessages((prev) => [...prev, newMessage]); //to avoid rewriting the whole messages to new messages only.
    socketClient.emit("chat_message", newMessage.message);
    setInputText("");
  };
  const endMessageRef = useRef(null);
  const scrollToBottom = () => {
    endMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socketClient.on("chat_message", (data) => {
      console.log(data);
      const newMessage = {
        keyId: Date.now(), //id for map
        user: data.userName.trim(),
        message: data.message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setmessages((prev) => [...prev, newMessage]); //to avoid rewriting the whole messages to new messages only.
    });

    return () => {
      socketClient.off("chat_message");
    };
  }, []);

  return (
    <div className="flex flex-col w-full min-h-0 flex-1">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#2C2C38] scrollbar-track-transparent">
        {messages.map((eachText) => {
          if (eachText.user === "system") {
            return (
              <div
                key={eachText.keyId}
                className="flex items-center justify-center my-1 w-full"
              >
                <div className="text-[11px] text-gray-400  font-mono">
                  {eachText.message}
                </div>
              </div>
            );
          }
          return (
            <div
              key={eachText.keyId}
              className="felx flex-col max-w-[80%] mr-auto items-start gap-1"
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <h1 className="text-[16px] font-semibold font-sans text-[#8da2ec]">
                  {eachText.user}
                </h1>
                <p className="text-[14px] text-gray-600">
                  {eachText.timestamp}
                </p>
              </div>
              <div
                className={`px-3 py-2 rounded-2xl rounded-tl-none text-gray-200 text-sm font-sans border border-[#2c2c38]/40 break-words bg-[#282838]`}
              >
                {eachText.message}
              </div>
            </div>
          );
        })}
        <div ref={endMessageRef}></div>
      </div>
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[#2C2C38] bg-[#1e1e2e] flex gap-2 items-center shrink-0 h-10"
      >
        <input
          placeholder="Join the chat"
          type="text"
          value={inputText}
          onChange={(event) => {
            setInputText(event.target.value);
          }}
          className="flex-1 h-8 px-2 py-3 bg-[#282838] border border-[#2C2C38] rounded-full text-xs text-white placeholder-[#555574] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all duration-300 font-mono"
        ></input>
        <button
          className="w-7 h-7 px-1 py-1 text-[#6b7180] hover:text-blue-300 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 shrink-0 cursor-pointer shadow-md shadow-blue-950/20"
          type="submit"
        >
          <HugeiconsIcon icon={SentFreeIcons} />
        </button>
      </form>
    </div>
  );
}
