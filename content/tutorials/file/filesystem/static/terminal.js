var util = util || {};
util.toArray = function(list) {
  return Array.prototype.slice.call(list || [], 0);
};

var Terminal = Terminal || function(cmdLineContainer, outputContainer) {
  window.URL = window.URL || window.webkitURL;
  window.requestFileSystem = window.requestFileSystem ||
                             window.webkitRequestFileSystem;

  var cmdLine_ = document.querySelector(cmdLineContainer);
  var output_ = document.querySelector(outputContainer);
  const VERSION_ = '0.0.1';
  const CMDS_ = [
    'cat', 'cd', 'cp', 'clear', 'date', 'help', 'ls', 'mkdir', 'mv', 'open',
    'pwd', 'rm', 'rmdir', 'theme', 'version', 'who'
  ];
  const THEMES_ = ['default', 'cream'];
  var fs_ = null;
  var cwd_ = null;
  var history_ = [];
  var histpos_ = 0;
  var histtemp_ = 0;

  window.addEventListener('click', function(e) {
    cmdLine_.focus();
  }, false);

  // Always force text cursor to end of input line.
  cmdLine_.addEventListener('click', inputTextClick_, false);

  // Handle up/down key presses for shell history and enter for new command.
  cmdLine_.addEventListener('keydown', historyHandler_, false);
  cmdLine_.addEventListener('keydown', processNewCommand_, false);

  function inputTextClick_(e) {
    this.value = this.value;
  }

  function historyHandler_(e) { // Tab needs to be keydown.

    if (history_.length) {
      if (e.keyCode == 38 || e.keyCode == 40) {
        if (history_[histpos_]) {
          history_[histpos_] = this.value;
        } else {
          histtemp_ = this.value;
        }
      }

      if (e.keyCode == 38) { // up
        histpos_--;
        if (histpos_ < 0) {
          histpos_ = 0;
        }
      } else if (e.keyCode == 40) { // down
        histpos_++;
        if (histpos_ > history_.length) {
          histpos_ = history_.length;
        }
      }

      if (e.keyCode == 38 || e.keyCode == 40) {
        this.value = history_[histpos_] ? history_[histpos_] : histtemp_;
        this.value = this.value; // Sets cursor to end of input.
      }
    }
  }

  function processNewCommand_(e) {

    if (e.keyCode == 9) { // tab
      e.preventDefault();
      // TODO(ericbidelman): Implement tab suggest.
    } else if (e.keyCode == 13) { // enter

      // Save shell history.
      if (this.value) {
        history_[history_.length] = this.value;
        histpos_ = history_.length;
      }

      // Duplicate current input and append to output section.
      var line = this.parentNode.parentNode.cloneNode(true);
      line.removeAttribute('id')
      line.classList.add('line');
      var input = line.querySelector('input.cmdline');
      input.autofocus = false;
      input.readOnly = true;
      output_.appendChild(line);

      // Parse out command, args, and trim off whitespace.
      // TODO(ericbidelman): Support multiple comma separated commands.
      if (this.value && this.value.trim()) {
        var args = this.value.split(' ').filter(function(val, i) {
          return val;
        });
        var cmd = args[0].toLowerCase();
        args = args.splice(1); // Remove cmd from arg list.
      }

      switch (cmd) {
        case 'cat':
          var fileName = args.join(' ');

          if (!fileName) {
            output('usage: ' + cmd + ' filename');
            break;
          }

          read_(cmd, fileName, function(result) {
            output('<pre>' + result + '</pre>');
          });

          break;
        case 'clear':
          output_.innerHTML = '';
          this.value = '';
          return;
        case 'date':
          output((new Date()).toLocaleString());
          break;
        case 'help':
          output('<div class="ls-files">' + CMDS_.join('<br>') + '</div>');
          output('<p>Add files by dragging them from your desktop.</p>');
          break;
        case 'ls':
          ls_(function(entries) {
            if (entries.length) {
              var html = formatColumns_(entries);
              util.toArray(entries).forEach(function(entry, i) {
                html.push(
                    '<span class="', entry.isDirectory ? 'folder' : 'file',
                    '">', entry.name, '</span><br>');
              });
              html.push('</div>');
              output(html.join(''));
            }
          });
          break;
        case 'pwd':
          output(cwd_.fullPath);
          break;
        case 'cd':
          var dest = args.join(' ') || '/';

          cwd_.getDirectory(dest, {}, function(dirEntry) {
            cwd_ = dirEntry;
            output('<div>' + dirEntry.fullPath + '</div>');
          }, function(e) { invalidOpForEntryType_(e, cmd, dest); });

          break;
        case 'mkdir':
          var dashP = false;
          var index = args.indexOf('-p');
          if (index != -1) {
            args.splice(index, 1);
            dashP = true;
          }

          if (!args.length) {
            output('usage: ' + cmd + ' [-p] directory<br>');
            break;
          }

          // Create each directory passed as an argument.
          args.forEach(function(dirName, i) {
            if (dashP) {
              var folders = dirName.split('/');

              // Throw out './' or '/' if present on the beginning of our path.
              if (folders[0] == '.' || folders[0] == '') {
                folders = folders.slice(1);
              }

              createDir_(cwd_, folders);
            } else {
              cwd_.getDirectory(dirName, {create: true, exclusive: true}, null,
                  function(e) { invalidOpForEntryType_(e, cmd, dirName); });
            }
          });
          break;
        case 'cp':
        case 'mv':
          var src = args[0];
          var dest = args[1];

          if (!src || !dest) {
            output(['usage: ', cmd, ' source target<br>',
                   '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', cmd,
                   ' source directory/'].join(''));
            break;
          }

          var runAction = function(cmd, srcDirEntry, destDirEntry, opt_newName) {
            var newName = opt_newName || null;
            if (cmd == 'mv') {
              srcDirEntry.moveTo(destDirEntry, newName, function(e) {
                // UNIX doesn't display output on successful move.
              }, function(e) {
                errorHandler_(e);
              });
            } else {
              srcDirEntry.copyTo(destDirEntry, newName, function(e) {
                // UNIX doesn't display output on successful copy.
              }, function(e) {
                errorHandler_(e);
              });
            }
          };

          // Moving to a folder? (e.g. second arg ends in '/').
          if (dest[dest.length - 1] == '/') {
            cwd_.getDirectory(src, {}, function(srcDirEntry) {
              // Create blacklist for dirs we can't re-create.
              var create = [
                '.', './', '..', '../', '/'].indexOf(dest) != -1 ? false : true;

              cwd_.getDirectory(dest, {create: create}, function(destDirEntry) {
                runAction(cmd, srcDirEntry, destDirEntry);
              }, errorHandler_);
            }, function(e) {
              // Try the src entry as a file instead.
              cwd_.getFile(src, {}, function(srcDirEntry) {
                cwd_.getDirectory(dest, {}, function(destDirEntry) {
                  runAction(cmd, srcDirEntry, destDirEntry);
                }, errorHandler_);
              }, errorHandler_);
            });
          } else { // Treat src/destination as files.
            cwd_.getFile(src, {}, function(srcFileEntry) {
              srcFileEntry.getParent(function(parentDirEntry) {
                runAction(cmd, srcFileEntry, parentDirEntry, dest);
              }, errorHandler_);
            }, errorHandler_);
          }

          break;
        case 'open':
          var fileName = args.join(' ');

          if (!fileName) {
            output('usage: ' + cmd + ' filename');
            break;
          }

          open_(cmd, fileName, function(fileEntry) {
            var myWin = window.open(fileEntry.toURL(), 'mywin');
          });

          break;
        case 'rm':
          // Remove recursively? If so, remove the flag(s) from the arg list.
          var recursive = false;
          ['-r', '-f', '-rf', '-fr'].forEach(function(arg, i) {
            var index = args.indexOf(arg);
            if (index != -1) {
              args.splice(index, 1);
              recursive = true;
            }
          });

          // Remove each file passed as an argument.
          args.forEach(function(fileName, i) {
            cwd_.getFile(fileName, {}, function(fileEntry) {
              fileEntry.remove(function() {}, errorHandler_);
            }, function(e) {
              if (recursive && e.code == FileError.TYPE_MISMATCH_ERR) {
                cwd_.getDirectory(fileName, {}, function(dirEntry) {
                  dirEntry.removeRecursively(function() {}, errorHandler_);
                }, errorHandler_);
              } else if (e.code == FileError.INVALID_STATE_ERR) {
                output(cmd + ': ' + fileName + ': is a directory<br>');
              } else {
                errorHandler_(e);
              }
            });
          });
          break;
        case 'rmdir':
          // Remove each directory passed as an argument.
          args.forEach(function(dirName, i) {
            cwd_.getDirectory(dirName, {}, function(dirEntry) {
              dirEntry.remove(function() {}, function(e) {
                if (e.code == FileError.INVALID_MODIFICATION_ERR) {
                  output(cmd + ': ' + dirName + ': Directory not empty<br>');
                } else {
                  errorHandler_(e);
                }
              });
            }, function(e) { invalidOpForEntryType_(e, cmd, dirName); });
          });
          break;
        case 'theme':
          var theme = args.join(' ');
          if (!theme) {
            output(['usage: ', cmd, ' ' + THEMES_.join('|')].join(''));
          } else {
            var matchedThemes = THEMES_.join('|').match(theme);
            if (matchedThemes && matchedThemes.length) {
              setTheme_(theme);
            } else {
              output('Error - Unrecognized theme used');
            }
          }
          break;
        case 'version':
        case 'ver':
          output(VERSION_);
          break;
        case 'who':
          output(document.title +
                 ' - By: Eric Bidelman &lt;ericbidelman@chromium.org&gt;');
          break;
        default:
          if (cmd) {
            output(cmd + ': command not found');
          }
      };

      window.scrollTo(0, getDocHeight_());
      this.value = ''; // Clear/setup line for next input.
    }
  }

  function formatColumns_(entries) {
    var maxName = entries[0].name;
    util.toArray(entries).forEach(function(entry, i) {
      if (entry.name.length > maxName.length) {
        maxName = entry.name;
      }
    });

    // If we have 3 or less entires, shorten the output container's height.
    // 15 is the pixel height with a monospace font-size of 12px;
    var height = entries.length <= 3 ?
        'height: ' + (entries.length * 15) + 'px;' : '';

    // 12px monospace font yields ~7px screen width.
    var colWidth = maxName.length * 7;

    return ['<div class="ls-files" style="-webkit-column-width:',
            colWidth, 'px;', height, '">'];
  }

  function invalidOpForEntryType_(e, cmd, dest) {
    if (e.code == FileError.NOT_FOUND_ERR) {
      output(cmd + ': ' + dest + ': No such file or directory<br>');
    } else if (e.code == FileError.INVALID_STATE_ERR) {
      output(cmd + ': ' + dest + ': Not a directory<br>');
    } else if (e.code == FileError.INVALID_MODIFICATION_ERR) {
      output(cmd + ': ' + dest + ': File already exists<br>');
    } else {
      errorHandler_(e);
    }
  }

  function errorHandler_(e) {
    var msg = '';
    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
      default:
        msg = 'Unknown Error';
        break;
    };
    output('<div>Error: ' + msg + '</div>');
  }

  function createDir_(rootDirEntry, folders, opt_errorCallback) {
    var errorCallback = opt_errorCallback || errorHandler_;

    rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
      // Recursively add the new subfolder if we still have a subfolder to create.
      if (folders.length) {
        createDir_(dirEntry, folders.slice(1));
      }
    }, errorCallback);
  }

  function open_(cmd, path, successCallback) {
    if (!fs_) {
      return;
    }

    cwd_.getFile(path, {}, successCallback, function(e) {
      if (e.code == FileError.NOT_FOUND_ERR) {
        output(cmd + ': ' + path + ': No such file or directory<br>');
      }
    });
  }

  function read_(cmd, path, successCallback) {
    if (!fs_) {
      return;
    }

    cwd_.getFile(path, {}, function(fileEntry) {
      fileEntry.file(function(file) {
        var reader = new FileReader();

        reader.onloadend = function(e) {
          successCallback(this.result);
        };

        reader.readAsText(file);
      }, errorHandler_);
    }, function(e) {
      if (e.code == FileError.INVALID_STATE_ERR) {
        output(cmd + ': ' + path + ': is a directory<br>');
      } else if (e.code == FileError.NOT_FOUND_ERR) {
        output(cmd + ': ' + path + ': No such file or directory<br>');
      }
    });
  }

  function ls_(successCallback) {
    if (!fs_) {
      return;
    }

    // Read contents of current working directory. According to spec, need to
    // keep calling readEntries() until length of result array is 0. We're
    // guarenteed the same entry won't be returned again.
    var entries = [];
    var reader = cwd_.createReader();

    var readEntries = function() {
      reader.readEntries(function(results) {
        if (!results.length) {
          successCallback(entries.sort());
        } else {
          entries = entries.concat(util.toArray(results));
          readEntries();
        }
      }, errorHandler_);
    };

    readEntries();
  }

  function setTheme_(theme) {
    var currentUrl = document.location.pathname;

    if (!theme || theme == 'default') {
      //history.replaceState({}, '', currentUrl);
      localStorage.removeItem('theme');
      document.body.className = '';
      return;
    }

    if (theme) {
      document.body.classList.add(theme);
      localStorage.theme = theme;
      //history.replaceState({}, '', currentUrl + '#theme=' + theme);
    }
  }

  function output(html) {
    output_.insertAdjacentHTML('beforeEnd', html);
  }

  // Cross-browser impl to get document's height.
  function getDocHeight_() {
    var d = document;
    return Math.max(
        Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
        Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
        Math.max(d.body.clientHeight, d.documentElement.clientHeight)
    );
  }

  return {
    initFS: function(persistent, size) {
      output('<div>Welcome to ' + document.title +
             '! (v' + VERSION_ + ')</div>');
      output((new Date()).toLocaleString());
      output('<p>Documentation: type "help"</p>');

      if (!!!window.requestFileSystem) {
        output('<div>Sorry! The FileSystem API is not available in your browser.</div>');
        return;
      }

      var type = persistent ? window.PERSISTENT : window.TEMPORARY;
      window.requestFileSystem(type, size, function(filesystem) {
        fs_ = filesystem;
        cwd_ = fs_.root;

        // Attempt to create a folder to test if we can.
        cwd_.getDirectory('testquotaforfsfolder', {create: true}, function(dirEntry) {
          dirEntry.remove(function() { // If successfully created, just delete it.
            // noop.
          });
        }, function(e) {
          if (e.code == FileError.QUOTA_EXCEEDED_ERR) {
            output('ERROR: Write access to the FileSystem is unavailable. ' +
                   'Are you running Google Chrome with ' + 
                   '--unlimited-quota-for-files?');
          } else {
            errorHandler_(e);
          }
        });

      }, errorHandler_);
    },
    output: output,
    setTheme: setTheme_,
    addDroppedFiles: function(files) {
      util.toArray(files).forEach(function(file, i) {
        cwd_.getFile(file.name, {create: true, exclusive: true}, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.onerror = function(e) {
              errorHandler_(e.currentTarget.error);
            };
            fileWriter.write(file);
          }, errorHandler_);
        }, errorHandler_);
      });
    }
  }
};
