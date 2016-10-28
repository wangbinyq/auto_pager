export default class Model{

    constructor(obj) {
        this.obj = obj || {}
        this.cbs = {}
    }

    get(key) {
        return this.obj[key]
    }

    set(key, value) {
        if(this.obj[key] !== value) {
            this.obj[key] = value
            this.trigger(key)
        }
    }

    load() {
        for(var key in this.obj) {
            this.set(key, localStorage.getItem(key))
        }
    }

    save() {
        for(var key in this.obj) {
            localStorage.setItem(key, this.get(key))
        }
    }

    on(key, fn) {
        const cbs = this.cbs[key] = this.cbs[key] || []
        cbs.push(fn) 
    }

    off(key, fn) {
        if(fn) {
            const cbs = this.cbs[key] = this.cbs[key] || []
            const index = cbs.indexOf(fn)
            if(index !== -1) {
                cbs.splice(index, 1)
            }
            if(cbs.length === 0) {
                delete this.cbs[key]
            }
        } else {
            delete this.cbs[key]
        }
    }

    trigger(key) {
        const cbs = this.cbs[key]
        if(cbs) {
            cbs.forEach(cb => {
                cb()
            })
        }
    }
}