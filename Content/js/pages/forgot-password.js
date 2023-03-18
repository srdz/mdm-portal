$(document).ready(function () {
    $.ajaxSetup({
        cache: false
    });

    $(document).on('click', '.btn-forgot-password', function () {
        if (!fnIsEmpty($("#inputEmail").val())) {
            fnForgotPassword($("#inputEmail").val());
        }
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

    // Reset password
    function fnForgotPassword(email) {
        if (!fnIsEmpty(email)) {
            $.ajax({
                url: "/Home/ForgotPassword",
                type: "POST",
                data: {
                    email: email
                },
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            //data.error
                            $("#error-text").html(data.error);
                            $("#error-alert").removeClass("hide").addClass("show");
                        } else {
                            //data.success
                            $("#info-text").html(data.success);
                            $("#info-alert").removeClass("hide").addClass("show");
                        }
                    }
                },
                error: function (error) {
                    console.log("fnForgotPassword error", error);
                }
            });
        } else {
            $(".card-header").notify(
                "An error occurred",
                { position: "top-center" }
            );
        }
    }
});