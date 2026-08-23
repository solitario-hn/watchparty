import { useState } from "react";
import Navbar from "../components/watchparty/navbar";
import Video from "../components/watchparty/video";
import Sidebar from "../components/watchparty/sidebar";

function Watchparty() {
  const [showSidebar, setShowSidebar] = useState(true);
  return (
    <section className="flex flex-col bg-[#14141B] w-screen h-screen overflow-hidden">
      <Navbar />
      <div className="flex-row flex flex-1 w-full min-h-0">
        <Video />
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      </div>
    </section>
  );
}

export default Watchparty;
