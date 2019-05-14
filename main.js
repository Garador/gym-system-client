const {app, BrowserWindow} = require('electron')
const path = require('path');
const url = require('url');
//const server = require('./server/dist/index.js');

let win = null;

app.on('ready', function () {

  // Initialize the window to our specified dimensions
  if(process.argv.length<3){
    win = new BrowserWindow({width: 800, height: 600});

    const pathFile = path.join(__dirname,'dist/flamingo-client/index.html');
    
    if (process.env.PACKAGE === 'true'){
      //win.loadURL('http://localhost:4200');
      win.loadURL(url.format({
        pathname: pathFile,
        protocol:'file:',
        slashes: true
      }));
    } else {
      //win.loadURL(process.env.HOST);
      //win.webContents.openDevTools();
      win.loadURL(url.format({
        pathname: pathFile,
        protocol:'file:',
        slashes: true
      }));
    }
  
    // Show dev tools
    // Remove this line before distributing
    //win.webContents.openDevTools()
  
    // Remove window once app is closed
    win.on('closed', function () {
      win = null;
    });
  }

});

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});