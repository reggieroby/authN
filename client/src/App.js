import React from "react";
import { AppStateProvider } from "./appCtx";
import { Routes } from "./Routes";
import "./App.css";

function App() {
  return (
    <div id="main-container">
      <div id="center-container">
        <AppStateProvider>
          <Routes />
        </AppStateProvider>
      </div>
    </div>
  );
}
export default App;
