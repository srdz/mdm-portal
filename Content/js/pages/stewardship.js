$(document).ready(function () {
    $.ajaxSetup({
        cache: false
    });

    // If page is refreshed remove local storage values
    if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
        // Clear data storage values
        fnClearFilterLocalStorage();
    }

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

    fnLoadStewardshipData();

    // Load all project type
    var arrType = fnGetAllType();

    var options = $(".search-project");

    $.each(arrType, function (index, i) {
        options.append(new Option(i, i));
    });

    // Load all Online Validation Status
    var arrOnlineValidationStatus = fnGetAllOnlineValidationStatus();

    var options = $(".search-online-validation-status");

    $.each(arrOnlineValidationStatus, function (index, i) {
        options.append(new Option(i, i));
    });

    // Load all Phone Validation Status
    var arrPhoneValidationStatus = fnGetAllPhoneValidationStatus();

    if (!fnIsEmpty(arrPhoneValidationStatus)) {
        var options = $(".search-phone-validation-status");

        $.each(arrPhoneValidationStatus, function (index, i) {
            options.append(new Option(i, i));
        });

        $(".div-phone-validation-status").show();
    } else {
        $(".div-phone-validation-status").hide();
    }

    $(".created-date").select2({
        placeholder: "Select a Created Date",
        dropdownAutoWidth: true,
        width: '100%'
    });

    $(".submitted-date").select2({
        placeholder: "Select a Submitted Date",
        dropdownAutoWidth: true,
        width: '100%'
    });

    $(".received-date").select2({
        placeholder: "Select a Received Date",
        dropdownAutoWidth: true,
        width: '100%'
    });

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

    // Close filter tag
    $(document).on('click', '.fa-times', function () {
        $(".loader").show();
        $(".loader").css("z-index", 20);
        $("#content-wrapper").css("opacity", 0.1);

        var val = $(this).attr('id');

        if ($(this).attr('id').indexOf("-") > 0) {
            val = $(this).attr('id');
        }

        var table = $("#dataTable").DataTable();

        // Name (1)
        if ($(this).attr('class').indexOf("name") > 0) {
            fnRemoveFilterTag(table, "name", 1, val);
        }

        // Created Date (2)
        if ($(this).attr('class').indexOf("created_date") > 0) {
            fnRemoveFilterTag(table, "created_date", 2, val);

            $.fn.dataTableExt.afnFiltering.length = 0;
            $('#dataTable').dataTable().fnDraw();
        }

        // Submitted Date (3)
        if ($(this).attr('class').indexOf("submitted_date") > 0) {
            fnRemoveFilterTag(table, "submitted_date", 3, val);

            $.fn.dataTableExt.afnFiltering.length = 0;
            $('#dataTable').dataTable().fnDraw();
        }

        // Received Date (4)
        if ($(this).attr('class').indexOf("received_date") > 0) {
            fnRemoveFilterTag(table, "received_date", 4, val);

            $.fn.dataTableExt.afnFiltering.length = 0;
            $('#dataTable').dataTable().fnDraw();
        }

        // Project / Type (5)
        if ($(this).attr('class').indexOf("project") > 0) {
            fnRemoveFilterTag(table, "project", 5, val);

            $('.search-project').val("0");
            $('.search-project').select2().trigger('change');
        }

        // Status (6)
        if ($(this).attr('class').indexOf("status") > 0) {
            fnRemoveFilterTag(table, "status", 6, val);

            $('.search-status').val("1");
            $('.search-status').select2().trigger('change');
        }

        // Online Validation Status (8)
        if ($(this).attr('class').indexOf("online") > 0) {
            fnRemoveFilterTag(table, "online", 8, val);

            $('.search-online-validation-status').val("2");
            $('.search-online-validation-status').select2().trigger('change');
        }

        // Phone Validation Status (9)
        if ($(this).attr('class').indexOf("phone") > 0) {
            fnRemoveFilterTag(table, "phone", 9, val);

            $('.search-phone-validation-status').val("3");
            $('.search-phone-validation-status').select2().trigger('change');
        }

        $("span#" + $(this).attr('id')).remove();

        var name = "";
        var created_date = "";
        var submitted_date = "";
        var received_date = "";
        var type = "";
        var status = "";
        var online_validation_status = "";
        var phone_validation_status = "";

        var storage_value = "";
        var storage_index = "";

        var cd1 = "";
        var cd2 = "";

        var sd1 = "";
        var sd2 = "";

        var rd1 = "";
        var rd2 = "";
        
        $.each(fnGetLocalStorageQuery(), function (index, i) {
            storage_value = i;

            if (i.indexOf("=") > 0) {
                var str = storage_value.split("=");
                storage_index = str[0];
                storage_value = str[1];
            }

            if (storage_index == "name") {
                name = storage_value;
            } else if (storage_index == "created_date") {
                created_date = storage_value;
            } else if (storage_index == "submitted_date") {
                submitted_date = storage_value;
            } else if (storage_index == "received_date") {
                received_date = storage_value;
            } else if (storage_index == "project") {
                type = storage_value;
            } else if (storage_index == "status") {
                status = storage_value;
            } else if (storage_index == "online") {
                online_validation_status = storage_value;
            } else if (storage_index == "phone") {
                phone_validation_status = storage_value;
            }

            if (created_date.indexOf("·") > 0) {
                var str = created_date.split("·");
                cd1 = str[0].trim();
                cd2 = str[1].trim();
            }

            if (submitted_date.indexOf("·") > 0) {
                var str = submitted_date.split("·");
                sd1 = str[0].trim();
                sd2 = str[1].trim();
            }

            if (received_date.indexOf("·") > 0) {
                var str = received_date.split("·");
                rd1 = str[0].trim();
                rd2 = str[1].trim();
            }
        });

        fnGetStewardshipFilterCount(name, !fnIsEmpty(created_date) && created_date.indexOf("·") > 0 ? cd1 == cd2 ? cd1 : created_date : "", !fnIsEmpty(submitted_date) && submitted_date.indexOf("·") > 0 ? sd1 == sd2 ? sd1 : submitted_date : "", !fnIsEmpty(received_date) && received_date.indexOf("·") > 0 ? rd1 == rd2 ? rd1 : received_date : "", type, status, online_validation_status, phone_validation_status);
    });

    // Applicable to all pages
    $(document).on('click', '.overview-page, .btn-overview, .btn-my-profile, .btn-register, .btn-customers, .btn-stewardship, .btn-changerequests, .btn-query, .btn-changerequests, .btn-hco-accounts', function () {
        fnClearFilterLocalStorage();
    });

    // Filter search
    $(document).on('change', '.search-project, .search-status, .search-online-validation-status, .search-phone-validation-status', function () {
        var e = 0;

        if ($(this).attr("id") == "project") {
            e = 5;
        } else if ($(this).attr("id") == "status") {
            e = 6;
        } else if ($(this).attr("id") == "online") {
            e = 8;
        } else if ($(this).attr("id") == "phone") {
            e = 9;
        }

        if (e !== 0) {
            var val = $(this).val();
            var vsl = val;

            if (vsl == "0" || vsl == "1" || vsl == "2" || vsl == "3") {
                vsl = "";
            }

            // Store value to local storage
            fnAddToLocalStorageArray(fnSwitchCaseInput(e), vsl);

            // Verify if value exist in local storage
            var storage_value = "";
            var storage_index = "";

            var name = "";
            var created_date = "";
            var submitted_date = "";
            var received_date = "";
            var type = "";
            var status = "";
            var online_validation_status = "";
            var phone_validation_status = "";

            var cd1 = "";
            var cd2 = "";

            var sd1 = "";
            var sd2 = "";

            var rd1 = "";
            var rd2 = "";

            $.each(fnGetLocalStorageQuery(), function (index, i) {
                storage_value = i;

                if (i.indexOf("=") > 0) {
                    var str = storage_value.split("=");
                    storage_index = str[0];
                    storage_value = str[1];
                }

                if (storage_index == "name") {
                    name = storage_value;
                } else if (storage_index == "created_date") {
                    created_date = storage_value;
                } else if (storage_index == "submitted_date") {
                    submitted_date = storage_value;
                } else if (storage_index == "received_date") {
                    received_date = storage_value;
                } else if (storage_index == "project") {
                    type = storage_value;
                } else if (storage_index == "status") {
                    status = storage_value;
                } else if (storage_index == "online") {
                    online_validation_status = storage_value;
                } else if (storage_index == "phone") {
                    phone_validation_status = storage_value;
                }

                if (created_date.indexOf("·") > 0) {
                    var str = created_date.split("·");
                    cd1 = str[0].trim();
                    cd2 = str[1].trim();
                }

                if (submitted_date.indexOf("·") > 0) {
                    var str = submitted_date.split("·");
                    sd1 = str[0].trim();
                    sd2 = str[1].trim();
                }

                if (received_date.indexOf("·") > 0) {
                    var str = received_date.split("·");
                    rd1 = str[0].trim();
                    rd2 = str[1].trim();
                }               

                $('#dataTable').DataTable().columns(e).search(storage_value ? storage_value : '', true, false).draw();
            });

            fnGetStewardshipFilterCount(name, !fnIsEmpty(created_date) && created_date.indexOf("·") > 0 ? cd1 == cd2 ? cd1 : created_date : "", !fnIsEmpty(submitted_date) && submitted_date.indexOf("·") > 0 ? sd1 == sd2 ? sd1 : submitted_date : "", !fnIsEmpty(received_date) && received_date.indexOf("·") > 0 ? rd1 == rd2 ? rd1 : received_date : "", type, status, online_validation_status, phone_validation_status);

            // Add filter tag
            fnAppendFilterTag(vsl, fnSwitchCaseInput(e));
        }
    });

    // Reset filters and disabled reset button
    $(document).on("click", "#reset-btn-filter", function (e) {
        // Clear data storage values
        fnClearFilterLocalStorage();

        // Remove all filter tag
        $("span.checkbox-filter").text("");

        // Clear all input text field
        $("input[type='text']").val("");

        // Clear all selection from dropdown
        $("select.list-filter option").children().removeAttr("selected");

        // Clear all dropdown selection
        if (typeof ($('select.list-filter')) != 'undefined' || $('select.list-filter') != null) {
            $('.search-project').val("0");
            $('.search-project').select2().trigger('change');

            $('.search-status').val("1");
            $('.search-status').select2().trigger('change');

            $('.search-online-validation-status').val("2");
            $('.search-online-validation-status').select2().trigger('change');

            $('.search-phone-validation-status').val("3");
            $('.search-phone-validation-status').select2().trigger('change');
        }

        //fnGetDataStewardship();
        $("#dataTable").dataTable().fnFilterClear();

        $.fn.dataTableExt.afnFiltering.length = 0;
        $('#dataTable').dataTable().fnDraw();
    });

    // Load Data - Server-Side
    function fnLoadStewardshipData() {
        var name = "";
        var created_date = "";
        var submitted_date = "";
        var received_date = "";
        var type = "";
        var status = "";
        var online_validation_status = "";
        var phone_validation_status = "";

        var created_date_list = [];
        var submitted_date_list = [];
        var received_date_list = [];

        var oTable = $("#dataTable").DataTable({
            "bDestroy": true,
            "bProcessing": true, // for show progress bar  
            "bServerSide": true, // for process server side  
            "bFilter": true, // this is for disable filter (search box)  
            "orderMulti": false, // for disable multiple column at once  
            "pageLength": 10,
            "bPagination": true,
            "sPaginationType": "full_numbers",
            "bDeferRender": true,
            "orderCellsTop": true,
            "fixedHeader": true,
            "ajax": {
                "url": "/Home/LoadStewardshipData",
                "type": "POST",
                "datatype": "json"
            },
            "oLanguage": {
                "sSearch": "Global Search:"
            },
            "dom": '<"top">rt<"bottom"flpi><"clear">',
            "sDom": "Rlfrtip",
            "order": [[6, "desc"]], // Make column "Status" sort "DESC" default
            "columnDefs":
                [{
                    "targets": [0],
                    "width": "3%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [1],
                    "width": "13%",
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [2],
                    "width": "9%",
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [3],
                    "width": "9%",
                    "searchable": true,
                    "orderable": true,
                    "visible": false
                },
                {
                    "targets": [4],
                    "width": "9%",
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [5],
                    "width": "6%",
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [6],
                    "width": "6%",
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [7],
                    "width": "5%",
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [8],
                    "width": "13%",
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [9],
                    "width": "13%",
                    "searchable": true,
                    "orderable": true,
                    "visible": !fnIsEmpty(arrPhoneValidationStatus) ? true : false
                }/*,
                {
                    "targets": [10],
                    "width": "13%",
                    "searchable": true,
                    "orderable": true,
                    "visible": false
                }*/],
            "columns": [
                {
                    "className": "details-control", // 0 //
                    "orderable": false,
                    "data": null,
                    "autoWidth": true,
                    "defaultContent": ""
                },
                {
                    "data": "receive_info", // 1 //
                    "name": "receive_info",
                    "autoWidth": true,
                    "render": function (data, type, full) {
                        return !fnIsEmpty(full.sent_info) ? (!fnIsEmpty(full.sent_info.MiddleName) ? fnUcFirstAllWords(full.sent_info.FirstName) + " " + fnUcFirstAllWords(full.sent_info.MiddleName) + " " + fnUcFirstAllWords(full.sent_info.LastName) : fnUcFirstAllWords(full.sent_info.FirstName) + " " + fnUcFirstAllWords(full.sent_info.LastName)) : "N/A";
                    }
                },
                {
                    "data": "Steward_Status", // 2 //
                    "name": "Steward_Status",
                    "autoWidth": true,
                    "render": function (data, type, full) {
                        if (!fnIsEmpty(full.Steward_Status)) {
                            if (!fnIsEmpty(full.Steward_Status.created)) {
                                var regExp = /\(([^)]+)\)/;
                                var matches = regExp.exec(full.Steward_Status.created);

                                created_date_list.push(parseInt(matches[1]));

                                return moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                            } else {
                                return "N/A";
                            }
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "Steward_Status", // 3 //
                    "name": "Steward_Status",
                    "autoWidth": true,
                    "render": function (data, type, full) {
                        if (!fnIsEmpty(full.Steward_Status)) {
                            if (!fnIsEmpty(full.Steward_Status.submitted)) {
                                var regExp = /\(([^)]+)\)/;
                                var matches = regExp.exec(full.Steward_Status.submitted);

                                submitted_date_list.push(parseInt(matches[1]));

                                return moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                            } else {
                                return "N/A";
                            }
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "Steward_Status", // 4 //
                    "name": "Steward_Status",
                    "autoWidth": true,
                    "render": function (data, type, full) {
                        if (!fnIsEmpty(full.Steward_Status)) {
                            if (!fnIsEmpty(full.Steward_Status.received)) {
                                var regExp = /\(([^)]+)\)/;
                                var matches = regExp.exec(full.Steward_Status.received);

                                received_date_list.push(full.Steward_Status.received);

                                return moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                            } else {
                                return "N/A";
                            }
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "project", // 5 //
                    "name": "project",
                    "autoWidth": true,
                    "render": function (data, type, full) {
                        return !fnIsEmpty(data) ? data : "N/A";
                    }
                },
                {
                    "data": "Steward_Status", // 6 //
                    "name": "Steward_Status",
                    "autoWidth": true,
                    "render": function (data, type, full) {
                        if (!fnIsEmpty(full.Steward_Status)) {
                            if (fnIsEmpty(full.Steward_Status.received)) {
                                return "Open";
                            } else {
                                return "Closed";
                            }
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "Steward_Status", // 7 //
                    "name": "Steward_Status",
                    "autoWidth": true,
                    "render": function (data, type, full) {
                        if (!fnIsEmpty(full.Steward_Status)) {
                            if (!fnIsEmpty(full.Steward_Status.created) && !fnIsEmpty(full.Steward_Status.received)) {
                                var d2 = "";

                                if (full.Steward_Status.created != "") {
                                    var regExp = /\(([^)]+)\)/;
                                    var matches = regExp.exec(full.Steward_Status.created);

                                    d2 = new Date(moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD'));
                                } else {
                                    d2 = new Date();
                                }

                                var regExp = /\(([^)]+)\)/;
                                var matches = regExp.exec(full.Steward_Status.received);

                                var d1 = new Date(moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD'));

                                return fnDateDiff.inDays(d2, d1) + " Days";
                            } else {
                                return "N/A";
                            }
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "receive_info", // 8 //
                    "name": "receive_info",
                    "autoWidth": true,
                    "render": function (data, type, full) {
                        var val = !fnIsEmpty(full.receive_info) ? full.receive_info.OnlineValidationStatus : "N/A";

                        return val;
                    }
                },
                {
                    "data": "receive_info", // 9 //
                    "name": "receive_info",
                    "autoWidth": true,
                    "sClass": "tbl-btn_right",
                    "render": function (data, type, full) {
                        var val = !fnIsEmpty(full.receive_info) ? full.receive_info.PhoneValidationStatus : "N/A";

                        return val;
                    }
                }
            ],
            "createdRow": function (row, data, index) {
                if (data.Change === null && data.sent_info === null && data.receive_info === null) {
                    var td = $(row).find("td:first");

                    td.removeClass('details-control');
                }
            }
        });

        fnGetStewardshipFilterCount(name, created_date, submitted_date, received_date, type, status, online_validation_status, phone_validation_status);

        created_date_list = fnUnique(created_date_list);
        var first_createddate = created_date_list.sort()[0];
        var last_createddate = created_date_list.sort()[created_date_list.length - 1];

        submitted_date_list = fnUnique(submitted_date_list);
        var first_submitteddate = submitted_date_list.sort()[0];
        var last_submitteddate = submitted_date_list.sort()[submitted_date_list.length - 1];

        received_date_list = fnUnique(received_date_list);
        var first_receiveddate = received_date_list.sort()[0];
        var last_receiveddate = received_date_list.sort()[received_date_list.length - 1];

        // Remove single quote
        $(".search-online-validation-status").find("option").each(function (index, option) {
            $(option).html($(option).html().replace(/'/g, ''));
        });

        // Initialise select on DataTable
        $(".search-project, .search-status, .search-online-validation-status, .search-phone-validation-status").select2({
            dropdownAutoWidth: true,
            width: '100%'
        });

        var usedNames = {};
        $("select > option").each(function () {
            if (usedNames[this.value]) {
                $(this).remove();
            } else {
                usedNames[this.value] = this.text;
            }
        });

        fnSortSelectOptions('.search-online-validation-status', true);

        // Convert header to input text
        $('#dataTable thead th').each(function (i) {
            if (i == 2 || i == 3 || i == 4) {
                if (i == 2) {
                    $(".div-created-date").html(`<input type="text" name="daterange" id="cls_createddate" class="form-control daterange cls_createddate" value="" placeholder="Search a Created Date" />`);
                } else if (i == 3) {
                    $(".div-submitted-date").html(`<input type="text" name="daterange" id="cls_submitteddate" class="form-control daterange cls_submitteddate" value="" placeholder="Search a Submitted Date" />`);
                } else if (i == 4) {
                    $(".div-received-date").html(`<input type="text" name="daterange" id="cls_receiveddate" class="form-control daterange cls_receiveddate" value="" placeholder="Search a Returned Date" />`);
                }

                var date = new Date();
                var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                var end = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                $('.daterange').daterangepicker({
                    opens: 'center',
                    singleDatePicker: false, //true,
                    showDropdowns: true,
                    autoUpdateInput: false,
                    startDate: today,
                    endDate: end,
                    ranges: {
                        'Today': [moment(), moment()],
                        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                        'This Month': [moment().startOf('month'), moment().endOf('month')],
                        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    },
                    locale: {
                        format: 'YYYY-MM-DD',
                        separator: " · ",
                        cancelLabel: 'Clear'
                    }
                });
            } else {
                if (i == 1) {
                    $(".div-name").html(`<input type="text" class="form-control list-filter" id="name" name="name" placeholder="Search a Name" />`);
                }
            }
        });

        // Here we need to make date selection
        $('input.daterange').on('apply.daterangepicker', function (ev, picker) {
            var idx = null;

            if ($(this).attr('id') == "cls_createddate") {
                idx = 2;
            } else if ($(this).attr('id') == "cls_submitteddate") {
                idx = 3;
            } else if ($(this).attr('id') == "cls_receiveddate") {
                idx = 4;
            }

            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'));

            var start = picker.startDate.format('YYYY-MM-DD');
            var end = picker.endDate.format('YYYY-MM-DD');

            fnAddToLocalStorageArray(fnSwitchCaseInput(idx), picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'));

            $('#dataTable').DataTable().columns(idx).search(start == end ? start : start + ' · ' + end, true, false).draw();

            // Add filter tag
            fnAppendFilterTag(picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'), fnSwitchCaseInput(idx));

            // Verify if value exist in local storage
            var e = "";

            var storage_value = "";
            var storage_index = "";

            var name = "";
            var created_date = "";
            var submitted_date = "";
            var received_date = "";
            var type = "";
            var status = "";
            var online_validation_status = "";
            var phone_validation_status = "";

            var cd1 = "";
            var cd2 = "";

            var sd1 = "";
            var sd2 = "";

            var rd1 = "";
            var rd2 = "";

            $.each(fnGetLocalStorageQuery(), function (index, i) {
                storage_value = i;

                if (i.indexOf("=") > 0) {
                    var str = storage_value.split("=");
                    storage_index = str[0];
                    storage_value = str[1];
                }

                if (storage_index == "name") {
                    name = storage_value;
                } else if (storage_index == "created_date") {
                    created_date = storage_value;
                } else if (storage_index == "submitted_date") {
                    submitted_date = storage_value;
                } else if (storage_index == "received_date") {
                    received_date = storage_value;
                } else if (storage_index == "project") {
                    type = storage_value;
                } else if (storage_index == "status") {
                    status = storage_value;
                } else if (storage_index == "online") {
                    online_validation_status = storage_value;
                } else if (storage_index == "phone") {
                    phone_validation_status = storage_value;
                }

                if (created_date.indexOf("·") > 0) {
                    var str = created_date.split("·");
                    cd1 = str[0].trim();
                    cd2 = str[1].trim();
                }

                if (submitted_date.indexOf("·") > 0) {
                    var str = submitted_date.split("·");
                    sd1 = str[0].trim();
                    sd2 = str[1].trim();
                }

                if (received_date.indexOf("·") > 0) {
                    var str = received_date.split("·");
                    rd1 = str[0].trim();
                    rd2 = str[1].trim();
                }
            });

            fnGetStewardshipFilterCount(name, !fnIsEmpty(created_date) && created_date.indexOf("·") > 0 ? cd1 == cd2 ? cd1 : created_date : "", !fnIsEmpty(submitted_date) && submitted_date.indexOf("·") > 0 ? sd1 == sd2 ? sd1 : submitted_date : "", !fnIsEmpty(received_date) && received_date.indexOf("·") > 0 ? rd1 == rd2 ? rd1 : received_date : "", type, status, online_validation_status, phone_validation_status);

            $(`#${$(this).attr('id')}`).val("");

            oTable.draw();
        });

        $('.daterange').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');

            var idx = null;

            if ($(this).attr('id') == "cls_createddate") {
                idx = 2;
            } else if ($(this).attr('id') == "cls_submitteddate") {
                idx = 3;
            } else if ($(this).attr('id') == "cls_receiveddate") {
                idx = 4;
            }

            $("#dataTable").DataTable(idx).column.search($(this).val() ? '^' + $(this).val() + '$' : '', true, false).draw();

            $(`#${$(this).attr('id')}`).val("");

            oTable.draw();
        });

        // Search input text
        $(document).keypress(function (event) {
            var name = $("#name").val();

            var keycode = (event.keyCode ? event.keyCode : event.which);

            //var name = "";
            var created_date = "";
            var submitted_date = "";
            var received_date = "";
            var type = "";
            var status = "";
            var online_validation_status = "";
            var phone_validation_status = "";

            var storage_value = "";
            var storage_index = "";

            var e = 0;

            if (keycode == '13') {
                if (!fnIsEmpty(name)) {
                    fnAddToLocalStorageArray(fnSwitchCaseInput(1), name);

                    // Add filter tag
                    fnAppendFilterTag(name, fnSwitchCaseInput(1));

                    e = 1;
                }

                // Clear input filter
                $("#name").val("");

                if (e != 0) {
                    $.each(fnGetLocalStorageQuery(), function (index, i) {
                        storage_value = i;

                        if (i.indexOf("=") > 0) {
                            var str = storage_value.split("=");
                            storage_index = str[0];
                            storage_value = str[1];
                        }

                        if (storage_index == "project") {
                            type = storage_value;
                        } else if (storage_index == "status") {
                            status = storage_value;
                        } else if (storage_index == "online") {
                            online_validation_status = storage_value;
                        } else if (storage_index == "phone") {
                            phone_validation_status = storage_value;
                        }

                        $('#dataTable').DataTable().columns(e).search(storage_value ? storage_value : '', true, false).draw();
                    });

                    fnGetStewardshipFilterCount(name, created_date, submitted_date, received_date, type, status, online_validation_status, phone_validation_status);
                }
            }
        });

        /* Formatting function for row details - modify as you need */
        function fnFormat(d) {
            // `d` is the original data object for the row
            var html = "";
            var htmlDetails = "";
            var html_hco_name = "";

            html += `<p>Online Validation Status: ${(d.receive_info != null && !fnIsEmpty(d.receive_info.OnlineValidationStatus)) ? d.receive_info.OnlineValidationStatus : ""}</p>`;

            if (!fnIsEmpty(arrPhoneValidationStatus)) {
                html += `<p>Phone Validation Status: ${(d.receive_info != null && !fnIsEmpty(d.receive_info.PhoneValidationStatus)) ? d.receive_info.PhoneValidationStatus : ""}</p>`;
            }
            
            html += `<p>Comments: ${(d.receive_info != null && !fnIsEmpty(d.receive_info.Comments)) ? d.receive_info.Comments : ""}</p>`;
            html += `<br/>`;            

            //if (!fnIsEmpty(d.HCP_MDM_ID)) {
            //    var a = fnGetHCOName(d.HCP_MDM_ID);

            //    if (!fnIsEmpty(a)) {
            //        html_hco_name = `<tr>
            //                        <th scope="row">Account Name</th>
            //                        <td colspan="2">${fnUcFirstAllWords(a.name)}</td>
            //                    </tr>`;
            //    }
            //}

            // Detail Modal
            var srcBtnHtmlDetail = `<p><button type="button" class="btn btn-sm btn btn-secondary btn-view btn-src-modal badge-${d.transaction_id}" data-toggle="modal" data-target="#modalCenter${d.transaction_id}">Details</button></p>`;

            htmlDetails += `<table class="table table-bordered">
                              <thead>
                                <tr>
                                  <th style="border-top-color: white;border-left-color: white;" scope="col"></th>
                                  <th scope="col">Sent</th>
                                  <th scope="col">Received</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <th scope="row">First Name</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.FirstName)) ? d.sent_info.FirstName : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.FirstName)) ? d.receive_info.FirstName : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Last Name</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.LastName)) ? d.sent_info.LastName : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.LastName)) ? d.receive_info.LastName : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Middle Name</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.MiddleName)) ? d.sent_info.MiddleName : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.MiddleName)) ? d.receive_info.MiddleName : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Credentials</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.Credentials)) ? d.sent_info.Credentials : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.Credentials)) ? d.receive_info.Credentials : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">NPI</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.NPI)) ? d.sent_info.NPI : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.NPI)) ? d.receive_info.NPI : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Primary Specialty</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.PrimarySpecialty)) ? d.sent_info.PrimarySpecialty : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.PrimarySpecialty)) ? d.receive_info.PrimarySpecialty : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Secondary Specialty</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.SecondarySpecialty)) ? d.sent_info.SecondarySpecialty : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.SecondarySpecialty)) ? d.receive_info.SecondarySpecialty : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Address Line 1</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.AddressLine1)) ? d.sent_info.AddressLine1 : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.AddressLine1)) ? d.receive_info.AddressLine1 : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Address Line 2</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.AddressLine2)) ? d.sent_info.AddressLine2 : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.AddressLine2)) ? d.receive_info.AddressLine2 : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">City</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.City)) ? d.sent_info.City : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.City)) ? d.receive_info.City : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">State</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.State)) ? d.sent_info.State : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.State)) ? d.receive_info.State : ""}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Postal Code</th>
                                  <td>${(d.sent_info != null && !fnIsEmpty(d.sent_info.PostalCode)) ? d.sent_info.PostalCode : ""}</td>
                                  <td>${(d.receive_info != null && !fnIsEmpty(d.receive_info.PostalCode)) ? d.receive_info.PostalCode : ""}</td>
                                </tr>
                                ${(!fnIsEmpty(html_hco_name) ? html_hco_name : "")}
                              </tbody>
                            </table>`;

            var srcModalHtmlDetail = `<div class="modal fade" id="modalCenter${d.transaction_id}" tabindex="-1" role="dialog" aria-labelledby="modalCenterTitle${d.transaction_id}" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="modalCenterTitle${d.transaction_id}">Details</h5>
                                                </div>
                                                <div class="modal-body">${htmlDetails}</div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-view btn-close-modal" data-dismiss="modal">Close</button>
                                                </div>
                                                </div>
                                            </div>
                                        </div>`;

            var output = html + srcBtnHtmlDetail + srcModalHtmlDetail;

            return output;
        }

        // Array to track the ids of the details displayed rows
        $('#dataTable tbody').on('click', 'td.details-control', function () {
            var tr = $(this).closest('tr');
            var row = oTable.row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            } else {
                // Open this row
                row.child(fnFormat(row.data())).show();
                tr.addClass('shown');
            }
        });
    }

    // Fix naming convention
    function fnUcFirstAllWords(str) {
        var pieces = str.split(" ");

        for (var i = 0; i < pieces.length; i++) {
            var j = pieces[i].charAt(0).toUpperCase();

            pieces[i] = j + pieces[i].substr(1).toLowerCase();
        }

        return pieces.join(" ");
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

        if (val === null) {
            return true;
        }

        if (typeof (val) == 'function' || typeof (val) == 'number' || typeof (val) == 'boolean' || Object.prototype.toString.call(val) === '[object Date]') {
            return false;
        }

        if (typeof (val) == 'undefined') {
            return true;
        }

        if (typeof (val) == "") {
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

    // Calculate date difference
    var fnDateDiff = {
        inDays: function (d1, d2) {
            var t2 = d2.getTime();
            var t1 = d1.getTime();

            return parseInt((t2 - t1) / (24 * 3600 * 1000));
        },
        inWeeks: function (d1, d2) {
            var t2 = d2.getTime();
            var t1 = d1.getTime();

            return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
        },
        inMonths: function (d1, d2) {
            var d1Y = d1.getFullYear();
            var d2Y = d2.getFullYear();
            var d1M = d1.getMonth();
            var d2M = d2.getMonth();

            return (d2M + 12 * d2Y) - (d1M + 12 * d1Y);
        },
        inYears: function (d1, d2) {
            return d2.getFullYear() - d1.getFullYear();
        }
    }

    // Remove all duplicates value from array
    function fnUnique(list) {
        var result = [];

        $.each(list, function (i, e) {
            if ($.inArray(e, result) == -1) {
                result.push(e);
            }
        });

        return result;
    }

    // Append filter tag
    function fnAppendFilterTag(val, class_name) {
        if (!fnIsEmpty(val) && !fnIsEmpty(class_name)) {
            var clean_val = val;
            var display_val = val;

            clean_val = val.replace(/([,.;:/])+/g, '_');

            if (clean_val.indexOf(" ") > 0) {
                clean_val = clean_val.replace(/ /g, "_");
            }

            if (clean_val.indexOf("'") > 0) {
                clean_val = clean_val.replace(/ /g, "_");
            }

            $("#checkbox-filter").append(' <span class="badge badge-info checkbox-filter" id="' + clean_val + '">' + display_val.replace(/[-]/g, " ").toUpperCase() + $('label[for=' + clean_val + ']').text().toUpperCase() +
                ' <i class="close fas fa-times ' + clean_val + ' ' + class_name + '" id="' + clean_val + '"></i></span> ');
        }
    }

    // Switch case input names
    function fnSwitchCaseInput(index) {
        switch (index) {
            case 1:
                return "name";
                break;
            case 2:
                return "created_date";
                break;
            case 3:
                return "submitted_date";
                break;
            case 4:
                return "received_date";
                break;
            case 5:
                return "project";
                break;
            case 6:
                return "status";
                break;
            case 8:
                return "online";
                break;
            case 9:
                return "phone";
                break;
        }
    }

    // Get local storage for query dataTable
    function fnGetLocalStorageQuery() {
        var archive = [],
            keys = Object.keys(localStorage),
            i = 0, key;

        var keyLookup = ["name", "created_date", "submitted_date", "received_date", "project", "status", "online", "phone"];

        for (; key = keys[i]; i++) {
            if (keyLookup.includes(key)) {
                archive.push(key + '=' + localStorage.getItem(key));
            }
        }

        return archive;
    }

    // Add an item to a localStorage() array
    function fnAddToLocalStorageArray(name, value) {
        if (!fnIsEmpty(value)) {
            // Get the existing data
            var existing = localStorage.getItem(name);

            // If no existing data, create an array
            // Otherwise, convert the localStorage string to an array
            //existing = existing ? existing.split(',') : [];
            existing = existing ? existing.split('|') : [];

            // Add new data to localStorage Array
            existing.push(value);

            // Save back to localStorage
            localStorage.setItem(name, existing.toString());
        }
    }

    // Remove filter tag
    function fnRemoveFilterTag(table, filter_ls_name, dt_index, val) {
        var ls = "";
        var ls_count = 0;

        if (localStorage.getItem(filter_ls_name).indexOf(",") != -1) {
            ls = localStorage.getItem(filter_ls_name).split(",");

            ls_count = ls.length;
        } else {
            ls = localStorage.getItem(filter_ls_name);
        }

        if (val.indexOf("_") > 0) {
            //val = val.replace("_", " ");
            val = val.replace(/_/gi, " ");
        }

        if (localStorage.getItem(filter_ls_name).indexOf(val) != -1) {
            if (ls_count > 1) {
                ls = ls.filter(i => i != val);
            }
        }

        localStorage.removeItem(filter_ls_name);

        //if (ls.length > 1) {
        if (ls_count > 1) {
            ls = ls.join(",");
            localStorage.setItem(filter_ls_name, ls);
        } else if (ls_count == 0) {
            if (!fnIsEmpty(localStorage.getItem(filter_ls_name))) {
                if (localStorage.getItem(filter_ls_name) == ls) {
                    localStorage.removeItem(filter_ls_name);
                }
            }
        }

        if (!fnIsEmpty(localStorage.getItem(filter_ls_name))) {
            var search_val = localStorage.getItem(filter_ls_name);

            if (localStorage.getItem(filter_ls_name).indexOf(",") != -1) {
                //search_val = localStorage.getItem(filter_ls_name).replace(",", "|");

                table.columns(dt_index).search(search_val, true, false).draw();
            } else {
                table.columns(dt_index).search(search_val).draw();
            }
        }

        if (fnIsEmpty(localStorage.getItem(filter_ls_name))) {
            table.columns(dt_index).search("").draw();
        }
    }

    // Clear filter value in localstorage
    function fnClearFilterLocalStorage() {
        let keysToRemove = ["name", "created_date", "submitted_date", "received_date", "project", "status", "online", "phone"];

        keysToRemove.forEach(k => localStorage.removeItem(k));
    }

    // Reload Data by filter serach
    function fnReloadDataByFilterSearch() {
        var table = $('#dataTable').DataTable();
    }

    // Sort value in dropdown
    function fnSortSelectOptions(selector, skip_first) {
        var options = (skip_first) ? $(selector + ' option:not(:first)') : $(selector + ' option');
        var arr = options.map(function (_, o) { return { t: $(o).text(), v: o.value, s: $(o).prop('selected') }; }).get();

        arr.sort(function (o1, o2) {
            var t1 = o1.t.toLowerCase(), t2 = o2.t.toLowerCase();
            return t1 > t2 ? 1 : t1 < t2 ? -1 : 0;
        });

        options.each(function (i, o) {
            o.value = arr[i].v;
            $(o).text(arr[i].t);

            if (arr[i].s) {
                $(o).attr('selected', 'selected').prop('selected', true);
            } else {
                $(o).removeAttr('selected');
                $(o).prop('selected', false);
            }
        });
    }

    // Get all status
    function fnGetAllType() {
        var arr = [];

        $.ajax({
            url: "/Home/GetAllType",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetAllType on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            arr.push(i.project);
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetAllType error", error);
            }
        });

        return arr.sort();
    }

    // Get all online validation status
    function fnGetAllOnlineValidationStatus() {
        var arr = [];

        $.ajax({
            url: "/Home/GetAllOnlineValidationStatus",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetAllOnlineValidationStatus on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            if (!fnIsEmpty(i.OnlineValidationStatus)) {
                                arr.push(i.OnlineValidationStatus);
                            }
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetAllOnlineValidationStatus error", error);
            }
        });

        return arr.sort();
    }

    // Get all phone validation status
    function fnGetAllPhoneValidationStatus() {
        var arr = [];

        $.ajax({
            url: "/Home/GetAllPhoneValidationStatus",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetAllPhoneValidationStatus on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            if (!fnIsEmpty(i.PhoneValidationStatus)) {
                                arr.push(i.PhoneValidationStatus);
                            }
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetAllPhoneValidationStatus error", error);
            }
        });

        return arr.sort();
    }

    // Get dataTable filter count
    function fnGetStewardshipFilterCount(name, created_date, submitted_date, received_date, type, status, online_validation_status, phone_validation_status) {
        $.ajax({
            type: "POST",
            url: "/Home/StewardshipFilterCount",
            data: {
                name: name,
                created_date: created_date,
                submitted_date: submitted_date,
                received_date: received_date,
                type: type,
                status: status,
                online_validation_status: online_validation_status,
                phone_validation_status: phone_validation_status
            },
            beforeSend: function () {
                $(".loader").show();
                $(".loader").css("z-index", 20);
                $("#content-wrapper").css("opacity", 0.1);
            },
            success: function (data) {
                $("#totalInquiries").html(data.data.data.numberInquiries);
                $("#totalOpen").html(data.data.data.numberOpen);
                $("#totalPending").html(data.data.data.numberPending);
                $("#totalCompleted").html(data.data.data.numberClosed);                
                $("#totalProject").html(data.data.data.numberProject);

                //if (data.data.length == 0) {
                //    $("#totalInquiries").html(0);
                //    $("#totalCompleted").html(0);
                //    $("#totalPending").html(0);
                //    $("#totalProject").html(0);   
                //}

                //$.each(data.data, function (index, i) {
                //    $("#totalInquiries").html(i.numberInquiries);
                //    $("#totalCompleted").html(i.numberClosed);
                //    $("#totalPending").html(i.numberPending);
                //    $("#totalProject").html(i.numberProject);
                //});
            },
            complete: function () {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            },
            error: function (err) {
                console.log("fnGetStewardshipFilterCount success", err);
            }
        });
    }

    // Manage exception
    //$(document).on('click', '.btn-exception', function () {
    //    if (!fnIsEmpty($(this).val())) {
    //        var str = $(this).val().split("|");
    //        var val = str[0].trim();
    //        var id = str[1].trim();

    //        // confirm modal box
    //        $('#modal-confirmation').modal('show');
    //        $("#yes_no_confirmation").html(`<strong>${val}</strong>`);

    //        if (!fnIsEmpty($("#hidden-detail").val())) {
    //            var detail = JSON.parse($("#hidden-detail").val());

    //            var name = !fnIsEmpty(detail.HCP_MIDDLE_NAME) ? detail.HCP_FIRST_NAME + " " + detail.HCP_MIDDLE_NAME + " " + detail.HCP_LAST_NAME : detail.HCP_FIRST_NAME + " " + detail.HCP_LAST_NAME;
    //            var territory = !fnIsEmpty(detail.SRC_CR_USER_TERR_NAME) ? detail.SRC_CR_USER_TERR_ID + " " + fnUcFirstAllWords(detail.SRC_CR_USER_TERR_NAME) : detail.SRC_CR_USER_TERR_ID;

    //            $("#dName").html(fnUcFirstAllWords(name));

    //            $("#dAddress").html(fnUcFirstAllWords(detail.HCP_ADDR_1 + " " + detail.HCP_ADDR_2));
    //            $("#dCity").html(fnUcFirstAllWords(detail.HCP_CITY));
    //            $("#dState").html(fnUcFirstAllWords(detail.HCP_STATE));
    //            $("#dZip").html(fnUcFirstAllWords(detail.HCP_ZIP5));

    //            $("#dCredentials").html(detail.HCP_CREDENTIALS.toUpperCase());
    //            $("#dPrimarySpecialty").html(fnUcFirstAllWords(detail.HCP_PRY_SPECIALTY));
    //            $("#dSecondarySpecialty").html(fnUcFirstAllWords(detail.HCP_SEC_SPECIALTY));

    //            $("#dReq_type").html(fnUcFirstAllWords(detail.REQ_TYPE));
    //            $("#dExc_desc").html(fnUcFirstAllWords(detail.CR_EXCEPTION_DESC));
    //            $("#dTerritory").html(territory);
    //        }

    //        $(document).on('click', '.btn-confirmation', function () {
    //            if ($(this).val() == "Yes") {
    //                fnManageExceptions(id, val);
    //                fnLoadStewardshipData();

    //                $('#modal-confirmation').modal('hide');
    //            } else if ($(this).val() == "No") {
    //                $('#modal-confirmation').modal('hide');
    //            }
    //        });
    //    }
    //});

    // Approve/Reject button
    //function fnManageExceptions(record_id, exception) {
    //    if (!fnIsEmpty(record_id) && !fnIsEmpty(exception)) {
    //        if (exception == "Approve") {
    //            exception = "Approved";
    //        } else if (exception == "Reject") {
    //            exception = "Rejected";
    //        }

    //        $.ajax({
    //            url: "/Home/ManageException",
    //            type: "POST",
    //            data: {
    //                record_id: record_id,
    //                exception: exception
    //            },
    //            success: function (data) {
    //                if (data != null) {
    //                    if (data.error) {
    //                        console.log("fnManageExceptions on success error", data.error);
    //                    } else {
    //                        console.log("fnManageExceptions on success", data);
    //                    }
    //                }
    //            },
    //            error: function (error) {
    //                console.log("fnManageExceptions error", error);
    //            }
    //        });
    //    }
    //}

    // Account name - HCO name
    function fnGetHCOName(hcp_mdm_id) {
        var result = "";

        if (!fnIsEmpty(hcp_mdm_id)) {
            $.ajax({
                url: "/Home/GetHCOName",
                type: "POST",
                async: false,
                data: { hcp_mdm_id: hcp_mdm_id },
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnGetHCOName on success error", data.error);
                        } else {
                            $.each(data.data, function (index, i) {
                                result = i;
                            });
                        }
                    }
                },
                error: function (error) {
                    console.log("fnGetHCOName error", error);
                }
            });
        }        

        return result;
    }
});