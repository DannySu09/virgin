(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/domCtrl.js":[function(require,module,exports){
;(function(doc){
    var body = doc.getElementsByTagName('body')[0];
    var sideBarCover = doc.getElementsByClassName('js-sideBarCover')[0];
    var mainContent = sideBarCover.getElementsByClassName('js-main-content')[0];
    var menuBtn = doc.getElementsByClassName('js-showSideBar')[0];
    var sidebar = doc.getElementsByClassName('js-sidebar')[0];
    var actionClass = Modernizr.csstransforms3d ? ' is-showSideBar' : ' is-showSideBar--old';

    var scrollCtrl = doc.getElementsByClassName('js-scrollCtrl')[0];
    var toTopBtn = doc.getElementsByClassName('js-toTop')[0];
    var transitionEvt = require('./modules/transitionend.js')(sideBarCover);
    var scroll2Top = require('./modules/scroll2Top.js');
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
            if(scrollCtrl.className.indexOf(' is-show') > -1) {
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
        scroll2Top(sideBarCover, 900);
    });

})(document);
},{"./modules/scroll2Top.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/modules/scroll2Top.js","./modules/transitionend.js":"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/modules/transitionend.js"}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/modules/scroll2Top.js":[function(require,module,exports){
;(function(){
    var animate = (function(){
        var action = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
        return function(runner){
            action.call(window, runner);
        };
    })();

    var scrollTop = function(component, nextStep){
        if(nextStep === undefined) {
            return component.scrollY ? component.scrollY : component.scrollTop;
        } else if(nextStep <= 0) {
            component.scrollTo ? component.scrollTo(0, 0):component.scrollTop = 0;
            return 0;
        } else {
            component.scrollTo ? component.scrollTo(0, nextStep) : component.scrollTop = nextStep;
            return nextStep;
        }
    };

    var speedConduct = function(originSpeed, time, cur, total){
        var method = Math.sin;
        var PI = Math.PI;
        return originSpeed * method(PI * (total-cur)/total) + 1;
    };

    var scroll2Top = function(component, time){
        var DEFAULT_TIME = 1000;
        if(component == null) {
            console.error('You must assign a dom node object or window object as the first param.');
            return;
        }
        if(time == null) {
            time = DEFAULT_TIME;
        }
        console.log(time);
        var originY = scrollTop(component);
        var currentY = originY;
        var originSpeed = originY / (time / 60);
        var currentSpeed;
        (function operate(){
            currentSpeed = speedConduct(originSpeed, time, currentY, originY);
            currentY -= currentSpeed;
            if(scrollTop(component, currentY) !== 0) {
                animate(operate);
            }
        })();
    };

    module.exports = scroll2Top;
})();
},{}],"/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/modules/transitionend.js":[function(require,module,exports){
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
},{}]},{},["/Users/sunaiwen/ffun/octopress/.themes/virgin/source/javascript/domCtrl.js"]);
