import { useEffect, useState } from "react";
import Navbar from "../components/watchparty/navbar";
import Video from "../components/watchparty/video";
import Sidebar from "../components/watchparty/sidebar";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { socketClient } from "../components/socketclient";
import getUser from "../utils/type";

function Watchparty() {
  const [showSidebar, setShowSidebar] = useState(true);
  const params = useParams();
  const roomId = params.roomid;
  console.log(roomId);
  let navigate = useNavigate();

  useEffect(() => {
    if (!roomId) {
      const newId = crypto.randomUUID().slice(0, 4); //generates a rrandom room id.
      navigate(`/${newId}`, { replace: true }); //changes the url completely replace.
      console.log(newId, "newId");
      return;
    }
    socketClient.emit("joined_room", {
      roomId,
      userName: getUser(),
    });
  }, [roomId, navigate]); //re-run the function inside the useEffect again everytime roomId or navigate is changed.

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
