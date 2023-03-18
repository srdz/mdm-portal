using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MDM_Portal.Models
{
    public class StewardshipObjectModel
    {
        public object npi { get; set; }
        public object name { get; set; }
        public object address { get; set; }
        public object institution_name { get; set; }
        public object created_date { get; set; }
        public object received_date { get; set; }
        public object specialty { get; set; }
        public object credentials { get; set; }
        public object online_validation_status { get; set; }

        //public object project { get; set; }
        //public object source { get; set; }
    }
}