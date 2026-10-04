import { useEffect, useState } from "react";
import { socketClient, emitRoomEvent } from "../socketclient";
import getUser from "../../utils/type";

const BG_COLORS = [
  "bg-[#f4b41a]",
  "bg-[#4f8f7d]",
  "bg-[#7669aa]",
  "bg-[#8b2963]",
  "bg-[#3b82f6]",
  "bg-[#10b981]",
];

export default function Member() {
  const [member, setMember] = useState([]);
  const [userName, setUserName] = useState(getUser);

  useEffect(() => {
    const HandleRoomMembers = (users) => {
      if (!Array.isArray(users)) return;
      const newMember = users.map((user) => ({
        id: user.socketId,
        name: user.userName,
        initial: user.userName?.[0]?.toUpperCase() || "?",
        status: "participant",
        bg: BG_COLORS[
          Array.from(user.socketId).reduce(
            (sum, char) => sum + char.charCodeAt(0),
            0,
          ) % BG_COLORS.length
        ],
      }));
      setMember(newMember);
    };

    socketClient.on("room_members", HandleRoomMembers);

    return () => {
      socketClient.off("room_members", HandleRoomMembers);
    };
  }, []);

  const visibleMembers = member.slice(0, 3);
  const remainingMembers = member.length - visibleMembers.length;

  const HandleUserName = (event) => {
    setUserName(event.target.value);
  };

  return (
    <div className="flex flex-col  justify-center h-full w-full">
      <div>
        <div className="flex flex-row">
          <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-3">
            IN THE ROOM · {member.length}
          </div>
        </div>
        <div className="flex items-center -space-x-2 cursor-pointer group">
          {visibleMembers.map((element) => (
            <div key={element.id} className="relative">
              <div
                className={`w-7 h-7 rounded-full ${element.bg} border-2 border-black flex items-center justify-center text-xs`}
              >
                {element.initial}
              </div>
            </div>
          ))}
          {remainingMembers > 0 && (
            <div className="w-8 h-8 rounded-full bg-[#e3edfc] border-2 border-black flex items-center justify-center text-xs shadow-md ">
              +{remainingMembers}
            </div>
          )}
        </div>
        <div className="flex justify-end items-center mt-2">
          <input
            value={userName}
            onChange={HandleUserName}
            onBlur={() => {
              const name = userName.trim();
              if (
                !name ||
                name.toLowerCase() === "system" ||
                Array.from(name).some(
                  (char) =>
                    char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
                )
              ) {
                setUserName(getUser());
                return;
              }
              if (emitRoomEvent("change_userName", name)) {
                try {
                  localStorage.setItem("watchparty_name", name);
                } catch { /* Storage is disabled; the server still keeps this session name. */ }
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            maxLength={40}
            aria-label="Your display name"
            className="w-32 h-6 pl-5 pr-2 bg-[#20202e] hover:bg-[#252538] focus:bg-[#282838] text-white text-xs font-mono rounded border border-[#2c2c38] focus:border-blue-400 outline-none transition-all placeholder:text-gray-600"
            placeholder="choose your aura"
            type="text"
          ></input>
        </div>
      </div>
    </div>
  );
}
