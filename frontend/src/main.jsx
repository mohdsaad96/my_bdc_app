import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import StatusUpdate from "./components/StatusUpdate";   // <-- correct import
import { useAuthStore } from "./store/useAuthStore";

import { BrowserRouter } from "react-router-dom";

function Main() {
  const authUser = useAuthStore.getState().authUser;
  return (
    <div>
      <BrowserRouter>
        <App />
        {/* Show status updates only for authenticated users */}
        {authUser && <StatusUpdate />}
      </BrowserRouter>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Main />
  </StrictMode>
);
