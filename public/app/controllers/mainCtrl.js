angular.module('mainController', ['authServices', 'userServices', 'newsServices'])

    .controller('mainCtrl', function (Auth, $timeout, $location, $rootScope, $window, $interval, $route, User, AuthToken){
	var app = this;

	app.loadme = false;

app.checkSession = function() {
			// Only run check if user is logged in
			if (Auth.isLoggedIn()) {
				app.checkingSession = true; // Use variable to keep track if the interval is already running
				// Run interval ever 30000 milliseconds (30 seconds) 
				var interval = $interval(function() {
					var token = $window.localStorage.getItem('token'); // Retrieve the user's token from the client local storage
					// Ensure token is not null (will normally not occur if interval and token expiration is setup properly)
					if (token === null) {
						$interval.cancel(interval); // Cancel interval if token is null
					} else {
						// Parse JSON Web Token using AngularJS for timestamp conversion
						self.parseJwt = function(token) {
							var base64Url = token.split('.')[1];
							var base64 = base64Url.replace('-', '+').replace('_', '/');
							return JSON.parse($window.atob(base64));
						}
						var expireTime = self.parseJwt(token); // Save parsed token into variable
						var timeStamp = Math.floor(Date.now() / 1000); // Get current datetime timestamp
						var timeCheck = expireTime.exp - timeStamp; // Subtract to get remaining time of token
						// Check if token has less than 30 minutes till expiration
						if (timeCheck <= 1800) {
							showModal(1); // Open bootstrap modal and let user decide what to do
							$interval.cancel(interval); // Stop interval
						}
					}
				}, 30000);
			}
		};

		app.checkSession(); // Ensure check is ran check, even if user refreshes

		// Function to open bootstrap modal		
		var showModal = function(option) {
			app.choiceMade = false; // Clear choiceMade on startup
			app.modalHeader = undefined; // Clear modalHeader on startup
			app.modalBody = undefined; // Clear modalBody on startup
			app.hideButton = false; // Clear hideButton on startup

			// Check which modal option to activate	(option 1: session expired or about to expire; option 2: log the user out)		
			if (option === 1) {
				app.modalHeader = 'Timeout Warning'; // Set header
				app.modalBody = 'Your session will expired in 30 minutes. Would you like to renew your session?'; // Set body
				$("#myModal").modal({ backdrop: "static" }); // Open modal
				// Give user 10 seconds to make a decision 'yes'/'no'
				$timeout(function() {
					if (!app.choiceMade) app.endSession(); // If no choice is made after 10 seconds, select 'no' for them
				}, 10000);
			} else if (option === 2) {
				app.hideButton = true; // Hide 'yes'/'no' buttons
				app.modalHeader = 'Logging Out'; // Set header
				$("#myModal").modal({ backdrop: "static" }); // Open modal
				// After 1000 milliseconds (2 seconds), hide modal and log user out
				$timeout(function() {
					Auth.logout(); // Logout user
					$location.path('/logout'); // Change route to clear user object
					hideModal(); // Close modal
				}, 2000);
			}
		};

		// Function that allows user to renew their token to stay logged in (activated when user presses 'yes')
		app.renewSession = function() {
			app.choiceMade = true; // Set to true to stop 10-second check in option 1
			// Function to retrieve a new token for the user
			User.renewSession(app.username).then(function(data) {
				// Check if token was obtained
				if (data.data.success) {
					AuthToken.setToken(data.data.token); // Re-set token
					app.checkSession(); // Re-initiate session checking
				} else {
					app.modalBody = data.data.message; // Set error message
				}
			});
			hideModal(); // Close modal
		};

		// Function to expire session and logout (activated when user presses 'no)
		app.endSession = function() {
			app.choiceMade = true; // Set to true to stop 10-second check in option 1
			hideModal(); // Hide modal
			// After 1 second, activate modal option 2 (log out)
			$timeout(function() {
				showModal(2); // logout user
			}, 1000);
		};

		// Function to hide the modal
		var hideModal = function() {
			$("#myModal").modal('hide'); // Hide modal once criteria met
		};


    $rootScope.$on('$routeChangeStart', function () {

        if (!app.checkSession) app.checkSession();

		if(Auth.isLoggedIn()){
			console.log('Success User is logged in');
			app.isLoggedIn = true;
			Auth.getUser().then(function(data){
				app.username = data.data.username;
				app.useremail = data.data.email;
				console.log(data.data.username);

				User.getPermission().then(function(data) {
                    if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
                        app.authorized = true; // Set user's current permission to allow management
                        app.loadme = true; // Show main HTML now that data is obtained in AngularJS
                    } else {
                        app.loadme = true; // Show main HTML now that data is obtained in AngularJS
                    }
                });

				app.loadme = true;
			});
		}else{
			console.log('Failure: User is NOT logged in');
			app.isLoggedIn = false;
			app.username = '';
			app.loadme = true;
		}
		if($location.hash() == '_=_') $location.hash(null);
	});

    this.facebook = function () {
        app.disabled = true;
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
	};

    this.twitter = function () {
        app.disabled = true;
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/twitter';
	};

    this.google = function () {
        app.disabled = true;
		$window.location = $window.location.protocol + '//' + $window.location.host + '/auth/google';
	};

	this.dbLogin = function(loginData){
		app.loading = true;
		app.errorMsg = false;
        app.successMsg = false;
        app.expired = false;
        app.disabled = true;
		Auth.login(app.loginData).then(function(data){
			console.log(data.data.success);
			console.log(data.data.message);
			if(data.data.success){
				app.loading = false;
				app.successMsg = data.data.message += "...redirect";
				$timeout(function() {
					$location.path('/');
					app.loginData = '';
                    app.successMsg = false;
                    app.disabled = false;
                    app.checkSession();
				}, 2000);
            } else {
                if (data.data.expired) {
                    app.expired = true;
                    app.loading = false;
                    app.errorMsg = data.data.message;
                } else {
                    app.disabled = true;
                    app.loading = false;
                    app.errorMsg = data.data.message;
                }
			}
		});
	};

	app.logout = function(){
		showModal(2);
	};
  
});








