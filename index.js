// ==UserScript==
// @name         autopager
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       wangbin
// @match        http://*/*
// @include      http*
// @grant        none
// ==/UserScript==

(function() {
    'use strict'

    /*--------- getElementUniqueSelector ----------*/
    /*
    modify from http://www.timvasil.com/blog14/post/2014/02/24/Build-a-unique-selector-for-any-DOM-element-using-jQuery.aspx 
    */

    function getElementUniqueSelector(el) {
        var tagName = el.tagName
        if(!tagName) {
            return ''
        }
        var id = el.id
        if(id) {
            return '#' + id
        }

        var classSelector = Array.prototype.filter.call(el.classList, function(className) {
            return className !== nextClassName && className !== contentClassName
        }).map(function(className) {
            return '.' + className
        }).join('')

        var selector
        var parent = el.parentNode
        var siblings = parent.children
        var needParent = false
        if(classSelector && parent.querySelectorAll(classSelector).length === 1) {
            selector = classSelector
        } else if (parent.querySelectorAll(tagName).length === 1) {
            selector = tagName
        } else {
            var nth = Array.prototype.indexOf.call(siblings, el) + 1
            selector = ':nth-child(' + nth + ')'
            needParent = true
        }

        if(!needParent) {
            for(var ancestor = parent.parentNode; ancestor && ancestor.querySelectorAll(selector).length === 1;
                parent = ancestor, ancestor = ancestor.parentNode) {
                if(ancestor === null) {
                    return selector
                }
            }
        }

        var parentSelector = getElementUniqueSelector(parent)
        if(parentSelector && needParent) {
            return (parentSelector + ' > ' + selector).trim()
        } else {
            return (parentSelector + ' ' + selector).trim()
        }
    }
    window.getElementUniqueSelector = getElementUniqueSelector

    function $get(href, onsuccess, onfail) {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', href, true)
        xhr.onreadystatechange  = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if(xhr.status >= 200 && xhr.status < 400) {
                    onsuccess(xhr)
                } else {
                    onfail(xhr)
                }
            }
        }
    }

    /*--------- autopager ---------*/

    var injectStyle = `
            #_autopager {
                background: white;
                position: fixed;
                right: 5px;
                bottom: 5px;
                box-shadow: 0 0 5px #aaaaaa;
                padding: 20px;
                width: 200px;
                font-size: 14px;
                font-family: "Roboto", "Noto Sans CJK SC", "Nato Sans CJK TC", "Nato Sans CJK JP", "Nato Sans CJK KR", -apple-system, ".SFNSText-Regular", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Zen Hei", Arial, sans-serif;
            }

            #_autopager input[type="text"] {
                width: 70%;
                padding: 5px 9px;
                border: 1px solid hsl(0, 0%, 70%);
                margin: 0px;
                text-align: left;
                outline: none;
            }

            #_autopager input[type="text"]:hover {
                border: 1px solid hsl(0, 0%, 50%);
            }

            #_autopager input[type="text"]:focus {
                border: 1px solid hsl(200, 40%, 60%);
            }

            #_autopager .flex {
                display: flex;
                align-items: center;
                margin: 10px 0;
            }

            #_autopager .flex-grow {
                flex-grow: 999;
            }

            #_autopager .line {
                width: 100%;
                height: 1px;
                background: hsl(0, 0%, 80%);
                margin: 20px 0;
            }

            #_autopager #close {
                display: none;
            }
            
            #_autopager:hover #close {
                display: block;
                position: absolute;
                right: 6px;
                top: 6px;
                width: 12px;
                height: 12px;
            }

            #_autopager:hover #close:hover {
                height: 14px;
            }

            #_autopager:hover #close::before,
            #_autopager:hover #close::after {
                content: "";
                display: block;
                width: 2px;
                height: 100%;
                background: hsl(0, 0%, 20%);;
                position: absolute;
                left: 6px;
            }        

            #_autopager:hover #close::before {
                transform: rotate(45deg);
            }

            #_autopager:hover #close::after {
                transform: rotate(-45deg);
            }

            #_autopager:hover #close:active::before,
            #_autopager:hover #close:active::after {
                background: hsl(0, 0%, 0%);;
            }

            #_autopager .btn {
                font-size: 14px;
                border-radius: 2px;
                border: 0;
                text-align: center;
                background-color: hsl(200, 60%, 50%);
                transition: all .2s ease-in-out;
                color: white;
                padding: 4px 8px;
            }

            #_autopager .btn:hover {
                background-color: hsl(200, 70%, 45%);
            }

            #_autopager .btn:active {
                background-color: hsl(200, 80%, 40%);
            }

            #_autopager .select {
                position: relative;
                left: -5px;
                width: 10px;
                height: 10px;
                border: 1px solid hsl(0, 0%, 30%);
                border-radius: 5px;
            }

            #_autopager .select:hover {
                border-color: hsl(0, 0%, 20%);
            }

            #_autopager .select:active {
                border-color: hsl(0, 0%, 0%);
            }

            #_autopager .select::before,
            #_autopager .select::after {
                content: "";
                display: inline-block;
                width: 2px;
                height: 20px;
                background: hsl(0, 0%, 30%);;
                position: absolute;
                left: 4px;
                top: -5px;
            }

            #_autopager .select::after {
                transform: rotate(90deg);
            }

            #_autopager .select:hover::before,
            #_autopager .select:hover::after {
                background: hsl(0, 0%, 20%);
            }

            #_autopager .select:active::before,
            #_autopager .select:active::after {
                background: hsl(0, 0%, 0%);
            }

            #_autopager .error {
                display: none;
                font-size: 0.7em;
                color: hsl(0, 100%, 60%);
            }            

            .autopager-next {
                box-sizing: border-box;
                border: 2px solid hsl(0, 50%, 50%);
            }

            .autopager-content {
                box-sizing: border-box;
                border: 2px solid hsl(120, 50%, 50%);
            }
        `
    
    var template = `
            <i id="close"></i>
            <span>选择内容</span>
            <div class="flex ap-content">
                <input type="text"/>
                <span class="flex-grow"></span>                
                <span class="select"></span>
            </div>

            <div class="line"></div>

            <span>选择下一页</span>
            <div class="flex ap-next">
                <input type="text"/>
                <span class="flex-grow"></span>                
                <span class="select"></span>
            </div>
            <div class="error">下一页不是链接</div>

            <div style="width:1px; height:10px"></div>

            <div class="flex" style="margin-bottom:-5px">
                <span class="flex-grow"></span>                
                <span class="flex-grow"></span>                
                <span class="flex-grow"></span>                
                <span class="flex-grow"></span>                
                <button class="cancel btn">取消</button>
                <span class="flex-grow"></span>                
                <button class="ok btn">确定</button>
            </div>
        `
    var nextClassName = 'autopager-next'
    var contentClassName = 'autopager-content'

    function AutoPager() {
        this.init()
    }

    var fn = AutoPager.prototype

    fn.init = function() {
    
        this.model = {
            select: 'next',
            'next': '#next',
            'content': '#content',
            auto: false
        }

        this.loadModel()

        this.events = {
            '.select click': 'changeSelect',
            '#close click': 'disable',
            '.cancel click': 'disable',
            'input[type="text"] change': 'changeContent',
            '.ok click': 'goAutoPage'
        }

        var style = document.createElement('style')
        style.innerHTML = injectStyle
        document.head.appendChild(style)

        var el = document.createElement('div')
        el.id = '_autopager'
        el.innerHTML = template
        document.body.appendChild(el)

        this.el = el
        this.next = this.el.querySelector('.ap-next input')
        this.content = this.el.querySelector('.ap-content input')
        this.error = this.el.querySelector('.error')

        this.render()
        this.bindEvents()
    }

    fn.render = function() {
        this.el.querySelector('.ap-next input').value = this.model.next
        this.el.querySelector('.ap-content input').value = this.model.content
        this.changeContent()    
    }

    fn.enable = function(enable) {
        if(enable === undefined) {
            return this.el.style.display !== 'none'
        }
        if(enable) {
            this.changeContent()
            this.el.style.display = 'block'
        } else {
            this.addClassName('', nextClassName)
            this.addClassName('', contentClassName)
            this.el.style.display = 'none'
        }
    }

    fn.disable = function() {
        this.enable(false)
    }

    fn.bindEvents = function() {
        var self = this

        for(var event in this.events) {
            var eventName = this.events[event]
            var eventInfo = event.split(' ')
            var query = eventInfo[0]
            var event = eventInfo[1]
            var self = this

            this.el.querySelectorAll(query).forEach(function(el) {
                el.addEventListener(event, self[eventName].bind(self))
            })
        }

        document.body.addEventListener('mouseover', function(e) {
            if(self.model.select) {
                var target = e.target
                self.model[self.model.select] = getElementUniqueSelector(target)
                self.render()
                e.stopPropagation()
                e.preventDefault()
            }
        })

        this.el.addEventListener('mouseover', function(e) {
            e.stopPropagation()
            e.preventDefault()           
        })

        document.body.addEventListener('click', function(e) {
            if(self.model.select) {
                self.model.select = ''
                e.stopPropagation()
                e.preventDefault()
            }
        })

        // document.body.addEventListener('scroll', function(e) {

        //     if(!this.model.auto || !this.model.next) {
        //         return
        //     }

        //     var next = document.querySelector(this.model.next) 
            
        //     if(false) {
        //         if(e.target === next) {
        //             var href = next.href
        //             $get(href, self.getNextPage.bind(self), function(xhr) {
        //                 console.error('autopager get', href, xhr.status)
        //             })
        //         }
        //     }
        // })
    }

    fn.changeSelect = function(e) {

        var target = e.target
        var parent = target.parentNode
        var name = parent.classList.item(1)
        this.model.select = name
        if(name) {
            name = name.split('-')
            this.model.select = name[1]
        }

        e.stopPropagation()
        e.preventDefault()
    }

    fn.changeContent = function() {
        this.model.next = this.next.value.trim()
        this.model.content = this.content.value.trim()
        this.addClassName(this.model.next, nextClassName)
        this.addClassName(this.model.content, contentClassName)

        if(this.model.next) {
            var next = document.querySelector(this.model.next)
            if(next && next.href && next.href.indexOf('javascript:') !== 0) {
                this.error.style.display = 'none'
            } else {
                this.error.style.display = 'block'
            }
        }
    }

    fn.addClassName = function(query, className) {
        document.querySelectorAll('.'+className).forEach(function(el) {
            el.classList.remove(className)
        })
        if(query) {
            document.querySelectorAll(query).forEach(function(el) {
                el.classList.add(className)
            })
        }
    }

    fn.goAutoPage = function() {
        this.model.auto = true
        this.saveModel()
    }
    
    fn.saveModel = function() {
        for(var key in this.model) {
            localStorage.setItem(key, this.model[key])
        }
    }

    fn.loadModel = function() {
        for(var key in this.model) {
            this.model[key] = localStorage.getItem(key)
        }
    }

    var autopager = new AutoPager()
})()