import { useEffect, useState } from "react";
import Navbar from "../components/watchparty/navbar";
import Video from "../components/watchparty/video";
import Sidebar from "../components/watchparty/sidebar";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

// hii my name is Rohit by the way.
// im a good guy...
// no i wanted to be a good guy.
// Or... did i never want to?
// Or will i never be a good guy?
// does that change who i am?
// Ohhh anime-chan powers i need you!
// make me dark and mysterious.
// i will not give up... im—
// im... m-m-m... im the GOAT!
// Obito-chan...

function Watchparty() {
  const [showSidebar, setShowSidebar] = useState(true);
  const params = useParams();
  const roomId = params.roomid;
  console.log(roomId);
  let navigate = useNavigate();

  const getUser = () => {
    const userName = localStorage.getItem("watchparty_name");
    if (userName) {
      return userName;
    } else {
      const userName = `${names[Math.floor(Math.random() * names.length)]}${Math.floor(10 + Math.random() * 90)}`;
      localStorage.setItem("watchpaty_name", userName);
      return userName;
    }
  };
  useEffect(() => {
    if (!roomId) {
      const newId = crypto.randomUUID().slice(0, 4); //generates a rrandom room id.
      navigate(`/watch/${newId}`, { replace: true }); //changes the url completely replace.
      console.log(newId, "newId");
      return;
    }
    const JoinRoom = () => {
      Socket.emit("joined_room", {
        roomId,
        userName: getUser(),
      });
    };

    // Socket.on("connect", JoinRoom);  //first check.
    // if (socket.connected) {  //second check.
    //   joinRoom();
    // }
    // return () => {
    //   socket.off("connect", joinRoom);
    // };
  }, [roomId, navigate]); //re-run the function inside the useEffect again everytime roomId or navigate is changed.

  return (
    <section className="flex flex-col bg-[#14141B] w-screen h-screen overflow-hidden">
      <Navbar />
      <div className="flex-row flex flex-1 w-full min-h-0">
        <Video />
        <Sidebar
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          roomId={roomId}
        />
      </div>
    </section>
  );
}

export default Watchparty;
