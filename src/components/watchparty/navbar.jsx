import { CircleCheck, CircleFadingPlus } from "lucide-react";
import { useEffect, useState } from "react";
import WFillLogo from "./logo";
import { socketClient } from "../socketclient";

export default function Navbar() {
  const [copied, isCopied] = useState(false);
  const [link, setLink] = useState("");
  const HandleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    isCopied(true);
    setTimeout(() => {
      isCopied(false);
    }, 1500);
  };

  useEffect(() => {
    function SsetLink(data) {
      setLink(data.videoUrl);
    }
    socketClient.on("room_state", SsetLink);

    return () => {
      socketClient.off("room_state", SsetLink);
    };
  }, []);
  function sendLink() {
    if (!link) return;

    socketClient.emit("room_state", {
      videoUrl: link,
      currentTime: 0,
      playing: true,
      playbackRate: 1,
    });

    console.log(link, "heheheh");
  }

  function handleLink(event) {
    const targetUrl = event.target.value;
    setLink(targetUrl);
  }
  return (
    <div className="h-18 w-full flex border-b px-4 border-[#2C2C38] items-center justify-between">
      <WFillLogo size={50} />
      <div className="flex flex-row gap-3">
        <input
          value={link}
          onChange={handleLink}
          className="w-56 max-w-[50vw] rounded border border-[#2C2C38] bg-[#20202e] px-3 py-1.5 text-xs font-mono text-[#8b9ecf] outline-none focus:border-blue-400"
          placeholder="paste your source"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              sendLink();
            }
          }}
          type="url"
        ></input>
        <button
          onClick={HandleCopy}
          aria-label="Copy room link"
          title="Copy room link"
          className="text-[#6b7180] text-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:text-blue-300"
        >
          {copied ? (
            <CircleCheck className="w-7 h-7 text-blue-300" />
          ) : (
            <CircleFadingPlus className="w-7 h-7 transition-all duration-300 " />
          )}
        </button>
      </div>
    </div>
  );
}
