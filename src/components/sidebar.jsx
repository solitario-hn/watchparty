import {
  ArrowRightDoubleIcon,
  HugeiconsIcon,
} from "@hugeicons/core-free-icons";
import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

export default function Sidebar({ showSidebar, setShowSidebar }) {
  console.log(showSidebar);
  return (
    <div
      className={`relative text-3xl h-full transition-all duration-300 flex flex-col border-l border-[#2C2C38] ${showSidebar ? "w-[35%]" : "w-0"}`}
    >
      <button
        onClick={() => {
          setShowSidebar(!showSidebar);
        }}
        className="absolute left-0 top-1/2  translate-all duration-300 hover:zoom-110 not-hover:text-[#6b7180] hover:scale-90 z-40 -translate-x-full  hover:text-blue-300"
      >
        {showSidebar ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-blue-300 animate-pulse" />
        )}
      </button>
      <div className="flex w-full h-28 border-b border-[#2C2C38]">
        <h1 className="text-amber-50 font-mono">Members</h1>
      </div>
      <div className="flex w-full h-full">
        <h1 className="text-white text-9xl font-mono">Chat</h1>
      </div>
    </div>
  );
}
