import $ from 'jquery'
import template from './template.ejs'
import style from './style.styl'
import Model from './model'
import { getElementUniqueSelector, debounce } from './utils'

function stopEvent(e) {
    e.stopPropagation()
    e.preventDefault()   
}

export default class View{
    constructor() {
        this.select = ''
        this.selectMode = false
        this.render()

        this.model = new Model({
            content: '',
            next: '',
            auto: false
        })

        this.model.on('content', () => {
            this.$content.val(this.model.get('content'))
            this.update()
        })
        this.model.on('next', () => {
            this.$next.val(this.model.get('next'))
            this.update()
        })
        this.model.load()


        this.update()

        if(this.model.get('auto')) {
            this.goAutoPage()
        }
        this.bindEvents()
    }

    render() {
        if(this.$el) {
            this.$el.remove()
        }
        this.$el = $(template({
            style,
        }))
        $('body').append(this.$el)
        this.$content = this.$('.' + style.content + ' input[type="text"]')
        this.$next = this.$('.' + style.next + ' input[type="text"]')
    }

    update() {
        const show = this.selectMode
        $('.' + style['ap-content']).removeClass(style['ap-content'])
        $('.' + style['ap-next']).removeClass(style['ap-next'])

        if(show) {
            $(this.model.get('content')).addClass(style['ap-content'])
            $(this.model.get('next')).addClass(style['ap-next'])
        }

        if(show) {
            this.$el.show()
        } else {
            this.$el.hide()
        }
    }

    bindEvents() {
        this.$content.change(() => {
            this.model.set('content', this.$content.val())
        })
        this.$next.change(() => {
            this.model.set('next', this.$next.val())
        })

        this.$('.' + style.content + ' .' + style.select).click(() => {
            this.select = 'content'
        })
        this.$('.' + style.next + ' .' + style.select).click(() => {
            this.select = 'next'
        })

        this.$('.' + style.cancel).click(this.close.bind(this))
        this.$('.' + style.close).click(this.close.bind(this))
        this.$('.' + style.ok).click(this.goAutoPage.bind(this))

        const $body = $('body')
        $body.click((e) => {
            if(this.selectMode) {
                this.select = ''
                stopEvent(e)
            }
            if(e.ctrlKey && e.altKey) {
                this.selectMode = true
                this.update()
            }
        })
        this.$el.click(stopEvent)
        $body.mouseover(debounce((e) => {
            if(this.select && this.selectMode) {
                const target = e.target
                this.model.set(this.select, getElementUniqueSelector(target, style['ap-next'], style['ap-content']))
                stopEvent(e)
            }
        }))
        this.$el.mouseover(debounce(stopEvent))
        $(window).scroll(debounce((e) => {
            if(this.href && this.$ap_content && this.$ap_next && this.model.get('auto') && !this.selectMode) {
                if(this.$ap_next.visible() && !this.loading) {
                    this.loading = true
                    $.get(this.href).then((res) => {
                        console.log(this.model.get('content'), this.model.get('next'))
                        const $res = $('<html>').html(res)
                        const $content = $res.find(this.model.get('content'))
                        const $next = $res.find(this.model.get('next'))
                        console.log('get', this.href)
                        this.href = $next.getHref()
                        console.log('next', this.href)
                        this.$ap_content.after($content)
                        this.$ap_content = $content
                        this.loading = false
                    })
                    stopEvent(e)
                }                
            }
        }))
    }

    close() {
        this.selectMode = false
        this.select = ''
        this.model.save()
        this.update()
    }

    goAutoPage() {
        this.$ap_content = $(this.model.get('content'))
        this.$ap_next = $(this.model.get('next'))
        this.href = this.$ap_next.attr('href')
        this.model.set('auto', true)
        this.close()
    }

    $(...args) {
        return this.$el.find(...args)
    }
}