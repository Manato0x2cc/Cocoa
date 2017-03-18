const electron = require('electron')
const {app, BrowserWindow, globalShortcut, Menu, Tray} = electron
const path = require('path')
const url = require('url')
const cp = require('child_process')
const fs = require('fs')


var shortcuts = [];

var list = [];

var apps = [];

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

app.on('ready', () => {

  win = new BrowserWindow({
		// ウィンドウ作成時のオプション
    frame: false,
		width: 700,
		height: 700,
		resizable: false, 	// ウィンドウのリサイズを禁止
		"skip-taskbar": true, 	// タスクバーに表示しない
		show: true		// アプリ起動時にウィンドウを表示しない
	});

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  tray = new Tray(__dirname+'/icon/cocoa.png')

  let menu = Menu.buildFromTemplate([
    {label: 'Switch', click(){win.isVisible() ? win.hide() : win.show()}},
    {label: 'Quit', click(){app.quit()} }
  ])

  tray.setContextMenu(menu)

  win.on('show', () => {
    tray.setHighlightMode('always')
  })
  win.on('hide', () => {
    tray.setHighlightMode('never')
  })
})

//init
readList();

exports.gs = function(shortcut, cmd){
  var func = makeFunc(cmd);

  shortcuts.push([shortcut, cmd]);
  return globalShortcut.register(shortcut, func);
}

function makeFunc(command){
  return function(){
    cp.exec(command, function(error, stdout, stderr){
      if(stdout){
      console.log('stdout: \n' + stdout);
    }
    if(stderr){
      console.log('stderr: \n' + stderr);
    }
    if (error !== null) {
      console.log('Exec error: \n' + error);
    }
    });
  }
}

//Check that can use command.
//if the command is already used by other apps, the app may work incorrectly.
//func argument must be boolean
exports.checkShortcut = function(sht, func){
  func(globalShortcut.isRegistered(sht));
}

function registerAllShortcuts(){
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()

  for (var i = 0; i < shortcuts.length; i++) {
    globalShortcut.register(shortcuts[i][0], makeFunc(shortcuts[i][1]));
  }
}

exports.loadURL = function(fileName){

  win.loadURL(url.format({
    pathname: path.join(__dirname, fileName),
    protocol: 'file:',
    slashes: true
  }))

  registerAllShortcuts();
}

/* For managing List */
function readList(){
  var result = fs.readFile(__dirname+'/list.json', 'utf8', (err, data) => {
    if (err){
     fs.writeFile(__dirname+'/list.json', "");//Make file
     return;
   }

    list = JSON.parse(data);

    //register Shortcut
    for(var key in list) {

      if(list.hasOwnProperty(key)) {

        var values = [];

        values.push(list[key]['shortcut'])
        values.push(list[key]['command'])

        shortcuts.push(values);
      }
    }

    registerAllShortcuts();
  });
}

exports.addList = function(name, command, shortcut){
  list[name] = {
    "name": name,
    "command": command,
    "shortcut": shortcut
  };
  saveList();

  shortcuts.push([shortcut, command]);
  registerAllShortcuts();
}

exports.deleteFromList = function(name){
  delete list[name];
  saveList();
  //要素を削除する
  shortcuts.some(function(v, i){
    if (v==name) shortcuts.splice(i,1);
  });
  registerAllShortcuts();
}

exports.getList = function(){
  readList();
  return list;
}

function saveList(){
  fs.writeFile(__dirname+'/list.json', JSON.stringify(list, null, '\t'), 'utf8', (err) => {
    if (err) throw err;
  });
}

exports.getWindow = function(){
  return win;
}

exports.getPath = function(){
  return app.getPath('home');
}

exports.log = function(str){
  console.log(str);
}

exports.exist = function(file) {
  return exist(file)
}

function exist(file){
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
}

app.on('will-quit', () => {

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})
