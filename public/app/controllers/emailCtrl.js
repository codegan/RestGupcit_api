angular.module('emailController', ['userServices'])

    .controller('emailCtrl', function ($routeParams, User, $timeout, $location) {

        app = this;

        User.activateAccount($routeParams.token).then(function (data) {
            app.successMsg = false;
            app.errorMsg = false;
            if (data.data.success) {
                app.successMsg = data.data.message + '....Redirecting';
                $timeout(function () {
                    $location.path('/login');
                }, 2000);
            } else {
                app.errorMsg = data.dada.message + '....Redirecting';
                $timeout(function () {
                    $location.path('/login');
                }, 2000);
            }
        });
    })

    .controller('resendCtrl', function (User) {
        app = this;
        app.checkCredentials = function (loginData) {
            app.disabled = true;
            app.errorMsg = false;
            app.successMsg = false;
            User.checkCredentials(app.loginData).then(function (data) {
                if (data.data.success) {

                    User.resendLink(app.loginData).then(function (data) {
                        if (data.data.success) {
                            app.successMsg = data.data.message;
                        }
                    });

                } else {
                    app.disabled = true;
                    app.errorMsg = data.data.message;
                }
            });
        };
    })

    .controller('usernameCtrl', function (User) {
        app = this;

        app.sendUsername = function(userData, valid){
            app.errorMsg = false;
            app.loading = true;
            app.disabled = true;
            if(valid){
                User.sendUsername(app.userData.email).then(function(data){
                    app.loading = false;
                    if(data.data.success){
                        app.successMsg = data.data.message;
                    }else{
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            }else{
                app.disabled = false;
                app.loading = false;
                app.errorMsg = 'Please enter a vilid e-mail!';
            }
        };

       
    })

    .controller('passwordCtrl', function (User) {
        app = this;

        app.sendPassword = function(resetData, valid){
            app.errorMsg = false;
            app.loading = true;
            app.disabled = true;

            if(valid){
                User.sendPassword(app.resetData).then(function(data){
                    app.loading = false;
                    if(data.data.success){
                        app.successMsg = data.data.message;
                    }else{
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            }else{
                app.disabled = false;
                app.loading = false;
                app.errorMsg = 'Please enter a vilid username!';
            }
        };

       
    })

    .controller('resetCtrl', function (User, $routeParams, $scope, $timeout, $location) {

        app = this;
        app.hide = true; // Hide form until token can be verified to be valid

        // Function to check if token is valid and get the user's info from database (runs on page load)
        User.resetUser($routeParams.token).then(function (data) {
            // Check if user was retrieved
            if (data.data.success) {
                app.hide = false; // Show form
                app.successMsg = 'Please enter a new password'; // Let user know they can enter new password
                $scope.username = data.data.user.username; // Save username in scope for use in savePassword() function
            } else {
                app.errorMsg = data.data.message; // Grab error message from JSON object
            }
        });

        // Function to save user's new password to database
        app.savePassword = function (regData, valid, confirmed) {
            app.errorMsg = false; // Clear errorMsg when user submits
            app.disabled = true; // Disable form while processing
            app.loading = true; // Enable loading icon

            // Check if form is valid and passwords match
            if (valid && confirmed) {
                app.regData.username = $scope.username; // Grab username from $scope

                // Run function to save user's new password to database
                User.savePassword(app.regData).then(function (data) {
                    app.loading = false; // Stop loading icon
                    // Check if password was saved to database
                    if (data.data.success) {
                        app.successMsg = data.data.message + '...Redirecting'; // Grab success message from JSON object and redirect
                        // Redirect to login page after 2000 milliseconds (2 seconds)
                        $timeout(function () {
                            $location.path('/login');
                        }, 2000);
                    } else {
                        app.disabled = false; // Enable form to allow user to resubmit
                        app.errorMsg = data.data.message; // Grab error message from JSON object
                    }
                });
            } else {
                app.loading = false; // Stop loading icon
                app.disabled = false; // Enable form to allow user to resubmit
                app.errorMsg = 'Please ensure form is filled out properly';  // Let user know form is not valid
            }
        }
    });