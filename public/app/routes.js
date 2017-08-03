 var app = angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider){
	$routeProvider

	.when('/', {
		templateUrl: 'app/views/pages/home.html'
	})

	.when('/news',{
			templateUrl: 'app/views/pages/news.html',
			controller: 'newsCtrl',
			controllerAs: 'newsget'
		})	


	.when('/register', {
		templateUrl: 'app/views/pages/users/register.html',
		controller: 'regCtrl',
		controllerAs: 'register',
		authenticated: false
	})

	.when('/login', {
		templateUrl: 'app/views/pages/users/login.html',
		authenticated: false
	})

	.when('/logout', {
		templateUrl: 'app/views/pages/users/logout.html',
		authenticated: true
	})

	.when('/profile', {
		templateUrl: 'app/views/pages/users/profile.html',
		authenticated: true
	})

	.when('/facebook/:token', {
		templateUrl: 'app/views/pages/users/social/social.html',
		controller: 'facebookCtrl',
		controllerAs: 'facebook',
		authenticated: false
	})

	.when('/twitter/:token', {
		templateUrl: 'app/views/pages/users/social/social.html',
		controller: 'twitterCtrl',
		controllerAs: 'twitter',
		authenticated: false
	})

	.when('/facebookerror', {
		templateUrl: 'app/views/pages/users/login.html',
		controller: 'facebookCtrl',
		controllerAs: 'facebook',
		authenticated: false
	})

	.when('/twittererror', {
		templateUrl: 'app/views/pages/users/login.html',
		controller: 'twitterCtrl',
		controllerAs: 'twitter ',
		authenticated: false
	})

	.when('/google/:token', {
		templateUrl: 'app/views/pages/users/social/social.html',
		controller: 'googleCtrl',
		controllerAs: 'google',
		authenticated: false
	})

	.when('/googleerror', {
		templateUrl: 'app/views/pages/users/login.html',
		controller: 'googleCtrl',
		controllerAs: 'google',
		authenticated: false
        })


    .when('/googleerror', {
		templateUrl: 'app/views/pages/users/login.html',
		controller: 'googleCtrl',
		controllerAs: 'google',
		authenticated: false
	})

      .when('/activate/:token', {
        templateUrl: 'app/views/pages/users/activation/activate.html',
        controller: 'emailCtrl',
        controllerAs: 'email',
		authenticated: false
    })

      .when('/facebook/inactive/error', {
        templateUrl: 'app/views/pages/users/login.html',
        controller: 'facebookCtrl',
        controllerAs: 'facebook',
        authenticated: false
        })

        .when('/google/inactive/error', {
            templateUrl: 'app/views/pages/users/login.html',
            controller: 'googleCtrl',
            controllerAs: 'google',
            authenticated: false
        })
        .when('/twitter/inactive/error', {
            templateUrl: 'app/views/pages/users/login.html',
            controller: 'twitterCtrl',
            controllerAs: 'twitter',
            authenticated: false
        })

        .when('/resend', {
            templateUrl: 'app/views/pages/users/activation/resend.html',
            controller: 'resendCtrl',
            controllerAs: 'resend',
			authenticated: false
        })

        .when('/resetusername', {
            templateUrl: 'app/views/pages/users/reset/username.html',
            controller: 'usernameCtrl',
            controllerAs: 'username',
            authenticated: false
        })

		.when('/resetpassword', {
			templateUrl: 'app/views/pages/users/reset/password.html',
			controller: 'passwordCtrl',
			controllerAs: 'password',
			authenticated: false
		})

		.when('/reset/:token', {
			templateUrl: 'app/views/pages/users/reset/newpassword.html',
			controller: 'resetCtrl',
			controllerAs: 'reset',
			authenticated: false
		})

		.when('/management',{
			templateUrl: 'app/views/pages/management/management.html',
			controller: 'managementCtrl',
			controllerAs: 'management',
			authenticated: true,
			permission: ['admin', 'moderator']
		})

		.when('/edit/:id',{
			templateUrl: 'app/views/pages/management/edit.html',
			controller: 'editCtrl',
			controllerAs: 'edit',
			authenticated: true,
			permission: ['admin', 'moderator']
		})

		.when('/search',{
			templateUrl: 'app/views/pages/management/search.html',
			controller: 'managementCtrl',
			controllerAs: 'management',
			authenticated: true,
			permission: ['admin', 'moderator']
		})
	.otherwise({ redirectTo: '/'});

	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
});




app.run(['$rootScope', 'Auth', '$location', 'User', function($rootScope, Auth, $location, User) {

    // Check each time route changes    
    $rootScope.$on('$routeChangeStart', function(event, next, current) {

        // Only perform if user visited a route listed above
        if (next.$$route !== undefined) {
            // Check if authentication is required on route
            if (next.$$route.authenticated === true) {
                // Check if authentication is required, then if permission is required
                if (!Auth.isLoggedIn()) {
                    event.preventDefault(); // If not logged in, prevent accessing route
                    $location.path('/'); // Redirect to home instead
                } else if (next.$$route.permission) {
                    // Function: Get current user's permission to see if authorized on route
                    User.getPermission().then(function(data) {
                        // Check if user's permission matches at least one in the array
                        if (next.$$route.permission[0] !== data.data.permission) {
                            if (next.$$route.permission[1] !== data.data.permission) {
                                event.preventDefault(); // If at least one role does not match, prevent accessing route
                                $location.path('/'); // Redirect to home instead
                            }
                        }
                    });
                }
            } else if (next.$$route.authenticated === false) {
                // If authentication is not required, make sure is not logged in
                if (Auth.isLoggedIn()) {
                    event.preventDefault(); // If user is logged in, prevent accessing route
                    $location.path('/profile'); // Redirect to profile instead
                }
            }
        }
    });
}]);



