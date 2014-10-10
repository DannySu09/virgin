module.exports = function(testEle){
    var transitions = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'MozTransition'    : 'transitionend',
        'OTransition'      : 'oTransitionEnd otransitionend',
        'transition'       : 'transitionend'
    };

    for(var t in transitions){
        if(testEle.style[t] !== undefined){
            return transitions[t];
        }
    }
};