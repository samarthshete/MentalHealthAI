import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import "./index.css";
import App from "./App";
import ContextProvider from "./context/contextProvider";
import TherapeuticJourneyProvider from "./context/TherapeuticJourneyContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <BrowserRouter>
        <ContextProvider>
          <TherapeuticJourneyProvider>
            <App />
          </TherapeuticJourneyProvider>
        </ContextProvider>
      </BrowserRouter>
    </CookiesProvider>
  </React.StrictMode>
);
