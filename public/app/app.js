angular.module('userApp', ['appRoutes', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'newsServices', 'emailController', 'managementController', 'newsControllers'])

.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptors');
});
