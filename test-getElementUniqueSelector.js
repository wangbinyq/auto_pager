QUnit.module('getElementUniqueSelector')

QUnit.test('Must One Element', function(assert) {
    [{
        innerHTML: `
            <div id="test1"></div>
        `,
        testQuery: '#test1'
    }, {
        innerHTML: `
            <div class="test">
                <div></div>
                <span></span>
            </div>
        `,
        testQuery: 'span'
    }, {
        innerHTML: `
            <div class="test">
                <div><span></span><span></span></div>
            </div>
        `,
        testQuery: 'span:nth-child(2)'
    }, {
        innerHTML: `
            <div class="test">
                <div></div>
                <div><span></span><span></span></div>
            </div>
        `,
        testQuery: 'span:nth-child(2)'        
    }].forEach((testCase) => { 
        var el = document.createElement('div')
        el.id = 'test'
        el.innerHTML = testCase.innerHTML
        var testEl = el.querySelector(testCase.testQuery)
        var selector = getElementUniqueSelector(testEl)
        assert.equal(el.querySelectorAll(selector).length, 1, selector)
    })
})
