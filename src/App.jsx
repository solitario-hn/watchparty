import { BrowserRouter, Route, Routes } from "react-router-dom";
import Watchparty from "./pages/watchparty";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:roomid?" element={<Watchparty />} />
        <Route
          path="*"
          element={
            <p role="alert">
              Invalid room link. <a href="/">Create a new room</a>
            </p>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
