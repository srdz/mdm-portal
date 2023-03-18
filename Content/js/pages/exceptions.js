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

    var arrSourceName = fnGetChangeRequestSourceName();
    var options = $(".search-source");

    $.each(arrSourceName, function (index, i) {
        options.append(new Option(i, i));
    });

    var arrType = fnGetChangeRequestType();
    var options = $(".search-request-type");

    $.each(arrType, function (index, i) {
        options.append(new Option(i, i));
    });

    var options = $(".search-status");

    options.append(new Option("Open", "Open"));
    options.append(new Option("Closed", "Closed"));

    var arrExc = fnGetExceptionDescription();
    var options = $(".search-exception");

    $.each(arrExc, function (index, i) {
        options.append(new Option(i, i));
    });

    fnGetChangeRequestStatus();
    fnLoadExceptionsData();

    // Filter search
    $(document).on('change', '.search-source, .search-request-type, .search-status, .search-final-result, .search-exception', function () {
        $(".loader").show();
        $(".loader").css("z-index", 20);
        $("#content-wrapper").css("opacity", 0.1);

        // disabled all inputs

        var e = 0;

        if ($(this).attr("id") == "source") {
            e = 3;
        } else if ($(this).attr("id") == "request-type") {
            e = 1;
        } else if ($(this).attr("id") == "status") {
            e = 6;
        } else if ($(this).attr("id") == "final") {
            e = 7;
        } else if ($(this).attr("id") == "exception") {
            e = 2;
        }

        if (e !== 0) {
            var val = $(this).val();
            var vsl = val;

            if (vsl == "-1" || vsl == "1" || vsl == "2" || vsl == "3" || vsl == "4") {
                vsl = "";
            }

            // Store value to local storage
            fnAddToLocalStorageArray(fnSwitchCaseInput(e), vsl);

            // Verify if value exist in local storage
            var name = "";
            var request_type = "";
            var exception = "";
            var source = "";
            var processed_date = "";
            var status = "";
            var final_exception = "";

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
                } else if (storage_index == "srm_request_type") {
                    request_type = storage_value;
                    e = 1;
                } else if (storage_index == "srm_exception") {
                    exception = storage_value;
                    e = 2;
                } else if (storage_index == "srm_source") {
                    source = storage_value;
                    e = 3;
                } else if (storage_index == "srm_processed_date") {
                    processed_date = storage_value;
                } else if (storage_index == "srm_status") {
                    status = storage_value;
                    e = 6;
                } else if (storage_index == "srm_final_exception") {
                    final_exception = storage_value;
                    e = 7;
                }

                if (processed_date.indexOf("·") > 0) {
                    var str = processed_date.split("·");
                    cd1 = str[0].trim();
                    cd2 = str[1].trim();
                }

                $('#dataTable').DataTable().columns(e).search(storage_value ? storage_value : '', true, false).draw();
            });

            fnGetExceptionsFilterCount(name, request_type, exception, source, cd1 == cd2 ? cd1 : processed_date, status, final_exception);

            // Add filter tag
            fnAppendFilterTag(vsl, fnSwitchCaseInput(e));
        }
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

        // Name (0)
        if ($(this).attr('class').indexOf("srm_name") > 0) {
            fnRemoveFilterTag(table, "srm_name", 0, val);
        }

        // Request Type (1)
        if ($(this).attr('class').indexOf("srm_request_type") > 0) {
            fnRemoveFilterTag(table, "srm_request_type", 1, val);

            $('.search-request-type').val("-1");
            $('.search-request-type').select2().trigger('change');
        }

        // Exception (2)
        if ($(this).attr('class').indexOf("srm_exception") > 0) {
            fnRemoveFilterTag(table, "srm_exception", 2, val);

            $('.search-exception').val("4");
            $('.search-exception').select2().trigger('change');
        }

        // Source (3)
        if ($(this).attr('class').indexOf("srm_source") > 0) {
            fnRemoveFilterTag(table, "srm_source", 3, val);

            $('.search-source').val("1");
            $('.search-source').select2().trigger('change');
        }

        // Processed Date (4)
        if ($(this).attr('class').indexOf("srm_processed_date") > 0) {
            fnRemoveFilterTag(table, "srm_processed_date", 5, val);
        }

        // Status (5)
        if ($(this).attr('class').indexOf("srm_status") > 0) {
            fnRemoveFilterTag(table, "srm_status", 6, val);

            $('.search-status').val("2");
            $('.search-status').select2().trigger('change');
        }

        // Final Exception (6)
        if ($(this).attr('class').indexOf("srm_final_exception") > 0) {
            fnRemoveFilterTag(table, "srm_final_exception", 7, val);

            $('.search-final-result').val("3");
            $('.search-final-result').select2().trigger('change');
        }

        $("span#" + $(this).attr('id')).remove();

        var name = "";
        var request_type = "";
        var exception = "";
        var source = "";
        var processed_date = "";
        var status = "";
        var final_exception = "";

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
                e = 0;
            } else if (storage_index == "srm_request_type") {
                request_type = storage_value;
                e = 1;
            } else if (storage_index == "srm_exception") {
                exception = storage_value;
                e = 2;
            } else if (storage_index == "srm_source") {
                source = storage_value;
                e = 3;
            } else if (storage_index == "srm_processed_date") {
                processed_date = storage_value;
                e = 5;
            } else if (storage_index == "srm_status") {
                status = storage_value;
                e = 6;
            } else if (storage_index == "srm_final_exception") {
                final_exception = storage_value;
                e = 7;
            }

            if (processed_date.indexOf("·") > 0) {
                var str = processed_date.split("·");
                cd1 = str[0].trim();
                cd2 = str[1].trim();
            }

            $('#dataTable').DataTable().columns(e).search(storage_value ? storage_value : '', true, false).draw();
        });

        fnGetExceptionsFilterCount(name, request_type, exception, source, cd1 == cd2 ? cd1 : processed_date, status, final_exception);
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
            $('.search-source').val("1");
            $('.search-source').select2().trigger('change');

            $('.search-request-type').val("-1");
            $('.search-request-type').select2().trigger('change');

            $('.search-status').val("2");
            $('.search-status').select2().trigger('change');

            $('.search-final-result').val("3");
            $('.search-final-result').select2().trigger('change');

            $('.search-exception').val("4");
            $('.search-exception').select2().trigger('change');
        }

        $("#dataTable").dataTable().fnFilterClear();

        $.fn.dataTableExt.afnFiltering.length = 0;
        $('#dataTable').dataTable().fnDraw();
    });

    // Applicable to all pages
    $(document).on('click', '.overview-page, .btn-overview, .btn-my-profile, .btn-register, .btn-customers, .btn-stewardship, .btn-changerequests, .btn-query, .btn-hco-accounts, .btn-exception', function () {
        fnClearFilterLocalStorage();
    });

    // Get change request data
    function fnLoadExceptionsData() {
        $(".loader").show();
        $(".loader").css("z-index", 20);
        $("#content-wrapper").css("opacity", 0.1);

        var name = "";
        var request_type = "";
        var exception = "";
        var source = "";
        var processed_date = "";
        var status = "";
        var final_exception = "";

        var table = $("#dataTable").DataTable({
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
                "url": "/Home/LoadExceptionsData",
                "type": "POST",
                "datatype": "json"
            },
            "oLanguage": {
                "sSearch": "Global Search:"
            },
            //"dom": '<"top">rt<"bottom"flpi><"clear">',
            "sDom": '<"top">rt<"bottom"flpi><"clear">',
            "sDom": "Rlfrtip",
            "aaSorting": [[4, "desc"], [5, "asc"]],
            "columnDefs":
                [
                    {
                        "targets": [0], //name
                        "width": "30%",
                        "searchable": true,
                        "orderable": true
                    },
                    {
                        "targets": [1], //request type
                        "width": "16%",
                        "searchable": true,
                        "orderable": true
                    },
                    {
                        "targets": [2], //exception
                        "width": "13%",
                        "searchable": true,
                        "orderable": true
                    },
                    {
                        "targets": [3], //source
                        "width": "8%",
                        "searchable": true,
                        "orderable": true
                    },
                    {
                        "targets": [4], //create date
                        "width": "9%",
                        "searchable": true,
                        "orderable": true
                    },
                    {
                        "targets": [5], //processed
                        "width": "8%",
                        "searchable": true,
                        "orderable": true
                    },
                    {
                        "targets": [6], //status
                        "width": "5%",
                        "searchable": true,
                        "orderable": true
                    },
                    {
                        "targets": [7], //final result
                        "width": "9%",
                        "searchable": true,
                        "orderable": true
                    },
                    {
                        "targets": [8], //button detail
                        "width": "5%",
                        "searchable": false,
                        "orderable": true
                    }],
            "columns": [
                {
                    "data": "HCP_FIRST_NAME", // 0 //
                    "name": "HCP_FIRST_NAME",
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
                            } else if (!fnIsEmpty(full["HCP_FIRST_NAME"]) && !fnIsEmpty(full["HCP_LAST_NAME"])) {
                                // first/last = first and last not empty

                                name = fnUcFirstAllWords(full["HCP_FIRST_NAME"] + " " + full["HCP_LAST_NAME"]);
                            }
                        } else if (full["CR_TYPE"] == "HCO") {
                            if (!fnIsEmpty(full["HCO_NAME"])) {
                                name = fnUcFirstAllWords(full["HCO_NAME"]);
                            }
                        }

                        return name;
                    }
                },
                {
                    "data": "REQ_TYPE", // 1 //
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
                    "data": "CR_MDM_COMMENT", // 2 //
                    "name": "CR_MDM_COMMENT",
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
                    "data": "SRC_NAME", // 3 //
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
                    "data": "CR_EXCEPTION_CREATED", // 4 //
                    "name": "CR_EXCEPTION_CREATED",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            var regExp = /\(([^)]+)\)/;
                            var matches = regExp.exec(data);

                            return moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                        } else {
                            return "";
                        }
                    }
                },
                {
                    "data": "CR_EXCEPTION_PROCESSED", // 5 //
                    "name": "CR_EXCEPTION_PROCESSED",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            var regExp = /\(([^)]+)\)/;
                            var matches = regExp.exec(data);

                            return moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                        } else {
                            return "";
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

                            if (!fnIsEmpty(full["CR_EXCEPTION_ACTION"]) && !fnIsEmpty(full["CR_EXCEPTION_PROCESSED"]) && full["CR_EXCEPTION_STATUS"] == "False") {
                                // Closed
                                status = "Closed";
                            } else {
                                // Open
                                status = "Open";
                            }

                            return status;
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "CR_EXCEPTION_ACTION", // 7 //
                    "name": "CR_EXCEPTION_ACTION",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        var result = "";

                        if (!fnIsEmpty(data) && full["CR_EXCEPTION_STATUS"] == "True" && full["CR_EXCEPTION_PROCESSED"] == null) {
                            // In Progress (if ‘Status’ = ‘Open’ & ‘Approve or Rejected’ has been selected & awaiting our nightly processing)
                            result = "In Progress";
                        } else if (!fnIsEmpty(data) && full["CR_EXCEPTION_STATUS"] == "False" && full["CR_EXCEPTION_PROCESSED"] != null) {
                            // Approved or Rejected (if ‘Status’ = ‘Closed’ which triggers the nightly processing date to be displayed in ‘Processed’ field)
                            result = data;
                        } else if (fnIsEmpty(data) && full["CR_EXCEPTION_STATUS"] == "True" && full["CR_EXCEPTION_PROCESSED"] == null) {
                            // Null (if ‘Status’ = Open & no ‘Approve or Rejected’ selected yet)
                            result = "";
                        }

                        return result;
                    }
                },
                {
                    "data": "CR_ID", // 8 //
                    "name": "CR_ID",
                    "autoWidth": true,
                    "sClass": "tbl-btn_right",
                    "render": function (data, type, full, meta) {
                        var disable = "";
                        var html = "";

                        if (fnIsEmpty(data)) {
                            disable = "disabled";
                        }

                        var myObj = {
                            CR_ID: full["CR_ID"],
                            CR_STEWARDSHIP_ID: full["CR_STEWARDSHIP_ID"],
                            CR_EXCEPTION_ACTION: full["CR_EXCEPTION_ACTION"]//,
                            //CR_EXCEPTION_DESC: full["CR_EXCEPTION_DESC"]
                        }

                        html = `<div class="btn-toolbar" role="toolbar">
                                    <div class="btn-group mr-2 mt-1" role="group">
                                        <button name='btn-exception-detail' value='${data}' class='btn btn-exception-detail btn-sm' ${disable}>Detail</button>
                                    </div>
                                </div>
                                
                                <input type="hidden" id="hidden-detail" class="hidden-detail-${data}" value='${JSON.stringify(myObj)}' />`;

                        return html;
                    }
                }
            ],
            "initComplete": function (settings, json) {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            }
        });

        fnGetExceptionsFilterCount(name, request_type, exception, source, processed_date, status, final_exception);

        // Initialise select on DataTable
        $(".search-request-type, .search-source, .search-status, .search-final-result, .search-exception").select2({
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
            if (i == 5) {
                $(".div-processed-date").html(`<input type="text" id="datepicker" name="daterange" class="form-control list-filter search-processed-date" value="" placeholder="Search a Processed Date" />`);

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
                if (i == 0) {
                    $(".div-name").html(`<input type="text" class="form-control list-filter search-name" id="input-${i}" placeholder="Search a Name" />`);
                }

                //if (i == 2) {
                //    $(".div-exception").html(`<input type="text" class="form-control list-filter search-exception" id="input-${i}" placeholder="Search an Exception" />`);
                //}
            }
        });

        // Here we need to make date selection
        $('input[name="daterange"]').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'));

            var start = picker.startDate.format('YYYY-MM-DD');
            var end = picker.endDate.format('YYYY-MM-DD');

            fnAddToLocalStorageArray(fnSwitchCaseInput(5), picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'));

            $('#dataTable').DataTable().columns(5).search(start == end ? start : start + ' · ' + end, true, false).draw();

            // Add filter tag
            fnAppendFilterTag(picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'), fnSwitchCaseInput(5));

            var storage_value = "";
            var storage_index = "";

            var name = "";
            var request_type = "";
            var exception = "";
            var source = "";
            var processed_date = "";
            var status = "";
            var final_exception = "";

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
                } else if (storage_index == "srm_request_type") {
                    request_type = storage_value;
                } else if (storage_index == "srm_exception") {
                    exception = storage_value;
                } else if (storage_index == "srm_source") {
                    source = storage_value;
                } else if (storage_index == "srm_processed_date") {
                    processed_date = storage_value;
                    e = 5;
                } else if (storage_index == "srm_status") {
                    status = storage_value;
                } else if (storage_index == "srm_final_exception") {
                    final_exception = storage_value;
                }

                if (processed_date.indexOf("·") > 0) {
                    var str = processed_date.split("·");
                    cd1 = str[0].trim();
                    cd2 = str[1].trim();
                }
            });

            fnGetExceptionsFilterCount(name, request_type, exception, source, cd1 == cd2 ? cd1 : processed_date, status, final_exception);

            table.draw();

            $("#datepicker").val("");
        });

        // Search input text
        $(document).keypress(function (event) {
            var name = $(".search-name").val();
            var exception = $(".search-exception").val();

            var keycode = (event.keyCode ? event.keyCode : event.which);

            var request_type = "";
            var source = "";
            var processed_date = "";
            var status = "";
            var final_exception = "";

            var storage_value = "";
            var storage_index = "";

            var cd1 = "";
            var cd2 = "";

            var e = 0;

            if (keycode == '13') {
                // 0
                if (!fnIsEmpty(name)) {
                    fnAddToLocalStorageArray(fnSwitchCaseInput(0), name);

                    // Add filter tag
                    fnAppendFilterTag(name, fnSwitchCaseInput(0));

                    e = 0;
                }

                // 2
                //if (!fnIsEmpty(exception)) {
                //    fnAddToLocalStorageArray(fnSwitchCaseInput(2), exception);

                //    // Add filter tag
                //    fnAppendFilterTag(exception, fnSwitchCaseInput(2));

                //    e = 2;
                //}

                // Clear input filter
                $("input.list-filter").val("");

                $.each(fnGetLocalStorageQuery(), function (index, i) {
                    storage_value = i;

                    if (i.indexOf("=") > 0) {
                        var str = storage_value.split("=");
                        storage_index = str[0];
                        storage_value = str[1];
                    }

                    if (storage_index == "srm_name") {
                        name = storage_value;
                        e = 0;
                    } else if (storage_index == "srm_request_type") {
                        request_type = storage_value;
                    } else if (storage_index == "srm_exception") {
                        exception = storage_value;
                        //e = 2;
                    } else if (storage_index == "srm_source") {
                        source = storage_value;
                    } else if (storage_index == "srm_processed_date") {
                        processed_date = storage_value;
                    } else if (storage_index == "srm_status") {
                        status = storage_value;
                    } else if (storage_index == "srm_final_exception") {
                        final_exception = storage_value;
                    }

                    if (processed_date.indexOf("·") > 0) {
                        var str = processed_date.split("·");
                        cd1 = str[0].trim();
                        cd2 = str[1].trim();
                    }

                    $('#dataTable').DataTable().columns(e).search(storage_value ? storage_value : '', true, false).draw();
                });

                fnGetExceptionsFilterCount(name, request_type, exception, source, cd1 == cd2 ? cd1 : processed_date, status, final_exception);
            }
        });
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

        if (val === null || val == null) {
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

            clean_val = val.replace(/([,.;:/()])+/g, '_');

            clean_val = clean_val.replace(/'/g, "_");

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

    // Get dataTable filter count
    function fnGetExceptionsFilterCount(name, request_type, exception, source, processed_date, status, final_exception) {
        $.ajax({
            type: "POST",
            url: "/Home/ExceptionsFilterCount",
            data: {
                name: name,
                request_type: request_type == -1 ? "" : request_type,
                exception: exception == 4 ? "" : exception,
                source: source == 1 ? "" : source,
                processed_date: processed_date,
                status: status == 2 ? "" : status,
                final_exception: final_exception == 3 ? "" : final_exception
            },
            beforeSend: function () {
                $(".loader").show();
                $(".loader").css("z-index", 20);
                $("#content-wrapper").css("opacity", 0.1);
            },
            success: function (data) {
                $("#totalOpenExceptions").html(data.data.data.openExceptions);
                $("#totalClosedExceptions").html(data.data.data.closedExceptions);
                $("#totalApproved").html(data.data.data.totalApproved);
                $("#totalRejected").html(data.data.data.totalRejected);
                $("#totalExceptions").html(data.data.data.totalExceptions);
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

    // Switch case input names
    function fnSwitchCaseInput(index) {
        switch (index) {
            case 0:
                return "srm_name";
                break;
            case 1:
                return "srm_request_type";
                break;
            case 2:
                return "srm_exception";
                break;
            case 3:
                return "srm_source";
                break;
            case 5:
                return "srm_processed_date";
                break;
            case 6:
                return "srm_status";
                break;
            case 7:
                return "srm_final_exception";
                break;
        }
    }

    // Switch case input values index
    function fnReturnIndex(val) {
        switch (val) {
            case "srm_name":
                return 0;
                break;
            case "srm_request_type":
                return 1;
                break;
            case "srm_exception":
                return 2;
                break;
            case "srm_source":
                return 3;
                break;
            case "srm_processed_date":
                return 5;
                break;
            case "srm_status":
                return 6;
                break;
            case "srm_final_exception":
                return 7;
                break;
        }
    }

    // Get local storage for query dataTable
    function fnGetLocalStorageQuery() {
        var archive = [],
            keys = Object.keys(localStorage),
            i = 0, key;

        var keyLookup = ["srm_name", "srm_request_type", "srm_exception", "srm_source", "srm_processed_date", "srm_status", "srm_final_exception"];

        for (; key = keys[i]; i++) {
            if (keyLookup.includes(key)) {
                archive.push(key + '=' + localStorage.getItem(key));
            }
        }

        return archive;
    }

    // Clear filter value in localstorage
    function fnClearFilterLocalStorage() {
        let keysToRemove = ["srm_name", "srm_request_type", "srm_exception", "srm_source", "srm_processed_date", "srm_status", "srm_final_exception"];

        keysToRemove.forEach(k => localStorage.removeItem(k));
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

    // Get all status 
    function fnGetExceptionDescription() {
        var arr = [];

        $.ajax({
            url: "/Home/GetExceptionDescription",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetExceptionDescription on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            arr.push(i.CR_MDM_COMMENT);
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetExceptionDescription error", error);
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

    $(document).on('click', '.btn-confirmation-approve-reject', function () {
        var str = "";
        var val = "";
        var id = "";
        var user_comment = "";

        if (!fnIsEmpty(this.value)) {
            str = this.value.split("|");
            val = str[0].trim();
            id = str[1].trim();
            user_comment = $(`.user-comment-${id}`).val();

            // confirm modal box
            $('#modal-confirmation').modal('show');
            $("#yes_no_confirmation").html(`<strong>${val}</strong>`);

            $(document).on('click', '.btn-yes-no', function () {
                if ($(this).val() == "Yes") {
                    fnManageExceptions(id, val, user_comment);

                    fnResetTable();

                    fnLoadExceptionsData();

                    $('#modal-confirmation').modal('hide');
                    $('#modal-details').modal('hide');

                    $.notify("  Update was successful!",
                        {
                            icon: "bell",
                            type: "success",
                            align: "center",
                            verticalAlign: "top",
                            animation: true,
                            animationType: "drop"
                        }
                    );
                } else if ($(this).val() == "No") {
                    $('#modal-confirmation').modal('hide');
                }
            });
        }
    });

    // Approve/Reject button
    function fnManageExceptions(record_id, exception, user_comment) {
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
                    exception: exception,
                    user_comment: user_comment
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
    $(document).on('click', '.btn-exception-detail', function () {
        if (!fnIsEmpty(this.value)) {
            var cr = JSON.parse($(`.hidden-detail-${this.value}`).val());

            var c = fnGetException(cr.CR_ID);

            var st = fnGetStewardshipDataSentInfo(c.CR_STEWARDSHIP_ID);

            var cd = fnGetBestAddressInformation(c.HCP_MDM_ID);

            fnDetailButton(c, st, cd);

            var _disabled = "";

            if (fnIsEmpty(cr.CR_EXCEPTION_ACTION)) {
                _disabled = "";
            } else if (!fnIsEmpty(cr.CR_EXCEPTION_ACTION)) {
                _disabled = "disabled";
            }

            var html_approve_reject = `<div class="btn-toolbar" role="toolbar" id="toolbar-${this.value}">
                                           <div class="btn-group mr-2 mt-1" role="group">
                                               <button name='btn-approve' value="Approve|${this.value}|${cr.CR_EXCEPTION_DESC}" class='btn btn-success btn-exception btn-confirmation-approve-reject btn-approve btn-sm' ${_disabled}>Approved</button>
                                           </div>
                                           <div class="btn-group mr-2 mt-1" role="group">
                                               <button name='btn-reject' value="Reject|${this.value}|${cr.CR_EXCEPTION_DESC}" class='btn btn-danger btn-exception btn-confirmation-approve-reject btn-reject btn-sm' ${_disabled}>Rejected</button>
                                           </div>
                                       </div>`;

            $(".btns-approve-reject").html(html_approve_reject);

            $("#modal-details").modal('show');
        } else {
            $("#modal-details").modal('hide');
        }
    });

    // Get stewardship data (sent info)
    function fnGetStewardshipDataSentInfo(cr_stewardship_id) {
        var result = "";

        if (!fnIsEmpty(cr_stewardship_id)) {
            $.ajax({
                url: "/Home/GetStewardshipDataSentInfo",
                type: "POST",
                async: false,
                data: {
                    cr_stewardship_id: cr_stewardship_id
                },
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnGetStewardshipDataSentInfo on success error", data.error);
                        } else {
                            result = data[0];
                        }
                    }
                },
                error: function (error) {
                    console.log("fnGetStewardshipDataSentInfo error", error);
                }
            });
        }

        return result;
    }

    // Get HCP Best Address
    function fnGetBestAddressInformation(cm_hcp_id) {
        var result = "";

        if (!fnIsEmpty(cm_hcp_id)) {
            $.ajax({
                url: "/Home/GetBestAddressInformation",
                type: "POST",
                async: false,
                data: {
                    cm_hcp_id: cm_hcp_id
                },
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnGetBestAddressInformation on success error", data.error);
                        } else {
                            result = data.success[0];
                        }
                    }
                },
                error: function (error) {
                    console.log("fnGetBestAddressInformation error", error);
                }
            });
        }

        return result;
    }

    // Get HCP Best Address
    function fnGetException(cr_id) {
        var result = "";

        if (!fnIsEmpty(cr_id)) {
            $.ajax({
                url: "/Home/GetException",
                type: "POST",
                async: false,
                data: {
                    cr_id: cr_id
                },
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnGetException on success error", data.error);
                        } else {
                            result = data[0];
                        }
                    }
                },
                error: function (error) {
                    console.log("fnGetException error", error);
                }
            });
        }

        return result;
    }

    function fnDetailButton(cr, st, cd) {
        // `d` is the original data object for the row
        var htmlDetails = "";
        var html_cr = "";
        var html_user_comment = "";
        var html_exception_comment = "";

        // variable for CD (Current Data)
        var cd_fname = "";
        var cd_lname = "";
        var cd_mname = "";
        var cd_credentials = "";
        var cd_npi = "";
        var cd_pry_specialty = "";
        var cd_sec_specialty = "";
        var cd_address_1 = "";
        var cd_address_2 = "";
        var cd_city = "";
        var cd_state = "";
        var cd_zip = "";

        // variable for CR (Change Request)
        var fname = "";
        var lname = "";
        var mname = "";
        var credentials = "";
        var npi = "";
        var pry_specialty = "";
        var sec_specialty = "";
        var address_1 = "";
        var address_2 = "";
        var city = "";
        var state = "";
        var zip = "";
        var territory = "";

        // variable for ST (Stewardship)
        var st_fname = "";
        var st_lname = "";
        var st_mname = "";
        var st_credentials = "";
        var st_npi = "";
        var st_pry_specialty = "";
        var st_sec_specialty = "";
        var st_address_1 = "";
        var st_address_2 = "";
        var st_city = "";
        var st_state = "";
        var st_zip = "";

        if (!fnIsEmpty(cd) && cr.REQ_TYPE != "Add New HCP") {
            cd_fname = cd.first;
            cd_lname = cd.last;
            cd_mname = cd.middle;
            cd_credentials = cd.degree;
            cd_npi = cd.NPI;
            cd_pry_specialty = cd.specialty;
            cd_sec_specialty = "";
            cd_address_1 = cd.address_1;
            cd_address_2 = cd.address_2;
            cd_city = cd.city;
            cd_state = cd.state;
            cd_zip = cd.zip;
        }

        if (!fnIsEmpty(st)) {
            var st_fname = st.fname;
            var st_lname = st.lname;
            var st_mname = st.mname;
            var st_credentials = st.credentials;
            var st_npi = st.npi;
            var st_pry_specialty = st.pry_specialty;
            var st_sec_specialty = st.sec_specialty;
            var st_address_1 = st.address_1;
            var st_address_2 = st.address_2;
            var st_city = st.city;
            var st_state = st.state;
            var st_zip = st.zip_code;
        }

        if (cr.CR_TYPE == "HCP") {
            fname = cr.HCP_FIRST_NAME;
            lname = cr.HCP_LAST_NAME;
            mname = cr.HCP_MIDDLE_NAME;
            credentials = cr.HCP_CREDENTIALS;
            npi = cr.HCP_NPI_ID;
            pry_specialty = cr.HCP_PRY_SPECIALTY;
            sec_specialty = cr.HCP_SEC_SPECIALTY;
            address_1 = cr.HCP_ADDR_1;
            address_2 = cr.HCP_ADDR_2;
            city = cr.HCP_CITY;
            state = cr.HCP_STATE;
            zip = !fnIsEmpty(cr.HCP_ZIP4) ? cr.HCP_ZIP5 + "-" + cr.HCP_ZIP4 : cr.HCP_ZIP5;
        } else if (cr.CR_TYPE == "HCO") {
            fname = "";
            lname = "";
            mname = "";
            credentials = cr.HCO_COT;
            npi = cr.HCO_NPI_ID;
            pry_specialty = cr.HCO_PRY_SPECIALTY;
            sec_specialty = cr.HCO_SEC_SPECIALTY;
            address_1 = cr.HCO_ADDR_1;
            address_2 = cr.HCO_ADDR_2;
            city = cr.HCO_CITY;
            state = cr.HCO_STATE;
            zip = !fnIsEmpty(cr.HCO_ZIP4) ? cr.HCO_ZIP5 + "-" + cr.HCO_ZIP4 : cr.HCO_ZIP5;
        }

        if (!fnIsEmpty(cr.HCO_NAME)) {
            html_cr = `<tr>
                          <th scope="row">Account Name</th>
                          <td colspan="2">${fnUcFirstAllWords(cr.HCO_NAME)}</td>
                       </tr>`;
        }

        //if (!fnIsEmpty(cr.SRC_CR_USER_TERR_ID) && !fnIsEmpty(cr.SRC_CR_USER_TERR_NAME)) {
        //    territory = cr.SRC_CR_USER_TERR_ID + " " + cr.SRC_CR_USER_TERR_NAME;
        //} else if (fnIsEmpty(cr.SRC_CR_USER_TERR_ID) && !fnIsEmpty(cr.SRC_CR_USER_TERR_NAME)) {
        //    territory = cr.SRC_CR_USER_TERR_NAME;
        //} else if (!fnIsEmpty(cr.SRC_CR_USER_TERR_ID) && fnIsEmpty(cr.SRC_CR_USER_TERR_NAME)) {
        //    territory = cr.SRC_CR_USER_TERR_ID;
        //}

        if (!fnIsEmpty(cd.territory_id) && !fnIsEmpty(cd.territory_name)) {
            territory = cd.territory_id + " " + cd.territory_name;
        } else if (fnIsEmpty(cd.territory_id) && !fnIsEmpty(cd.territory_name)) {
            territory = cd.territory_name;
        } else if (!fnIsEmpty(cd.territory_id) && fnIsEmpty(cd.territory_name)) {
            territory = cd.territory_id;
        }

        //if (cr.CR_STATUS != "Pending") { // need to change CR_STATUS to Open
        //    html_user_comment = `<tr>
        //                            <th scope="row">User Comment</th>
        //                            <td colspan="2">${!fnIsEmpty(cr.SRC_CR_USER_COMMENT) ? cr.SRC_CR_USER_COMMENT : ''}</td >
        //                         </tr>`;
        //}

        html_user_comment = `<tr>
                               <th scope="row">User Comment</th>
                               <td colspan="3">${!fnIsEmpty(cr.SRC_CR_USER_COMMENT) ? cr.SRC_CR_USER_COMMENT : ''}</td >
                             </tr>`;

        html_exception_comment = `<tr>
                                    <th scope="row">Exception Comment</th>
                                    <td colspan="3">${!fnIsEmpty(cr.CR_EXCEPTION_DESC) ? cr.CR_EXCEPTION_DESC : ''}</td >
                                  </tr>`;

        html_cr += `<tr>
                      <th scope="row">Request Type</th>
                      <td colspan="3">${!fnIsEmpty(cr.REQ_TYPE) ? cr.REQ_TYPE : ''}</td >
                   </tr>
                   <tr>
                     <th scope="row">Source User</th>
                     <td colspan="3">${!fnIsEmpty(cr.SRC_CR_USER) ? cr.SRC_CR_USER : ''}</td >
                   </tr>
                   <tr>
                     <th scope="row">Territory</th>
                     <td colspan="3">${territory}</td >
                   </tr>`;

        htmlDetails += `<table class="table table-sm table-bordered">
                            <thead>
                            <tr>
                                <th style="border-top-color: white;border-left-color: white;" scope="col"></th>
                                <th class="current-data-col-${cr.CR_ID}" scope="col">Current Data</th>
                                <th scope="col">Change Request</th>
                                <th class="stewardship-col-${cr.CR_ID}" scope="col">Stewardship</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <th scope="row">First Name</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_fname}</td>
                                <td>${fname}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_fname}</td>
                            </tr>
                            <tr>
                                <th scope="row">Last Name</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_lname}</td>
                                <td>${lname}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_lname}</td>
                            </tr>
                            <tr>
                                <th scope="row">Middle Name</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_mname}</td>
                                <td>${mname}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_mname}</td>
                            </tr>
                            <tr>
                                <th scope="row">Credentials</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_credentials}</td>
                                <td>${credentials}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_credentials}</td>
                            </tr>
                            <tr>
                                <th scope="row">NPI</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_npi}</td>
                                <td>${npi}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_npi}</td>
                            </tr>
                            <tr>
                                <th scope="row">Primary Specialty</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_pry_specialty}</td>
                                <td>${pry_specialty}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_pry_specialty}</td>
                            </tr>
                            <tr>
                                <th scope="row">Secondary Specialty</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_sec_specialty}</td>
                                <td>${sec_specialty}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_sec_specialty}</td>
                            </tr>
                            <tr>
                                <th scope="row">Address Line 1</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_address_1}</td>
                                <td>${address_1}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_address_1}</td>
                            </tr>
                            <tr>
                                <th scope="row">Address Line 2</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_address_2}</td>
                                <td>${address_2}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_address_2}</td>
                            </tr>
                            <tr>
                                <th scope="row">City</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_city}</td>
                                <td>${city}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_city}</td>
                            </tr>
                            <tr>
                                <th scope="row">State</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_state}</td>
                                <td>${state}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_state}</td>
                            <tr>
                                <th scope="row">Zip Code</th>
                                <td class="current-data-col-${cr.CR_ID}">${cd_zip}</td>
                                <td>${zip}</td>
                                <td class="stewardship-col-${cr.CR_ID}">${st_zip}</td>
                            </tr>
                            ${(!fnIsEmpty(html_cr) ? html_cr : "")}
                            ${(!fnIsEmpty(html_exception_comment) ? html_exception_comment : "")}
                            ${(!fnIsEmpty(html_user_comment) ? html_user_comment : "")}
                            </tbody>
                        </table>`;

        var comment_input = `<p><input class="form-control user-comment-${cr.CR_ID}" type="text" id="user_comment" value="" placeholder="Add a Comment"></p>`;

        var output = htmlDetails + comment_input;

        $(".modal-body-details").html(output);

        if (fnIsEmpty(st)) {
            // hide
            $(`.stewardship-col-${cr.CR_ID}`).hide();
        } else {
            // show
            $(`.stewardship-col-${cr.CR_ID}`).show();
        }

        if (!fnIsEmpty(cd) && cr.REQ_TYPE != "Add New HCP") {
            // hide
            $(`.current-data-col-${cr.CR_ID}`).show();
        } else {
            // show
            $(`.current-data-col-${cr.CR_ID}`).hide();
        }
    }

    // Reset table
    function fnResetTable() {
        fnClearFilterLocalStorage();

        // Remove all filter tag
        $("span.checkbox-filter").text("");

        // Clear all input text field
        $("input[type='text']").val("");

        // Clear all selection from dropdown
        $("select.list-filter option").children().removeAttr("selected");

        // Clear all dropdown selection
        if (typeof ($('select.list-filter')) != 'undefined' || $('select.list-filter') != null) {
            $('.search-source').val("1");
            $('.search-source').select2().trigger('change');

            $('.search-request-type').val("-1");
            $('.search-request-type').select2().trigger('change');

            $('.search-status').val("2");
            $('.search-status').select2().trigger('change');

            $('.search-final-result').val("3");
            $('.search-final-result').select2().trigger('change');
        }
    }

    // Disabled inputs
    function fnDisabledInput(bool) {
        $("#reset-btn-filter, .search-name, #datepicker, .btn-exception-detail").attr("disabled", bool);
        $('.search-request-type, .search-exception, .search-source, .search-status, .search-final-result').select2({
            disabled: bool
        });
    }

    $('.modal').on('show.bs.modal', function (event) {
        var idx = $('.modal:visible').length;
        $(this).css('z-index', 1040 + (10 * idx));
    });

    $('.modal').on('shown.bs.modal', function (event) {
        var idx = ($('.modal:visible').length) - 1; // raise backdrop after animation.
        $('.modal-backdrop').not('.stacked').css('z-index', 1039 + (10 * idx));
        $('.modal-backdrop').not('.stacked').addClass('stacked');
    });
});