
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

// Common handler for different message elements
((aon, undefined) => {
	/** Function to obtain specialized UI message handler
	 *  The UI elements are immediately retrieved and cached. A new instance 
	 *  needs to be created if something changes (such as the elements being removed
	 *  and added again)
	 * @param string msg_text_id An element ID or query selector to receive the message
	 * @param string msg_wrap_id An wrapper element ID or query selector that is used 
	 *	to hide & show the message
	 *	This parameter is optional and may be the same as msg_text_id. If not specified, the
	 *	element indicated by the msg_text_id parameter is used
	 * @param string msg_hide_class The CSS class name that is used to hide the message. This
	 *	class is addded and remove from the UI element as needed to hide and show a message
	 * @return object A unique object for displaying and hiding messages. The display() and
	 *	hide() functions can be called as desired to show and hide messages: the display() 
	 *	and hide() function calls are not stacked regardless whether timeouts are specified
	 *	or not
	 */
	aon.message = (msg_text_id, msg_wrap_id, msg_hide_class) => {
		/** Function defining the specific handlers for messages
		 * @param string text_id The element ID to receive the message
		 * @param string wrap_id The message wrapping element ID
		 * @param string hide_class The CSS class name used to show and hide the message
		 */
		function o(text_id, wrap_id, hide_class) {
				var text_el = document.getElementById(text_id);
				var wrap_el = undefined;
				var msg_timer_id = undefined;

				/** Initializes the instance of this object. Removed once it's
				 *	called
				 */
				this.init = function() {
					// Get the element to use to display messages
					if (!text_el) {
						text_el = document.querySelector(text_id);
					}
					if (!text_el) {
						console.log("Text message element '" + text_id + "' not found. Messages won't be displayed");
					}
					// Get the wrapper element if one is wanted specified
					if (wrap_id) {
						wrap_el = document.getElementById(wrap_id);
						if (!wrap_el) {
							wrap_el = document.querySelector(wrap_id);
						}
						if (!wrap_el) {
							console.log("Text wrapper element '" + wrap_id + "' not found. Messages may not show up");
						}
					}
				};

				/** Displays the message on the UI in specified elements
				 * @param string msg The message to display. HTML is not supported
				 * @param timeout Optional timeout value for displaying message
				 */
				this.display = function(msg, timeout_ms = 0) {
					var disp_msg = "" + msg;

					// Use the console to display the message if we couldn't find
					// the UI element
					if (!text_el) {
						console.log("Message: " + disp_msg);
						if (typeof msg != "string") {
							console.log("Received message type follows:");
							console.log(msg);
						}
						return;
					}

					// Kill any previous timers
					if (msg_timer_id) {
						window.clearTimeout(msg_timer_id);
						msg_timer_id = undefined;
					}

					// Setting the message
					text_el.innerHTML = disp_msg.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');

					// Show the message if it's not already visible
					var el = wrap_el || text_el;
					if (el.classList.contains(hide_class)) {
						el.classList.remove(hide_class);
					}

					// Check if the message only lives for a short while
					if (timeout_ms > 0) {
						msg_timer_id = window.setTimeout(this.hide, timeout_ms);
					}
				};

				/** Hides the message element
				 */
		 		this.hide = function() {
		 			var el = wrap_el || text_el;

		 			// Hide the message if it's not already hidden
		 			if (el) {
		 				if (!el.classList.contains(hide_class)) {
		 					el.classList.add(hide_class);
		 				}
		 			}

					// Kill any previous timers
					if (msg_timer_id) {
						window.clearTimeout(msg_timer_id);
						msg_timer_id = undefined;
					}
		 		};
	  	};

	  	// Creating a new instance of the message object
	  	o = new o(msg_text_id, msg_wrap_id, msg_hide_class);
	  	o.init();
	  	// Remove the initialization function so it can't be called again
	  	delete o.init;
	  	return o;
	}
})(window.aon = window.aon || {}, undefined);