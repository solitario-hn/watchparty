import { ChevronLeft, ChevronRight } from "lucide-react";
import Chat from "./chat";
import Member from "./members";

export default function Sidebar({ showSidebar, setShowSidebar }) {
  return (
    <div
      className={`relative text-3xl md:h-full shrink-0 transition-all duration-300 flex flex-col border-l border-[#2C2C38] ${showSidebar ? "w-full h-[40%] md:w-80" : "w-full h-0 md:w-0 overflow-visible"}`}
    >
      <button
        aria-label={showSidebar ? "Hide chat" : "Show chat"}
        aria-expanded={showSidebar}
        onClick={() => {
          setShowSidebar(!showSidebar);
        }}
        className="absolute right-2 -top-6 md:right-auto md:left-0 md:top-1/2  translate-all duration-300 hover:zoom-110 not-hover:text-[#6b7180] hover:scale-90 z-40 md:-translate-x-full hover:text-blue-300"
      >
        {showSidebar ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-blue-300 animate-pulse" />
        )}
      </button>

      <div
        className={`flex flex-col w-full h-full ${showSidebar ? "" : "invisible"}`}
      >
        <div className="flex w-full h-28 border-b border-[#2C2C38] shrink-0 px-2 py-2 items-center">
          <Member />
        </div>
        <Chat />
      </div>
    </div>
  );
}
