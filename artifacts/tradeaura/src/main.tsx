import { createRoot } from "react-dom/client";
import { WrappedApp } from "./App";
import "./index.css";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<WrappedApp />);
