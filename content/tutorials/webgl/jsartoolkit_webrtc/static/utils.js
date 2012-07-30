/**
  CPSQueue serializes a bunch of callbacks, which is useful for e.g. loading
  images in order.

  To use CPSQueue, first create it passing the call function as argument:

    var q = new CPSQueue(function(src, callback, onError){
      var img = new Image()
      img.onload = callback
      img.onerror = onError
      img.onabort = onError
      img.src = src
    })

  Then use the queue by calling append:

    Rg(1,10).forEach(function(i){
      q.append(i+".jpg",
        function(){ console.log("Loaded "+this.src) },
        function(){ console.log("Failed to load "+this.src) })
    })

  Now you should see that the images load (or fail to load) in the same order
  as they were appended, even if 1.jpg is 5MB and 2.jpg is 1kB in size.
  */
CPSQueue = Klass({
  initialize : function(call, cond, merge) {
    this.queue = [];
    if (call) this.call = call;
    if (cond) this.cond = cond;
    if (merge) this.merge = merge;
  },

  append : function (args, callback, onError) {
    if (this.cond.call(this, args)) {
      if (callback) callback(args);
    } else {
      this.queue.push({args: args, callback: callback, onError: onError});
      this.process();
    }
  },

  abort : function() {
    this.queue = [];
    this.aborted = true;
  },

  process : function() {
    if (this.processing) return;
    this.aborted = false;
    this.processing = true;
    this.queue = this.merge(this.queue);
    var t = this.queue.shift();
    while (t) {
      if (this.cond.call(this, t.args)) {
        if (t.callback) t.callback(t.args);
        t = this.queue.shift();
      } else {
        break;
      }
    }
    if (!t) {
      this.processing = false;
      return;
    }
    var self = this;
    this.call(t.args, function(arg) {
      if (!self.aborted) {
        if (t.callback) t.callback(t.args, arg);
      }
      self.processing = false;
      self.process();
    }, function(arg) {
      if (t.onError) t.onError(t.args, arg);
      self.processing = false;
      self.process();
    })
  },

  merge : function(q) {
    return q;
  },

  call : function(args, cb) {
    cb(args);
  },

  cond : function(args) {
    return false;
  }
});

UploadNotification = Klass({
  initialize : function(file, container) {
    this.file = file;
    this.progressElem = E.canvas(30, 30);
    this.elem = DIV({className: 'uploadNotification'},
      this.progressElem,
      H3(file.name),
      SPAN(this.formatSize(file.size, "B"))
    );
    container.appendChild(this.elem);
  },

  formatSize : function(b, unit) {
    var mags = ["", "k", "M", "G", "T", "P", "E"];
    var i,j;
    for (i=0, j=1000; i<mags.length && j<b; i++, j*=1000)
      null;
    if (i == 0) {
      return b + unit;
    } else {
      var s = parseInt(10 * b / (j/1000)) / 10;
      return s + mags[i] + unit;
    }
  },

  onprogress : function(x) {
    var w = this.progressElem.width, h = this.progressElem.height;
    var ctx = this.progressElem.getContext('2d');
    ctx.clearRect(0,0,w,h);
    var r = Math.min(w,h) / 2 - 5;
    ctx.beginPath();
    ctx.arc(w/2,h/2, r, 0, Math.PI*2, false);
    ctx.strokeStyle = "rgba(255,255,255, 0.2)"
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.beginPath();
    var top = -Math.PI/2;
    var frac = x.loaded / x.total;
    if (x.type == 'load') frac = 1;
    if (x.type == 'loadstart') frac = 0;
    ctx.arc(w/2,h/2, r, top, top+frac*Math.PI*2, false);
    ctx.strokeStyle = "rgba(0,192,255, 0.8)"
    ctx.lineWidth = 9;
    ctx.stroke();
  },

  upload : function(callback, onerror) {
    var self = this;
    this.xhr = DnDUpload.uploadFile(this.file, {}, function(x) {
      self.fadeStart = new Date();
      self.fadeInterval = setInterval(function() {
        var elapsed = new Date() - self.fadeStart;
        var f = elapsed / 500;
        if (f >= 1) {
          f = 1;
          self.elem.parentNode.removeChild(self.elem);
          clearInterval(self.fadeInterval);
        }
        self.elem.opacity = 1 - f;
      }, 15);
      callback();
    }, function(x) {
      self.elem.appendChild(H3("Error: " + x.toString()));
      onerror();
    },
    function(x){ self.onprogress(x) });
  }
});

DnDUpload = Klass({
  formData : function(name, value, filename, headers) {
    var CRLF = '\r\n';
    var s = 'Content-Disposition: form-data; ';
    s += 'name="'+name+'"';
    if (filename) s += '; filename="'+filename+'"';
    if (headers) s += CRLF + headers;
    s += CRLF + CRLF + value + CRLF;
    return s;
  },

  generateBoundary : function(parts) {
    var b;
    var found = true;
    while (found) {
      found = false;
      b = Math.random() + "---BOUNDARY---" + new Date().getTime();
      for (var i=0; i<parts.length; i++) {
        if (parts[i].indexOf(b) != -1) {
          found = true;
          break;
        }
      }
    }
    return b;
  },

  sendFileUpload : function(xhr, parts, callback, onerror, onprogress) {
    xhr.open("POST", this.path);
    if (callback)
      xhr.addEventListener('load', callback, false);
    if (onerror)
      xhr.addEventListener('error', onerror, false);
    if (onprogress) {
      xhr.upload.addEventListener('error', function(x) {
      }, false);
      xhr.upload.addEventListener('load', onprogress, false);
      xhr.upload.addEventListener('loadstart', onprogress, false);
      xhr.upload.addEventListener('progress', onprogress, false);
    }
    if (window.FormData && parts instanceof window.FormData) {
      xhr.send(parts);
    } else {
      var CRLF = '\r\n';
      var boundary = this.generateBoundary(parts);
      var req = "--" + boundary + CRLF +
                parts.join("--" + boundary + CRLF) +
                "--" + boundary + "--" + CRLF;
      var ct = "multipart/form-data; boundary=" + boundary;
      xhr.setRequestHeader("Content-Type", ct);
      xhr.sendAsBinary(req);
    }
  },

  uploadFile : function(file, opts, callback, onerror, onprogress) {
    return this.uploadFiles([file], opts, callback, onerror, onprogress);
  },

  uploadFiles : function(files, opts, callback, onerror, onprogress) {
    var xhr = new XMLHttpRequest;
    if (!(window.FormData || xhr.sendAsBinary))
      throw("Can't upload files!");
    var self = this;
    var parts;
    if (window.FormData) {
      parts = new FormData();
    } else {
      parts = [];
      parts.append = function(key, value) {
        if (value.getAsBinary)
          this.push( self.formData(key, value.getAsBinary(), value.name, "Content-Type: "+value.type) );
        else
          this.push( self.formData(key, value) );
      };
    }
    for (var i=0; i<files.length; i++)
      parts.append("files", files[i]);
    self.sendFileUpload(xhr, parts, callback, onerror, onprogress);
    return xhr;
  },

  getUploadQueue : function() {
    if (!this.uploadQueue)
      this.uploadQueue = new CPSQueue(function(notification, callback, onerror) {
        notification.upload(callback, onerror);
      });
    return this.uploadQueue;
  },

  upload : function(files, notificationElement) {
    var uq = this.getUploadQueue();
    toArray(files).forEach(function(file) {
      var notification = new UploadNotification(file, notificationElement);
      uq.append(notification);
    });
  },

  setupTarget : function(cont, callback) {
    var self = this;

    var hasFiles = function(ev) {
      return ev.dataTransfer &&
            (ev.dataTransfer.hasOwnProperty('files') ||
             ev.dataTransfer.__lookupGetter__('files'));
    };

    cont.addEventListener('dragenter', function(ev) {
      if (!hasFiles(ev)) return;
      this.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
      Event.stop(ev);
    }, false);
    cont.addEventListener('dragleave', function(ev) {
      if (!hasFiles(ev)) return;
      this.style.backgroundColor = 'transparent';
      Event.stop(ev);
    }, false);
    cont.addEventListener('dragover', function(ev) {
      if (!hasFiles(ev)) return;
      this.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
      Event.stop(ev);
    }, false);
    cont.addEventListener('drop', function(ev) {
      if (!hasFiles(ev)) return;
      this.style.backgroundColor = 'transparent';
      Event.stop(ev);
      if (callback)
        callback(ev.dataTransfer.files, this);
      else
        self.upload(ev.dataTransfer.files, this);
    }, false);
  }
});
