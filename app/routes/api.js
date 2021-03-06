var User = require('../models/user');
var News = require('../models/news');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var cors = require('cors');

module.exports = function(router) {

  var whitelist = ['http://localhost', 'http://gupcit.ru', 'http://192.168.2.195']
  var corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    optionsSuccessStatus: 200
  }

var options = {
  auth: {
    api_user: 'zaurelbukaev',
    api_key: 'opqewwp12'
  }
}

var client = nodemailer.createTransport(sgTransport(options));



router.post('/mail', cors(corsOptions), function(req, res){
  if(req.body.email == null){
    res.json({message: 'не задан почтовый адрес'});
  }else if (req.body.phone == null) {
    res.json({message: 'не задан номер телефона'});
  }else if (req.body.theme == null) {
    res.json({message: 'не задана тема'});
  }else if (req.body.text == null) {
    res.json({message: 'не заполнен текст сообщения'});
  }else if (req.body.name == null) {
    res.json({message: 'не задано имя'});
  }else {
    var email = {
      from: 'zayavki@gupcit.ru',
      to: 'elbukaevzaur@gmail.com',
      subject: req.body.theme,
          html: 'Имя: ' + req.body.name + '<br>'+
          'Адрес электронной почты: '+req.body.email +'<br>'+
          'Номер телефона: '+req.body.phone +'<br>'+
          'Текст заявки: '+ req.body.text,
          //html: req.body.title
    };

    client.sendMail(email, function(err, info){
        if (err){
          console.log(err);
        }
        else {
          console.log('Message send: ' + info.response);
        }
    });
    res.json({ success: true, message: 'Заявка отправлена!' });
  }
});



	//User registration route
	router.post('/users', function(req, res){
	var user = new User();
	user.username = req.body.username;
	user.password = req.body.password;
	user.email = req.body.email;
	user.name = req.body.name;
	user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h'} );
	if (req.body.username == null || req.body.username == "" || req.body.password == null || req.body.password == "" || req.body.email == null || req.body.email == "" || req.body.name == null || req.body.name == "") {
		res.json({ success: false, message: 'Ensure username, email, and password were provided'});
	}else{
		user.save(function(err){
		if(err){
		if(err.errors != null){
			if(err.errors.name){
				res.json({success: false, message: err.errors.name.message });
			}else if (err.errors.email){
				res.json({success: false, message: err.errors.email.message });
			}else if (err.errors.username){
				res.json({success: false, message: err.errors.username.message });
			}if (err.errors.password){
				res.json({success: false, message: err.errors.password.message });
			}else{
				res.json({success: false, message: err});
			}
		}else if (err){
			if(err.code == 11000){
				if (err.errmsg[61] == 'u'){
					res.json({success: false, message: 'What username is aready taken.'});
				}else if(err.errmsg[49] == 'e'){
					res.json({success: false, message: 'What e-mail is aready taken.'});
				}
			}else{
				res.json({success: false, message: err});
			}
		}
	}else{

		var email = {
		  from: 'localhost staff, staff@localhost.com',
		  to: user.email,
		  subject: 'localhost activation link',
          text: 'Hello ' + user.name + 'Thank you for registering at localhost.com Please click on the link below to complete your' +
          'activation <a href="http://localhost:8080/activate/' + user.temporarytoken,
          html: 'Hello world<strong>' + user.name + '</strong>.<br><br>Thank you for registering at localhost.com Please click on the link below to complete your' +
          'activation <br><br > <a href="http://localhost:8080/activate/' + user.temporarytoken + '">http://localhost:8080/</a>'
		};

		client.sendMail(email, function(err, info){
		    if (err){
		      console.log(err);
		    }
		    else {
		      console.log('Message send: ' + info.response);
		    }
		});

        res.json({ success: true, message: 'Account registered! please check your e-mail for activation link!' });
        }
	});
	}
});


	router.post('/checkusername', function(req, res){
		User.findOne({ username: req.body.username}).select('username').exec(function(err, user){
			if(err) throw err;
			if(user){
				res.json({ success: false, message: 'That username is already token.'});
			}else{
				res.json({ success: false, message: 'Valid username.'});
			}

		});
	});
	router.post('/checkemail', function(req, res){
		User.findOne({ email: req.body.email}).select('email').exec(function(err, user){
			if(err) throw err;
			if(user){
				res.json({ success: false, message: 'That email is already token.'});
			}else{
				res.json({ success: false, message: 'Valid email.'});
			}

		});
	});


    router.post('/resend', function (req, res) {
        User.findOne({ username: req.body.username }).select('email username password active').exec(function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({ success: false, message: 'Could not authenticate user' });
            } else if (user) {
                if (req.body.password) {
                    var validPassword = user.comparePassword(req.body.password);
                } else {
                    res.json({ success: false, message: '---' });
                }
                if (!validPassword) {
                    res.json({ success: false, message: 'Could not authenticate password' });
                } else if (user.active) {
                    res.json({ success: false, message: 'account is already activation!' });
                } else {
                    res.json({ success: true, user: user });
                }
            }
        });
    });

    router.put('/resend', function (req, res) {
        User.findOne({ username: req.body.username }).select('username name email temporarytoken').exec(function (err, user) {
            if (err) throw err;
            user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
            user.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    var email = {
                        from: 'localhost staff, staff@localhost.com',
                        to: user.email,
                        subject: 'localhost activation link request',
                        text: 'Hello ' + user.name + 'Your recently requested a new account activation link. Please click on the link below to complete your' +
                        'activation <a href="http://localhost:8080/activate/' + user.temporarytoken,
                        html: 'Hello <strong>' + user.name + '</strong>.<br><br>Your recently requested a new account activation link. Please click on the link below to complete your' +
                        'activation <br><br > <a href="http://localhost:8080/activate/' + user.temporarytoken + '">http://localhost:8080/</a>'
                    };

                    client.sendMail(email, function (err, info) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log('Message send: ' + info.response);
                        }
                    });
                    res.json({ success: true, message: 'Activation Link has been send to ' + user.email + ' !' });
                }
            });
        });
    });

	//User login route
	router.post('/authenticate', function(req, res){
		User.findOne({ username: req.body.username}).select('email username password active').exec(function(err, user){
			if(err) throw err;

			if(!user) {
				res.json({ success: false, message: 'Could not authenticate user'});
			}else if (user) {
				if(req.body.password) {
					var validPassword = user.comparePassword(req.body.password);
				} else {
					res.json({ success: false, message: '---'});
				}
				if (!validPassword) {
                    res.json({ success: false, message: 'Could not authenticate password' });
                } else if (!user.active) {
                    res.json({ success: false, message: 'Accaunt is not actived check your email for activation link!', expired: true });
				}else{
					var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h'} );
					res.json({ success: true, message: 'User authenticated!', token: token });
				}
			}
		});
	});

    router.put('/activate/:token', function (req, res) {
        User.findOne({ temporarytoken: req.params.token }, function (err, user) {
            if (err) throw err;
            var token = req.params.token;


            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Activation link has expired!' });
                } else if (!user) {
                    res.json({ success: false, message: 'Activation link has expired!' });
                } else {
                    user.temporarytoken = false;
                    user.active = true;
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {


                            var email = {
                                from: 'localhost staff, staff@localhost.com',
                                to: user.email,
                                subject: 'localhost activation activated',
                                text: 'Hello ' + user.name + ' Your accaunt has been successfully activated',
                                html: 'Hello <strong>' + user.name + '</strong>.<br><br> Your accaunt has been successfully activated!'
                            };

                            client.sendMail(email, function (err, info) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log('Message sent: ' + info.response);
                                }
                            });

                            res.json({ success: true, message: 'Account activated!' });
                        }
                    });



                }
            });



        });
    });

	router.get('/resetusername/:email', function(req, res){
		User.findOne({ email: req.params.email}).select('email name username').exec(function(err, user){
			if(err) {
				res.json({success: false, message: err});
			}else{
				if(!user){
					res.json({success: false, message: 'e-mail was not found.'});
				}else{

					var email = {
                                from: 'localhost staff, staff@localhost.com',
                                to: user.email,
                                subject: 'localhost username request!',
                                text: 'Hello ' + user.name + ' Your recent requested your username. Please save it in Files: '+ user.username,
                                html: 'Hello <strong>' + user.name + '</strong>.<br><br>Your recent requested your username. Please save it in Files: '+ user.username
                            };

                            client.sendMail(email, function (err, info) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log('Message sent: ' + info.response);
                                }
                            });

					res.json({ success: true, message: 'username has been send to e-mail.'});
				}
			}
		});
	});

    router.put('/resetpassword', function (req, res) {
        User.findOne({ username: req.body.username }).select('username active email resettoken name').exec(function (err, user) {
			if(err) throw err;
			if(!user){
				res.json({success: false, message: 'Username was not found!'});
			}else if(!user.active){
				res.json({success: false, message: 'Account has not yet been activated!'});
			}else{
				user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h'} );
				user.save(function(err){
					if(err){
						res.json({success: false, message: err});
					}else{

						var email = {
						from: 'localhost staff, staff@localhost.com',
						to: user.email,
						subject: 'localhost reset password request',
						text: 'Hello ' + user.name + 'You recently request a password reset link. Please click on the link below to reset your' +
						'password <br><br > <a href="http://localhost:8080/reset/' + user.resettoken,
						html: 'Hello world<strong>' + user.name + '</strong>.<br><br>You recently request a password reset link. Please click on the link below to reset your' +
						'password <br><br > <a href="http://localhost:8080/reset/' + user.resettoken + '">http://localhost:8080/reset/</a>'
						};

						client.sendMail(email, function(err, info){
							if (err){
							console.log(err);
							}
							else {
							console.log('Message send: ' + info.response);
							}
						});

						res.json({success: true, message: 'Please check you e-mail for password reset link.'});
					}
				})
			}
		});
    });

    router.get('/resetpassword/:token', function (req, res) {
        User.findOne({ resettoken: req.params.token }).select().exec(function (err, user) {
            if (err) throw err; // Throw err if cannot connect
            var token = req.params.token; // Save user's token from parameters to variable
            // Function to verify token
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: 'Password link has expired' }); // Token has expired or is invalid
                } else {
                    if (!user) {
                        res.json({ success: false, message: 'Password link has expired' }); // Token is valid but not no user has that token anymore
                    } else {
                        res.json({ success: true, user: user }); // Return user object to controller
                    }
                }
            });
        });
    });

    router.put('/savepassword', function (req, res) {
        User.findOne({ username: req.body.username }).select('username email name password resettoken').exec(function (err, user) {
            if (err) throw err;
            if (req.body.password == null || req.body.password == '') {
                res.json({ success: false, message: 'Password not provided.' });

            } else {
                user.password = req.body.password;
                user.resettoken = false;
                user.save(function (err) {
                    if (err) {
                        res.json({ success: false, message: err });
                    } else {

                        var email = {
                            from: 'localhost staff, staff@localhost.com',
                            to: user.email,
                            subject: 'localhost reset password',
                            text: 'Hello ' + user.name + '</strong>.<br><br>This email is to notify tou that your password was recently reset at localhost.com!',
                            html: 'Hello <strong>' + user.name + '</strong>.<br><br>This email is to notify tou that your password was recently reset at localhost.com!'
                        };

                        client.sendMail(email, function (err, info) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log('Message send: ' + info.response);
                            }
                        });


                        res.json({ success: true, message: 'Password has been reset!' });
                    }
                });

            }
        });
    });
/*
	router.use(function(req, res, next){

		var token = req.body.token || req.body.query || req.headers['x-access-token'];

		if(token){

			jwt.verify(token, secret, function(err, decoded){
				if (err) {
					res.json({success: false, message: 'Token invalid'});
				}else{
					req.decoded = decoded;
					next();
				}
			});

		}else{
			res.json({ success: false, message: 'no token provided' });
		}
	});
*/
	router.post('/me', function(req, res){
		res.send(req.decoded);
	});

    router.get('renewToken/:username', function(req, res){
        User.findOne({ username: req.params.username}).select().exec(function(err, user){
            if(err) throw err;
            if(!user){
                res.json({success: false, message: 'No user was found'});
            }else{
                var newToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h'} );
				res.json({ success: true, token: newToken });
            }
        });
    });

    router.get('/permission', function(req, res){
        User.findOne({username: req.decoded.username}, function(err, user){
            if(err) throw err;
            if(!user){
                res.json({success: false, message: 'No user was found.'});
            }else{
                res.json({success: true, permission: user.permission});
            }
        });
    });

    router.get('/management', function(req, res) {
        User.find({}, function(err, users) {
            if (err) throw err; // Throw error if cannot connect
            User.findOne({ username: req.decoded.username }, function(err, mainUser) {
                if (err) throw err; // Throw error if cannot connect
                // Check if logged in user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if user has editing/deleting privileges
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        // Check if users were retrieved from database
                        if (!users) {
                            res.json({ success: false, message: 'Users not found' }); // Return error
                        } else {
                            res.json({ success: true, users: users, permission: mainUser.permission }); // Return users, along with current user's permission
                        }
                    } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                    }
                }
            });
        });
    });


    router.get('/news', cors(corsOptions), function(req, res) {
                News.find({}, function(err, news) {
                    if (err) throw err;
                    res.json({news});
                });
    });

    router.get('/news/:id', cors(corsOptions), function(req, res) {
                News.findOne({_id: req.params.id}, function(err, news) {
                    if (err) throw err;
                    res.json({news: news});
                });
    });


    router.delete('/management/:username', function(req, res){
        var deleteUser = req.params.username;
        User.findOne({username: req.decoded.username}, function(err, mainUser){
            if(err) throw err;
            if(!mainUser){
                res.json({success: false, message: 'No user found'});
            }else{
                if(mainUser.permission != 'admin'){
                    res.json({success: false, message: 'Insufficlient Permission'});
                }else{
                    User.findOneAndRemove({username: deleteUser}, function(err, user){
                        if(err) throw err;
                        res.json({success: true});
                    });
                }
            }
        });
    });

    router.get('/edit/:id', function(req, res){
        var editUser = req.params.id;
        User.findOne({username: req.decoded.username}, function(err, mainUser){
            if(err) throw err;
            if(!mainUser){
                res.json({success: false, message: 'no user found.'});
            }else{
                if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                    User.findOne({ _id: editUser}, function(err, user){
                        if(err) throw err;
                        if(!user){
                            res.json({success: false, message: 'No user found'});
                        }else{
                            res.json({success: true, user: user});
                        }
                    });
                }else{
                    res.json({success: false, message:'insufficlient permission'});
                }
            }
        });
    });
    router.put('/edit', function(req, res){
        var editUser = req.body._id;
        if(req.body.name) var newName = req.body.name;
        if(req.body.username) var newUsername = req.body.username;
        if(req.body.email) var newEmail = req.body.email;
        if(req.body.permission) var newPermission = req.body.permission;
        User.findOne({username: req.decoded.username}, function(err, mainUser){
            if(err) throw err;
            if(!mainUser){
                res.json({success: false, message: 'User not found'});
            }else{
                if(newName){
                    if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                        User.findOne({_id: editUser}, function(err, user){
                            if(err) throw err;
                            if(!user){
                                res.json({success: false, message: 'No user found'});
                            }else{
                                user.name = newName;
                                user.save(function(err){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        res.json({success: true, message: 'Name has been updated.'});
                                    }
                                });
                            }
                        });
                    }else{
                        res.json({success: false, message: 'Insufficlient permissions'});
                    }
                }
                if(newUsername){
                    if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                        User.findOne({_id: editUser}, function(err, user){
                            if(err) throw err;
                            if(!user){
                                res.json({success: false, message: 'No user found'});
                            }else{
                                user.username = newUsername;
                                user.save(function(err){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        res.json({success: true, message: 'Username has been updated.'});
                                    }
                                });
                            }
                        });
                    }else{
                        res.json({success: false, message: 'Insufficlient permissions'});
                    }
                }
                if(newEmail){
                    if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                        User.findOne({_id: editUser}, function(err, user){
                            if(err) throw err;
                            if(!user){
                                res.json({success: false, message: 'No user found'});
                            }else{
                                user.email = newEmail;
                                user.save(function(err){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        res.json({success: true, message: 'E-mail has been updated.'});
                                    }
                                });
                            }
                        });
                    }else{
                        res.json({success: false, message: 'Insufficlient permissions'});
                    }
                }
                if(newPermission){
                    if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                        User.findOne({_id: editUser}, function(err, user){
                            if(err) throw err;
                            if(!user){
                                res.json({success: false, message: 'No user found'});
                            }else{
                                if(newPermission === 'user'){
                                    if(user.permission == 'admin'){
                                        if(mainUser != 'admin'){
                                            res.json({success: false, message:'Insufficlient permissions. You must be an admin to downgrade anothen admin'});
                                        }else{
                                            user.permission = newPermission;
                                            user.save(function(err){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.json({success: true, message: 'Permissions have been updated.'});
                                                }
                                            });
                                        }
                                    }else{
                                        user.permission = newPermission;
                                            user.save(function(err){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.json({success: true, message: 'Permissions have been updated.'});
                                                }
                                            });
                                    }
                                }if(newPermission === 'moderator'){
                                    if(user.permission === 'admin'){
                                        if(mainUser.permission != 'admin'){
                                            res.json({success: false, message: 'Insufficlient permissions. You must be an admin to downgrade anothen admin'});
                                        }else{
                                            user.permission = newPermission;
                                            user.save(function(err){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.json({success: true, message: 'Permissions have been updated.'});
                                                }
                                            });
                                        }
                                    }else{
                                        user.permission = newPermission;
                                            user.save(function(err){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.json({success: true, message: 'Permissions have been updated.'});
                                                }
                                            });
                                    }
                                }
                                if(newPermission === 'admin'){
                                    if(mainUser.permission === 'admin'){
                                        user.permission = newPermission;
                                            user.save(function(err){
                                                if(err){
                                                    console.log(err);
                                                }else{
                                                    res.json({success: true, message: 'Permissions have been updated.'});
                                                }
                                            });
                                    }else{
                                        res.json({success: false, message: 'Insufficlient permissions you. You must be an admin to upgrade someone to the admin level'});
                                    }
                                }



                            }
                        });
                    }else{
                        res.json({success: false, message: 'Insufficlient permissions'});
                    }
                }
            }
        });
    });

	return router;
}
