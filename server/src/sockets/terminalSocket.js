import pty from "node-pty";
import os from "os";

export default function terminalSocket(socket, ROOT_DIR) {
  let ptyProcess;

  socket.on("createTerminal", ({ shellType }) => {
    let shell;
    if (os.platform() === "win32") {
      shell = shellType === "powershell" ? "powershell.exe" : "cmd.exe";
    } else {
      shell = shellType === "bash" ? "bash" : "zsh";
    }

    ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: ROOT_DIR,
      env: process.env,
    });

    console.log(`✅ Terminal created for client ${socket.id} using ${shell}`);

    ptyProcess.onData((data) => socket.emit("output", data));
  });

  socket.on("input", (data) => ptyProcess?.write(data));
  socket.on("resize", ({ cols, rows }) => ptyProcess?.resize(cols, rows));

  socket.on("disconnect", () => {
    if (ptyProcess) {
      ptyProcess.kill();
      console.log(`❌ Terminal process killed for client ${socket.id}`);
    }
    console.log(`❌ Client ${socket.id} disconnected from terminal`);
  });
}
