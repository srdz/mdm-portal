using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MDM_Portal.Models
{
    public class StewardshipObjectResponse
    {
        public string Source { get; set; }
        public string CRM_info_dcr_id { get; set; }
        public string CRM_info_dcr_line_id { get; set; }
        public string CRM_ID { get; set; }
        public string CRM_info_Address_ID_old { get; set; }
        public string CRM_info_Address_ID_new { get; set; }
        public string Change_info_field { get; set; }
        public string Change_info_old_value { get; set; }
        public string Change_info_new_value { get; set; }
        public string Sent_info_customer { get; set; }
        public string Sent_info_record_type { get; set; }
        public string Sent_info_name { get; set; }
        public string Sent_info_suffix_name { get; set; }
        public string Sent_info_first_name { get; set; }
        public string Sent_info_middle_name { get; set; }
        public string Sent_info_last_name { get; set; }
        public string Sent_info_gender { get; set; }
        public string Sent_info_credentials { get; set; }
        public string Sent_info_npi { get; set; }
        public string Sent_info_primary_specialty { get; set; }
        public string Sent_info_secondary_specialty { get; set; }
        public string Sent_info_address_line_1 { get; set; }
        public string Sent_info_address_line_2 { get; set; }
        public string Sent_info_city { get; set; }
        public string Sent_info_state { get; set; }
        public string Sent_info_postal_code { get; set; }
        public string Sent_info_country { get; set; }
        public string Sent_info_phone { get; set; }
        public string Sent_info_email { get; set; }
        public string Sent_info_website { get; set; }
        public string Sent_info_primary { get; set; }
        public string Sent_info_last_updated_date { get; set; }
        public string Sent_info_organization { get; set; }
        public string Received_info_customer { get; set; }
        public string Received_info_name { get; set; }
        public string Received_info_first_name { get; set; }
        public string Received_info_last_name { get; set; }
        public string Received_info_middle_name { get; set; }
        public string Received_info_suffix_name { get; set; }
        public string Received_info_gender { get; set; }
        public string Received_info_credentials { get; set; }
        public string Received_info_hcp_type { get; set; }
        public string Received_info_npi { get; set; }
        public string Received_info_email { get; set; }
        public string Received_info_phone { get; set; }
        public string Received_info_phone_extension { get; set; }
        public string Received_info_website { get; set; }
        public string Received_info_primary_specialty { get; set; }
        public string Received_info_secondary_specialty { get; set; }
        public string Received_info_institution_name { get; set; }
        public string Received_info_address_line_1 { get; set; }
        public string Received_info_address_line_2 { get; set; }
        public string Received_info_city { get; set; }
        public string Received_info_state { get; set; }
        public string Received_info_postal_code { get; set; }
        public string Received_info_country_code { get; set; }
        public string Received_info_primary_original { get; set; }
        public string Received_info_primary_address_flag { get; set; }
        public string Received_info_reason_for_marketing_as_duplicate { get; set; }
        public string Received_info_online_validation_status { get; set; }
        public string Received_info_online_validation_timestamp { get; set; }
        public string Received_info_phone_validation_status { get; set; }
        public string Received_info_phone_validation_timestamp { get; set; }
        public string Received_info_comments { get; set; }
        public string Stewardship_status_created { get; set; }
        public string Stewardship_status_submitted { get; set; }
        public string Stewardship_status_received { get; set; }
        public string Update_CRM { get; set; }
        public string Update_MDM { get; set; }
        public string Update_error { get; set; }
        public string Result_valid { get; set; }
        public string Result_sent_to_client { get; set; }
        public string Project { get; set; }
    }
}