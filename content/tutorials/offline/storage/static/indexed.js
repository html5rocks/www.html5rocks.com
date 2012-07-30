!function() {

  var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
  var IDBTransaction = window.webkitIDBTransaction || window.mozIDBTransaction || window.IDBTransaction // TODO moz
  var IDBKeyRange = window.webkitIDBKeyRange || window.mozIDBKeyRange || window.IDBKeyRange // TODO moz

  var db, version="1.9";
  window.indexedStore = {
    supported: function() {
      return !!indexedDB;
    },
    setup: function(handler) {
      var openRequest = indexedDB.open("geomood", "Geo-Mood Checkins");
      openRequest.onsuccess = function(ev) {
        db = ev.target.result;
        db.onerror = function(ev) { console.log("db error", arguments, ev.target.webkitErrorMessage); }
        db.version==version ? handler() : indexedStore.reset(handler);
      }
    },
    reset: function(handler) {
      console.log("reset");
      var versionRequest = db.setVersion(version);
      versionRequest.onsuccess = function(ev) {
        if (db.objectStoreNames.contains("checkins")) db.deleteObjectStore("checkins");
        // var checkinsStore = db.createObjectStore("checkins", { autoIncrement: true });
        var checkinsStore = db.createObjectStore("checkins", { keyPath: "time" });
        checkinsStore.createIndex("moodIndex", "mood", { unique: false });
        handler();
        // var checkinsStore = db.createObjectStore("checkins", "id", false);
        /*
        var store = db.transaction([], IDBTransaction.READ_WRITE, 0).objectStore("checkins");
        console.log("making");
        var checkin = { test: "1" };
        var request = store.put(checkin);
        request.onerror = function() { console.log("rerror"); }
        request.onsuccess = function() { console.log("succ"); }
        */
        // handler();
      }
    },
    save: function(checkin, handler) {
      var store = db.transaction([], IDBTransaction.READ_WRITE, 0).objectStore("checkins");
      // console.log("ch", checkin);
      // checkin = { id: "foo" };
      var request = store.put(checkin);
      request.onsuccess = handler;
    },
    search: function(moodQuery, handler) {
      var store = db.transaction([], IDBTransaction.READ_ONLY, 0).objectStore("checkins");
      var request = moodQuery ?
        store.index("moodIndex").openCursor(new IDBKeyRange.only(moodQuery)) :
        store.openCursor();
      request.onsuccess = function(ev) {
        console.log("search", moodQuery, "cursor", cursor, "req", request.result);
        var cursor = request.result;
        if (cursor) {
          handler(cursor.value);
          cursor["continue"]();
        }
      };
    },
    count: function(handler) {
      // unfortunately, there's no direct way to get this
      var count = 0;
      var request = db.transaction([], IDBTransaction.READ_ONLY, 0).objectStore("checkins").openCursor();
      request.onsuccess = function(ev) {
        var cursor = request.result;
        cursor ? ++count && cursor["continue"]() : handler(count);
      };
    }
  };
}();
