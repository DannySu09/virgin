(function(doc){
    var sideBarCover = document.getElementsByClassName('js-sideBarCover')[0];
    var menuBtn = document.getElementsByClassName('js-showSideBar')[0];
    menuBtn.addEventListener('click', function(e){
        e.preventDefault();
        var coverClassList = sideBarCover.classList;
        console.log(coverClassList);
        coverClassList.contains('is-showSideBar') ?
            coverClassList.remove('is-showSideBar'):
            coverClassList.add('is-showSideBar');
    });
})(document);