  var sqlStore = {
    supported: function() {
      return !!window.openDatabase;
    },
    setup: function(handler) {
      this.db = openDatabase('geomood', '1.0', 'Geo-Mood Checkins', 8192);
      this.db.transaction(function(tx) {
        tx.executeSql("create table if not exists " + 
          "checkins(id integer primary key asc, time integer, latitude float,"+
                    "longitude float, mood string)",
          [],
          function() { handler(); }
        );
      });
    },
    reset: function(handler) {
      store.db.transaction(function(tx) {
        tx.executeSql("delete from checkins",
        [],
        handler||function() {},
        store.onError);
      });
    },
    save: function(checkin, handler) {
      store.db.transaction(function(tx) {
        tx.executeSql("insert into checkins (time, latitude, longitude, mood) values (?,?,?,?);",
        [checkin.time, checkin.latitude, checkin.longitude, checkin.mood],
        handler,
        store.onError);
      });
    },
    search: function(moodQuery, handler) {
      store.db.transaction(function(tx) {
        tx.executeSql(
          "select * from checkins" + (moodQuery ? " where mood=?":""),
          moodQuery ? [moodQuery] : [],
          function(tx, results) {
            console.log("mo", moodQuery);
            console.log("res", results);
            for (i = 0; i < results.rows.length; i++) {
              handler(clone(results.rows.item(i)));
            }
          },
          store.onError
        );
      });
    },
    count: function(handler) {
      store.db.transaction(function(tx) {
        tx.executeSql("select count(*) from checkins;", [], function(tx, results) {
          handler(results.rows.item(0)["count(*)"]);
        },
        store.onError);
      });
    },
    onError: function(tx,error) {
      console.log("Error occurred: ", (error ? error.message  :""));
    }
  };
