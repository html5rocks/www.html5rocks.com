(function() {

  // tidy up the namespacing
  window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
  var IDBTransaction = window.webkitIDBTransaction || window.mozIDBTransaction || window.IDBTransaction;
  var IDBKeyRange = window.webkitIDBKeyRange || window.mozIDBKeyRange || window.IDBKeyRange;

  var db, version = "1.9";

  window.indexedStore = {

    supported: function() {
      return !!indexedDB;
    },

    setup: function(handler) {

      // attempt to open the database
      var openRequest = indexedDB.open("geomood", "Geo-Mood Checkins");

      // assign the database for access outside
      // the callback and then either upgrade
      // the database if needed or carry on
      openRequest.onsuccess = function(ev) {

        db = ev.target.result;
        db.onerror = function(ev) {
          console.log("db error", arguments, ev.target.webkitErrorMessage);
        };

        if(db.version === version) {
          handler();
        } else {
          indexedStore.reset(handler);
        }
      };
    },

    reset: function(handler) {

      // update the db version
      var versionRequest = db.setVersion(version);

      versionRequest.onsuccess = function(ev) {

        // remove the store if it exists
        if (db.objectStoreNames.contains("checkins")) {
          db.deleteObjectStore("checkins");
        }

        // create a store, and an index
        var checkinsStore = db.createObjectStore("checkins", { keyPath: "time" });
        checkinsStore.createIndex("moodIndex", "mood", { unique: false });

        // now call the handler outside of
        // the 'versionchange' callstack
        setTimeout(handler, 0);
      };
    },

    save: function(checkin, handler) {

      var store = db.transaction(["checkins"], 'readwrite').objectStore("checkins");
      var request = store.put(checkin);
      request.onsuccess = handler;

    },

    search: function(moodQuery, handler) {

      var store = db.transaction(["checkins"], 'readonly').objectStore("checkins");
      var request = moodQuery ?
        store.index("moodIndex").openCursor(new IDBKeyRange.only(moodQuery)) :
        store.openCursor();

      request.onsuccess = function(ev) {
        var cursor = request.result;
        if (cursor) {
          handler(cursor.value);
          cursor["continue"]();
        }
      };
    },

    count: function(handler) {

      var count = 0;
      var request = db.transaction(["checkins"], 'readonly').objectStore("checkins").openCursor();
      request.onsuccess = function(ev) {
        var cursor = request.result;
        cursor ? ++count && cursor["continue"]() : handler(count);
      };

    }
  };
})();
