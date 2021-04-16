import React, { Component } from "react";
const { ipcRenderer } = require("electron");

export default class App extends Component {
  componentDidMount() {
    console.log("立刻精神的");

    ipcRenderer.on('open-new-window',(event,args)=>{
        console.log('接受主线程的消息',args)
    })
  }
  render() {
    return (
      <div>
        <button
          onClick={() => {
            console.log('发送消息到主线程')
            ipcRenderer.invoke("open-new-window", {
              url: "https://www.hao123.com",
            });
          }}
        >
          打开好123
        </button>
        <div>hello webpack !!!</div>
      </div>
    );
  }
}
