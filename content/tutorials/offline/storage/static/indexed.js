(function() {
  var db;
  var version = 1;

  window.indexedStore = {

    supported: function() {
      return !!indexedDB;
    },

    setup: function(handler) {
      // attempt to open the database
      var request = indexedDB.open("geomood", version);

      // upgrade/create the database if needed
      request.onupgradeneeded = function(event) {
        var db = request.result;
        if (event.oldVersion < 1) {
          // Version 1 is the first version of the database.
          var checkinsStore = db.createObjectStore("checkins", { keyPath: "time" });
          checkinsStore.createIndex("moodIndex", "mood", { unique: false });
        }
        db = request.result;
      };

      // assign the database for access outside
      request.onsuccess = function(ev) {
        db = request.result;
        handler();
        db.onerror = function(ev) {
          console.log("db error", arguments);
        };
      };
    },

    reset: function(handler) {
      handler = handler || function(){};

      var transaction = db.transaction("checkins", "readwrite");
      transaction.objectStore("checkins").clear();

      transaction.onerror = function() {
        console.log("db error", arguments);
      };

      transaction.oncomplete = function() {
        handler();
      };
    },

    save: function(checkin, handler) {
      var transaction = db.transaction("checkins", 'readwrite');
      transaction.objectStore("checkins").put(checkin);
      transaction.oncomplete = handler;
    },

    search: function(moodQuery, handler) {

      var store = db.transaction("checkins", 'readonly').objectStore("checkins");
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
      var request = db.transaction("checkins", 'readonly').objectStore("checkins").openCursor();
      request.onsuccess = function(ev) {
        var cursor = request.result;
        if (cursor) {
          count++;
          cursor["continue"]();
        }
        else {
          handler(count);
        }
      };

    }
  };
})();
