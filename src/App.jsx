import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/landingpage";
import Watchparty from "./pages/watchparty";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:roomid?" element={<Watchparty />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
