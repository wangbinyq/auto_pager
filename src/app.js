import $ from 'jquery'
import { getElementUniqueSelector } from './utils'
import template from './template.ejs'
import style from './style.styl'

function getStyleName(_class, postfix) {
    return '.' + style[_class] + ' ' + postfix
}

export default class App {
    constructor() {
        this.state = {
            next: '',
            content: '',
            auto: false
        }
        this.events = {
            [getStyleName('select', 'click')]: 'changeSelect',
            [getStyleName('close', 'click')]: 'hide',
            [getStyleName('cancel', 'click')]: 'hide',
            'input[type="text"] change': 'changeState',
            [getStyleName('ok', 'click')]: 'goAutoPage',
        }
        this.select = ''
        this.loadState()
        this.render()
        this.bindEvents()
        this.bindGlobalEvent()
        this.watchInput()
    }

    render() {
        if(this.el) {
            this.el.remove()
        }
        this.el = $(template({
            style,
            state: this.state
        }))
        $('body').append(this.el)
        this.$content = this.el.find('.' + style.content + ' input[type="text"]')
        this.$next = this.el.find('.' + style.next + ' input[type="text"]')
    }

    update() {
        $('.' + style['ap-content']).removeClass(style['ap-content'])
        $('.' + style['ap-next']).removeClass(style['ap-next'])

        $(this.state.content).addClass(style['ap-content'])
        $(this.state.next).addClass(style['ap-next'])
    }

    enable(enable) {
        if(enable) {
            this.el.show()
            this.update()
        } else {
            this.el.hide()
            this.select = ''

            $('.' + style['ap-content']).removeClass(style['ap-content'])
            $('.' + style['ap-next']).removeClass(style['ap-next'])
        }
    }

    hide() {
        this.enable(false)
    }

    watchInput() {
        function watch(obj, prop, fn) {
            let value = obj[prop]
            Object.defineProperty(obj, prop, {
                get() {
                    return value
                },
                set(newValue) {
                    if(value !== newValue) {
                        value = newValue
                        fn()
                    }
                }
            })
        }
        watch(this.state, 'next', this.update.bind(this))
        watch(this.state, 'content', this.update.bind(this))
    }

    changeState(e) {
        var parent = $(e.target.parentNode)
        if(parent) {
            if(parent.hasClass(style.content)) {
                this.state.content = this.$content.val()
            } else if (parent.hasClass(style.next)) {
                this.state.next = this.$next.val()
            }
        }
    }

    changeSelect(e) {
        var parent = $(e.target.parentNode)
        if(parent) {
            if(parent.hasClass(style.content)) {
                this.select = 'content'
            } else if (parent.hasClass(style.next)) {
                this.select = 'next'
            } else {
                this.select = ''
            }
        }
    }

    loadState() {
        for(var key in this.state) {
            this.state[key] = localStorage.getItem(key)
        }
    }

    saveState() {
        for(var key in this.state) {
            localStorage.setItem(key, this.state[key])
        }
    }

    bindEvents() {
        for(var event in this.events) {
            var eventName = this.events[event]
            var eventInfo = event.split(' ')
            var query = eventInfo[0]
            var event = eventInfo[1]
            if(this[eventName]) {
                this.el.find(query).on(event, this[eventName].bind(this))
            }
        }
        this.el.click(this.stopEvent.bind(this))
        this.el.mouseover(this.stopEvent.bind(this))
    }

    bindGlobalEvent() {
        $('body').mouseover(this.onGlobalMouseover.bind(this))
        $('body').click(this.onGlobalClick.bind(this))
    }

    onGlobalMouseover(e) {
        if(this.select) {
            var target = e.target
            this.state[this.select] = getElementUniqueSelector(target, style['ap-next'], style['ap-content'])
            e.stopPropagation()
            e.preventDefault()
        }
    }

    onGlobalClick(e) {
        if(this.select) {
            this.select = ''
            e.stopPropagation()
            e.preventDefault()
        }
    }

    stopEvent(e) {
        e.stopPropagation()
        e.preventDefault()        
    }
}