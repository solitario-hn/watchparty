import { CircleCheck, CircleFadingPlus } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [copied, isCopied] = useState(false);
  const HandleCopy = async () => {
    await navigator.clipboard.writeText("Hello World");
    isCopied(true);
    setTimeout(() => {
      isCopied(false);
    }, 1500);
  };
  return (
    <div className="h-18 w-full flex border-b px-4 border-[#2C2C38] items-center justify-between">
      <h1 className="text-3xl font-mono text-[#6b7180] font-semibold">HBS</h1>
      <button onClick={HandleCopy} className="text-[#6b7180] text-2xl">
        {copied ? (
          <CircleCheck className="w-7 h-7 text-blue-300" />
        ) : (
          <CircleFadingPlus className="w-7 h-7 transition-all duration-300 " />
        )}
      </button>
    </div>
  );
}
