const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");
function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve(__dirname, "../preload.js"),
    },
  });

  const urlLocation = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "index.html")}`;

  win.loadURL(urlLocation);
}

function updater() {
  autoUpdater.autoDownload = false;

  if (isDev) {
    autoUpdater.updateConfigPath = path.join(__dirname, "dev-app-update.yml");
    // 这个只有打包后的环境是有效的
    autoUpdater.checkForUpdates();
  } else {
    // 这个只有打包后的环境是有效的
    autoUpdater.checkForUpdatesAndNotify();
  }

  autoUpdater.on("error", (error) => {
    dialog.showErrorBox(`Error:${error ? error.stack || error : "unkown"}`);
  });

  autoUpdater.on("update-available", () => {
    dialog.showMessageBox(
      {
        type: "info",
        title: "应用有新版本",
        message: "发现新版本，是否现在更新？",
        buttons: ["是", "否"],
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          autoUpdater.downloadUpdate();
        }
      }
    );
  });

  autoUpdater.on("update-not-available", () => {
    dialog.showMessageBox({
      title: "没有最新版本",
      message: "当前已经是最新版本",
    });
  });

  autoUpdater.on('download-progress',info=>{
    console.log('下载进度:'+JSON.stringify(info))
  })

  autoUpdater.on("update-downloaded", () => {
    dialog.showMessageBox(
      {
        title: "安装更新",
        message: "更新下载完毕，应用将重启安装",
      },
      () => {
        setImmediate(() => autoUpdater.quitAndInstall());
      }
    );
  });
}

app.whenReady().then(() => {
  updater();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
