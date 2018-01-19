/* 
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

// Adds elements to the aon instance to support logging in and registering
/* Dependencies: aon.aws.cognito, aon.message */
((aon, undefined) => {
	var err_msg;
	var info_msg;
	var reg_err_msg;
	var confirm_err_msg;
	var info_timer_ms = 2000;
	var dummy_msg = {display:function(msg){console.log(msg);},hide:function(){}};

	/** Begins the login process
	 */
	aon.login = function() {
		var el;
		var user;
		var pw;

		// Make sure we have the message instances we need
		if (!err_msg) {
			err_msg = aon.message("err_msg","err_msg_wrap","el_hide") || dummy_msg;
		}
		if (!info_msg) {
			info_msg = aon.message("msg","msg_wrap","el_hide") || dummy_msg;
		}

		// Confirm the account
		el = document.getElementById("un");
		if (el) {user = el.value;}
		el = document.getElementById("pw");
		if (el) {pw = el.value;}
		if (!user || !pw) {
			err_msg.display("Please enter an email and password to login or register");
			return;
		}
		if (!aon || !aon.aws || !aon.aws.cognito) {
			console.log("Missing required namespace aon.aws.cognito");
			err_msg.display("We are experiencing problems. Please refresh and try again later");
			return;
		}

		err_msg.hide();
		aon.aws.cognito.signin(user, pw, 
					/* success */	((user) => {return () => {loginSuccess(user);};})(user),
					/* failure */	((un,pw) => {return (err) => {loginFailure(err, un, pw);};
										})(user,pw)
					);
	}

	/** Called when a login is successful and navigates to the next page
	 * @param string user The name of the logged in user
	 */
	function loginSuccess(user) {
		localStorage.setItem("u",user);
		document.location.href = "rate.php";
	}

	/** Called when a login attempt fails
	 *  If possible, will try to register a new user or allow the user to enter their
	 *  confirmation code
	 * @param object err The error returned by the login attampt
	 * @param string un The name of the user
	 * @param string pw The password used for the login attmpt
	 */
	function loginFailure(err, un, pw) {
		if (err.code == "UserNotFoundException") {
			registerUser(un, pw, err_msg);
		} else if (err.code == "UserNotConfirmedException") {
			confirmUser(un, err_msg);
		} else if (err.code == "NotAuthorizedException") {
			err_msg.display("Invalid username and password combination. Please try again");
		} else {
			console.log(err.message);
			err_msg.display("We are having problems communicating with the server");
		}
	}

	/** Cancels a window by hiding it
	 * @param string win_id The ID of the window's top-level UI element
	 */
	aon.cancelWin = function(win_id) {
		var el;
		if (!win_id) {
			console.log("Unknown window is being canceled")
			return;
		}

		el = document.getElementById(win_id);
		if (!el) {
			console.log("Unable to find window '" + win_id + "' to hide it");
			return;
		}
		if (!el.classList.contains("el_hide")) {
			el.classList.add("el_hide");
		}
	}

	/** Entry point to registering a new user after login fails
	 * @param string user The name of the user
	 * @param string pw The password the user entered
	 * @param object err_msg The message handler to use when displaying errors. Once the
	 *	registration window is displayed this parameter is not used
	 */
	function registerUser(user, pw, err_msg) {
		// Show the registration window and confirm the password
		var win = document.getElementById("register_win_wrap");
		var el;

		// The error message handler for the registration window
		if (!reg_err_msg) {
			reg_err_msg = aon.message("reg_err_msg","reg_err_msg_wrap","el_hide") || dummy_msg;
		}

		if (!win) {
			console.log("Unable to find the registration window");
			err_msg.display("Unable to verify your account. Please try later");
			return;
		}

		// Setup the UI elements
		el = document.querySelector("#register_win #reg_un");
		if (el) {
			if (el.style.readonly) {
				delete el.style.readonly;
			}
			el.value = user;
			el.style.readonly = true;
		}
		el = document.querySelector("#register_win #reg_pw");
		if (el) {
			el.value = pw;
		}
		el = document.querySelector("#register_win #pw_confirm");
		if (el) {
			el.focus();
		}

		// Show the window hiding an errors
		reg_err_msg.hide();
		if (win.classList.contains("el_hide")) {
			win.classList.remove("el_hide");
		}
	}

	/** Attempts to register a new user
	 * @param string win_id The ID of the window's top-level UI element
	 */
	aon.register = function(win_id) {
		var el;
		var un;
		var pw1;
		var pw2;

		// Get and compare passwords 
		el = document.querySelector("#" + win_id + " #reg_pw");
		if (el) {
			pw1 = el.value;
		}
		el = document.querySelector("#" + win_id + " #pw_confirm");
		if (el) {
			pw2 = el.value;
		}
		if (pw1 != pw2) {
			reg_err_msg.display("The passwords are not the same");
			return;
		}
		if (!pw1 || !pw1.length) {
			reg_err_msg.display("A password is required");
			return;
		}

		// Get the username and register the user
		el = document.querySelector("#" + win_id + " #reg_un");
		if (el) {
			un = el.value;
		}
		if (!un || !un.length) {
			reg_err_msg.display("A username is required");
			return;
		}

		reg_err_msg.hide();
		aon.aws.cognito.register(un, pw1, 
					/* success */	((user) => {return () => {confirmUser(user,reg_err_msg);};})(un),
					/* failure */	(err) => {registerFailure(err,"#" + win_id + " #pw_confirm");}
					);
	}

	/** Called when registering a new user fails
	 * @param object err The error object returned by the request to register
	 * @param string conf_pw_el_id The ID of the confirming password UI element (not the 
	 *	origin password element ID)
	 */
	function registerFailure(err, conf_pw_el_id) {
		if (err.code == "InvalidPasswordException") {
			reg_err_msg.display("Invalid password. Please use mixed case, numbers, and symbols");
		} else {
			reg_err_msg.display("Unable to register");
		}
		console.log(err);

		if (conf_pw_el_id) {
			var el = document.getElementById(conf_pw_el_id);
			if (el) {
				el.focus();
			}
		}
	}

	/** Displays the window allowing a user to enter their confirmation code
	 * @param string user The nanme of the user
	 * @param object err_msg_ui The object used to display error messages. Once the window is
	 *	displayed this parameter is no longer used
	 */
	function confirmUser(user, err_msg_ui) {
		// Show the registration window and confirm the password
		var win = document.getElementById("confirm_win_wrap");
		var el;

		// Create the error message handler for the window
		if (!confirm_err_msg) {
			confirm_err_msg = aon.message("confirm_err_msg","confirm_err_msg_wrap","el_hide") || dummy_msg;
		}
		if (!win) {
			console.log("Unable to find the confirmation window");
			err_msg_ui.display("Unable to confirm your account. Please try later");
			return;
		}

		// Setup the UI elements
		el = document.querySelector("#confirm_win #confirm_un");
		if (el) {
			if (el.style.readonly) {
				delete el.style.readonly;
			}
			el.value = user;
			el.style.readonly = true;
		}
		el = document.querySelector("#confirm_win #confirm");
		if (el) {
			el.focus();
		}

		// Show the window hiding an errors
		confirm_err_msg.hide();
		if (win.classList.contains("el_hide")) {
			win.classList.remove("el_hide");
		}
	}

	/** Called to perform the confirmation code request
	 * @param string win_id The ID of the window's top-level UI element
	 */
	aon.confirm = function(win_id) {
		var el;
		var un;
		var code;

		// Get and compare passwords 
		el = document.querySelector("#" + win_id + " #confirm");
		if (el) {
			code = el.value;
		}
		if (!code || !code.length) {
			confirm_err_msg.display("A confirmation code is required");
			return;
		}

		// Get the username and register the user
		el = document.querySelector("#" + win_id + " #confirm_un");
		if (el) {
			un = el.value;
		}
		if (!un || !un.length) {
			reg_err_msg.display("A username is required");
			return;
		}

		confirm_err_msg.hide();
		aon.aws.cognito.confirm(un, code, 
					/* success */	() => {cancelWin(win_id);info_msg.display("Code confirmed. Continue logging in", info_timer_ms);},
					/* failure */	(err) => {confirmFailure(err, "#" + win_id + " #confirm");}
					);
	}

	/** Called when the confirmation attempt fails
	 * @param object err The error object returned by the failed request
	 * @param string code_el_id The ID of the code entry UI element
	 */
	function confirmFailure(err, code_el_id) {
		if (err.code == "CodeMismatchException") {
			confirm_err_msg.display("The code doesn't match. Please try again");
		} else {
			confirm_err_msg.display("Unable to confirm registration");
		}
		console.log(err);
		if (code_el_id) {
			var el = document.getElementById(code_el_id);
			if (el) {
				el.focus();
			}
		}
	}

})(window.aon = window.aon || {}, undefined);