/*
 *	Copyright Chris Schnaufer All Rights Reserved
 *	Author: Chris Schnaufer
 *
 *	This heading is is restricted by the following numbered items:
 *		1. must be included in all derivatives of this file
 *		2. must be included in all copies of this file
 *		3. must not be changed without written consent from the Author
 *		4. Is not governed by any license(s) covering the rest of this file
 *
 *	The rest of this file (not consisting of this heading) is protected under 
 *	GNU GENERAL PUBLIC LICENSE Version 3.
 *	This file can be freely used, shared, and modified as permitted by
 *	by the preceeding license
 */

/* Interfaces with AWS Cognito services */
/* Dependent upon aws/config.js */
/* Globals AmazonCognitoIdentity, AWSCognito */

/*
 * The AWSCognito instance (from AWS SDK) needs to have its configured region 
 * set globally. This implies that only one Cognito endpoint can be used at a 
 * time by any Cognito user unless special measures are taken (outside of here)
 */
/* Website configuration information */
((aon) => {
/* AWS configuration information */
((aws) => {

	// Cognito specific Namespace
	((cognito) => {
		// Copy of our pool configuration
		var pool_info = ((id, appId) => 
								{return {UserPoolId: id,
								 		 ClientId: appId};})
							(aws.cfg_cognito().poolId, aws.cfg_cognito().poolAppClientId);

		var user_pool = new AmazonCognitoIdentity.CognitoUserPool(pool_info);

		// Set the region. See comments above for more information on this
		if (AWSCognito != undefined) {
			AWSCognito.config.region = aws.cfg_cognito().poolRegion;
		};

		/** Checks if the user is authorized
		 * @param function cbSuccess The callback to receive the token when 
		 *	successful
		 * @param function cbFail The callback called when there is an issue.
		 *	When called the parameter is either null (indicating not authorized)
		 * 	or an error object.
		 */
		cognito.isAuthenticated = function(cbSuccess, cbFail) {
			var user = user_pool.getCurrentUser();
			if (user) {
				user.getSession((err,session) => {
					if (err) {
						cbFail(err);
					} else if (!session) {
						cbFail(null);
					} else {
						cbSuccess(session.getIdToken().GetJwtToken());
					}
				});
			} else {
				cbFail(null);
			}
		}

		/** Registers a new user 
		 * @param string user_email The email to register
		 * @param string password The password associated with the email
		 * @param function cbSuccess The callback for registration success
		 * @param function cbFail Optional callback for registration failure which
		 *	receives an err object
		 */
		cognito.register = function(user_email,password, cbSuccess, cbFail) {
			// Type of registration data for Cognito
			var email_info = {Name: 'email', Value: 'email'};
			var email_attr = new AmazonCognitoIdentity.cognitoUserAttribute(email_info);

			// Call to add the user
			user_pool.signUp(toUsername(user_email), password, [email_attr], null, 
				(err,result) => {if (err) 
									{if (cbFail) cbFail(err);}
								 else cbSuccess(result);
								});
		}

		/** Authenticates the user
		 * @param string user_email The email to authenticate
		 * @param string password The password associated with the email
		 * @param function cbSuccess The callback for authentication success
		 * @param function cbFail Optional callback for authentication failure
		 *	which receives an err object
		 */
		cognito.signin = function(user_email, password, cbSuccess, cbFail) {
			var auth_detail = new AmazonCognitoIdentity.AuthenticationDetails(
								{Username: toUsername(user_email),
								 Password: password}
								 );
			var user = cognitoUserInstance(user_email);

			user.authenticateUser(auth_detail, 
							{onSuccess: cbSuccess, 
							 onFailure: function(err){if (cbFail) cbFail(err);}}
							 );
		}

		/** Confirms the user's login code is valid
		 * @param string user_email The email to authenticate
		 * @param string user_code The code associated with the email
		 * @param function cbSuccess The callback for authentication success
		 * @param function cbFail Optional callback for authentication failure
		 *	which receives an error object
		 */
		cognito.confirm = function(user_email, user_code, cbSuccess, cbFail) {
			var user = cognitoUserInstance(user_email);

			user.confirmRegistration(code, true, (err,result) => 
					{if(err) 
						{if (cbFail) cbFail(err);}
					 else cbSuccess(result);}
					);
		}

		/** Signs out the current user
		 */
		cognito.signout = function() {
			user_pool.getCurrentUser().signOut();
		}

		/** Changes an email address to a user name
		 * @param string email The string to convert to an username
		 * @return string The converted email string
		 */
		function toUsername(email) {
			return email.replace('@', '_at_');
		}

		/** Create a new instance of a cognito user object
		 * @param string email The user's email
		 * @return object An new instance of AmazonCognitoIdentity.CognitoUser
		 */
		function cognitoUserInstance(email) {
			return new AmazonCognitoIdentity.CognitoUser(
						{Username: toUsername(email),
						 Pool: user_pool}
					 	);
		}

	})(aws.cognito = aws.cognito || {});

})(aon.aws = aon.aws || {}, undefined);
}) (window.aon = window.aon || {}, undefined);
