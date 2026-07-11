import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Video from "./components/video";

function App() {
  return (
    <section className="flex flex-col bg-[#14141B] w-screen h-screen">
      <Navbar />
      <div className="flex-row flex w-full h-full">
        <Video />
        <Sidebar />
      </div>
    </section>
  );
}

export default App;
