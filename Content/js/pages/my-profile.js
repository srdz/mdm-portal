// JS file for My Profile page
$(document).ready(function () {
    $.ajaxSetup({
        cache: false
    });

    // Hide Stewardship side bar if not data present
    if (sessionStorage.getItem("isStewardshipExist") == "True") {
        $("#stewardship-sidebar").show();
    } else {
        $("#stewardship-sidebar").hide();
    }

    // Hide Account side bar if not data present
    if (sessionStorage.getItem("isAccountExist") == "True") {
        $("#accounts-sidebar").show();
    } else {
        $("#accounts-sidebar").hide();
    }

    // Get user object
    fnGetUserObject();

    $(document).on('click', '.btn-update-my-profile', function () {
        var userObj = JSON.parse(sessionStorage.getItem('userObject'));

        if (!fnIsEmpty(userObj._id)) {
            var b = fnValidateForm($("#username").val(), $("#password").val(), $("#confirm-password").val());

            if (b) {
                var r = fnUpdatePassword(userObj._id, $("#password").val());

                if (r.status == "success") {
                    $.notify("Your password has been successfully updated.", {
                        className: 'success',
                        clickToHide: true,
                        autoHide: true,
                        globalPosition: 'top center'
                    });
                }                
            }
        } else {
            $.notify("An error occured, please validate your information or contact your administrator.", {
                className: 'error',
                clickToHide: true,
                autoHide: true,
                globalPosition: 'top center'
            });
        }
    });

    // Get user object value from local storage
    function fnGetUserObject() {
        if (sessionStorage.getItem('userObject')) {
            var userObj = JSON.parse(sessionStorage.getItem('userObject'));

            $("#firstName").val(userObj.firstname);
            $("#lastName").val(userObj.lastname);
            $("#username").val(userObj.username);
            $("#email").val(userObj.email);
            $("#role").val(userObj.role);
            $("#territory").val(userObj.territory);
        }
    }

    // Update my profile password
    function fnUpdatePassword(user_id, password) {
        var result = null;

        if (!fnIsEmpty(user_id) && !fnIsEmpty(password)) {
            $.ajax({
                url: "/Home/UpdateMyProfilePassword",
                type: "POST",
                async: false,
                data: { user_id: user_id, password: password },
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnUpdatePassword on success error", data.error);
                        }
                    } else {
                        console.log("fnUpdatePassword on success", data);
                    }

                    result = data;
                },
                complete: function () {
                    // when all complete need to clear form
                    $("#password").val("");
                    $("#confirm-password").val("");
                },
                error: function (err) {
                    console.log("fnUpdatePassword error", err);
                }
            });
        }

        return result;
    }

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

    // Validate form
    function fnValidateForm(username, password, confirmpassword) {
        if (username == "") {
            $.notify("Error: Username cannot be blank!", {
                className: 'error',
                clickToHide: true,
                autoHide: true,
                globalPosition: 'top center'
            });

            return false;
        }

        if (password != "" && password == confirmpassword) {
            if (password.length < 6) {
                $.notify("Error: Password must contain at least six characters!", {
                    className: 'error',
                    clickToHide: true,
                    autoHide: true,
                    globalPosition: 'top center'
                });

                return false;
            }

            if (password == username) {
                $.notify("Error: Password must be different from Username!", {
                    className: 'error',
                    clickToHide: true,
                    autoHide: true,
                    globalPosition: 'top center'
                });

                return false;
            }

            re = /[0-9]/;
            if (!re.test(password)) {
                $.notify("Error: password must contain at least one number (0-9)!", {
                    className: 'error',
                    clickToHide: true,
                    autoHide: true,
                    globalPosition: 'top center'
                });

                return false;
            }

            re = /[a-z]/;
            if (!re.test(password)) {
                $.notify("Error: password must contain at least one lowercase letter (a-z)!", {
                    className: 'error',
                    clickToHide: true,
                    autoHide: true,
                    globalPosition: 'top center'
                });

                return false;
            }

            re = /[A-Z]/;
            if (!re.test(password)) {
                $.notify("Error: password must contain at least one uppercase letter (A-Z)!", {
                    className: 'error',
                    clickToHide: true,
                    autoHide: true,
                    globalPosition: 'top center'
                });

                return false;
            }
        } else {
            $.notify("Error: Please check that you've entered and confirmed your password!", {
                className: 'error',
                clickToHide: true,
                autoHide: true,
                globalPosition: 'top center'
            });

            return false;
        }

        return true;
    }

    // Logout and remove local/session storage
    $(document).on('click', '.btn-logout', function () {
        $.ajax({
            url: "/Home/Logout",
            type: "GET",
            success: function (data) {
                // Delete storage
                window.localStorage.clear();
                window.sessionStorage.clear();

                window.location.href = "/Home/Login/";
            },
            error: function (x, y, z) {
                console.log(x.responseText + "  " + x.status);
            }
        });
    });
});