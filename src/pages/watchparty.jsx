import { useEffect, useState } from "react";
import Navbar from "../components/watchparty/navbar";
import Video from "../components/watchparty/video";
import Sidebar from "../components/watchparty/sidebar";
import { useParams, useNavigate } from "react-router-dom";
import { socketClient } from "../components/socketclient";
import getUser from "../utils/type";

export default function Watchparty() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const { roomid: roomId } = useParams();
  const navigate = useNavigate();
  const validRoom = !roomId || /^[A-Za-z0-9_-]{4,64}$/.test(roomId);

  useEffect(() => {
    if (!roomId) {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      navigate(
        `/${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`,
        { replace: true },
      );
      return;
    }
    if (!validRoom) return;
    const join = () => {
      socketClient.emit(
        "joined_room",
        { roomId, userName: getUser() },
        (result) => {
          socketClient.partyReady = Boolean(result?.ok);
          setConnected(Boolean(result?.ok));
          setError(result?.ok ? "" : result?.error || "Could not join room.");
        },
      );
    };
    const disconnect = () => setConnected(false);
    const connectionError = () => {
      setConnected(false);
      setError("Unable to connect. Retrying…");
    };
    const roomError = (message) => setError(message);
    socketClient.on("connect", join);
    socketClient.on("disconnect", disconnect);
    socketClient.on("connect_error", connectionError);
    socketClient.on("room_error", roomError);
    const localError = (event) => roomError(event.detail);
    window.addEventListener("watchparty-error", localError);
    if (socketClient.connected) join();
    else socketClient.connect();
    return () => {
      socketClient.off("connect", join);
      socketClient.off("disconnect", disconnect);
      socketClient.off("connect_error", connectionError);
      socketClient.off("room_error", roomError);
      window.removeEventListener("watchparty-error", localError);
      socketClient.disconnect();
    };
  }, [roomId, navigate, validRoom]);

  return (
    <section className="flex flex-col bg-[#14141B] w-full h-dvh overflow-hidden">
      <Navbar />
      {!validRoom ? (
        <p role="alert" className="p-4 text-red-300">
          Invalid room link.{" "}
          <a href="/" className="underline">
            Create a new room
          </a>
        </p>
      ) : (
        <>
          {(!connected || error) && (
            <div
              role="status"
              className="px-4 py-2 text-sm text-amber-200 bg-[#282838]"
            >
              {error || "Connecting to your room…"}
              {error && (
                <button
                  aria-label="Dismiss message"
                  className="ml-4 underline"
                  onClick={() => setError("")}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
          <div className="flex flex-col md:flex-row flex-1 w-full min-h-0">
            <Video key={`video-${roomId}`} />
            <Sidebar
              key={`sidebar-${roomId}`}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
            />
          </div>
        </>
      )}
    </section>
  );
}
