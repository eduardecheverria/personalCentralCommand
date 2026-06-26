"use client";

import { useEffect } from "react";
import { MARKUP } from "./central-command.markup";
import { initCentralCommand } from "./central-command.app";

// Guard against double init (React StrictMode mounts effects twice in dev).
let booted = false;

export default function CentralCommand() {
  useEffect(() => {
    if (booted) return;
    booted = true;
    initCentralCommand();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: MARKUP }} />;
}
