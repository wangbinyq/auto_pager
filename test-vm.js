;function createEl(name, key, value) {
    var el = document.createElement(name)
    el.dataset[key] = value
    return el
}

;function trigger(el, event) {
    var e = new Event(event)
    el.dispatchEvent(e)
}


QUnit.module('ViewModel')

QUnit.test('ViewModel', function(assert) {
    var el = createEl('div', 'value', 'a')
    var vm = new ViewModel(el, {
        data: {
            a: 'init'
        },
        methods: {
            changeData(value) {
                this.data.a = 'changed'
            }
        }
    })

    assert.equal(el.value, 'init', 'data binding')
    vm.changeData('changed')
    assert.equal(el.value, 'changed', 'value sync')
})

QUnit.test('value binding', function(assert) {
    var el = createEl('checkbox', 'value', 'a')
    var vm = new ViewModel(el, {
        data: {
            a: 'true'
        }
    })
    
    assert.equal(el.checked, true, 'value sync')
    el.checked = false
    trigger(el, 'change')
    assert.equal(vm.data.a, false, 'value update')
})

QUnit.test('html binding', function(assert) {
    var el = createEl('div', 'html', 'a')
    var vm = new ViewModel(el, {
        data: {
            a: 'Hello'
        }
    })

    assert.equal(el.innerHTML, 'Hello', 'init innerHTML')

    vm.data.a += ' World'
    assert.equal(el.innerHTML, 'Hello World', 'change innerHTML')
})

QUnit.test('show binding', function(assert) {
    var el = createEl('div', 'show', 'a')
    var vm = new ViewModel(el, {
        data: {
            a: 'true'
        }
    })

    assert.equal(el.style.display, '', 'true show')

    vm.data.a = false
    assert.equal(el.style.display, 'none', 'false hide')
})