var getPath = require('../lib/string').getPath;
var alphanumeric = require('../lib/string.js').alphanumeric;
var database = require('../lib/database');
var APP_USERS = require('../lib/table').APP_USERS;
var requestQueryParser = require('../lib/requestQueryParser');


exports.get = function(request, response){	
	var userName = request.params[0];
	if (!alphanumeric(userName)) {
		response.redirect('/login');
		return;
	}

	if (request.session.username === userName) {
		database.select(
						APP_USERS,
						{
							schema : APP_USERS.primaryKey,
							data : [ userName ]
						},
						function(err, results) {
							if (err === null) {
								var currentUser = results[0];
								var currentUserRowWithLabel = {
										label : ['user id', 'password', 'confirm password', 'first name', 'last name', 'city', 'state'],
										data : [currentUser.USER_NAME_ID, '', '', currentUser.FIRST_NAME, currentUser.LAST_NAME, currentUser.LOCATION_CITY, currentUser.LOCATION_STATE],
										name : ['USER_NAME_ID', 'PASSWORD', 'CONFIRM_PASSWORD', 'FIRST_NAME', 'LAST_NAME', 'LOCATION_CITY', 'LOCATION_STATE'],
										type : ['text', 'password', 'password', 'text', 'text', 'text', 'text']
								};
								response.render('edit.jade', {
									post_path : '/user/' + userName + '/edit',
									current_user : currentUserRowWithLabel
								});
							} else {
								console.log(err);
							}
						}
						);
	}
	
};

exports.post = function(request, response){
	var userName = request.params[0];
	if (!alphanumeric(userName)) {
		response.redirect('/login');
		return;
	}

	if (request.session.username === userName) {
		var rowPost = requestQueryParser.parse(request, APP_USERS.schema);
		
		if (request.body["PASSWORD"] != request.body["CONFIRM_PASSWORD"]) {
			response.render('signup.jade', { 
	        message: 'The password must be consistent'
		  });
		  return;
		}
		
		if (!APP_USERS.checkLegalData(rowPost)) {
			console.log("post data invalid!");
			return;
		}
		database.update(APP_USERS, rowPost, function(err, results) {
			if (err == null) {
				response.redirect('/user/' + userName);
			}
		});
	}
};

