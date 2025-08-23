"use client";
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import "@xterm/xterm/css/xterm.css";

interface TerminalProps {
  onCommand?: (cmd: string) => void;
}

const Terminal = forwardRef<{ write: (data: string) => void }, TerminalProps>(
  ({ onCommand }, ref) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<any>(null);
    const fitAddonRef = useRef<any>(null);

    useEffect(() => {
      // ✅ Prevent double initialization in StrictMode
      if (termRef.current) return;

      (async () => {
        const xtermModule = await import("@xterm/xterm");
        const addonModule = await import("@xterm/addon-fit");
        const Terminal = xtermModule.Terminal;
        const FitAddon = addonModule.FitAddon;

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
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        termRef.current = term;
        fitAddonRef.current = fitAddon;

        // ✅ Banner text only once
        const banner = ` ██████╗ ██████╗ ██████╗ ███████╗███╗   ███╗ ██████╗ ███╗   ██╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝████╗ ████║██╔═══██╗████╗  ██║
██║     ██║   ██║██║  ██║█████╗  ██╔████╔██║██║   ██║██╔██╗ ██║
██║     ██║   ██║██║  ██║██╔══╝  ██║╚██╔╝██║██║   ██║██║╚██╗██║
╚██████╗╚██████╔╝██████╔╝███████╗██║ ╚═╝ ██║╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝`;

        const lines = banner.split("\n");
        let index = 0;

        const prompt = () => term.write("\r\n$ ");

        const writeBannerLine = () => {
          if (index < lines.length) {
            term.writeln("\x1b[38;5;208m" + lines[index] + "\x1b[0m");
            index++;
            requestAnimationFrame(writeBannerLine);
          } else {
            term.writeln("");
            prompt();
          }
        };

        writeBannerLine();

        // ✅ Handle input
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

        // ✅ Auto resize
        const resizeObserver = new ResizeObserver(() => fitAddon.fit());
        resizeObserver.observe(terminalRef.current);

        // ✅ Cleanup
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
      <div className="h-full w-full overflow-hidden bg-[#0a0a0a]">
        <div ref={terminalRef} className="h-full w-full overflow-y-auto" />
      </div>
    );
  }
);

export default Terminal;
