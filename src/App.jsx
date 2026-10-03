import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Watchparty from "./pages/watchparty";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:roomid?" element={<Watchparty />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
