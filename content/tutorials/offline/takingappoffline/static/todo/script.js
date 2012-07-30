var html5rocks = {};
html5rocks.webdb = {};
html5rocks.webdb.db = null;

html5rocks.webdb.open = function() {
  var dbSize = 5 * 1024 * 1024; // 5MB
  html5rocks.webdb.db = openDatabase("Todo", "1.0", "Todo manager", dbSize);
}

html5rocks.webdb.createTable = function() {
  var db = html5rocks.webdb.db;
  db.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS todo(ID INTEGER PRIMARY KEY ASC, todo TEXT, added_on DATETIME)", []);
  });
}

html5rocks.webdb.addTodo = function(todoText) {
  var db = html5rocks.webdb.db;
  db.transaction(function(tx){
    var addedOn = new Date();
    tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)", 
        [todoText, addedOn],
        function() {
          html5rocks.webdb.getAllTodoItems(loadTodoItems);
        },
        html5rocks.webdb.onError);
   });
}

html5rocks.webdb.onError = function(tx, e) {
  alert("There has been an error: " + e.message);
}

html5rocks.webdb.onSuccess = function(tx, r) {

}


html5rocks.webdb.getAllTodoItems = function(renderFunc) {
  var db = html5rocks.webdb.db;
  db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM todo", [], renderFunc, 
        html5rocks.webdb.onError);
  });
}

html5rocks.webdb.deleteTodo = function(id) {
  var db = html5rocks.webdb.db;
  db.transaction(function(tx){
    tx.executeSql("DELETE FROM todo WHERE ID=?", [id],      
        function() {
          html5rocks.webdb.getAllTodoItems(loadTodoItems);
        }, 
        html5rocks.webdb.onError);
    });
}

function loadTodoItems(tx, rs) {
  var rowOutput = "";
  var todoItems = document.getElementById("todoItems");
  for (var i=0; i < rs.rows.length; i++) {
    rowOutput += renderTodo(rs.rows.item(i));
  }

  todoItems.innerHTML = rowOutput;
}

function renderTodo(row) {
  return "<li>" + row.todo  + " [<a href='javascript:void(0);' onclick='html5rocks.webdb.deleteTodo(" + row.ID +");'>Delete</a>]</li>";
}

function uploadApp() {
  // Swap the cached files out
  window.applicationCache.swapCache();
  // Reload
  window.location.reload();
}

function init() {
  html5rocks.webdb.open();
  html5rocks.webdb.createTable();
  html5rocks.webdb.getAllTodoItems(loadTodoItems);
  
  var status = document.getElementById("status");
  var update = document.getElementById("update");
  update.addEventListener("click", uploadApp);
  
  
  var prog = function(msg) {
    status.innerText = msg;
  };
  
  var cache = window.applicationCache;

  cache.addEventListener('cached', function(e) {prog("Application cached"); } , false);
  cache.addEventListener('checking', function(e) {prog( "Checking for update"); }, false);
  cache.addEventListener('downloading', function(e) { prog( "Downloading update"); }, false);
  cache.addEventListener('error', function(e) { prog("There has been an error fetching the manifest"); }, false);
  cache.addEventListener('noupdate', function() { prog("Using latest version"); }, false); 
  cache.addEventListener('obsolete', function() { prog("obsolete"); }, false);
  cache.addEventListener('progress', function() { prog("Downloaded file"); }, false);
  cache.addEventListener('updateready', function() { 
    prog("There is an update ready"); 
    update.style.display = "block";
    }, false);
}

function addTodo() {
  var todo = document.getElementById("todo"); 
  html5rocks.webdb.addTodo(todo.value);
  todo.value = "";
}