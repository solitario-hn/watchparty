import { FishingHook, Ghost } from "lucide-react";
import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";

export default function Video() {
  const [link, isLinked] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  return (
    <div className="h-full items-center justify-center w-full flex">
      {videoUrl === "" ? (
        <div className="relative transition-all duration-300 hover:scale-105 hover:-translate-y-2 scale-90 flex w-160 items-center text-[#555574] rounded-md bg-[#282838] p-2 outline-dashed outline-2 hover:outline-blue-300 focus-within:outline-blue-400">
          <input
            placeholder="Play your mood"
            type="text"
            value={link}
            onChange={(e) => isLinked(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setVideoUrl(link);
              }
            }}
            className="h-12 w-full bg-transparent font-mono pr-16  text-white outline-none placeholder:text-[#555574] "
          />

          <button
            onClick={() => setVideoUrl(link)}
            className="absolute cursor-pointer right-4 px-3 py-1 text-[#555574] hover:text-blue-300  transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95"
          >
            <Ghost />
          </button>
        </div>
      ) : (
        <ReactPlayer
          width={"100%"}
          height={"100%"}
          controls={true}
          src={videoUrl}
        />
      )}
    </div>
  );
}
