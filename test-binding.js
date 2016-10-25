QUnit.module('Binding')

QUnit.test('bind', function(assert) {
    var vm = { data: {a: 'init'}}
    var count = 0

    var binder = {
        bind: function(el) {
            el.value = 'bind'
        },
        sync: function(el, value) {
            el.value = value
            count++
        },
        value: function(el) {
            return el.value
        }
    }

    var binding = new Binding(vm, {}, 'a', binder)

    binding.bind() // count = 1
    assert.equal(binding.el.value, 'init', 'bind')

    binding.sync() // count = 2
    assert.equal(binding.el.value, vm.data.a, 'sync')

    assert.equal(binding.el.value, binding.value(), 'value get')

    binding.value('value') // count = 3
    assert.equal(vm.data.a, 'value', 'value set')

    vm.data.a = 'object' // count = 4
    assert.equal(binding.el.value, 'object', 'watch')
    assert.equal(count, 4, 'watch call sync')

    binding.unbind()
    vm.data.a = 'unbind'
    assert.equal(binding.el.value, 'object', 'unbind')
})