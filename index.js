console.log('in the index JS');
var app = require("electron").remote;
const screenshot = require('screenshot-desktop');
const os = require('os');
const { desktopCapturer } = require('electron');
const process = require('process');
var exec = require('child_process').exec;

//process List module
const psList = require('ps-list');

//getting system information module.
const si = require('systeminformation');

//electron read key event
const electron = require("electron");
const BrowserWindow = electron.remote.BrowserWindow;
const win = BrowserWindow.getFocusedWindow();

//get windows clipboard to clear it out.
const util = require("util");

//Threading module
//const worker = require('worker_threads');
//const {Worker, isMainThread, parentPort } = require('worker_threads');
//var i=0;

//fork 
//const { fork } = require('child_process');

var dialog = app.dialog;
const path = require("path");
const fs = require("fs");
var loopVar;
var ApplicationLoopVar;
var clipBoardLoopVar;
var getUSBAndHDMIInfoVar;
var userPath;
const shell = require('node-powershell');

// const worker = new Worker('./USBAndHDMIInfo.js'); //Uncaught Error: The V8 platform used by this instance of Node does not support creating Workers
// worker.on('message', (msg) => { console.log("msg from USBAndHDMIInfo.js - "+msg); }); 

// if(!isMainThread)
// {
//     getUSBAndHDMIInfo();
// }


function clearClipBoard() {
    require('child_process').spawn('clip').stdin.end(util.inspect("Copy is disabled."));
}

function startUp() {

    //creating a folder/directory in the users document folder if not present
    userPath = os.homedir();
    var dir = userPath + '/Documents/electron demo';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log(dir + " is created.");
    }

    ApplicationLoopVar = setInterval(closeApplication, 10000);
    clipBoardLoopVar = setInterval(clearClipBoard, 1000);
    getUSBAndHDMIInfoVar = setInterval(getUSBAndHDMIInfo,9000);
}

function OSInfo() {
    
    si.diskLayout().then(data => {
        console.log("HDD :-- " + data[0].size);
        document.getElementById('DetailsArea').value += "OS HDD - "+data[0].size;
    }).catch(error => console.error(error));
    var osArchitecture = os.arch();
    console.log("OS Architecture : " + osArchitecture);
    document.getElementById('DetailsArea').value = "Architecture - "+osArchitecture+'\n';
    var osPlatform = os.platform();
    console.log("OS Platform : " + osPlatform);
    document.getElementById('DetailsArea').value += "OS Platform - "+osPlatform+'\n';
    var osType = os.type();
    console.log("OS Type : " + osType);
    document.getElementById('DetailsArea').value += "OS Type - "+osType+'\n';
    var RAM = os.totalmem();
    console.log("OS RAM : " + RAM);
    document.getElementById('DetailsArea').value += "OS RAM - "+RAM+'\n';
    var freeRAM = os.freemem();
    console.log("Free RAM Memory : " + freeRAM);
    
}

//prt sc event listner on electron app
win.webContents.on("before-input-event", (event, input) => {
    console.log(input.code);
    if (input.code === "PrintScreen") {
        dialog.showErrorBox('Alert', 'Print Screen is disabled.');
        stopPrntScr();
    }

});

function closeApplication() {
    psList().then(data => {

        data.forEach(function (obj) {
            if (obj.name === 'chrome.exe' | obj.name === 'SnippingTool.exe') {
                console.log("Killing " + obj.name + " with " + obj.pid)

                try {
                    process.kill(obj.pid);
                }
                catch (err) {
                    console.log(err);
                }
            }
            else {
                console.log("no processes found to kill.");
            }


        });
    });

}

function stopPrntScr() {
    console.log("in PrtSc");
    var inpFld = document.createElement("input");
    inpFld.setAttribute("value", ".");
    inpFld.setAttribute("width", "0");
    inpFld.style.height = "0px";
    inpFld.style.width = "0px";
    inpFld.style.border = "0px";
    document.body.appendChild(inpFld);
    inpFld.select();
    document.execCommand("copy");
    inpFld.remove(inpFld);
}

function getUSBAndHDMIInfo() {
    console.log("in to getUSBAndHDMIInfo method")
    let ps = new shell({
        executionPolicy: 'Bypass',
        noProfile: true
    });

    ps.addCommand('wmic logicaldisk where drivetype=2 get caption')
    ps.invoke()
        .then(output => {
            console.log('USB found :-----' + output.toString());
            dialog.showErrorBox('Alert', 'External device is detected.');
        })
        .catch(err => {
            console.log("error:" + err);
            ps.dispose();
        });
}


OSInfo();
startUp();

function monitor() {

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        var i = 0;
        var dateTime, time;

        for (const source of sources) {
            i++;
            if (source.name != "Verificient Monitor" && i === 2) {
                console.log("---" + source.name);
                dateTime = new Date();          //getting current date
                console.log(dateTime);
                time = dateTime.getTime();
                console.log("user file path : "+userPath);
                screenshot({ filename: userPath + '/Documents/electron demo/' + source.name +"-"+ time + ".png" });

            }

        }
    });

}

document.getElementById('screenShot').onclick = () => {
    console.log("Monitor button is clicked.");
    loopVar = setInterval(monitor, 2000);




}

document.getElementById('stopMonitoring').onclick = () => {
    clearInterval(loopVar);
}


//Cancel button logic
document.getElementById('cancel').onclick = () => {
    clearInterval(ApplicationLoopVar);
    clearInterval(clipBoardLoopVar);
    clearInterval(getUSBAndHDMIInfoVar);
    var window = app.getCurrentWindow();
    window.close();
}