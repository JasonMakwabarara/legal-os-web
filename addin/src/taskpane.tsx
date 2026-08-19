import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

function mount() {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;
  rootElement.innerHTML = "";
  createRoot(rootElement).render(<App />);
}

// office.js loads from the CDN in taskpane.html. Office.onReady must run
// before any Word.run call; outside an Office host (plain browser tab)
// we mount anyway so the pane can explain itself.
if (typeof Office !== "undefined" && typeof Office.onReady === "function") {
  Office.onReady(() => mount());
} else {
  mount();
}
