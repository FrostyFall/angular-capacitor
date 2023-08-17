const { app, BrowserWindow, desktopCapturer } = require("electron");
const path = require("path");
const url = require("url");

let win;

function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "dist/zoom-clone/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  win.on("closed", () => {
    win = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

// desktopCapturer
//   .getSources({ types: ["window", "screen"] })
//   .then(async (sources) => {
//     for (const source of sources) {
//       if (source.name === "Electron") {
//         mainWindow.webContents.send("SET_SOURCE", source.id);
//         return;
//       }
//     }
//   });
