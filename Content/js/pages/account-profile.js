$(document).ready(function () {
    $.ajaxSetup({
        cache: false
    });

    // Define global array
    let account_ids_array = [];
    let account_profile_array = [];
    let ids_array;
    let profile_array;
    let client_id;
    let api_id;

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

    fnLoadAccountDetails();

    fnGetAffiliatedHCPs($("#account-object-id").val());

    fnUpdateAccountKnownAddress();

    var gData = fnGetBestAddressAccountInformation($("#account-object-id").val());

    // Load all class of trade dropdown
    var options = $("#customer-account-class-of-trade");

    $.each(fnGetAllClassOfTrade(), function (index, i) {
        options.append(new Option(fnUcFirstAllWords(i), i));
    });

    // Load all states dropdown
    var options = $("#customer-account-state");
    var optionsKnownAddress = $("#account-known-address-state");

    $.each(fnGetAllStates(), function (index, i) {
        options.append(new Option(i.i, i.index));
        optionsKnownAddress.append(new Option(i.i, i.index));
    });

    // Load all specialty dropdown
    var options = $("#customer-account-specialty");

    $.each(fnGetAllSpecialties(), function (index, i) {
        options.append(new Option(fnUcFirstAllWords(i), i.toUpperCase()));
    });

    // Load all facility type dropdown
    var options = $("#customer-account-facility-type");

    $.each(fnGetAllHCOFacilityType(), function (index, i) {
        options.append(new Option(fnUcFirstAllWords(i), i));
    });

    $("#customer-account-class-of-trade, #customer-account-state, #customer-account-specialty, #customer-account-facility-type, #account-known-address-state").select2({
        dropdownAutoWidth: true,
        width: '100%'
    });

    fnFlagUpdatedValueById("", $("#account-object-id").val());

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

    // Redirect user to provider profile
    $(document).on("click", ".stretched-link", function (e) {
        fnRedirectPage("/Home/AccountProfile/", "hco_mdm_id", $(this).val());
    })[0];

    // Redirect user to provider profile
    $(document).on("click", ".affiliated-link", function (e) {
        fnRedirectPage("/Home/CustomerProfile/", "cm_hcp_id", $(this).val());
    })[0];

    // Sort source column in array
    Array.prototype.sortBy = function (p) {
        return this.slice(0).sort(function (a, b) {
            return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
        });
    }

    function groupBy(array, f) {
        var groups = {};

        array.forEach(function (o) {
            var group = JSON.stringify(f(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });

        return Object.keys(groups).map(function (group) {
            return groups[group];
        })
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

    // This will redirect user to a page
    var fnRedirectPage = function (redirectUrl, arg, value) {
        var form = $('<form action="' + redirectUrl + '" method="post"><input type="hidden" name="' + arg + '" value="' + value + '"></input></form>');

        $('body').append(form);

        $(form).submit();
    };

    // Fix naming convention
    function fnUcFirstAllWords(str) {
        var pieces = str.split(" ");

        for (var i = 0; i < pieces.length; i++) {
            var j = pieces[i].charAt(0).toUpperCase();

            pieces[i] = j + pieces[i].substr(1).toLowerCase();
        }

        return pieces.join(" ");
    }

    // Get file configuration for source colors
    function fnGetSourceColors(source) {
        var result = "";

        $.ajax({
            type: 'GET',
            url: "/Content/json/source-file-config.json",
            async: false,
            dataType: 'json',
            success: function (data) {
                $.each(data, function (index, el) {
                    if (el.source.toLowerCase() === source) {
                        result = el.color;
                    }
                });
            },
            error: function (err) {
                console.log("fnGetSourceColors error", err);
            }
        });

        return result;
    }

    function fnBuildTimeline(data) {
        //console.log("fnBuildTimeline", data);

        try {
            if (data.length > 0) {
                var html = "";
                var direction = "r";

                // Sort DESC
                data.sort(function compare(a, b) {
                    var dateA = new Date(a.date);
                    var dateB = new Date(b.date);

                    return dateB - dateA;
                });

                // Group by date and source
                var result = groupBy(data, function (item) {
                    return [item.date, item.source];
                });

                var d = "";
                var s = "";
                var v = "";

                for (var i = 0; i < result.length; i++) {
                    i % 2 == 0 ? direction = "r" : direction = "l";

                    $.each(result[i], function (index, x) {
                        if (x.value != undefined) {
                            html += '  <li>';
                            html += '      <div class="direction-' + direction + '">';

                            if (d != x.date || s != x.source) {
                                html += '          <div class="flag-wrapper">';
                                html += '              <span class="hexa"></span>';
                                html += '              <span class="flag">' + x.source + '</span>';
                                html += '              <span class="time-wrapper"><span class="time">' + x.date.replace(/[-]/g, '/') + '</span></span>';
                                html += '          </div>';
                            }

                            html += '          <div class="desc"><strong>' + x.type + ":</strong> " + x.value + '</div>';
                            html += '      </div>';
                            html += '  </li>';

                            d = x.date;
                            s = x.source;
                            v = x.value;
                        }
                    });
                }

                $('.timeline').html(html);
            }
        } catch (err) {
            console.log("fnBuildTimeline catch error", err);
        }
    }

    // Get file configuration for source colors
    function fnGetSourceColors(source) {
        var result = "";

        $.ajax({
            type: 'GET',
            url: "/Content/json/source-file-config.json",
            async: false,
            dataType: 'json',
            success: function (data) {
                //console.log("fnGetSourceColors success", data);

                $.each(data, function (index, el) {
                    if (el.source.toLowerCase() === source) {
                        result = el.color;
                    }
                });
            },
            error: function (err) {
                console.log("fnGetSourceColors error", err);
            }
        });

        return result;
    }

    // Get best address data fro hco
    function fnGetBestAddressAccountInformation(hco_mdm_id) {
        var result = "";

        $.ajax({
            type: "POST",
            url: "/Home/GetBestAddressAccountInformation",
            dataType: "json",
            data: { "hco_mdm_id": hco_mdm_id },
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        result = data;
                    } else {
                        result = data;
                    }
                }
            },
            error: function (error) {
                console.log("fnGetBestAddressAccountInformation on error", error);

                result = error;
            },
            complete: function () {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            }
        });

        return result;
    }

    // Load Account Information
    function fnLoadAccountDetails() {
        $.ajax({
            type: "POST",
            url: "/Home/GetHCODetails",
            dataType: "json",
            data: { "hco_mdm_id": $("#account-object-id").val() },
            beforeSend: function () {
                $(".loader").show();
                $(".loader").css("z-index", 20);
                $("#content-wrapper").css("opacity", 0.1);
            },
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        console.log("fnLoadAccountDetails on error", data);
                    } else {
                        let source_array = [];
                        var primary_name = "";

                        var ba = fnGetBestAddressAccountInformation($("#account-object-id").val());

                        // INFORMATION
                        if (ba.success && ba.success.length > 0) {
                            $.each(ba.success, function (index, i) {
                                // Name
                                if (!fnIsEmpty(i.name)) {
                                    $("#account-name").html(i.name);
                                    primary_name = i.name;

                                    var namedate = i.name_date;

                                    if (namedate.indexOf("Date") > 0) {
                                        var regExp = /\(([^)]+)\)/;
                                        var matches = regExp.exec(namedate);
                                        namedate = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                                    }

                                    account_profile_array.push({ name: "name", value: primary_name });

                                    source_array.push({ type: "Primary Name", date: namedate, source: i.name_source, value: i.name });

                                    // Profile Name
                                    $("#profile-name").html(`${i.name} <span class="badge badge-${i.name_source.toLowerCase()}">${i.name_source.toUpperCase()}</span>`);

                                    $("#div-profile-name").show();
                                }

                                // Class Of Trade
                                if (!fnIsEmpty(i.class_of_trade)) {
                                    $("#class_of_trade").html(`Class Of Trade: ${fnUcFirstAllWords(i.class_of_trade)}`);

                                    account_profile_array.push({ name: "class_of_trade", value: i.class_of_trade });

                                    $("#div-class-of-trade").show();
                                }
                                
                                // Facility Type
                                if (!fnIsEmpty(i.facility_type)) {
                                    $("#facility_type").html(`Facility Type: ${fnUcFirstAllWords(i.facility_type)}`);

                                    account_profile_array.push({ name: "facility_type", value: i.facility_type });

                                    $("#div-facility-type").show();
                                }

                                // Territory
                                if (!fnIsEmpty(i.territory_name)) {
                                    $("#account-territory").html(`Territory: ${i.territory_name}`);
                                } else {
                                    $("#account-territory").html("Territory: Unaligned");
                                }

                                $("#div-account-territory").show();

                                // Fax
                                if (!fnIsEmpty(i.fax)) {
                                    $("#account-fax").html(`Fax: ${i.fax}`);

                                    $("#div-account-fax").show();
                                }

                                // Phone
                                if (!fnIsEmpty(i.phone)) {
                                    $("#account-telephone").html(`Telephone Number: ${i.phone}`);

                                    $("#div-account-telephone").show();
                                }

                                // Website
                                if (!fnIsEmpty(i.website)) {
                                    $("#account-website").html(`Website: ${i.website}`);

                                    $("#div-account-website").show();
                                }

                                // Client ID
                                if (!fnIsEmpty($("#account-object-id").val())) {
                                    $("#account-client-id").html(`Client ID: ${$("#account-object-id").val()}`);
                                }

                                // Address
                                if (!fnIsEmpty(i.address_1)) {
                                    var adHtml = "";

                                    adHtml += `${i.address_1} ${i.address_2} ${i.city} ${i.state} ${i.zip}`;

                                    account_profile_array.push({ name: "address_1", value: i.address_1 });
                                    account_profile_array.push({ name: "address_2", value: i.address_2 });
                                    account_profile_array.push({ name: "city", value: i.city });
                                    account_profile_array.push({ name: "state", value: i.state });
                                    account_profile_array.push({ name: "zip", value: i.zip });

                                    $("#account-location").html(`${adHtml} <span class="badge badge-${i.address_source.toLowerCase()}">${i.address_source.toUpperCase()}</span>`);

                                    $("#div-account-location").show();
                                }
                            });
                        }

                        // DETAILS
                        $.each(data, function (index, i) {
                            // Status
                            if (!fnIsEmpty(i.Status)) {
                                var status_color = "";

                                if (i.Status.toLowerCase() == "active") {
                                    status_color = "success";
                                } else {
                                    status_color = "danger";
                                }

                                $("#account-status").html(`Status: <span id="account-status" class="badge badge-${status_color}">${i.Status.toUpperCase()}</span>`);

                                $("#div-account-status").show();
                            }

                            // Target
                            if (!fnIsEmpty(i.Target)) {
                                var target = "";

                                if (i.Target.toLowerCase() == "yes") {
                                    target = "Yes";
                                } else {
                                    target = "No";
                                }

                                $("#account-target").html(`Target : ${target}`);

                                $("#div-account-target").show();
                            }

                            // ID's
                            if (!fnIsEmpty(i.ID)) {
                                var obj = i.ID;
                                var obj_html = "";
                                var obj_key = "";

                                for (var key in obj) {
                                    if (!fnIsEmpty(obj[key])) {
                                        obj_key = key;

                                        if (obj_key.indexOf("_") > 0) {
                                            obj_key = obj_key.replace("_", " ");
                                        }

                                        if (obj_key.indexOf("_") > 0) {
                                            obj_key = obj_key.replace("_", " ");
                                        }

                                        account_ids_array.push({ name: key, value: obj[key][0].value });
                                        source_array.push({ type: key, date: obj[key][0].date, source: obj[key][0].source, value: obj[key][0].value });

                                        obj_html += `${obj_key.toUpperCase()}: ${obj[key][0].value} <span class="badge badge-${obj[key][0].source.toLowerCase()}">${obj[key][0].source.toUpperCase()}</span> <br />`;
                                    }
                                }

                                $("#account-ids").html(obj_html);
                            }

                            // Name
                            var htmlOtherName = "";
                            var colocatedHtml = "";
                            var other_name_array = [];
                            var other_name_location = [];

                            // Create source array for primary name
                            if (i.Name.length > 0) {
                                var co_located_length = i.Name.length;

                                $.each(i.Name, function (index, n) {
                                    source_array.push({ type: "Other Name", date: n.date, source: n.source, value: n.value });

                                    other_name_array.push(`${n.value} <span class="badge badge-${n.source.toLowerCase()}">${n.source.toUpperCase()}</span>`);

                                    other_name_location.push(`<ul class="list-group list-group-flush">
                                                                <li class="list-group-item"><button class="btn btn-link stretched-link" value="${i.HCO_MDM_ID}">${n.value}</button></li>
                                                              </ul>`);

                                    // SECTION: OTHER NAMES
                                    htmlOtherName += `${n.value} <span class="badge badge-${n.source.toLowerCase()}">${n.source.toUpperCase()}</span><br>`;

                                    // SECTION: CO-LOCATED
                                    colocatedHtml += `<ul class="list-group list-group-flush">
                                                        <li class="list-group-item"><button class="btn btn-link stretched-link" value="${i.HCO_MDM_ID}">${n.value}</button></li>
                                                      </ul>`;
                                });

                                if (co_located_length >= 2) {
                                    $("#related-account-name").css("height", "100px");
                                }

                                if (fnIsEmpty(colocatedHtml)) {
                                    // hide
                                    $("#block-id-other-namespm").removeClass("show");
                                    $("#arrow-down-other-names").css("display", "none");
                                    $("#arrow-up-other-names").css("display", "none");
                                }
                            }

                            if (fnIsEmpty(htmlOtherName)) {
                                // hide
                                $("#block-id-other-names").removeClass("show");
                                $("#arrow-down-other-names").css("display", "none");
                                $("#arrow-up-other-names").css("display", "none");
                            }

                            $("#block-id-info").addClass("show");
                            $("#block-id-other-names").addClass("show");

                            $("#related-account-name").html(fnUnique(other_name_array).join("<br>"));

                            fnGetAffiliation($("#account-object-id").val(), primary_name, fnUnique(other_name_array));

                            if (fnIsEmpty(htmlOtherName)) {
                                // hide
                                $("#block-id-other-names").removeClass("show");
                                $("#arrow-down-other-names").css("display", "none");
                                $("#arrow-up-other-names").css("display", "none");
                            }

                            // SECTION: AFFILIATION //
                            if (i.Address.length > 0) {
                                var affiliationHtml = "";
                                var ad_date = "";
                                var ad_source = "";
                                var ad_value = "";
                                var address_array = [];

                                $.each(i.Address, function (index, ad) {
                                    address_array.push({ type: "Address", date: ad.date, source: ad.source, value: ad.Address });
                                });

                                var noDupes = address_array.map(function (item) {
                                    return JSON.stringify(item);
                                }).reduce(function (out, current) {
                                    if (out.indexOf(current) === -1) out.push(current);
                                    return out;
                                }, []).map(function (item) {
                                    return JSON.parse(item);
                                });

                                $.each(noDupes, function (index, i) {
                                    source_array.push({ type: i.type, date: i.date, source: i.source, value: i.value });

                                    affiliationHtml += `&bull; ${i.value} <span class="badge badge-${i.source.toLowerCase()}">${i.source.toUpperCase()}</span><br />`;
                                });

                                $("#affiliation").html(affiliationHtml);

                                if (fnIsEmpty(affiliationHtml)) {
                                    // hide
                                    $("#block-id-affiliation").removeClass("show");

                                    $("#arrow-down-affiliation").css("display", "none");
                                    $("#arrow-up-affiliation").css("display", "none");
                                }
                            }

                            // Class Of Trade
                            if (!fnIsEmpty(i.class_of_trade)) {
                                $.each(i.class_of_trade, function (index, i) {
                                    source_array.push({ type: "Class Of Trade", date: i.date, source: i.source, value: i.value });
                                });
                            }

                            // Facility Type
                            if (!fnIsEmpty(i.facility_type)) {
                                $.each(i.facility_type, function (index, i) {
                                    source_array.push({ type: "Facility Type", date: i.date, source: i.source, value: i.value });
                                });
                            }

                            source_array = source_array.map(JSON.stringify).reverse()
                                .filter(function (item, index, arr) { return arr.indexOf(item, index + 1) === -1; })
                                .reverse().map(JSON.parse);

                            // Send data to build html for timeline
                            fnBuildTimeline(fnUnique(source_array));
                            fnPopulateDataInModal(account_ids_array);
                            fnUpdateAccountProfile(account_ids_array);

                            //ids_array = account_ids_array;
                            profile_array = account_profile_array;
                            client_id = $("#account-object-id").val();

                            var arr_src = [];
                            var srcHtml = "";
                            var srcBtnHtml = "";
                            var srcModalHtml = "";
                            arr_src.length = 0;
                            var validate = "";
                            var body = "";

                            $.each(source_array, function (index, i) {
                                arr_src.push(i.source);
                            });

                            arr_src = fnUnique(arr_src);

                            $.each(source_array, function (idx, sa) {
                                body += `<input type="hidden" class="hidden-${sa.source}" name="hidden-${sa.source}" value="Type: ${sa.type}<br/>Value: ${sa.value}<br />Date: ${sa.date}<br /><br />" />`;
                            });

                            $('#hidden-input-for-modal-sources').html(body);

                            // Sources Modal
                            $.each(arr_src, function (index, i) {
                                if (i != undefined) {
                                    // Build button modal
                                    srcBtnHtml += `<p><button type="button" class="btn btn-sm btn-src-modal badge-${i}" data-toggle="modal" data-target="#modalCenter${i}">${i}</button></p>`;

                                    srcHtml += `<p>${i}</p>`;

                                    var arr = $('.hidden-' + i).map((i, e) => e.value).get();

                                    //// Build modal for each sources
                                    srcModalHtml += `<div class="modal fade" id="modalCenter${i}" tabindex="-1" role="dialog" aria-labelledby="modalCenterTitle${i}" aria-hidden="true">
                                                        <div class="modal-dialog modal-dialog-centered" role="document">
                                                            <div class="modal-content">
                                                                <div class="modal-header">
                                                                    <h5 class="modal-title" id="modalCenterTitle${i}">${i}</h5>
                                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                                        <span aria-hidden="true">&times;</span>
                                                                    </button> 
                                                                </div>
                                                                <div class="modal-body modal-overflow scrollbar-ripe-malinka">${arr.join("")}</div>
                                                                <div class="modal-footer">
                                                                    <button type="button" class="btn btn-close-modal" data-dismiss="modal">Close</button>
                                                                </div>
                                                                </div>
                                                            </div>
                                                        </div>`;
                                }
                            });

                            // Provider sources
                            $("#account-sources").html(srcBtnHtml);

                            $("#account-sources-modal").html(srcModalHtml);

                            if (fnIsEmpty(srcHtml)) {
                                // hide
                                $("#block-id-pm-sources").removeClass("show");

                                $("#arrow-down-pm-sources").css("display", "none");
                                $("#arrow-up-pm-sources").css("display", "none");
                            }
                        });

                        if (source_array.length > 0) {
                            var flavors = [];
                            var fSource = [];

                            $.each(source_array, function (index, i) {
                                flavors.push(i.source.toLowerCase());
                            });

                            // Apply color to badge
                            $.each(fnUnique(flavors), function (index, f) {
                                fSource.push({ source: f });
                            });

                            // loop color badge sources
                            $.each(fSource, function (index, c) {
                                $(".badge-" + c.source).css({ "background-color": fnGetSourceColors(c.source), "color": "#fff" });
                                $("button.badge-" + c.source).css({ "border-color": fnGetSourceColors(c.source), "color": "#fff" });
                            });
                        }
                    }
                }
            },
            error: function (error) {
                console.log("fnLoadAccountDetails on error", error);

                result = error;
            }//,
            //complete: function () {
            //    $(".loader").hide();
            //    $("#content-wrapper").css("opacity", "");
            //}
        });
    }

    // Get Affiliation
    function fnGetAffiliation(hco_mdm_id, primary_name, other_names) {
        var result = "";
        var other_name_location = [];

        if (!fnIsEmpty(hco_mdm_id)) {
            $.ajax({
                type: "POST",
                url: "/Home/GetHCOAffiliation",
                dataType: "json",
                data: { "hco_mdm_id": hco_mdm_id },
                beforeSend: function () {
                    $(".loader").show();
                    $(".loader").css("z-index", 20);
                    $("#content-wrapper").css("opacity", 0.1);
                },
                success: function (data) {
                    //console.log("fnGetAffiliation on success", data);

                    if (data != null) {
                        var items = fnUnique(data.data).sort();
                        htmlOtherName = "";

                        $.each(items, function (index, i) {
                            var string = i.split("|");

                            if (string[1] != primary_name) {
                                other_name_location.push(`<ul class="list-group list-group-flush">
                                                            <li class="list-group-item"><button class="btn btn-link stretched-link" value="${string[0]}">${string[1]}</button></li>
                                                          </ul>`);
                            }
                        });

                        if (other_name_location.length > 0) {
                            $("#account-co-location").html(fnUnique(other_name_location).join("<br>"));
                        } else {
                            // hide
                            $("#block-id-account-co-location").removeClass("show");

                            $("#arrow-down-account-co-location").css("display", "none");
                            $("#arrow-up-account-co-location").css("display", "none");
                        }

                        result = data;
                    }
                },
                error: function (error) {
                    console.log("fnGetAffiliation on error", error);

                    result = error;
                },
                complete: function () {
                    $(".loader").hide();
                    $("#content-wrapper").css("opacity", "");
                },
            });
        }

        return result;
    }

    // Get HCP HCO Affiliation
    function fnGetHCPHCOAffiiation(id, lookup) {
        var result = "";

        $.ajax({
            type: 'POST',
            url: "/Home/GetHCPHCOAffiiation",
            async: false,
            dataType: 'json',
            data: { "id": id, "lookup": lookup },
            success: function (data) {
                result = data;
            },
            error: function (err) {
                console.log("fnGetHCPHCOAffiiation error", err);
            }
        });

        return result;
    }

    // Get best address data fro hco
    function fnGetBestAddressInformation(cm_hcp_id) {
        var result = "";

        $.ajax({
            type: "POST",
            url: "/Home/GetBestAddressInformation",
            dataType: "json",
            data: { "cm_hcp_id": cm_hcp_id },
            async: false,
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        result = data;
                    } else {
                        result = data;
                    }
                }
            },
            error: function (error) {
                console.log("fnGetBestAddressInformation on error", error);

                result = error;
            }
        });

        return result;
    }

    // Get affiliated HCPs
    function fnGetAffiliatedHCPs(id) {
        if (!fnIsEmpty(id)) {
            var html_array = [];

            $.each(fnGetHCPHCOAffiiation(id, "hco"), function (index, i) {
                $.each(fnGetBestAddressInformation(i.HCP_MDM_ID).success, function (index, j) {
                    html_array.push(`<ul class="list-group list-group-flush">
                                        <li class="list-group-item"><button class="btn btn-link affiliated-link" value="${j.HCP_MDM_ID}">${j.full_name}</button></li>
                                      </ul>`);
                });
            });

            if (html_array.length > 0) {
                $("#account-affiliated-hcps").html(html_array.join("<br>"));
            } else {
                $("#block-id-account-affiliated-hcps").removeClass("show");

                $("#arrow-down-account-affiliated-hcps").css("display", "none");
                $("#arrow-up-account-affiliated-hcps").css("display", "none");
            }
        }
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

    // Populate data in modal
    function fnPopulateDataInModal(array_account) {
        var data = gData;

        if (data.status == "success") {
            $.each(data.success, function (index, i) {
                $("#customer-account-name").val(i.name);
                $("#customer-account-addressline1").val(i.address_1);
                $("#customer-account-addressline2").val(i.address_2);
                $("#customer-account-city").val(i.city);
                $("#customer-account-state").val(i.state).trigger('change');
                $("#customer-account-zipcode").val(i.zip);
                $("#customer-account-class-of-trade").val(i.class_of_trade).trigger('change');
                $("#customer-account-facility-type").val(i.facility_type).trigger('change');
            });
        }

        $("#customer-ids-npi").val(fnIsEmpty(array_account.find(a => a.name === "NPI")) == true ? "" : array_account.find(a => a.name === "NPI").value);
        $("#customer-ids-dea").val(fnIsEmpty(array_account.find(a => a.name === "DEA")) == true ? "" : array_account.find(a => a.name === "DEA").value);
        $("#customer-ids-crm").val(fnIsEmpty(array_account.find(a => a.name === "CRM_ID")) == true ? "" : array_account.find(a => a.name === "CRM_ID").value);
    }

    // Get Token
    function fnGetToken() {
        var result = "";

        $.ajax({
            type: 'GET',
            url: "https://...",
            async: false,
            success: function (data) {
                result = data;
            },
            error: function (err) {
                console.log("fnGetToken error", err);
            }
        });

        return result;
    }

    // Update Account Profile Form
    function fnUpdateAccountProfile(array_ids) {
        var origin_name, origin_addressline1, origin_addressline2, origin_city, origin_state, origin_zipcode, origin_class_of_trade, origin_facility_type = "";

        var origin_npi = fnIsEmpty(array_ids.find(a => a.name === "NPI")) == true ? "" : array_ids.find(a => a.name === "NPI").value;
        var origin_shs = fnIsEmpty(array_ids.find(a => a.name === "SHS")) == true ? "" : array_ids.find(a => a.name === "SHS").value;
        var origin_dea = fnIsEmpty(array_ids.find(a => a.name === "DEA")) == true ? "" : array_ids.find(a => a.name === "DEA").value;
        var origin_crm = fnIsEmpty(array_ids.find(a => a.name === "CRM_ID")) == true ? "" : array_ids.find(a => a.name === "CRM_ID").value;

        $.each(gData.success, function (index, i) {
            origin_name = i.name;
            origin_addressline1 = i.address_1;
            origin_addressline2 = i.address_2;
            origin_city = i.city;
            origin_state = i.state;
            origin_zipcode = i.zip;
            origin_class_of_trade = i.class_of_trade;
            origin_facility_type = i.facility_type;
        });

        // Validate if inputs are not empty //
        // Validate HCO Name
        $('#form-update-customer-account input#customer-account-name').on("input", function () {
            if (!$(this).val()) {
                $(".required-name").show();
            } else {
                $(".required-name").hide();
            }
        });

        // Validate address line 1
        $('#form-update-customer-account input#customer-account-addressline1').on("input", function () {
            if (!$(this).val()) {
                $(".required-addressline1").show();
            } else {
                $(".required-addressline1").hide();
            }
        });

        // Validate city
        $('#form-update-customer-account input#customer-account-city').on("input", function () {
            if (!$(this).val()) {
                $(".required-city").show();
            } else {
                $(".required-city").hide();
            }
        });

        // Validate state
        $('#form-update-customer-account #customer-account-state').on("change", function () {
            if (!$(this).val()) {
                $(".required-state").show();
            } else {
                $(".required-state").hide();
            }
        });

        // Validate zipcode
        $('#form-update-customer-account input#customer-account-zipcode').on("input", function () {
            if (!$(this).val()) {
                $(".required-zipcode").show();
            } else {
                $(".required-zipcode").hide();
            }
        });

        // Validate if input values are not equal to origin to enable button for update change //
        // Validate if HCO Name value match the original
        $('#customer-account-name').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_name) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if address line 1 value match the original
        $('#customer-account-addressline1').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_addressline1) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if address line 2 value match the original
        $('#customer-account-addressline2').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_addressline2) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if city value match the original
        $('#customer-account-city').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_city) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if state value match the original
        $('#customer-account-state').on("change", function () {
            var dInput = this.value;

            if (dInput === origin_state) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if zipcode value match the original
        $('#customer-account-zipcode').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_zipcode) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if class of trade value match the original
        $('#customer-account-class-of-trade').on("change", function () {
            var dInput = this.value;

            if (dInput === origin_class_of_trade) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if facility-type value match the original
        $('#customer-account-facility-type').on("change", function () {
            var dInput = this.value;

            if (dInput === origin_facility_type) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if NPI match the original
        $('#customer-ids-npi').on("input", function () {
            if (this.value === origin_npi) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if SHS match the original
        $('#customer-ids-shs').on("input", function () {
            if (this.value === origin_shs) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if CRM match the original
        $('#customer-ids-crm').on("input", function () {
            if (this.value === origin_crm) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if DEA match the original
        $('#customer-ids-dea').on("input", function () {
            if (this.value === origin_dea) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if HIN match the original
        $('#customer-ids-hin').on("input", function () {
            if (fnIsEmpty(this.value)) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if DUNS match the original
        $('#customer-ids-duns').on("input", function () {
            if (fnIsEmpty(this.value)) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if POS match the original
        $('#customer-ids-pos').on("input", function () {
            if (fnIsEmpty(this.value)) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if Fed Tax match the original
        $('#customer-ids-fed-tax').on("input", function () {
            if (fnIsEmpty(this.value)) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Validate if GLN match the original
        $('#customer-ids-gln').on("input", function () {
            if (fnIsEmpty(this.value)) {
                $('.btn-save-change-account-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-account-profile').prop("disabled", false);
            }
        });

        // Modify account profile information
        $(document).on('click', '.btn-save-change-account-profile', function () {
            var url_source = $("#change-request-source").val();
            var url_params = {};
            var array_profile = [];
            var hco_mdm_id = $("#account-object-id").val();

            // Modify HCO Attributes
            if ($('#customer-account-name').val() !== origin_name || $('#customer-account-class-of-trade').val() != origin_class_of_trade || $('#customer-account-facility-type').val() != origin_facility_type ||
                $('#customer-ids-npi').val() !== origin_npi || $('#customer-ids-crm').val() !== origin_crm || $('#customer-ids-dea').val() !== origin_dea || !fnIsEmpty($('#customer-ids-hin').val()) ||
                !fnIsEmpty($('#customer-ids-duns').val()) || !fnIsEmpty($('#customer-ids-pos').val()) || !fnIsEmpty($('#customer-ids-fed-tax').val()) || !fnIsEmpty($('#customer-ids-gln').val())) {
                url_params = {
                    HCO_NAME: $('#customer-account-name').val(),
                    HCO_COT: $('#customer-account-class-of-trade').val(),
                    HCO_FACILITY_TYPE: $('#customer-account-facility-type').val(),
                    HCO_NPI_ID: $('#customer-ids-npi').val(),
                    HCO_SHS_ID: $('#customer-ids-shs').val(),
                    HCO_CRM_ID: $('#customer-ids-crm').val(),
                    HCO_DEA_ID: $('#customer-ids-dea').val(),
                    HCO_HIN_ID: $('#customer-ids-hin').val(),
                    HCO_DUNS_ID: $('#customer-ids-duns').val(),
                    HCO_POS_ID: $('#customer-ids-pos').val(),
                    HCO_FED_TAX_ID: $('#customer-ids-fed-tax').val(),
                    HCO_GLN_ID: $('#customer-ids-gln').val()
                };

                var queryString = $.param(url_params);

                array_profile.push({ type: "HCOMATT", source: url_source, params: queryString });
            }

            // Modify HCO Address
            if ($('#customer-account-addressline1').val() !== origin_addressline1 || $('#customer-account-addressline2').val() !== origin_addressline2 ||
                $('#customer-account-city').val() !== origin_city || $('#customer-account-state').val() !== origin_state || $('#customer-account-zipcode').val() !== origin_zipcode) {
                url_params = {
                    HCO_NAME: $('#customer-account-name').val(),
                    HCO_ADDR_1: $('#customer-account-addressline1').val(),
                    HCO_ADDR_2: $('#customer-account-addressline2').val(),
                    HCO_CITY: $('#customer-account-city').val(),
                    HCO_STATE: $('#customer-account-state').val(),
                    HCO_ZIP5: $('#customer-account-zipcode').val()
                };

                var queryString = $.param(url_params);

                array_profile.push({ type: "HCOMAD", source: url_source, params: queryString });
            }

            // Modify IDs
            //if ($('#customer-ids-npi').val() !== origin_npi || $('#customer-ids-crm').val() !== origin_crm || $('#customer-ids-dea').val() !== origin_dea || !fnIsEmpty($('#customer-ids-hin').val()) ||
            //    !fnIsEmpty($('#customer-ids-duns').val()) || !fnIsEmpty($('#customer-ids-pos').val()) || !fnIsEmpty($('#customer-ids-fed-tax').val()) || !fnIsEmpty($('#customer-ids-gln').val())) {
            //    url_params = {
            //        HCO_NAME: $('#customer-account-name').val(),
            //        HCO_COT: $('#customer-account-class-of-trade').val(),
            //        HCO_FACILITY_TYPE: $('#customer-account-facility-type').val(),
            //        HCO_NPI_ID: $('#customer-ids-npi').val(),
            //        HCO_SHS_ID: $('#customer-ids-shs').val(),
            //        HCO_CRM_ID: $('#customer-ids-crm').val(),
            //        HCO_DEA_ID: $('#customer-ids-dea').val(),
            //        HCO_HIN_ID: $('#customer-ids-hin').val(),
            //        HCO_DUNS_ID: $('#customer-ids-duns').val(),
            //        HCO_POS_ID: $('#customer-ids-pos').val(),
            //        HCO_FED_TAX_ID: $('#customer-ids-fed-tax').val(),
            //        HCO_GLN_ID: $('#customer-ids-gln').val()
            //    };

            //    var queryString = $.param(url_params);

            //    array_profile.push({ type: "HCOMATT", source: url_source, params: queryString });
            //}

            var session_username = JSON.parse(sessionStorage.getItem("userObject")).username;

            if (array_profile.length > 0) {
                $.each(array_profile, function (index, i) {
                    var settings = {
                        "url": `https://.../api/v1/changerequests/create?req_type=${i.type}&source=${i.source}&HCO_MDM_ID=${hco_mdm_id}&${i.params}&SRC_CR_USER=${session_username}`,
                        "method": "POST",
                        "timeout": 0,
                        "headers": {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${fnGetToken()}`
                        },
                        "data": JSON.stringify({ "username": "deciphera", "password": "adminpass" }),
                    };

                    $.ajax(settings)
                        .done(function (response) {
                            $.notify(`  Update was successful. <br/ > Please allow 24 hours for the system to update the data.`,
                                {
                                    clickToHide: true,
                                    autoHide: false,
                                    delay: 10000,
                                    icon: "bell",
                                    type: "success",
                                    align: "center",
                                    verticalAlign: "top",
                                    animation: true,
                                    animationType: "drop"
                                }
                            );

                            $('#modalEditAccountProfile').modal('hide');

                            // Show flag
                            fnFlagUpdatedValueById("", hco_mdm_id);
                        })
                        .fail(function (response) {
                            console.log("error", response.responseJSON.message);
                        });
                });
            }
        });
    }

    // Flag field that are modified
    function fnFlagUpdatedValueById(hcp_mdm_id, hco_mdm_id) {
        $.ajax({
            type: 'POST',
            url: "/Home/FlagUpdatedValueById",
            data: {
                "hcp_mdm_id": hcp_mdm_id,
                "hco_mdm_id": hco_mdm_id
            },
            success: function (data) {
                if (!fnIsEmpty(data)) {
                    $.each(data, function (index, i) {
                        if (index == 0) {
                            if (i.CR_STATUS.toLowerCase() === "open" || i.CR_STATUS.toLowerCase() === "pending") {
                                $(".btn-change-request-flag").show();
                            } else {
                                $(".btn-change-request-flag").hide();
                            }
                        }
                    });
                } else {
                    $(".btn-change-request-flag").hide();
                }
            },
            error: function (err) {
                console.log("fnFlagUpdatedValueById error", err);
            }
        });
    }

    $(document).on("click", ".btn-change-request-flag", function () {
        //ids_array = fnGetHCOChangeRequestIds($("#account-object-id").val(), "HCO");

        ids_array = fnGetProfileIDs($("#account-object-id").val());

        // Populate table
        fnLoadClientChangeRequestData(ids_array, profile_array, client_id);

        $("#changeRequestModal").show();
    });

    // Remove duplicate in multidimentional array
    function fnMultiDimensionalUnique(arr) {
        var uniques = [];
        var itemsFound = {};

        for (var i = 0, l = arr.length; i < l; i++) {
            var stringified = JSON.stringify(arr[i]);

            if (itemsFound[stringified]) {
                continue;
            }

            uniques.push(arr[i]);

            itemsFound[stringified] = true;
        }

        return uniques;
    }

    // Get IDs profile
    function fnGetProfileIDs(client_id) {
        var arr = [];

        $.ajax({
            type: 'POST',
            url: "/Home/GetProfileHcoIds",
            async: false,
            data: {
                "client_id": client_id
            },
            success: function (data) {
                $.each(data, function (index, i) {
                    if (!fnIsEmpty(i.ID)) {
                        var obj = i.ID;
                        var obj_key = "";

                        if (!fnIsEmpty(i.ID)) {
                            var obj = i.ID;
                            var obj_key = "";

                            for (var key in obj) {
                                if (!fnIsEmpty(obj[key])) {
                                    obj_key = key;

                                    if (obj_key.indexOf("_") > 0) {
                                        obj_key = obj_key.replace("_", " ");
                                    }

                                    if (obj_key.indexOf("_") > 0) {
                                        obj_key = obj_key.replace("_", " ");
                                    }

                                    arr.push({ name: key, value: obj[key][0].value });
                                }
                            }
                        }
                    }
                });
            },
            error: function (err) {
                console.log("fnGetProfileIDs error", err);
            }
        });

        return arr;
    }

    // Get all change requests ids
    function fnGetHCOChangeRequestIds(client_id, type) {
        var result = null;

        if (!fnIsEmpty(client_id)) {
            $.ajax({
                type: 'POST',
                url: "/Home/GetHCOChangeRequestIds",
                async: false,
                data: {
                    "client_id": client_id,
                    "type": type
                },
                success: function (data) {
                    if (!fnIsEmpty(data)) {
                        result = data;
                    }
                },
                error: function (err) {
                    console.log("fnGetHCOChangeRequestIds error", err);
                }
            });
        }

        return result;
    }

    // Load Data - Server-Side
    function fnLoadClientChangeRequestData(hco_ids_array, hco_profile_array, hco_client_id) {
        $.ajax({
            url: "/Home/LoadHcoChangeRequestData",
            type: "POST",
            data: {
                HCO_MDM_ID: hco_client_id
            },
            success: function (data) {
                if (data != null) {
                    if (data.length > 0) {
                        var html = "";
                        var full_address = "";
                        var api_full_address = "";
                        var name, class_of_trade, facility_type, address_1, address_2, city, state, zip = "";
                        var npi, shs_id, crm_id, dea, hin, duns, pos_id, fed_tax, gln_id = "";
                        var array_list = [];

                        $.each(data, function (index, api) {
                            name = hco_profile_array.find(a => a.name === "name") == undefined ? "" : hco_profile_array.find(a => a.name === "name").value;

                            address_1 = hco_profile_array.find(a => a.name === "address_1") == undefined ? "" : hco_profile_array.find(a => a.name === "address_1").value;
                            address_2 = hco_profile_array.find(a => a.name === "address_2") == undefined ? "" : hco_profile_array.find(a => a.name === "address_2").value;
                            city = hco_profile_array.find(a => a.name === "city") == undefined ? "" : hco_profile_array.find(a => a.name === "city").value;
                            state = hco_profile_array.find(a => a.name === "state") == undefined ? "" : hco_profile_array.find(a => a.name === "state").value;
                            zip = hco_profile_array.find(a => a.name === "zip") == undefined ? "" : hco_profile_array.find(a => a.name === "zip").value;

                            class_of_trade = hco_profile_array.find(a => a.name === "class_of_trade") == undefined ? "" : fnUcFirstAllWords(hco_profile_array.find(a => a.name === "class_of_trade").value);
                            facility_type = hco_profile_array.find(a => a.name === "facility_type") == undefined ? "" : fnUcFirstAllWords(hco_profile_array.find(a => a.name === "facility_type").value);

                            npi = hco_ids_array.find(a => a.name === "NPI_ID") == undefined ? "" : hco_ids_array.find(a => a.name === "NPI_ID").value;
                            shs_id = hco_ids_array.find(a => a.name === "SHS_ID") == undefined ? "" : hco_ids_array.find(a => a.name === "SHS_ID").value;
                            crm_id = hco_ids_array.find(a => a.name === "CRM_ID") == undefined ? "" : hco_ids_array.find(a => a.name === "CRM_ID").value;
                            dea = hco_ids_array.find(a => a.name === "DEA") == undefined ? "" : hco_ids_array.find(a => a.name === "DEA").value;
                            hin = hco_ids_array.find(a => a.name === "HCO_HIN_ID") == undefined ? "" : hco_ids_array.find(a => a.name === "HCO_HIN_ID").value;
                            duns = hco_ids_array.find(a => a.name === "HCO_DUNS_ID") == undefined ? "" : hco_ids_array.find(a => a.name === "HCO_DUNS_ID").value;
                            pos_id = hco_ids_array.find(a => a.name === "HCO_POS_ID") == undefined ? "" : hco_ids_array.find(a => a.name === "HCO_POS_ID").value;
                            fed_tax = hco_ids_array.find(a => a.name === "HCO_FED_TAX_ID") == undefined ? "" : hco_ids_array.find(a => a.name === "HCO_FED_TAX_ID").value;
                            gln_id = hco_ids_array.find(a => a.name === "HCO_GLN_ID") == undefined ? "" : hco_ids_array.find(a => a.name === "HCO_GLN_ID").value;

                            if (api.REQ_TYPE !== "Modify HCO Address") {
                                if (name !== api.HCO_NAME) {
                                    array_list.push({
                                        value: "Name",
                                        original: name,
                                        change: api.HCO_NAME,
                                        request_type: api.REQ_TYPE
                                    });
                                }
                            }

                            if (api.REQ_TYPE === "Modify HCO Address" && api.REQ_TYPE !== "Modify HCO Attributes") {
                                if (address_1 !== api.HCO_ADDR_1) {
                                    array_list.push({
                                        value: "Address Line 1",
                                        original: address_1,
                                        change: fnIsEmpty(api.HCO_ADDR_1) ? "" : api.HCO_ADDR_1,
                                        request_type: api.REQ_TYPE
                                    });
                                }

                                if (address_2 !== api.HCO_ADDR_2) {
                                    array_list.push({
                                        value: "Address Line 2",
                                        original: address_2,
                                        change: fnIsEmpty(api.HCO_ADDR_2) ? "" : api.HCO_ADDR_2,
                                        request_type: api.REQ_TYPE
                                    });
                                }

                                if (city !== api.HCO_CITY) {
                                    array_list.push({
                                        value: "City",
                                        original: city,
                                        change: fnIsEmpty(api.HCO_CITY) ? "" : api.HCO_CITY,
                                        request_type: api.REQ_TYPE
                                    });
                                }

                                if (state !== api.HCO_STATE) {
                                    array_list.push({
                                        value: "State",
                                        original: state,
                                        change: fnIsEmpty(api.HCO_STATE) ? "" : api.HCO_STATE,
                                        request_type: api.REQ_TYPE
                                    });
                                }

                                if (zip !== api.HCO_ZIP5) {
                                    array_list.push({
                                        value: "Zip Code",
                                        original: zip,
                                        change: fnIsEmpty(api.HCO_ZIP5) ? "" : api.HCO_ZIP5,
                                        request_type: api.REQ_TYPE
                                    });
                                }
                            }

                            if (!fnIsEmpty(api.HCO_COT) && fnUcFirstAllWords(class_of_trade) !== fnUcFirstAllWords(api.HCO_COT)) {
                                array_list.push({
                                    value: "Class Of Trade",
                                    original: fnUcFirstAllWords(class_of_trade),
                                    change: fnIsEmpty(fnUcFirstAllWords(api.HCO_COT)) ? "" : fnUcFirstAllWords(api.HCO_COT),
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCO_FACILITY_TYPE) && fnUcFirstAllWords(facility_type) !== fnUcFirstAllWords(api.HCO_FACILITY_TYPE)) {
                                array_list.push({
                                    value: "Facility Type",
                                    original: fnUcFirstAllWords(facility_type),
                                    change: fnIsEmpty(fnUcFirstAllWords(api.HCO_FACILITY_TYPE)) ? "" : fnUcFirstAllWords(api.HCO_FACILITY_TYPE),
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCO_NPI_ID) && npi !== api.HCO_NPI_ID) {
                                array_list.push({
                                    value: "NPI",
                                    original: npi,
                                    change: fnIsEmpty(api.HCO_NPI_ID) ? "" : api.HCO_NPI_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCO_SHS_ID) && shs_id !== api.HCO_SHS_ID) {
                                array_list.push({
                                    value: "SHS",
                                    original: shs_id,
                                    change: fnIsEmpty(api.HCO_SHS_ID) ? "" : api.HCO_SHS_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCO_CRM_ID) && crm_id !== api.HCO_CRM_ID) {
                                array_list.push({
                                    value: "CRM ID",
                                    original: crm_id,
                                    change: fnIsEmpty(api.HCO_CRM_ID) ? "" : api.HCO_CRM_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCO_DEA_ID) && dea !== api.HCO_DEA_ID) {
                                array_list.push({
                                    value: "DEA",
                                    original: dea,
                                    change: fnIsEmpty(api.HCO_DEA_ID) ? "" : api.HCO_DEA_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCO_HIN_ID) && hin !== api.HCO_HIN_ID) {
                                array_list.push({
                                    value: "HIN",
                                    original: hin,
                                    change: fnIsEmpty(api.HCO_HIN_ID) ? "" : api.HCO_HIN_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCO_DUNS_ID) && duns !== api.HCO_DUNS_ID) {
                                array_list.push({
                                    value: "DUNS",
                                    original: duns,
                                    change: fnIsEmpty(api.HCO_DUNS_ID) ? "" : api.HCO_DUNS_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCO_POS_ID) && pos_id !== api.HCO_POS_ID) {
                                array_list.push({
                                    value: "POS",
                                    original: pos_id,
                                    change: fnIsEmpty(api.HCO_POS_ID) ? "" : api.HCO_POS_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCO_FED_TAX_ID) && fed_tax !== api.HCO_FED_TAX_ID) {
                                array_list.push({
                                    value: "FEX TAX ID",
                                    original: fed_tax,
                                    change: fnIsEmpty(api.HCO_FED_TAX_ID) ? "" : api.HCO_FED_TAX_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCO_GLN_ID) && gln_id !== api.HCO_GLN_ID) {
                                array_list.push({
                                    value: "GLN",
                                    original: gln_id,
                                    change: fnIsEmpty(api.HCO_GLN_ID) ? "" : api.HCO_GLN_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }
                        });

                        var arr = fnMultiDimensionalUnique(array_list);
                        
                        $.each(arr, function (index, i) {
                            html += `
                                <tr>
                                    <td>${i.value}</td>
                                    <td>${i.original}</td>
                                    <td>${i.change}</td>
                                    <td>${i.request_type}</td>
                                </tr>
                            `;
                        });

                        $("#dataTable tbody").html(html);
                    }
                }
            },
            error: function (error) {
                console.log("fnLoadClientChangeRequestData", error);
            }
        });
    }

    // Update Customer Known Address
    function fnUpdateAccountKnownAddress() {
        $(document).on("click", ".btn-save-change-account-known-address", function () {
            var url_source = $("#change-request-source").val();
            var url_params = {};
            var array_profile = [];
            var hco_mdm_id = $("#account-object-id").val();

            if (fnIsEmpty($("#account-known-address-addressline1").val()) && fnIsEmpty($("#account-known-address-city").val()) &&
                fnIsEmpty($("#account-known-address-state").val()) && fnIsEmpty($("#account-known-address-zipcode").val())) {
                console.log("Add address");
            } else if (!fnIsEmpty($("#account-known-address-addressline1").val()) || !fnIsEmpty($("#account-known-address-addressline2").val()) || !fnIsEmpty($("#account-known-address-city").val()) ||
                !fnIsEmpty($("#account-known-address-state").val()) || !fnIsEmpty($("#account-known-address-zipcode").val()) || $("input[type=checkbox]").is(":checked")) {
                url_params = {
                    HCO_NAME: $('#account-account-name').val(),
                    HCO_ADDR_1: $('#account-account-addressline1').val(),
                    HCO_ADDR_2: $('#account-account-addressline2').val(),
                    HCO_CITY: $('#account-account-city').val(),
                    HCO_STATE: $('#account-account-state').val(),
                    HCO_ZIP5: $('#account-account-zipcode').val()
                };

                var queryString = $.param(url_params);

                // Add New Address
                var req_type = "HCONA";

                // Modify Primary Address
                if ($("input[type=checkbox]").is(":checked")) {
                    url_source = $("#change-request-source-primary").val();
                    req_type = "HCOMPA";
                }

                array_known_address.push({ type: req_type, source: url_source, params: queryString });
            }

            var session_username = JSON.parse(sessionStorage.getItem("userObject")).username;

            if (array_profile.length > 0) {
                $.each(array_profile, function (index, i) {
                    var settings = {
                        "url": `https://.../api/v1/changerequests/create?req_type=${i.type}&source=${i.source}&HCO_MDM_ID=${hco_mdm_id}&${i.params}&SRC_CR_USER=${session_username}`,
                        "method": "POST",
                        "timeout": 0,
                        "headers": {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${fnGetToken()}`
                        },
                        "data": JSON.stringify({ "username": "deciphera", "password": "adminpass" }),
                    };

                    $.ajax(settings)
                        .done(function (response) {
                            $.notify(`  Update was successful. <br/ ><br/ > Please allow 24 hours for the system to update the data.`,
                                {
                                    clickToHide: true,
                                    autoHide: false,
                                    delay: 10000,
                                    icon: "bell",
                                    type: "success",
                                    align: "center",
                                    verticalAlign: "top",
                                    animation: true,
                                    animationType: "drop"
                                }
                            );

                            $('#modalEditAccountProfile').modal('hide');

                            // Show flag
                            fnFlagUpdatedValueById("", hco_mdm_id);
                        })
                        .fail(function (response) {
                            console.log("error", response.responseJSON.message);
                        });
                });
            }
        });
    }
});