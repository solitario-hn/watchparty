import { useState } from "react";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Video from "./components/video";

function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  return (
    <section className="flex flex-col bg-[#14141B] w-screen h-screen overflow-hidden">
      <Navbar />
      <div className="flex-row flex flex-1 w-full h-full">
        <Video />
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      </div>
    </section>
  );
}

export default App;
