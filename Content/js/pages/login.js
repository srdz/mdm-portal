$(document).ready(function () {
    $.ajaxSetup({
        cache: false
    });

    // Generate json files
    fnGenerateSourcesFile();
    //fnGenerateStewardshipFile();
    //fnGenerateBestAddressFile();

    // Load data for charts
    fnGetChangeRequestByType();
    fnTopTenCredentials();
    fnStewardshipValidationStatus(fnStewardshipValidated(), fnStewardshipNotValidated());
    fnCustomerInSource();
    fnStewardshipRequestPerYear();
    fnChangeRequestPerYear();

    fnStewardshipExist();
    fnAccountExist();
    fnExceptionExist();

    // That will delete the key before the browser window/tab is closed and prompts you to confirm the close window/tab action.
    window.onbeforeunload = function (e) {
        localStorage.clear();
    };

    // Store value in browser cookie
    fnBrowserCookie();
    
    $(function () {
        $(".btn-login").on("click", function (e) {
            var form = $("#login-form")[0];
            var isValid = form.checkValidity();

            if (!isValid) {
                e.preventDefault();
                e.stopPropagation();
            }

            form.classList.add('was-validated');
        });
    });

    // Authenticate user
    fnLoginUser();

    // Validation if parameter is empty
    function fnIsEmpty(val) {
        // []        true, empty array
        // {}        true, empty object
        // null      true
        // undefined true
        // ""        true, empty string
        // ''        true, empty string
        // 0         false, number
        // true      false, boolean
        // false     false, boolean
        // Date      false
        // function  false

        if (val === undefined) {
            return true;
        }

        if (typeof (val) == 'function' || typeof (val) == 'number' || typeof (val) == 'boolean' || Object.prototype.toString.call(val) === '[object Date]') {
            return false;
        }

        if (val == null || val.length === 0) {
            // null or 0 length array
            return true;
        }

        if (typeof (val) == "object") {
            // empty object
            var r = true;

            for (var f in val) {
                r = false;
            }

            return r;
        }
    }

    // Browser cookie
    function fnBrowserCookie() {
        $(document).on("click", "#remember-me:checkbox", function () {
            if ($(this).is(":checked")) {
                var username = $('#inputUsername').val();
                var password = $('#inputPassword').val();

                // set cookies to expire in 14 days
                $.cookie('username', username, { expires: 14 });
                $.cookie('password', password, { expires: 14 });
                $.cookie('remember', true, { expires: 14 });
            } else {
                // reset cookies
                $.cookie('username', null);
                $.cookie('password', null);
                $.cookie('remember', null);
            }
        });

        var remember = $.cookie('remember');

        if (remember == 'true') {
            var username = $.cookie('username');
            var password = $.cookie('password');

            // autofill the fields
            $('#inputUsername').val(username);
            $('#inputPassword').val(password);
            $('#remember-me').prop("checked", true);
        }
    }

    function fnLoginUser() {
        $(document).on('click', '.btn-login', function (e) {
            var user = $("#inputUsername").val().trim();
            var pwd = $("#inputPassword").val().trim();

            if (!fnIsEmpty(user) && !fnIsEmpty(pwd)) {
                $.ajax({
                    url: "/Home/Login",
                    type: "POST",
                    data: {
                        username: user, password: pwd, __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val()
                    },
                    success: function (data) {
                        if (data != null) {
                            if (data.error) {
                                //data.error
                                $("#error-text").html(data.error);
                                $("#error-alert").removeClass("hide").addClass("show");

                                $("#error-alert").fadeTo(10000, 500).slideUp(500, function () {
                                    $("#error-alert").alert('close');
                                });
                            } else {
                                window.location.href = "/Home/Overview/";
                            }
                        }
                    },
                    error: function (error) {
                        $("#error-text").html("Authentication failed, please try again.");
                        $("#error-alert").removeClass("hide").addClass("show");

                        $("#error-alert").fadeTo(10000, 500).slideUp(500, function () {
                            $("#error-alert").alert('close');
                        });
                    }
                });
            } else {
                // username empty
                if (fnIsEmpty(user)) {
                    $("#error-text").html("Username cannot be empty.");
                    $("#error-alert").removeClass("hide").addClass("show");

                    $("#error-alert").fadeTo(10000, 500).slideUp(500, function () {
                        $("#error-alert").alert('close');
                    });
                }

                // password empty
                if (fnIsEmpty(pwd)) {
                    $("#error-text").html("Password cannot be empty.");
                    $("#error-alert").removeClass("hide").addClass("show");

                    $("#error-alert").fadeTo(10000, 500).slideUp(500, function () {
                        $("#error-alert").alert('close');
                    });
                }

                // username/password empty
                if (fnIsEmpty(user) && fnIsEmpty(pwd)) {
                    $("#error-text").html("Username/password cannot be empty.");
                    $("#error-alert").removeClass("hide").addClass("show");

                    $("#error-alert").fadeTo(10000, 500).slideUp(500, function () {
                        $("#error-alert").alert('close');
                    });
                }
            }
        });

        $(document).keypress(function (event) {
            var user = $("#inputUsername").val().trim();
            var pwd = $("#inputPassword").val().trim();
            var keycode = (event.keyCode ? event.keyCode : event.which);

            if (keycode == '13') {
                if (!fnIsEmpty(user) && !fnIsEmpty(pwd)) {
                    $.ajax({
                        url: "/Home/Login",
                        type: "POST",
                        data: {
                            username: user, password: pwd, __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val()
                        },
                        success: function (data) {
                            if (data != null) {
                                if (data.error) {
                                    //data.error
                                    $("#error-text").html(data.error);
                                    $("#error-alert").removeClass("hide").addClass("show");

                                    $("#error-alert").fadeTo(10000, 500).slideUp(500, function () {
                                        $("#error-alert").alert('close');
                                    });
                                } else {
                                    window.location.href = "/Home/Overview/";
                                }
                            }
                        },
                        error: function (error) {
                            $("#error-text").html("Authentication failed, please try again.");
                            $("#error-alert").removeClass("hide").addClass("show");

                            $("#error-alert").fadeTo(10000, 500).slideUp(500, function () {
                                $("#error-alert").alert('close');
                            });
                        }
                    });
                } else {
                    // username empty
                    if (fnIsEmpty(user)) {
                        $("#error-text").html("Username cannot be empty.");
                        $("#error-alert").removeClass("hide").addClass("show");

                        $("#error-alert").fadeTo(10000, 500).slideUp(500, function () {
                            $("#error-alert").alert('close');
                        });
                    }

                    // password empty
                    if (fnIsEmpty(pwd)) {
                        $("#error-text").html("Password cannot be empty.");
                        $("#error-alert").removeClass("hide").addClass("show");

                        $("#error-alert").fadeTo(10000, 500).slideUp(500, function () {
                            $("#error-alert").alert('close');
                        });
                    }

                    // username/password empty
                    if (fnIsEmpty(user) && fnIsEmpty(pwd)) {
                        $("#error-text").html("Username/password cannot be empty.");
                        $("#error-alert").removeClass("hide").addClass("show");

                        $("#error-alert").fadeTo(10000, 500).slideUp(500, function () {
                            $("#error-alert").alert('close');
                        });
                    }
                }
            }
        });
    }
    
    // Store to local storage - for state statistics
    function fnGenerateSourcesFile() {
        $.ajax({
            url: "/Home/GenerateSourcesFile",
            type: "GET",
            complete: function () {
                console.log("fnGenerateSourcesFile complete");
            },
            error: function (err) {
                console.log("fnGenerateSourcesFile error catch", err);
            }
        });
    }

    // Get all data from json file (query-stewardship.json)
    function fnGenerateStewardshipFile() {
        $.ajax({
            url: "/Home/GenerateStewardshipFile",
            type: "GET",
            success: function (data) {
                console.log("fnGenerateStewardshipFile complete");
            },
            error: function (err) {
                console.log("fnGenerateStewardshipFile error catch", err);
            }
        });
    }

    // Get all data from json file (query-bestaddress.json)
    function fnGenerateBestAddressFile() {
        $.ajax({
            url: "/Home/GenerateBestAddressFile",
            type: "GET",
            success: function (data) {
                console.log("fnGenerateBestAddressFile complete");
            },
            error: function (err) {
                console.log("fnGenerateBestAddressFile error catch", err);
            }
        });
    }

    // Change Request by Type
    function fnGetChangeRequestByType() {
        $.ajax({
            url: "/Home/ChangeRequestByType",
            type: "GET",
            success: function (data) {
                sessionStorage.setItem("change-request-by-type", data);
            },
            error: function (err) {
                console.log("fnGetChangeRequestByType error catch", err);
            },
            complete: function () {
                console.log("fnGetChangeRequestByType complete");
            }
        });
    }

    // Top 10 Credentials
    function fnTopTenCredentials() {
        $.ajax({
            url: "/Home/TopTenCredentials",
            type: "GET",
            success: function (data) {
                sessionStorage.setItem("top-ten-credentials", data);
            },
            error: function (err) {
                console.log("fnTopTenCredentials error catch", err);
            },
            complete: function () {
                console.log("fnTopTenCredentials complete");
            }
        });
    }

    // Stewardship Validation Status
    function fnStewardshipValidationStatus(validated, not_validated) {
        if (!fnIsEmpty(validated) && !fnIsEmpty(not_validated)) {
            var arr = [];
            var count = 0;
            var obj = {};

            obj = {
                'label': "Validation Completed",
                'y': validated
            }

            arr.push(obj);

            obj = {
                'label': "Validation Not Completed (all other cases)",
                'y': not_validated
            }

            arr.push(obj);

            sessionStorage.setItem("stewardship-validation-status", JSON.stringify(arr));
        }
    }

    // Stewardship Not Validated
    function fnStewardshipNotValidated() {
        var result = "";

        $.ajax({
            url: "/Home/StewardshipNotValidated",
            type: "GET",
            async: false,
            success: function (data) {
                result = data.data;
            },
            error: function (err) {
                console.log("fnStewardshipNotValidated error catch", err);
            },
            complete: function () {
                console.log("fnStewardshipNotValidated complete");
            }
        });

        return result;
    }

    // Stewardship Validated
    function fnStewardshipValidated() {
        var result = "";

        $.ajax({
            url: "/Home/StewardshipValidated",
            type: "GET",
            async: false,
            success: function (data) {
                result = data.data;
            },
            error: function (err) {
                console.log("fnStewardshipValidated error catch", err);
            },
            complete: function () {
                console.log("fnStewardshipValidated complete");
            }
        });

        return result;
    }

    function fnCustomerInSource() {
        $.ajax({
            url: "/Home/CustomerInSource",
            type: "GET",
            success: function (data) {
                sessionStorage.setItem("customer-in-source", data);
            },
            error: function (err) {
                console.log("fnCustomerInSource error catch", err);
            },
            complete: function () {
                console.log("fnCustomerInSource complete");
            }
        });
    }

    // Stewardship Request Per Year
    function fnStewardshipRequestPerYear() {
        $.ajax({
            url: "/Home/StewardshipRequestPerYear",
            type: "GET",
            success: function (data) {
                sessionStorage.setItem("stewardship-request-per-year", data);
            },
            error: function (err) {
                console.log("fnStewardshipRequestPerYear error catch", err);
            },
            complete: function () {
                console.log("fnStewardshipRequestPerYear complete");
            }
        });
    }

    // Change Request Request Per Year
    function fnChangeRequestPerYear() {
        $.ajax({
            url: "/Home/ChangeRequestPerYear",
            type: "GET",
            success: function (data) {
                sessionStorage.setItem("change-request-per-year", data);
            },
            error: function (err) {
                console.log("fnChangeRequestPerYear error catch", err);
            },
            complete: function () {
                console.log("fnChangeRequestPerYear complete");
            }
        });
    }

    // Stewardship exist
    function fnStewardshipExist() {
        $.ajax({
            url: "/Home/StewardshipExist",
            type: "GET",
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnStewardshipExist on success error", data.error);
                    } else {
                        sessionStorage.setItem("isStewardshipExist", data);

                        console.log("fnStewardshipExist success", data);
                    }
                }
            },
            error: function (error) {
                console.log("fnStewardshipExist error", error);
            }
        });
    }

    // Account exist
    function fnAccountExist() {
        $.ajax({
            url: "/Home/AccountExist",
            type: "GET",
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnAccountExist on success error", data.error);
                    } else {
                        sessionStorage.setItem("isAccountExist", data);

                        console.log("fnAccountExist success", data);
                    }
                }
            },
            error: function (error) {
                console.log("fnAccountExist error", error);
            }
        });
    }

    // Exception exist
    function fnExceptionExist() {
        $.ajax({
            url: "/Home/ExceptionExist",
            type: "GET",
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnExceptionExist on success error", data.error);
                    } else {
                        sessionStorage.setItem("isExceptionExist", data);

                        console.log("fnExceptionExist success", data);
                    }
                }
            },
            error: function (error) {
                console.log("fnExceptionExist error", error);
            }
        });
    }
});