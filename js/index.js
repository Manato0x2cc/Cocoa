const electron = require('electron')
$(function(){
  $('#new').on('click', function(e){
    electron.remote.require('./main').loadURL('register.html');
  })
  $('#logo').on('click', function(e){
    main.loadURL('index.html');
  })
});

//Json object to Array.
function jsonParse(json){
  reJson = [];
  for(var key in json) {

    if(json.hasOwnProperty(key)) {

      var values = [];

      for(var value in json[key]) {
        if(json[key].hasOwnProperty(value)){
          values.push(json[key][value]);
        }
      }

      reJson.push(values);
    }
  }

  return reJson;
}

var selected;

createTable(electron.remote.require('./main').getList());

function createTable(data){

  data = jsonParse(data);

  var table = document.getElementById('table_body');
  table.innerHTML = "";
  for (var i = 0; i < data.length; i++) {
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(-1);
    var cell2 = row.insertCell(-1);
    var cell3 = row.insertCell(-1);
    var cell4 = row.insertCell(-1);
    var a = '<a onclick="editRow(this)">Edit</a>';
    cell1.innerHTML = data[i][0];
    cell2.innerHTML = data[i][1];
    cell3.innerHTML = data[i][2];
    cell4.innerHTML = a;
  }
}

function deleteRow(obj) {
  electron.remote.require('./main').deleteFromList(obj.parentNode.parentNode.children[0].innerHTML)
  // 削除ボタンを押下された行を取得
  tr = obj.parentNode.parentNode;
  // trのインデックスを取得して行を削除する
  tr.parentNode.deleteRow(tr.sectionRowIndex);
}

function editRow(obj){
  var name = obj.parentNode.parentNode.children[0].innerHTML;
  var command = obj.parentNode.parentNode.children[1].innerHTML;
  var shortcut = obj.parentNode.parentNode.children[2].innerHTML;

  selected = obj;

  /**
   * create menu
   */
  var div = document.createElement('div');
  div.id = "popup";
  div.innerHTML = `<div class="container-fluid" style="overflow: auto"><div class="row"><p><i class="fa fa-times" aria-hidden="true" id="remove"></i></p><br><p font-size="large" style="text-align:left;" class="col-sm-12 col-md-12">If you wanna change shortcut key, you have to click delete button and make shortcut again.</p></div><div class="row"><div class="col-sm-12 col-md-12"><form id="edit_form"><div class="form-group"><label for="name">Name</label><input id="name" placeholder="${name}"></input></div><div class="form-group"><label for="command">Command</label><input id="command" placeholder="${command}"></input></div></form></div></div><div class="row"><div class="col-sm-12 col-md-12"><button type="button" class="btn btn-danger" id="delete">Delete</button>&nbsp;<button type="button" class="btn btn-success" id="save">Save</button></div></div></div>`;
  document.body.appendChild(div);

  $('#fadelayer').toggle();
}

$(document).on("click", "#remove", (function(){
  $('#fadelayer').toggle();
  selected = null;
  var el = document.getElementById('popup');
  el.parentNode.removeChild(el);
}));

$(document).on("click", "#delete", (function(){
  if(window.confirm('Are you ABSOLUTELY sure?\nThis action CANNOT be undone!!')){
    deleteRow(selected);
    selected = null;
    $('#fadelayer').toggle();
    var el = document.getElementById('popup');
    el.parentNode.removeChild(el);
  }
}));

$(document).on("click", "#save", (function(){
  var name = selected.parentNode.parentNode.children[0].innerHTML;
  var shortcut = selected.parentNode.parentNode.children[2].innerHTML;
  electron.remote.require('./main').deleteFromList(name);

  name = $('#name').val().length===0 ? name : $('#name').val();
  var command = $('#command').val().length === 0 ? selected.parentNode.parentNode.children[1].innerHTML : $('#command').val();

  electron.remote.require('./main').addList(name, command, shortcut);

  createTable(electron.remote.require('./main').getList());

  $('#fadelayer').toggle();
  selected = null;
  var el = document.getElementById('popup');
  el.parentNode.removeChild(el);
}));
