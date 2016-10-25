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

    function defined(o) {
        return o !== undefined && o !== null
    }

    function watch(obj, prop, callback) {
        if(!callback) {
            callback = prop
            prop = obj
            obj = this
        }

        var value = obj[prop]
        var callbacks = obj.$$callbacks = obj.$$callbacks || {}
        var propCallbacks = callbacks[prop] = callbacks[prop] || []

        var desc = Object.getOwnPropertyDescriptor(obj, prop)
        if(!(desc && (desc.get || desc.set))) {
            Object.defineProperty(obj, prop, {
                get: function(){
                    return value
                },
                set: function(newValue){
                    if(newValue !== value) {
                        value = newValue
                        
                        propCallbacks.forEach(function(cb) {
                            cb()
                        })                    
                    }
                }
            })
        }


        if(propCallbacks.indexOf(callback) === -1) {
            propCallbacks.push(callback)
        }

        return function() {
            var index = propCallbacks.indexOf(callback)
            propCallbacks.splice(index, 1)
            if(propCallbacks.length === 0) {
                delete callbacks[prop]
            }
        }
    }
    
    // for test
    window.watch = watch

    /*--------- autopager ---------*/

    var injectStyle = `
            #_autopager {
                position: absolute;
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
        `
    
    var template = `
            <i id="close"></i>
            <div class="flex">
                <span>选择内容</span>
                <span class="flex-grow"></span>
                <button class="btn">添加</button>
            </div>
            
            <div class="flex">
                <input type="text"/>
                <span class="flex-grow"></span>                
                <span class="select"></span>
            </div>

            <div class="line"></div>

            <span>选择下一页</span>
            <div class="flex">
                <input type="text"/>
                <span class="flex-grow"></span>                
                <span class="select"></span>
            </div>
        `
    
    function AutoPager() {
        this.init()
    }

    var fn = AutoPager.prototype

    fn.init = function() {
    
        var style = document.createElement('style')
        style.innerHTML = injectStyle
        document.head.appendChild(style)

        var el = document.createElement('div')
        el.id = '_autopager'
        el.dataset.show = 'selectMode'
        el.innerHTML = template
        
        document.body.appendChild(el)
    }

    var autopager = new AutoPager()
})()