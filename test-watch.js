QUnit.module('watch')

QUnit.test('watch', function(assert) {
    var obj = {}, a
    var unwatcha = watch(obj, 'a', function(){
        a = obj.a
    })
    obj.a = 100
    assert.equal(a, 100, 'can watch prop change')

    var b;
    var unwatchb = watch(obj, 'a', function(){
        b = obj.a
    })
    obj.a = 200
    assert.equal(a, 200, 'can watch multiple times b')
    assert.equal(b, 200, 'can watch multiple times b')

    unwatchb()
    obj.a = 20
    assert.equal(a, 20, 'unwatch b not affect a')
    assert.equal(b, 200, 'unwatchb prop change')

    unwatcha()
    obj.a = 10
    assert.equal(a, 20, 'unwatcha prop change')

    assert.equal(obj.$$callbacks.a, undefined, 'unwatch remove from $$callbacks')
})
