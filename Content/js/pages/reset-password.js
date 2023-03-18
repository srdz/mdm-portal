$(document).ready(function () {
    $.ajaxSetup({
        cache: false
    });

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

    $(document).on('click', '.btn-reset', function () {
        if (!fnIsEmpty($("#resetcode").val()) && !fnIsEmpty($("#inputNewPassword").val()) && !fnIsEmpty($("#inputConfirmPassword").val())) {
            var v = fnValidateForm($("#inputNewPassword").val(), $("#inputConfirmPassword").val());

            if (v) {
                fnResetPassword($("#resetcode").val(), $("#inputNewPassword").val());
            } else {
                $("#error-text").html("An error has occured, please validate your information or contact your administrator.");
                $("#error-alert").removeClass("hide").addClass("show");
            }
        } else {
            console.log("error");
        }
    });

    // Reset password from link
    function fnResetPassword(resetcode, newpassword) {
        $.ajax({
            url: "/Home/ResetPassword",
            type: "POST",
            data: {
                resetcode: resetcode,
                newpassword: newpassword,
                __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val()
            },
            success: function (data) {
                if (data != null) {
                    if (data.status == "success") {
                        //data.success
                        $("#success-text").html(data.success);
                        $("#success-alert").removeClass("hide").addClass("show");
                    } else {
                        //data.error
                        $("#error-text").html(data.error);
                        $("#error-alert").removeClass("hide").addClass("show");
                    }
                }
            },
            error: function (error) {
                console.log("fnResetPassword error", error);
            }
        });
    }

    // Validate form
    function fnValidateForm(password, confirmpassword) {
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
});