import React, { useState } from "react";
import ReactPlayer from "react-player";

export default function Video() {
  const [link, isLinked] = useState("");
  return (
    <div className="h-full items-center justify-center w-full flex">
      {link === "" ? (
        <div>No video</div>
      ) : (
        <ReactPlayer
          width={"100%"}
          height={"100%"}
          controls={true}
          src="https://www.youtube.com/watch?v=KWoTyfPsqbE&list=RDgoqqohUitmw&index=2"
        />
      )}
    </div>
  );
}
