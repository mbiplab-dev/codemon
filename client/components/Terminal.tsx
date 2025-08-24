"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import "@xterm/xterm/css/xterm.css";

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    (async () => {
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#0a0a0a",
          foreground: "#ffffff",
          cursor: "#fb923c",
        },
      });

      const style = document.createElement("style");
      style.innerHTML = `
          .xterm-viewport::-webkit-scrollbar {
            width: 13px;
          }
          .xterm-viewport::-webkit-scrollbar-thumb {
            background-color: #fb923ccc;
            border-radius: 6px;
          }
          .xterm-viewport::-webkit-scrollbar-track {
            background: transparent;
          }
        `;
      document.head.appendChild(style);

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current!);
      fitAddon.fit();

      // Connect socket
      socketRef.current = io("http://localhost:3001");

      socketRef.current.on("connect", () => {
        // tell server to actually start a shell (cmd/git bash/etc.)
        socketRef.current?.emit("createTerminal", { shellType: "cmd" });
      });

      // Write shell output
      socketRef.current.on("output", (data: string) => {
        term.write(data);
      });

      // Send keystrokes to backend
      term.onData((data) => {
        socketRef.current?.emit("input", data);
      });

      // Resize handling
      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
        socketRef.current?.emit("resize", {
          cols: term.cols,
          rows: term.rows,
        });
      });
      resizeObserver.observe(terminalRef.current!);

      return () => {
        resizeObserver.disconnect();
        socketRef.current?.disconnect();
        term.dispose();
      };
    })();
  }, []);

  return (
    <div className="h-full w-full bg-[#0a0a0a] border border-neutral-800 p-2">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
}
