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

    // Load all class of trade dropdown
    var options = $(".search-class-of-trade");

    $.each(fnGetAllClassOfTrade(), function (index, i) {
        options.append(new Option(fnUcFirstAllWords(i), i));
    });

    // Load all states dropdown
    var options = $(".search-state");

    $.each(fnGetAllStates(), function (index, i) {
        options.append(new Option(i.i, i.index));
    });

    // Load all territories dropdown
    var options = $(".search-territory");

    $.each(fnGetAllHCOTerritories(), function (index, i) {
        options.append(new Option(i.Name, `${i.ID} ${i.Name}`));
    });

    // Load all territories dropdown
    var options = $(".search-status");

    $.each(fnGetAllHCOStatus(), function (index, i) {
        options.append(new Option(i.Name, i.ID));
    });

    // Load all facility type dropdown
    var options = $(".search-facility-type");
    
    $.each(fnGetAllHCOFacilityType(), function (index, i) {
        options.append(new Option(fnUcFirstAllWords(i), i));
    });

    $(".search-class-of-trade, .search-facility-type, .search-territory, .search-status, .search-state").select2({
        dropdownAutoWidth: true,
        width: '100%'
    });

    // Load all Accounts data
    fnLoadAccountsData();

    // Applicable to all pages
    $(document).on('click', '.overview-page, .btn-overview, .btn-my-profile, .btn-register, .btn-customers, .btn-stewardship, .btn-changerequests, .btn-query, .btn-changerequests, .btn-hco-accounts', function () {
        fnClearFilterLocalStorage();
    });

    // Filter search
    $(document).on('change', '.search-class-of-trade, .search-facility-type, .search-state, .search-territory, .search-status', function () {
        var e = 0;

        if ($(this).attr("id") == "class-of-trade") {
            e = 2;
        } else if ($(this).attr("id") == "facility-type") {
            e = 4;
        } else if ($(this).attr("id") == "state") {
            e = 5;
        } else if ($(this).attr("id") == "status") {
            e = 6;
        } else if ($(this).attr("id") == "territory") {
            e = 8;
        }

        if (e !== 0) {
            var val = $(this).val();
            var vsl = val;

            if (vsl == "1" || vsl == "2" || vsl == "3" || vsl == "4" || vsl == "5") {
                vsl = "";
            }

            // Store value to local storage
            fnAddToLocalStorageArray(fnSwitchCaseInput(e), vsl);

            // Verify if value exist in local storage
            var storage_value = "";
            var storage_index = "";

            var npi = "";
            var account_name = "";
            var cot = "";
            var last_updated_date = "";
            var facility_type = "";
            var state = "";
            var status = "";
            var territory = "";

            var d1 = "";
            var d2 = "";

            $.each(fnGetLocalStorageQuery(), function (index, i) {
                storage_value = i;

                if (i.indexOf("=") > 0) {
                    var str = storage_value.split("=");
                    storage_index = str[0];
                    storage_value = str[1];
                }

                if (fnReturnIndex(storage_index) == "0") {
                    npi = storage_value;
                } else if (fnReturnIndex(storage_index) == "1") {
                    account_name = storage_value;
                } else if (fnReturnIndex(storage_index) == "2") {
                    cot = storage_value;
                } else if (fnReturnIndex(storage_index) == "3") {
                    last_updated_date = storage_value;
                } else if (fnReturnIndex(storage_index) == "4") {
                    facility_type = storage_value;
                } else if (fnReturnIndex(storage_index) == "5") {
                    state = storage_value;
                } else if (fnReturnIndex(storage_index) == "6") {
                    status = storage_value;
                } else if (fnReturnIndex(storage_index) == "8") {
                    territory = storage_value.split(" ")[0].trim();
                    storage_value = storage_value.split(" ")[0].trim();
                }

                if (last_updated_date.indexOf("·") > 0) {
                    var str = last_updated_date.split("·");
                    d1 = str[0].trim();
                    d2 = str[1].trim();
                }

                $('#dataTable').DataTable().columns(e).search(storage_value ? storage_value : '', true, false).draw();
            });

            fnGetAccountsFilterCount(npi, account_name, cot, !fnIsEmpty(last_updated_date) && last_updated_date.indexOf("·") > 0 ? d1 == d2 ? d1 : last_updated_date : "", facility_type, state, status, territory);

            // Add filter tag
            fnAppendFilterTag(vsl, fnSwitchCaseInput(e));
        }
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
                console.log(x.responseText + "  " + x.status);
            }
        });
    });

    // Reset filters and disabled reset button
    $(document).on("click", "#reset-btn-filter", function (e) {
        // Clear data storage values
        fnClearFilterLocalStorage();

        // Remove all filter tag
        $("span.checkbox-filter").text("");

        // Clear all input text field
        $(".list-filter input[type='text']").val("");
        $(".map-filter input[type='text']").val("");

        // Clear all selection from dropdown
        $("select.list-filter option").children().removeAttr("selected");

        // Clear all dropdown selection
        if (typeof ($('select.list-filter')) != 'undefined' || $('select.list-filter') != null) {
            $('.search-class-of-trade').val("1");
            $('.search-class-of-trade').select2().trigger('change');

            $('.search-state').val("2");
            $('.search-state').select2().trigger('change');

            $('.search-territory').val("3");
            $('.search-territory').select2().trigger('change');

            $('.search-status').val("4");
            $('.search-status').select2().trigger('change');

            $('.search-facility-type').val("5");
            $('.search-facility-type').select2().trigger('change');
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

        if ($(this).attr('id').indexOf("_") > 0) {
            val = $(this).attr('id');
        }

        var table = $("#dataTable").DataTable();

        // List - NPI (0)
        if ($(this).attr('class').indexOf("npi") > 0) {
            fnRemoveFilterTag(table, "npi", 0, val);
        }

        // List - Account Name (1)
        if ($(this).attr('class').indexOf("account_name") > 0) {
            fnRemoveFilterTag(table, "account_name", 1, val);
        }

        // List - Class Of Trade (2)
        if ($(this).attr('class').indexOf("cot") > 0) {
            fnRemoveFilterTag(table, "cot", 2, val);

            $('.search-class-of-trade').val("1");
            $('.search-class-of-trade').select2().trigger('change');
        }

        // List - Last Updated Date (3)
        if ($(this).attr('class').indexOf("last_updated_date") > 0) {
            fnRemoveFilterTag(table, "last_updated_date", 3, val);

            $.fn.dataTableExt.afnFiltering.length = 0;
            $('#dataTable').dataTable().fnDraw();
        }

        // List - Facility Type (4)
        if ($(this).attr('class').indexOf("facility_type") > 0) {
            fnRemoveFilterTag(table, "facility_type", 4, val);

            $('.search-facility-type').val("5");
            $('.search-facility-type').select2().trigger('change');
        }

        // List - State (5)
        if ($(this).attr('class').indexOf("state") > 0) {
            fnRemoveFilterTag(table, "state", 5, val);

            $('.search-state').val("2");
            $('.search-state').select2().trigger('change');
        }

        // List - Status (6)
        if ($(this).attr('class').indexOf("status") > 0) {
            fnRemoveFilterTag(table, "status", 6, val);

            $('.search-status').val("4");
            $('.search-status').select2().trigger('change');
        }

        // List - Territory (8)
        if ($(this).attr('class').indexOf("territory") > 0) {
            fnRemoveFilterTag(table, "territory", 8, val);

            $('.search-territory').val("3");
            $('.search-territory').select2().trigger('change');
        }

        $("span#" + $(this).attr('id')).remove();

        // Verify if value exist in local storage
        var npi = "";
        var account_name = "";
        var cot = "";
        var last_updated_date = "";
        var facility_type = "";
        var state = "";
        var status = "";
        var territory = "";

        var storage_value = "";
        var storage_index = "";

        var d1 = "";
        var d2 = "";

        $.each(fnGetLocalStorageQuery(), function (index, i) {
            storage_value = i;

            if (i.indexOf("=") > 0) {
                var str = storage_value.split("=");
                storage_index = str[0];
                storage_value = str[1];
            }

            if (fnReturnIndex(storage_index) == "0") {
                npi = storage_value;
            } else if (fnReturnIndex(storage_index) == "1") {
                account_name = storage_value;
            } else if (fnReturnIndex(storage_index) == "2") {
                cot = storage_value;
            } else if (fnReturnIndex(storage_index) == "3") {
                last_updated_date = storage_value;
            } else if (fnReturnIndex(storage_index) == "4") {
                facility_type = storage_value;
            } else if (fnReturnIndex(storage_index) == "5") {
                state = storage_value;
            } else if (fnReturnIndex(storage_index) == "6") {
                status = storage_value;
            } else if (fnReturnIndex(storage_index) == "8") {
                territory = storage_value;
            }

            if (last_updated_date.indexOf("·") > 0) {
                var str = last_updated_date.split("·");
                d1 = str[0].trim();
                d2 = str[1].trim();
            }
        });

        fnGetAccountsFilterCount(npi, account_name, cot, !fnIsEmpty(last_updated_date) && last_updated_date.indexOf("·") > 0 ? d1 == d2 ? d1 : last_updated_date : "", facility_type, state, status, territory);
    });

    // Redirect member to User Profile page
    $(document).on("click", ".btn-account-profile", function () {
        fnRedirectPage("/Home/AccountProfile/", "hco_mdm_id", $(this).val());

        // Clear local storage
        fnClearFilterLocalStorage();
    });

    // Get all states
    function fnGetAllStates() {
        var arr_st = [];

        $.ajax({
            url: '/Home/GetAllStates',
            type: 'GET',
            async: false,
            success: function (data) {
                if (data != null) {
                    data = JSON.parse(data);

                    $.each(data, function (index, i) {
                        if (!fnIsEmpty(i)) {
                            arr_st.push({ index, i });
                        }
                    });

                    arr_st = fnUnique(arr_st);
                }

                //if (!fnIsEmpty(arr_st)) {
                //    fnLoadDataToLocalStorage('stateFilter', arr_st);
                //}
            },
            error: function (error) {
                console.log("fnGetAllStates error", error);
            }
        });

        return arr_st.sort();
    }

    // Get all status
    function fnGetAllHCOStatus() {
        var arr_status = [];

        $.ajax({
            url: "/Home/GetAllHCOStatus",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetAllStatus on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            arr_status.push({ ID: i.status, Name: i.status });
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetAllStatus error", error);
            }
        });

        return arr_status.sort();
    }

    // Get all territory
    function fnGetAllHCOTerritories() {
        var arr_terr = [];

        $.ajax({
            url: "/Home/GetAllHCOTerritories",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetAllHCOTerritories on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            arr_terr.push({ ID: i.territory_id, Name: i.territory_name });
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetAllHCOTerritories error", error);
            }
        });

        return arr_terr.sort();
    }

    // Get all class of trade
    function fnGetAllClassOfTrade() {
        var arr_ct = [];

        $.ajax({
            url: '/Home/GetAllClassOfTrade',
            type: 'GET',
            async: false,
            success: function (data) {
                if (data != null) {
                    $.each(data.data, function (index, i) {
                        if (!fnIsEmpty(i.class_of_trade)) {
                            arr_ct.push(i.class_of_trade.toLowerCase());
                        }
                    });

                    arr_ct = fnUnique(arr_ct);
                }
            },
            error: function (error) {
                console.log("fnGetAllClassOfTrade error", error);
            }
        });

        return arr_ct.sort();
    }

    // Get all class of trade
    function fnGetAllHCOFacilityType() {
        var arr_ft = [];

        $.ajax({
            url: '/Home/GetAllHCOFacilityType',
            type: 'GET',
            async: false,
            success: function (data) {
                if (data != null) {
                    $.each(data.data, function (index, i) {
                        if (!fnIsEmpty(i.facility_type)) {
                            arr_ft.push(i.facility_type.toLowerCase());
                        }
                    });

                    arr_ft = fnUnique(arr_ft);
                }
            },
            error: function (error) {
                console.log("fnGetAllClassOfTrade error", error);
            }
        });

        return arr_ft.sort();
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

    // Return State abbreviation or name
    function fnAbbrState(input, to) {
        var states = [
            ['Arizona', 'AZ'],
            ['Alabama', 'AL'],
            ['Alaska', 'AK'],
            ['Arizona', 'AZ'],
            ['APO', 'AP'],
            ['Arkansas', 'AR'],
            ['California', 'CA'],
            ['Colorado', 'CO'],
            ['Connecticut', 'CT'],
            ['District Of Columbia', 'DC'],
            ['Delaware', 'DE'],
            ['Florida', 'FL'],
            ['Georgia', 'GA'],
            ['Hawaii', 'HI'],
            ['Idaho', 'ID'],
            ['Illinois', 'IL'],
            ['Indiana', 'IN'],
            ['Iowa', 'IA'],
            ['Kansas', 'KS'],
            ['Kentucky', 'KY'],
            ['Louisiana', 'LA'],
            ['Maine', 'ME'],
            ['Maryland', 'MD'],
            ['Massachusetts', 'MA'],
            ['Michigan', 'MI'],
            ['Minnesota', 'MN'],
            ['Mississippi', 'MS'],
            ['Missouri', 'MO'],
            ['Montana', 'MT'],
            ['Nebraska', 'NE'],
            ['Nevada', 'NV'],
            ['New Hampshire', 'NH'],
            ['New Jersey', 'NJ'],
            ['New Mexico', 'NM'],
            ['New York', 'NY'],
            ['North Carolina', 'NC'],
            ['North Dakota', 'ND'],
            ['Ohio', 'OH'],
            ['Oklahoma', 'OK'],
            ['ON', 'ON'],
            ['Oregon', 'OR'],
            ['Pennsylvania', 'PA'],
            ['Puerto Rico', 'PR'],
            ['Rhode Island', 'RI'],
            ['South Carolina', 'SC'],
            ['South Dakota', 'SD'],
            ['Tennessee', 'TN'],
            ['Texas', 'TX'],
            ['Utah', 'UT'],
            ['Vermont', 'VT'],
            ['Virginia', 'VA'],
            ['Virgin Islands', 'VI'],
            ['Washington', 'WA'],
            ['West Virginia', 'WV'],
            ['Wisconsin', 'WI'],
            ['Wyoming', 'WY'],
        ];

        if (to == 'abbr') {
            input = input.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });

            for (i = 0; i < states.length; i++) {
                if (states[i][0] == input) {
                    return (states[i][1]);
                }
            }
        } else if (to == 'name') {
            input = input.toUpperCase();

            for (i = 0; i < states.length; i++) {
                if (states[i][1] == input) {
                    return (states[i][0]);
                }
            }
        }
    }

    // Load Data - Server-Side
    function fnLoadAccountsData() {
        var npi = "";
        var account_name = "";
        var cot = "";
        var last_updated_date = "";
        var facility_type = "";
        var state = "";
        var status = "";
        var territory = "";

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
                "url": "/Home/LoadAccountsData",
                "type": "POST",
                "datatype": "json"
            },
            "oLanguage": {
                "sSearch": "Global Search:"
            },
            "dom": '<"top">rt<"bottom"flpi><"clear">',
            "sDom": "Rlfrtip",
            "columnDefs":
                [{
                    "targets": [0], //npi
                    "width": "8%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [1], //account name
                    "width": "16%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [2], //class of trade
                    "width": "12%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [3], //last updated date
                    "width": "12%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [4], //facility type
                    "width": "8%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [5], //state
                    "width": "6%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [6], //status
                    "width": "5%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [7], //button
                    "width": "5%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [8], //territory
                    "visible": false,
                    "searchable": false
                }],
            "columns": [
                {
                    "data": "NPI", // 0
                    "name": "NPI",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        var flag = full["Under_Validation"] == "True" ? '  <i style="color: orange;" class="fas fa-flag"></i>' : "";

                        return !fnIsEmpty(data) ? data + flag : fnIsEmpty(data) ? "N/A" + flag : "N/A";
                    }
                },
                {
                    "data": "name", // 1
                    "name": "name",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        return !fnIsEmpty(data) ? data : "N/A";
                    }
                },
                {
                    "data": "class_of_trade", // 2
                    "name": "class_of_trade",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        return !fnIsEmpty(data) ? fnUcFirstAllWords(data) : "N/A";
                    }
                },
                {
                    "data": "name_date", // 3
                    "name": "name_date",
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
                    "data": "facility_type", // 4
                    "name": "facility_type",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        return !fnIsEmpty(data) ? fnUcFirstAllWords(data) : "N/A";
                    }
                },
                {
                    "data": "state", // 5
                    "name": "state",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        return !fnIsEmpty(data) ? fnAbbrState(data, 'name') : "N/A";
                    }
                },
                {
                    "data": "status", // 6
                    "name": "status",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        var color = "success";

                        if (data == "Inactive") {
                            color = "danger";
                        } else if (data == "Active") {
                            color = "success";
                        } else {
                            color = "secondary";
                        }

                        return `<h6 class="status-col"><span class="badge badge-${color}">${data}</span></h6>`;
                    }
                },
                {
                    "data": "HCO_MDM_ID", // 7
                    "name": "HCO_MDM_ID",
                    "autoWidth": true,
                    "sClass": "tbl-btn_right",
                    "render": function (data, type, full, meta) {
                        return `<button name='View' value='${data}' class='btn btn-account-profile btn-sm account-profile'>View</button> `;
                    }
                },
                {
                    "data": "territory_id", // 8
                    "name": "territory_id",
                    "render": function (data, type, full, meta) {
                        return !fnIsEmpty(data) ? data : "N/A";
                    }
                },
            ]
        });

        fnGetAccountsFilterCount(npi, account_name, cot, last_updated_date, facility_type, state, status, territory);

        var usedNames = {};
        $("select > option").each(function () {
            if (usedNames[this.value]) {
                $(this).remove();
            } else {
                usedNames[this.value] = this.text;
            }
        });

        // Header filter
        $('#dataTable thead th').each(function (i) {
            if (i != 2 && i != 4 && i != 5 && i != 6) {
                if (i == 3) {
                    $(".div-last-updated-date").html(`<input type="text" id="datepicker" name="daterange" class="form-control list-filter" value="" placeholder="Search a Last Updated Date" />`);

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
                        $(".div-npi").html(`<input type="text" class="form-control list-filter search-npi" id="input-${i}" placeholder="Search a NPI" />`);
                    }

                    if (i == 1) {
                        $(".div-account-name").html(`<input type="text" class="form-control list-filter search-account-name" id="input-${i}" placeholder="Search a Account" />`);
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
            fnAppendFilterTag(picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'), fnSwitchCaseInput(4));

            // Verify if value exist in local storage
            var npi = "";
            var account_name = "";
            var cot = "";
            var last_updated_date = "";
            var facility_type = "";
            var state = "";
            var status = "";
            var territory = "";

            var storage_value = "";
            var storage_index = "";

            var d1 = "";
            var d2 = "";

            $.each(fnGetLocalStorageQuery(), function (index, i) {
                storage_value = i;

                if (i.indexOf("=") > 0) {
                    var str = storage_value.split("=");
                    storage_index = str[0];
                    storage_value = str[1];
                }

                if (fnReturnIndex(storage_index) == "0") {
                    npi = storage_value;
                } else if (fnReturnIndex(storage_index) == "1") {
                    account_name = storage_value;
                } else if (fnReturnIndex(storage_index) == "2") {
                    cot = storage_value;
                } else if (fnReturnIndex(storage_index) == "3") {
                    last_updated_date = storage_value;
                } else if (fnReturnIndex(storage_index) == "4") {
                    facility_type = storage_value;
                } else if (fnReturnIndex(storage_index) == "5") {
                    state = storage_value;
                } else if (fnReturnIndex(storage_index) == "6") {
                    status = storage_value;
                } else if (fnReturnIndex(storage_index) == "8") {
                    territory = storage_value;
                }

                if (last_updated_date.indexOf("·") > 0) {
                    var str = last_updated_date.split("·");
                    d1 = str[0].trim();
                    d2 = str[1].trim();
                }
            });

            fnGetAccountsFilterCount(npi, account_name, cot, !fnIsEmpty(last_updated_date) && last_updated_date.indexOf("·") > 0 ? d1 == d2 ? d1 : last_updated_date : "", facility_type, state, status, territory);

            table.draw();

            $("#datepicker").val("");
        });

        // Search input text
        $(document).keypress(function (event) {
            var npi = $(".search-npi").val();
            var account_name = $(".search-account-name").val();

            var keycode = (event.keyCode ? event.keyCode : event.which);

            var cot = "";
            var last_updated_date = "";
            var facility_type = "";
            var state = "";
            var status = "";
            var territory = "";

            var storage_value = "";
            var storage_index = "";

            var d1 = "";
            var d2 = "";

            if (keycode == '13') { //need to fix this function
                if (!fnIsEmpty(npi)) {
                    fnAddToLocalStorageArray(fnSwitchCaseInput(0), npi);

                    // Add filter tag
                    fnAppendFilterTag(npi, fnSwitchCaseInput(0));
                }

                if (!fnIsEmpty(account_name)) {
                    fnAddToLocalStorageArray(fnSwitchCaseInput(1), account_name);

                    // Add filter tag
                    fnAppendFilterTag(account_name, fnSwitchCaseInput(1));
                }

                // Clear input filter
                $("input.list-filter").val("");

                $.each(fnGetLocalStorageQuery(), function (index, i) {
                    storage_value = i;

                    if (i.indexOf("=") > 0) {
                        var str = storage_value.split("=");
                        storage_index = str[0];
                        storage_value = str[1];
                    }

                    if (fnReturnIndex(storage_index) == "0") {
                        npi = storage_value;
                    } else if (fnReturnIndex(storage_index) == "1") {
                        account_name = storage_value;
                    } else if (fnReturnIndex(storage_index) == "2") {
                        cot = storage_value;
                    } else if (fnReturnIndex(storage_index) == "3") {
                        last_updated_date = storage_value;
                    } else if (fnReturnIndex(storage_index) == "4") {
                        facility_type = storage_value;
                    } else if (fnReturnIndex(storage_index) == "5") {
                        state = storage_value;
                    } else if (fnReturnIndex(storage_index) == "6") {
                        status = storage_value;
                    } else if (fnReturnIndex(storage_index) == "8") {
                        territory = storage_value;
                    }

                    if (last_updated_date.indexOf("·") > 0) {
                        var str = last_updated_date.split("·");
                        d1 = str[0].trim();
                        d2 = str[1].trim();
                    }

                    $('#dataTable').DataTable().columns(fnReturnIndex(storage_index)).search(storage_value ? storage_value : '', true, false).draw();

                });

                fnGetAccountsFilterCount(npi, account_name, cot, !fnIsEmpty(last_updated_date) && last_updated_date.indexOf("·") > 0 ? d1 == d2 ? d1 : last_updated_date : "", facility_type, state, status, territory);
            }
        });
    }

    // Get local storage for query dataTable
    function fnGetLocalStorageQuery() {
        var archive = [],
            keys = Object.keys(localStorage),
            i = 0, key;

        var keyLookup = ["npi", "account_name", "cot", "last_updated_date", "facility_type", "state", "status", "territory"];

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
            existing = existing ? existing.split(',') : [];

            // Add new data to localStorage Array
            existing.push(value);

            // Save back to localStorage
            localStorage.setItem(name, existing.toString());
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

    // Filter count
    function fnGetAccountsFilterCount(npi, account_name, cot, last_updated_date, facility_type, state, status, territory) {
        $.ajax({
            type: "POST",
            url: "/Home/AccountsFilterCount",
            data: {
                npi: npi,
                account_name: account_name,
                cot: cot,
                last_updated_date: last_updated_date,
                facility_type: facility_type,
                state: state,
                status: status,
                territory_id: territory
            },
            beforeSend: function () {
                $(".loader").show();
                $(".loader").css("z-index", 20);
                $("#content-wrapper").css("opacity", 0.1);
            },
            success: function (data) {
                if (data.data.length == 0) {
                    $("#totalAccounts").html(0);
                    $("#totalNPI").html(0);
                    $("#totalCot").html(0);
                    $("#totalFacilityType").html(0);
                    $("#totalStates").html(0);
                }

                $.each(data.data, function (index, i) {
                    $("#totalAccounts").html(i.hco_mdm_id);
                    $("#totalNPI").html(i.npi);
                    $("#totalCot").html(i.cot);
                    $("#totalFacilityType").html(i.facility_type);
                    $("#totalStates").html(i.state);
                });
            },
            complete: function () {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            },
            error: function (err) {
                console.log("fnGetAccountsFilterCount success", err);
            }
        });
    }

    // Switch case input names
    function fnSwitchCaseInput(index) {
        switch (index) {
            case 0:
                return "npi";
                break;
            case 1:
                return "account_name";
                break;
            case 2:
                return "cot";
                break;
            case 3:
                return "last_updated_date";
                break;
            case 4:
                return "facility_type";
                break;
            case 5:
                return "state";
                break;
            case 6:
                return "status";
                break;
            case 8:
                return "territory";
                break;
        }
    }

    // Switch case input values index
    function fnReturnIndex(val) {
        switch (val) {
            case "npi":
                return 0;
                break;
            case "account_name":
                return 1;
                break;
            case "cot":
                return 2;
                break;
            case "last_updated_date":
                return 3;
                break;
            case "facility_type":
                return 4;
                break;
            case "state":
                return 5;
                break;
            case "status":
                return 6;
                break;
            case "territory":
                return 8;
                break;
        }
    }

    // Clear filter value in localstorage
    function fnClearFilterLocalStorage() {
        let keysToRemove = ["npi", "account_name", "cot", "last_updated_date", "facility_type", "state", "status", "territory"];

        keysToRemove.forEach(k => localStorage.removeItem(k));
    }

    // Remove filter tag
    function fnRemoveFilterTag(table, filter_ls_name, dt_index, val) {
        var ls = "";
        var ls_count = 0;

        if (localStorage.getItem(filter_ls_name).indexOf(",") != -1) {
            ls = localStorage.getItem(filter_ls_name).split(",");

            ls = ls.filter(Boolean);

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

                table.columns(dt_index).search(search_val, true, false).draw();
            } else {
                table.columns(dt_index).search(search_val).draw();
            }
        }

        if (fnIsEmpty(localStorage.getItem(filter_ls_name))) {
            table.columns(dt_index).search("").draw();
        }
    }

    // This will redirect user to a page
    var fnRedirectPage = function (redirectUrl, arg, value) {
        var form = $('<form action="' + redirectUrl + '" method="post"><input type="hidden" name="' + arg + '" value="' + value + '"></input></form>');

        $('body').append(form);

        $(form).submit();
    };
});