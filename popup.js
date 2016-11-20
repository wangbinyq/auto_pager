$(function() {

    var storage = chrome.storage.sync, tab = null

    $('.ok').click(function(){

        var url = $('.url input').val()
        var contentid = $('.content input').val()
        var nextid = $('.next input').val()
        var enable = $('.enable').prop('checked')

        var item = {}
        item[url] = {
            contentid: contentid,
            nextid: nextid,
            enable: enable
        }
        storage.set(item).then(function() {
            return storage.get('urls')
        }).then(function(items) {
            var item = items['urls']
            if(item.indexOf(url) === -1) {
                item.unshift(url)
                return storage.set({
                    urls: item
                })
            }
        }).always(function() {
            chrome.tabs.reload()
            window.close()
        })
    })

    $('.options').click(function() {
        return chrome.runtime.openOptionsPage()
    })

    function init() {
        chrome.tabs.query({
            currentWindow: true, active: true
        }).then(function(tabs){
            tab = tabs[0]
            return storage.get('urls')
        }).then(function(items) {
            if(tab === null) {
                return
            }
            var item = items['urls']
            for(var i in item) {
                var url = item[i]
                var reg = new RegExp(url)
                if(reg.test(tab.url)) {
                    $('.url input').val(url)
                    return storage.get(url)
                }
            }
        }).then(function(items) {
            var url = $('.url input').val()
            var item = items[url]
            $('.enable').prop('checked', item.enable)
            $('.next input').val(item.nextid)
            $('.content input').val(item.contentid)
        })
    }

    $('.delete').click(function() {
        var url = $('.url input').val()
        if(!url) {
            return
        }
        storage.get('urls').then(function(items) {
            var item = items['urls']
            item = $.grep(item, function(u) {
                u !== url
            })
            return storage.set({
                urls: item
            })
        }).then(function() {
            return storage.remove(url)
        }).always(init)
    })

    init()    
})