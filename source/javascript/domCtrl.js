(function(doc){
    var body = doc.getElementsByTagName('body')[0];
    var sideBarCover = doc.getElementsByClassName('js-sideBarCover')[0];
    var mainContent = sideBarCover.getElementsByClassName('js-main-content')[0];
    var menuBtn = doc.getElementsByClassName('js-showSideBar')[0];
    var sidebar = doc.getElementsByClassName('js-sidebar')[0];
    var actionClass = Modernizr.csstransforms3d ? ' is-showSideBar' : ' is-showSideBar--old';

    var scrollCtrl = doc.getElementsByClassName('js-scrollCtrl')[0];
    var toTopBtn = doc.getElementsByClassName('js-toTop')[0];
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

    var raf = (function(){
        var prefixed = window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
        return function(){
            var id = prefixed.apply(window, arguments);
            return id;
        }
    })();

    var cancelRaf = (function() {
        var prefixed = window.cancelAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            function (id) {
                clearTimeout(id);
            };
        return function (id) {
            prefixed.apply(window, arguments);
        };
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
            sidebar.scrollTop = 0;
            sideBarCover.className += actionClass;
            sideBarCover.addEventListener(transitionEvt, transitionHandler);
        }
    });

    sideBarCover.addEventListener('scroll', function(){
        var bodyHeight = mainContent.clientHeight;
        if(sideBarCover.scrollTop >= bodyHeight*2/7) {
            if(scrollCtrl.className.indexOf(' is-show') > -1){
                return;
            }
            scrollCtrl.className += ' is-show';
        } else {
            if(scrollCtrl.className.indexOf(' is-show') === -1) {
                return;
            }
            var className = scrollCtrl.className;
            var index = className.indexOf(' is-show');
            scrollCtrl.className = className.slice(0, index) + className.slice(index + ' is-show'.length);
        }
    });


    toTopBtn.addEventListener('click', function(e){
        e.preventDefault();
        var rafId;
        var speed = 110;
        function toTop (){
            var scrollY = sideBarCover.scrollTop;
            rafId && cancelRaf(rafId);
            scrollY -= speed;
            if(scrollY <=0 ) {
                sideBarCover.scrollTop = 0;
                return;
            }
            sideBarCover.scrollTop = scrollY;
            rafId = raf(toTop);
        }
        toTop();
    });

})(document);