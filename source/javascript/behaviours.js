(function(doc){
    var sideBarCover = document.getElementsByClassName('js-sideBarCover')[0];
    var menuBtn = document.getElementsByClassName('js-showSideBar')[0];
    var sidebar = document.getElementsByClassName('js-sidebar')[0];
    var detect3D = function(){
        if( !! (window.WebKitCSSMatrix && 'm11' in new WebKitCSSMatrix())) {
            return true
        }
        return false;

    };
    var actionClass = detect3D() ? 'is-showSideBar' : 'is-showSideBar--oldAndroid';
    var transitionHandler = function(){
        sidebar.style.zIndex = 1;
        sideBarCover.removeEventListener('transitionend', transitionHandler);
        sideBarCover.removeEventListener('webkitTransitionend', transitionHandler);
    };
    menuBtn.addEventListener('click', function(e){
        e.preventDefault();
        var coverClassList = sideBarCover.classList;
        if(coverClassList.contains(actionClass)) {
            coverClassList.remove('is-showSideBar');
            sidebar.style.zIndex = -1;
        } else {
            coverClassList.add('is-showSideBar');
            sideBarCover.addEventListener('transitionend', transitionHandler);
            sideBarCover.addEventListener('webkitTransitionend', transitionHandler);
        }
    });
})(document);