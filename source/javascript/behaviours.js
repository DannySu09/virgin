(function(doc){
    var sideBarCover = document.getElementsByClassName('js-sideBarCover')[0];
    var menuBtn = document.getElementsByClassName('js-showSideBar')[0];
    var sidebar = document.getElementsByClassName('js-sidebar')[0];
    var actionClass = Modernizr.csstransforms3d ? 'is-showSideBar' : 'is-showSideBar--old';
//    inspire by https://github.com/EvandroLG/transitionEnd/blob/master/src/transition-end.js
    var transitionEvt = (function(){
        var transitions = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition'    : 'transitionend',
            'OTransition'      : 'oTransitionEnd otransitionend',
            'transition'       : 'transitionend'
        };

        for(var t in transitions){
            if(sideBarCover.style[t] !== undefined){
                return transitions[t];
            }
        }
    })();
    var transitionHandler = function(){
        sidebar.style.zIndex = 1;
        sideBarCover.removeEventListener(transitionEvt, transitionHandler);
    };
    menuBtn.addEventListener('click', function(e){
        e.preventDefault();
        var className = sideBarCover.className;
        var index = className.indexOf(actionClass);
        if(index > -1) {
            sideBarCover.className = className.slice(0, index) + className.slice(index+actionClass.length);
            sidebar.style.zIndex = -1;
        } else if(index <= -1) {
            sideBarCover.className += (' '+actionClass);
            sideBarCover.addEventListener(transitionEvt, transitionHandler);
        }
    });
})(document);