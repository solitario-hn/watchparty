import { useEffect, useState } from "react";
import { socketClient } from "../socketclient";
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

  useEffect(() => {
    const HandleRoomMembers = (users) => {
      const newMember = users.map((user) => ({
        id: user.socketId,
        name: getUser(),
        initial: getUser()[0],
        status: "participant",
        bg: BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
      }));
      setMember(newMember);
    };

    socketClient.on("room_members", HandleRoomMembers);

    return () => {
      socketClient.off("room_members", HandleRoomMembers);
    };
  }, []);

  const [showDropDown, setDropDown] = useState(false);
  const visibleMembers = member.slice(0, 3);
  const remainingMembers = member.length - visibleMembers.length;

  return (
    <div>
      <div className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-3">
        IN THE ROOM · {member.length}
      </div>
      <div
        // onClick={() => setDropDown(!showDropDown)}
        className="flex items-center -space-x-2 cursor-pointer group"
      >
        {visibleMembers.map((element) => (
          <div
            key={element.id}
            className="relative"
            style={{ zIndex: element.id }}
          >
            <div
              className={`w-8 h-8 rounded-full ${element.bg} border-2 border-black flex items-center justify-center text-xs`}
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
    </div>
  );
}
