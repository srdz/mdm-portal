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

    fnGetAllTerritory();
    fnGetUsers();

    // Populate territory dropdown
    if (localStorage.getItem("Territories") != null) {
        let dropdown = $('#ddTerritory');

        dropdown.empty();

        dropdown.append('<option value="" selected>Select a territory...</option>');
        dropdown.prop('selectedIndex', 0);

        // Populate dropdown
        $.each(JSON.parse(localStorage.getItem("Territories")), function (key, entry) {
            dropdown.append($('<option></option>').attr('value', entry.ID).text(entry.Name));
        });

        dropdown.select2({
            dropdownAutoWidth: true,
            width: '100%'
        });

        $("#ddRole").select2({
            dropdownAutoWidth: true,
            width: '100%'
        });
    }

    // Registration
    $(document).on('click', '.btn-register', function () {
    //    $.ajax({
    //        url: "/Home/SendVerificationLinkEmail",
    //        type: "POST",
    //        data: {
    //            //email: "Stephanie.Rodriguez@Symphonyhealth.com",
    //            email: "Stephanie.Rodriguez@Symphonyhealth.com",
    //            password: "Demo123"
    //        },
    //        success: function (data) {
    //            console.log("SendVerificationLinkEmail", data);
    //        },
    //        error: function (error) {
    //            console.log("SendVerificationLinkEmail error", error);
    //        }
    //    });

    //    return;

        var rg_fname = $("#firstName").val();
        var rg_lname = $("#lastName").val();
        var rg_username = $("#inputUsername").val();
        var rg_email = $("#inputEmail").val();
        var rg_password = $("#inputPassword").val();
        var rg_role = $("#ddRole").val();
        var rg_session_user = (!fnIsEmpty(sessionStorage.userObject)) ? JSON.parse(sessionStorage.userObject).username : null;
        var rg_territory = $('#ddTerritory').val();

        // Validate first name
        if (fnIsEmpty(rg_fname)) {
            $("#firstName").addClass("is-invalid");
        } else {
            $("#firstName").removeClass("is-invalid");
        }

        // Validate last name
        if (fnIsEmpty(rg_lname)) {
            $("#lastName").addClass("is-invalid");
        } else {
            $("#lastName").removeClass("is-invalid");
        }

        // Validate username
        if (fnIsEmpty(rg_username)) {
            $("#inputUsername").addClass("is-invalid");
        } else {
            $("#inputUsername").removeClass("is-invalid");
        }

        // Validate email
        if (fnIsEmpty(rg_email)) {
            $("#inputEmail").addClass("is-invalid");
        } else {
            $("#inputEmail").removeClass("is-invalid");
        }

        // Validate password
        if (fnIsEmpty(rg_password)) {
            $("#inputPassword").addClass("is-invalid");
        } else {
            $("#inputPassword").removeClass("is-invalid");
        }

        // Validate role
        if (fnIsEmpty(rg_role)) {
            $("#ddRole").addClass("is-invalid");
        } else {
            $("#ddRole").removeClass("is-invalid");
        }

        if (!fnIsEmpty(rg_fname) && !fnIsEmpty(rg_lname) && !fnIsEmpty(rg_username) && !fnIsEmpty(rg_email) && !fnIsEmpty(rg_password) && !fnIsEmpty(rg_role) && !fnIsEmpty(rg_session_user)) {
            fnRegisterAccount(rg_fname, rg_lname, rg_username, rg_email, rg_password, rg_role, rg_territory, rg_session_user);
        } else {
            $(".card-header").notify(
                "Error on registration",
                { position: "top-center" }
            );
        }
    });

    // Register an account - only for admin
    function fnRegisterAccount(fname, lname, username, email, password, role, territory, created_by) {
        $.ajax({
            url: "/Home/Register",
            type: "POST",
            data: {
                fname: fname,
                lname: lname,
                username: username,
                email: email,
                password: password,
                role: role,
                territory: territory,
                created_by: created_by,
                __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val()
            },
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnRegisterAccount on success error", data.error);

                        var el = ".card-header";

                        if (data.error == "Email address already exist.") {
                            el = "#inputEmail";
                        }else if (data.error = "Username already exist, please try a different username.") {
                            el = "#inputUsername";
                        }

                        $(el).notify(
                            data.error,
                            { position: "top-center" }
                        );
                    } else {
                        $.notify(data.success, {
                            className: 'success',
                            clickToHide: true,
                            autoHide: true,
                            globalPosition: 'top center'
                        });

                        // Clean form
                        $('div').find('form')[0].reset();
                        $('#ddRole, #ddTerritory').prop('selectedIndex', 0).change();

                        // Refresh Datatable
                        fnGetUsers();
                    }
                }
            },
            error: function (error) {
                console.log("fnRegisterAccount error", error);
            }
        });
    }

    // Get all territory
    function fnGetAllTerritory() {
        var arr_terr =[];

        $.ajax({
            url: "/Home/GetAllTerritory",
            type: "GET",
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetAllTerritory on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            arr_terr.push({ ID: i.Territory_ID, Name: i.Territory_Name });
                        });

                        fnLoadDataToLocalStorage("Territories", arr_terr);
                    }
                }
            },
            error: function (error) {
                console.log("fnGetAllTerritory error", error);
            }
        });
    }

    // Store data to local storage
    function fnLoadDataToLocalStorage(key, value) {
        if (!fnIsEmpty(key) && !fnIsEmpty(value)) {
            if (localStorage.getItem(key) == null) {
                var obj_serialized = JSON.stringify(value);

                localStorage.setItem(key, obj_serialized);
            } else {
                localStorage.getItem(key);
            }
        }
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

    // Get all users
    function fnGetUsers() {
        $.ajax({
            url: "/Home/GetUsers",
            type: "GET",
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetUsers on success error", data.error);
                    } else {
                        var obj = [];

                        $.each(data.data, function (index, i) {
                            obj.push({
                                index: index,
                                _id: i._id,
                                username: i.username,
                                email: i.email,
                                firstname: i.firstname,
                                lastname: i.lastname,
                                role: i.role,
                                territory: i.territory,
                                status: i.status,
                                creationdate: i.creationdate,
                                lastmodifieddate: i.lastmodifieddate,
                                created_by: i.created_by,
                                modified_by: i.modified_by
                            });
                        });

                        fnLoadDatatable(obj);
                    }
                }
            },
            error: function (error) {
                console.log("fnGetUsers error", error);
            }
        });
    }

    // Update user record
    function fnUpdateUserRecord(user_id, username, role, territory, status, modified_by) {
        if (!fnIsEmpty(user_id) && !fnIsEmpty(username)) {
            $.ajax({
                url: "/Home/UpdateUserRecord",
                type: "POST",
                data: {
                    user_id: user_id,
                    username: username,
                    role: role,
                    territory: territory,
                    status: status,
                    modified_by: modified_by
                },
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnUpdateUserRecord on success error", data.error);

                            $.notify(data.error, {
                                className: 'error',
                                clickToHide: true,
                                autoHide: true,
                                globalPosition: 'top center'
                            });
                        } else {
                            console.log("fnUpdateUserRecord", data);
                        }
                    }
                },
                complete: function () {
                    // Close modal
                    $(`#modalCenter-${user_id}`).modal('hide');

                    // Refresh Datatable
                    fnGetUsers();
                },
                error: function (error) {
                    console.log("fnUpdateUserRecord error", error);
                }
            });
        }
    }

    // Update record on click
    $(document).on("click", ".btn-update-record", function () {
        var role = $(`.ddr-${$(this).val()}`).val();
        var territory = $(`.ddt-${$(this).val()}`).val();
        var status = $(`.dds-${$(this).val()}`).val();
        var username = $(`.user-${$(this).val()}`).val();
        var user_id = $(this).val();

        fnUpdateUserRecord(user_id, username, role, territory, status, JSON.parse(sessionStorage.userObject).username);
    });

    // Load data to dataTable
    function fnLoadDatatable(data) {
        if (data.length > 0) {
            console.log("fnLoadDatatable data", data);

            var oTable = $("#dataTable").DataTable({
                "bDestroy": true,
                "bServerSide": false,
                "bProcessing": true,
                "oLanguage": {
                    "sSearch": "Global Search:"
                },
                "bAutoWidth": true,
                "bPagination": true,
                "sPaginationType": "full_numbers",
                "bDeferRender": true,
                "bFilter": true,
                "orderCellsTop": true,
                "fixedHeader": true,
                "dom": '<"top">rt<"bottom"flpi><"clear">',
                "sDom": "Rlfrtip",
                "aaData": data,
                "aoColumns": [
                    {
                        "mDataProp": "username", // 0 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "mDataProp": "email", // 1 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "mDataProp": "firstname", // 2 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "mDataProp": "lastname", // 3 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "mDataProp": "role", // 4 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "mDataProp": "territory", // 5 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "mDataProp": "status", // 6 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            var s = "success";

                            if (data != "active") {
                                s = "danger";
                            }

                            return `<span class="badge badge-${s}">${data.toUpperCase()}</span>`;
                        }
                    },
                    {
                        "mDataProp": "creationdate", // 7 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            return data;
                        }
                    },
                    {
                        "mDataProp": "lastmodifieddate", // 8 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            return data
                        }
                    },
                    {
                        "mDataProp": "created_by", // 9 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            return data
                        }
                    },
                    {
                        "mDataProp": "modified_by", // 10 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            return data
                        }
                    },
                    {
                        "mDataProp": "_id", // 11 //
                        "bSearchable": true,
                        "bSortable": false,
                        "mRender": function (data, type, full) {
                            var count = full['index'];

                            var html = `<button type="button" class="btn btn-modal-ur btn-sm" data-toggle="modal" data-target="#modalCenter-${data}">Update</button>
                                    
                                    <div class="modal fade" id="modalCenter-${data}" tabindex="-1" role="dialog" aria-labelledby="modalCenterTitle-${data}" aria-hidden="true">
                                        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="modalCenterTitle-${data}">Update User Record</h5>
                                            </div>
                                            <div class="modal-body">
                                                <form>
                                                    <input type="hidden" class="user-id" id="user-id" value="${full['_id']}" />

                                                    <div class="form-group">
                                                        <div class="form-row">
                                                            <div class="col-md-6">
                                                                <div class="form-label-group">
                                                                    <input type="text" id="updateFirstName" class="form-control" placeholder="First name" value="${full['firstname']}" disabled>
                                                                    <label for="updateFirstName">First name</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-md-6">
                                                                <div class="form-label-group">
                                                                    <input type="text" id="updateLastName" class="form-control" placeholder="Last name" value="${full['lastname']}" disabled>
                                                                    <label for="updateLastName">Last name</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <div class="form-row">
                                                            <div class="col-md-6">
                                                                <div class="form-label-group">
                                                                    <input type="text" id="updateUsername" class="form-control user-${full['_id']}" placeholder="Username" value="${full['username']}" disabled>
                                                                    <label for="updateUsername">Username</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-md-6">
                                                                <div class="form-label-group">
                                                                    <input type="email" id="updateEmail" class="form-control" placeholder="Email address" value="${full['email']}" disabled>
                                                            <label for="updateEmail">Email address</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="form-group">
                                                        <div class="form-row">
                                                            <div class="col-md-4">
                                                                <select class="custom-select d-block w-100 updateDDRole ddr-${full['_id']}" id="updateDDRole-${count}" required>
                                                                    <option value="" selected>Please choose a role...</option>
                                                                    <option value="User">User</option>
                                                                    <option value="Admin">Admin</option>
                                                                </select>
                                                            </div>
                                                            <div class="col-md-4">
                                                                <select class="custom-select d-block w-100 updateDDTerritory ddt-${full['_id']}" id="updateDDTerritory-${count}"></select>
                                                            </div>
                                                            <div class="col-md-4">
                                                                <select class="custom-select d-block w-100 updateDDStatus dds-${full['_id']}" id="updateDDStatus-${count}" required>
                                                                    <option value="">Please choose a status...</option>
                                                                    <option value="active">Active</option>
                                                                    <option value="inactive">Inactive</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                                <button type="button" class="btn btn-update-record" value="${full['_id']}">Save changes</button>
                                            </div>
                                        </div>
                                        </div>
                                    </div>`;

                            return html;
                        }
                    }
                ],                  
                "initComplete": function (settings, json) {
                    if (localStorage.getItem("Territories") != null) {
                        let dropdown = $('.updateDDTerritory');

                        dropdown.empty();

                        dropdown.append('<option value="" selected>Please choose a territory...</option>');
                        dropdown.prop('selectedIndex', 0);

                        // Populate dropdown
                        $.each(JSON.parse(localStorage.getItem("Territories")), function (key, entry) {
                            dropdown.append($('<option></option>').attr('value', entry.ID).text(entry.Name));
                        });

                        dropdown.select2();
                        $(".updateDDTerritory").select2({
                            dropdownAutoWidth: true,
                            width: '100%'
                        });
                    }

                    this.api().columns([4, 5, 6]).every(function (e) {
                        var column = this;

                        column.data().each(function (d, j) {
                            // Role
                            if (e == 4) {
                                $(`#updateDDRole-${j}`).val(d);
                            }

                            // Territory
                            if (e == 5) {
                                if (!fnIsEmpty(d)) {
                                    $(`#updateDDTerritory-${j}`).val(d);
                                } else {
                                    $(`#updateDDTerritory-${j} option:first`).attr('selected', 'selected');
                                }                                
                            }

                            // Status
                            if (e == 6) {
                                $(`#updateDDStatus-${j}`).val(d);
                            } 
                        });
                    });
                }
            });
        }
    }
});