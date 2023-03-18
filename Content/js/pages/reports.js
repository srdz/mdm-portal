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

    fnGetPredefinedReport();
    fnLoadPredefinedReportData();

    $(".report-table, .sl-table").select2({
        dropdownAutoWidth: true,
        width: '100%'
    });

    // Insert to database saved search
    function fnGetSavedSearch(table) {
        if (!fnIsEmpty(table)) {
            $.ajax({
                url: '/Home/GetSavedSearch',
                type: 'POST',
                data: {
                    table: table,
                    user: JSON.parse(sessionStorage.getItem('userObject')).username
                },
                beforeSend: function () {
                    $(".loader").show();
                    $(".loader").css("z-index", 20);
                    $("#content-wrapper").css("opacity", 0.1);
                },
                success: function (data) {
                    var html = "";

                    $.each(data.data, function (index, i) {
                        if (!fnIsEmpty(i.search_name)) {
                            html += `&nbsp;&nbsp; <button type="button" class="btn btn-bookmark" value="${i._id}"><i class="far fa-bookmark fa-1x"></i> ${i.search_name}</button><button type="button" value="${i._id}" class="btn btn-link btn-remove-search"><i class="fas fa-trash"></i></button>`;
                        }
                    });

                    $("#bookmark").html(html);
                },
                error: function (err) {
                    console.log("fnGetSavedSearch error", err);
                }
            });
        }
    }

    function fnSaveReport() {
        $(".custom-file-input").on("change", function () {
            var fileName = $(this).val().split("\\").pop();

            $(this).siblings(".custom-file-label").addClass("selected").html(fileName);

            $(document).on("click", ".btn-save-report", function () {
                if (window.FormData == undefined) {
                    $("#customFile").notify(
                        "Error: FormData is undefined",
                        { position: "bottom" }
                    );
                } else {
                    var fileUpload = $("#customFile").get(0);
                    var files = fileUpload.files;
                    var fileData = new FormData();

                    fileData.append(files[0].name, files[0]);

                    $.ajax({
                        url: '/Home/UploadFile',
                        type: 'post',
                        datatype: 'json',
                        contentType: false,
                        processData: false,
                        async: false,
                        data: fileData,
                        success: function (response) {
                            var data = "";
                            var cls_name = "error";

                            if (response != null) {
                                if (response.error) {
                                    data = response.error;
                                } else {
                                    data = response.result;
                                    cls_name = "success";
                                }

                                $("#customFile").notify(
                                    data,
                                    {
                                        position: "bottom",
                                        clickToHide: true,
                                        className: cls_name
                                    }
                                );
                            }                            
                        },
                        error: function (err) {
                            console.log("fnSaveReport error", err);

                            $("#customFile").notify(
                                err,
                                { position: "bottom" }
                            );
                        }
                    });
                }
            });
        });
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

        if (val === "") {
            return true;
        }

        if (typeof (val) == 'function' || typeof (val) == 'number' || typeof (val) == 'boolean' || Object.prototype.toString.call(val) === '[object Date]') {
            return false;
        }

        if (typeof (val) == 'undefined') {
            return true;
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
                console.log("Logout and remove local/session storage", x.responseText + "  " + x.status);
            }
        });
    });

    // Predefined Report
    function fnGetPredefinedReport() {
        var arr = [];

        var opt = {
            Customers: [
                { name: "HCPs by Specialties" },
                { name: "HCPs by Credentials" },
                { name: "HCPs by State" },
                { name: "HCPs by Territories" }
            ]
        };

        arr.push(opt);

        if (sessionStorage.getItem("isStewardshipExist") == "True") {
            var opt2 = {
                Stewardship_Online_Validation: [
                    { name: "YTD HCP's Validated" },
                    { name: "2020 HCP's Validated" },
                    { name: "2019 HCP's Validated" },
                    { name: "YTD Status" },
                    { name: "2020 Status" },
                    { name: "2019 Status" }
                ]
            };

            arr.push(opt2);
        }

        if (sessionStorage.getItem("isAccountExist") == "True") {
            var opt3 = {
                Accounts: [
                    { name: "Class of Trade" },
                    { name: "Facility Type" },
                    { name: "Active Account" },
                    { name: "Inactive Account" }
                ]
            };

            arr.push(opt3);
        }

        if (sessionStorage.getItem("isExceptionExist") == "True") {
            var opt4 = {
                Exceptions: [
                    { name: "Open Requests" },
                    { name: "Closed Requests" }
                ]
            };

            arr.push(opt4);
        }

        var $select = $('.report-table');

        $.each(arr, function (key, value) {
            $.each(value, function (k, v) {
                var group = $('<optgroup label="' + (k.indexOf("_") != -1 ? k.replaceAll("_", " ") : k) + '" />');

                $.each(v, function () {
                    $('<option />').html(this.name).appendTo(group);
                });

                group.appendTo($select);
            });
        });
    }

    // Load Predefined Report
    function fnLoadPredefinedReportData() {
        $(document).on("change", ".report-table", function () {
            var rName = $(this).val();

            if (!fnIsEmpty($(this).val())) {
                $.ajax({
                    url: "/Home/GetPredefinedReport/",
                    dataType: "json",
                    type: "POST",
                    data: { reportname: $(this).val() },
                    beforeSend: function () {
                        $(".loader").show();
                        $(".loader").css("z-index", 20);
                        $("#content-wrapper").css("opacity", 0.1);
                    },
                    success: function (json) {
                        if (!fnIsEmpty(JSON.parse(json.data)) && !fnIsEmpty(JSON.parse(json.columns))) {
                            var tableHeaders = null;
                            var datatable_columns = [];

                            $.each(JSON.parse(json.columns), function (i, val) {
                                tableHeaders += "<th>" + val + "</th>";

                                var item = {};
                                item.data = val;
                                item.title = val.replace(/_/g, " ").toUpperCase();

                                datatable_columns.push(item);
                            });

                            var json_data = JSON.parse(json.data);

                            if (rName == "YTD HCP's Validated" || rName == "2020 HCP's Validated" || rName == "2019 HCP's Validated") {
                                json_data = JSON.parse(json_data);
                            }

                            $("#dataTableReport thead").remove();

                            $("#dataTableReport").append('<thead><tr>' + tableHeaders + '</tr></thead>');

                            $('#dataTableReport').DataTable().destroy();

                            $('#dataTableReport').DataTable({
                                "bDestroy": true,
                                "bProcessing": true,
                                "bServerSide": false,
                                "bFilter": true,
                                "orderMulti": false,
                                "pageLength": 10,
                                "bPagination": true,
                                "sPaginationType": "full_numbers",
                                "bDeferRender": true,
                                "orderCellsTop": true,
                                "fixedHeader": true,
                                "dom": '<"top">rt<"bottom"flpi><"clear">',
                                "sDom": "Rlfrtip",
                                "sDom": 'Bfrtip',
                                "buttons": [
                                    'copy', 'excel', 'pdf'
                                ],
                                "columns": datatable_columns,
                                //"data": JSON.parse(json.data)
                                "data": json_data
                            });

                            $(".report-csv").show();
                        } else {
                            console.log("table is empty, does not contain data.");
                        }
                    },
                    complete: function () {
                        $(".loader").hide();
                        $("#content-wrapper").css("opacity", "");
                    },
                    error: function (err) {
                        console.log("fnLoadPredefinedReportData error", err);
                    }
                });
            } else if (fnIsEmpty($(this).val())) {
                $('#dataTableReport').DataTable().destroy();

                $("#dataTableReport thead").remove();

                $(".report-csv").hide();
            }
        });
    }
});