!function() {

  var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
  // var BlobBuilder = window.blobBuilder || window.webKitBlobBuilder;
  var fs, checkinsDir;

  window.fileStore = {
    supported: function() {
      return !!requestFileSystem;
    },
    setup: function(handler) {
      requestFileSystem(
        window.PERSISTENT,
        1024*1024,
        function(_fs) {
          fs = _fs;
          fs.root.getDirectory(
            "checkins",
            {}, // no "create" option, so this is a read op
            function(dir) { checkinsDir = dir; handler(); },
            function() { fileStore.reset(handler); } // doesn't exist, so let's make it
          );
        },
        function(e) {
          console.log("error "+e.code+"initialising - see http://goo.gl/YW0TI");
        }
      );
    },
    reset: function(handler) {
      if (checkinsDir) checkinsDir.removeRecursively();
      requestFileSystem(
        window.PERSISTENT,
        1024*1024,
        function(_fs) {
          fs = _fs;
          fs.root.getDirectory(
            "checkins",
            {create: true},
            function(dir) {
              checkinsDir = dir;
              handler();
            },
            fileStore.onError
          );
        },
        function(e) {
          console.log("error "+e.code+"initialising - see http://goo.gl/YW0TI");
        }
      );
    },
    save: function(checkin, handler) {
      fs.root.getFile("checkins/" + checkin.time, {create: true, exclusive: true}, function(file) {
        file.createWriter(function(writer) {
          writer.onerror = fileStore.onError;
          var bb = new WebKitBlobBuilder;
          bb.append(JSON.stringify(checkin));
          writer.write(bb.getBlob("text/plain"));
          handler();
        }, fileStore.onError);
      }, fileStore.onError);
    },
    search: function(moodQuery, handler) {
      console.log("filesearch");
      checkinsDir.createReader().readEntries(function(files) {
        var reader, fileCount=0, checkins=[];
        var readNextFile = function() {
          reader = new FileReader();
          if (fileCount == files.length) return;
          reader.onload = function(e) {
            var checkin = JSON.parse(this.result);
            if (moodQuery==checkin.mood||!moodQuery) handler(checkin);
            readNextFile();
          };
          files[fileCount++].file(function(file) { reader.readAsText(file); });
        };
        readNextFile();
      });
    },
    count: function(handler) {
      checkinsDir.createReader().readEntries(function(files) {
        handler(files.length);
      });
    },
    onError: function() {
      console.log("error", arguments);
    }
  };

}();
