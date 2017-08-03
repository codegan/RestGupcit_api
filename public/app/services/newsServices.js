angular.module('newsServices', [])

.factory('News', function($http){
	var newsFactory = {};

    newsFactory.getNews = function(){
        return $http.get('/api/news');
    };

	return newsFactory;
});