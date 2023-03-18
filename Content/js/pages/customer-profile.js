$(document).ready(function () {
    $.ajaxSetup({
        cache: false
    });

    // Define global array
    let customer_ids_array = [];
    let customer_profile_array = [];
    let ids_array;
    let profile_array;
    let client_id;

    var gData = fnGetBestAddressInformation($("#user-object-id").val());

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

    $("#customer-profile-state, #customer-profile-specialty, #customer-known-address-state").select2({
        dropdownAutoWidth: true,
        width: '100%'
    });

    // Load all state dropdown
    var options = $("#customer-profile-state");
    var optionsKnownAddress = $("#customer-known-address-state");

    var allstates = JSON.parse(fnGetAllStates());

    $.each(allstates, function (index, i) {
        options.append(new Option(i, index));
        optionsKnownAddress.append(new Option(i, index));
    });

    // Load all specialties dropdown
    var arrSpecialty = fnGetAllSpecialties();

    var options = $("#customer-profile-specialty");

    $.each(arrSpecialty, function (index, i) {
        options.append(new Option(fnUcFirstAllWords(i), i.toUpperCase()));
    });

    // Load member information by id on selection on search page
    fnLoadMemberInformation();

    fnUpdateCustomerKnownAddress();

    // Update Customer Profile
    //fnUpdateCustomerProfile();

    fnGetAffiliatedHCOs($("#user-object-id").val());

    fnFlagUpdatedValueById($("#user-object-id").val(), "", false);

    // Redirect user to customer profile
    $(document).on("click", ".stretched-link", function (e) {
        fnRedirectPage("/Home/CustomerProfile/", "cm_hcp_id", $(this).val());
    })[0];

    // Redirect user to account profile
    $(document).on("click", ".affiliated-link", function (e) {
        fnRedirectPage("/Home/AccountProfile/", "hco_mdm_id", $(this).val());
    })[0];

    // Tooltip
    $.protip();

    // Load all information of member
    function fnLoadMemberInformation() {
        $.ajax({
            type: "POST",
            url: "/Home/GetMemberById",
            dataType: "json",
            data: { "cm_hcp_id": $("#user-object-id").val() },
            beforeSend: function () {
                $(".loader").show();
                $(".loader").css("z-index", 20);
                $("#content-wrapper").css("opacity", 0.1);

                // Disable buttons
            },
            success: function (data) {
                if (data != null) {
                    if (data.error) {
                        //console.log("fnLoadMemberInformation error on success", data.error);
                    } else {
                        //console.log("fnLoadMemberInformation success", data);

                        let source_array = [];
                        var primary_name = "";

                        // PROFILE SECTION //
                        // Additional provider information from best address
                        //var ba = fnGetBestAddressInformation($("#user-object-id").val());
                        var ba = gData;

                        if (ba.success && ba.success.length > 0) {
                            $.each(ba.success, function (index, i) {
                                // Target
                                if (!fnIsEmpty(i.target)) {
                                    var target = "";

                                    if (i.target.toLowerCase() == "true") {
                                        target = "Yes";
                                    } else {
                                        target = "No";
                                    }

                                    $("#member-target").html(`Target : ${target}`);

                                    $("#div-target").show();
                                }

                                // Degree
                                if (!fnIsEmpty(i.degree)) {
                                    $(".degree").html(`${i.degree.toUpperCase()} <span class="badge badge-${i.degree_source.toLowerCase()}">${i.degree_source.toUpperCase()}</span>`);

                                    $("#div-degree").show();
                                }

                                // Specialty
                                if (!fnIsEmpty(i.specialty)) {
                                    //$(".specialty").html(`${i.specialty} <span class="badge badge-${i.specialty_source.toLowerCase()}">${i.specialty_source.toUpperCase()}</span>  <i style="color: orange;" class="fas fa-flag flag-specialty"></i>`);
                                    $(".specialty").html(`${i.specialty} <span class="badge badge-${i.specialty_source.toLowerCase()}">${i.specialty_source.toUpperCase()}</span>`);

                                    customer_profile_array.push({ name: "specialty", value: i.specialty });

                                    $("#div-specialty").show();
                                }

                                // Territory
                                if (fnIsEmpty(i.territory_name) && fnIsEmpty(i.territory_id)) {
                                    $("#member-territory").html("Territory: Unaligned");                                    

                                    $("#div-member-territory").show();
                                } else {
                                    var terr = "";

                                    if (!fnIsEmpty(i.territory_id) && !fnIsEmpty(i.territory_name)) {
                                        terr = i.territory_id + " " + i.territory_name;
                                    } else if (fnIsEmpty(i.territory_id) && !fnIsEmpty(i.territory_name)) {
                                        terr = i.territory_name;
                                    } else if (!fnIsEmpty(i.territory_id) && fnIsEmpty(i.territory_name)) {
                                        terr = i.territory_id;
                                    }

                                    $("#member-territory").html(`Territory: ${terr}`);

                                    $("#div-member-territory").show();
                                }

                                // Full Name | Customer Name
                                if (!fnIsEmpty(i.full_name)) {
                                    var fullnameprimary = !fnIsEmpty(i.middle) ? `${i.first} ${i.middle} ${i.last}` : `${i.first} ${i.last}`;

                                    customer_profile_array.push({ name: "first", value: i.first });
                                    customer_profile_array.push({ name: "middle", value: i.middle });
                                    customer_profile_array.push({ name: "last", value: i.last });

                                    $("#member-name").html(fullnameprimary);

                                    //$("#profile-name").html(`${fullnameprimary} <span class="badge badge-${i.name_source.toLowerCase()}">${i.name_source.toUpperCase()}</span>  <i style="color: orange;" class="fas fa-flag flag-name"></i>`);
                                    $("#profile-name").html(`${fullnameprimary} <span class="badge badge-${i.name_source.toLowerCase()}">${i.name_source.toUpperCase()}</span>`);

                                    $("#div-profile-name").show();

                                    primary_name = fullnameprimary;
                                }

                                // Name Date
                                var namedate = "";
                                if (!fnIsEmpty(i.name_date)) {
                                    namedate = i.name_date;

                                    if (namedate.indexOf("Date") > 0) {
                                        var regExp = /\(([^)]+)\)/;
                                        var matches = regExp.exec(namedate);
                                        namedate = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                                    }

                                    source_array.push({ type: "Primary Name", date: namedate, source: i.name_source, value: i.full_name });
                                }                                

                                // Email
                                if (!fnIsEmpty(i.email)) {
                                    $("#member-email").html(`E-mail Address: ${i.email}`);

                                    $("#div-member-email").show();
                                }

                                // Phone
                                if (!fnIsEmpty(i.phone)) {
                                    $("#member-telephone").html(`Telephone Number: ${i.phone}`);

                                    $("#div-member-telephone").show();
                                }

                                // Website
                                if (!fnIsEmpty(i.website)) {
                                    $("#member-website").html(`Website: ${i.website}`);

                                    $("#div-member-website").show();
                                }

                                // Address
                                if (!fnIsEmpty(i.address_1)) {
                                    var adHtml = "";
                                    adHtml += `${i.address_1} ${i.address_2} ${i.city} ${i.state} ${i.zip}`;
                                    //$("#member-location").html(`${adHtml} <span class="badge badge-${i.address_source.toLowerCase()}">${i.address_source.toUpperCase()}</span>  <i style="color: orange;" class="fas fa-flag flag-address"></i>`);
                                    $("#member-location").html(`${adHtml} <span class="badge badge-${i.address_source.toLowerCase()}">${i.address_source.toUpperCase()}</span>`);

                                    customer_profile_array.push({ name: "address_1", value: i.address_1 });
                                    customer_profile_array.push({ name: "address_2", value: i.address_2 });
                                    customer_profile_array.push({ name: "city", value: i.city });
                                    customer_profile_array.push({ name: "state", value: i.state });
                                    customer_profile_array.push({ name: "zip", value: i.zip });

                                    $("#div-member-location").show();
                                }
                            });
                        }

                        //Client ID
                        if (!fnIsEmpty($("#user-object-id").val())) {
                            $("#member-client-id").html(`Client ID: ${$("#user-object-id").val()}`);
                        }

                        // Data from HCP_Details which is the same as HCP_Physicians
                        $.each(data, function (index, i) {
                            // Status
                            if (!fnIsEmpty(i.Status)) {
                                var status_color = "";

                                // Change color for member status
                                if (i.Status.toLowerCase() == "active") {
                                    status_color = "success";
                                } else {
                                    status_color = "danger";
                                }

                                $("#member-status").html(i.Status != null ? `Status: <span id="member-status" class="badge badge-${status_color}">${i.Status.toUpperCase()}</span>` : "");

                                $("#div-status").show();
                            }

                            // ID's
                            if (!fnIsEmpty(i.ID)) {
                                var obj = i.ID;
                                var obj_html = "";
                                var obj_key = "";

                                for (var key in obj) {
                                    if (!fnIsEmpty(obj[key])) {
                                        obj_key = key;

                                        $.each(obj[key], function (index, el) {
                                            if (obj_key.indexOf("_") > 0) {
                                                obj_key = obj_key.replace("_", " ");
                                            }

                                            customer_ids_array.push({ name: key, value: el.value });
                                            source_array.push({ type: key, date: el.date, source: el.source, value: el.value });

                                            obj_html += `${obj_key.toUpperCase()}: ${el.value} <span class="badge badge-${el.source.toLowerCase()}">${el.source.toUpperCase()}</span> <br />`;
                                        });
                                    }
                                }

                                $("#member-ids").html(obj_html);
                            }

                            // Create source array for degree
                            if (i.Degree.length > 0) {
                                $.each(i.Degree, function (index, dg) {
                                    source_array.push({ type: "Degree", date: dg.date, source: dg.source, value: dg.value });
                                });
                            }

                            // Create source array for Specialty
                            if (i.Specialty != null) {
                                source_array.push({ type: "Specialty", date: i.Specialty.date, source: i.Specialty.source, value: fnUcFirstAllWords(i.Specialty.value) });
                            }

                            // Customer Data
                            if (i.Customer_data.length > 0) {
                                var cdHtml = "";

                                cdHtml += "<br />";

                                $.each(i.Customer_data, function (index, cd) {
                                    var pdrp_ind = cd.pdrp_indicator == 0 ? "No" : "Yes";
                                    var ama_no_c = cd.ama_no_contact == 0 ? "No" : "Yes";

                                    cdHtml += "<p>";

                                    cdHtml += !fnIsEmpty(cd.pdrp_indicator) ? `PDRP Indicator: ${pdrp_ind}<br />` : "";

                                    if (pdrp_ind == "Yes") {
                                        cdHtml += !fnIsEmpty(cd.pdrp_date) ? `PDRP Date: ${cd.pdrp_date}<br />` : "";
                                    }

                                    cdHtml += !fnIsEmpty(cd.territory_id) ? `Territory ID: ${cd.territory_id}<br />` : "";
                                    cdHtml += !fnIsEmpty(cd.call_status_code) ? `Call Status Code: ${cd.call_status_code}<br />` : "";
                                    cdHtml += !fnIsEmpty(cd.ama_no_contact) ? `AMA No Contact: ${ama_no_c}<br />` : "";

                                    cdHtml += "</p>";
                                });

                                $("#customer-data-object").html(cdHtml);

                                if (!fnIsEmpty(cdHtml)) {
                                    $("#div-customer-data-object").show();
                                }
                            }

                            // SECTION: OTHER NAMES //
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
                                                                <li class="list-group-item"><button class="btn btn-link stretched-link" value="${i.CM_HCP_ID}">${n.value}</button></li>
                                                              </ul>`);

                                    // SECTION: OTHER NAMES
                                    htmlOtherName += `${n.value} <span class="badge badge-${n.source.toLowerCase()}">${n.source.toUpperCase()}</span><br>`;

                                    // SECTION: CO-LOCATED
                                    colocatedHtml += `<ul class="list-group list-group-flush">
                                                        <li class="list-group-item"><button class="btn btn-link stretched-link" value="${i.CM_HCP_ID}">${n.value}</button></li>
                                                      </ul>`;
                                });

                                if (co_located_length >= 2) {
                                    $("#member-co-location").css("height", "130px");
                                }

                                if (fnIsEmpty(colocatedHtml)) {
                                    // hide
                                    $("#block-id-pm-co-location").removeClass("show");

                                    $("#arrow-down-pm-co-location").css("display", "none");
                                    $("#arrow-up-pm-co-location").css("display", "none");
                                }
                            }

                            // ID'S
                            $("#block-id-info").addClass("show");

                            // OTHER NAMES
                            $("#block-id-pm").addClass("show");

                            // Append other names
                            $("#related-member-name").html(fnUnique(other_name_array).join("<br>"));

                            fnGetAffiliation($("#user-object-id").val(), primary_name, fnUnique(other_name_array));

                            if (fnIsEmpty(htmlOtherName)) {
                                // hide
                                $("#block-id-pm").removeClass("show");
                                $("#arrow-down-pm").css("display", "none");
                                $("#arrow-up-pm").css("display", "none");
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

                            // Send data to build html for timeline
                            fnBuildTimeline(source_array);
                            fnPopulateDataInModal(customer_ids_array);
                            //fnUpdateCustomerIDs(customer_ids_array);
                            fnUpdateCustomerProfile(customer_ids_array);

                            ids_array = customer_ids_array;
                            profile_array = customer_profile_array;
                            client_id = $("#user-object-id").val();

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
                            $("#member-sources").html(srcBtnHtml);

                            $("#member-sources-modal").html(srcModalHtml);

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
            complete: function () {
                //$(".loader").hide();
                //$("#content-wrapper").css("opacity", "");

                // Enable buttons
            },
            error: function (error) {
                console.log("fnLoadMemberInformation error", error);
            }
        });
    }

    // Sort source column in array
    Array.prototype.sortBy = function (p) {
        return this.slice(0).sort(function (a, b) {
            return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
        });
    }

    function fnBuildTimeline(data) {
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
    
    // Get best address data
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
                        console.log("fnGetBestAddressInformation on error", error.error);

                        result = data;
                    } else {
                        //console.log("fnGetBestAddressInformation on success", data);

                        result = data;
                    }
                }
            },
            error: function (error) {
                console.log("fnGetBestAddressInformation on error", error);

                result = error;
            },
            complete: function () {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            }
        });

        return result;
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

    // Get affiliation
    function fnGetAffiliation(cm_hcp_id, primary_name, other_names) {
        var result = "";
        var other_name_location = [];

        if (!fnIsEmpty(cm_hcp_id)) {
            $.ajax({
                type: "POST",
                url: "/Home/GetAffiliation",
                dataType: "json",
                data: { "cm_hcp_id": cm_hcp_id },
                beforeSend: function () {
                    $(".loader").show();
                    $(".loader").css("z-index", 20);
                    $("#content-wrapper").css("opacity", 0.1);
                },
                success: function (data) {
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
                            $("#member-co-location").html(fnUnique(other_name_location).join("<br>"));
                        } else {
                            // hide
                            $("#block-id-pm-co-location").removeClass("show");

                            $("#arrow-down-pm-co-location").css("display", "none");
                            $("#arrow-up-pm-co-location").css("display", "none");
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

    // Get HCP HCO Affiliation
    function fnGetHCOBestAddress(hco_mdm_id) {
        var result = "";

        $.ajax({
            type: 'POST',
            url: "/Home/GetHCOBestAddress",
            async: false,
            dataType: "json",
            data: { "hco_mdm_id": hco_mdm_id },
            success: function (data) {
                result = data;
            },
            error: function (err) {
                console.log("fnGetHCOBestAddress error", err);
            }
        });

        return result;
    }

    // Get Affiliated HCOs
    function fnGetAffiliatedHCOs(id) {
        if (!fnIsEmpty(id)) {
            var html_array = [];

            $.each(fnGetHCPHCOAffiiation(id, "hcp"), function (index, i) {
                $.each(fnGetHCOBestAddress(i.HCO_MDM_ID), function (index, j) {
                    html_array.push(`<ul class="list-group list-group-flush">
                                        <li class="list-group-item"><button class="btn btn-link affiliated-link" value="${j.HCO_MDM_ID}">${j.name}</button></li>
                                      </ul>`);
                });
            });

            if (html_array.length > 0) {
                $("#affiliated-hcos").html(html_array.join("<br>"));
            } else {
                $("#block-id-affiliated-hcos").removeClass("show");

                $("#arrow-down-affiliated-hcos").css("display", "none");
                $("#arrow-up-affiliated-hcos").css("display", "none");
            }
        }
    }

    // Previous button
    $(document).on('click', '.previous-button', function () {
        window.history.back();
    });

    // API - Update Customer Profile Form
    function fnUpdateCustomerProfile(array_ids) {
        var origin_fname, origin_mname, origin_lname, origin_addressline1, origin_addressline2, origin_city, origin_state, origin_zipcode, origin_specialty = "";

        var origin_npi = fnIsEmpty(array_ids.find(a => a.name === "NPI")) == true ? "" : array_ids.find(a => a.name === "NPI").value;
        var origin_dea = fnIsEmpty(array_ids.find(a => a.name === "DEA")) == true ? "" : array_ids.find(a => a.name === "DEA").value;
        var origin_ama = fnIsEmpty(array_ids.find(a => a.name === "ME_ID")) == true ? "" : array_ids.find(a => a.name === "ME_ID").value; //HCP_AMA_ID

        $.each(gData.success, function (index, i) {
            origin_fname = i.first;
            origin_mname = i.middle;
            origin_lname = i.last;
            origin_addressline1 = i.address_1;
            origin_addressline2 = i.address_2;
            origin_city = i.city;
            origin_state = i.state;
            origin_zipcode = i.zip;
            origin_specialty = i.specialty;
        });

        // Validate if inputs are not empty //
        // Validate First Name
        $('#form-update-customer-profile input#customer-profile-fname').on("input", function () {
            if (fnIsEmpty($(this).val())) {
                $(".required-fname").show();
            } else {
                $(".required-fname").hide();
            }
        });

        // Validation Show/Hide //
        // Validate Last Name
        $('#form-update-customer-profile input#customer-profile-lname').on("input", function () {
            if (fnIsEmpty($(this).val())) {
                $(".required-lname").show();
            } else {
                $(".required-lname").hide();
            }
        });

        // Validate Address Line 1
        $('#form-update-customer-profile input#customer-profile-addressline1').on("input", function () {
            if (fnIsEmpty($(this).val())) {
                $(".required-addressline1").show();
            } else {
                $(".required-addressline1").hide();
            }
        });

        // Validate City
        $('#form-update-customer-profile input#customer-profile-city').on("input", function () {
            if (fnIsEmpty($(this).val())) {
                $(".required-city").show();
            } else {
                $(".required-city").hide();
            }
        });

        // Validate State
        $('#form-update-customer-profile #customer-profile-state').on("change", function () {
            if (fnIsEmpty($(this).val())) {
                $(".required-state").show();
            } else {
                $(".required-state").hide();
            }
        });

        // Validate Zip Code
        $('#form-update-customer-profile input#customer-profile-zipcode').on("input", function () {
            if (fnIsEmpty($(this).val())) {
                $(".required-zipcode").show();
            } else {
                $(".required-zipcode").hide();
            }
        });

        // Validate if input values are not equal to origin to enable button for update change //
        // Validate if First Name value match the original
        $('#customer-profile-fname').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_fname) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if Middle Name value match the original
        $('#customer-profile-mname').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_mname) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if Last Name value match the original
        $('#customer-profile-lname').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_lname) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if Address Line 1 value match the original
        $('#customer-profile-addressline1').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_addressline1) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if Address Line 2 value match the original
        $('#customer-profile-addressline2').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_addressline2) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if City value match the original
        $('#customer-profile-city').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_city) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if State value match the original
        $('#customer-profile-state').on("change", function () {
            var dInput = this.value;

            if (dInput === origin_state) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if Zip Code value match the original
        $('#customer-profile-zipcode').on("input", function () {
            var dInput = this.value;

            if (dInput === origin_zipcode) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if Specialty value match the original
        $('#customer-profile-specialty').on("change", function () {
            var dInput = this.value;

            if (dInput === origin_specialty) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if NPI match the original
        $('#customer-ids-npi').on("input", function () {
            if (this.value === origin_npi) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if AMA/ME ID match the original
        $('#customer-ids-ama').on("input", function () {
            if (this.value === origin_ama) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if DEA match the original
        $('#customer-ids-dea').on("input", function () {
            if (this.value === origin_dea) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if AOA match the original
        $('#customer-ids-aoa').on("input", function () {
            var dInput = this.value;

            if (fnIsEmpty(dInput)) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if ADA match the original
        $('#customer-ids-ada').on("input", function () {
            var dInput = this.value;

            if (fnIsEmpty(dInput)) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if AAPA match the original
        $('#customer-ids-aapa').on("input", function () {
            var dInput = this.value;

            if (fnIsEmpty(dInput)) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if ACNM match the original
        $('#customer-ids-acnm').on("input", function () {
            var dInput = this.value;

            if (fnIsEmpty(dInput)) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if MSCHST match the original
        $('#customer-ids-mschst').on("input", function () {
            var dInput = this.value;

            if (fnIsEmpty(dInput)) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if AOPA match the original
        $('#customer-ids-aopa').on("input", function () {
            var dInput = this.value;

            if (fnIsEmpty(dInput)) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if Medicaid match the original
        $('#customer-ids-medicaid').on("input", function () {
            var dInput = this.value;

            if (fnIsEmpty(dInput)) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if UPIN match the original
        $('#customer-ids-upin').on("input", function () {
            var dInput = this.value;

            if (fnIsEmpty(dInput)) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        // Validate if FED TAX match the original
        $('#customer-ids-fed-tax').on("input", function () {
            var dInput = this.value;

            if (fnIsEmpty(dInput)) {
                $('.btn-save-change-customer-profile').prop("disabled", true);
            } else {
                $('.btn-save-change-customer-profile').prop("disabled", false);
            }
        });

        $('#checkMarkPrimaryAddress').click(function () {
            //If the checkbox is checked.
            if ($(this).is(':checked')) {
                //Enable the submit button.
                $('.btn-save-change-customer-profile').prop("disabled", false);
            } else {
                //If it is not checked, disable the button.
                $('.btn-save-change-customer-profile').prop("disabled", true);
            }
        });

        // Modify customer profile information
        $(document).on('click', '.btn-save-change-customer-profile', function () {
            var url_source = $("#change-request-source").val();
            var url_params = {};
            var array_profile = [];
            var hcp_mdm_id = $("#user-object-id").val();
            
            if ($("#customer-profile-addressline1").val() !== origin_addressline1 || $("#customer-profile-addressline2").val() !== origin_addressline2 || $("#customer-profile-city").val() !== origin_city ||
                $("#customer-profile-state").val() !== origin_state || $("#customer-profile-zipcode").val() !== origin_zipcode || $("input[type=checkbox]").is(":checked")) {
                url_params = {
                    HCP_LAST_NAME: $("#customer-profile-lname").val(),
                    HCP_MIDDLE_NAME: $("#customer-profile-mname").val(),
                    HCP_FIRST_NAME: $("#customer-profile-fname").val(),
                    HCP_ADDR_1: $("#customer-profile-addressline1").val(),
                    HCP_ADDR_2: $("#customer-profile-addressline2").val(),
                    HCP_CITY: $("#customer-profile-city").val(),
                    HCP_STATE: $("#customer-profile-state").val(),
                    HCP_ZIP5: $("#customer-profile-zipcode").val()
                };

                var queryString = $.param(url_params);

                // Add New Address
                var req_type = "HCPNA";

                // Modify Primary Address
                if ($("input[type=checkbox]").is(":checked")) {
                    url_source = $("#change-request-source-primary").val();
                    req_type = "HCPMPA";
                }

                array_profile.push({ type: req_type, source: url_source, params: queryString });
            }

            // Modify HCP Attributes
            if ($("#customer-profile-fname").val() !== origin_fname || $("#customer-profile-mname").val() !== origin_mname || $("#customer-profile-lname").val() !== origin_lname ||
                $("#customer-profile-specialty").val() !== origin_specialty ||
                (
                    $("#customer-ids-npi").val() !== origin_npi || $("#customer-ids-ama").val() !== origin_ama || $("#customer-ids-dea").val() !== origin_dea || !fnIsEmpty($("#customer-ids-aoa").val()) ||
                    !fnIsEmpty($("#customer-ids-ada").val()) || !fnIsEmpty($("#customer-ids-aapa").val()) || !fnIsEmpty($("#customer-ids-acnm").val()) || !fnIsEmpty($("#customer-ids-mschst").val()) ||
                    !fnIsEmpty($("#customer-ids-aopa").val()) || !fnIsEmpty($("#customer-ids-medicaid").val()) || !fnIsEmpty($("#customer-ids-opendata").val()) || !fnIsEmpty($("#customer-ids-onekey").val()) ||
                    !fnIsEmpty($("#customer-ids-upin").val()) || !fnIsEmpty($("#customer-ids-fed-tax").val())
                ))
                {
                    url_params = {
                        HCP_LAST_NAME: $("#customer-profile-lname").val(),
                        HCP_MIDDLE_NAME: $("#customer-profile-mname").val(),
                        HCP_FIRST_NAME: $("#customer-profile-fname").val(),
                        HCP_PRY_SPECIALTY: $("#customer-profile-specialty").val(),
                        HCP_NPI_ID: $("#customer-ids-npi").val(),
                        HCP_AMA_ID: $("#customer-ids-ama").val(),
                        HCP_DEA_ID: $("#customer-ids-dea").val(),
                        HCP_AOA_ID: $("#customer-ids-aoa").val(),
                        HCP_ADA_ID: $("#customer-ids-ada").val(),
                        HCP_AAPA_ID: $("#customer-ids-aapa").val(),
                        HCP_ACNM_ID: $("#customer-ids-acnm").val(),
                        HCP_MSCHST_ID: $("#customer-ids-mschst").val(),
                        HCP_AOPA_ID: $("#customer-ids-aopa").val(),
                        HCP_MEDICAID_ID: $("#customer-ids-medicaid").val(),
                        HCP_UPIN_ID: $("#customer-ids-upin").val(),
                        HCP_FED_TAX_ID: $("#customer-ids-fed-tax").val()
                    };

                var queryString = $.param(url_params);

                array_profile.push({ type: "HCPMATT", source: url_source, params: queryString });
            }

            var session_username = JSON.parse(sessionStorage.getItem("userObject")).username;

            if (array_profile.length > 0) {
                $.each(array_profile, function (index, i) {
                    var settings = {
                        "url": `https://.../api/v1/changerequests/create?req_type=${i.type}&source=${i.source}&HCP_MDM_ID=${hcp_mdm_id}&${i.params}&SRC_CR_USER=${session_username}`,
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
                            $('#modalEditCustomerProfile').modal('hide');

                            //$.notify(`  Update was successful. <br/ ><br /> Please allow 24 hours for the system to update the data.`,
                            //    {
                            //        clickToHide: true,
                            //        autoHide: false,
                            //        delay: 10000,
                            //        icon: "bell",
                            //        type: "success",
                            //        align: "center",
                            //        verticalAlign: "top",
                            //        animation: true,
                            //        animationType: "drop"
                            //    }
                            //);

                            // Show flag
                            fnFlagUpdatedValueById(hcp_mdm_id, "", true);
                        })
                        .fail(function (response) {
                            console.log("error", response.responseJSON);
                        });
                });
            }
        });
    }

    // Flag field that are modified
    function fnFlagUpdatedValueById(hcp_mdm_id, hco_mdm_id, notification) {
        if (!fnIsEmpty(hcp_mdm_id)) {
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

                            if (notification) {
                                $.notify(`  Update was successful. <br/ ><br /> Please allow 24 hours for the system to update the data.`,
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
                            }
                        });
                    } else {
                        $(".change-request-flag").hide();
                    }
                },
                error: function (err) {
                    console.log("fnFlagUpdatedValueById error", err);
                }
            });
        }
    }
   
    // Get Token
    function fnGetToken() {
        var result = "";

        $.ajax({
            type: 'GET',
            url: "https://.../api/v1/Token/access",
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
 
    // Get All State
    function fnGetAllStates() {
        var result = "";

        $.ajax({
            type: 'GET',
            url: "/Home/GetAllStates",
            async: false,
            success: function (data) {
                result = data;
            },
            error: function (err) {
                console.log("fnGetAllStates error", err);
            }
        });

        return result;
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
    function fnPopulateDataInModal(array_customer) {
        var data = gData;

        if (data.status == "success") {
            $.each(data.success, function (index, i) {
                // Customer Profile
                $("#customer-profile-fname").val(i.first);
                $("#customer-profile-mname").val(i.middle);
                $("#customer-profile-lname").val(i.last);
                $("#customer-profile-addressline1").val(i.address_1);
                $("#customer-profile-addressline2").val(i.address_2);
                $("#customer-profile-city").val(fnUcFirstAllWords(i.city));
                $("#customer-profile-state").val(i.state).trigger('change');
                $("#customer-profile-zipcode").val(i.zip);
                $("#customer-profile-specialty").val(i.specialty.toUpperCase()).trigger('change');
            });
        }

        if (!fnIsEmpty(array_customer)) {
            // Customer IDs
            $("#customer-ids-npi").val(fnIsEmpty(array_customer.find(a => a.name === "NPI")) == true ? "" : array_customer.find(a => a.name === "NPI").value);
            $("#customer-ids-ama").val(fnIsEmpty(array_customer.find(a => a.name === "ME_ID")) == true ? "" : array_customer.find(a => a.name === "ME_ID").value);
            $("#customer-ids-dea").val(fnIsEmpty(array_customer.find(a => a.name === "DEA")) == true ? "" : array_customer.find(a => a.name === "DEA").value);
        }
    }

    // Find value in array
    function fnIsArrayItemExists(array, item) {
        $.each(array, function (key, el) {
            if (el.name == item) {
                return true;
            };
        });

        return false;
    }

    // Validate if JSON is empty
    function fnIsJsonEmpty(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    $(document).on("click", ".btn-change-request-flag", function () {
        //ids_array = fnGetHCPChangeRequestIds($("#user-object-id").val(), "HCP");

        ids_array = fnGetProfileIDs($("#user-object-id").val());

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
            url: "/Home/GetProfileHcpIds",
            async: false,
            data: {
                "client_id": client_id
            },
            success: function (data) {
                $.each(data, function (index, i) {
                    if (!fnIsEmpty(i.ID)) {
                        var obj = i.ID;
                        var obj_key = "";

                        for (var key in obj) {
                            if (!fnIsEmpty(obj[key])) {
                                obj_key = key;

                                $.each(obj[key], function (index, el) {
                                    if (obj_key.indexOf("_") > 0) {
                                        obj_key = obj_key.replace("_", " ");
                                    }

                                    arr.push({ name: key, value: el.value });
                                });
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
    function fnGetHCPChangeRequestIds(client_id, type) {
        var result = null;

        if (!fnIsEmpty(client_id)) {
            $.ajax({
                type: 'POST',
                url: "/Home/GetHCPChangeRequestIds",
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
                    console.log("fnGetHCPChangeRequestIds error", err);
                }
            });
        }

        return result;
    }

    // Load Data - Server-Side
    function fnLoadClientChangeRequestData(hcp_ids_array, hcp_profile_array, hcp_client_id) {
        $.ajax({
            url: "/Home/LoadHcpChangeRequestData",
            type: "POST",
            data: {
                HCP_MDM_ID: hcp_client_id
            },
            success: function (data) {
                if (data != null) {
                    if (data.length > 0) {
                        var html = "";
                        var full_name, full_address = "";
                        var api_full_name, api_full_address = "";
                        var first, middle, last, specialty, address_1, address_2, city, state, zip = "";
                        var npi, shs_id, crm_id, ama, dea, aoa, ada, aapa, acnm, mschst, aopa, medicaid, upin, fed_tax = "";
                        var array_list = [];

                        $.each(data, function (index, api) {
                            first = hcp_profile_array.find(a => a.name === "first") == undefined ? "" : hcp_profile_array.find(a => a.name === "first").value;
                            middle = hcp_profile_array.find(a => a.name === "middle") == undefined ? "" : hcp_profile_array.find(a => a.name === "middle").value;
                            last = hcp_profile_array.find(a => a.name === "last") == undefined ? "" : hcp_profile_array.find(a => a.name === "last").value;

                            specialty = hcp_profile_array.find(a => a.name === "specialty") == undefined ? "" : hcp_profile_array.find(a => a.name === "specialty").value;

                            address_1 = hcp_profile_array.find(a => a.name === "address_1") == undefined ? "" : hcp_profile_array.find(a => a.name === "address_1").value;
                            address_2 = hcp_profile_array.find(a => a.name === "address_2") == undefined ? "" : hcp_profile_array.find(a => a.name === "address_2").value;
                            city = hcp_profile_array.find(a => a.name === "city") == undefined ? "" : hcp_profile_array.find(a => a.name === "city").value;
                            state = hcp_profile_array.find(a => a.name === "state") == undefined ? "" : hcp_profile_array.find(a => a.name === "state").value;
                            zip = hcp_profile_array.find(a => a.name === "zip") == undefined ? "" : hcp_profile_array.find(a => a.name === "zip").value;

                            full_name = !fnIsEmpty(middle) ? first + " " + middle + " " + last : first + " " + last;
                            api_full_name = !fnIsEmpty(api.HCP_MIDDLE_NAME) ? api.HCP_FIRST_NAME + " " + api.HCP_MIDDLE_NAME + " " + api.HCP_LAST_NAME : api.HCP_FIRST_NAME + " " + api.HCP_LAST_NAME;
                            
                            npi = hcp_ids_array.find(a => a.name === "NPI") == undefined ? "" : hcp_ids_array.find(a => a.name === "NPI").value;
                            shs_id = hcp_ids_array.find(a => a.name === "SHS_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "SHS_ID").value;
                            crm_id = hcp_ids_array.find(a => a.name === "CRM_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "CRM_ID").value;
                            ama = hcp_ids_array.find(a => a.name === "ME_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "ME_ID").value;
                            dea = hcp_ids_array.find(a => a.name === "DEA") == undefined ? "" : hcp_ids_array.find(a => a.name === "DEA").value;
                            aoa = hcp_ids_array.find(a => a.name === "AOA_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "HAOA_ID").value;
                            ada = hcp_ids_array.find(a => a.name === "ADA_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "ADA_ID").value;
                            aapa = hcp_ids_array.find(a => a.name === "AAPA_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "AAPA_ID").value;
                            acnm = hcp_ids_array.find(a => a.name === "ACNM_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "ACNM_ID").value;
                            mschst = hcp_ids_array.find(a => a.name === "MSCHST_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "MSCHST_ID").value;
                            aopa = hcp_ids_array.find(a => a.name === "AOPA_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "AOPA_ID").value;
                            medicaid = hcp_ids_array.find(a => a.name === "MEDICAID_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "MEDICAID_ID").value;
                            upin = hcp_ids_array.find(a => a.name === "UPIN_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "UPIN_ID").value;
                            fed_tax = hcp_ids_array.find(a => a.name === "FED_TAX_ID") == undefined ? "" : hcp_ids_array.find(a => a.name === "FED_TAX_ID").value;

                            if (api.REQ_TYPE !== "Add New Address") {
                                if (full_name !== api_full_name) {
                                    array_list.push({
                                        value: "Name",
                                        original: !fnIsEmpty(middle) ? first + " " + middle + " " + last : first + " " + last,
                                        change: !fnIsEmpty(api.HCP_MIDDLE_NAME) ? api.HCP_FIRST_NAME + " " + api.HCP_MIDDLE_NAME + " " + api.HCP_LAST_NAME : api.HCP_FIRST_NAME + " " + api.HCP_LAST_NAME,
                                        request_type: api.REQ_TYPE
                                    });
                                }
                            }

                            if (!fnIsEmpty(api.HCP_PRY_SPECIALTY) && fnUcFirstAllWords(specialty) !== fnUcFirstAllWords(api.HCP_PRY_SPECIALTY)) {
                                array_list.push({
                                    value: "Specialty",
                                    original: fnUcFirstAllWords(specialty),
                                    change: fnUcFirstAllWords(api.HCP_PRY_SPECIALTY),
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (api.REQ_TYPE === "Modify Primary Address" || api.REQ_TYPE !== "Modify HCP Attributes" || api.REQ_TYPE == "Add New Address") {
                                if (api.REQ_TYPE == "Add New Address") {
                                    if (!fnIsEmpty(api.HCP_ADDR_1)) {
                                        array_list.push({
                                            value: "Address Line 1",
                                            original: "",
                                            change: api.HCP_ADDR_1,
                                            request_type: api.REQ_TYPE
                                        });
                                    }                                    

                                    if (!fnIsEmpty(api.HCP_ADDR_2)) {
                                        array_list.push({
                                            value: "Address Line 2",
                                            original: "",
                                            change: api.HCP_ADDR_2,
                                            request_type: api.REQ_TYPE
                                        });
                                    }

                                    if (!fnIsEmpty(api.HCP_CITY)) {
                                        array_list.push({
                                            value: "City",
                                            original: "",
                                            change: api.HCP_CITY,
                                            request_type: api.REQ_TYPE
                                        });
                                    }

                                    if (!fnIsEmpty(api.HCP_STATE)) {
                                        array_list.push({
                                            value: "State",
                                            original: "",
                                            change: api.HCP_STATE,
                                            request_type: api.REQ_TYPE
                                        });
                                    }

                                    if (!fnIsEmpty(api.HCP_ZIP5)) {
                                        array_list.push({
                                            value: "Zip Code",
                                            original: "",
                                            change: api.HCP_ZIP5,
                                            request_type: api.REQ_TYPE
                                        });
                                    }
                                } else {
                                    if (!fnIsEmpty(api.HCP_ADDR_1) && address_1 !== api.HCP_ADDR_1) {
                                        array_list.push({
                                            value: "Address Line 1",
                                            original: address_1,
                                            change: fnIsEmpty(api.HCP_ADDR_1) ? "" : api.HCP_ADDR_1,
                                            request_type: api.REQ_TYPE
                                        });
                                    }

                                    if (!fnIsEmpty(api.HCP_ADDR_2) && address_2 !== api.HCP_ADDR_2) {
                                        array_list.push({
                                            value: "Address Line 2",
                                            original: address_2,
                                            change: fnIsEmpty(api.HCP_ADDR_2) ? "" : api.HCP_ADDR_2,
                                            request_type: api.REQ_TYPE
                                        });
                                    }

                                    if (!fnIsEmpty(api.HCP_CITY) && city !== api.HCP_CITY) {
                                        array_list.push({
                                            value: "City",
                                            original: city,
                                            change: fnIsEmpty(api.HCP_CITY) ? "" : api.HCP_CITY,
                                            request_type: api.REQ_TYPE
                                        });
                                    }

                                    if (!fnIsEmpty(api.HCP_STATE) && state !== api.HCP_STATE) {
                                        array_list.push({
                                            value: "State",
                                            original: state,
                                            change: fnIsEmpty(api.HCP_STATE) ? "" : api.HCP_STATE,
                                            request_type: api.REQ_TYPE
                                        });
                                    }

                                    if (!fnIsEmpty(api.HCP_ZIP5) && zip !== api.HCP_ZIP5) {
                                        array_list.push({
                                            value: "Zip Code",
                                            original: zip,
                                            change: fnIsEmpty(api.HCP_ZIP5) ? "" : api.HCP_ZIP5,
                                            request_type: api.REQ_TYPE
                                        });
                                    }
                                }
                            }
                            
                            if (!fnIsEmpty(api.HCP_NPI_ID) && npi !== api.HCP_NPI_ID) {
                                array_list.push({
                                    value: "NPI",
                                    original: npi,
                                    change: fnIsEmpty(api.HCP_NPI_ID) ? "" : api.HCP_NPI_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_SHS_ID) && shs_id !== api.HCP_SHS_ID) {
                                array_list.push({
                                    value: "SHS",
                                    original: shs_id,
                                    change: fnIsEmpty(api.HCP_SHS_ID) ? "" : api.HCP_SHS_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_CRM_ID) && crm_id !== api.HCP_CRM_ID) {
                                array_list.push({
                                    value: "CRM ID",
                                    original: crm_id,
                                    change: fnIsEmpty(api.HCP_CRM_ID) ? "" : api.HCP_CRM_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_AMA_ID) && ama !== api.HCP_AMA_ID) {
                                array_list.push({
                                    value: "ME ID",
                                    original: ama,
                                    change: fnIsEmpty(api.HCP_AMA_ID) ? "" : api.HCP_AMA_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }
    
                            if (!fnIsEmpty(api.HCP_DEA_ID) && dea !== api.HCP_DEA_ID) {
                                array_list.push({
                                    value: "DEA",
                                    original: dea,
                                    change: fnIsEmpty(api.HCP_DEA_ID) ? "" : api.HCP_DEA_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_AOA_ID) && aoa !== api.HCP_AOA_ID) {
                                array_list.push({
                                    value: "AOA",
                                    original: aoa,
                                    change: fnIsEmpty(api.HCP_AOA_ID) ? "" : api.HCP_AOA_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_ADA_ID) && ada !== api.HCP_ADA_ID) {
                                array_list.push({
                                    value: "ADA",
                                    original: ada,
                                    change: fnIsEmpty(api.HCP_ADA_ID) ? "" : api.HCP_ADA_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_AAPA_ID) && aapa !== api.HCP_AAPA_ID) {
                                array_list.push({
                                    value: "AAPA",
                                    original: aapa,
                                    change: fnIsEmpty(api.HCP_AAPA_ID) ? "" : api.HCP_AAPA_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_ACNM_ID) && acnm !== api.HCP_ACNM_ID) {
                                array_list.push({
                                    value: "ACNM",
                                    original: acnm,
                                    change: fnIsEmpty(api.HCP_ACNM_ID) ? "" : api.HCP_ACNM_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_MSCHST_ID) && mschst !== api.HCP_MSCHST_ID) {
                                array_list.push({
                                    value: "MSCHST",
                                    original: mschst,
                                    change: fnIsEmpty(api.HCP_MSCHST_ID) ? "" : api.HCP_MSCHST_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_AOPA_ID) && aopa !== api.HCP_AOPA_ID) {
                                array_list.push({
                                    value: "AOPA",
                                    original: aopa,
                                    change: fnIsEmpty(api.HCP_AOPA_ID) ? "" : api.HCP_AOPA_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_MEDICAID_ID) && medicaid !== api.HCP_MEDICAID_ID) {
                                array_list.push({
                                    value: "MEDICAID",
                                    original: medicaid,
                                    change: fnIsEmpty(api.HCP_MEDICAID_ID) ? "" : api.HCP_MEDICAID_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_UPIN_ID) && upin !== api.HCP_UPIN_ID) {
                                array_list.push({
                                    value: "UPIN",
                                    original: upin,
                                    change: fnIsEmpty(api.HCP_UPIN_ID) ? "" : api.HCP_UPIN_ID,
                                    request_type: api.REQ_TYPE
                                });
                            }

                            if (!fnIsEmpty(api.HCP_FED_TAX_ID) && fed_tax !== api.HCP_FED_TAX_ID) {
                                array_list.push({
                                    value: "FED TAX",
                                    original: fed_tax,
                                    change: fnIsEmpty(api.HCP_FED_TAX_ID) ? "" : api.HCP_FED_TAX_ID,
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
                console.log("fnLoadClientChangeRequestData error", error);
            }
        });
    }
    
    // Update Customer Known Address
    function fnUpdateCustomerKnownAddress() {
        $(document).on("click", ".btn-save-change-customer-known-address", function () {
            var url_source = $("#change-request-source").val();
            var url_params = {};
            var array_known_address = [];
            var hcp_mdm_id = $("#user-object-id").val();

            if (fnIsEmpty($("#customer-known-address-addressline1").val()) && fnIsEmpty($("#customer-known-address-city").val()) &&
                fnIsEmpty($("#customer-known-address-state").val()) && fnIsEmpty($("#customer-known-address-zipcode").val())) {
                console.log("Add address");
            } else if (!fnIsEmpty($("#customer-known-address-addressline1").val()) || !fnIsEmpty($("#customer-known-address-addressline2").val()) || !fnIsEmpty($("#customer-known-address-city").val()) ||
                       !fnIsEmpty($("#customer-known-address-state").val()) || !fnIsEmpty($("#customer-known-address-zipcode").val()) || $("input[type=checkbox]").is(":checked")) {
                url_params = {
                    HCP_LAST_NAME: $("#customer-known-address-lname").val(),
                    HCP_MIDDLE_NAME: $("#customer-known-address-mname").val(),
                    HCP_FIRST_NAME: $("#customer-known-address-fname").val(),
                    HCP_ADDR_1: $("#customer-known-address-addressline1").val(),
                    HCP_ADDR_2: $("#customer-known-address-addressline2").val(),
                    HCP_CITY: $("#customer-known-address-city").val(),
                    HCP_STATE: $("#customer-known-address-state").val(),
                    HCP_ZIP5: $("#customer-known-address-zipcode").val()
                };

                var queryString = $.param(url_params);

                // Add New Address
                var req_type = "HCPNA";

                // Modify Primary Address
                if ($("input[type=checkbox]").is(":checked")) {
                    url_source = $("#change-request-source-primary").val();
                    req_type = "HCPMPA";
                }

                array_known_address.push({ type: req_type, source: url_source, params: queryString });
            }

            console.log("array_known_address", array_known_address);

            var session_username = JSON.parse(sessionStorage.getItem("userObject")).username;

            if (array_known_address.length > 0) {
                $.each(array_known_address, function (index, i) {
                    var settings = {
                        "url": `https://.../api/v1/changerequests/create?req_type=${i.type}&source=${i.source}&HCP_MDM_ID=${hcp_mdm_id}&${i.params}&SRC_CR_USER=${session_username}`,
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
                            $('#modalEditCustomerKnownAddress').modal('hide');

                            // Show flag
                            fnFlagUpdatedValueById(hcp_mdm_id, "", true);
                        })
                        .fail(function (response) {
                            console.log("error", response.responseJSON);
                        });
                });
            }
        });
    }
});