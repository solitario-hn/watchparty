import { useState } from "react";

export default function Member() {
  const [member, setMember] = useState([
    {
      id: 1,
      name: "Bahadur",
      initial: "B",
      status: "participant",
      bg: "bg-[#f4b41a]",
    },
    {
      id: 2,
      name: "Gupta",
      initial: "G",
      status: "participant",
      bg: "bg-[#e3edfc]",
    },
    {
      id: 3,
      name: "Royal King",
      initial: "R",
      status: "host",
      bg: "bg-[#092b08]",
    },
    {
      id: 4,
      name: "Raj Vijay Bahadur",
      initial: "R",
      status: "participant",
      bg: "bg-[#8b2963]",
    },
  ]);

  const [showDropDown, setDropDown] = useState(false);
  const visibleMembers = member.slice(0, 3);
  const remainingMembers = member.length - visibleMembers.length;

  return (
    <div className=" realtive">
      <div className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-3">
        IN THE ROOM · {member.length}
      </div>{" "}
      <div
        onClick={() => setDropDown(!showDropDown)}
        className="flex items-center -space-x-2 cursor-pointer group"
      >
        {visibleMembers.forEach((element) => {
          <div
            id={element.id}
            className="relative   "
            style={{ zIndex: `${element.id}` }}
          >
            <div
              className={`w-8 h-8 rounded-full ${element.bg} border-2 border-blue-300 flex items-center justify-center text-xs shadow-md transition-all duration-200 group-hover/avatar:scale-110 group-hover/avatar:z-50  `}
            >
              {element.initial}
            </div>
          </div>;
        })}
        {remainingMembers > 0 && (
          <div className="w-8 h-8 rounded-full bg-[#e3edfc] border-2 border-blue-300 flex items-center justify-center text-xs shadow-md transition-all duration-200 group-hover:scale-110 group-hover:z-50">
            +{remainingMembers}
          </div>
        )}
      </div>
    </div>
  );
}
