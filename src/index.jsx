import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";

const url = new URL(window.location.href);
const preview = url.searchParams.get("preview");
const previewId = url.searchParams.get("preview-id");

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App preview={preview} previewId={previewId} />);
