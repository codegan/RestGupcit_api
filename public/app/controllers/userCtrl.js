angular.module('userControllers', ['userServices'])

.controller('regCtrl', function($http, $location, $timeout, User){

	var app = this;

	this.regUser = function(regData, valid){
		app.loading = true;
		app.errorMsg = false;
        app.successMsg = false;
        app.disabled = true;
		if(valid){
			User.create(app.regData).then(function(data){
			console.log(data.data.success);
			console.log(data.data.message);
            if (data.data.success) {
				app.loading = false;
				app.successMsg = data.data.message += "...redirect";
				$timeout(function() {
					$location.path('/');
				}, 2000);
            } else {
                app.disabled = false;
				app.loading = false;
				app.errorMsg = data.data.message;
			}
		});
        } else {
            app.disabled = false;
			app.loading = false;
			app.errorMsg = 'Please ensure from is filled our properly';
		}
	};



	this.checkUsername = function(regData){
		app.checkingUsername = true;
		app.usernameMsg = false;
		app.usernameInvalid = false;

		User.checkUsername(app.regData).then(function(data){
			if(data.data.success){
				app.usernameMsg = data.data.message;
				app.usernameInvalid = false;
				app.checkingUsername = false;
			}else{
				app.usernameMsg = data.data.message;
				app.usernameInvalid = true; 
				app.checkingUsername = false;
			}
		});
	}

	this.checkEmail = function(regData){
		app.checkingEmail = true;
		app.emailMsg = false;
		app.emailInvalid = false;

		User.checkEmail(app.regData).then(function(data){
			if(data.data.success){
				app.emailMsg = data.data.message;
				app.emailInvalid = false;
				app.checkingEmail = false;
			}else{
				app.emailMsg = data.data.message;
				app.emailInvalid = true; 
				app.checkingEmail = false;
			}
		});
	}
	
})



.directive('match', function() {
    return {
        restrict: 'A', // Restrict to HTML Attribute
        controller: function($scope) {
            $scope.confirmed = false; // Set matching password to false by default

            // Custom function that checks both inputs against each other               
            $scope.doConfirm = function(values) {
                // Run as a loop to continue check for each value each time key is pressed
                values.forEach(function(ele) {
                    // Check if inputs match and set variable in $scope
                    if ($scope.confirm == ele) {
                        $scope.confirmed = true; // If inputs match
                    } else {
                        $scope.confirmed = false; // If inputs do not match
                    }
                });
            };
        },

        link: function(scope, element, attrs) {

            // Grab the attribute and observe it            
            attrs.$observe('match', function() {
                scope.matches = JSON.parse(attrs.match); // Parse to JSON
                scope.doConfirm(scope.matches); // Run custom function that checks both inputs against each other   
            });

            // Grab confirm ng-model and watch it           
            scope.$watch('confirm', function() {
                scope.matches = JSON.parse(attrs.match); // Parse to JSON
                scope.doConfirm(scope.matches); // Run custom function that checks both inputs against each other   
            });
        }
    };
})




.controller('twitterCtrl', function($routeParams, Auth, $location, $window){
    var app = this;
    app.errorMsg = false;
    app.disabled = true;
	if($window.location.pathname == '/twittererror'){
		app.errorMsg = 'twitter email not fund in database';
    } else if ($window.location.pathname == '/twitter/inactive/error') {
        app.expired = true;
        app.errorMsg = 'Accaunt is not actived check your email for activation link';
    } else{
		Auth.facebook($routeParams.token);
		$location.path('/');
	}	
})

.controller('facebookCtrl', function($routeParams, Auth, $location, $window){
    var app = this;
    app.errorMsg = false;
    app.disabled = true;
	if($window.location.pathname == '/facebookerror'){
		app.errorMsg = 'facebook email not fund in database';
    } else if ($window.location.pathname == '/facebook/inactive/error') {
        app.expired = true;
        app.errorMsg = 'Accaunt is not actived check your email for activation link';
    } else {
		Auth.facebook($routeParams.token);
		$location.path('/');
	}	
})


.controller('googleCtrl', function($routeParams, Auth, $location, $window){
    var app = this;
    app.errorMsg = false;
    app.disabled = true;
	if($window.location.pathname == '/googleerror'){
		app.errorMsg = 'google email not fund in database';
    } else if ($window.location.pathname == '/google/inactive/error') {
        app.expired = true;
        app.errorMsg = 'Accaunt is not actived check your email for activation link';
    } else{
		Auth.facebook($routeParams.token);
		$location.path('/');
	}	
});