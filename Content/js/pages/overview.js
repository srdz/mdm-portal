var idleTime = 0;

function fnTimerIncrement() {
    idleTime = idleTime + 1;

    if (idleTime > 14) { // 15 minutes
        window.location.reload();
    }
}

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

    //Increment the idle time counter every minute.
    var idleInterval = setInterval(fnTimerIncrement, 60000); // 1 minute

    //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
        idleTime = 0;
    });

    $(this).keypress(function (e) {
        idleTime = 0;
    });

    // Store to session user object
    fnPushUserObjectToSessionStorage();

    // Load all specialties dropdown
    var arrSpecialty = fnGetAllSpecialties();

    var options = $(".search-specialty");

    $.each(arrSpecialty, function (index, i) {
        options.append(new Option(fnUcFirstAllWords(i), i));
    });

    // Load all territories dropdown
    var arrTerritory = fnGetAllTerritory();

    var options = $(".search-territory");

    $.each(arrTerritory, function (index, i) {
        if (i.ID == "9999" && i.Name == "Unaligned") {
            options.append(new Option(i.Name, i.ID));
        } else {
            options.append(new Option(`${i.ID} - ${i.Name}`, i.ID));
        }
    });

    // Load all sources dropdown
    var arrSources = fnGetAllSources();

    var options = $(".search-source");

    $.each(arrSources, function (index, i) {
        options.append(new Option(i.Name, i.Name));
    });

    $(".search-source, .search-specialty, .search-territory").select2({
        dropdownAutoWidth: true,
        width: '100%'
    });

    // Generate count for HCP's boxes
    //fnGenerateCountHCPs();
    fnKPIsInitialCount();

    // # Stewardship
    fnGetTotalCountStewardship();

    // # Pending Stewardship
    fnGetTotalCountPendingStewardship();

    // # Validation Status Not Completed
    fnGetStewardshipNotValidated();

    // # Validation Status Completed
    fnGetStewardshipValidated();
    
    // Generate count for filter
    fnGenerateCountBoxFilter();

    // # SLA Type
    fnGetSlaAverage();

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

                //if (!fnIsEmpty(arr_sp)) {
                //    fnLoadDataToLocalStorage('specialtyFilter', arr_sp);
                //}
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
                            arr_terr.push({ ID: i.Territory_ID, Name: i.Territory_Name });
                        });

                        //fnLoadDataToLocalStorage("territoryFilter", arr_terr);
                    }
                }
            },
            error: function (error) {
                console.log("fnGetAllTerritory error", error);
            }
        });

        return arr_terr.sort();
    }

    // Get all sources
    function fnGetAllSources() {
        var arr_src = [];

        $.ajax({
            url: "/Home/GetAllSources",
            type: "GET",
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnGetAllSources on success error", data.error);
                    } else {
                        $.each(data.data, function (index, i) {
                            arr_src.push({ ID: i.source, Name: i.source });
                        });
                    }
                }
            },
            error: function (error) {
                console.log("fnGetAllSources error", error);
            }
        });

        return arr_src.sort();
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

    // Stewardship Record Count
    function fnGetTotalCountStewardship() {
        try {
            $.ajax({
                url: "/Home/TotalStewardship",
                type: "GET",
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnGetTotalCountStewardship error", data.error);
                        } else {
                            //$("#stewardship_record_count").html(`${data.data} Stewarship`);
                            $("#stewardship_record_count").html(data.data);
                        }
                    }
                },
                error: function (error) {
                    console.log("fnGetTotalCountStewardship error", error);
                }
            });
        } catch (err) {
            console.log("fnGetTotalCountStewardship error catch", err);
        }
    }

    // Stewardship Pending Record Count
    function fnGetTotalCountPendingStewardship() {
        try {
            $.ajax({
                url: "/Home/TotalOpenStewardship",
                type: "GET",
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnGetTotalCountPendingStewardship error", data.error);
                        } else {
                            $("#stewardship_pending_record_count").html(data.data);
                        }
                    }
                },
                error: function (error) {
                    console.log("fnGetTotalCountPendingStewardship error", error);
                }
            });
        } catch (err) {
            console.log("fnGetTotalCountPendingStewardship error catch", err);
        }
    }
    
    // Get Stewardship Validated
    function fnGetStewardshipNotValidated() {
        try {
            $.ajax({
                url: "/Home/StewardshipNotValidated",
                type: "GET",
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnGetStewardshipNotValidated error", data.error);
                        } else {
                            //$("#stewardship_validation_status_record_count").html(`${data.data} Status Not Completed`);
                            $("#stewardship_not_validated_record_count").html(data.data);
                        }
                    }
                },
                complete: function () {
                    $(".loader").hide();
                    $("#content-wrapper").css("opacity", "");
                },
                error: function (error) {
                    console.log("fnGetStewardshipNotValidated error", error);
                }
            });
        } catch (err) {
            console.log("fnGetStewardshipNotValidated error catch", err);
        }
    }

    // Get Stewardship Validated
    function fnGetStewardshipValidated() {
        try {
            $.ajax({
                url: "/Home/StewardshipValidated",
                type: "GET",
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnGetStewardshipValidated error", data.error);
                        } else {
                            $("#stewardship_validated_record_count").html(data.data);
                        }
                    }
                },
                error: function (error) {
                    console.log("fnGetStewardshipValidated error", error);
                }
            });
        } catch (err) {
            console.log("fnGetStewardshipValidated error catch", err);
        }
    }
    
    // Generate count on filters
    function fnGenerateCountBoxFilter() {
        var ddsource, ddspecialty, ddterritory = "";

        $(document).on('change', '.search-source, .search-specialty, .search-territory', function () {
            // source
            if ($(this).attr('class').indexOf("search-source") > 0) {
                ddsource = $(this).val();
            }

            // specialty
            if ($(this).attr('class').indexOf("search-specialty") > 0) {
                ddspecialty = $(this).val().toUpperCase();
            }

            // territory
            if ($(this).attr('class').indexOf("search-territory") > 0) {
                ddterritory = $(this).val();
            }

            if (fnIsEmpty(ddsource) && fnIsEmpty(ddspecialty) && fnIsEmpty(ddterritory)) {
                fnKPIsInitialCount();
            } else {
                $.ajax({
                    url: '/Home/GenerateCountFilter',
                    type: 'POST',
                    data: {
                        source: ddsource,
                        specialty: ddspecialty,
                        territory: ddterritory
                    },
                    beforeSend: function () {
                        $(".loader").show();
                        $(".loader").css("z-index", 20);
                        $("#content-wrapper").css("opacity", 0.1);
                    },
                    success: function (data) {
                        // count columns
                        var cnt_name = 0;
                        var npiArray = [];
                        var specialtyArray = [];
                        var credentialArray = [];
                        var stateArray = [];
                        var targetArray = [];

                        $.each(data.result, function (index, i) {
                            // Name (HCP)
                            if (i.Full_Name) {
                                cnt_name = cnt_name + 1;
                            }

                            // NPI
                            if (!fnIsEmpty(i.NPI)) {
                                npiArray.push(i.NPI);
                            }

                            // Specialty
                            if (!fnIsEmpty(i.Specialty)) {
                                specialtyArray.push(i.Specialty);
                            }

                            // Credential
                            if (!fnIsEmpty(i.Credential)) {
                                credentialArray.push(i.Credential);
                            }

                            // State
                            if (!fnIsEmpty(i.State)) {
                                stateArray.push(i.State);
                            }

                            // Target
                            if (!fnIsEmpty(i.Target) && i.Target == "Yes") {
                                targetArray.push(i.Target);
                            }
                        });

                        // Change box count from filter
                        $("#totalPhysicians").html(cnt_name);
                        $("#totalNPI").html(fnUnique(npiArray).length);
                        $("#totalSpecialties").html(fnUnique(specialtyArray).length);
                        $("#totalDegrees").html(fnUnique(credentialArray).length);
                        $("#totalStates").html(fnUnique(stateArray).length);
                        $("#totalTarget").html(targetArray.length);
                    },
                    complete: function () {
                        $(".loader").hide();
                        $("#content-wrapper").css("opacity", "");
                    },
                    error: function (error) {
                        console.log("fnGenerateCountBox error", error);
                    }
                });
            }

            $(document).ajaxComplete(function () {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            });
        });
    }

    // Get SLA Average
    function fnGetSlaAverage() {
        $.ajax({
            url: "/Home/GetStewardshipSLA",
            type: 'GET',
            dataType: 'json', // added data type
            success: function (data) {
                if (data.data.length > 0) {
                    var d1, d2 = "";
                    var sum = 0;
                    var batchArray = [];
                    var ongoingArray = [];

                    $.each(data.data, function (index, el) {
                        if (!fnIsEmpty(el.project) && !fnIsEmpty(el.received)) {
                            if (el.project == "batch") {
                                if (!fnIsEmpty(el.created)) {
                                    var regExp = /\(([^)]+)\)/;
                                    var matches = regExp.exec(el.created);
                                    d2 = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                                } else {
                                    d2 = fnFormatDate(new Date());
                                }

                                var regExp = /\(([^)]+)\)/;
                                var matches = regExp.exec(el.received);
                                d1 = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');

                                let dd1 = moment(d2);
                                let dd2 = moment(d1);

                                let days = dd2.diff(dd1, 'days');

                                batchArray.push(days);
                            } else if (el.project == "ongoing") {
                                if (!fnIsEmpty(el.created)) {
                                    var regExp = /\(([^)]+)\)/;
                                    var matches = regExp.exec(el.created);
                                    d2 = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                                } else {
                                    d2 = fnFormatDate(new Date());
                                }

                                var regExp = /\(([^)]+)\)/;
                                var matches = regExp.exec(el.received);
                                d1 = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');

                                let dd1 = moment(d2);
                                let dd2 = moment(d1);

                                let days = dd2.diff(dd1, 'days');

                                ongoingArray.push(days);
                            }
                        }
                    });

                    // batch
                    if (batchArray.length > 0) {
                        const newArray = batchArray.filter(function (value) {
                            return !Number.isNaN(value);
                        });

                        var sum = newArray.reduce(function (a, b) {
                            return a + b;
                        }, 0);

                        const average = sum / batchArray.length;

                        $("#total_sla_batch").html(Math.round(Number(average)));
                    } else {
                        $("#total_sla_batch").html(0);
                    }

                    //ongoing
                    if (ongoingArray.length > 0) {
                        const newArray = ongoingArray.filter(function (value) {
                            return !Number.isNaN(value);
                        });

                        var sum = newArray.reduce(function (a, b) {
                            return a + b;
                        }, 0);

                        const average = sum / ongoingArray.length;

                        $("#total_sla_ongoing").html(Math.round(Number(average)));
                    } else {
                        $("#total_sla_ongoing").html(0);
                    }
                }
            }
        });
    }

    // Format date to YYYY-MM-DD
    function fnFormatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) {
            month = '0' + month;
        }
            
        if (day.length < 2) {
            day = '0' + day;
        } 

        return [year, month, day].join('-');
    }

    // Push user object to session
    function fnPushUserObjectToSessionStorage() {
        if (!fnIsEmpty($("#obj-user").val())) {
            $.ajax({
                url: '/Home/GetUserObject',
                type: 'POST',
                data: { user_id: $("#obj-user").val() },
                success: function (data) {
                    var obj_serialized = JSON.stringify(data);

                    sessionStorage.setItem('userObject', obj_serialized);
                },
                error: function (error) {
                    console.log("fnPushUserObjectToSessionStorage error", error);
                }
            });
        }
    }

    function fnKPIsInitialCount() {
        $.ajax({
            url: '/Home/KPIsInitialCount',
            type: 'GET',
            beforeSend: function () {
                $(".loader").show();
                $(".loader").css("z-index", 20);
                $("#content-wrapper").css("opacity", 0.1);
            },
            success: function (data) {
                if (data.length == 0) {
                    $("#totalPhysicians").html(0);
                    $("#totalNPI").html(0);
                    $("#totalSpecialties").html(0);
                    $("#totalDegrees").html(0);
                    $("#totalStates").html(0);
                    $("#totalTarget").html(0);
                }

                $.each(data.data, function (index, i) {
                    $("#totalPhysicians").html(i.client_id);
                    $("#totalNPI").html(i.npi);
                    $("#totalSpecialties").html(i.specialty);
                    $("#totalDegrees").html(i.degree);
                    $("#totalStates").html(i.state);
                    $("#totalTarget").html(i.target);
                });
            },
            complete: function () {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            },
            error: function (error) {
                console.log("fnKPIsInitialCount error", error);
            }
        });
    }
});