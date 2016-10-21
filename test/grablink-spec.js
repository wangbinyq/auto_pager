import {init, grabContents, grabNext} from '../src/grablink'

describe('init', () => {
    it('insert div to document', () => {
        init()
        const div = document.getElementById('autopager-content')
        expect(div).toEqual(jasmine.anything(document.HTMLNode))
    })
})

describe('grabContents', () => {
    
})