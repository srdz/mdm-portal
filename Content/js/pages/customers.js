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

    // Load all specialties dropdown
    var arrSpecialty = fnGetAllSpecialties();

    var options = $(".search-specialty");

    $.each(arrSpecialty, function (index, i) {
        options.append(new Option(fnUcFirstAllWords(i), i.toUpperCase()));
    });

    // Load all degrees dropdown
    var arrDegree = fnGetAllDegrees();

    var options = $(".search-degree");

    $.each(arrDegree, function (index, i) {
        options.append(new Option(i.Name.toUpperCase(), i.Name));
    });

    // Load all states dropdown
    var arrState = fnGetAllStates();

    var options = $(".search-state");

    $.each(arrState, function (index, i) {
        options.append(new Option(fnUcFirstAllWords(i['i']), i['i']));
    });
    
    // Load all territories dropdown
    var arrTerritory = fnGetAllTerritory();

    var options = $(".search-territory");

    $.each(arrTerritory, function (index, i) {
        var name = i.Name;
        var id = i.ID;

        //if (name.indexOf("-") > 0) {
        if (name.indexOf("_") > 0) {
            //name = name.replace(/[-]/g, "·");
            name = name.replace(/[_]/g, "·");
        }

        if (name.indexOf("-") > 0) {
            name = name.replace(/-/g, ' ');
        }

        if (id === "9999") {
            options.append(new Option(name, id));
        } else {
            options.append(new Option(`${id}  ${name}`, `${id}  ${name}`));
        }
    });

    // Load all territories dropdown
    var arrStatus = fnGetAllStatus();

    var options = $(".search-status");

    $.each(arrStatus, function (index, i) {
        if (!fnIsEmpty(i.Name)) {
            if (i.Name != "-") {
                options.append(new Option(i.Name, i.Name));
            }
        }
    });

    $(".search-specialty, .search-status, .search-degree, .search-state, .search-territory").select2({
        dropdownAutoWidth: true,
        width: '100%'
    });

    // Tooltip
    $.protip();

    // Filter search
    $(document).on('change', '.search-specialty, .search-status, .search-degree, .search-state, .search-territory', function () {
        var e = 0;

        if ($(this).attr("id") == "specialty") {
            e = 3;
        } else if ($(this).attr("id") == "status") {
            e = 8;
        } else if ($(this).attr("id") == "degree") {
            e = 5;
        } else if ($(this).attr("id") == "territory") {
            e = 7;
        } else if ($(this).attr("id") == "state") {
            e = 6;
        }

        if (e !== 0) {
            var val = $.fn.dataTable.util.escapeRegex($(this).val());
            var vsl = val;

            if (vsl == "1" || vsl == "2" || vsl == "3" || vsl == "4" || vsl == "5") {
                vsl = "";
            }

            if (e == "7" && vsl !== "Unaligned") {
                if (vsl.indexOf("·") > 0) {
                    //vsl = vsl.replace(/[·]/g, "-");
                    vsl = vsl.replace(/[·]/g, "_");
                }
            }

            // Store value to local storage
            fnAddToLocalStorageArray(fnSwitchCaseInput(e), vsl);

            // Verify if value exist in local storage
            var storage_value = "";
            var storage_index = "";

            var npi = "";
            var full_name = "";
            var specialty = "";
            var name_date = "";
            var degree = "";
            var state = "";
            var territory = "";
            var status = "";

            var d1 = "";
            var d2 = "";

            $.each(fnGetLocalStorageQuery(), function (index, i) {
                storage_value = i;

                if (i.indexOf("=") > 0) {
                    var str = storage_value.split("=");
                    storage_index = str[0];
                    storage_value = str[1];
                }

                if (fnReturnIndex(storage_index) == "1") {
                    npi = storage_value;
                } else if (fnReturnIndex(storage_index) == "2") {
                    full_name = storage_value;
                } else if (fnReturnIndex(storage_index) == "3") {
                    specialty = storage_value;
                } else if (fnReturnIndex(storage_index) == "4") {
                    name_date = storage_value;
                } else if (fnReturnIndex(storage_index) == "5") {
                    degree = storage_value;
                } else if (fnReturnIndex(storage_index) == "6") {
                    state = storage_value;
                } else if (fnReturnIndex(storage_index) == "7") {
                    territory = storage_value;
                } else if (fnReturnIndex(storage_index) == "8") {
                    status = storage_value;
                }

                //$('#dataTable').DataTable().columns(fnReturnIndex(storage_index)).search(storage_value ? storage_value : '', true, false).draw();

                //fnGetCustomersFilterCount(npi, full_name, specialty, name_date, degree, state, territory, status);

                if (name_date.indexOf("·") > 0) {
                    var str = name_date.split("·");
                    d1 = str[0].trim();
                    d2 = str[1].trim();
                }

                $('#dataTable').DataTable().columns(fnReturnIndex(storage_index)).search(storage_value ? storage_value : '', true, false).draw();

                //fnGetCustomersFilterCount(npi, full_name, specialty, !fnIsEmpty(name_date) && name_date.indexOf("·") > 0 ? d1 == d2 ? d1 : name_date : "", degree, state, territory, status);
            });

            fnGetCustomersFilterCount(npi, full_name, specialty, !fnIsEmpty(name_date) && name_date.indexOf("·") > 0 ? d1 == d2 ? d1 : name_date : "", degree, state, territory, status);

            // Add filter tag
            fnAppendFilterTag(vsl, fnSwitchCaseInput(e));

            //$('#dataTable').DataTable().columns(e).search(vsl ? vsl : '', true, false).draw();

            //fnRefreshBoxCount();
        }
    });

    fnLoadCustomersData();

    // Applicable to all pages
    $(document).on('click', '.overview-page, .btn-overview, .btn-my-profile, .btn-register, .btn-customers, .btn-stewardship, .btn-changerequests, .btn-query, .btn-changerequests, .btn-hco-accounts', function () {
        fnClearFilterLocalStorage();
    });

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

        // List - ID (0)
        if ($(this).attr('class').indexOf("srm_id") > 0) {
            fnRemoveFilterTag(table, "srm_id", 0, val);
        }

        // List - NPI (1)
        if ($(this).attr('class').indexOf("srm_npi") > 0) {
            fnRemoveFilterTag(table, "srm_npi", 1, val);
        }

        // List - Practitionner (2)
        if ($(this).attr('class').indexOf("srm_practitionner") > 0) {
            fnRemoveFilterTag(table, "srm_practitionner", 2, val);
        }

        // List - Specialty (3)
        if ($(this).attr('class').indexOf("srm_specialty") > 0) {
            fnRemoveFilterTag(table, "srm_specialty", 3, val);

            $('.search-specialty').val("1");
            $('.search-specialty').select2().trigger('change');
        }

        // List - Last Updated Date (4)
        if ($(this).attr('class').indexOf("srm_last_updated") > 0) {
            fnRemoveFilterTag(table, "srm_last_updated", 4, val);

            $.fn.dataTableExt.afnFiltering.length = 0;
            $('#dataTable').dataTable().fnDraw();
        }

        // List - Degree (5)
        if ($(this).attr('class').indexOf("srm_degree") > 0) {
            fnRemoveFilterTag(table, "srm_degree", 5, val);

            $('.search-degree').val("5");
            $('.search-degree').select2().trigger('change');
        }

        // List - State (6)
        if ($(this).attr('class').indexOf("srm_state") > 0) {
            fnRemoveFilterTag(table, "srm_state", 6, val);

            $('.search-state').val("2");
            $('.search-state').select2().trigger('change');
        }

        // List - Territory (7)
        if ($(this).attr('class').indexOf("srm_territory") > 0) {
            fnRemoveFilterTag(table, "srm_territory", 7, val);

            $('.search-territory').val("3");
            $('.search-territory').select2().trigger('change');
        }

        // List - Status (8)
        if ($(this).attr('class').indexOf("srm_status") > 0) {
            fnRemoveFilterTag(table, "srm_status", 8, val);

            $('.search-status').val("4");
            $('.search-status').select2().trigger('change');
        }

        $("span#" + $(this).attr('id')).remove();

        // Verify if value exist in local storage
        var storage_value = "";
        var storage_index = "";

        var npi = "";
        var full_name = "";
        var specialty = "";
        var name_date = "";
        var degree = "";
        var state = "";
        var territory = "";
        var status = "";

        var d1 = "";
        var d2 = "";

        $.each(fnGetLocalStorageQuery(), function (index, i) {
            storage_value = i;

            if (i.indexOf("=") > 0) {
                var str = storage_value.split("=");
                storage_index = str[0];
                storage_value = str[1];
            }

            if (fnReturnIndex(storage_index) == "1") {
                npi = storage_value;
            } else if (fnReturnIndex(storage_index) == "2") {
                full_name = storage_value;
            } else if (fnReturnIndex(storage_index) == "3") {
                specialty = storage_value;
            } else if (fnReturnIndex(storage_index) == "4") {
                name_date = storage_value;
            } else if (fnReturnIndex(storage_index) == "5") {
                degree = storage_value;
            } else if (fnReturnIndex(storage_index) == "6") {
                state = storage_value;
            } else if (fnReturnIndex(storage_index) == "7") {
                territory = storage_value;
            } else if (fnReturnIndex(storage_index) == "8") {
                status = storage_value;
            }

            if (name_date.indexOf("·") > 0) {
                var str = name_date.split("·");
                d1 = str[0].trim();
                d2 = str[1].trim();
            }

            $('#dataTable').DataTable().columns(fnReturnIndex(storage_index)).search(storage_value ? storage_value : '', true, false).draw();
        });

        fnGetCustomersFilterCount(npi, full_name, specialty, !fnIsEmpty(name_date) && name_date.indexOf("·") > 0 ? d1 == d2 ? d1 : name_date : "", degree, state, territory, status);
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
            $('.search-specialty').val("1");
            $('.search-specialty').select2().trigger('change');

            $('.search-state').val("2");
            $('.search-state').select2().trigger('change');

            $('.search-territory').val("3");
            $('.search-territory').select2().trigger('change');

            $('.search-status').val("4");
            $('.search-status').select2().trigger('change');

            $('.search-degree').val("5");
            $('.search-degree').select2().trigger('change');
        }

        $("#dataTable").dataTable().fnFilterClear();
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
    
    // Redirect member to User Profile page
    $(document).on("click", ".user-profile", function () {
        fnRedirectPage("/Home/CustomerProfile/", "cm_hcp_id", $(this).val());

        // Clear local storage
        fnClearFilterLocalStorage();
    });

    // This will redirect user to a page
    var fnRedirectPage = function (redirectUrl, arg, value) {
        var form = $('<form action="' + redirectUrl + '" method="post"><input type="hidden" name="' + arg + '" value="' + value + '"></input></form>');

        $('body').append(form);

        $(form).submit();
    };

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

    // Get all degrees
    function fnGetAllDegrees() {
        var arr_dg = [];

        $.ajax({
            url: '/Home/GetAllDegrees',
            type: 'GET',
            async: false,
            success: function (data) {
                if (data != null) {
                    $.each(data.data, function (index, i) {
                        if (!fnIsEmpty(i.degree)) {
                            arr_dg.push({ Name: i.degree });
                        }
                    });

                    arr_dg = fnUnique(arr_dg);
                }
            },
            error: function (error) {
                console.log("fnGetAllDegrees error", error);
            }
        });

        return arr_dg.sort();
    }

    // Get all specialties
    function fnGetAllSpecialties() {
        var arr_sp = [];

        $.ajax({
            url: '/Home/GetAllSpecialties',
            type: 'GET',
            async: false,
            success: function (data) {
                if (data != null) {
                    $.each(data.data, function (index, i) {
                        if (!fnIsEmpty(i.specialty)) {
                            arr_sp.push(i.specialty.toLowerCase());
                        }
                    });

                    arr_sp = fnUnique(arr_sp);
                }
            },
            error: function (error) {
                console.log("fnGetAllSpecialties error", error);
            }
        });

        return arr_sp.sort();
    }

    // Get all territory
    function fnGetAllTerritory() {
        var arr_terr = [];

        $.ajax({
            url: "/Home/GetAllTerritory",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetAllTerritory on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            if (i.Territory_ID === "9999" && i.Territory_Name === "White Space") {
                                arr_terr.push({ ID: "Unaligned", Name: "Unaligned"});
                            } else {
                                arr_terr.push({ ID: i.Territory_ID, Name: i.Territory_Name });
                            }
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetAllTerritory error", error);
            }
        });

        return arr_terr.sort();
    }

    // Get all status
    function fnGetAllStatus() {
        var arr_status = [];

        $.ajax({
            url: "/Home/GetAllStatus",
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

    // Load Data - Server-Side
    function fnLoadCustomersData() {
        var npi = "";
        var full_name = "";
        var specialty = "";
        var name_date = "";
        var degree = "";
        var state = "";
        var territory = "";
        var status = "";

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
                "url": "/Home/LoadCustomersData",
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
                    "targets": [0],
                    "visible": false,
                    "searchable": false
                },
                {
                    "targets": [1],
                    "width": "8%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [2],
                    "width": "16%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [3],
                    "width": "12%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [4],
                    "width": "11%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [5],
                    "width": "5%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [6],
                    "width": "6%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [7],
                    "width": "16%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [8],
                    "width": "7%",
                    "searchable": false,
                    "orderable": true
                },
                {
                    "targets": [9],
                    "width": "4%",
                    "searchable": false,
                    "orderable": true
                }],
            "columns": [
                {
                    "data": "HCP_MDM_ID",
                    "name": "HCP_MDM_ID",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        return !fnIsEmpty(data) ? data : "N/A";
                    }
                },
                {
                    "data": "NPI",
                    "name": "NPI",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        //var flag = full["Under_Validation"] == "True" ? '  <i style="color: orange;" class="fas fa-flag"></i>' : "";
                        var flag = full["Under_Validation"] == "True" ? '  <i style="color: orange;" class="fas fa-flag protip" data-pt-position="left" data-pt-title="In process" data-pt-size="tiny" data-pt-scheme="dark-transparent"></i>' : "";

                        return !fnIsEmpty(data) ? data + flag : "N/A";
                    }
                },
                {
                    "data": "full_name",
                    "name": "full_name",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        return !fnIsEmpty(data) ? data : "N/A";
                    }
                },
                {
                    "data": "specialty",
                    "name": "specialty",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        return !fnIsEmpty(data) ? fnUcFirstAllWords(data) : "N/A";
                    }
                },
                {
                    "data": "name_date",
                    "name": "name_date",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        var regExp = /\(([^)]+)\)/;
                        var ndate = null;
                        var sdate = null;
                        var ddate = null;
                        var adate = null;

                        // name_date
                        if (!fnIsEmpty(full["name_date"])) {
                            var matches = regExp.exec(full["name_date"]);

                            ndate = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                        }

                        // specialty_date
                        if (!fnIsEmpty(full["specialty_date"])) {
                            var matches = regExp.exec(full["specialty_date"]);

                            sdate = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                        }

                        // degree_date
                        if (!fnIsEmpty(full["degree_date"])) {
                            var matches = regExp.exec(full["degree_date"]);

                            ddate = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                        }

                        // address_date
                        if (!fnIsEmpty(full["address_date"])) {
                            var matches = regExp.exec(full["address_date"]);

                            adate = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                        }

                        var array = [
                            { date: sdate },
                            { date: ndate },
                            { date: ddate },
                            { date: adate }
                        ];

                        if (array.length != null || array != null) {
                            var max = null;

                            for (var i = 0; i < array.length; i++) {
                                var current = array[i];
                                if (max === null || current.date > max.date) {
                                    max = current;
                                }
                            }

                            return max.date;
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "degree",
                    "name": "degree",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        return !fnIsEmpty(data) ? data : "N/A";
                    }
                },
                {
                    "data": "state",
                    "name": "state",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        return !fnIsEmpty(data) ? fnAbbrState(data, 'name') : "N/A";
                    }
                },
                {
                    "data": "territory_name",
                    "name": "territory_name",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        if (!fnIsEmpty(data)) {
                            var terr = "";

                            if (full['territory_id'] == "9999") {
                                terr = full['territory_name'];
                            } else {
                                terr = `${full['territory_id']} ${data}`;
                            }

                            if (terr.indexOf("-") > 0) {
                                terr = terr.replace(/-/g, ' ');
                            }

                            return terr;
                        } else {
                            return "N/A";
                        }
                    }
                },
                {
                    "data": "status",
                    "name": "status",
                    "autoWidth": true,
                    "render": function (data, type, full, meta) {
                        var d = data;
                        var color = "success";

                        if (d == "Inactive") {
                            color = "danger";
                        } else if (d == "Active") {
                            color = "success";
                        } else {
                            color = "secondary";
                        }

                        if (d == "-") {
                            d = "N/A";
                        }

                        return `<h6 class="status-col"><span class="badge badge-${color}">${d}</span></h6>`;
                    }
                },
                {
                    "data": "HCP_MDM_ID",
                    "name": "HCP_MDM_ID",
                    "autoWidth": true,
                    "sClass": "tbl-btn_right",
                    "render": function (data, type, full, meta) {
                        return `<button name='View' value='${data}' class='btn btn-user-profile btn-sm user-profile'>View</button> `;
                    }
                }
            ]
        });

        fnGetCustomersFilterCount(npi, full_name, specialty, name_date, degree, state, territory, status);

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
            if (i != 3 && i != 5 && i != 6 && i != 7 && i != 8 && i != 9) {
                if (i == 4) {
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
                    if (i == 1) {
                        $(".div-npi").html(`<input type="text" class="form-control list-filter search-npi" id="input-${i}" placeholder="Search a NPI" />`);
                    }

                    if (i == 2) {
                        $(".div-practitionner").html(`<input type="text" class="form-control list-filter search-practitionner" id="input-${i}" placeholder="Search a Practitionner" />`);
                    }
                }
            }
        });

        // Here we need to make date selection
        $('input[name="daterange"]').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'));

            var start = picker.startDate.format('YYYY-MM-DD');
            var end = picker.endDate.format('YYYY-MM-DD');

            fnAddToLocalStorageArray(fnSwitchCaseInput(4), picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'));

            $('#dataTable').DataTable().columns(4).search(start == end ? start : start + ' · ' + end, true, false).draw();

            // Add filter tag
            fnAppendFilterTag(picker.startDate.format('YYYY-MM-DD') + ' · ' + picker.endDate.format('YYYY-MM-DD'), fnSwitchCaseInput(4));

            // Verify if value exist in local storage
            var npi = "";
            var practitionner = "";
            var specialty = "";
            var name_date = "";
            var degree = "";
            var state = "";
            var territory = "";
            var status = "";

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

                if (fnReturnIndex(storage_index) == "1") {
                    npi = storage_value;
                } else if (fnReturnIndex(storage_index) == "2") {
                    practitionner = storage_value;
                } else if (fnReturnIndex(storage_index) == "3") {
                    specialty = storage_value;
                } else if (fnReturnIndex(storage_index) == "4") {
                    name_date = storage_value;
                } else if (fnReturnIndex(storage_index) == "5") {
                    degree = storage_value;
                } else if (fnReturnIndex(storage_index) == "6") {
                    state = storage_value;
                } else if (fnReturnIndex(storage_index) == "7") {
                    territory = storage_value;
                } else if (fnReturnIndex(storage_index) == "8") {
                    status = storage_value;
                }

                if (name_date.indexOf("·") > 0) {
                    var str = name_date.split("·");
                    d1 = str[0].trim();
                    d2 = str[1].trim();
                }

                //$('#dataTable').DataTable().columns(fnReturnIndex(storage_index)).search(storage_value ? storage_value : '', true, false).draw();

                //fnGetCustomersFilterCount(npi, practitionner, specialty, !fnIsEmpty(name_date) && name_date.indexOf("·") > 0 ? d1 == d2 ? d1 : name_date : "", degree, state, territory, status);
            });

            fnGetCustomersFilterCount(npi, practitionner, specialty, !fnIsEmpty(name_date) && name_date.indexOf("·") > 0 ? d1 == d2 ? d1 : name_date : "", degree, state, territory, status);

            table.draw();

            //fnRefreshBoxCount();

            $("#datepicker").val("");
        });

        // Search input text
        $(document).keypress(function (event) {
            var npi = $(".search-npi").val();
            var practitionner = $(".search-practitionner").val();

            var keycode = (event.keyCode ? event.keyCode : event.which);

            //var npi = "";
            //var full_name = "";
            var specialty = "";
            var name_date = "";
            var degree = "";
            var state = "";
            var territory = "";
            var status = "";

            var storage_value = "";
            var storage_index = "";

            var d1 = "";
            var d2 = "";

            if (keycode == '13') {
                if (!fnIsEmpty(npi)) {
                    fnAddToLocalStorageArray(fnSwitchCaseInput(1), npi);

                    // Add filter tag
                    fnAppendFilterTag(npi, fnSwitchCaseInput(1));
                }

                if (!fnIsEmpty(practitionner)) {
                    fnAddToLocalStorageArray(fnSwitchCaseInput(2), practitionner);

                    // Add filter tag
                    fnAppendFilterTag(practitionner, fnSwitchCaseInput(2));
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

                    if (fnReturnIndex(storage_index) == "1") {
                        npi = storage_value;
                    } else if (fnReturnIndex(storage_index) == "2") {
                        practitionner = storage_value;
                    } else if (fnReturnIndex(storage_index) == "3") {
                        specialty = storage_value;
                    } else if (fnReturnIndex(storage_index) == "4") {
                        name_date = storage_value;
                    } else if (fnReturnIndex(storage_index) == "5") {
                        degree = storage_value;
                    } else if (fnReturnIndex(storage_index) == "6") {
                        state = storage_value;
                    } else if (fnReturnIndex(storage_index) == "7") {
                        territory = storage_value;
                    } else if (fnReturnIndex(storage_index) == "8") {
                        status = storage_value;
                    }

                    if (name_date.indexOf("·") > 0) {
                        var str = name_date.split("·");
                        d1 = str[0].trim();
                        d2 = str[1].trim();
                    }

                    $('#dataTable').DataTable().columns(fnReturnIndex(storage_index)).search(storage_value ? storage_value : '', true, false).draw();
                });

                fnGetCustomersFilterCount(npi, practitionner, specialty, !fnIsEmpty(name_date) && name_date.indexOf("·") > 0 ? d1 == d2 ? d1 : name_date : "", degree, state, territory, status);
            }
        });
    }

    // Clear filter value in localstorage
    function fnClearFilterLocalStorage() {
        let keysToRemove = ["srm_id", "srm_npi", "srm_practitionner", "srm_specialty", "srm_last_updated", "srm_degree", "srm_state", "srm_territory", "srm_status"];

        keysToRemove.forEach(k => localStorage.removeItem(k));
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
            case 0:
                return "srm_id";
                break;
            case 1:
                return "srm_npi";
                break;
            case 2:
                return "srm_practitionner";
                break;
            case 3:
                return "srm_specialty";
                break;
            case 4:
                return "srm_last_updated";
                break;
            case 5:
                return "srm_degree";
                break;
            case 6:
                return "srm_state";
                break;
            case 7:
                return "srm_territory";
                break;
            case 8:
                return "srm_status";
                break;
        }
    }

    // Switch case input values index
    function fnReturnIndex(val) {
        switch (val) {
            case "srm_id":
                return 0;
                break;
            case "srm_npi":
                return 1;
                break;
            case "srm_practitionner":
                return 2;
                break;
            case "srm_specialty":
                return 3;
                break;
            case "srm_last_updated":
                return 4;
                break;
            case "srm_degree":
                return 5;
                break;
            case "srm_state":
                return 6;
                break;
            case "srm_territory":
                return 7;
                break;
            case "srm_status":
                return 8;
                break;
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

            if (clean_val == "9999") {
                clean_val = "Unaligned";
                display_val = "Unaligned";
            }

            $("#checkbox-filter").append(' <span class="badge badge-info checkbox-filter" id="' + clean_val + '">' + display_val.replace(/[_]/g, " ").toUpperCase() + $('label[for=' + clean_val + ']').text().toUpperCase() +
                ' <i class="close fas fa-times ' + clean_val + ' ' + class_name + '" id="' + clean_val + '"></i></span> ');
        }
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

    // Get local storage for query dataTable
    function fnGetLocalStorageQuery() {
        var archive = [],
            keys = Object.keys(localStorage),
            i = 0, key;

        var keyLookup = ["srm_id", "srm_npi", "srm_practitionner", "srm_specialty", "srm_last_updated", "srm_degree", "srm_state", "srm_territory", "srm_status"];

        for (; key = keys[i]; i++) {
            if (keyLookup.includes(key)) {
                archive.push(key + '=' + localStorage.getItem(key));
            }
        }

        return archive;
    }

    // Get dataTable filter count
    function fnGetCustomersFilterCount(npi, full_name, specialty, name_date, degree, state, territory, status) {
        $.ajax({
            type: "POST",
            url: "/Home/CustomersFilterCount",
            data: {
                npi: npi,
                full_name: full_name,
                specialty: specialty,
                name_date: name_date,
                degree: degree,
                state: state,
                territory: territory,
                status: status
            },
            beforeSend: function () {
                $(".loader").show();
                $(".loader").css("z-index", 20);
                $("#content-wrapper").css("opacity", 0.1);
            },
            success: function (data) {
                if (data.data.length == 0) {
                    $("#totalPhysicians").html(0);
                    $("#totalNPI").html(0);
                    $("#totalSpecialties").html(0);
                    $("#totalDegrees").html(0);
                    $("#totalStates").html(0);
                }

                $.each(data.data, function (index, i) {
                    $("#totalPhysicians").html(i.ch_hcp_id);
                    $("#totalNPI").html(i.npi);
                    $("#totalSpecialties").html(i.specialty);
                    $("#totalDegrees").html(i.degree);
                    $("#totalStates").html(i.state);
                });
            },
            complete: function () {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            },
            error: function (err) {
                console.log("fnGetCustomersFilterCount success", err);
            }
        });
    }
});