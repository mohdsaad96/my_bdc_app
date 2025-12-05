import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import StatusUpdate from "./components/StatusUpdate.jsx";   // <-- explicit .jsx extension

import { BrowserRouter } from "react-router-dom";

function Main() {
  return (
    <div>
      <BrowserRouter>
        <App />
        <StatusUpdate />
      </BrowserRouter>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Main />
  </StrictMode>
);