angular.module('newsControllers', [])

.controller('newsCtrl', function(News){
	var app = this;
    
    function getNews(){
        News.getNews().then(function(data) {
                app.news = data.data.news;
                console.log(data.data.news);
        });
    };
    getNews();
   
});