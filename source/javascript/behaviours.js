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
        var coverClassList = sideBarCover.classList;
        if(coverClassList.contains(actionClass)) {
            coverClassList.remove(actionClass);
            sidebar.style.zIndex = -1;
        } else {
            coverClassList.add(actionClass);
            sideBarCover.addEventListener(transitionEvt, transitionHandler);
        }
    });
})(document);