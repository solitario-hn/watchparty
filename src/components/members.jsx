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

  return (
    <div className="relative flex flex-col justify-center w-full select-none py-1 ">
      <div className="flex justify-center m-2">
        <p className="text-[#6b7180] font-mono text-[20px] px-5 py-5 ">
          In the room ◦{member.length}
        </p>
      </div>
      <div className="flex items-center ">
        <div
          onClick={() => setDropDown(!showDropDown)}
          className="flex items-center -space-x-2 cursor-pointer group"
        >
          {member.forEach((element) => {
            <div
              id={element.id}
              className="relative group/avatar  "
              style={{ zIndex: `${element.id}` }}
            >
              <div
                className={`w-8 h-8 rounded-full ${element.bg} border-2 border-blue-300 flex items-center justify-center text-xs shadow-md transition-all duration-200 group-hover/avatar:scale-110 group-hover/avatar:z-50  `}
              >
                {element.name.charAt(0).toUpperCase()}
              </div>
            </div>;
          })}
          {/* <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hid"></div> */}
        </div>
      </div>
    </div>
  );
}
