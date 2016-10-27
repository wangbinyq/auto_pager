import $ from 'jquery'
import { getElementUniqueSelector } from '../src/utils'

describe('getElementUniqueSelector', () => {
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
        it(testCase.testQuery, () => {
            var el = document.createElement('div')
            el.id = 'test'
            el.innerHTML = testCase.innerHTML
            var testEl = el.querySelector(testCase.testQuery)
            var selector = getElementUniqueSelector(testEl)
            expect(el.querySelectorAll(selector).length).toBe(1)
        })
    })
})