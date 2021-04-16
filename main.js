const { app, BrowserWindow, dialog,ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");
function createWindow(url) {
  const win = new BrowserWindow({
    width: 1440,
    height: 768,
    webPreferences: {
      preload: path.resolve(__dirname, "./preload.js"),
      nodeIntegration:true,
      contextIsolation:false
    },
  });

  let urlLocation = isDev
    ? "http://localhost:3001"
    : `file://${path.join(__dirname, "index.html")}`;

  urlLocation = url ? url : urlLocation;
  win.loadURL(urlLocation);
}

ipcMain.handle('open-new-window',(event,args)=>{
  console.log('接受来自渲染进程的消息handle',args)
  if(args.url){
    createWindow(args.url)
    console.log('发送消息自渲染进程的消息')
    event.sender.send('open-new-window',{message:'打开了sender.send'})
   
    ipcMain.emit('open-new-window',{message:'打开了emit'})
  }
})

ipcMain.on('open-new-window',(event,args)=>{
  console.log('接受来自渲染进程的消息on',args)
  event.reply &&  event.reply('open-new-window',{message:'打开了reply'})
})

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

  autoUpdater.on("download-progress", (info) => {
    console.log("下载进度:" + JSON.stringify(info));
  });

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
