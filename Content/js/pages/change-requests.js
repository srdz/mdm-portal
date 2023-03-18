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

    fnLoadChangeRequestsData();

    var arrSourceName = fnGetChangeRequestSourceName();
    var options = $(".search-source-name");

    $.each(arrSourceName, function (index, i) {
        options.append(new Option(i, i));
    });

    var arrType = fnGetChangeRequestType();
    var options = $(".search-request-type");

    $.each(arrType, function (index, i) {
        options.append(new Option(i, i));
    });

    var options = $(".search-request-status");
    options.append(new Option("Open", "Open"));
    options.append(new Option("Closed", "Closed"));

    // Tooltip
    $.protip();

    // This will redirect user to a page
    var fnRedirectPage = function (redirectUrl, arg, value) {
        var form = $('<form action="' + redirectUrl + '" method="post"><input type="hidden" name="' + arg + '" value="' + value + '"></input></form>');

        $('body').append(form);

        $(form).submit();
    };

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

    // Applicable to all pages
    $(document).on('click', '.overview-page, .btn-overview, .btn-my-profile, .btn-register, .btn-customers, .btn-stewardship, .btn-changerequests, .btn-query, .btn-hco-accounts', function () {
        fnClearFilterLocalStorage();
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
            $('.search-source-name').val("-1");
            $('.search-source-name').select2().trigger('change');

            $('.search-request-type').val("1");
            $('.search-request-type').select2().trigger('change');

            $('.search-request-status').val("2");
            $('.search-request-status').select2().trigger('change');
        }

        $("#dataTable").dataTable().fnFilterClear();

        $.fn.dataTableExt.afnFiltering.length = 0;
        $('#dataTable').dataTable().fnDraw();
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
        if ($(this).attr('class').indexOf("srm_name") > 0) {
            fnRemoveFilterTag(table, "srm_name", 1, val);
        }

        // Source Name (2)
        if ($(this).attr('class').indexOf("srm_source") > 0) {
            fnRemoveFilterTag(table, "srm_source", 2, val);

            $('.search-source-name').val("-1");
            $('.search-source-name').select2().trigger('change');
        }

        // Creation Date (3)
        if ($(this).attr('class').indexOf("srm_creation_date") > 0) {
            fnRemoveFilterTag(table, "srm_creation_date", 3, val);

            $.fn.dataTableExt.afnFiltering.length = 0;
            $('#dataTable').dataTable().fnDraw();
        }

        // Request By (4)
        if ($(this).attr('class').indexOf("srm_requested_by") > 0) {
            fnRemoveFilterTag(table, "srm_requested_by", 4, val);
        }
        
        // Request Type (5)
        if ($(this).attr('class').indexOf("srm_type") > 0) {
            fnRemoveFilterTag(table, "srm_type", 5, val);

            $('.search-request-type').val("1");
            $('.search-request-type').select2().trigger('change');
        }

        // Request Status (6)
        if ($(this).attr('class').indexOf("srm_status") > 0) {
            fnRemoveFilterTag(table, "srm_status", 6, val);

            $('.search-request-status').val("2");
            $('.search-request-status').select2().trigger('change');
        }

        $("span#" + $(this).attr('id')).remove();

        var name = "";
        var source_name = "";
        var creation_date = "";
        var requested_by = "";
        var type = "";
        var status = "";

        var storage_value = "";
        var storage_index = "";

        var cd1 = "";
        var cd2 = "";

        $.each(fnGetLocalStorageQuery(), function (index, i) {
            storage_value = i;

            if (i.indexOf("=") > 0) {
                var str = storage_value.split("=");
                storage_index = str[0];
                storage_value = str[1];
            }

            if (storage_index == "srm_name") {
                name = storage_value;
            } else if (storage_index == "srm_source") {
                source_name = storage_value;
            } else if (storage_index == "srm_creation_date") {
                creation_date = storage_value;
            } else if (storage_index == "srm_requested_by") {
                requested_by = storage_value;
            } else if (storage_index == "srm_type") {
                type = storage_value;
            } else if (storage_index == "srm_status") {
                status = storage_value;
            }

            if (creation_date.indexOf("·") > 0) {
                var str = creation_date.split("·");
                cd1 = str[0].trim();
                cd2 = str[1].trim();
            }
        });

        //fnGetChangeRequestFilterCount(id, name, source_name, creation_date, type, status, hospital, exception);
        //fnGetChangeRequestFilterCount(id, name, source_name, cd1 == cd2 ? cd1 : creation_date, type, status, hospital, exception);
        fnGetChangeRequestFilterCount(name, source_name, cd1 == cd2 ? cd1 : creation_date, requested_by, type, status);
    });

    // Clear filter value in localstorage
    function fnClearFilterLocalStorage() {
        //let keysToRemove = ["srm_id", "srm_name", "srm_hospital", "srm_source", "srm_creation_date", "srm_type", "srm_status", "srm_exception"];
        let keysToRemove = ["srm_name", "srm_source", "srm_creation_date", "srm_requested_by", "srm_type", "srm_status"];

        keysToRemove.forEach(k => localStorage.removeItem(k));
    }

    // Get change request data
    function fnLoadChangeRequestsData() {
        $(".loader").show();
        $(".loader").css("z-index", 20);
        $("#content-wrapper").css("opacity", 0.1);

        var name = "";
        var source_name = "";
        var creation_date = "";
        var requested_by = "";
        var type = "";
        var status = "";

        var table = $("#dataTable").DataTable({
            "bDestroy": true,
            //"bProcessing": true, // for show progress bar  
            "bProcessing": false, // for show progress bar  
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
                "url": "/Home/LoadChangeRequestsData",
                "type": "POST",
                "datatype": "json"
            },
            "oLanguage": {
                "sSearch": "Global Search:"
            },
            "dom": '<"top">rt<"bottom"flpi><"clear">',
            "sDom": "Rlfrtip",
            "order": [[3, "desc"]], // Make column "Creation Date" sort "DESC" default
            "columnDefs":
                [
                {
                    "targets": [0],
                    "searchable": true,
                    "orderable": true,
                    "visible": false
                },
                {
                    "targets": [1],
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [2],
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [3],
                    "searchable": true,
                    "orderable": true //add after 
                },
                {
                    "targets": [4],
                    "searchable": true,
                    "orderable": true //requested by
                },
                {
                    "targets": [5],
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [6],
                    "searchable": true,
                    "orderable": true
                },
                {
                    "targets": [7],
                    "searchable": true,
                    "orderable": true,
                    "visible": false
                },
                {
                    "targets": [8],
                    "searchable": false,
                    "orderable": true,
                    "visible": false
                },
                {
                    "targets": [9],
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [10],
                    "searchable": true,
                    "orderable": false,
                    "visible": false
                },
                {
                    "targets": [11],
                    "searchable": true,
                    "orderable": false,
                    "visible": false
                }],
            "columns": [
                {
                    "data": "CR_ID", // 0 //
                    "name": "CR_ID",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            return data;
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "CR_ID", // 1 //
                    "name": "CR_ID",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        var name = "";

                        if (full["CR_TYPE"] == "HCP") {
                            if (!fnIsEmpty(full["HCP_MIDDLE_NAME"])) {
                                // first/middle/last = middle not empty

                                name = fnUcFirstAllWords(full["HCP_FIRST_NAME"] + " " + full["HCP_MIDDLE_NAME"] + " " + full["HCP_LAST_NAME"]);
                            } else if (fnIsEmpty(full["HCP_MIDDLE_NAME"])) {
                                // first/last = middle empty

                                name = fnUcFirstAllWords(full["HCP_FIRST_NAME"] + " " + full["HCP_LAST_NAME"]);
                            } else if (!fnIsEmpty(full["HCP_FIRST_NAME"]) || !fnIsEmpty(full["HCP_LAST_NAME"])) {
                                // first/last = first and last not empty

                                name = fnUcFirstAllWords(full["HCP_FIRST_NAME"] + " " + full["HCP_LAST_NAME"]);
                            } else if (fnIsEmpty(full["HCP_FIRST_NAME"]) && fnIsEmpty(full["HCP_MIDDLE_NAME"]) && fnIsEmpty(full["HCP_LAST_NAME"])) {
                                // first/middle/last = all empty

                                name = "";
                            }
                        } else if (full["CR_TYPE"] == "HCO") {
                            if (!fnIsEmpty(full["HCO_NAME"])) {
                                name = fnUcFirstAllWords(full["HCO_NAME"]);
                            } else {
                                name = "";
                            }
                        }

                        return name;
                    }
                },
                {
                    "data": "SRC_NAME", // 2 //
                    "name": "SRC_NAME",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            return data;
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "CR_CREATION_DATE", // 3 //
                    "name": "CR_CREATION_DATE",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            var regExp = /\(([^)]+)\)/;
                            var matches = regExp.exec(data);

                            return moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "SRC_CR_USER", // 4 // SRC_CR_USER_TERR_ID
                    "name": "SRC_CR_USER",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            //return full["SRC_CR_USER_TERR_ID"] + " " + full["SRC_CR_USER_TERR_NAME"];
                            return full["SRC_CR_USER"];
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "REQ_TYPE", // 5 //
                    "name": "REQ_TYPE",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            return data;
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "CR_STATUS", // 6 //
                    "name": "CR_STATUS",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            var status = data;

                            //prod
                            if (status == "Approved") {
                                status = "Closed"
                            }

                            return status;
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "CR_EXCEPTION_STATUS", // 7 //
                    "name": "CR_EXCEPTION_STATUS",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) { //return yes or no
                        var color = "success";

                        if (data == "True") {
                            color = "danger";
                        } else if (data == "False") {
                            color = "success";
                        } else {
                            color = "secondary";
                        }

                        return `<h6 class="status-col"><span class="badge badge-${color}">${data}</span></h6>`;
                    }
                },
                {
                    "data": "CR_EXCEPTION_STATUS", // 8 //
                    "name": "CR_EXCEPTION_STATUS",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            if (data == "True") {
                                var html = "";
                                var cd = "";

                                if (!fnIsEmpty(full['CR_CREATION_DATE'])) {
                                    var regExp = /\(([^)]+)\)/;
                                    var matches = regExp.exec(full['CR_CREATION_DATE']);

                                    cd = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                                } else {
                                    cd = "N/A";
                                }

                                var detail_array = [];

                                detail_array.push({
                                    creation_date: cd,
                                    source_name: full['SRC_NAME'],
                                    cr_type: full['CR_TYPE'],
                                    req_type: full['REQ_TYPE'],
                                    cr_exception_desc: full['CR_EXCEPTION_DESC']
                                });

                                html = `<div class="btn-toolbar" role="toolbar">
                                            <div class="btn-group mr-2 mt-1" role="group">
                                                <button name='View' value='Approve|${full['_id']}|${full['CR_EXCEPTION_DESC']}' class='btn btn-success btn-exception btn-approve btn-sm'>Approved</button>
                                            </div>
                                            <div class="btn-group mr-2 mt-1" role="group">
                                                <button name='View' value='Reject|${full['_id']}|${full['CR_EXCEPTION_DESC']}' class='btn btn-danger btn-exception btn-reject btn-sm'>Rejected</button>
                                            </div>
                                            <div class="btn-group mr-2 mt-1" role="group">
                                                <button type='button' value='${JSON.stringify(detail_array)}' class='btn btn-secondary btn-detail btn-sm'>Detail</button>
                                            </div>
                                        </div>`;

                                return html;
                            } else if (data == "False") {
                                return "";
                            }
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "HCP_MDM_ID", // 9 //
                    "name": "HCP_MDM_ID",
                    "autoWidth": true,
                    "sClass": "tbl-btn_right",
                    "render": function (data, type, full, meta) {
                        var disable = "";

                        var html_btn = "";

                        if (full['CR_TYPE'] == "HCO") {
                            html_btn = `<button name='View' id='${full['CR_TYPE'].toLowerCase()}' value='${full['HCO_MDM_ID']}' class='btn btn-cr-details btn-sm cr-details'>View</button> `;

                            if (fnIsEmpty(full['HCO_MDM_ID'])) {
                                //html_btn = `<button name='View' style="cursor: not-allowed; background-color: #e30e734d; color: #fff; border-color: #e30e7300;" class="btn btn-cr-details btn-sm cr-details protip" data-pt-position="left" data-pt-title="Staff, no customer record." data-pt-size="tiny" data-pt-scheme="dark-transparent">View</button> `;
                                html_btn = `<button name='View'  id='${full['CR_TYPE'].toLowerCase()}' style="cursor: not-allowed; background-color: #e30e734d; color: #fff; border-color: #e30e7300;" class="btn btn-cr-details btn-sm cr-details protip" data-pt-position="left" data-pt-title="In process" data-pt-size="tiny" data-pt-scheme="dark-transparent">View</button> `;
                            }
                        } else if (full['CR_TYPE'] == "HCP") {
                            html_btn = `<button name='View'  id='${full['CR_TYPE'].toLowerCase()}' value='${full['HCP_MDM_ID']}' class='btn btn-cr-details btn-sm cr-details'>View</button> `;

                            if (fnIsEmpty(full['HCP_MDM_ID'])) {
                                //html_btn = `<button name='View' style="cursor: not-allowed; background-color: #e30e734d; color: #fff; border-color: #e30e7300;" class="btn btn-cr-details btn-sm cr-details protip" data-pt-position="left" data-pt-title="Staff, no customer record." data-pt-size="tiny" data-pt-scheme="dark-transparent">View</button> `;
                                html_btn = `<button name='View' id='${full['CR_TYPE'].toLowerCase()}' style="cursor: not-allowed; background-color: #e30e734d; color: #fff; border-color: #e30e7300;" class="btn btn-cr-details btn-sm cr-details protip" data-pt-position="left" data-pt-title="In process" data-pt-size="tiny" data-pt-scheme="dark-transparent">View</button> `;
                            }
                        }

                        return html_btn;
                    }
                },
                {
                    "data": "HCO_NAME", // 10 //
                    "name": "HCO_NAME",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            return data;
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "CR_EXCEPTION_STATUS", // 11 //
                    "name": "CR_EXCEPTION_STATUS",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            return data;
                        } else {
                            return "N/A";
                        }
                    }
                }
            ],
            "initComplete": function (settings, json) {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            }
        });

        //fnGetChangeRequestFilterCount(id, name, source_name, creation_date, type, status, hospital, exception);
        fnGetChangeRequestFilterCount(name, source_name, creation_date, requested_by, type, status);

        // Initialise select on DataTable
        $(".search-source-name, .search-request-type, .search-request-status").select2({
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

        $('#dataTable thead th').each(function (i) {
            if (i != 2 && i != 5 && i != 6) {
                if (i == 3) {
                    $(".div-created-date").html(`<input type="text" id="datepicker" name="daterange" class="form-control list-filter search-creation-date" value="" placeholder="Search a Creation Date" />`);

                    var date = new Date();
                    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    var end = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                    $('input[name="daterange"]').daterangepicker({
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
                        $(".div-name").html(`<input type="text" class="form-control list-filter search-name" id="input-${i}" placeholder="Search a Name" />`);
                    }

                    if (i == 4) {
                        $(".div-requested-by").html(`<input type="text" class="form-control list-filter search-requested-by" id="input-${i}" placeholder="Search Requested By" />`);
                    }

                }
            }
        });

        // Here we need to make date selection
        $('input[name="daterange"]').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'));

            var start = picker.startDate.format('YYYY-MM-DD');
            var end = picker.endDate.format('YYYY-MM-DD');

            fnAddToLocalStorageArray(fnSwitchCaseInput(3), picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'));

            $('#dataTable').DataTable().columns(3).search(start == end ? start : start + ' · ' + end, true, false).draw();

            // Add filter tag
            fnAppendFilterTag(picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'), fnSwitchCaseInput(3));

            var storage_value = "";
            var storage_index = "";

            var name = "";
            var source_name = "";
            var creation_date = "";
            var requested_by = "";
            var type = "";
            var status = "";

            var cd1 = "";
            var cd2 = "";

            $.each(fnGetLocalStorageQuery(), function (index, i) {
                storage_value = i;

                if (i.indexOf("=") > 0) {
                    var str = storage_value.split("=");
                    storage_index = str[0];
                    storage_value = str[1];
                }

                if (storage_index == "srm_name") {
                    name = storage_value;
                } else if (storage_index == "srm_source") {
                    source_name = storage_value;
                } else if (storage_index == "srm_creation_date") {
                    creation_date = storage_value;
                } else if (storage_index == "srm_requested_by") {
                    requested_by = storage_value;
                } else if (storage_index == "srm_type") {
                    type = storage_value;
                } else if (storage_index == "srm_status") {
                    status = storage_value;
                }

                if (creation_date.indexOf("·") > 0) {
                    var str = creation_date.split("·");
                    cd1 = str[0].trim();
                    cd2 = str[1].trim();
                }
            });

            //fnGetChangeRequestFilterCount(id, name, source_name, creation_date, type, status, hospital, exception);
            //fnGetChangeRequestFilterCount(id, name, source_name, cd1 == cd2 ? cd1 : creation_date, type, status, hospital, exception);
            fnGetChangeRequestFilterCount(name, source_name, cd1 == cd2 ? cd1 : creation_date, requested_by, type, status);

            table.draw();

            $("#datepicker").val("");
        });

        // Search input text
        $(document).keypress(function (event) {
            var name = $(".search-name").val();
            var requested_by = $(".search-requested-by").val();

            var keycode = (event.keyCode ? event.keyCode : event.which);

            var source_name = "";
            var creation_date = "";
            var type = "";
            var status = "";

            var storage_value = "";
            var storage_index = "";

            var cd1 = "";
            var cd2 = "";

            var e = 0;

            if (keycode == '13') {
                // 1
                if (!fnIsEmpty(name)) {
                    fnAddToLocalStorageArray(fnSwitchCaseInput(1), name);

                    // Add filter tag
                    fnAppendFilterTag(name, fnSwitchCaseInput(1));

                    e = 1;
                }

                if (!fnIsEmpty(requested_by)) {
                    fnAddToLocalStorageArray(fnSwitchCaseInput(4), requested_by);

                    // Add filter tag
                    fnAppendFilterTag(requested_by, fnSwitchCaseInput(4));

                    e = 4;
                }

                // Clear input filter
                $("input.list-filter").val("");

                $.each(fnGetLocalStorageQuery(), function (index, i) {
                    storage_value = i;

                    if (i.indexOf("=") > 0) {
                        var str = storage_value.split("=");
                        storage_value = str[1];
                        storage_index = str[0];
                    }

                    if (storage_index == "srm_name") {
                        name = storage_value;
                        e = 1;
                    } else if (storage_index == "srm_source") {
                        source_name = storage_value;
                    } else if (storage_index == "srm_creation_date") {
                        creation_date = storage_value;
                    } else if (storage_index == "srm_requested_by") {
                        requested_by = storage_value;
                        e = 4;
                    } else if (storage_index == "srm_type") {
                        type = storage_value;
                    } else if (storage_index == "srm_status") {
                        status = storage_value;
                    }

                    if (creation_date.indexOf("·") > 0) {
                        var str = creation_date.split("·");
                        cd1 = str[0].trim();
                        cd2 = str[1].trim();
                    }

                    $('#dataTable').DataTable().columns(e).search(storage_value ? storage_value : '', true, false).draw();
                });

                //fnGetChangeRequestFilterCount(id, name, source_name, creation_date, type, status, hospital, exception);
                //fnGetChangeRequestFilterCount(id, name, source_name, cd1 == cd2 ? cd1 : creation_date, type, status, hospital, exception);
                fnGetChangeRequestFilterCount(name, source_name, cd1 == cd2 ? cd1 : creation_date, requested_by, type, status);
            }
        });
    }

    // Filter search
    $(document).on('change', '.search-source-name, .search-request-type, .search-request-status', function () {
        $(".loader").show();
        $(".loader").css("z-index", 20);
        $("#content-wrapper").css("opacity", 0.1);

        var e = 0;

        if ($(this).attr("id") == "source") {
            e = 2;
        } else if ($(this).attr("id") == "type") {
            e = 5;
        } else if ($(this).attr("id") == "status") {
            e = 6;
        }

        if (e !== 0) {
            var val = $(this).val();
            var vsl = val;

            if (vsl == "-1" || vsl == "1" || vsl == "2" || vsl == "3") {
                vsl = "";
            }

            // Store value to local storage
            fnAddToLocalStorageArray(fnSwitchCaseInput(e), vsl);

            // Verify if value exist in local storage
            var name = "";
            var source_name = "";
            var creation_date = "";
            var requested_by = "";
            var type = "";
            var status = "";

            var storage_value = "";
            var storage_index = "";

            var cd1 = "";
            var cd2 = "";

            $.each(fnGetLocalStorageQuery(), function (index, i) {
                storage_value = i;

                if (i.indexOf("=") > 0) {
                    var str = storage_value.split("=");
                    storage_index = str[0];
                    storage_value = str[1];
                }

                if (storage_index == "srm_name") {
                    name = storage_value;
                } else if (storage_index == "srm_source") {
                    source_name = storage_value;
                    e = 2;
                } else if (storage_index == "srm_creation_date") {
                    creation_date = storage_value;
                } else if (storage_index == "srm_requested_by") {
                    requested_by = storage_value;
                    e = 4;
                } else if (storage_index == "srm_type") {
                    type = storage_value;
                    e = 5;
                } else if (storage_index == "srm_status") {
                    status = storage_value;
                    e = 6;
                }

                if (creation_date.indexOf("·") > 0) {
                    var str = creation_date.split("·");
                    cd1 = str[0].trim();
                    cd2 = str[1].trim();
                }

                $('#dataTable').DataTable().columns(e).search(storage_value ? storage_value : '', true, false).draw();
            });

            //fnGetChangeRequestFilterCount(id, name, source_name, creation_date, type, status, hospital, exception);
            //fnGetChangeRequestFilterCount(id, name, source_name, cd1 == cd2 ? cd1 : creation_date, type, status, hospital, exception);
            fnGetChangeRequestFilterCount(name, source_name, cd1 == cd2 ? cd1 : creation_date, requested_by, type, status);

            // Add filter tag
            fnAppendFilterTag(vsl, fnSwitchCaseInput(e));
        }

        //$(document).ajaxComplete(function () {
        //    $(".loader").hide();
        //    $("#content-wrapper").css("opacity", "");
        //});
    });

    // Get local storage for query dataTable
    function fnGetLocalStorageQuery() {
        var archive = [],
            keys = Object.keys(localStorage),
            i = 0, key;

        //var keyLookup = ["srm_id", "srm_name", "srm_source", "srm_creation_date", "srm_type", "srm_status", "srm_hospital", "srm_exception"];
        var keyLookup = ["srm_name", "srm_source", "srm_creation_date", "srm_requested_by", "srm_type", "srm_status"];

        for (; key = keys[i]; i++) {
            if (keyLookup.includes(key)) {
                archive.push(key + '=' + localStorage.getItem(key));
            }
        }

        return archive;
    }

    // Fix naming convention
    function fnUcFirstAllWords(str) {
        if (!fnIsEmpty(str)) {
            var pieces = str.split(" ");

            for (var i = 0; i < pieces.length; i++) {
                var j = pieces[i].charAt(0).toUpperCase();

                pieces[i] = j + pieces[i].substr(1).toLowerCase();
            }

            return pieces.join(" ");
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

    // Append filter tag
    function fnAppendFilterTag(val, class_name) {
        if (!fnIsEmpty(val) && !fnIsEmpty(class_name)) {
            var clean_val = val;
            var display_val = val;

            clean_val = val.replace(/([,.;:/])+/g, '_');

            if (clean_val.indexOf(" ") > 0) {
                //clean_val = clean_val.replace(/ /g, "");
                clean_val = clean_val.replace(/ /g, "_");
            }

            $("#checkbox-filter").append(' <span class="badge badge-info checkbox-filter" id="' + clean_val + '">' + display_val.replace(/[_]/g, " ").toUpperCase() + $('label[for=' + clean_val + ']').text().toUpperCase() +
                ' <i class="close fas fa-times ' + clean_val + ' ' + class_name + '" id="' + clean_val + '"></i></span> ');
        }
    }

    // Add an item to a localStorage() array
    function fnAddToLocalStorageArray(name, value) {
        if (!fnIsEmpty(value)) {
            // Get the existing data
            var existing = localStorage.getItem(name);

            // If no existing data, create an array
            // Otherwise, convert the localStorage string to an array
            existing = existing ? existing.split(',') : [];

            // Add new data to localStorage Array
            existing.push(value);

            // Save back to localStorage
            localStorage.setItem(name, existing.toString());
        }
    }

    // Switch case input names
    function fnSwitchCaseInput(index) {
        switch (index) {
            case 1:
                return "srm_name";
                break;
            case 2:
                return "srm_source";
                break;
            case 3:
                return "srm_creation_date";
                break;
            case 4:
                return "srm_requested_by";
                break;
            case 5:
                return "srm_type";
                break;
            case 6:
                return "srm_status";
                break;
        }
    }

    // Switch case input values index
    function fnReturnIndex(val) {
        switch (val) {
            case "srm_name":
                return 1;
                break;
            case "srm_source":
                return 2;
                break;
            case "srm_creation_date":
                return 3;
                break;
            case "srm_requested_by":
                return 4;
                break;
            case "srm_type":
                return 5;
                break;
            case "srm_status":
                return 6;
                break;
        }
    }

    // Get all source name
    function fnGetChangeRequestSourceName() {
        var arr = [];

        $.ajax({
            url: "/Home/GetChangeRequestSourceName",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetChangeRequestSourceName on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            arr.push(i.SRC_NAME);
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetChangeRequestSourceName error", error);
            }
        });

        return arr.sort();
    }

    // Get all type
    function fnGetChangeRequestType() {
        var arr = [];

        $.ajax({
            url: "/Home/GetChangeRequestType",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetChangeRequestType on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            arr.push(i.REQ_TYPE);
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetChangeRequestType error", error);
            }
        });

        return arr.sort();
    }

    // Get all status
    function fnGetChangeRequestStatus() {
        var arr = [];

        $.ajax({
            url: "/Home/GetChangeRequestStatus",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetChangeRequestStatus on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            arr.push(i.CR_STATUS);
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetChangeRequestStatus error", error);
            }
        });

        return arr.sort();
    }

    // Remove filter tag
    function fnRemoveFilterTag(table, filter_ls_name, dt_index, val) {
        var ls = "";
        var ls_count = 0;

        //if (localStorage.getItem(filter_ls_name).indexOf(",") != -1) {
        if (localStorage.getItem(filter_ls_name).indexOf(",") > 0) {
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
                table.columns(dt_index).search(search_val, true, false).draw();
            } else {
                table.columns(dt_index).search(search_val).draw();
            }
        }

        if (fnIsEmpty(localStorage.getItem(filter_ls_name))) {
            table.columns(dt_index).search("").draw();
        }
    }

    // Manage exception
    $(document).on('click', '.btn-exception', function () {
        if (!fnIsEmpty($(this).val())) {
            var str = $(this).val().split("|");
            var val = str[0].trim();
            var id = str[1].trim();
            var desc = str[2];

            // confirm modal box
            $('#modal-confirmation').modal('show');
            $("#yes_no_confirmation").html(`<strong>${val}</strong>`);
            $("#exception_description").html(desc);

            $(document).on('click', '.btn-confirmation', function () {
                if ($(this).val() == "Yes") {
                    fnManageExceptions(id, val);
                    fnLoadChangeRequestsData();

                    $('#modal-confirmation').modal('hide');
                } else if ($(this).val() == "No") {
                    $('#modal-confirmation').modal('hide');
                }
            });
        }
    });

    // Approve/Reject button
    function fnManageExceptions(record_id, exception) {
        if (!fnIsEmpty(record_id) && !fnIsEmpty(exception)) {
            if (exception == "Approve") {
                exception = "Approved";
            } else if (exception == "Reject") {
                exception = "Rejected";
            }

            $.ajax({
                url: "/Home/ManageException",
                type: "POST",
                data: {
                    record_id: record_id,
                    exception: exception
                },
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnManageExceptions on success error", data.error);
                        } else {
                            console.log("fnManageExceptions on success", data);
                        }
                    }
                },
                error: function (error) {
                    console.log("fnManageExceptions error", error);
                }
            });
        }
    }

    // Display detail
    $(document).on('click', '.btn-detail', function () {
        if (!fnIsEmpty(this.value)) {
            $.each(JSON.parse(this.value), function (index, i) {
                $(".es-creation-date").html(i.creation_date);
                $(".es-src-name").html(i.source_name);
                $(".es-cr-type").html(i.cr_type);
                $(".es-req-type").html(i.req_type);
                $(".es-exception-desc").html(i.cr_exception_desc);
            });

            $('#modal-detail').modal('show');
        } else {
            $('#modal-detail').modal('hide');
        }
    });

    // Get dataTable filter count
    function fnGetChangeRequestFilterCount(name, source_name, creation_date, requested_by, type, status) {
        $.ajax({
            type: "POST",
            url: "/Home/ChangeRequestFilterCount",
            data: {
                name: name,
                source_name: source_name,
                creation_date: creation_date,
                requested_by: requested_by,
                type: type,
                status: status
            },
            beforeSend: function () {
                $(".loader").show();
                $(".loader").css("z-index", 20);
                $("#content-wrapper").css("opacity", 0.1);
            },
            success: function (data) {
                $("#totalChangeRequest").html(data.data.data.numberChangeRequest);
                $("#totalOpenRequests").html(data.data.data.numberOpenRequests);
                $("#totalClosedRequests").html(data.data.data.numberClosedRequests);
                $("#totalNightlyProcessed").html(data.data.data.numberNightlyProcessed);
            },
            complete: function () {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            },
            error: function (err) {
                console.log("fnGetChangeRequestFilterCount success", err);
            }
        });
    }

    // Redirect member to User Profile page
    $(document).on("click", ".btn-cr-details", function () {
        if (!fnIsEmpty($(this).val())) {
            if ($(this).attr("id") == "hcp") {
                fnRedirectPage("/Home/CustomerProfile/", "cm_hcp_id", $(this).val());
            } else if ($(this).attr("id") == "hco") {
                fnRedirectPage("/Home/AccountProfile/", "hco_mdm_id", $(this).val());
            }
        }

        // Clear local storage
        //fnClearFilterLocalStorage();
    });
});