import {
  Maximize02FreeIcons,
  PauseIcon,
  PlayIcon,
  VolumeHighFreeIcons,
  VolumeMute02FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Ghost, Subtitles, Check, Upload } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import ReactPlayer from "react-player";
import { socketClient } from "../socketclient";
import { getStremioPlaybackUrl } from "../../utils/stremio";

function convertToVtt(content) {
  if (!content) return "";
  const trimmed = content.trim();
  if (trimmed.startsWith("WEBVTT")) {
    return trimmed;
  }
  const converted = trimmed.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return `WEBVTT\n\n${converted}`;
}

function parseSubtitles(content) {
  if (!content) return [];
  const cues = [];
  const text = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const parseTime = (h, m, s, ms) => {
    const hours = parseInt(h || "0", 10);
    const minutes = parseInt(m, 10);
    const seconds = parseInt(s, 10);
    const milliseconds = parseInt((ms || "0").padEnd(3, "0").slice(0, 3), 10);
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
  };

  const blocks = text.split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(
        /(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{2,3})\s*-->\s*(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{2,3})/,
      );
      if (match) {
        const start = parseTime(match[1], match[2], match[3], match[4]);
        const end = parseTime(match[5], match[6], match[7], match[8]);
        const textLines = lines
          .slice(i + 1)
          .filter((l) => !l.startsWith("NOTE") && !l.startsWith("STYLE"));
        const rawCueText = textLines.join("\n").trim();
        const cleanCueText = rawCueText.replace(/<[^>]+>/g, "").trim();
        if (cleanCueText && end > start) {
          cues.push({ start, end, text: cleanCueText });
        }
        break;
      }
    }
  }
  return cues;
}

export default function Video() {
  const pendingSeekTimeRef = useRef(null);
  const playerRef = useRef(null);
  const videoContainerRef = useRef(null);
  const ccMenuRef = useRef(null);
  const [link, isLinked] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [playing, isPlaying] = useState(false);
  const [muted, isMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playerbackrate, setPlayerBackRate] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [played, setPlayed] = useState(0);
  const [subtitle, setSubtitle] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const [seek, setSeeking] = useState(false);
  const [showSubtitles, SetshowSubtitles] = useState(false);
  const [ccMenuOpen, setCcMenuOpen] = useState(false);

  const playbackUrl = useMemo(() => {
    const supportsHevc =
      globalThis.MediaSource?.isTypeSupported(
        'video/mp4; codecs="hvc1.1.6.L93.B0"',
      ) &&
      globalThis.MediaSource?.isTypeSupported(
        'video/mp4; codecs="hvc1.2.4.L153.B0"',
      );
    return getStremioPlaybackUrl(videoUrl, supportsHevc);
  }, [videoUrl]);

  useEffect(() => {
    if (!subtitle) {
      setBlobUrl("");
      return;
    }
    const vttContent = convertToVtt(subtitle);
    const blob = new Blob([vttContent], { type: "text/vtt" });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [subtitle]);

  const cues = useMemo(() => {
    return parseSubtitles(subtitle);
  }, [subtitle]);

  const activeCue = useMemo(() => {
    if (!showSubtitles || cues.length === 0) return null;
    return (
      cues.find((c) => currentTime >= c.start && currentTime <= c.end) || null
    );
  }, [showSubtitles, cues, currentTime]);

  const syncTrackMode = (isShowing) => {
    const video = playerRef.current;
    if (!video || !video.textTracks) return;
    for (let i = 0; i < video.textTracks.length; i++) {
      // Keep native track hidden to prevent duplicate rendering with custom overlay
      video.textTracks[i].mode = "hidden";
    }
  };

  useEffect(() => {
    syncTrackMode(showSubtitles && Boolean(subtitle));

    const video = playerRef.current;
    if (video?.textTracks) {
      const handleTrackChange = () =>
        syncTrackMode(showSubtitles && Boolean(subtitle));
      video.textTracks.addEventListener?.("addtrack", handleTrackChange);
      video.textTracks.addEventListener?.("change", handleTrackChange);
      return () => {
        video.textTracks.removeEventListener?.("addtrack", handleTrackChange);
        video.textTracks.removeEventListener?.("change", handleTrackChange);
      };
    }
  }, [showSubtitles, subtitle, blobUrl]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ccMenuRef.current && !ccMenuRef.current.contains(event.target)) {
        setCcMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setCcMenuOpen(false);
      }
    }
    if (ccMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ccMenuOpen]);

  useEffect(() => {
    function HandleRoomState(data) {
      if (!data) {
        return;
      }
      const videoChanged = Boolean(data.videoUrl && data.videoUrl !== videoUrl);
      if (videoChanged) {
        setVideoUrl(data.videoUrl);
        setDuration(0);
        setPlayed(0);
        // The new HLS stream loads asynchronously; seek once its metadata is ready.
        pendingSeekTimeRef.current = data.currentTime ?? 0;
      }
      if (typeof data.playing === "boolean") {
        isPlaying(data.playing);
      }
      if (typeof data.playbackRate === "number") {
        setPlayerBackRate(data.playbackRate);
      }
      if (typeof data.currentTime === "number") {
        if (!videoChanged && playerRef.current?.readyState >= 1) {
          playerRef.current.currentTime = data.currentTime;
        } else {
          pendingSeekTimeRef.current = data.currentTime;
        }
        setCurrentTime(data.currentTime);
      }
      if (typeof data.subtitle === "string" && data.subtitle.trim()) {
        const formatted = convertToVtt(data.subtitle);
        setSubtitle(formatted);
      }
    }
    socketClient.on("room_state", HandleRoomState);

    return () => {
      socketClient.off("room_state", HandleRoomState);
    };
  }, [videoUrl]);

  useEffect(() => {
    function HandleSubitle(data) {
      if (typeof data === "string" && data.trim()) {
        const formatted = convertToVtt(data);
        setSubtitle(formatted);
        SetshowSubtitles(true);
      }
    }

    socketClient.on("room_subtitle", HandleSubitle);

    return () => {
      socketClient.off("room_subtitle", HandleSubitle);
    };
  }, []);

  function handleReady() {
    if (pendingSeekTimeRef.current !== null && playerRef.current) {
      playerRef.current.currentTime = pendingSeekTimeRef.current;
      pendingSeekTimeRef.current = null;
    }
    syncTrackMode(Boolean(showSubtitles && subtitle));
  }

  function handleVolumeChange(event) {
    const val = parseFloat(event.target.value);
    setVolume(val);
    if (val > 0) {
      isMuted(false);
    } else {
      isMuted(true);
    }
  }

  function handleVideoURL(url) {
    const targetUrl = url.trim();
    if (!targetUrl) {
      return;
    }
    setVideoUrl(targetUrl);
    setDuration(0);
    pendingSeekTimeRef.current = 0;
    setCurrentTime(0);
    setPlayed(0);
    isPlaying(true);

    socketClient.emit("room_state", {
      videoUrl: targetUrl,
      currentTime: 0,
      playing: true,
      playbackRate: playerbackrate,
    });
  }

  function handlePlayPause() {
    const newPlayingState = !playing;
    isPlaying(newPlayingState);
    const currentTime = playerRef.current ? playerRef.current.currentTime : 0;
    socketClient.emit("room_state", {
      playing: newPlayingState,
      currentTime: currentTime,
    });
  }

  function handlePlaybackRateChange(event) {
    const rate = parseFloat(event.target.value);
    setPlayerBackRate(rate);
    socketClient.emit("room_state", { playbackRate: rate });
  }

  function handleDurationChange(event) {
    const dur = event.target?.duration;
    if (dur && !isNaN(dur)) {
      setDuration(dur);
    }
  }

  function handleTimeUpdate(event) {
    if (!seek) {
      const curr = event.target?.currentTime || 0;
      setCurrentTime(curr);
      const dur = event.target?.duration || duration;
      if (dur && !isNaN(dur) && dur > 0) {
        setDuration(dur);
        setPlayed(curr / dur);
      }
    }
  }

  function handleSeekChange(event) {
    const value = parseFloat(event.target.value);
    setPlayed(value);
    if (duration > 0) {
      setCurrentTime(value * duration);
    }
  }
  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (event) => {
    setSeeking(false);
    const value = parseFloat(event.target.value);
    const newTime = value * duration;
    if (playerRef.current) {
      playerRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    setPlayed(value);

    socketClient.emit("room_state", { currentTime: newTime, playing: playing });
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) {
      return "00:00";
    }
    const hour = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const second = Math.floor(seconds % 60);
    const formatNum = (num) => String(num).padStart(2, "0");
    return `${formatNum(hour)}:${formatNum(minutes)}:${formatNum(second)}`;
  };

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const rawText = await file.text();
    const formatted = convertToVtt(rawText);
    setSubtitle(formatted);
    SetshowSubtitles(true);
    socketClient.emit("room_subtitle", formatted);
    setCcMenuOpen(false);
    event.target.value = "";
  };

  const handleToggleSubtitle = (enable) => {
    if (enable && !subtitle) return;
    SetshowSubtitles(enable);
    setCcMenuOpen(false);
  };

  return (
    <div className="h-full items-center justify-center w-full flex flex-1">
      {videoUrl === "" ? (
        <div className="relative transition-all duration-300 hover:scale-105 hover:-translate-y-2 scale-90 flex w-160 items-center text-[#555574] rounded-md bg-[#282838] p-2 outline-dashed outline-2 hover:outline-blue-300 focus-within:outline-blue-400">
          <input
            placeholder="Play your mood"
            type="text"
            value={link}
            onChange={(e) => isLinked(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleVideoURL(link);
              }
            }}
            className="h-12 w-full bg-transparent font-mono pr-16  text-white outline-none placeholder:text-[#555574] "
          />

          <button
            onClick={() => handleVideoURL(link)}
            className="absolute cursor-pointer right-4 px-3 py-1 text-[#555574] hover:text-blue-300  transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95"
          >
            <Ghost />
          </button>
        </div>
      ) : (
        <div
          ref={videoContainerRef}
          className="flex flex-col h-full w-full relative bg-black select-none"
        >
          <div className="relative flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center bg-black">
            <ReactPlayer
              ref={playerRef}
              width={"100%"}
              height={"100%"}
              controls={false}
              onLoadedMetadata={handleReady}
              onEnded={() => {
                isPlaying(false);
                socketClient.emit("room_state", {
                  playing: false,
                  currentTime: playerRef.current?.currentTime || 0,
                });
              }}
              onError={(error) => {
                console.error("Error loading video:", error);
              }}
              playing={playing}
              src={playbackUrl}
              muted={muted}
              volume={volume}
              playbackRate={playerbackrate}
              onDurationChange={(event) => {
                handleDurationChange(event);
              }}
              onTimeUpdate={(event) => {
                handleTimeUpdate(event);
              }}
            >
              {blobUrl && (
                <track
                  kind="subtitles"
                  src={blobUrl}
                  srcLang="en"
                  label="English"
                  default
                />
              )}
            </ReactPlayer>

            {/* Custom Subtitles Overlay */}
            {showSubtitles && activeCue && (
              <div className="absolute bottom-6 left-0 right-0 pointer-events-none flex justify-center z-30 px-6">
                <span className="bg-black/85 text-white font-sans text-base sm:text-lg md:text-xl font-medium px-4 py-1.5 rounded-lg shadow-2xl text-center backdrop-blur-xs leading-relaxed max-w-[85%] select-none whitespace-pre-line border border-white/10 tracking-wide">
                  {activeCue.text}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-row items-center w-full h-10 px-2 p-2 justify-between gap-2 bg-[#1e1e2e] shrink-0">
            <button
              onClick={() => {
                handlePlayPause();
              }}
              className="text-[#6b7180] text-2xl w-7 h-7 transition-all duration-300 hover:text-blue-300 cursor-pointer hover:scale-105 hover:-translate-y-0.75 shrink-0"
            >
              <HugeiconsIcon icon={playing ? PauseIcon : PlayIcon} />
            </button>
            <div className="flex items-center group/volume ">
              <button
                onClick={() => {
                  isMuted(!muted);
                }}
                className="text-[#6b7180] text-2xl w-7 h-7 transition-all duration-300 hover:text-blue-300 cursor-pointer hover:scale-105 hover:-translate-y-0.75 shrink-0"
              >
                <HugeiconsIcon
                  icon={muted ? VolumeMute02FreeIcons : VolumeHighFreeIcons}
                />
              </button>
              <input
                className="w-0 shrink-0 bg-[#8b9ecf] h-1 rounded-lg opacity-0 transition-all duration-300 group-hover/volume:w-16 group-hover/volume:opacity-100 group-hover/volume:-translate-y-0.75 accent-blue-300 focus:accent-blue-400  appearance-none focus:outline-none"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(event) => {
                  handleVolumeChange(event);
                }}
              />
            </div>
            <div className="flex  flex-row gap-3 items-center min-w-0 flex-1">
              <h1 className="font-mono text-sm text-[#8b9ecf]">
                {formatTime(currentTime)}
              </h1>
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={played}
                onChange={(event) => {
                  handleSeekChange(event);
                }}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                onTouchStart={handleSeekMouseDown}
                onTouchEnd={handleSeekMouseUp}
                style={{
                  background: `linear-gradient(to right, #8b9ecf ${
                    played * 100
                  }%, #2a2a2a ${played * 100}%)`,
                }}
                className="flex-1 h-3 bg-[#2a2a2a] appearance-none focus:outline-none no-thumb cursor-pointer"
              />
              <h1 className="font-mono text-sm text-[#8b9ecf] shrink-0">
                {formatTime(duration)}
              </h1>
            </div>

            <div className="relative shrink-0" ref={ccMenuRef}>
              <button
                type="button"
                onClick={() => setCcMenuOpen((prev) => !prev)}
                className={`font-mono text-sm rounded-sm px-2.5 py-0.5 flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                  showSubtitles && subtitle
                    ? "bg-[#8b9ecf] text-[#1e1e2e] font-semibold shadow-sm"
                    : ccMenuOpen
                      ? "bg-[#282838] text-blue-300"
                      : "text-[#8b9ecf] hover:bg-[#8b9ecf]/20 hover:text-white"
                }`}
                title="Subtitles & Captions"
              >
                <span>CC</span>
                {showSubtitles && subtitle && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>

              {ccMenuOpen && (
                <div className="absolute bottom-full right-0 mb-3 w-56 rounded-xl bg-[#1e1e2e] border border-[#35354a] shadow-2xl p-2 flex flex-col gap-1 z-50 text-xs font-mono text-[#8b9ecf]">
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#2d2d42] mb-1">
                    <span className="font-semibold text-white tracking-wider text-[11px] uppercase flex items-center gap-1.5">
                      <Subtitles className="w-3.5 h-3.5 text-[#8b9ecf]" />
                      Subtitles
                    </span>
                    {subtitle ? (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/25">
                        Loaded
                      </span>
                    ) : (
                      <span className="text-[10px] bg-[#2a2a3c] text-[#787895] px-1.5 py-0.5 rounded">
                        None
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSubtitle(false)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                      !showSubtitles
                        ? "bg-[#28283d] text-white font-medium"
                        : "hover:bg-[#252538] hover:text-white text-[#8b9ecf]"
                    }`}
                  >
                    <span>Subtitles Off</span>
                    {!showSubtitles && (
                      <Check className="w-3.5 h-3.5 text-blue-300" />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!subtitle}
                    onClick={() => handleToggleSubtitle(true)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                      !subtitle
                        ? "opacity-40 cursor-not-allowed text-[#555574]"
                        : showSubtitles
                          ? "bg-[#28283d] text-white font-medium cursor-pointer"
                          : "hover:bg-[#252538] hover:text-white text-[#8b9ecf] cursor-pointer"
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span>Subtitles On</span>
                      {!subtitle && (
                        <span className="text-[9px] text-[#555574]">
                          Upload required
                        </span>
                      )}
                    </div>
                    {showSubtitles && subtitle && (
                      <Check className="w-3.5 h-3.5 text-blue-300" />
                    )}
                  </button>

                  <div className="h-px bg-[#2d2d42] my-1" />

                  <label className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-blue-300 hover:bg-blue-400/10 hover:text-blue-200 transition-all duration-200 cursor-pointer group">
                    <Upload className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
                    <div className="flex flex-col text-left">
                      <span className="font-medium">
                        {subtitle ? "Replace Subtitle" : "Upload Subtitle"}
                      </span>
                      <span className="text-[10px] text-[#6b7180]">
                        .vtt or .srt
                      </span>
                    </div>
                    <input
                      type="file"
                      onChange={onFileChange}
                      className="hidden"
                      accept=".vtt,.srt"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-row gap-2 items-center text-sm text-[#8b9ecf] font-mono shrink-0">
              <select
                value={playerbackrate}
                name="playbackRate"
                id="playbackRate"
                className="bg-[#1e1e2e] text-[#8b9ecf] outline-none rounded-sm appearance-none"
                onChange={(event) => {
                  handlePlaybackRateChange(event);
                }}
              >
                <option value={0.5}>0.5X</option>
                <option value={1}>1.0X</option>
                <option value={1.5}>1.5X</option>
                <option value={2}>2.0X</option>
              </select>
            </div>

            <HugeiconsIcon
              onClick={() => {
                const el = videoContainerRef.current || playerRef.current;
                if (el) {
                  if (!document.fullscreenElement) {
                    el.requestFullscreen?.().catch(() => {
                      playerRef.current?.requestFullscreen?.();
                    });
                  } else {
                    document.exitFullscreen?.().catch(() => {});
                  }
                }
              }}
              className="text-[#6b7180] text-2xl w-6 h-6 transition-all duration-300 hover:text-blue-300 cursor-pointer hover:scale-105 hover:-translate-y-0.75"
              icon={Maximize02FreeIcons}
            />
          </div>
        </div>
      )}
    </div>
  );
}
