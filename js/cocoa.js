const REMOVE = 8;
const ENTER = 13;
const SHIFT = 16;
const OPTION = 18;
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const COMMAND = 91;
const COMMA = 188;
const PERIOD = 190;

const CHARS = [
  'a','b','c','d','e','f','g',
  'h','i','j','k','l','m','n',
  'o','p','q','r','s','t','u',
  'v','w','x','y','z'
];
const NUMBERS = ['0','1','2','3','4','5','6','7','8','9'];

const electron = require("electron");

const {dialog} = electron.remote;

const main = electron.remote.require('./main');

//globalShortcut
const gs = main.gs;
const fs = require('fs')
const shell = require('shell')


$(function(){
  var spans = $('span');

  //var apps = main.getAllApps();


  spans.on('click', function(e){
    toggle($(this));
  })

  $('#regist').on('click', function(e){
    registerShortcut();
  })

  // if this is true, the shortcut key sensor'll be off.
  var isFocused = false;

  /**
   * when name or comamnd is focused.
   */
  $('#name, #cmd')
    .focusin(function(e) {
      isFocused = true;
    })
    .focusout(function(e) {
      isFocused = false;
    });


  $('#usual').on('click', function(e){
    /**
     * create menu
     */
    var div = document.createElement('div');
    div.id = "popup";
    div.innerHTML = `<div class="container-fluid" style="overflow: auto"><div class="row"><p><i class="fa fa-times" aria-hidden="true" id="remove"></i></p><br><p font-size="large" style="text-align:left;" class="col-sm-12 col-md-12">Click these usual commands that you wanna do with the shortcut</p></div><div class="row"><div class="col-sm-12 col-md-12"><p><a id="file">Open File</a>...You'll choose a file or an app which will be opened when the shortcut is called. Click 'Open File' and open your shell.</p><p><a id="url">URL</a>...You'll enter to form 'open "URL"'. The command will open the URL by using default Browser when the shortcut is called.</p></div></div></div>`;
    document.body.appendChild(div);

    $('#fadelayer').toggle();
  })

  $(document).on("click", "#remove", (function(){
    $('#fadelayer').toggle();
    var el = document.getElementById('popup');
    el.parentNode.removeChild(el);
  }));

  $(document).on("click", "#file",
   (function(){
     dialog.showOpenDialog(main.getWindow(), {
             properties: ['openFile'],
             title: 'Choose a File',
             defaultPath: main.getPath(),
             filters: [
                 {name: 'All files', extensions: ['*']}
             ]
         }, (fileName) => {
             $('#cmd').val(`open \"${fileName}\"`)
             $('#fadelayer').toggle();
             var el = document.getElementById('popup');
             el.parentNode.removeChild(el);
         });
   })
  );
  $(document).on("click", "#url",
   (function(){
     $('#cmd').val(`open "URL"`)
     $('#fadelayer').toggle();
     var el = document.getElementById('popup');
     el.parentNode.removeChild(el);
   })
  );

  /**
   * When a key is pressed
   */
  $(window).keydown(function(e){

    var code = e.keyCode;

    //if enter pressed
    if(code === ENTER){
      registerShortcut();
      return false;
    }

    if(isFocused) return;


    if(code === REMOVE) allclear();
    if(code === SHIFT) toggle($('#shift'));
    if(code === OPTION) toggle($('#option'));
    if(code === LEFT) toggle($('#left'));
    if(code === UP) toggle($('#up'));
    if(code === DOWN) toggle($('#down'));
    if(code === RIGHT) toggle($('#right'));
    if(code === COMMAND) toggle($('#command'));
    if(code === COMMA) toggle($('#comma'));
    if(code === PERIOD) toggle($('#period'));

    var obj = null;

    //if char
    //65 means that 'a' begins 65. and in a row.
    if(code - 65 >= 0){
      var char = CHARS[code - 65];
      obj = search(char);
    }
    //if numbers
    else if(code - 48 >= 0){
      var number = NUMBERS[code - 48];
      obj = search(number);
    }

    if(obj !== null) toggle(obj);

    return false;
  });

  /**
   * Add or remove 'selected' classes
   */
  function toggle(obj){
    if(!obj.hasClass('pushed')){
      obj.addClass('pushed');
      obj.css({
        'background':'#0f0'
      })
    }else{
      obj.removeClass('pushed');
      obj.css({
        'background':'#000'
      })
    }
  }

  /**
   * return object of char which has the search.
   */
  function search(str){
    var re = null;
    $.each($('.char'), function(i, value){
      if($(value).text() === str){
        re = $(value);
        return false;
      }
    })

    return re;
  }

  function allclear(){
    $('.pushed').css({'background':'#000'})
    $('.pushed').removeClass('pushed');
  }

  /**
   * registerCommand function is to register new Command
   */
   function registerShortcut(){
     var shortcut = makeShortcut();
     if(!window.confirm(`Is this OK to register?\nName: ${$('#name').val()}\nCommand: ${$('#cmd').val()}\nShortcut: ${shortcut}`)) return;
     main.checkShortcut(shortcut, function(isRegistered){
       if(!isRegistered){
         window.alert('Success');
         gs(shortcut, $('#cmd').val());
         main.addList($('#name').val(), $('#cmd').val(), shortcut);

         main.loadURL('index.html');//Back2home
       }else{
         window.alert('This Shortcut \''+shortcut+'\' is already taken...');
       }
     });
   }

  /**
   * pushed shortcut key to string
   */
  function makeShortcut(){
    var pushed = $('.pushed');
    var command = '';
    $.each(pushed, function(i, value){
      command += i != 0 ? '+' : '';

      if($(value).attr('id') === "command") command += 'Command';
      if($(value).attr('id') === "shift") command += 'Shift';
      if($(value).attr('id') === "option") command += 'Alt';
      if($(value).attr('id') === "left") command += 'Left';
      if($(value).attr('id') === "up") command += 'Up';
      if($(value).attr('id') === "right") command += 'Right';
      if($(value).attr('id') === "down") command += 'Down';

      if($(value).hasClass('char')) command += $(value).text().toUpperCase();
    })

    return command;
  }

  $('#logo').on('click', function(e){
    main.loadURL('index.html');
  })
});
