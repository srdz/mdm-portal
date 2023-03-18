using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MDM_Portal.Models
{
    public class ResetPasswordModel
    {
        public string newpassword { get; set; }
        public string confirmpassword { get; set; }
        public string resetcode { get; set; }
    }
}