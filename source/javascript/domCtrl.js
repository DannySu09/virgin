;(function(doc){
    var body = doc.getElementsByTagName('body')[0];
    var sideBarCover = doc.getElementsByClassName('js-sideBarCover')[0];
    var mainContent = sideBarCover.getElementsByClassName('js-main-content')[0];
    var menuBtn = doc.getElementsByClassName('js-showSideBar')[0];
    var sidebar = doc.getElementsByClassName('js-sidebar')[0];
    var actionClass = Modernizr.csstransforms3d ? ' is-showSideBar' : ' is-showSideBar--old';

    var scrollCtrl = doc.getElementsByClassName('js-scrollCtrl')[0];
    var toTopBtn = doc.getElementsByClassName('js-toTop')[0];
//    inspire by https://github.com/EvandroLG/transitionEnd/blob/master/src/transition-end.js
    var transitionEvt = function(){
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
    }();

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

    function scrollTop(component, nextStep){
        if(nextStep === undefined) {
            return component.scrollY ? component.scrollY : component.scrollTop;
        } else if(nextStep <= 0) {
            component.scrollTo ? component.scrollTo(0, 0):component.scrollTop = 0;
            return 0;
        } else {
            component.scrollTo ? component.scrollTo(0, nextStep) : component.scrollTop = nextStep;
            return nextStep;
        }
    }

    function scroll2Top(component, speed, style){
        if(component === undefined) {
            console.error('You must assign a dom node object or window object as the first param.');
            return;
        }
        if(typeof speed !== 'number') {
            if(typeof speed === 'string' && speed.match(/ease|steady/).length !== 0) {
                style = speed
            }
            speed = 300;
        }
        if(style === undefined) {
            style = 'steady';
        }
        var originY = scrollTop(component);
        var currentY = originY;
        var currentSpeed;
        var operate = function(){
            currentSpeed = speedConduct(speed, style, currentY, originY);
            currentY -= currentSpeed;
            if(scrollTop(component, currentY) !== 0) {
                setTimeout(operate, 1000/60);
            }
        };
        operate();
    }

    function speedConduct(originSpeed, style, cur, total){
        var method;
        var resultSpeed;
        var pi = Math.PI;
        switch (style) {
            case 'ease-in':
                method = Math.cos;
                break;
            case 'ease-out':
                method = Math.sin;
                break;
            case 'steady':
                return resultSpeed = originSpeed;
            default :
                method = Math.cos;
        }
        resultSpeed = originSpeed * method((pi/2)*(total-cur)/total);
        return resultSpeed > 20? resultSpeed : 20;
    }

    toTopBtn.addEventListener('click', function(e){
        e.preventDefault();
        scroll2Top(sideBarCover, 400, 'ease-in');
    });

})(document);