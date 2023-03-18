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

    fnLoadChangeRequestDetailsInformation();

    // Get change request full detail
    function fnLoadChangeRequestDetailsInformation() {
        $.ajax({
            type: "POST",
            url: "/Home/GetChangeRequestDetailsInformation",
            dataType: "json",
            data: { "cr_id": $("#cr-id").val() },
            beforeSend: function () {
                $(".loader").show();
                $(".loader").css("z-index", 20);
                $("#content-wrapper").css("opacity", 0.1);
            },
            success: function (data) {
                if (data != null) {
                    if (data.status != "success") {
                        console.log("fnLoadChangeRequestDetailsInformation on error", error.error);
                    } else {
                        var cr_html = "";
                        var cr_creation_date = "";
                        var customer_html = "";
                        var account_html = "";
                        var affiliation_html = "";

                        $.each(data.success, function (index, el) {
                            if (el.CR_EXCEPTION_STATUS == "True") {
                                $("#exceptions_buttons_details").show();
                            } else if (el.CR_EXCEPTION_STATUS == "False") {
                                $("#exceptions_buttons_details").hide();
                            }

                            if (!fnIsEmpty(el.CR_CREATION_DATE)) {
                                var regExp = /\(([^)]+)\)/;
                                var matches = regExp.exec(el.CR_CREATION_DATE);
                                cr_creation_date = moment(new Date(parseInt(matches[1]))).add(1, 'days').format('YYYY-MM-DD');
                            }

                            // Change Request
                            cr_html = `<p><strong>ID:</strong> ${el.CR_ID}</p>`;
                            cr_html += `<p><strong>Source Name:</strong> ${el.SRC_NAME}</p>`;
                            cr_html += `<p><strong>Source ID:</strong> ${el.SRC_CR_ID}</p>`;
                            cr_html += `<p><strong>User Requester:</strong> ${el.SRC_CR_USER}</p>`;
                            cr_html += `<p><strong>Requester Territory ID:</strong> ${el.SRC_CR_USER_TERR_ID}</p>`;
                            cr_html += `<p><strong>Requester Territory Name:</strong> ${el.SRC_CR_USER_TERR_NAME}</p>`;
                            cr_html += `<p><strong>Creation Date:</strong> ${cr_creation_date}</p>`;
                            cr_html += `<p><strong>HCP/Physician Identifier:</strong> ${el.SRC_HCP_ID}</p>`;
                            cr_html += `<p><strong>HCO/Facility Identifier:</strong> ${el.SRC_HCO_ID}</p>`;
                            cr_html += `<p><strong>Affiliation Identifier:</strong> ${el.SRC_AFF_ID}</p>`;
                            cr_html += `<p><strong>Request Type:</strong> ${el.REQ_TYPE}</p>`;
                            cr_html += `<p><strong>Comment:</strong> ${el.CR_MDM_COMMENT}</p>`;
                            cr_html += `<p><strong>User Comment:</strong> ${el.SRC_CR_USER_COMMENT}</p>`;
                            cr_html += `<p><strong>Type:</strong> ${el.CR_TYPE}</p>`;
                            cr_html += `<p><strong>Status:</strong> ${el.CR_STATUS}</p>`;
                            cr_html += `<p><strong>Stewardship ID:</strong> ${el.CR_STEWARDSHIP_ID}</p>`;
                            cr_html += `<p><strong>Exception Status:</strong> ${el.CR_EXCEPTION_STATUS}</p>`;
                            cr_html += `<p><strong>Exception Description/Reason:</strong> ${el.CR_EXCEPTION_CREATED}</p>`;
                            cr_html += `<p><strong>Validation:</strong> ${el.CR_EXCEPTION_DESC}</p>`;
                            cr_html += `<p><strong>Indicator:</strong> ${el.CR_EXCEPTION_ACTION}</p>`;
                            cr_html += `<p><strong>Processed Request:</strong> ${el.CR_EXCEPTION_PROCESSED}</p>`;
                            cr_html += `<p><strong>Processed Date:</strong> ${el.CR_PROCESSED_DATE}</p>`;

                            // Customer
                            customer_html = `<p><strong>HCP ID:</strong> ${el.HCP_MDM_ID}</p>`;
                            customer_html += `<p><strong>Name:</strong> ${!fnIsEmpty(el.HCP_MIDDLE_NAME) ? el.HCP_FIRST_NAME + " " + el.HCP_MIDDLE_NAME + " " + el.HCP_LAST_NAME : el.HCP_FIRST_NAME + " " + el.HCP_LAST_NAME}</p>`;
                            customer_html += `<p><strong>Address Line 1:</strong> ${el.HCP_ADDR_1}</p>`;
                            customer_html += `<p><strong>Address Line 2:</strong> ${el.HCP_ADDR_2}</p>`;
                            customer_html += `<p><strong>City:</strong> ${el.HCP_CITY}</p>`;
                            customer_html += `<p><strong>State:</strong> ${el.HCP_STATE}</p>`;
                            customer_html += `<p><strong>Zip 5:</strong> ${el.HCP_ZIP5}</p>`;
                            customer_html += `<p><strong>Zip 4:</strong> ${el.HCP_ZIP4}</p>`;
                            customer_html += `<p><strong>Address Latitude:</strong> ${el.HCP_ADDR_LAT}</p>`;
                            customer_html += `<p><strong>Address Longitude:</strong> ${el.HCP_ADDR_LON}</p>`;
                            customer_html += `<p><strong>Address ID:</strong> ${el.HCP_ADDRESS_ID}</p>`;
                            customer_html += `<p><strong>Address CASS Validation:</strong> ${!fnIsEmpty(el.HCP_CASS_VAL) ? (el.HCP_CASS_VAL == 1 ? "Validated" : "Not Validated") : ""}</p>`;
                            customer_html += `<p><strong>Primary Specialty:</strong> ${el.HCP_PRY_SPECIALTY}</p>`;
                            customer_html += `<p><strong>Primary Specialty Group:</strong> ${el.HCP_PRY_SPE_GRP}</p>`;
                            customer_html += `<p><strong>Secondary Specialty:</strong> ${el.HCP_SEC_SPECIALTY}</p>`;
                            customer_html += `<p><strong>Secondary Specialty Group:</strong> ${el.HCP_PRY_SPE_GRP}</p>`;
                            customer_html += `<p><strong>Credentials:</strong> ${el.HCP_CREDENTIALS}</p>`;
                            customer_html += `<p><strong>School Name:</strong> ${el.HCP_SCHOOL_NAME}</p>`;
                            customer_html += `<p><strong>Graduation Year:</strong> ${el.HCP_GRDTN_YEAR}</p>`;
                            customer_html += `<p><strong>Year of Birth:</strong> ${el.HCP_YOB}</p>`;
                            customer_html += `<p><strong>Year of Death:</strong> ${el.HCP_YOD}</p>`;
                            customer_html += `<p><strong>Status:</strong> ${el.HCP_STATUS}</p>`;
                            customer_html += `<p><strong>CMS NPI:</strong> ${el.HCP_NPI_ID}</p>`;
                            customer_html += `<p><strong>CRM ID:</strong> ${el.HCP_CRM_ID}</p>`;
                            customer_html += `<p><strong>SHS ID:</strong> ${el.HCP_SHS_ID}</p>`;
                            customer_html += `<p><strong>Open Data ID:</strong> ${el.HCP_OPENDATA_ID}</p>`;
                            customer_html += `<p><strong>One Key ID:</strong> ${el.HCP_ONEKEY_ID}</p>`;
                            customer_html += `<p><strong>American Medical Association ME#:</strong> ${el.HCP_AMA_ID}</p>`;
                            customer_html += `<p><strong>Drug Enforcement Agency ID:</strong> ${el.HCP_DEA_ID}</p>`;
                            customer_html += `<p><strong>American Osteopathic Association ID:</strong> ${el.HCP_AOA_ID}</p>`;
                            customer_html += `<p><strong>American Dental Association ID:</strong> ${el.HCP_ADA_ID}</p>`;
                            customer_html += `<p><strong>American Academy of Physician Assistants ID:</strong> ${el.HCP_AAPA_ID}</p>`;
                            customer_html += `<p><strong>ACNM ID:</strong> ${el.HCP_ACNM_ID}</p>`;
                            customer_html += `<p><strong>Massachuset ID:</strong> ${el.HCP_MSCHST_ID}</p>`;
                            customer_html += `<p><strong>AOPA ID:</strong> ${el.HCP_AOPA_ID}</p>`;
                            customer_html += `<p><strong>Medicaid ID:</strong> ${el.HCP_MEDICAID_ID}</p>`;
                            customer_html += `<p><strong>Unique Physician Identification Number :</strong> ${!fnIsEmpty(el.HCP_UPIN) ? el.HCP_UPIN : ""}</p>`;
                            customer_html += `<p><strong>Federal Tax ID:</strong> ${el.HCP_FED_TAX_ID}</p>`;
                            customer_html += `<p><strong>State License Number :</strong> ${el.HCP_SLN}</p>`;
                            customer_html += `<p><strong>American Podiatric Medical Association ID:</strong> ${el.HCP_APMA_ID}</p>`;
                            customer_html += `<p><strong>HCP Target Flag:</strong> ${!fnIsEmpty(el.HCP_TARGET_VAL) ? el.HCP_TARGET_VAL : ""}</p>`;
                            customer_html += `<p><strong>Decile Value:</strong> ${!fnIsEmpty(el.HCP_DECILE_VAL) ? el.HCP_DECILE_VAL : ""}</p>`;
                            customer_html += `<p><strong>Target Tier:</strong> ${el.HCP_TIER}</p>`;
                            customer_html += `<p><strong>Fax Number:</strong> ${el.HCP_FAX}</p>`;
                            customer_html += `<p><strong>Email Address:</strong> ${el.HCP_EMAIL}</p>`;
                            customer_html += `<p><strong>Phone Number:</strong> ${el.HCP_PHONE}</p>`;
                            customer_html += `<p><strong>URL:</strong> ${el.HCP_URL}</p>`;
                            customer_html += `<p><strong>PDRP OPT-OUT Flag:</strong> ${!fnIsEmpty(el.HCP_PDRP_OPT_OUT) ? (el.HCP_PDRP_OPT_OUT == 1 ? "Opt Out" : "No Opt Out") : ""}</p>`;
                            customer_html += `<p><strong>PDRP OPT-OUT Date:</strong> ${el.HCP_PDRP_OPT_DATE}</p>`;
                            customer_html += `<p><strong>PDRP No Contact Flag:</strong> ${!fnIsEmpty(el.HCP_PDRP_NO_CONTACT) ? (el.HCP_PDRP_NO_CONTACT == 1 ? "No Contact" : "Contact") : ""}</p>`;

                            // Account
                            account_html = `<p><strong>Facility ID:</strong> ${el.HCO_MDM_ID}</p>`;
                            account_html += `<p><strong>Facility Name:</strong> ${el.HCO_NAME}</p>`;
                            account_html += `<p><strong>Address Line 1:</strong> ${el.HCO_ADDR_1}</p>`;
                            account_html += `<p><strong>Address Line 2:</strong> ${el.HCO_ADDR_2}</p>`;
                            account_html += `<p><strong>City:</strong> ${el.HCO_CITY}</p>`;
                            account_html += `<p><strong>State:</strong> ${el.HCO_STATE}</p>`;
                            account_html += `<p><strong>Zip 5:</strong> ${el.HCO_ZIP5}</p>`;
                            account_html += `<p><strong>Zip 4:</strong> ${el.HCO_ZIP4}</p>`;
                            account_html += `<p><strong>Address ID:</strong> ${el.HCO_ADDRESS_ID}</p>`;
                            account_html += `<p><strong>Address CASS Validation:</strong> ${!fnIsEmpty(el.HCO_USPS_VAL) ? (el.HCO_USPS_VAL == 1 ? "Validate" : "Not Validated") : ""}</p>`;
                            account_html += `<p><strong>Class of Trade:</strong> ${el.HCO_COT}</p>`;
                            account_html += `<p><strong>Primary Specialty:</strong> ${el.HCO_PRY_SPECIALTY}</p>`;
                            account_html += `<p><strong>Primary Specialty Group:</strong> ${el.HCO_PRY_SPE_GRP}</p>`;
                            account_html += `<p><strong>Secondary Specialty:</strong> ${el.HCO_SEC_SPECIALTY}</p>`;
                            account_html += `<p><strong>Secondary Specialty Group:</strong> ${el.HCO_SEC_SPE_GRP}</p>`;
                            account_html += `<p><strong>Facility Cot:</strong> ${el.HCO_COT}</p>`;
                            account_html += `<p><strong>Facility Cot Group:</strong> ${el.HCO_COT_GRP}</p>`;
                            account_html += `<p><strong>CRM ID:</strong> ${el.HCO_CRM_ID}</p>`;
                            account_html += `<p><strong>SHS ID:</strong> ${el.HCO_SHS_ID}</p>`;
                            account_html += `<p><strong>Open Data ID:</strong> ${el.HCO_OPENDATA_ID}</p>`;
                            account_html += `<p><strong>One Key ID:</strong> ${el.HCO_ONEKEY_ID}</p>`;
                            account_html += `<p><strong>CMS NPI #:</strong> ${!fnIsEmpty(el.HCO_NPI) ? el.HCO_NPI : ""}</p>`;
                            account_html += `<p><strong>Drug Enforcement Agency ID:</strong> ${!fnIsEmpty(el.HCO_DEA) ? el.HCO_DEA : ""}</p>`;
                            account_html += `<p><strong>Health Industry Number (HIN):</strong> ${el.HCO_HIN_ID}</p>`;
                            account_html += `<p><strong>DUNS:</strong> ${!fnIsEmpty(el.HCO_DUNS) ? el.HCO_DUNS : ""}</p>`;
                            account_html += `<p><strong>Point of Service ID:</strong> ${el.HCO_POS_ID}</p>`;
                            account_html += `<p><strong>Federal Tax ID:</strong> ${el.HCO_FED_TAX_ID}</p>`;
                            account_html += `<p><strong>Global Location Number:</strong> ${el.HCO_GLN_ID}</p>`;
                            account_html += `<p><strong>340B:</strong> ${el.HCO_340B}</p>`;
                            account_html += `<p><strong>Status:</strong> ${el.HCO_STATUS}</p>`;
                            account_html += `<p><strong>Type:</strong> ${el.HCO_FACILITY_TYPE}</p>`;
                            account_html += `<p><strong>Target Value:</strong> ${!fnIsEmpty(el.HCO_TARGET_VALUE) ? (el.HCO_TARGET_VALUE == 1 ? "Target" : "No Target") : ""}</p>`;
                            account_html += `<p><strong>Decile:</strong> ${!fnIsEmpty(el.HCO_DECILE_VAL) ? el.HCO_DECILE_VAL : ""}</p>`;
                            account_html += `<p><strong>Target Tier:</strong> ${el.HCO_TIER}</p>`;
                            account_html += `<p><strong>Type:</strong> ${el.HCO_FACILITY_TYPE}</p>`;
                            account_html += `<p><strong>Fax Number:</strong> ${el.HCO_FAX}</p>`;
                            account_html += `<p><strong>Phone Number:</strong> ${el.HCO_PHONE}</p>`;
                            account_html += `<p><strong>Email Address:</strong> ${el.HCO_EMAIL}</p>`;
                            account_html += `<p><strong>URL:</strong> ${el.HCO_URL}</p>`;

                            // Affiliation
                            affiliation_html = `<p><strong>ID:</strong> ${el.AFF_ID}</p>`;
                            affiliation_html += `<p><strong>Child Type:</strong> ${el.AFF_CHILD_TYPE}</p>`;
                            affiliation_html += `<p><strong>Child ID:</strong> ${el.AFF_CHILD_ID}</p>`;
                            affiliation_html += `<p><strong>Other Child ID:</strong> ${el.AFF_SRC_CHILD_ID}</p>`;
                            affiliation_html += `<p><strong>Other Child Type:</strong> ${el.AFF_CHILD_OTH_ID_TYPE}</p>`;
                            affiliation_html += `<p><strong>Other Child:</strong> ${el.AFF_CHILD_OTH_ID_VAL}</p>`;
                            affiliation_html += `<p><strong>Parent Requester ID:</strong> ${el.AFF_PARENT_ID}</p>`;
                            affiliation_html += `<p><strong>Parent Requester Type:</strong> ${el.AFF_PARENT_TYPE}</p>`;
                            affiliation_html += `<p><strong>Other Parent Requester ID:</strong> ${el.AFF_PARENT_OTH_ID_TYPE}</p>`;
                            affiliation_html += `<p><strong>Other Parent Requester:</strong> ${el.AFF_PARENT_OTH_ID_VAL}</p>`;
                            affiliation_html += `<p><strong>Parent Source ID:</strong> ${el.AFF_SRC_PARENT_ID}</p>`;
                            affiliation_html += `<p><strong>Start Date:</strong> ${el.AFF_START_DATE}</p>`;
                            affiliation_html += `<p><strong>End Date:</strong> ${el.AFF_END_DATE}</p>`;
                            affiliation_html += `<p><strong>Type:</strong> ${el.AFF_TYPE}</p>`;
                            affiliation_html += `<p><strong>Description:</strong> ${el.AFF_DESCRIPTION}</p>`;
                        });

                        $("#change-request-detail").html(cr_html);
                        $("#customer-detail").html(customer_html);
                        $("#account-detail").html(account_html);
                        $("#affiliation-detail").html(affiliation_html);
                    }
                }
            },
            error: function (error) {
                console.log("fnLoadChangeRequestDetailsInformation on error", error);
            },
            complete: function () {
                $(".loader").hide();
                $("#content-wrapper").css("opacity", "");
            }
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

    // GetChangeRequestID
    function fnGetChangeRequestID(cr_id) {
        var result = "";

        if (!fnIsEmpty(cr_id)) {
            $.ajax({
                url: "/Home/GetChangeRequestID",
                type: "POST",
                data: { cr_id: cr_id },
                async: false,
                success: function (data) {
                    if (data != null) {
                        if (data.error) {
                            console.log("fnGetChangeRequestID on success error", data.error);
                        } else {
                            result = data.success[0]._id;
                        }
                    }
                },
                error: function (error) {
                    console.log("fnGetChangeRequestID error", error);
                }
            });
        }

        return result;
    }

    // Manage exception
    $(document).on('click', '.btn-exception', function () {
        if (!fnIsEmpty($(this).val())) {
            var str = $(this).val().split("|");
            var val = str[0].trim();
            var id = str[1].trim();

            id = fnGetChangeRequestID(id);

            // confirm modal box
            $('#modal-confirmation').modal('show');
            $("#yes_no_confirmation").html(`<strong>${val}</strong>`);
            $("#exception_description_modal").html($("#exception-description").val());

            $(document).on('click', '.btn-confirmation', function () {
                if ($(this).val() == "Yes") {
                    fnManageExceptions(id, val);
                    fnLoadChangeRequestDetailsInformation();

                    $('#modal-confirmation').modal('hide');
                } else if ($(this).val() == "No") {
                    $('#modal-confirmation').modal('hide');
                }
            });
        }
    });
});