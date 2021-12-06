import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

// Pages
import WinA from "./WinA";
import WinB from "./WinB";

function App() {
  return (
    <HashRouter>
      <div>
        <Routes>
          <Route exact path="/" element={<WinA />}></Route>
          <Route exact path="/tampilan" element={<WinB />}></Route>
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
