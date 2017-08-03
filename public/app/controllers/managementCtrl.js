angular.module('managementController', [])

.controller('managementCtrl', function(User, $scope){
    var app = this;

    app.loading = true;
    app.accessDenied = true;
    app.errorMsg = false;
    app.editAccess = false;
    app.deleteAccess = false;
    app.limit = 5;
    app.searchLimit = 0;
   function getUsers(){
       User.getUsers().then(function(data) {
            // Check if able to get data from database
            if (data.data.success) {
                // Check which permissions the logged in user has
                if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
                    app.users = data.data.users; // Assign users from database to variable
                    app.loading = false; // Stop loading icon
                    app.accessDenied = false; // Show table

                    // Check if logged in user is an admin or moderator
                    if (data.data.permission === 'admin') {
                        app.editAccess = true; // Show edit button
                        app.deleteAccess = true; // Show delete button
                    } else if (data.data.permission === 'moderator') {
                        console.log('No user main user 1');
                        app.editAccess = true; // Show edit button
                    }
                } else {
                    app.errorMsg = 'Insufficient Permissions'; // Reject edit and delete options
                    app.loading = false; // Stop loading icon
                }
            } else {
                app.errorMsg = data.data.message; // Set error message
                app.loading = false; // Stop loading icon
            }
        });
   };
   getUsers();

        app.showMore = function(number){
            app.showMoreError = false;
            if(number > 0){
                app.limit = number;
            }else{
                app.showMoreError = 'Please enter a valid number.';
            }
        };
        app.showAll = function(){
            app.limit = undefined;
            app.showMoreError = false;
        };

        app.deleteUser = function(username){
            User.deleteUser(username).then(function(data){
                if(data.data.success){
                    getUsers();
                }else{
                    app.showMoreError = data.data.message;
                }
            });
        };

        app.search = function(searchKeyword, number) {
        // Check if a search keyword was provided
        if (searchKeyword) {
            // Check if the search keyword actually exists
            if (searchKeyword.length > 0) {
                app.limit = 0; // Reset the limit number while processing
                $scope.searchFilter = searchKeyword; // Set the search filter to the word provided by the user
                app.limit = number; // Set the number displayed to the number entered by the user
            } else {
                $scope.searchFilter = undefined; // Remove any keywords from filter
                app.limit = 0; // Reset search limit
            }
        } else {
            $scope.searchFilter = undefined; // Reset search limit
            app.limit = 0; // Set search limit to zero
        }
    };

    // Function: Clear all fields
    app.clear = function() {
        $scope.number = 'Clear'; // Set the filter box to 'Clear'
        app.limit = 0; // Clear all results
        $scope.searchKeyword = undefined; // Clear the search word
        $scope.searchFilter = undefined; // Clear the search filter
        app.showMoreError = false; // Clear any errors
    };

    // Function: Perform an advanced, criteria-based search
    app.advancedSearch = function(searchByUsername, searchByEmail, searchByName) {
        // Ensure only to perform advanced search if one of the fields was submitted
        if (searchByUsername || searchByEmail || searchByName) {
            $scope.advancedSearchFilter = {}; // Create the filter object
            if (searchByUsername) {
                $scope.advancedSearchFilter.username = searchByUsername; // If username keyword was provided, search by username
            }
            if (searchByEmail) {
                $scope.advancedSearchFilter.email = searchByEmail; // If email keyword was provided, search by email
            }
            if (searchByName) {
                $scope.advancedSearchFilter.name = searchByName; // If name keyword was provided, search by name
            }
            app.searchLimit = undefined; // Clear limit on search results
        }
    };

    // Function: Set sort order of results
    app.sortOrder = function(order) {
        app.sort = order; // Assign sort order variable requested by user
    };
})

.controller('editCtrl', function($scope, $routeParams, User, $timeout ){
    var app = this;

    User.getUser($routeParams.id).then(function(data){
            if(data.data.success){
                $scope.newName = data.data.user.name;
                $scope.newEmail = data.data.user.email;
                $scope.newUsername = data.data.user.username;
                $scope.newPermission = data.data.user.permission;
                app.currentUser = data.data.user._id;
            }else{
                app.errorMsg = data.data.message;
            }
        });

    $scope.nameTab = 'active';
    app.phase1 = true;

    app.namePhase = function(){
        $scope.nameTab = 'active';
        $scope.usernameTab = 'default';
        $scope.emailTab = 'default';
        $scope.permissionTab = 'default';
        app.phase1 = true;
        app.phase2 = false;
        app.phase3 = false;
        app.phase4 = false;
        app.errorMsg = false;
    };
    app.usernamePhase = function(){
        $scope.nameTab = 'default';
        $scope.usernameTab = 'active';
        $scope.emailTab = 'default';
        $scope.permissionTab = 'default';
        app.phase1 = false;
        app.phase2 = true;
        app.phase3 = false;
        app.phase4 = false;
        app.errorMsg = false;
    };
    app.emailPhase = function(){
        $scope.nameTab = 'default';
        $scope.usernameTab = 'default';
        $scope.emailTab = 'active';
        $scope.permissionTab = 'default';
        app.phase1 = false;
        app.phase2 = false;
        app.phase3 = true;
        app.phase4 = false;
        app.errorMsg = false;
    };
    app.permissionPhase = function(){
        $scope.nameTab = 'default';
        $scope.usernameTab = 'default';
        $scope.emailTab = 'default';
        $scope.permissionTab = 'active';
        app.phase1 = false;
        app.phase2 = false;
        app.phase3 = false;
        app.phase4 = true;
        app.errorMsg = false;

        app.disableUser = false;
        app.disableModerator = false;
        app.disableAdmin = false;

        if($scope.newPermission === 'user'){
            app.disableUser = true;
        }else if($scope.newPermission === 'moderator'){
            app.disableModerator = true;
        }else if($scope.newPermission === 'admin'){
            app.disableAdmin = true;
        }
    };

    app.updateName = function(newName, valid){
        app.errorMsg = false;
        app.disabled = true; 
        var userObject = {};
        

        if(valid){
            userObject._id = app.currentUser;
            userObject.name = $scope.newName;
            User.editUser(userObject).then(function(data){
                if(data.data.success){
                    app.successMsg = data.data.message;
                    $timeout(function(){
                        app.nameForm.name.$setPristine();
                        app.nameForm.name.$setUntouched();
                        app.successMsg = false;
                        app.disabled = false;
                    }, 2000);
                }else{
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
        }else{
            app.disabled = false; 
            app.errorMsg = 'Please ensure form is filled out properly.';
        }
    };

    app.updateEmail = function(newEmail, valid){
        app.errorMsg = false;
        app.disabled = true; 
        var userObject = {};
        

        if(valid){
            userObject._id = app.currentUser;
            userObject.email = $scope.newEmail;
            User.editUser(userObject).then(function(data){
                if(data.data.success){
                    app.successMsg = data.data.message;
                    $timeout(function(){
                        app.emailForm.email.$setPristine();
                        app.emailForm.email.$setUntouched();
                        app.successMsg = false;
                        app.disabled = false;
                    }, 2000);
                }else{
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
        }else{
            app.disabled = false; 
            app.errorMsg = 'Please ensure form is filled out properly.';
        }
    };

    app.updateUsername = function(newUsername, valid){
        app.errorMsg = false;
        app.disabled = true; 
        var userObject = {};
        

        if(valid){
            userObject._id = app.currentUser;
            userObject.username = $scope.newUsername;
            User.editUser(userObject).then(function(data){
                if(data.data.success){
                    app.successMsg = data.data.message;
                    $timeout(function(){
                        app.usernameForm.username.$setPristine();
                        app.usernameForm.username.$setUntouched();
                        app.successMsg = false;
                        app.disabled = false;
                    }, 2000);
                }else{
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
        }else{
            app.disabled = false; 
            app.errorMsg = 'Please ensure form is filled out properly.';
        }
    };

    app.updatePermission = function(newPermission){
        app.errorMsg = false;
        app.disableAdmin = true;
        app.disableModerator = true;
        app.disableUser = true;


        var userObject = {};
        

            userObject._id = app.currentUser;
            userObject.permission = newPermission;
            User.editUser(userObject).then(function(data){
                if(data.data.success){
                    app.successMsg = data.data.message;
                    $timeout(function(){
                        app.successMsg = false;

                        if(newPermission === 'user'){
                        app.disableUser = true;
                        app.disableModerator = false;
                        app.disableAdmin = false;
                        $scope.newPermission = 'user';
                         }else if(newPermission === 'moderator'){
                        app.disableModerator = true;
                        app.disableAdmin = false;
                        app.disableUser = false;
                        $scope.newPermission = 'moderator';
                        }else if(newPermission === 'admin'){
                        app.disableAdmin = true;
                        app.disableModerator = false;
                        app.disableUser = false;
                        $scope.newPermission = 'admin';
                        }

                    }, 2000);
                }else{
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
    };

    

}); 