import $ from 'jquery'
import { getElementUniqueSelector } from './utils'
import template from './template.ejs'
import style from './style.styl'

function getStyleName(_class, postfix) {
    return '.' + style[_class] + ' ' + postfix
}

export default class App {
    constructor() {
        this.model = {
            select: '',
            next: '',
            content: '',
            auto: false
        }
        this.events = {
            [getStyleName('select', 'click')]: 'changeSelect',
            [getStyleName('close', 'click')]: 'hide',
            [getStyleName('cancel', 'click')]: 'hide',
            'input[type="text"] change': 'changeContent',
            [getStyleName('ok', 'click')]: 'goAutoPage',
        }
        this.loadModel()
        this.render()
        this.bindEvents()
        this.bindGlobalEvent()
    }

    render() {
        if(this.el) {
            this.el.remove()
        }
        this.el = $(template({
            style,
            model: this.model
        }))
        $('body').append(this.el)
    }

    update() {

    }

    hide() {
        this.model.enable(false)
    }

    changeSelect(e) {
        var parent = $(e.target.parentNode)
        if(parent) {
            if(parent.hasClass(style.content)) {
                this.model.select = 'content'
            } else if (parent.hasClass(style.next)) {
                this.model.select = 'next'
            } else {
                this.model.select = ''
            }
        }
    }

    loadModel() {
        for(var key in this.model) {
            this.model[key] = localStorage.getItem(key)
        }
    }

    saveModel() {
        for(var key in this.model) {
            localStorage.setItem(key, this.model[key])
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
    }

    bindGlobalEvent() {
        $('body').mouseover(this.onGlobalMouseover.bind(this))
        $('body').click(this.onGlobalClick.bind(this))
    }

    onGlobalMouseover(e) {
        if(this.model.select) {
            var target = e.target
            this.model[this.model.select] = getElementUniqueSelector(target)
            this.update()
            e.stopPropagation()
            e.preventDefault()
        }
    }

    onGlobalClick(e) {
        if(this.model.select) {
            this.model.select = ''
            e.stopPropagation()
            e.preventDefault()
        }
    }

    stopEvent(e) {
        e.stopPropagation()
        e.preventDefault()        
    }

    debug() {
        console.debug(this.model)
    }
}