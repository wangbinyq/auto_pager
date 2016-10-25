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
        style.innerText = `
            #_autopager {
                position: absolute
                right: 5px
                bottom: 5px
            }

        `
        document.head.appendChild(style)

        var el = document.createElement('div')
        el.id = '_autopager'
        el.dataset.show = 'selectMode'
        el.innerHTML = `
            div.
        `

        document.body.appendChild(el)
    }

    var autopager = new AutoPager()
})()