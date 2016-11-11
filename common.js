;(function() {
    function promisify(obj, fn) {

        var ofun = obj[fn].bind(this)

        obj[fn] = function(...args) {

            var d = $.Deferred()

            function cb(res) {
                d.resolve(res)
            }

            ofun(...args, cb)

            return d
        }
    }

    promisify(chrome.storage.sync, 'get')
    promisify(chrome.storage.sync, 'set')
    promisify(chrome.storage.sync, 'remove')
    promisify(chrome.storage.sync, 'clear')
    promisify(chrome.tabs, 'query')
})()
