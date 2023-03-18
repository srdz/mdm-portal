# User Timeout [![Build Status](https://travis-ci.org/lleblanc42/jquery-userTimeout.svg?branch=master)](https://travis-ci.org/lleblanc42/jquery-userTimeout) [![GitHub version](https://badge.fury.io/gh/lleblanc42%2Fjquery-userTimeout.svg)](https://badge.fury.io/gh/lleblanc42%2Fjquery-userTimeout)

This handy little plugin will integrate nicely into your websites user system to prompt the user when their session is timing out with either a modal (utilizing Twitter Bootstrap) or a dialog (utilizing jQuery UI). All it needs to run is one of the two dependencies previously mentioned and a URL to the page that logs them off of your system.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/lleblanc42/jQuery-userTimeout/master/dist/jquery-userTimeout.min.js
[max]: https://raw.github.com/lleblanc42/jQuery-userTimeout/master/dist/jquery-userTimeout.js

Before using this plugin, you need to have one of two dependencies in your website (and of course the latest jQuery 1.x or 2.x):
* Twitter Bootstrap (v3)
* jQuery UI (latest version recommended)

Point to the plugin in the HTML in either the head or just before the ending body tag (the preferred method when using HTML5 Bootstrap) in your web page will the following line of code:

```html
<script src="js/jquery-userTimeout.min.js"></script>
```

To initialize the plugin, you need to put the following code block (wrapped in the script tag) in the HTML of your web page in either the head or just before the ending body tag (the preferred method when using HTML5 Bootstrap):

```javascript
$(document).userTimeout({
	logouturl: 'logout.html'
});
```

Make sure to change the logouturl option to point to the web page that will properly log the user out.

## Options

| Option Name | Default Value | Acceptable Input | Description |
| ------------- | ------------- | ------------- | ------------- |
| logouturl | null | a URL | The URL the plugin will redirect the user too once the session has expired |
| referer | false | false, 'auto' or a URL | This will add either the URL of the page the user is on when they time out (auto), or the defined URL via the GET method |
| refererName | 'refer' | plain text | Specify the name of the GET Method variable to be passed to the login form |
| notify | true | true or false | If set to false, no notification (modal or dialog) will be displayed to the user, it will just log the user off |
| timer | true | true or false | Includes a countdown timer on the 'Stay Logged In' button (only available for bootstrap) |
| session | 600000 | time in miliseconds | The time in which the user has until the notification displays or is logged off if notify is set to false |
| force | 10000 | time in miliseconds | The time in which the user has to respond to the notification if notify is set to true |
| ui | 'auto' | 'auto', 'bootstrap' or 'jqueryui' | If set to auto, it will check to see if either the Twitter Bootstrap 3 or jQuery UI libraries are loaded, or will utilize whatever is passed as an argument (prioritizes bootstrap over jQuery UI) |
| debug | false | true or false | If set to true, it will display an alert if the plugin is misconfigured |
| modalTitle | 'Session Timeout | plain text | The text that gets put in the title of the notification |
| modalBody | 'You\'re being timed out due to inactivity. Please choose to stay signed in or to logoff. Otherwise, you will logged off automatically.' | plain text | The text that gets put into the body of the notification |
| modalLogOffBtn | 'Log Off' | plain text | The log off button text in the notification |
| modalStayLoggedBtn | 'Stay Logged In' | plain text | The stay logged in button text in the notification |

The plugin comes with some basic error checking. It will display an alert box if the logouturl was not supplied or if either the jQuery UI or Twitter Bootstrap 3 libraries were not found. The plugin will tell the user they need to configure the plugin if the debug option is set to true, following with killing the plugin to allow the user to coninue their session and not be affected with the misconfiguration.

## Examples
_(Coming soon)_

## Feature Release Plans
- [ ] Comprehensive testing of jQuery library compatibility
- [ ] Include proper QUnit testing
- [ ] Add callbacks
- [ ] Add checks to prevent overlapping modals
- [x] Add new customization options for the modal/dialog buttons
- [x] Detailed comments in the source code (apologize for lack therof)
- [x] Check if site utilizes Twitter Bootstrap
- [x] Check if site utilizes jQuery UI
- [x] Add debug mode
- [x] Add referer capabilities
- [x] Add countdown timer
- [x] Create more reliable timer

## Release History
v0.5.1
* Fixed a bug where it wasn't properly resetting the startTimer bind which caused issues with displaying modals/dialogs multiple times

v0.5.0
* Added two new options to allow customization of the button text

v0.4.0
* Cleaned up the code
* Completely rewrote the timer logic to make it more relaible
* Removed some redundant code
* Updated force default option to 10 seconds instead of 5 minutes (made more sense)

v0.3.0
* Cleaned up some of the code
* Fixed a few minor bugs
* Added comments to the functions
* Added support for console errors if debugging is off
* Included focus as a document event

v0.2.0
* Checks if either of the required libraries are installed
* Added a debug option
* Added referer capabilities
* Added a countdown timer to the bootstrap modal
* Added license information
* Cleaned up some of the code

First official release! v0.1.0