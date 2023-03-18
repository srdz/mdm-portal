using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MDM_Portal.Models
{
    public class ObjResponseModel
    {
        public string transaction_id { get; set; }
        public string name { get; set; }
        public string client_id { get; set; }
        public string creation_date { get; set; }
        public string submitted_date { get; set; }
        public string received_date { get; set; }
        public string change_field { get; set; }
        public string change_old_value { get; set; }
        public string change_new_value { get; set; }
        public object sent_info { get; set; }
        public object receive_info { get; set; }
        public object project { get; set; }
    }
}