import {init, grabContents, grabNext} from '../src/grablink'

describe('init', () => {
    it('insert div to document', () => {
        init()
        const div = document.getElementById('-autopager')
        expect(div).toEqual(jasmine.anything(document.HTMLNode))
    })

    it('has content', () => {
        
    })
})

describe('grabContents', () => {
    
})