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


        this.bindEvents()
        this.update()
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

    update(show = true) {
        $('.' + style['ap-content']).removeClass(style['ap-content'])
        $('.' + style['ap-next']).removeClass(style['ap-next'])

        if(show) {
            $(this.model.get('content')).addClass(style['ap-content'])
            $(this.model.get('next')).addClass(style['ap-next'])
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
            this.select = ''
            stopEvent(e)
        })
        this.$el.click(stopEvent)
        $body.mouseover(debounce((e) => {
            if(this.select) {
                const target = e.target
                this.model.set(this.select, getElementUniqueSelector(target, style['ap-next'], style['ap-content']))
                stopEvent(e)
            }
        }))
        this.$el.mouseover(debounce(stopEvent))
        $(window).scroll(debounce((e) => {
            if(this.href && this.$ap_content && this.$ap_next && this.model.get('auto')) {
                if(this.$ap_next.visible() && !this.loading) {
                    this.loading = true
                    $.get(this.href).then((res) => {
                        console.log(this.model.get('content'), this.model.get('next'))
                        const $res = $(res)
                        const $content = $res.filter(this.model.get('content'))
                        const $next = $res.filter(this.model.get('next'))
                        console.log(this.href)
                        this.href = $next.getHref()
                        console.log(this.href)
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
        this.$el.hide()
        this.select = ''
        this.model.save()
        this.update(false)
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