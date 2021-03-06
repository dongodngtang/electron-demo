import { dialog, shell } from "electron";
import db from "../../datastore";
import axios from "axios";
import pkg from "./package.json";

// 过查询GitHub的release版本号
const version = pkg.version;
const release =
  "https://api.github.com/repos/dongodngtang/electron-demo/releases/latest";
const downloadUrl = "https://github.com/dongodngtang/electron-demo/releases/latest";

const checkVersion = async () => {
  let showTip = db.read().get("picBed.showUpdateTip").value();
  if (showTip === undefined) {
    db.read().set("picBed.showUpdateTip", true).write();
    showTip = true;
  }
  // 自动更新的弹窗如果用户没有设置不再提醒，就可以去查询是否需要更新
  if (showTip) {
    const res = await axios.get(release);
    if (res.status === 200) {
      const latest = res.data.name; // 获取版本号
      const result = compareVersion2Update(version, latest); // 比对版本号，如果本地版本低于远端则更新
      if (result) {
        dialog.showMessageBox(
          {
            type: "info",
            title: "发现新版本",
            buttons: ["是", "否"],
            message: "发现新版本，更新了很多功能，是否去下载最新的版本？",
            checkboxLabel: "以后不再提醒",
            checkboxChecked: false,
          },
          (res, checkboxChecked) => {
            if (res === 0) {
              // if selected yes
              shell.openExternal(downloadUrl);
            }
            db.read().set("picBed.showUpdateTip", !checkboxChecked).write();
          }
        );
      }
    } else {
      returnfalse;
    }
  } else {
    returnfalse;
  }
};

// if true -> update else return false
const compareVersion2Update = (current, latest) => {
  const currentVersion = current.split(".").map((item) => parseInt(item));
  const latestVersion = latest.split(".").map((item) => parseInt(item));
  let flag = false;

  for (let i = 0; i < 3; i++) {
    if (currentVersion[i] < latestVersion[i]) {
      flag = true;
    }
  }

  return flag;
};

export default checkVersion;
