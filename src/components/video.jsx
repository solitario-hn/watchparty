import {
  HugeiconsFreeIcons,
  Maximize02FreeIcons,
  PauseIcon,
  PlayCircleIcon,
  PlayIcon,
  VolumeHighFreeIcons,
  VolumeMute02FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CirclePause,
  CirclePlay,
  FishingHook,
  Ghost,
  Play,
  PlayOff,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";

export default function Video() {
  const [link, isLinked] = useState("");
  const [videoUrl, setVideoUrl] = useState(
    "https://youtu.be/nBv5BzFpvvE?si=52of4txwdXj7kTzf",
  );
  const [playing, isPlaying] = useState(false);
  const [muted, isMuted] = useState(false);

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
        <div className="flex flex-col h-full w-full ">
          <ReactPlayer
            width={"100%"}
            height={"100%"}
            controls={true}
            src={videoUrl}
          />
          <div className="flex flex-row items-center w-full h-10 px-2 p-2 justify-between gap-2 bg-[#1e1e2e]">
            <button
              onClick={() => {
                isPlaying(!playing);
              }}
              className="text-[#6b7180] text-2xl w-7 h-7 transition-all duration-300 hover:text-blue-300 cursor-pointer hover:scale-105 hover:-translate-y-0.75"
            >
              <HugeiconsIcon icon={playing ? PlayIcon : PauseIcon} />
            </button>
            <div className="flex items-center group/volume ">
              <button
                onClick={() => {
                  isMuted(!muted);
                }}
                className="text-[#6b7180] text-2xl w-7 h-7 transition-all duration-300 hover:text-blue-300 cursor-pointer hover:scale-105 hover:-translate-y-0.75"
              >
                <HugeiconsIcon
                  icon={muted ? VolumeMute02FreeIcons : VolumeHighFreeIcons}
                />
              </button>
              <input
                className="w-0 bg-[#8b9ecf] h-1 rounded-lg opacity-0 transition-all duration-300 group-hover/volume:w-16 group-hover/volume:opacity-100 accent-blue-300 focus:accent-blue-400  appearance-none focus:outline-none"
                type="range"
                min={0}
                max={1}
                step={0.05}
              />
            </div>
            <div className="flex flex-row gap-3 items-center">
              <h1 className="font-mono text-lg text-[#8b9ecf]">01:02:23</h1>
              <input
                type="range"
                min={0}
                max={1}
                steps="any"
                className="w-200 bg-[#8b9ecf] h-1 rounded-lg  transition-all duration-300  accent-blue-300 focus:accent-blue-400  appearance-none focus:outline-none"
              />
            </div>
            <button className="font-mono text-sm text-[#8b9ecf] rounded-sm px-2 py-0.5 transition-all duration-300 hover:bg-[#8b9ecf] hover:text-[#1e1e2e]">
              CC
            </button>

            <div className="flex flex-row gap-2 items-center text-sm text-[#8b9ecf] font-mono">
              <select
                name="cars"
                id="cars"
                className="bg-[#1e1e2e] text-[#8b9ecf] outline-none rounded-sm appearance-none"
              >
                <option value="volvo">Normal</option>
                <option value="saab">Slow</option>
                <option value="mercedes">Fast</option>
              </select>
            </div>
            <HugeiconsIcon
              className="text-[#6b7180] text-2xl w-6 h-6 transition-all duration-300 hover:text-blue-300 cursor-pointer hover:scale-105 hover:-translate-y-0.75"
              icon={Maximize02FreeIcons}
            />
          </div>
        </div>
      )}
    </div>
  );
}
