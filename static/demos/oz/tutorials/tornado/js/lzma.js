/// This code is licensed under the MIT License.  See LICENSE for more details.

/// Does the environment support web workers?  If not, let's fake it.
if (!Worker) {
    ///NOTE: IE8 needs onmessage to be created first, IE9 cannot, IE7- do not care.
    /*@cc_on
        /// Is this IE8-?
        @if (@_jscript_version < 9)
            var onmessage = function () {};
        @end
    @*/
    
    /// If this were a regular function statement, IE9 would run it first and therefore make the Worker variable truthy because of hoisting.
    var Worker = function(script) {
        var global_var,
            return_object = {};
        
        /// Determine the global variable (it's called "window" in browsers, "global" in Node.js).
        if (typeof window !== "undefined") {
            global_var = window;
        } else if (global) {
            global_var = global;
        }
        
        /// Is the environment is browser?
        /// If not, create a require() function, if it doesn't have one.
        if (global_var.document && !global_var.require) {
            global_var.require = function (path) {
                var script_tag  = document.createElement("script");
                script_tag.type ="text/javascript";
                script_tag.src  = path;
                document.getElementsByTagName('head')[0].appendChild(script_tag);
            };
        }
        
        /// Dummy onmessage() function.
        return_object.onmessage = function () {};
        
        /// This is the function that the main script calls to post a message to the "worker."
        return_object.postMessage = function (message) {
            /// Delay the call just in case the "worker" script has not had time to load.
            setTimeout(function () {
                /// Call the global onmessage() created by the "worker."
                ///NOTE: Wrap the message in an object.
                global_var.onmessage({data: message});
            }, 10);
        };
        
        /// Create a global postMessage() function for the "worker" to call.
        global_var.postMessage = function (e) {
            ///NOTE: Wrap the message in an object.
            ///TODO: Add more properties.
            return_object.onmessage({data: e, type: "message"});
        };
        
        require(script);
        
        return return_object;
    };
}


///NOTE: The "this" keyword is the global context ("window" variable) if loaded via a <script> tag
///      or the function context if loaded as a module (e.g., in Node.js).
this.LZMA = function (lzma_path) {
    var action_compress   = 1,
        action_decompress = 2,
        action_progress   = 3,
        
        callback_obj = {},
        
        ///NOTE: Node.js needs something like "./" or "../" at the beginning.
        lzma_worker = new Worker((typeof lzma_path === "undefined" ? "./lzma_worker.js" : lzma_path));
    
    lzma_worker.onmessage = function (e) {
        if (e.data.action === action_progress) {
            if (callback_obj[e.data.callback_num] && typeof callback_obj[e.data.callback_num].on_progress === "function") {
                callback_obj[e.data.callback_num].on_progress(e.data.result);
            }
        } else {
            if (callback_obj[e.data.callback_num] && typeof callback_obj[e.data.callback_num].on_finish === "function") {
                callback_obj[e.data.callback_num].on_finish(e.data.result);
                
                /// Since the (de)compression is complete, the callbacks are no longer needed.
                delete callback_obj[e.data.callback_num];
            }
        }
    };
    
    /// Very simple error handling.
    lzma_worker.onerror = function(event) {
        throw new Error(event.message + " (" + event.filename + ":" + event.lineno + ")");
    };
    
    return (function () {
        
        function send_to_worker(action, data, mode, on_finish, on_progress) {
            var callback_num;
            
            do {
                callback_num = Math.floor(Math.random() * (10000000));
            } while(typeof callback_obj[callback_num] !== "undefined");
            
            callback_obj[callback_num] = {
                on_finish:   on_finish,
                on_progress: on_progress
            };
            
            lzma_worker.postMessage({
                action:       action,
                callback_num: callback_num,
                data:         data,
                mode:         mode
            });
        }
        
        return {
            compress: function (string, mode, on_finish, on_progress) {
                send_to_worker(action_compress, String(string), mode, on_finish, on_progress);
            },
            decompress: function (byte_arr, on_finish, on_progress) {
                send_to_worker(action_decompress, byte_arr, false, on_finish, on_progress);
            }
        };
    }());
};
