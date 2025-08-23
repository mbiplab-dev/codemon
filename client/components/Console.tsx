"use client";
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import "@xterm/xterm/css/xterm.css";

interface CustomTerminalProps {
  onCommand?: (cmd: string) => void;
}

const CustomTerminal = forwardRef<{ write: (data: string) => void }, CustomTerminalProps>(
  ({ onCommand }, ref) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<any>(null);
    const fitAddonRef = useRef<any>(null);

    useEffect(() => {
      let Terminal: any;
      let FitAddon: any;

      (async () => {
        const xtermModule = await import("@xterm/xterm");
        const addonModule = await import("@xterm/addon-fit");
        Terminal = xtermModule.Terminal;
        FitAddon = addonModule.FitAddon;

        if (!terminalRef.current) return;

        const term = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          theme: {
            background: "#00000000",
            foreground: "#ffffff",
            cursor: "#fb923c",
            cursorAccent: "#0a0a0a",
          },
          scrollback: 1000,
          scrollOnUserInput: false,
          disableStdin: false,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        termRef.current = term;
        fitAddonRef.current = fitAddon;

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

        const viewport = terminalRef.current.querySelector(".xterm-viewport") as HTMLElement;
        if (viewport) {
          let timeout: NodeJS.Timeout;
          viewport.addEventListener("scroll", () => {
            viewport.classList.add("scrolling");
            clearTimeout(timeout);
            timeout = setTimeout(() => viewport.classList.remove("scrolling"), 600);
          });
        }

        const prompt = () => term.write("\r\n$ ");

        const banner = ` ██████╗ ██████╗ ██████╗ ███████╗███╗   ███╗ ██████╗ ███╗   ██╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝████╗ ████║██╔═══██╗████╗  ██║
██║     ██║   ██║██║  ██║█████╗  ██╔████╔██║██║   ██║██╔██╗ ██║
██║     ██║   ██║██║  ██║██╔══╝  ██║╚██╔╝██║██║   ██║██║╚██╗██║
╚██████╗╚██████╔╝██████╔╝███████╗██║ ╚═╝ ██║╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
`;

        banner.split("\n").forEach((line, index) => {
          setTimeout(() => {
            term.writeln("\x1b[38;5;208m" + line + "\x1b[0m");
            if (index === banner.split("\n").length - 1) {
              term.writeln("");
              prompt();
            }
          }, index * 100);
        });

        let command = "";
        term.onKey(({ key, domEvent }: any) => {
          const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

          if (domEvent.key === "Enter") {
            if (onCommand) onCommand(command);
            command = "";
            prompt();
          } else if (domEvent.key === "Backspace") {
            if (command.length > 0) {
              term.write("\b \b");
              command = command.slice(0, -1);
            }
          } else if (printable) {
            command += key;
            term.write(key);
          }
        });

        const resizeObserver = new ResizeObserver(() => fitAddon.fit());
        resizeObserver.observe(terminalRef.current);

        return () => {
          resizeObserver.disconnect();
          term.dispose();
        };
      })();
    }, [onCommand]);

    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        termRef.current?.writeln(data);
      },
    }));

    return (
      <div className="h-full w-full border border-neutral-800 rounded-lg overflow-hidden bg-[#0a0a0a] shadow-lg p-2">
        <div ref={terminalRef} className="h-full w-full overflow-hidden" />
      </div>
    );
  }
);

export default CustomTerminal;
