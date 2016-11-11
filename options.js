$(function(){
    
    var storage = chrome.storage.sync, urls, urlMaps = {}
    var urlRuleTemplate = $('#urlRuleLine').html()

    function initdata() {
        $('tbody').empty()
        storage.get('urls').then(function(items) {
            urls = items['urls'] || []
        }).then(function() {
            appendAllUrl()
        })
    }

    function appendAllUrl() {

        function appendUrl(num) {
            var url = urls[num]
            if(url === undefined) {
                return
            }
            return storage.get(url).then(function(items) {
                return urlMaps[url] = items[url] || {}
            }).then(function(urlRule) {
                if(!urlRule) {
                    return
                }
                var $urlRule = $(urlRuleTemplate)
                var $num = $urlRule.find('.num').html(num)
                var $url = $urlRule.find('.url').val(url)
                var $content = $urlRule.find('.contentid').val(urlRule.contentid)
                var $next = $urlRule.find('.nextid').val(urlRule.nextid)
                
                var $enable = $urlRule.find('input[type="checkbox"]')
                var $del = $urlRule.find('.btn')

                $enable.prop('checked', urlRule.enable)


                $url.change(function() {
                    var newUrl = $url.val()
                    delete urlMaps[url]

                    var index = urls.indexOf(url)
                    urls.splice(index, 1, [newUrl])
                    urlMaps[newUrl] = urlRule
                    url = newUrl
                })
                $content.change(function() {
                    urlRule.contentid = $content.val()
                })
                $next.change(function() {
                    urlRule.nextid = $next.val()
                })
                $enable.change(function() {
                    urlRule.enable = $enable.prop('checked')
                })
                $del.click(function() {
                    urls = $.grep(urls, function(u) {
                        return u !== url
                    })
                    delete urlMaps[url]
                    savedata()
                })

                $('tbody').append($urlRule)

            }).always(function() {
                return appendUrl(num+1)
            })            
        }

        return appendUrl(0)
    }

    function savedata() {
        return storage.clear().then(function(){
            return storage.set({
                urls: urls,
            })
        }).then(function() {
            return storage.set(urlMaps)
        }).then(initdata)
    }

    function newrule() {

        if(urls.indexOf('') === -1) {
            urls.unshift('')
            savedata().then(function() {
                $('.url').focus()
            })
        }
    }

    initdata()
    $('.save').click(savedata)
    $('.new').click(newrule)
})