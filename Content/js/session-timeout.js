$(document).ready(function () {
    $(document).userTimeout({
        // ULR to redirect to, to log user out
        logouturl: '/Home/Logout',
        // URL Referer - false, auto or a passed URL
        referer: false,
        // Name of the passed referal in the URL
        refererName: 'refer',
        // Toggle for notification of session ending
        notify: true,
        // Toggle for enabling the countdown timer
        timer: true,
        // 19 Minutes in Milliseconds (600000), then notification of logout
        session: 1140000,
        // 5 Minutes in Milliseconds, then logout
        force: 300000,
        // Model Dialog selector (auto, bootstrap, jqueryui)
        ui: 'bootstrap',
        // Shows alerts
        debug: true,
        // Modal Title
        modalTitle: 'Session Expiration Warning',
        // Modal Body
        modalBody: 'You\'re being timed out due to inactivity. Please choose to stay signed in or to logoff. Otherwise, you will logged off automatically.',
        // Modal log off button text
        modalLogOffBtn: 'Log Off',
        // Modal stay logged in button text
        modalStayLoggedBtn: 'Stay Logged In'
    });
});