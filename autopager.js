console.log('autopager')

var enable, contentid, nextid;
var $w = $(window)

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

function initdata() {
    sync.get('urls').then(function(items){
        var item = items['urls']
        item.forEach(function(url) {
            var reg = new RegExp(url)
            if(reg.test(location.href)) {
                sync.get(url).then(function(items) {
                    var item = items[url]
                    enable = item.enable || false
                    contentid = item.contentid || ''
                    nextid = item.nextid || ''
                    console.log('autopager data changed: ', item)
                })
            }
        })
    })
}

function bindevent() {
    var $loading = null, pageNum = 2;

    $w.scroll($.debounce(function(e) {
        if(!(enable && contentid && nextid) || $loading) {
            return
        }
        
        var $next = $(nextid).last()
        var $content = $(contentid).last()

        if(!($next.length && $content.length && $next.isvisible())) {
            return
        }

        var href = $next.attr('href')
        $loading = $('<div>').loading('start', pageNum++, href)
        $content.append($loading)
        
        $.get(href).then(function(res) {
            var $newPage = $('<html>').html(res)
            var $newContent = $newPage.find(contentid)
            var $newNext = $newPage.find(nextid)

            $next.attr('href', $newNext.attr('href'))
            $content.after($newContent)
            $content.attr('id', '')
        }).done(function() {
            $loading.loading('end')
            $loading = null
        })
    }, 100))
}

;(function jqueryPlugin() {
    var $w = $(window)
    $.fn.isvisible = function(margin) {
        margin = margin || 200
        if(this.length === 0) {
            return false
        }

        var el = this[0]

        var height = $w.height()
        var top = el.getBoundingClientRect().top
        return top >=0 && (top - margin) < height 
    }

    $.fn.loading = function(action, page, href) {
        return this.each(function() {
            var $el = $(this)
            if(page) {
                $el.data('data', page)
                $el.data('href', href)
            } else {
                page = $el.data('data')
                href = $el.data('href')
            }
            
            switch(action) {
            case 'start':
                $el.html('<div> 正在加载第 <a href="' + href +'">' + page + '</a>' + ' 页</div>')
                break;
            case 'end':
                $el.html('<div> 第 <a href="' + href +'">' + page + '</a>' + ' 页</div>')
                break;
            default:
            }

        })
    }

    $.debounce = function(fn, ms) {
        ms = ms || 16.7
        var timeoutid = null
        return function() {
            if(timeoutid) {
                return
            }
            fn.apply(this, arguments)
            timeoutid = setTimeout(function() {
                timeoutid = null
            }, ms)
        }
    }
})()

var storage = chrome.storage, sync = storage.sync
storage.onChanged.addListener(function(changes, namespace) {
    if(changes['urls']) {
        initdata()
    }
})

promisify(sync, 'get')
promisify(sync, 'set')

initdata()
bindevent()
