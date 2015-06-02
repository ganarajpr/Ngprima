function inlineAll(node){
    inlineWithPseudo(node);
    if(node.childNodes && node.childNodes.length){
        for( var i =0;i<node.childNodes.length;i++){
            inlineAll(node.childNodes[i]);
        }
    }
    if(node.removeAttribute){
        node.removeAttribute('class');
    }
}

function copyStylesFromRules(matchedCSS,node){
    if(matchedCSS && matchedCSS.length){
        for( var i =0;i<matchedCSS.length;i++){
            var currentRule = matchedCSS[i];
            var styleLength = currentRule.style.length;
            for( var j = 0;j < styleLength; j++){
                var whichStyle = currentRule.style[j];
                node.style[whichStyle] = currentRule.style[whichStyle];
            }
        }
    }
}

function createPsuedoElement(node,pseudo){
    var pseudoCss = getMatchedCSSRules(node,pseudo);
    var str = window.getComputedStyle(node, pseudo).getPropertyValue('content');
    var pseudoSpan = createSpan(str);
    copyStylesFromRules(pseudoCss,node);
    return pseudoSpan;
}

function inlineWithPseudo(node){
    var matchedCSS = getMatchedCSSRules(node);
    copyStylesFromRules(matchedCSS,node);

    var beforeSpan = createPsuedoElement(node,'::before');
    var afterSpan = createPsuedoElement(node,'::after');

    insertBefore(node,beforeSpan);
    insertAfter(node,afterSpan);
}



function createSpan(content){
    var span = document.createElement('span')
    span.innerHTML = content;
    return span;
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function insertBefore(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

function doAll(node){
    inlineAll(node);
    $('link').remove();
    $('style').remove();
}
