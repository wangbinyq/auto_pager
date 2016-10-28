import $ from 'jquery'


/*--------- getElementUniqueSelector ----------*/
/*
modify from http://www.timvasil.com/blog14/post/2014/02/24/Build-a-unique-selector-for-any-DOM-element-using-jQuery.aspx 
*/

export function getElementUniqueSelector(el, nextClassName, contentClassName) {
    var tagName = el.tagName
    if(!tagName) {
        return ''
    }
    var id = el.id
    if(id) {
        return '#' + id
    }

    var classSelector = Array.prototype.filter.call(el.classList, function(className) {
        return className !== nextClassName && className !== contentClassName
    }).map(function(className) {
        return '.' + className
    }).join('')

    var selector
    var parent = el.parentNode
    var siblings = parent.children
    var needParent = false
    if(classSelector && parent.querySelectorAll(classSelector).length === 1) {
        selector = classSelector
    } else if (parent.querySelectorAll(tagName).length === 1) {
        selector = tagName
    } else {
        var nth = Array.prototype.indexOf.call(siblings, el) + 1
        selector = ':nth-child(' + nth + ')'
        needParent = true
    }

    if(!needParent) {
        for(var ancestor = parent.parentNode; ancestor && ancestor.querySelectorAll(selector).length === 1;
            parent = ancestor, ancestor = ancestor.parentNode) {
            if(ancestor === null) {
                return selector
            }
        }
    }

    var parentSelector = getElementUniqueSelector(parent)
    if(parentSelector && needParent) {
        return (parentSelector + ' > ' + selector).trim()
    } else {
        return (parentSelector + ' ' + selector).trim()
    }
}

export function debounce(fn, timeout = 41) {
    let timeoutId
    return (...args) => {
        if(timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(fn(...args), timeout)
    }
}

(function($){

    /**
     * Copyright 2012, Digital Fusion
     * Licensed under the MIT license.
     * http://teamdf.com/jquery-plugins/license/
     *
     * @author Sam Sehnert
     * @desc A small plugin that checks whether elements are within
     *       the user visible viewport of a web browser.
     *       only accounts for vertical position, not horizontal.
     */
    var $w = $(window);
    $.fn.visible = function(partial,hidden,direction){

        if (this.length < 1)
            return;

        var $t        = this.length > 1 ? this.eq(0) : this,
            t         = $t.get(0),
            vpWidth   = $w.width(),
            vpHeight  = $w.height(),
            direction = (direction) ? direction : 'both',
            clientSize = hidden === true ? t.offsetWidth * t.offsetHeight : true;

        if (typeof t.getBoundingClientRect === 'function'){

            // Use this native browser method, if available.
            var rec = t.getBoundingClientRect(),
                tViz = rec.top    >= 0 && rec.top    <  vpHeight,
                bViz = rec.bottom >  0 && rec.bottom <= vpHeight,
                lViz = rec.left   >= 0 && rec.left   <  vpWidth,
                rViz = rec.right  >  0 && rec.right  <= vpWidth,
                vVisible   = partial ? tViz || bViz : tViz && bViz,
                hVisible   = partial ? lViz || rViz : lViz && rViz;

            if(direction === 'both')
                return clientSize && vVisible && hVisible;
            else if(direction === 'vertical')
                return clientSize && vVisible;
            else if(direction === 'horizontal')
                return clientSize && hVisible;
        } else {

            var viewTop         = $w.scrollTop(),
                viewBottom      = viewTop + vpHeight,
                viewLeft        = $w.scrollLeft(),
                viewRight       = viewLeft + vpWidth,
                offset          = $t.offset(),
                _top            = offset.top,
                _bottom         = _top + $t.height(),
                _left           = offset.left,
                _right          = _left + $t.width(),
                compareTop      = partial === true ? _bottom : _top,
                compareBottom   = partial === true ? _top : _bottom,
                compareLeft     = partial === true ? _right : _left,
                compareRight    = partial === true ? _left : _right;

            if(direction === 'both')
                return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop)) && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
            else if(direction === 'vertical')
                return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop));
            else if(direction === 'horizontal')
                return !!clientSize && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
        }
    };

    $.fn.getHref = function() {
        const href = $(this).attr('href')
        if(href.indexOf('javascript:') === 0) {
            return ''
        }
        return href
    }

})($);

