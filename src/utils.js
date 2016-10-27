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