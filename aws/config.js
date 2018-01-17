
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

/* Website configuration information */
((aon) => {
/* AWS configuration information */
((aws) => {

	/* AWS configuration values for cognito user pool */
	aws.config = {
		cognito: {
			poolId: 'us-east-2',
			poolAppClientId: '',
			poolRegion: 'us-east-2'
		}
	},

	/** Accessor method for retrieving the AWS Cognito configuration
	 * @returns object The congnito configuration object containing
	 * 'poolId', 'poolAppClientId' and 'poolRegion' keys and values
	 */
	aws.cfg_cognito = function() {
		return aws.config.cognito;
	}

})(aon.aws = aon.aws || {});
})(window.aon = window.aon || {});
