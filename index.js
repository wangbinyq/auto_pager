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

    /*--------- a simple mvvm  ---------*/
    
    function Binding(vm, el, key, binder) {
        this.vm = vm
        this.el = el
        this.key = key
        this.binder = binder

        if(binder.constructor === Function) {
            this.binder.sync = binder
        }

        this.bind = this.bind.bind(this)
        this.sync = this.sync.bind(this)
        this.update = this.update.bind(this)
        this.unwatch = watch(this.vm.data, this.key, this.sync)
    }

    var fn = Binding.prototype
    fn.bind = function() {
        if(defined(this.binder.bind)) {
            this.binder.bind.call(this, this.el)
        }
        this.sync()
    }
    fn.unbind = function() {
        this.unwatch()
        if(defined(this.binder.unbind)) {
            this.binder.unbind.call(this, this.el)
        }
    }
    fn.sync = function() {
        if(defined(this.binder.sync)) {
            this.binder.sync.call(this, this.el, this.value())
        }
    }
    fn.update = function() {
        if(defined(this.binder.sync)) {
            var value = this.binder.value.call(this, this.el)
            this.value(value)
        }
    }
    fn.value = function(r) {
        if(r === undefined) {
            return this.vm.data[this.key]
        } else {
            this.vm.data[this.key] = r
        }
    }


    function ViewModel(el, options) {
        this.init(el, options)
    }

    fn = ViewModel.prototype

    fn.init = function(el, options) {
        this.el = el
        this.options = options
        this.data = options.data || {}
        this.methods = options.methods || {}
        this.bindings = []

        this.bindMethods()

        this.compile(this.el)
        this.bind()
    }

    fn.bindMethods = function() {
        Object.keys(this.methods).map((key) => {
            var method = this.methods[key]
            this[key] = method.bind(this)
        })
    }

    fn.compile = function(el) {
        var block = false

        if(el.nodeType !== 1) {
            return
        }

        var dataset = el.dataset
        for(var data in dataset) {
            var binder = ViewModel.binders[data]
            var key = dataset[data]

            if(binder === undefined) {
                binder = ViewModel.binders['*']
            }

            if(defined(binder)) {
                this.bindings.push(new Binding(this, el, key, binder))
            }
        }

        if(!block) {
            el.childNodes.forEach((childEl) => {
                this.compile(childEl)
            })
        }
    }

    fn.bind = function() {
        this.bindings.sort((a, b) => {
            var aPriority = defined(a.binder) ? (a.binder.priority || 0) : 0
            var bPriority = defined(b.binder) ? (b.binder.priority || 0) : 0
            return bPriority - aPriority
        })
        this.bindings.forEach(binding => {
            binding.bind()
        })
    }

    fn.unbind = function() {
        this.bindins.forEach(binding => {
            binding.unbind()
        })        
    }

    ViewModel.binders = {
        value: {
            bind(el) {
                el.addEventListener('change', this.update)
            },

            sync(el, value) {
                if(el.nodeName === 'CHECKBOX') {
                    el.checked = !!value
                } else {
                    el.value = value
                }
            },

            value(el) {
                if(el.nodeName === 'CHECKBOX') {
                    return el.checked
                } else {
                    return el.value
                } 
            },
            unbind(el) {
                el.removeEventListener('change', this.update)
            }
        },

        html: {
            sync(el, value) {
                el.innerHTML = value
            }
        },

        show: {
            priority: 2000,
            sync(el, value) {
                el.style.display = value ? '' : 'none'
            }
        },

        on: {
            bind(el) {
                el.addEventListener(this.args[0], function() {
                    if(this.vm.method && this.vm.method[this.key]) {
                        this.vm.method[this.key].call(this.vm)
                    }
                })
            }
        },

        '*': {
            sync(el, value) {
                if(defined(value)) {
                    el.setAttribute(this.args[0], value)
                } else {
                    el.removeAttribute(this.args[0])
                }
            }
        }
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
    window.Binding = Binding
    window.ViewModel = ViewModel

    /*--------- autopager ---------*/

    
    function AutoPager() {
        this.init()
    }

    fn = AutoPager.prototype

    fn.init = function() {
    
        var style = document.createElement('style')
        style.innerHTML = `
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
        document.head.appendChild(style)

        var el = document.createElement('div')
        el.id = '_autopager'
        el.dataset.show = 'selectMode'
        el.innerHTML = `
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
        
        document.body.appendChild(el)
    }

    var autopager = new AutoPager()
})()