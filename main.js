console.log('main IVTA process is working fine !');

/*basic modules required for electron app*/
const electron = require("electron");
const { protocol } = require("electron");
/*sub app required by electron */
const app = electron.app;
const BrowserWinow = electron.BrowserWindow;
/*biult in module */
const path = require.path; /*need to build a file path*/
const url = require.url;
app.allowRendererProcessReuse = false;  //disable right click in electron app

/*window which represents UI */
let win;    /*reference our window*/

function createwindow()         /* using BrowserWindow API to create a window in this funtion*/
{
       win = new BrowserWinow(
           {width: 600, // here I have set the width and height
            height: 350,
            frame: true,
            minimizable: true,
            maximizable: true,
            closable: true,
            webPreferences:
                {
                    nodeIntegration: true,
                    enableRemoteModule: true
                }
            });

    win.loadURL(`file://${__dirname}/index.html`);  //url.format() method is depricated 
     
    win.webContents.openDevTools();   //for apps look
    win.setMenu(null);       

    win.on('closed', () => {   //if wondow is closed (handle event)
         win = null;
     });

}
// app.whenReady(() => {
//     app.allowRendererProcessReuse = false
//   });
app.on('ready', createwindow);


