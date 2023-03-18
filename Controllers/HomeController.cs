using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Core;
using System.Configuration;
using MDM_Portal.App_Start;
using MDM_Portal.Models;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using static MDM_Portal.Models.ChartsModel;
using Newtonsoft.Json.Linq;
using System.Text;
using System.Net;
using System.Web.Script.Serialization;
using System.IO;
using System.Web.Security;
using System.Net.Mail;
using System.Collections;
using System.Collections.Specialized;
using System.Linq.Expressions;
using LinqKit;
using System.Linq.Dynamic;
using System.Data.Entity;
using System.Globalization;

namespace MDM_Portal.Controllers
{
    public class HomeController : Controller
    {
        private MongoDBContext dbcontext;

        private IMongoCollection<HCPDetailsModel> detailsCollection;
        private IMongoCollection<HCPBestAddressModel> bestaddressCollection;
        private IMongoCollection<HCPUserModel> userCollection;
        private IMongoCollection<MailCredentialsModel> mailcredentialsCollection;
        private IMongoCollection<HCPTerritoryModel> territoryCollection;
        private IMongoCollection<DataStewardshipModel> dataStewardshipCollection;
        private IMongoCollection<MDMSources> sourcesCollection;
        private IMongoCollection<HCPAffiliationModel> affiiationCollection;
        private IMongoCollection<ChangeRequestsModel> changeRequestCollection;
        private IMongoCollection<HCOHospitalModel> hcoHospitalCollection;
        private IMongoCollection<SavedSearchModel> savedSearchCollection;
        private IMongoCollection<HCOBestaddressModel> hcoBestAddressCollection;
        private IMongoCollection<HCODetailsModel> hcoDetailsCollection;
        private IMongoCollection<HCOAffiliationModel> hcoAffiliationCollection;
        private IMongoCollection<HCPHCOAffiliationModel> hcphcoAffiliationCollection;
        private IMongoCollection<TokenModel> tokenCollection;

        public HomeController()
        {
            dbcontext = new MongoDBContext();

            detailsCollection = dbcontext.database.GetCollection<HCPDetailsModel>("HCP_details");
            bestaddressCollection = dbcontext.database.GetCollection<HCPBestAddressModel>("HCP_bestaddress");
            userCollection = dbcontext.database.GetCollection<HCPUserModel>("HCP_user");
            mailcredentialsCollection = dbcontext.database.GetCollection<MailCredentialsModel>("Mail_credentials");
            territoryCollection = dbcontext.database.GetCollection<HCPTerritoryModel>("HCP_territory");
            dataStewardshipCollection = dbcontext.database.GetCollection<DataStewardshipModel>("DS_portal");
            sourcesCollection = dbcontext.database.GetCollection<MDMSources>("MDM_sources");
            affiiationCollection = dbcontext.database.GetCollection<HCPAffiliationModel>("HCP_affiliation");
            changeRequestCollection = dbcontext.database.GetCollection<ChangeRequestsModel>("Change_Requests");
            hcoHospitalCollection = dbcontext.database.GetCollection<HCOHospitalModel>("HCO_hospital");
            savedSearchCollection = dbcontext.database.GetCollection<SavedSearchModel>("Saved_Search");
            hcoBestAddressCollection = dbcontext.database.GetCollection<HCOBestaddressModel>("HCO_bestaddress");
            hcoDetailsCollection = dbcontext.database.GetCollection<HCODetailsModel>("HCO_details");
            hcoAffiliationCollection = dbcontext.database.GetCollection<HCOAffiliationModel>("HCO_affiliation");
            hcphcoAffiliationCollection = dbcontext.database.GetCollection<HCPHCOAffiliationModel>("HCP_HCO_affiliation");
            tokenCollection = dbcontext.database.GetCollection<TokenModel>("Token");
        }

        public ActionResult Overview()
        {
            if (Session != null && (string)Session["username"] != "")
            {
                try
                {
                    return View();
                }
                catch (Exception e)
                {
                    object json = new { status = "error", error = e.Message };

                    return View(json);
                }
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(string username, string password)
        {
            HCPUserModel objUser = new HCPUserModel();

            if (ModelState.IsValid)
            {
                if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                {
                    bool exist = false;

                    try
                    {
                        exist = userCollection.AsQueryable().Any(u => u.username == username);
                    }
                    catch (Exception e)
                    {
                        if (e.Message.Contains("A timeout occured"))
                        {
                            object json = new { status = "error", error = "Error on authentication. Please contact the administrator." };

                            return new JsonResult { Data = json };
                        }
                    }

                    if (!exist)
                    {
                        object json = new { status = "error", error = "Invalid credential." };

                        return new JsonResult { Data = json };
                    }

                    var QuserLogin = (from u in userCollection.AsQueryable()
                                      where u.username.Equals(username) && u.password.Equals(Crypto.Hash(password))
                                      select u).FirstOrDefault();
                    try
                    {
                        if (QuserLogin.status.Equals("active"))
                        {
                            objUser._id = QuserLogin._id;
                            objUser.username = QuserLogin.username;
                            objUser.firstname = QuserLogin.firstname;
                            objUser.lastname = QuserLogin.lastname;
                            objUser.email = QuserLogin.email;
                            objUser.password = QuserLogin.password;
                            objUser.role = QuserLogin.role;
                            objUser.territory = QuserLogin.territory;
                            objUser.status = QuserLogin.status;
                            objUser.creationdate = QuserLogin.creationdate;
                            objUser.lastmodifieddate = QuserLogin.lastmodifieddate;

                            Session["_id"] = objUser._id;
                            Session["username"] = objUser.username;
                            Session["role"] = objUser.role;
                            Session["email"] = objUser.email;
                        }
                        else
                        {
                            object json = new { status = "error", error = "Your account is no longer active. Please contact the administration for any questions or concerns." };

                            return new JsonResult { Data = json };
                        }
                    }
                    catch (Exception e)
                    {
                        if (e.Message.Equals("Object reference not set to an instance of an object."))
                        {
                            object json = new { status = "error", error = "You have specified an invalid username or password. Please try again." };

                            return new JsonResult { Data = json };
                        }
                        else
                        {
                            object json = new { status = "error", error = e.Message };

                            return new JsonResult { Data = json };
                        }
                    }
                }
            }

            return View(objUser);
        }

        [HttpGet]
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            Session.Clear();
            Session.RemoveAll();
            Session.Abandon();

            return RedirectToAction("Login", "Home");
        }

        [HttpGet]
        public ActionResult Register()
        {
            if (Session != null && (string)Session["username"] != "")
            {
                return View();
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Register(string fname, string lname, string username, string email, string password, string role, string territory, string created_by)
        {
            if (Session != null && (string)Session["username"] != "")
            {
                HCPUserModel user = new HCPUserModel();
                object json;

                if (ModelState.IsValid)
                {
                    // Email exist?
                    if (IsEmailExist(email))
                    {
                        json = new { status = "error", error = "Email address already exist." };

                        return new JsonResult { Data = json };
                    }

                    // Username exist?
                    if (IsUsernameExist(username))
                    {
                        json = new { status = "error", error = "Username already exist, please try a different username." };

                        return new JsonResult { Data = json };
                    }

                    user.username = username;
                    user.email = email;
                    user.firstname = fname;
                    user.lastname = lname;
                    user.password = Crypto.Hash(password);
                    user.resetpasswordcode = "";
                    user.role = role;
                    user.territory = territory;
                    user.status = "active";
                    user.creationdate = DateTime.Now.ToString("yyyy-MM-dd");
                    user.lastmodifieddate = "";
                    user.created_by = created_by;
                    user.modified_by = "";

                    try
                    {
                        userCollection.InsertOne(user);

                        //SendVerificationLinkEmail(email, password, "");
                    }
                    catch (Exception e)
                    {
                        json = new { status = "error", error = e.Message };

                        return new JsonResult { Data = json };
                    }

                    json = new { status = "success", success = "Account created." };

                    return new JsonResult { Data = json };
                }
                else
                {
                    json = new { status = "error", error = "Error: Invalid Request" };

                    return new JsonResult { Data = json };
                }
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        public ActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        public JsonResult ForgotPassword(string email)
        {
            object json;
            bool exist = userCollection.AsQueryable().Any(x => x.email == email);

            if (!exist)
            {
                json = new { status = "error", error = "Account not found. Please validate your email address." };

                return new JsonResult { Data = json };
            }

            var u = (from uc in userCollection.AsQueryable()
                     where uc.email.Equals(email)
                     select uc).FirstOrDefault();

            string resetCode = Guid.NewGuid().ToString();

            SendVerificationLinkEmail(u.email, null, resetCode, "ResetPassword");

            var filter = Builders<HCPUserModel>.Filter.Eq(x => x.email, email);
            var update = Builders<HCPUserModel>.Update.Set(x => x.resetpasswordcode, resetCode);
            var result = userCollection.UpdateOneAsync(filter, update).Result;

            string message = "A password reset message was sent to your email address.<br/><br/>" +
                "If you do not receive the password reset message within a few moments, please check your spam folder or other filtering tools.";

            json = new { status = "success", success = message };

            return new JsonResult { Data = json };
        }

        public ActionResult ResetPassword(string id)
        {
            var user = userCollection.AsQueryable().Where(a => a.resetpasswordcode == id).FirstOrDefault();

            if (user != null)
            {
                ResetPasswordModel model = new ResetPasswordModel();
                model.resetcode = id;

                return View(model);
            }
            else
            {
                return HttpNotFound();
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult ResetPassword(ResetPasswordModel model)
        {
            object json = new { status = "", success = "" };
            string status = "";
            string response = "";

            if (ModelState.IsValid)
            {
                var user = userCollection.AsQueryable().Where(a => a.resetpasswordcode == model.resetcode).FirstOrDefault();

                if (user != null)
                {
                    var filter = Builders<HCPUserModel>.Filter.Eq(x => x.resetpasswordcode, model.resetcode);
                    var update = Builders<HCPUserModel>.Update.Set(x => x.password, Crypto.Hash(model.newpassword)).Set(x => x.resetpasswordcode, "").Set(x => x.lastmodifieddate, DateTime.Now.ToString("yyyy-MM-dd"));
                    var result = userCollection.UpdateOneAsync(filter, update).Result;

                    var uri = new Uri(Request.Url.AbsoluteUri);
                    var url = uri.Scheme + "://" + uri.Host + ":" + uri.Port + "/Home/Login";

                    response = "Your password has been changed successfully. <a href='" + url + "'>Click here<a/> to continue to the Customer Master Portal.";
                    status = "success";
                }
            }
            else
            {
                response = "Invalid";
                status = "error";
            }

            if (status.Equals("success"))
            {
                json = new { status = status, success = response };
            }
            else
            {
                json = new { status = status, error = response };
            }

            return new JsonResult { Data = json };
        }

        [HttpPost]
        public void SendVerificationLinkEmail(string email, string credential = null, string activationCode = "", string emailFor = "RegisterAccount")
        {
            var verifyUrl = "/Home/" + emailFor + "/" + activationCode;
            var link = Request.Url.AbsoluteUri.Replace(Request.Url.PathAndQuery, verifyUrl);

            var fromEmail = new MailAddress(GetEmail(), "Customer Master Portal");
            var toEmail = new MailAddress(email);
            var fromEmailPassword = GetMailCredentials();

            string subject = "";
            string body = "";
            string username = GetUsernameByEmail(email);

            if (emailFor == "RegisterAccount")
            {
                subject = "Your account has been successfully created.";
                body = "Hi " + username + ",<br/><br/>We are excited to tell you that your Customer Master Portal account have been created. Please click on the link below to access the portal." +
                    "<br/><br/>Username: " + username + "<br/> Password: " + credential +
                    "<br/><br/><br/>Sincerely,<br/>Customer Master Portal";
            }
            else if (emailFor == "ResetPassword")
            {
                subject = "Reset Password";
                body = "Hi  " + username + ",<br/><br/>We received a request to reset your password for your Customer Master Portal account: " + email + ". We're here to help!<br/><br/>" +
                    "Simply click on the link below to set a new password:<br/><br/>" +
                    "<a href='" + link + "' role='button'>Reset Password</a><br/><br/>" +
                    "If you didn't ask to change your password, don't worry! Your password is still safe and you can delete this email.<br/><br/><br/>" +
                    "Sincerely,<br/>Customer Master Portal";
            }

            var smtp = new SmtpClient
            {
                Host = "WKsmtprelay.phx.ndchealth.com", //"smtp.gmail.com",
                Port = 25, //587,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(fromEmail.Address, fromEmailPassword)
            };

            using (var message = new MailMessage(fromEmail, toEmail)
            {
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            }) smtp.Send(message);
        }

        [HttpPost]
        public ActionResult Customers(string dashboard_degree, string dashboard_specialty, string dashboard_state)
        {
            if (Session != null && (string)Session["username"] != "")
            {
                if (!string.IsNullOrEmpty(dashboard_degree))
                {
                    ViewBag.param = dashboard_degree;
                }
                else if (!string.IsNullOrEmpty(dashboard_specialty))
                {
                    ViewBag.param = dashboard_specialty;
                }
                else if (!string.IsNullOrEmpty(dashboard_state))
                {
                    ViewBag.param = dashboard_state;
                }
                else
                {
                    ViewBag.param = "";
                }

                return View();
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        public ActionResult Customers()
        {
            if (Session != null && (string)Session["username"] != "")
            {
                return View();
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        [HttpGet]
        public ActionResult MyProfile(string id)
        {
            if (Session != null && (string)Session["username"] != "")
            {
                return View();
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        [HttpPost]
        public JsonResult UpdateMyProfilePassword(string user_id, string password)
        {
            try
            {
                object json;

                if (!string.IsNullOrEmpty(user_id) && !string.IsNullOrEmpty(password))
                {
                    var filter = Builders<HCPUserModel>.Filter.Eq(x => x._id, user_id);
                    var update = Builders<HCPUserModel>.Update.Set(x => x.password, Crypto.Hash(password)).Set(x => x.lastmodifieddate, DateTime.Now.ToString("yyyy-MM-dd"));
                    var result = userCollection.UpdateOneAsync(filter, update).Result;

                    json = new { status = "success", result = result };

                    return new JsonResult { Data = json };
                }

                json = new { status = "error", error = "An error occurred while trying to update your password. Please try again or contact your administrator." };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public ActionResult CustomerProfile(string cm_hcp_id)
        {
            if (Session != null || (string)Session["username"] != "")
            {
                if (!string.IsNullOrEmpty(cm_hcp_id))
                {
                    ViewBag.param = cm_hcp_id;

                    return View();
                }
            }

            return RedirectToAction("Login");
        }

        public ActionResult ChangeRequests()
        {
            if (Session != null && (string)Session["username"] != "")
            {
                if (Session["email"].ToString().Contains("prahs"))
                {
                    return RedirectToAction("Overview");
                }

                return View();
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        public ActionResult Stewardship()
        {
            if (Session != null && (string)Session["username"] != "")
            {
                return View();
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        public ActionResult Reports()
        {
            if (Session != null && (string)Session["username"] != "")
            {
                return View();
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        public ActionResult Accounts()
        {
            if (Session != null && (string)Session["username"] != "")
            {
                return View();
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        [HttpPost]
        public ActionResult AccountsProfile(string account_id)
        {
            if (Session != null || (string)Session["username"] != "")
            {
                if (!string.IsNullOrEmpty(account_id))
                {
                    ViewBag.param = account_id;

                    return View();
                }
            }

            return RedirectToAction("Login");
        }

        public ActionResult Exceptions()
        {
            if (Session != null && (string)Session["username"] != "")
            {
                return View();
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        [HttpPost]
        public JsonResult GetMemberById(string cm_hcp_id)
        {
            var Qmember = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(cm_hcp_id))
                {
                    Qmember = from ph in detailsCollection.AsQueryable()
                              where ph.HCP_MDM_ID.Equals(cm_hcp_id)
                              select ph;
                }

                return new JsonResult { Data = Qmember };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpGet]
        public JsonResult GetMembersName()
        {
            var QmembersName = (dynamic)null;

            try
            {
                var QgetFirst = (from ba in bestaddressCollection.AsQueryable()
                                 select new { ba.name_date }).OrderByDescending(x => x.name_date).FirstOrDefault();

                if (QgetFirst != null)
                {
                    QmembersName = (from ba in bestaddressCollection.AsQueryable()
                                    where ba.name_date.Equals(QgetFirst.name_date) && !string.IsNullOrEmpty(ba.full_name)
                                    select new { ba.HCP_MDM_ID, ba.full_name, date = ba.name_date }).OrderBy(x => x.full_name);
                }

                object json = new { data = QmembersName };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpGet]
        public JsonResult TotalPhysicians()
        {
            var Qtotal = (dynamic)null;

            try
            {
                Qtotal = (from ba in bestaddressCollection.AsQueryable()
                          select ba).Count();

                object json = new { data = Qtotal };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult TotalAddresses()
        {
            List<string> list_addresses = new List<string>();

            try
            {
                foreach (var d in detailsCollection.AsQueryable())
                {
                    if (d.Address.Count > 0)
                    {
                        foreach (var a in d.Address)
                        {
                            if (!string.IsNullOrEmpty(a.Address_ID) && !string.IsNullOrEmpty(a.address_1))
                            {
                                if (!list_addresses.Contains(a.address_1))
                                {
                                    list_addresses.Add(a.address_1);
                                }
                            }
                        }
                    }
                }

                var adlist = (from a in list_addresses select a).Distinct().ToList();

                object json = new { data = adlist.Count };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult TotalSpecialties()
        {
            var Qtotal = (dynamic)null;

            try
            {
                Qtotal = (from ba in bestaddressCollection.AsQueryable()
                          select new { ba.specialty }).Distinct().Count();

                object json = new { data = Qtotal };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult TotalInactiveRecord()
        {
            var Qtotal = (dynamic)null;

            try
            {
                Qtotal = (from ba in bestaddressCollection.AsQueryable()
                          where ba.status.Equals("Inactive")
                          select new { ba.HCP_MDM_ID }).Distinct().Count();

                object json = new { data = Qtotal };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public JsonResult GetMemberByName(string name)
        {
            var QmemberName = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(name))
                {
                    QmemberName = from ba in bestaddressCollection.AsQueryable()
                                  where ba.full_name.Contains(name)
                                  select ba;
                }

                return new JsonResult { Data = QmemberName };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public JsonResult FetchData(string cm_hcp_id)
        {
            var Qmember = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(cm_hcp_id))
                {
                    Qmember = from d in detailsCollection.AsQueryable()
                              where d.HCP_MDM_ID.Equals(cm_hcp_id)
                              select d;
                }

                return new JsonResult { Data = Qmember };
            }
            catch (Exception e)
            {
                return new JsonResult { Data = e };
            }
        }

        [HttpGet]
        public JsonResult GetAllSpecialties()
        {
            try
            {
                var Qspecialties = (from sp in bestaddressCollection.AsQueryable()
                                    where !string.IsNullOrEmpty(sp.specialty)
                                    select new { sp.specialty }).Distinct().OrderBy(x => x.specialty);

                object json = new { data = Qspecialties };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetAllDegrees()
        {
            try
            {
                var Qdegrees = (from dg in bestaddressCollection.AsQueryable()
                                select new { dg.degree }).Distinct().OrderBy(x => x.degree);

                object json = new { data = Qdegrees };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetAllStates()
        {
            try
            {
                Dictionary<string, string> states = new Dictionary<string, string>();

                states.Add("AL", "Alabama");
                states.Add("AK", "Alaska");
                states.Add("AZ", "Arizona");
                states.Add("AR", "Arkansas");
                states.Add("CA", "California");
                states.Add("CO", "Colorado");
                states.Add("CT", "Connecticut");
                states.Add("DE", "Delaware");
                states.Add("DC", "District of Columbia");
                states.Add("FL", "Florida");
                states.Add("GA", "Georgia");
                states.Add("HI", "Hawaii");
                states.Add("ID", "Idaho");
                states.Add("IL", "Illinois");
                states.Add("IN", "Indiana");
                states.Add("IA", "Iowa");
                states.Add("KS", "Kansas");
                states.Add("KY", "Kentucky");
                states.Add("LA", "Louisiana");
                states.Add("ME", "Maine");
                states.Add("MD", "Maryland");
                states.Add("MA", "Massachusetts");
                states.Add("MI", "Michigan");
                states.Add("MN", "Minnesota");
                states.Add("MS", "Mississippi");
                states.Add("MO", "Missouri");
                states.Add("MT", "Montana");
                states.Add("NE", "Nebraska");
                states.Add("NV", "Nevada");
                states.Add("NH", "New Hampshire");
                states.Add("NJ", "New Jersey");
                states.Add("NM", "New Mexico");
                states.Add("NY", "New York");
                states.Add("NC", "North Carolina");
                states.Add("ND", "North Dakota");
                states.Add("OH", "Ohio");
                states.Add("OK", "Oklahoma");
                states.Add("OR", "Oregon");
                states.Add("PA", "Pennsylvania");
                states.Add("RI", "Rhode Island");
                states.Add("SC", "South Carolina");
                states.Add("SD", "South Dakota");
                states.Add("TN", "Tennessee");
                states.Add("TX", "Texas");
                states.Add("UT", "Utah");
                states.Add("VT", "Vermont");
                states.Add("VA", "Virginia");
                states.Add("WA", "Washington");
                states.Add("WV", "West Virginia");
                states.Add("WI", "Wisconsin");
                states.Add("WY", "Wyoming");

                var json = JsonConvert.SerializeObject(states);

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetAllPhysicians()
        {
            try
            {
                var Qphysicians = from b in bestaddressCollection.AsQueryable()
                                  where !b.HCP_MDM_ID.Equals("unasigned")
                                  select b;

                object json = new { data = Qphysicians };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetAllSources()
        {
            try
            {
                var Qsources = from b in sourcesCollection.AsQueryable()
                               select new
                               {
                                   b.source,
                                   b.color
                               };

                object json = new { data = Qsources };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public JsonResult GetUserObject(string user_id)
        {
            try
            {
                if (!string.IsNullOrEmpty(user_id))
                {
                    var QuserObject = (from u in userCollection.AsQueryable()
                                       where u._id.Equals(user_id)
                                       select u).FirstOrDefault();

                    return new JsonResult { Data = QuserObject };
                }
                else
                {
                    object json = new { status = "error", error = "User object is empty" };

                    return new JsonResult { Data = json };
                }
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpGet]
        public JsonResult GetAllTerritory()
        {
            try
            {
                var Qterritories = (from t in territoryCollection.AsQueryable()
                                    where !t.Territory_ID.Equals("00000")
                                    select t).OrderBy(x => x.Territory_Name);

                object json = new { data = Qterritories };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetAllStatus()
        {
            try
            {
                var query = (from ba in bestaddressCollection.AsQueryable()
                             select new { ba.status }).Distinct().OrderBy(x => x.status);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public bool IsEmailExist(string email)
        {
            var v = userCollection.AsQueryable().Where(x => x.email == email).FirstOrDefault();

            return v != null;
        }

        [HttpPost]
        public bool IsUsernameExist(string username)
        {
            var v = userCollection.AsQueryable().Where(x => x.username == username).FirstOrDefault();

            return v != null;
        }

        [HttpGet]
        public string GetUsernameByEmail(string email)
        {
            var v = userCollection.AsQueryable().Where(x => x.email == email).FirstOrDefault();

            return v.username;
        }

        [HttpGet]
        public string GetMailCredentials()
        {
            return mailcredentialsCollection.AsQueryable().FirstOrDefault().password;
        }

        [HttpGet]
        public string GetEmail()
        {
            return mailcredentialsCollection.AsQueryable().FirstOrDefault().email;
        }

        [HttpPost]
        public JsonResult GetBestAddressInformation(string cm_hcp_id)
        {
            try
            {
                var QprimaryData = (dynamic)null;

                if (!string.IsNullOrEmpty(cm_hcp_id))
                {
                    QprimaryData = from ba in bestaddressCollection.AsQueryable()
                                   where ba.HCP_MDM_ID.Equals(cm_hcp_id)
                                   select ba;
                }

                object json = new { status = "success", success = QprimaryData };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public JsonResult GetCoLocatedHCPs(string address_1)
        {
            try
            {
                var QcoLocated = (dynamic)null;

                if (!string.IsNullOrEmpty(address_1))
                {
                    QcoLocated = from ba in bestaddressCollection.AsQueryable()
                                 where ba.address_1.Equals(address_1)
                                 select ba;
                }

                object json = new { status = "success", success = QcoLocated };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpGet]
        public JsonResult GetDataStewardship()
        {
            try
            {
                List<ObjResponseModel> r = new List<ObjResponseModel>();

                var Qdata = from ds in dataStewardshipCollection.AsQueryable() select ds;

                foreach (var d in Qdata)
                {
                    r.Add(new ObjResponseModel
                    {
                        transaction_id = d.transaction_id,
                        name = (d.sent_info != null) ? (d.sent_info.MiddleName != null ? d.sent_info.FirstName + " " + d.sent_info.MiddleName + " " + d.sent_info.LastName : d.sent_info.FirstName + " " + d.sent_info.LastName) : null,
                        client_id = (d.HCP_MDM_ID != null) ? GetClientID(d.HCP_MDM_ID) : null,
                        creation_date = (d.Steward_Status != null) ? Convert.ToString(d.Steward_Status.created) : null,
                        submitted_date = (d.Steward_Status != null) ? Convert.ToString(d.Steward_Status.submitted) : null,
                        received_date = (d.Steward_Status != null) ? Convert.ToString(d.Steward_Status.received) : null,
                        change_field = (d.Change.field != null) ? d.Change.field : null,
                        change_old_value = (d.Change.old_value != null) ? d.Change.old_value : null,
                        change_new_value = (d.Change.new_value != null) ? d.Change.new_value : null,
                        sent_info = (d.sent_info.SymphonyTransactionID != null) ? d.sent_info : null,
                        receive_info = (d.receive_info.SymphonyTransactionID != null) ? d.receive_info : null,
                        project = (d.project != null) ? d.project : null
                    });
                }

                object json = new { data = r };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public string GetClientID(string ds_client_id)
        {
            try
            {
                string cm_hcp_id = null;

                if (!string.IsNullOrEmpty(ds_client_id))
                {
                    var QclientID = (from d in detailsCollection.AsQueryable()
                                     where d.HCP_MDM_ID.Equals(ds_client_id)
                                     select new { d.HCP_MDM_ID }).FirstOrDefault();

                    cm_hcp_id = QclientID.HCP_MDM_ID;
                }

                return cm_hcp_id;
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }

        [HttpGet]
        public void GenerateStewardshipFile()
        {
            try
            {
                string path = Server.MapPath("~/Content/json/");

                if (System.IO.File.Exists(path + "query-stewardship.json"))
                {
                    System.IO.File.Delete(path + "query-stewardship.json");
                }

                var Qdata = from q in dataStewardshipCollection.AsQueryable()
                            select new
                            {
                                q.transaction_id,
                                q.SintanTransactionID,
                                q.source,
                                q.Change,
                                q.sent_info,
                                q.receive_info,
                                q.Steward_Status,
                                q.Result,
                                project = !string.IsNullOrEmpty(q.project) ? q.project : string.Empty
                            };

                string jsondata = JsonConvert.SerializeObject(Qdata);

                using (var sw = new StreamWriter(path + "query-stewardship.json", true))
                {
                    sw.WriteLine(jsondata.ToString());
                    sw.Close();
                };

                object json = new { status = "success", success = Qdata };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };
            }
        }

        [HttpGet]
        public void GenerateBestAddressFile()
        {
            try
            {
                var QData = (dynamic)null;
                string path = Server.MapPath("~/Content/json/");

                if (System.IO.File.Exists(path + "query-bestaddress.json"))
                {
                    System.IO.File.Delete(path + "query-bestaddress.json");
                }

                QData = from q in bestaddressCollection.AsQueryable()
                        select new
                        {
                            Client_ID = q.HCP_MDM_ID,
                            q.SHS_ID,
                            q.CRM_ID,
                            q.NPI,
                            q.DEA,
                            q.ME_ID,
                            Specialty = q.specialty,
                            FullName = q.full_name,
                            Credential = q.degree,
                            Target = q.target,
                            Status = q.status,
                            AddressLine1 = q.address_1,
                            AddressLine2 = q.address_2,
                            City = q.city,
                            State = q.state,
                            ZipCode = q.zip,
                            Territory = q.territory_name,
                            Address_Date = q.address_date
                        };

                string jsondata = JsonConvert.SerializeObject(QData);

                using (var sw = new StreamWriter(path + "query-bestaddress.json", true))
                {
                    sw.WriteLine(jsondata.ToString());
                    sw.Close();
                }

                object json = new { status = "success", success = QData };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };
            }
        }

        [HttpGet]
        public JsonResult GetUsers()
        {
            try
            {
                var Qusers = from u in userCollection.AsQueryable()
                             select new
                             {
                                 u._id,
                                 u.username,
                                 u.email,
                                 u.firstname,
                                 u.lastname,
                                 u.role,
                                 u.territory,
                                 u.status,
                                 u.creationdate,
                                 u.lastmodifieddate,
                                 u.created_by,
                                 u.modified_by
                             };

                object json = new { data = Qusers };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public JsonResult UpdateUserRecord(string user_id, string username, string role, string territory, string status, string modified_by)
        {
            try
            {
                object json;

                if (!string.IsNullOrEmpty(user_id) && !string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(modified_by))
                {
                    var filter = Builders<HCPUserModel>.Filter.Eq(x => x._id, user_id);
                    var update = Builders<HCPUserModel>.Update.Set(x => x.role, role).Set(x => x.territory, territory).Set(x => x.status, status).Set(x => x.modified_by, modified_by).Set(x => x.lastmodifieddate, DateTime.Now.ToString("yyyy-MM-dd"));
                    var result = userCollection.UpdateOneAsync(filter, update).Result;

                    json = new { status = "success", result = result };

                    return new JsonResult { Data = json };
                }

                json = new { status = "error", error = String.Format("An error occurred while trying to update {0} record.<br /> Please try again or contact your administrator.", username) };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public JsonResult GetLastModifiedHCPByDate(string daterange)
        {
            var QmembersName = (dynamic)null;
            string start, end = null;

            try
            {
                if (!string.IsNullOrEmpty(daterange))
                {
                    var QgetFirst = (dynamic)null;
                    string[] d = daterange.Split(new string[] { "to" }, StringSplitOptions.None);
                    start = d[0].Trim();
                    end = d[1].Trim();

                    if (string.IsNullOrEmpty(end))
                    {
                        QgetFirst = (from ba in bestaddressCollection.AsQueryable()
                                     where ba.name_date.Equals(String.Format("{0}T00:00:00.000+00:00", start))
                                     select new { ba.name_date }).OrderByDescending(x => x.name_date).FirstOrDefault();

                        QmembersName = QgetFirst;
                    }
                    else
                    {
                        var filterBuilder = Builders<HCPBestAddressModel>.Filter;
                        var filter = filterBuilder.Gte("name_date", String.Format("{0}T00:00:00.000+00:00", start)) & filterBuilder.Lte("name_date", String.Format("{0}T00:00:00.000+00:00", end));

                        List<HCPBestAddressModel> result = bestaddressCollection.Find(filter).ToList();

                        QmembersName = result;
                    }
                }

                object json = new { data = QmembersName };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpGet]
        public JsonResult TotalStewardship()
        {
            var Qtotal = (dynamic)null;

            try
            {
                Qtotal = (from s in dataStewardshipCollection.AsQueryable()
                          select new { s.transaction_id }).Count();

                object json = new { data = Qtotal };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult TotalOpenStewardship()
        {
            var Qtotal = (dynamic)null;

            try
            {
                //Qtotal = (from s in dataStewardshipCollection.AsQueryable()
                //          where s.Steward_Status != null && s.Steward_Status.received == null
                //          select new { s.transaction_id }).Count();

                Qtotal = (from r in dataStewardshipCollection.AsQueryable()
                          where r.Steward_Status != null && r.Steward_Status.created != null && r.Steward_Status.received == null
                          group r by r.transaction_id into grp
                          select new
                          {
                              openKey = grp.Key
                          }).Distinct().Count();

                object json = new { data = Qtotal };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult StewardshipNotValidated() // 
        {
            var Qtotal = (dynamic)null;

            try
            {
                Qtotal = (from s in dataStewardshipCollection.AsQueryable()
                          where s.receive_info != null && !s.receive_info.OnlineValidationStatus.Equals("Validation Complete")
                          && s.Steward_Status != null && s.Steward_Status.received != null
                          select new { s.transaction_id }).Count();

                object json = new { data = Qtotal };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult StewardshipValidated() //
        {
            var Qtotal = (dynamic)null;

            try
            {
                Qtotal = (from s in dataStewardshipCollection.AsQueryable()
                          where s.receive_info != null && s.receive_info.OnlineValidationStatus.Equals("Validation Complete")
                          select new { s.transaction_id }).Count();

                object json = new { data = Qtotal };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public JsonResult GenerateCountFilter(string source, string specialty, string territory)
        {
            try
            {
                var query = (dynamic)null;

                if (!string.IsNullOrEmpty(source) && string.IsNullOrEmpty(specialty) && string.IsNullOrEmpty(territory)) // query on source
                {
                    var QuerySyntax = (from ba in bestaddressCollection.AsQueryable()
                                       from rs in ba.record_source
                                       select new
                                       {
                                           Record_Source = rs.value,
                                           full_name = ba.full_name,
                                           status = ba.status,
                                           HCP_MDM_ID = ba.HCP_MDM_ID,
                                           NPI = ba.NPI,
                                           specialty = ba.specialty,
                                           degree = ba.degree,
                                           state = ba.state,
                                           target = ba.target
                                       }).ToList();

                    query = (from ba in QuerySyntax.AsQueryable()
                             where ba.Record_Source.Equals(source)
                             select new
                             {
                                 Full_Name = ba.full_name,
                                 Status = ba.status,
                                 HCP = ba.HCP_MDM_ID,
                                 NPI = ba.NPI,
                                 Specialty = ba.specialty,
                                 Credential = ba.degree,
                                 State = ba.state,
                                 Target = ba.target
                             }).ToList();
                }
                else if (string.IsNullOrEmpty(source) && !string.IsNullOrEmpty(specialty) && string.IsNullOrEmpty(territory)) // query on specialty
                {
                    query = (from ba in bestaddressCollection.AsQueryable()
                             where ba.specialty.Equals(specialty)
                             select new
                             {
                                 Full_Name = ba.full_name,
                                 Status = ba.status,
                                 HCP = ba.HCP_MDM_ID,
                                 NPI = ba.NPI,
                                 Specialty = ba.specialty,
                                 Credential = ba.degree,
                                 State = ba.state,
                                 Target = ba.target
                             }).ToList();
                }
                else if (string.IsNullOrEmpty(source) && string.IsNullOrEmpty(specialty) && !string.IsNullOrEmpty(territory)) // query on territory
                {
                    query = (from ba in bestaddressCollection.AsQueryable()
                             where ba.territory_id.Equals(territory)
                             select new
                             {
                                 Full_Name = ba.full_name,
                                 Status = ba.status,
                                 HCP = ba.HCP_MDM_ID,
                                 NPI = ba.NPI,
                                 Specialty = ba.specialty,
                                 Credential = ba.degree,
                                 State = ba.state,
                                 Target = ba.target
                             }).ToList();
                }
                else if (!string.IsNullOrEmpty(source) && !string.IsNullOrEmpty(specialty) && string.IsNullOrEmpty(territory)) // query on source and specialty
                {
                    var QuerySyntax = (from ba in bestaddressCollection.AsQueryable()
                                       from rs in ba.record_source
                                       select new
                                       {
                                           Record_Source = rs.value,
                                           full_name = ba.full_name,
                                           status = ba.status,
                                           HCP_MDM_ID = ba.HCP_MDM_ID,
                                           NPI = ba.NPI,
                                           specialty = ba.specialty,
                                           degree = ba.degree,
                                           state = ba.state,
                                           target = ba.target
                                       }).ToList();

                    query = (from ba in QuerySyntax.AsQueryable()
                             where ba.Record_Source.Equals(source) && ba.specialty.Equals(specialty)
                             select new
                             {
                                 Full_Name = ba.full_name,
                                 Status = ba.status,
                                 HCP = ba.HCP_MDM_ID,
                                 NPI = ba.NPI,
                                 Specialty = ba.specialty,
                                 Credential = ba.degree,
                                 State = ba.state,
                                 Target = ba.target
                             }).ToList();
                }
                else if (!string.IsNullOrEmpty(source) && string.IsNullOrEmpty(specialty) && !string.IsNullOrEmpty(territory)) // query on source and territory
                {
                    var QuerySyntax = (from ba in bestaddressCollection.AsQueryable()
                                       from rs in ba.record_source
                                       select new
                                       {
                                           Record_Source = rs.value,
                                           full_name = ba.full_name,
                                           status = ba.status,
                                           HCP_MDM_ID = ba.HCP_MDM_ID,
                                           NPI = ba.NPI,
                                           specialty = ba.specialty,
                                           degree = ba.degree,
                                           state = ba.state,
                                           target = ba.target,
                                           territory_id = ba.territory_id
                                       }).ToList();

                    query = (from ba in QuerySyntax.AsQueryable()
                             where ba.Record_Source.Equals(source) && ba.territory_id.Equals(territory)
                             select new
                             {
                                 Full_Name = ba.full_name,
                                 Status = ba.status,
                                 HCP = ba.HCP_MDM_ID,
                                 NPI = ba.NPI,
                                 Specialty = ba.specialty,
                                 Credential = ba.degree,
                                 State = ba.state,
                                 Target = ba.target
                             }).ToList();
                }
                else if (string.IsNullOrEmpty(source) && !string.IsNullOrEmpty(specialty) && string.IsNullOrEmpty(territory)) // query on specialty and territory
                {
                    query = (from ba in bestaddressCollection.AsQueryable()
                             where ba.specialty.Equals(specialty) && ba.territory_id.Equals(territory)
                             select new
                             {
                                 Full_Name = ba.full_name,
                                 Status = ba.status,
                                 HCP = ba.HCP_MDM_ID,
                                 NPI = ba.NPI,
                                 Specialty = ba.specialty,
                                 Credential = ba.degree,
                                 State = ba.state,
                                 Target = ba.target
                             }).ToList();
                }
                else if (string.IsNullOrEmpty(source) && !string.IsNullOrEmpty(specialty) && string.IsNullOrEmpty(territory)) // query on source and specialty and territory
                {
                    var QuerySyntax = (from ba in bestaddressCollection.AsQueryable()
                                       from rs in ba.record_source
                                       select new
                                       {
                                           Record_Source = rs.value,
                                           full_name = ba.full_name,
                                           status = ba.status,
                                           HCP_MDM_ID = ba.HCP_MDM_ID,
                                           NPI = ba.NPI,
                                           specialty = ba.specialty,
                                           degree = ba.degree,
                                           state = ba.state,
                                           target = ba.target,
                                           territory_id = ba.territory_id
                                       }).ToList();

                    query = (from ba in QuerySyntax.AsQueryable()
                             where ba.Record_Source.Equals(source) && ba.specialty.Equals(specialty) && ba.territory_id.Equals(territory)
                             select new
                             {
                                 Full_Name = ba.full_name,
                                 Status = ba.status,
                                 HCP = ba.HCP_MDM_ID,
                                 NPI = ba.NPI,
                                 Specialty = ba.specialty,
                                 Credential = ba.degree,
                                 State = ba.state,
                                 Target = ba.target
                             }).ToList();
                }

                return new JsonResult { Data = new { result = query }, MaxJsonLength = Int32.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpGet]
        public void GenerateSourcesFile()
        {
            try
            {
                var query = (dynamic)null;
                string path = Server.MapPath("~/Content/json/");

                if (System.IO.File.Exists(path + "source-file-config.json"))
                {
                    System.IO.File.Delete(path + "source-file-config.json");
                }

                query = from q in sourcesCollection.AsQueryable()
                        select new
                        {
                            q.source,
                            q.color
                        };

                string jsondata = JsonConvert.SerializeObject(query);

                using (var sw = new StreamWriter(path + "source-file-config.json", true))
                {
                    sw.WriteLine(jsondata.ToString());
                    sw.Close();
                }

                object json = new { status = "success", success = query };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };
            }
        }

        [HttpPost]
        public JsonResult GetAffiliation(string cm_hcp_id)
        {
            var Qaffiliation = (dynamic)null;
            ArrayList arrList = new ArrayList();
            ArrayList arrDetail = new ArrayList();

            try
            {
                if (!string.IsNullOrEmpty(cm_hcp_id))
                {
                    Qaffiliation = (from a in affiiationCollection.AsQueryable()
                                    where a.HCP_MDM_ID.Equals(cm_hcp_id)
                                    select new
                                    {
                                        a.Address_ID
                                    }).ToList();

                    foreach (var q in Qaffiliation)
                    {
                        arrList.Add(q.Address_ID);
                    }

                    // exclud record that has same hcp_mdm_id*****************
                    foreach (var q in detailsCollection.AsQueryable().Where(x => x.HCP_MDM_ID != cm_hcp_id))
                    {
                        if (q.Address != null)
                        {
                            foreach (var i in q.Address)
                            {
                                if (arrList.Contains(i.Address_ID))
                                {
                                    if (q.Name.Count > 0)
                                    {
                                        arrDetail.Add(String.Format("{0}|{1}|{2}", q.HCP_MDM_ID, q.Name[0].value, q.Name[0].source));
                                    }
                                }
                            }
                        }
                    }
                }

                object json = new { data = arrDetail };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public ActionResult UploadFile()
        {
            object json;

            if (Request.Files.Count > 0)
            {
                try
                {
                    HttpFileCollectionBase files = Request.Files;

                    HttpPostedFileBase file = files[0];
                    string fileName = file.FileName;

                    string path = Path.Combine(Server.MapPath("~/Content/csv/"), fileName);

                    file.SaveAs(path);

                    return new JsonResult { Data = new { result = "File uploaded successfully" } };
                }
                catch (Exception e)
                {
                    json = new { status = "error", error = e.Message };

                    return new JsonResult { Data = json };
                }
            }

            json = new { status = "error", error = "No files were selected!" };

            return new JsonResult { Data = json };
        }

        [HttpGet]
        public JsonResult GetFileList()
        {
            try
            {
                object json = new { data = Directory.EnumerateFiles(Server.MapPath("~/Content/csv/")) };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        public ActionResult LoadCustomersData()
        {
            try
            {
                var draw = Request.Form.GetValues("draw").FirstOrDefault();
                var start = Request.Form.GetValues("start").FirstOrDefault();
                var length = Request.Form.GetValues("length").FirstOrDefault();
                var sortColumn = Request.Form.GetValues("columns[" + Request.Form.GetValues("order[0][column]").FirstOrDefault() + "][name]").FirstOrDefault();
                var sortColumnDir = Request.Form.GetValues("order[0][dir]").FirstOrDefault();

                // Custom column search fields
                string npi = Request.Form.GetValues("columns[1][search][value]").FirstOrDefault();
                string full_name = Request.Form.GetValues("columns[2][search][value]").FirstOrDefault();
                string specialty = Request.Form.GetValues("columns[3][search][value]").FirstOrDefault();
                string name_date = Request.Form.GetValues("columns[4][search][value]").FirstOrDefault();
                string degree = Request.Form.GetValues("columns[5][search][value]").FirstOrDefault();
                string state = Request.Form.GetValues("columns[6][search][value]").FirstOrDefault();
                string territory_name = Request.Form.GetValues("columns[7][search][value]").FirstOrDefault();
                string status = Request.Form.GetValues("columns[8][search][value]").FirstOrDefault();

                // Paging Size (10,20,50,100)    
                int pageSize = length != null ? Convert.ToInt32(length) : 0;
                int skip = start != null ? Convert.ToInt32(start) : 0;
                int recordsTotal = 0;

                // Getting all data    
                var baData = from ba in bestaddressCollection.AsQueryable() select ba;

                // Sorting    
                if (!string.IsNullOrEmpty(sortColumn) && !string.IsNullOrEmpty(sortColumnDir))
                {
                    baData = baData.OrderBy(sortColumn + " " + sortColumnDir);
                }

                // Custom Search
                // NPI
                if (!string.IsNullOrEmpty(npi) && !string.IsNullOrWhiteSpace(npi))
                {
                    if (npi.IndexOf(",") > 0)
                    {
                        string[] arr = npi.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.NPI) && arr.Contains(x.NPI));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.NPI) && x.NPI.Contains(npi));
                    }
                }

                // Full Name
                if (!string.IsNullOrEmpty(full_name) && !string.IsNullOrWhiteSpace(full_name))
                {
                    if (full_name.IndexOf(",") > 0)
                    {
                        string[] arr = full_name.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.full_name) && arr.Contains(x.full_name));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.full_name) && x.full_name.ToLower().Contains(full_name.ToLower()));
                    }
                }

                // Specialty
                if (!string.IsNullOrEmpty(specialty) && !string.IsNullOrWhiteSpace(specialty))
                {
                    if (specialty.IndexOf(",") > 0)
                    {
                        string[] arr = specialty.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.specialty) && arr.Contains(x.specialty));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.specialty) && x.specialty.Equals(specialty));
                    }
                }

                // Name Date
                if (!string.IsNullOrEmpty(name_date) && !string.IsNullOrWhiteSpace(name_date))
                {
                    if (name_date.IndexOf(" · ") > 0)
                    {
                        string[] str = name_date.Split(new char[] { '·' });
                        string datestart = str[0];
                        string dateend = str[1];

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        //baData = baData.Where(
                        //        x => 
                        //            x.name_date != null &&
                        //            x.name_date >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                        //            x.name_date <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                        //        );

                        baData = baData.Where(
                                x => (
                                    x.name_date != null &&
                                    x.name_date >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                    x.name_date <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                                ) ||
                                (
                                    x.specialty_date != null &&
                                    x.specialty_date >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                    x.specialty_date <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                                ) ||
                                (
                                    x.degree_date != null &&
                                    x.degree_date >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                    x.degree_date <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                                ) ||
                                (
                                    x.address_date != null &&
                                    x.address_date >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                    x.address_date <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                                )
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.name_date != null && x.name_date.Equals(String.Format("{0}T00:00:00.000+00:00", name_date)));
                    }
                }

                // Degree
                if (!string.IsNullOrEmpty(degree) && !string.IsNullOrWhiteSpace(degree))
                {
                    if (degree.IndexOf(",") > 0)
                    {
                        string[] arr = degree.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.degree) && arr.Contains(x.degree));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.degree) && x.degree.Equals(degree));
                    }
                }

                // State
                if (!string.IsNullOrEmpty(state) && !string.IsNullOrWhiteSpace(state))
                {
                    if (state.IndexOf(",") > 0)
                    {
                        string[] arr = state.Split(new char[] { ',' });
                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();
                        List<string> l = new List<string>();

                        foreach (var a in arr)
                        {
                            l.Add(ConvertStateToAbbreviation(a));
                        }

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.state) && l.Contains(x.state));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.state) && x.state.Equals(ConvertStateToAbbreviation(state)));
                    }
                }

                // Territory Name
                if (!string.IsNullOrEmpty(territory_name) && !string.IsNullOrWhiteSpace(territory_name))
                {
                    if (territory_name.IndexOf(",") > 0)
                    {
                        string[] territory_ids = Regex.Split(territory_name, @"\D+");

                        territory_ids = territory_ids.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.territory_id) && territory_ids.Contains(x.territory_id));
                    }
                    else
                    {
                        var territory_id = "";

                        if (!territory_name.Equals("9999"))
                        {
                            int index = territory_name.IndexOf("  ");
                            territory_name = territory_name.Remove(index, 1).Insert(index, "-");

                            var str = territory_name.Split(new char[] { '-' }, StringSplitOptions.RemoveEmptyEntries);

                            territory_id = str[0];

                            baData = baData.Where(x => !string.IsNullOrEmpty(x.territory_id) && x.territory_id.Equals(territory_id));
                        }
                        else
                        {
                            baData = baData.Where(x => !string.IsNullOrEmpty(x.territory_id) && x.territory_id.Equals(territory_name));
                        }
                    }
                }

                // Status
                if (!string.IsNullOrEmpty(status) && !string.IsNullOrWhiteSpace(status))
                {
                    if (status.IndexOf(",") > 0)
                    {
                        string[] arr = status.Split(new char[] { ',' });
                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.status) && arr.Contains(x.status));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.status) && x.status.Equals(status));
                    }
                }

                // Total number of rows count
                recordsTotal = baData.Count();

                // Paging     
                var data = baData.Skip(skip).Take(pageSize).ToList();

                // Returning Json Data
                return Json(new { draw = draw, recordsFiltered = recordsTotal, recordsTotal = recordsTotal, data = data });
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        public ActionResult LoadStewardshipData()
        {
            try
            {
                var draw = Request.Form.GetValues("draw").FirstOrDefault();
                var start = Request.Form.GetValues("start").FirstOrDefault();
                var length = Request.Form.GetValues("length").FirstOrDefault();
                var sortColumn = Request.Form.GetValues("columns[" + Request.Form.GetValues("order[0][column]").FirstOrDefault() + "][name]").FirstOrDefault();
                var sortColumnDir = Request.Form.GetValues("order[0][dir]").FirstOrDefault();

                // Custom column search fields
                string name = Request.Form.GetValues("columns[1][search][value]").FirstOrDefault();
                string created_date = Request.Form.GetValues("columns[2][search][value]").FirstOrDefault();
                string submitted_date = Request.Form.GetValues("columns[3][search][value]").FirstOrDefault();
                string received_date = Request.Form.GetValues("columns[4][search][value]").FirstOrDefault();
                string type = Request.Form.GetValues("columns[5][search][value]").FirstOrDefault();
                string status = Request.Form.GetValues("columns[6][search][value]").FirstOrDefault();
                string online_validation_status = Request.Form.GetValues("columns[8][search][value]").FirstOrDefault();
                string phone_validation_status = Request.Form.GetValues("columns[9][search][value]").FirstOrDefault();

                // Paging Size (10,20,50,100)
                int pageSize = length != null ? Convert.ToInt32(length) : 0;
                int skip = start != null ? Convert.ToInt32(start) : 0;
                int recordsTotal = 0;

                // Getting all data
                var baData = from ba in dataStewardshipCollection.AsQueryable() select ba;

                // Sorting
                if (!string.IsNullOrEmpty(sortColumn) && !string.IsNullOrEmpty(sortColumnDir))
                {
                    baData = baData.OrderBy(sortColumn + " " + sortColumnDir);
                }

                // Custom Search
                // Name
                if (!string.IsNullOrEmpty(name) && !string.IsNullOrWhiteSpace(name))
                {
                    if (name.IndexOf(",") > 0)
                    {
                        string[] arr = name.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => x.sent_info != null && (arr.Contains(x.sent_info.FirstName) || arr.Contains(x.sent_info.MiddleName) || arr.Contains(x.sent_info.LastName) || arr.Contains(x.sent_info.SuffixName)));
                    }
                    else
                    {
                        baData = baData.Where(x => x.sent_info != null && (x.sent_info.FirstName.ToLower().Contains(name.ToLower()) || x.sent_info.MiddleName.ToLower().Contains(name.ToLower()) || x.sent_info.LastName.ToLower().Contains(name.ToLower()) || x.sent_info.SuffixName.ToLower().Contains(name.ToLower())));
                    }
                }

                // Created Date
                if (!string.IsNullOrEmpty(created_date) && !string.IsNullOrWhiteSpace(created_date))
                {
                    if (created_date.IndexOf(" · ") > 0)
                    {
                        string[] str = created_date.Split(new char[] { '·' });
                        string datestart = str[0];
                        string dateend = str[1];

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        baData = baData.Where(
                                x => x.Steward_Status != null &&
                                x.Steward_Status.created >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                x.Steward_Status.created <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.created.Equals(String.Format("{0}T00:00:00.000+00:00", created_date)));
                    }
                }

                // Submitted Date
                if (!string.IsNullOrEmpty(submitted_date) && !string.IsNullOrWhiteSpace(submitted_date))
                {
                    if (submitted_date.IndexOf(" · ") > 0)
                    {
                        string[] str = submitted_date.Split(new char[] { '·' });
                        string datestart = str[0];
                        string dateend = str[1];

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        baData = baData.Where(
                                x => x.Steward_Status != null &&
                                x.Steward_Status.submitted >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                x.Steward_Status.submitted <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.submitted.Equals(String.Format("{0}T00:00:00.000+00:00", submitted_date)));
                    }
                }

                // Received Date
                if (!string.IsNullOrEmpty(received_date) && !string.IsNullOrWhiteSpace(received_date))
                {
                    if (received_date.IndexOf(" · ") > 0)
                    {
                        string[] str = received_date.Split(new char[] { '·' });
                        string datestart = str[0].Trim();
                        string dateend = str[1].Trim();

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        baData = baData.Where(
                                x => x.Steward_Status != null &&
                                x.Steward_Status.received >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                x.Steward_Status.received <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.received.Equals(String.Format("{0}T00:00:00.000+00:00", received_date)));
                    }
                }

                // Type (project)
                if (!string.IsNullOrEmpty(type) && !string.IsNullOrWhiteSpace(type))
                {
                    if (type.IndexOf(",") > 0)
                    {
                        string[] arr = type.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.project) && arr.Contains(x.project));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.project) && x.project.ToLower().Contains(type.ToLower()));
                    }
                }

                // Status
                if (!string.IsNullOrEmpty(status) && !string.IsNullOrWhiteSpace(status))
                {
                    if (status.IndexOf(",") > 0)
                    {
                        baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.received != null);
                    }
                    else
                    {
                        if (status.Equals("Open"))
                        {
                            baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.received == null);
                        }
                        else if (status.Equals("Closed"))
                        {
                            baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.received != null);
                        }
                    }
                }

                // Online Validation Status
                if (!string.IsNullOrEmpty(online_validation_status) && !string.IsNullOrWhiteSpace(online_validation_status))
                {
                    if (online_validation_status.IndexOf(",") > 0)
                    {
                        string[] arr = online_validation_status.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => x.receive_info != null && arr.Contains(x.receive_info.OnlineValidationStatus));
                    }
                    else
                    {
                        baData = baData.Where(x => x.receive_info != null && x.receive_info.OnlineValidationStatus.Equals(online_validation_status));
                    }
                }

                // Phone Validation Status
                if (!string.IsNullOrEmpty(phone_validation_status) && !string.IsNullOrWhiteSpace(phone_validation_status))
                {
                    if (phone_validation_status.IndexOf(",") > 0)
                    {
                        string[] arr = phone_validation_status.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => x.receive_info != null && arr.Contains(x.receive_info.PhoneValidationStatus));
                    }
                    else
                    {
                        baData = baData.Where(x => x.receive_info != null && x.receive_info.PhoneValidationStatus.Equals(phone_validation_status));
                    }
                }

                // Total number of rows count
                recordsTotal = baData.Count();

                // Paging     
                var data = baData.Skip(skip).Take(pageSize).ToList();

                // Returning Json Data
                return Json(new { draw = draw, recordsFiltered = recordsTotal, recordsTotal = recordsTotal, data = data });
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        public static string CapitalizeFirstLetter(string value)
        {
            //In Case if the entire string is in UpperCase then convert it into lower
            value = value.ToLower();
            char[] array = value.ToCharArray();
            // Handle the first letter in the string.
            if (array.Length >= 1)
            {
                if (char.IsLower(array[0]))
                {
                    array[0] = char.ToUpper(array[0]);
                }
            }
            // Scan through the letters, checking for spaces.
            // ... Uppercase the lowercase letters following spaces.
            for (int i = 1; i < array.Length; i++)
            {
                if (array[i - 1] == ' ')
                {
                    if (char.IsLower(array[i]))
                    {
                        array[i] = char.ToUpper(array[i]);
                    }
                }
            }
            return new string(array);
        }

        public static Dictionary<string, string> stateToAbbrev = new Dictionary<string, string>() { { "alabama", "AL" }, { "alaska", "AK" }, { "arizona", "AZ" }, { "arkansas", "AR" }, { "california", "CA" }, { "colorado", "CO" }, { "connecticut", "CT" }, { "delaware", "DE" }, { "district of columbia", "DC" }, { "florida", "FL" }, { "georgia", "GA" }, { "hawaii", "HI" }, { "idaho", "ID" }, { "illinois", "IL" }, { "indiana", "IN" }, { "iowa", "IA" }, { "kansas", "KS" }, { "kentucky", "KY" }, { "louisiana", "LA" }, { "maine", "ME" }, { "maryland", "MD" }, { "massachusetts", "MA" }, { "michigan", "MI" }, { "minnesota", "MN" }, { "mississippi", "MS" }, { "missouri", "MO" }, { "montana", "MT" }, { "nebraska", "NE" }, { "nevada", "NV" }, { "new hampshire", "NH" }, { "new jersey", "NJ" }, { "new mexico", "NM" }, { "new york", "NY" }, { "north carolina", "NC" }, { "north dakota", "ND" }, { "ohio", "OH" }, { "oklahoma", "OK" }, { "oregon", "OR" }, { "pennsylvania", "PA" }, { "rhode island", "RI" }, { "south carolina", "SC" }, { "south dakota", "SD" }, { "tennessee", "TN" }, { "texas", "TX" }, { "utah", "UT" }, { "vermont", "VT" }, { "virginia", "VA" }, { "washington", "WA" }, { "west virginia", "WV" }, { "wisconsin", "WI" }, { "wyoming", "WY" } };
        public static Dictionary<string, string> abbrevToState = new Dictionary<string, string>() { { "AK", "alaska" }, { "AL", "alabama" }, { "AR", "arkansas" }, { "AZ", "arizona" }, { "CA", "california" }, { "CO", "colorado" }, { "CT", "connecticut" }, { "DC", "district of columbia" }, { "DE", "delaware" }, { "FL", "florida" }, { "GA", "georgia" }, { "HI", "hawaii" }, { "IA", "iowa" }, { "ID", "idaho" }, { "IL", "illinois" }, { "IN", "indiana" }, { "KS", "kansas" }, { "KY", "kentucky" }, { "LA", "louisiana" }, { "MA", "massachusetts" }, { "MD", "maryland" }, { "ME", "maine" }, { "MI", "michigan" }, { "MN", "minnesota" }, { "MO", "missouri" }, { "MS", "mississippi" }, { "MT", "montana" }, { "NC", "north carolina" }, { "ND", "north dakota" }, { "NE", "nebraska" }, { "NH", "new hampshire" }, { "NJ", "new jersey" }, { "NM", "new mexico" }, { "NV", "nevada" }, { "NY", "new york" }, { "OH", "ohio" }, { "OK", "oklahoma" }, { "OR", "oregon" }, { "PA", "pennsylvania" }, { "RI", "rhode island" }, { "SC", "south carolina" }, { "SD", "south dakota" }, { "TN", "tennessee" }, { "TX", "texas" }, { "UT", "utah" }, { "VA", "virginia" }, { "VT", "vermont" }, { "WA", "washington" }, { "WI", "wisconsin" }, { "WV", "west virginia" }, { "WY", "wyoming" } };

        public static string ConvertStateToAbbreviation(string stateName)
        {
            if (string.IsNullOrEmpty(stateName))
            {
                return null;
            }
            else if (stateName.Length == 2)
            {
                if (abbrevToState.ContainsKey(stateName.ToUpper()))
                    return abbrevToState[stateName.ToUpper()];
                else
                    return null;
            }
            else if (stateToAbbrev.ContainsKey(stateName.ToLower()))
            {
                return stateToAbbrev[stateName.ToLower()];
            }

            return null;
        }

        [HttpGet]
        public JsonResult GetStewardshipSLA()
        {
            var query = (dynamic)null;

            try
            {
                query = from s in dataStewardshipCollection.AsQueryable()
                        where s.Steward_Status != null
                        select new
                        {
                            created = s.Steward_Status != null ? s.Steward_Status.created : null,
                            submitted = s.Steward_Status != null ? s.Steward_Status.submitted : null,
                            received = s.Steward_Status != null ? s.Steward_Status.received : null,
                            project = s.project != null ? s.project : null
                        };

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public JsonResult CustomersFilterCount(string npi, string full_name, string specialty, string name_date, string degree, string state, string territory, string status)
        {
            try
            {
                // Getting all data
                var baData = from ba in bestaddressCollection.AsQueryable() select ba;

                // NPI
                if (!string.IsNullOrEmpty(npi) && !string.IsNullOrWhiteSpace(npi))
                {
                    if (npi.IndexOf(",") > 0)
                    {
                        string[] arr = npi.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.NPI) && arr.Contains(x.NPI));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.NPI) && x.NPI.Contains(npi));
                    }
                }

                // Full Name
                if (!string.IsNullOrEmpty(full_name) && !string.IsNullOrWhiteSpace(full_name))
                {
                    if (full_name.IndexOf(",") > 0)
                    {
                        string[] arr = full_name.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.full_name) && arr.Contains(x.full_name));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.full_name) && x.full_name.ToLower().Contains(full_name.ToLower()));
                    }
                }

                // Specialty
                if (!string.IsNullOrEmpty(specialty) && !string.IsNullOrWhiteSpace(specialty))
                {
                    if (specialty.IndexOf(",") > 0)
                    {
                        string[] arr = specialty.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.specialty) && arr.Contains(x.specialty));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.specialty) && x.specialty.Equals(specialty));
                    }
                }

                // Name Date
                if (!string.IsNullOrEmpty(name_date) && !string.IsNullOrWhiteSpace(name_date))
                {
                    if (name_date.IndexOf(" · ") > 0)
                    {
                        string[] str = name_date.Split(new char[] { '·' });
                        string datestart = str[0];
                        string dateend = str[1];

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        //baData = baData.Where(
                        //        x => x.name_date != null &&
                        //        x.name_date >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                        //        x.name_date <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                        //    );

                        baData = baData.Where(
                                    x => (
                                        x.name_date != null &&
                                        x.name_date >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                        x.name_date <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                                    ) ||
                                    (
                                        x.specialty_date != null &&
                                        x.specialty_date >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                        x.specialty_date <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                                    ) ||
                                    (
                                        x.degree_date != null &&
                                        x.degree_date >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                        x.degree_date <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                                    ) ||
                                    (
                                        x.address_date != null &&
                                        x.address_date >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                        x.address_date <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                                    )
                                );
                    }
                    else
                    {
                        baData = baData.Where(x => x.name_date != null && x.name_date.Equals(String.Format("{0}T00:00:00.000+00:00", name_date)));
                    }
                }

                // Degree
                if (!string.IsNullOrEmpty(degree) && !string.IsNullOrWhiteSpace(degree))
                {
                    if (degree.IndexOf(",") > 0)
                    {
                        string[] arr = degree.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.degree) && arr.Contains(x.degree));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.degree) && x.degree.Equals(degree));
                    }
                }

                // State
                if (!string.IsNullOrEmpty(state) && !string.IsNullOrWhiteSpace(state))
                {
                    if (state.IndexOf(",") > 0)
                    {
                        string[] arr = state.Split(new char[] { ',' });
                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();
                        List<string> l = new List<string>();

                        foreach (var a in arr)
                        {
                            l.Add(ConvertStateToAbbreviation(a));
                        }

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.state) && l.Contains(x.state));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.state) && x.state.Equals(ConvertStateToAbbreviation(state)));
                    }
                }

                // Territory Name
                if (!string.IsNullOrEmpty(territory) && !string.IsNullOrWhiteSpace(territory))
                {
                    if (territory.IndexOf(",") > 0)
                    {
                        string[] territory_ids = Regex.Split(territory, @"\D+");

                        territory_ids = territory_ids.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.territory_id) && territory_ids.Contains(x.territory_id));
                    }
                    else
                    {
                        var territory_id = "";

                        if (!territory.Equals("9999"))
                        {
                            int index = territory.IndexOf("  ");
                            territory = territory.Remove(index, 1).Insert(index, "-");

                            var str = territory.Split(new char[] { '-' }, StringSplitOptions.RemoveEmptyEntries);

                            territory_id = str[0];

                            baData = baData.Where(x => !string.IsNullOrEmpty(x.territory_id) && x.territory_id.Equals(territory_id));
                        }
                        else
                        {
                            baData = baData.Where(x => !string.IsNullOrEmpty(x.territory_id) && x.territory_id.Equals(territory));
                        }
                    }
                }

                // Status
                if (!string.IsNullOrEmpty(status) && !string.IsNullOrWhiteSpace(status))
                {
                    if (status.IndexOf(",") > 0)
                    {
                        string[] arr = status.Split(new char[] { ',' });
                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.status) && arr.Contains(x.status));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.status) && x.status.Equals(status));
                    }
                }

                var hcpCount = (from r in baData
                                group r by r.HCP_MDM_ID into grp
                                select new
                                {
                                    hcpKey = grp.Key
                                }).Count();

                var npiCount = (from r in baData
                                group r by r.NPI into grp
                                select new
                                {
                                    npiKey = grp.Key
                                }).Distinct().Count();

                var specialtyCount = (from r in baData
                                      group r by r.specialty into grp
                                      select new
                                      {
                                          specialtyKey = grp.Key
                                      }).Distinct().Count();

                var degreeCount = (from r in baData
                                   group r by r.degree into grp
                                   select new
                                   {
                                       degreeKey = grp.Key
                                   }).Distinct().Count();

                var stateCount = (from r in baData
                                  group r by r.state into grp
                                  select new
                                  {
                                      stateKey = grp.Key
                                  }).Distinct().Count();

                var json = new
                {
                    data = new
                    {
                        ch_hcp_id = hcpCount,
                        npi = npiCount,
                        specialty = specialtyCount,
                        degree = degreeCount,
                        state = stateCount
                    },
                    length = (int)hcpCount
                };

                // Returning Json Data
                return Json(new { data = json });
            }
            catch (Exception e)
            {
                // Returning Json Data
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public JsonResult StewardshipFilterCount(string name, string created_date, string submitted_date, string received_date, string type, string status, string online_validation_status, string phone_validation_status)
        {
            try
            {
                // Getting all data
                var baData = from ba in dataStewardshipCollection.AsQueryable() select ba;

                var stData = from st in changeRequestCollection.AsQueryable() select st;

                // Name
                if (!string.IsNullOrEmpty(name) && !string.IsNullOrWhiteSpace(name))
                {
                    if (name.IndexOf(",") > 0)
                    {
                        string[] arr = name.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => x.sent_info != null && (arr.Contains(x.sent_info.FirstName) || arr.Contains(x.sent_info.MiddleName) || arr.Contains(x.sent_info.LastName) || arr.Contains(x.sent_info.SuffixName)));
                    }
                    else
                    {
                        baData = baData.Where(x => x.sent_info != null && (x.sent_info.FirstName.ToLower().Contains(name.ToLower()) || x.sent_info.MiddleName.ToLower().Contains(name.ToLower()) || x.sent_info.LastName.ToLower().Contains(name.ToLower()) || x.sent_info.SuffixName.ToLower().Contains(name.ToLower())));
                    }
                }

                // Created Date
                if (!string.IsNullOrEmpty(created_date) && !string.IsNullOrWhiteSpace(created_date))
                {
                    if (created_date.IndexOf(" · ") > 0)
                    {
                        string[] str = created_date.Split(new char[] { '·' });
                        string datestart = str[0];
                        string dateend = str[1];

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        baData = baData.Where(
                                x => x.Steward_Status != null &&
                                x.Steward_Status.created >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                x.Steward_Status.created <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.created.Equals(String.Format("{0}T00:00:00.000+00:00", created_date)));
                    }
                }

                // Submitted Date
                if (!string.IsNullOrEmpty(submitted_date) && !string.IsNullOrWhiteSpace(submitted_date))
                {
                    if (submitted_date.IndexOf(" · ") > 0)
                    {
                        string[] str = submitted_date.Split(new char[] { '·' });
                        string datestart = str[0];
                        string dateend = str[1];

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        baData = baData.Where(
                                x => x.Steward_Status != null &&
                                x.Steward_Status.submitted >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                x.Steward_Status.submitted <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.submitted.Equals(String.Format("{0}T00:00:00.000+00:00", submitted_date)));
                    }
                }

                // Received Date
                if (!string.IsNullOrEmpty(received_date) && !string.IsNullOrWhiteSpace(received_date))
                {
                    if (received_date.IndexOf(" · ") > 0)
                    {
                        string[] str = received_date.Split(new char[] { '·' });
                        string datestart = str[0].Trim();
                        string dateend = str[1].Trim();

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        baData = baData.Where(
                                x => x.Steward_Status != null &&
                                x.Steward_Status.received >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                x.Steward_Status.received <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.received.Equals(String.Format("{0}T00:00:00.000+00:00", received_date)));
                    }
                }

                // Type (project)
                if (!string.IsNullOrEmpty(type) && !string.IsNullOrWhiteSpace(type))
                {
                    if (type.IndexOf(",") > 0)
                    {
                        string[] arr = type.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.project) && arr.Contains(x.project));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.project) && x.project.ToLower().Contains(type.ToLower()));
                    }
                }

                // Status
                if (!string.IsNullOrEmpty(status) && !string.IsNullOrWhiteSpace(status))
                {
                    if (status.IndexOf(",") > 0)
                    {
                        baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.received != null);
                    }
                    else
                    {
                        if (status.Equals("Open"))
                        {
                            baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.received == null);
                        }
                        else if (status.Equals("Closed"))
                        {
                            baData = baData.Where(x => x.Steward_Status != null && x.Steward_Status.received != null);
                        }
                    }
                }

                // Online Validation Status
                if (!string.IsNullOrEmpty(online_validation_status) && !string.IsNullOrWhiteSpace(online_validation_status))
                {
                    if (online_validation_status.IndexOf(",") > 0)
                    {
                        string[] arr = online_validation_status.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => x.receive_info != null && arr.Contains(x.receive_info.OnlineValidationStatus));
                    }
                    else
                    {
                        baData = baData.Where(x => x.receive_info != null && x.receive_info.OnlineValidationStatus.Equals(online_validation_status));
                    }
                }

                // Phone Validation Status
                if (!string.IsNullOrEmpty(phone_validation_status) && !string.IsNullOrWhiteSpace(phone_validation_status))
                {
                    if (phone_validation_status.IndexOf(",") > 0)
                    {
                        string[] arr = phone_validation_status.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => x.receive_info != null && arr.Contains(x.receive_info.PhoneValidationStatus));
                    }
                    else
                    {
                        baData = baData.Where(x => x.receive_info != null && x.receive_info.PhoneValidationStatus.Equals(phone_validation_status));
                    }
                }

                var numberInquiries = (from r in baData
                                       group r by r.transaction_id into grp
                                       select new
                                       {
                                           transactionidKey = grp.Key
                                       }).Count();

                var numberOpen = (from r in baData
                                  where r.Steward_Status != null && r.Steward_Status.created != null && r.Steward_Status.received == null
                                  group r by r.transaction_id into grp
                                  select new
                                  {
                                      openKey = grp.Key
                                  }).Distinct().Count();

                var transaction_array = baData.Select(x => x.transaction_id).ToArray();

                var numberPending = (from s in stData
                                     where s.CR_EXCEPTION_CREATED != null && s.CR_STATUS.Equals("Pending") && transaction_array.Contains(s.CR_STEWARDSHIP_ID)
                                     select s).Count();

                var numberClosed = (from r in baData
                                    where r.Steward_Status != null && r.Steward_Status.received != null
                                    group r by r.transaction_id into grp
                                    select new
                                    {
                                        npiKey = grp.Key
                                    }).Distinct().Count();

                var numberProject = (from r in baData
                                     group r by r.project into grp
                                     select new
                                     {
                                         projectKey = grp.Key
                                     }).Distinct().Count();

                var json = new
                {
                    data = new
                    {
                        numberInquiries = numberInquiries,
                        numberOpen = numberOpen,
                        numberPending = numberPending,
                        numberClosed = numberClosed
                    },
                    length = (int)numberInquiries
                };

                // Returning Json Data
                return Json(new { data = json });
            }
            catch (Exception e)
            {
                // Returning Json Data
                return Json(new { data = e.Message });
            }
        }

        [HttpGet]
        public JsonResult GetAllType()
        {
            try
            {
                var Qterritories = (from ds in dataStewardshipCollection.AsQueryable()
                                    select new { ds.project }).Distinct().OrderBy(x => x.project);

                object json = new { data = Qterritories };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetAllOnlineValidationStatus()
        {
            try
            {
                var query = (from ds in dataStewardshipCollection.AsQueryable()
                             where ds.receive_info != null && ds.receive_info.OnlineValidationStatus != null
                             select new { ds.receive_info.OnlineValidationStatus }).Distinct().OrderBy(x => x.OnlineValidationStatus);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetAllPhoneValidationStatus()
        {
            try
            {
                var query = (from ds in dataStewardshipCollection.AsQueryable()
                             where ds.receive_info != null && ds.receive_info.PhoneValidationStatus != null
                             select new { ds.receive_info.PhoneValidationStatus }).Distinct().OrderBy(x => x.PhoneValidationStatus);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public ActionResult LoadChangeRequestsData()
        {
            try
            {
                var draw = Request.Form.GetValues("draw").FirstOrDefault();
                var start = Request.Form.GetValues("start").FirstOrDefault();
                var length = Request.Form.GetValues("length").FirstOrDefault();
                var searchValue = Request.Form.GetValues("search[value]").FirstOrDefault();
                var sortColumn = Request.Form.GetValues("columns[" + Request.Form.GetValues("order[0][column]").FirstOrDefault() + "][name]").FirstOrDefault();
                var sortColumnDir = Request.Form.GetValues("order[0][dir]").FirstOrDefault();

                // Custom column search fields
                string name = Request.Form.GetValues("columns[1][search][value]").FirstOrDefault();
                string source_name = Request.Form.GetValues("columns[2][search][value]").FirstOrDefault();
                string creation_date = Request.Form.GetValues("columns[3][search][value]").FirstOrDefault();
                string requested_by = Request.Form.GetValues("columns[4][search][value]").FirstOrDefault();
                string type = Request.Form.GetValues("columns[5][search][value]").FirstOrDefault();
                string status = Request.Form.GetValues("columns[6][search][value]").FirstOrDefault();

                // Paging Size (10,20,50,100)    
                int pageSize = length != null ? Convert.ToInt32(length) : 0;
                int skip = start != null ? Convert.ToInt32(start) : 0;
                int recordsTotal = 0;

                // Getting all data    
                var baData = from ba in changeRequestCollection.AsQueryable(new AggregateOptions { AllowDiskUse = true }) select ba;

                // Sorting    
                if (!string.IsNullOrEmpty(sortColumn) && !string.IsNullOrEmpty(sortColumnDir))
                {
                    baData = baData.OrderBy(sortColumn + " " + sortColumnDir);
                }

                // Name
                if (!string.IsNullOrEmpty(name) && !string.IsNullOrWhiteSpace(name))
                {
                    if (name.IndexOf(",") > 0)
                    {
                        string[] arr = name.ToLower().Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => arr.Contains(x.HCP_FIRST_NAME.ToLower()) || arr.Contains(x.HCP_MIDDLE_NAME.ToLower()) || arr.Contains(x.HCP_LAST_NAME.ToLower()) || arr.Contains(x.HCO_NAME.ToLower()));
                    }
                    else
                    {
                        baData = baData.Where(x => x.HCP_FIRST_NAME.ToLower().Contains(name.ToLower()) || x.HCP_MIDDLE_NAME.ToLower().Contains(name.ToLower()) || x.HCP_LAST_NAME.ToLower().Contains(name.ToLower()) || x.HCO_NAME.ToLower().Contains(name.ToLower()));
                    }
                }

                // Source Name
                if (!string.IsNullOrEmpty(source_name) && !string.IsNullOrWhiteSpace(source_name))
                {
                    if (source_name.IndexOf(",") > 0)
                    {
                        string[] arr = source_name.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_NAME) && arr.Contains(x.SRC_NAME));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_NAME) && x.SRC_NAME.Contains(source_name));
                    }
                }

                // Creation Date
                if (!string.IsNullOrEmpty(creation_date) && !string.IsNullOrWhiteSpace(creation_date))
                {
                    if (creation_date.IndexOf(" · ") > 0)
                    {
                        string[] str = creation_date.Split(new char[] { '·' });
                        string datestart = str[0].Trim();
                        string dateend = str[1].Trim();

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        baData = baData.Where(
                                x => x.CR_CREATION_DATE != null &&
                                x.CR_CREATION_DATE >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                x.CR_CREATION_DATE <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.CR_CREATION_DATE != null && x.CR_CREATION_DATE.Equals(String.Format("{0}T00:00:00.000+00:00", creation_date)));
                    }
                }

                // Requested By
                if (!string.IsNullOrEmpty(requested_by) && !string.IsNullOrWhiteSpace(requested_by))
                {
                    if (requested_by.IndexOf(",") > 0)
                    {
                        string[] arr = requested_by.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_CR_USER_TERR_ID) && arr.Contains(x.SRC_CR_USER_TERR_ID));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_CR_USER_TERR_ID) && x.SRC_CR_USER_TERR_ID.Contains(requested_by));
                    }
                }

                // Type
                if (!string.IsNullOrEmpty(type) && !string.IsNullOrWhiteSpace(type))
                {
                    if (type.IndexOf(",") > 0)
                    {
                        string[] arr = type.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.REQ_TYPE) && arr.Contains(x.REQ_TYPE));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.REQ_TYPE) && x.REQ_TYPE.Contains(type));
                    }
                }

                // Status
                if (!string.IsNullOrEmpty(status) && !string.IsNullOrWhiteSpace(status))
                {
                    if (status.IndexOf(",") > 0)
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.CR_STATUS) && x.CR_STATUS.Equals("Open") || !x.CR_STATUS.Equals("Open"));
                    }
                    else
                    {
                        if (status.ToLower().Equals("closed"))
                        {
                            baData = baData.Where(x => !x.CR_STATUS.Equals("Open"));
                        }
                        else if (status.ToLower().Equals("open"))
                        {
                            baData = baData.Where(x => x.CR_STATUS.Equals("Open"));
                        }
                    }
                }

                // Total number of rows count
                recordsTotal = baData.Count();

                // Paging     
                var data = baData.Skip(skip).Take(pageSize).ToList();

                // Returning Json Data
                return Json(new { draw = draw, recordsFiltered = recordsTotal, recordsTotal = recordsTotal, data = data });
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public ActionResult ChangeRequestFilterCount(string name, string source_name, string creation_date, string requested_by, string type, string status)
        {
            try
            {
                // Getting all data    
                var baData = from ba in changeRequestCollection.AsQueryable() select ba;

                // Name
                if (!string.IsNullOrEmpty(name) && !string.IsNullOrWhiteSpace(name))
                {
                    if (name.IndexOf(",") > 0)
                    {
                        string[] arr = name.ToLower().Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => arr.Contains(x.HCP_FIRST_NAME.ToLower()) || arr.Contains(x.HCP_MIDDLE_NAME.ToLower()) || arr.Contains(x.HCP_LAST_NAME.ToLower()) || arr.Contains(x.HCO_NAME.ToLower()));
                    }
                    else
                    {
                        baData = baData.Where(x => x.HCP_FIRST_NAME.ToLower().Contains(name.ToLower()) || x.HCP_MIDDLE_NAME.ToLower().Contains(name.ToLower()) || x.HCP_LAST_NAME.ToLower().Contains(name.ToLower()) || x.HCO_NAME.ToLower().Contains(name.ToLower()));
                    }
                }

                // Source Name
                if (!string.IsNullOrEmpty(source_name) && !string.IsNullOrWhiteSpace(source_name))
                {
                    if (source_name.IndexOf(",") > 0)
                    {
                        string[] arr = source_name.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_NAME) && arr.Contains(x.SRC_NAME));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_NAME) && x.SRC_NAME.Contains(source_name));
                    }
                }

                // Creation Date
                if (!string.IsNullOrEmpty(creation_date) && !string.IsNullOrWhiteSpace(creation_date))
                {
                    if (creation_date.IndexOf(" · ") > 0)
                    {
                        string[] str = creation_date.Split(new char[] { '·' });
                        string datestart = str[0].Trim();
                        string dateend = str[1].Trim();

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        baData = baData.Where(
                                x => x.CR_CREATION_DATE != null &&
                                x.CR_CREATION_DATE >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                x.CR_CREATION_DATE <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.CR_CREATION_DATE != null && x.CR_CREATION_DATE.Equals(String.Format("{0}T00:00:00.000+00:00", creation_date)));
                    }
                }

                // Requested By
                if (!string.IsNullOrEmpty(requested_by) && !string.IsNullOrWhiteSpace(requested_by))
                {
                    if (requested_by.IndexOf(",") > 0)
                    {
                        string[] arr = requested_by.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_CR_USER_TERR_ID) && arr.Contains(x.SRC_CR_USER_TERR_ID));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_CR_USER_TERR_ID) && x.SRC_CR_USER_TERR_ID.Contains(requested_by));
                    }
                }

                // Type
                if (!string.IsNullOrEmpty(type) && !string.IsNullOrWhiteSpace(type))
                {
                    if (type.IndexOf(",") > 0)
                    {
                        string[] arr = type.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.REQ_TYPE) && arr.Contains(x.REQ_TYPE));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.REQ_TYPE) && x.REQ_TYPE.Contains(type));
                    }
                }

                // Status
                if (!string.IsNullOrEmpty(status) && !string.IsNullOrWhiteSpace(status))
                {
                    if (status.IndexOf(",") > 0)
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.CR_STATUS) && x.CR_STATUS.Equals("Open") || !x.CR_STATUS.Equals("Open"));
                    }
                    else
                    {
                        if (status.ToLower().Equals("closed"))
                        {
                            baData = baData.Where(x => !x.CR_STATUS.Equals("Open"));
                        }
                        else if (status.ToLower().Equals("open"))
                        {
                            baData = baData.Where(x => x.CR_STATUS.Equals("Open"));
                        }
                    }
                }

                var numberNightlyProcessed = (from r in baData
                                              where r.CR_CREATION_DATE != null && r.CR_CREATION_DATE.Equals(String.Format("{0}T00:00:00.000+00:00", DateTime.Today.AddDays(-1).ToString("yyyy-MM-dd")))
                                              group r by r.CR_ID into grp
                                              select new
                                              {
                                                  changeRequestKey = grp.Key
                                              }).Count();

                var numberChangeRequest = baData.Count();

                var numberOpenRequests = (from r in baData
                                          where r.CR_STATUS.Equals("Open")
                                          select new
                                          {
                                              r.CR_STATUS
                                          }).Count();

                var numberClosedRequests = (from r in baData
                                            where !r.CR_STATUS.Equals("Open")
                                            select new
                                            {
                                                r.CR_STATUS
                                            }).Count();

                var numberExceptionStatus = (from r in baData
                                             group r by r.CR_EXCEPTION_STATUS into grp
                                             select new
                                             {
                                                 exceptionStatusKey = grp.Key
                                             }).Distinct().Count();

                var json = new
                {
                    data = new
                    {
                        numberChangeRequest = numberChangeRequest,
                        numberNightlyProcessed = numberNightlyProcessed,
                        numberOpenRequests = numberOpenRequests,
                        numberClosedRequests = numberClosedRequests,
                        numberExceptionStatus = numberExceptionStatus
                    },
                    length = (int)numberChangeRequest
                };

                return Json(new { data = json });
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        [HttpGet]
        public JsonResult GetChangeRequestSourceName()
        {
            try
            {
                var query = (from cr in changeRequestCollection.AsQueryable()
                             where cr.SRC_NAME != null
                             select new { cr.SRC_NAME }).Distinct().OrderBy(x => x.SRC_NAME);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetChangeRequestType()
        {
            try
            {
                var query = (from cr in changeRequestCollection.AsQueryable()
                             where cr.REQ_TYPE != null
                             select new { cr.REQ_TYPE }).Distinct().OrderBy(x => x.REQ_TYPE);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetChangeRequestStatus()
        {
            try
            {
                var query = (from cr in changeRequestCollection.AsQueryable()
                             where cr.CR_STATUS != null
                             select new { cr.CR_STATUS }).Distinct().OrderBy(x => x.CR_STATUS);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public string GetChangeRequestExceptionDescription(string cr_id)
        {
            return changeRequestCollection.AsQueryable().Where(x => x.CR_ID.Equals(cr_id)).FirstOrDefault().CR_EXCEPTION_DESC;
        }

        [HttpPost]
        public ActionResult ChangeRequestDetails(string cr_id)
        {
            if (Session != null && (string)Session["username"] != "")
            {
                if (!string.IsNullOrEmpty(cr_id))
                {
                    ViewBag.param = cr_id;
                    ViewBag.paramDescription = GetChangeRequestExceptionDescription(cr_id);

                    return View();
                }
            }

            return RedirectToAction("Login");
        }

        [HttpPost]
        public JsonResult GetChangeRequestDetailsInformation(string cr_id)
        {
            try
            {
                var query = (dynamic)null;

                if (!string.IsNullOrEmpty(cr_id))
                {
                    query = from cr in changeRequestCollection.AsQueryable()
                            where cr.CR_ID.Equals(cr_id)
                            select cr;
                }

                object json = new { status = "success", success = query };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public JsonResult ManageException(string record_id, string exception, string user_comment)
        {
            try
            {
                object json;

                if (!string.IsNullOrEmpty(record_id) && !string.IsNullOrEmpty(exception))
                {
                    var filter = Builders<ChangeRequestsModel>.Filter.Eq(x => x.CR_ID, record_id);
                    // if comment is empty ? update without comment : update with comment
                    var update = string.IsNullOrEmpty(user_comment) ? Builders<ChangeRequestsModel>.Update.Set(x => x.CR_EXCEPTION_ACTION, exception) : Builders<ChangeRequestsModel>.Update.Set(x => x.CR_EXCEPTION_ACTION, exception).Set(x => x.SRC_CR_USER_COMMENT, user_comment);

                    var result = changeRequestCollection.UpdateOneAsync(filter, update).Result;

                    json = new { status = "success", result = result };

                    return new JsonResult { Data = json };
                }

                json = new { status = "error", error = "An error occurred while trying to update the exception. Please try again or contact your administrator." };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpGet]
        public JsonResult DistinctSource()
        {
            try
            {
                var query = (from ba in bestaddressCollection.AsQueryable() select new { ba.name_source }).Distinct().OrderBy(x => x.name_source);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public JsonResult GetChangeRequestID(string cr_id)
        {
            try
            {
                var query = (dynamic)null;

                if (!string.IsNullOrEmpty(cr_id))
                {
                    query = from cr in changeRequestCollection.AsQueryable()
                            where cr.CR_ID.Equals(cr_id)
                            select new
                            {
                                cr._id
                            };
                }

                object json = new { status = "success", success = query };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public JsonResult GetPredefinedReport(string reportname)
        {
            try
            {
                // Getting all data
                var queries = (dynamic)null;

                List<string> list = new List<string>();
                JavaScriptSerializer js = new JavaScriptSerializer();
                List<StewardshipObjectModel> obj = new List<StewardshipObjectModel>();

                DataStewardshipModel[] dsArray;

                if (!string.IsNullOrEmpty(reportname))
                {
                    if (reportname.Equals("HCPs by Specialties"))
                    {
                        queries = from r in bestaddressCollection.AsQueryable()
                                  where !string.IsNullOrEmpty(r.specialty)
                                  orderby r.specialty
                                  group r by r.specialty into grp
                                  select new { Specialty = grp.Key, Count = grp.Count() };

                        list.Add("Specialty");
                        list.Add("Count");
                    }
                    else if (reportname.Equals("HCPs by Credentials"))
                    {
                        queries = from r in bestaddressCollection.AsQueryable()
                                  where !string.IsNullOrEmpty(r.degree)
                                  orderby r.degree
                                  group r by r.degree into grp
                                  select new { Credentials = grp.Key, Count = grp.Count() };

                        list.Add("Credentials");
                        list.Add("Count");
                    }
                    else if (reportname.Equals("HCPs by State"))
                    {
                        queries = from r in bestaddressCollection.AsQueryable()
                                  where !string.IsNullOrEmpty(r.state)
                                  orderby r.state
                                  group r by r.state into grp
                                  select new { State = grp.Key, Count = grp.Count() };

                        list.Add("State");
                        list.Add("Count");
                    }
                    else if (reportname.Equals("HCPs by Territories"))
                    {
                        queries = from r in bestaddressCollection.AsQueryable()
                                  where !string.IsNullOrEmpty(r.territory_name)
                                  orderby r.territory_name
                                  group r by r.territory_name into grp
                                  select new { Territory = grp.Key, Count = grp.Count() };

                        list.Add("Territory");
                        list.Add("Count");
                    }
                    else if (reportname.Equals("YTD HCP's Validated"))
                    {
                        IQueryable<DataStewardshipModel> q = from d in dataStewardshipCollection.AsQueryable()
                                                             where d.Steward_Status != null &&
                                                             d.receive_info.OnlineValidationStatus.Equals("Validation Complete") &&
                                                             d.Steward_Status.created >= Convert.ToDateTime("2021-01-01T00:00:00.000+00:00").Date &&
                                                             d.Steward_Status.created <= Convert.ToDateTime("2021-12-31T00:00:00.000+00:00").Date
                                                             select d;

                        dsArray = q.ToArray();

                        foreach (DataStewardshipModel ds in dsArray)
                        {
                            obj.Add(new StewardshipObjectModel
                            {
                                npi = !string.IsNullOrEmpty(ds.receive_info.NPI) ? ds.receive_info.NPI : "",
                                name = ds.receive_info != null ? (!string.IsNullOrEmpty(ds.receive_info.MiddleName) ? CapitalizeFirstLetter(ds.receive_info.FirstName + " " + ds.receive_info.MiddleName + " " + ds.receive_info.LastName) : CapitalizeFirstLetter(ds.receive_info.FirstName + " " + ds.receive_info.LastName)) : "N/A",
                                address = ds.receive_info.AddressLine1 + " " + ds.receive_info.AddressLine2 + " " + ds.receive_info.City + " " + ds.receive_info.State,
                                institution_name = ds.receive_info.InstitutionName,
                                created_date = ds.Steward_Status.created.Value.ToString("MM/dd/yyyy"),
                                received_date = ds.Steward_Status.received.Value.ToString("MM/dd/yyyy"),
                                specialty = ds.receive_info.PrimarySpecialty,
                                credentials = ds.receive_info.Credentials,
                                online_validation_status = !string.IsNullOrEmpty(ds.receive_info.OnlineValidationStatus) ? ds.receive_info.OnlineValidationStatus : ""
                            });
                        }

                        queries = JsonConvert.SerializeObject(obj);

                        list.Add("npi");
                        list.Add("name");
                        list.Add("address");
                        list.Add("institution_name");
                        list.Add("created_date");
                        list.Add("received_date");
                        list.Add("specialty");
                        list.Add("credentials");
                        list.Add("online_validation_status");
                    }
                    else if (reportname.Equals("2020 HCP's Validated"))
                    {
                        IQueryable<DataStewardshipModel> q = from d in dataStewardshipCollection.AsQueryable()
                                                             where d.Steward_Status != null &&
                                                             d.receive_info.OnlineValidationStatus.Equals("Validation Complete") &&
                                                             d.Steward_Status.created >= Convert.ToDateTime("2020-01-01T00:00:00.000+00:00").Date &&
                                                             d.Steward_Status.created <= Convert.ToDateTime("2020-12-31T00:00:00.000+00:00").Date
                                                             select d;

                        dsArray = q.ToArray();

                        foreach (DataStewardshipModel ds in dsArray)
                        {
                            obj.Add(new StewardshipObjectModel
                            {
                                npi = ds.receive_info.NPI,
                                name = ds.receive_info != null ? (!string.IsNullOrEmpty(ds.receive_info.MiddleName) ? CapitalizeFirstLetter(ds.receive_info.FirstName + " " + ds.receive_info.MiddleName + " " + ds.receive_info.LastName) : CapitalizeFirstLetter(ds.receive_info.FirstName + " " + ds.receive_info.LastName)) : "N/A",
                                address = ds.receive_info.AddressLine1 + " " + ds.receive_info.AddressLine2 + " " + ds.receive_info.City + " " + ds.receive_info.State,
                                institution_name = ds.receive_info.InstitutionName,
                                created_date = ds.Steward_Status.created.Value.ToString("MM/dd/yyyy"),
                                received_date = ds.Steward_Status.received.Value.ToString("MM/dd/yyyy"),
                                specialty = ds.receive_info.PrimarySpecialty,
                                credentials = ds.receive_info.Credentials,
                                online_validation_status = !string.IsNullOrEmpty(ds.receive_info.OnlineValidationStatus) ? ds.receive_info.OnlineValidationStatus : ""
                            });
                        }

                        queries = JsonConvert.SerializeObject(obj);

                        list.Add("npi");
                        list.Add("name");
                        list.Add("address");
                        list.Add("institution_name");
                        list.Add("created_date");
                        list.Add("received_date");                        
                        list.Add("specialty");
                        list.Add("credentials");
                        list.Add("online_validation_status");
                    }
                    else if (reportname.Equals("2019 HCP's Validated"))
                    {
                        IQueryable<DataStewardshipModel> q = from d in dataStewardshipCollection.AsQueryable()
                                                             where d.Steward_Status != null &&
                                                             d.receive_info.OnlineValidationStatus.Equals("Validation Complete") &&
                                                             d.Steward_Status.created >= Convert.ToDateTime("2019-01-01T00:00:00.000+00:00").Date &&
                                                             d.Steward_Status.created <= Convert.ToDateTime("2019-12-31T00:00:00.000+00:00").Date
                                                             select d;

                        dsArray = q.ToArray();

                        foreach (DataStewardshipModel ds in dsArray)
                        {
                            obj.Add(new StewardshipObjectModel
                            {
                                npi = ds.receive_info.NPI,
                                name = ds.receive_info != null ? (!string.IsNullOrEmpty(ds.receive_info.MiddleName) ? CapitalizeFirstLetter(ds.receive_info.FirstName + " " + ds.receive_info.MiddleName + " " + ds.receive_info.LastName) : CapitalizeFirstLetter(ds.receive_info.FirstName + " " + ds.receive_info.LastName)) : "N/A",
                                address = ds.receive_info.AddressLine1 + " " + ds.receive_info.AddressLine2 + " " + ds.receive_info.City + " " + ds.receive_info.State,
                                institution_name = ds.receive_info.InstitutionName,
                                created_date = ds.Steward_Status.created.Value.ToString("MM/dd/yyyy"),
                                received_date = ds.Steward_Status.received.Value.ToString("MM/dd/yyyy"),
                                specialty = ds.receive_info.PrimarySpecialty,
                                credentials = ds.receive_info.Credentials,
                                online_validation_status = !string.IsNullOrEmpty(ds.receive_info.OnlineValidationStatus) ? ds.receive_info.OnlineValidationStatus : ""
                            });
                        }

                        queries = JsonConvert.SerializeObject(obj);

                        list.Add("npi");
                        list.Add("name");
                        list.Add("address");
                        list.Add("institution_name");
                        list.Add("created_date");
                        list.Add("received_date");
                        list.Add("specialty");
                        list.Add("credentials");
                        list.Add("online_validation_status");
                    }
                    else if (reportname.Equals("YTD Status"))
                    {
                        queries = from d in dataStewardshipCollection.AsQueryable()
                                  where d.Steward_Status != null &&
                                        !string.IsNullOrEmpty(d.receive_info.OnlineValidationStatus) &&
                                        d.Steward_Status.created != null &&
                                        d.Steward_Status.created >= Convert.ToDateTime("2021-01-01T00:00:00.000+00:00").Date &&
                                        d.Steward_Status.created <= Convert.ToDateTime("2021-12-31T00:00:00.000+00:00").Date
                                  orderby d.receive_info.OnlineValidationStatus
                                  group d by d.receive_info.OnlineValidationStatus into grp
                                  select new { online_validation_status = grp.Key, count = grp.Count() };

                        list.Add("online_validation_status");
                        list.Add("count");
                    }
                    else if (reportname.Equals("2020 Status"))
                    {
                        queries = from d in dataStewardshipCollection.AsQueryable()
                                  where d.Steward_Status != null &&
                                        !string.IsNullOrEmpty(d.receive_info.OnlineValidationStatus) &&
                                        d.Steward_Status.created != null &&
                                        d.Steward_Status.created >= Convert.ToDateTime("2020-01-01T00:00:00.000+00:00").Date &&
                                        d.Steward_Status.created <= Convert.ToDateTime("2020-12-31T00:00:00.000+00:00").Date
                                  orderby d.receive_info.OnlineValidationStatus
                                  group d by d.receive_info.OnlineValidationStatus into grp
                                  select new { online_validation_status = grp.Key, count = grp.Count() };

                        list.Add("online_validation_status");
                        list.Add("count");
                    }
                    else if (reportname.Equals("2019 Status"))
                    {
                        queries = from d in dataStewardshipCollection.AsQueryable()
                                  where d.Steward_Status != null &&
                                        !string.IsNullOrEmpty(d.receive_info.OnlineValidationStatus) &&
                                        d.Steward_Status.created != null &&
                                        d.Steward_Status.created >= Convert.ToDateTime("2019-01-01T00:00:00.000+00:00").Date &&
                                        d.Steward_Status.created <= Convert.ToDateTime("2019-12-31T00:00:00.000+00:00").Date
                                  orderby d.receive_info.OnlineValidationStatus
                                  group d by d.receive_info.OnlineValidationStatus into grp
                                  select new { online_validation_status = grp.Key, count = grp.Count() };

                        list.Add("online_validation_status");
                        list.Add("count");
                    }
                    else if (reportname.Equals("Open Requests"))
                    {
                        queries = from ba in changeRequestCollection.AsQueryable()
                                  where ba.CR_EXCEPTION_CREATED != null && ba.CR_EXCEPTION_CREATED >= Convert.ToDateTime("2020-09-24T00:00:00.000+00:00").Date
                                  && ba.CR_EXCEPTION_STATUS.Equals("True") && ba.CR_EXCEPTION_PROCESSED == null
                                  select new
                                  {
                                      Type = ba.CR_TYPE,
                                      Name = ba.CR_TYPE.Equals("HCP") ? (!string.IsNullOrEmpty(ba.HCP_MIDDLE_NAME) ? ba.HCP_FIRST_NAME + " " + ba.HCP_MIDDLE_NAME + " " + ba.HCP_LAST_NAME : ba.HCP_FIRST_NAME + " " + ba.HCP_LAST_NAME) : !string.IsNullOrEmpty(ba.HCO_NAME) ? ba.HCO_NAME : "",
                                      source_name = !string.IsNullOrEmpty(ba.SRC_NAME) ? ba.SRC_NAME : "",
                                      request_type = !string.IsNullOrEmpty(ba.REQ_TYPE) ? ba.REQ_TYPE : "",
                                      Description = !string.IsNullOrEmpty(ba.CR_MDM_COMMENT) ? ba.CR_MDM_COMMENT : "",
                                      user_comment = !string.IsNullOrEmpty(ba.SRC_CR_USER_COMMENT) ? ba.SRC_CR_USER_COMMENT : "",
                                      action = !string.IsNullOrEmpty(ba.CR_EXCEPTION_ACTION) ? ba.CR_EXCEPTION_ACTION : ""
                                  };

                        list.Add("Type");
                        list.Add("Name");
                        list.Add("source_name");
                        list.Add("request_type");
                        list.Add("Description");
                        list.Add("user_comment");
                        list.Add("action");
                    }
                    else if (reportname.Equals("Closed Requests"))
                    {
                        queries = from ba in changeRequestCollection.AsQueryable()
                                  where ba.CR_EXCEPTION_CREATED != null && ba.CR_EXCEPTION_CREATED >= Convert.ToDateTime("2020-09-24T00:00:00.000+00:00").Date
                                  && ba.CR_EXCEPTION_STATUS.Equals("False") && !string.IsNullOrEmpty(ba.CR_EXCEPTION_ACTION) && ba.CR_EXCEPTION_PROCESSED != null
                                  select new
                                  {
                                      Type = ba.CR_TYPE,
                                      Name = ba.CR_TYPE.Equals("HCP") ? (!string.IsNullOrEmpty(ba.HCP_MIDDLE_NAME) ? ba.HCP_FIRST_NAME + " " + ba.HCP_MIDDLE_NAME + " " + ba.HCP_LAST_NAME : ba.HCP_FIRST_NAME + " " + ba.HCP_LAST_NAME) : !string.IsNullOrEmpty(ba.HCO_NAME) ? ba.HCO_NAME : "",
                                      source_name = !string.IsNullOrEmpty(ba.SRC_NAME) ? ba.SRC_NAME : "",
                                      request_type = !string.IsNullOrEmpty(ba.REQ_TYPE) ? ba.REQ_TYPE : "",
                                      Description = !string.IsNullOrEmpty(ba.CR_MDM_COMMENT) ? ba.CR_MDM_COMMENT : "",
                                      user_comment = !string.IsNullOrEmpty(ba.SRC_CR_USER_COMMENT) ? ba.SRC_CR_USER_COMMENT : "",
                                      action = !string.IsNullOrEmpty(ba.CR_EXCEPTION_ACTION) ? ba.CR_EXCEPTION_ACTION : ""
                                  };

                        list.Add("Type");
                        list.Add("Name");
                        list.Add("source_name");
                        list.Add("request_type");
                        list.Add("Description");
                        list.Add("user_comment");
                        list.Add("action");
                    }
                    else if (reportname.Equals("Class of Trade"))
                    {
                        queries = from ba in hcoBestAddressCollection.AsQueryable()
                                  where !string.IsNullOrEmpty(ba.class_of_trade)
                                  orderby ba.class_of_trade
                                  group ba by ba.class_of_trade into grp
                                  select new { class_of_trade = grp.Key.ToUpper(), Count = grp.Count() };

                        list.Add("class_of_trade");
                        list.Add("Count");
                    }
                    else if (reportname.Equals("Facility Type"))
                    {
                        queries = from ba in hcoBestAddressCollection.AsQueryable()
                                  where !string.IsNullOrEmpty(ba.facility_type)
                                  orderby ba.facility_type
                                  group ba by ba.facility_type into grp
                                  select new { facility_type = grp.Key.ToUpper(), Count = grp.Count() };

                        list.Add("facility_type");
                        list.Add("Count");
                    }
                    else if (reportname.Equals("Active Account"))
                    {
                        queries = (from ba in hcoBestAddressCollection.AsQueryable()
                                   where ba.status.Equals("Active")
                                   select new
                                   {
                                       name = ba.name,
                                       name_source = ba.name_source,
                                       address = !string.IsNullOrEmpty(ba.address_2) ? ba.address_1 + " " + ba.address_2 + " " + ba.city + " " + ba.zip + " " + ba.state : ba.address_1 + " " + ba.city + " " + ba.zip + " " + ba.state,
                                       territory = ba.territory_name + " " + ba.territory_id,
                                       status = ba.status
                                   });

                        list.Add("name");
                        list.Add("name_source");
                        list.Add("address");
                        list.Add("territory");
                        list.Add("status");
                    }
                    else if (reportname.Equals("Inactive Account"))
                    {
                        queries = (from ba in hcoBestAddressCollection.AsQueryable()
                                   where !ba.status.Equals("Active")
                                   select new
                                   {
                                       name = ba.name,
                                       name_source = ba.name_source,
                                       address = !string.IsNullOrEmpty(ba.address_2) ? ba.address_1 + " " + ba.address_2 + " " + ba.city + " " + ba.zip + " " + ba.state : ba.address_1 + " " + ba.city + " " + ba.zip + " " + ba.state,
                                       territory = ba.territory_name + " " + ba.territory_id,
                                       status = ba.status
                                   });

                        list.Add("name");
                        list.Add("name_source");
                        list.Add("address");
                        list.Add("territory");
                        list.Add("status");
                    }
                }

                // Returning Json Data
                if (reportname.Equals("YTD HCP Stats") || reportname.Equals("2020 HCP Stats") || reportname.Equals("2019 HCP Stats"))
                {
                    return Json(new { data = queries, columns = js.Serialize(list) });
                }
                else
                {
                    return Json(new { data = js.Serialize(queries), columns = js.Serialize(list) });
                }                
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public bool IsSavedSearchNameExist(string searchname)
        {
            var v = savedSearchCollection.AsQueryable().Where(x => x.search_name == searchname).FirstOrDefault();

            return v != null;
        }

        [HttpPost]
        public JsonResult GetSavedSearch(string table, string user)
        {
            try
            {
                var query = from ss in savedSearchCollection.AsQueryable()
                            where ss.table.Equals(table) && ss.user.Equals(user)
                            select new
                            {
                                ss._id,
                                ss.search_name,
                                ss.search_value,
                                ss.table
                            };

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public JsonResult RemoveSavedSearch(string bookmark_id, string table, string user)
        {
            try
            {
                var query = savedSearchCollection.DeleteOneAsync(x => x._id.Equals(bookmark_id) && x.table.Equals(table) && x.user.Equals(user));

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public ActionResult InsertSavedSearch(string searchname, string searchvalue, string table, string user)
        {
            if (Session != null && (string)Session["username"] != "")
            {
                SavedSearchModel ss = new SavedSearchModel();
                object json;

                if (ModelState.IsValid)
                {
                    // Username exist?
                    if (IsSavedSearchNameExist(searchname))
                    {
                        json = new { status = "error", error = "Saved Search name already exist, please use a different name." };

                        return new JsonResult { Data = json };
                    }

                    ss.search_name = searchname;
                    ss.search_value = searchvalue;
                    ss.table = table;
                    ss.user = user;

                    try
                    {
                        savedSearchCollection.InsertOne(ss);
                    }
                    catch (Exception e)
                    {
                        json = new { status = "error", error = e.Message };

                        return new JsonResult { Data = json };
                    }

                    json = new { status = "success", success = "Bookmark saved." };

                    return new JsonResult { Data = json };
                }
                else
                {
                    json = new { status = "error", error = "Error: Invalid Request" };

                    return new JsonResult { Data = json };
                }
            }
            else
            {
                return RedirectToAction("Login");
            }
        }

        [HttpPost]
        public JsonResult LoadBookmark(string bookmark_id, string table)
        {
            try
            {
                var query = (dynamic)null;

                if (!string.IsNullOrEmpty(bookmark_id) && !string.IsNullOrEmpty(table))
                {
                    query = from ss in savedSearchCollection.AsQueryable()
                            where ss._id.Equals(bookmark_id) && ss.table.Equals(table)
                            select ss;
                }

                object json = new { status = "success", success = query };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpGet]
        public JsonResult GetAllClassOfTrade()
        {
            try
            {
                var query = (from b in hcoBestAddressCollection.AsQueryable()
                             where !string.IsNullOrEmpty(b.class_of_trade)
                             select new { b.class_of_trade }).Distinct().OrderBy(x => x.class_of_trade);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetAllHCOTerritories()
        {
            try
            {
                var Qterritories = (from t in hcoBestAddressCollection.AsQueryable()
                                    where !string.IsNullOrEmpty(t.territory_id)
                                    select new
                                    {
                                        t.territory_id,
                                        t.territory_name
                                    }).Distinct().OrderBy(x => x.territory_id);

                object json = new { data = Qterritories };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetAllHCOStatus()
        {
            try
            {
                var query = (from ba in hcoBestAddressCollection.AsQueryable()
                             where !string.IsNullOrEmpty(ba.state)
                             select new { ba.status }).Distinct().OrderBy(x => x.status);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpGet]
        public JsonResult GetAllHCOFacilityType()
        {
            try
            {
                var query = (from ba in hcoBestAddressCollection.AsQueryable()
                             where !string.IsNullOrEmpty(ba.facility_type)
                             select new { ba.facility_type }).Distinct().OrderBy(x => x.facility_type);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        public ActionResult LoadAccountsData()
        {
            try
            {
                var draw = Request.Form.GetValues("draw").FirstOrDefault();
                var start = Request.Form.GetValues("start").FirstOrDefault();
                var length = Request.Form.GetValues("length").FirstOrDefault();
                var sortColumn = Request.Form.GetValues("columns[" + Request.Form.GetValues("order[0][column]").FirstOrDefault() + "][name]").FirstOrDefault();
                var sortColumnDir = Request.Form.GetValues("order[0][dir]").FirstOrDefault();

                // Custom column search fields
                string npi = Request.Form.GetValues("columns[0][search][value]").FirstOrDefault();
                string account_name = Request.Form.GetValues("columns[1][search][value]").FirstOrDefault();
                string cot = Request.Form.GetValues("columns[2][search][value]").FirstOrDefault();
                string last_updated_date = Request.Form.GetValues("columns[3][search][value]").FirstOrDefault();
                string facility_type = Request.Form.GetValues("columns[4][search][value]").FirstOrDefault();
                string state = Request.Form.GetValues("columns[5][search][value]").FirstOrDefault();
                string status = Request.Form.GetValues("columns[6][search][value]").FirstOrDefault();
                string territory_id = Request.Form.GetValues("columns[8][search][value]").FirstOrDefault();

                // Paging Size (10,20,50,100)
                int pageSize = length != null ? Convert.ToInt32(length) : 0;
                int skip = start != null ? Convert.ToInt32(start) : 0;
                int recordsTotal = 0;

                // Getting all data    
                var baData = from ba in hcoBestAddressCollection.AsQueryable() select ba;

                // Sorting    
                if (!string.IsNullOrEmpty(sortColumn) && !string.IsNullOrEmpty(sortColumnDir))
                {
                    baData = baData.OrderBy(sortColumn + " " + sortColumnDir);
                }

                // Custom Search
                // NPI
                if (!string.IsNullOrEmpty(npi) && !string.IsNullOrWhiteSpace(npi))
                {
                    if (npi.IndexOf(",") > 0)
                    {
                        string[] arr = npi.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.NPI) && arr.Contains(x.NPI));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.NPI) && x.NPI.Contains(npi));
                    }
                }

                // Account Name
                if (!string.IsNullOrEmpty(account_name) && !string.IsNullOrWhiteSpace(account_name))
                {
                    if (account_name.IndexOf(",") > 0)
                    {
                        string[] arr = account_name.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.name) && arr.Contains(x.name));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.name) && x.name.ToLower().Contains(account_name.ToLower()));
                    }
                }

                // Class Of Trade
                if (!string.IsNullOrEmpty(cot) && !string.IsNullOrWhiteSpace(cot))
                {
                    if (cot.IndexOf(",") > 0)
                    {
                        string[] arr = cot.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.class_of_trade) && arr.Contains(x.class_of_trade));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.class_of_trade) && x.class_of_trade.Equals(cot));
                    }
                }

                // Last Updated Date
                if (!string.IsNullOrEmpty(last_updated_date) && !string.IsNullOrWhiteSpace(last_updated_date))
                {
                    if (last_updated_date.IndexOf(" · ") > 0)
                    {
                        string[] str = last_updated_date.Split(new char[] { '·' });
                        string datestart = str[0];
                        string dateend = str[1];

                        baData = baData.Where(x => x.name_date != null && x.name_date >= Convert.ToDateTime(String.Format("{0}T00:00:00.000+00:00", datestart)).Date && x.name_date <= Convert.ToDateTime(String.Format("{0}T00:00:00.000+00:00", dateend)).Date);
                    }
                    else
                    {
                        baData = baData.Where(x => x.name_date != null && x.name_date.Equals(String.Format("{0}T00:00:00.000+00:00", last_updated_date)));
                    }
                }

                // Facility Type
                if (!string.IsNullOrEmpty(facility_type) && !string.IsNullOrWhiteSpace(facility_type))
                {
                    if (facility_type.IndexOf(",") > 0)
                    {
                        string[] arr = facility_type.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.facility_type) && arr.Contains(x.facility_type));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.facility_type) && x.facility_type.Equals(facility_type));
                    }
                }

                // State
                if (!string.IsNullOrEmpty(state) && !string.IsNullOrWhiteSpace(state))
                {
                    if (state.IndexOf(",") > 0)
                    {
                        string[] arr = state.Split(new char[] { ',' });
                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();
                        List<string> l = new List<string>();

                        foreach (var a in arr)
                        {
                            l.Add(ConvertStateToAbbreviation(a));
                        }

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.state) && l.Contains(x.state));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.state) && x.state.Equals(state));
                    }
                }

                // Status
                if (!string.IsNullOrEmpty(status) && !string.IsNullOrWhiteSpace(status))
                {
                    if (status.IndexOf(",") > 0)
                    {
                        string[] arr = status.Split(new char[] { ',' });
                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.status) && arr.Contains(x.status));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.status) && x.status.Equals(status));
                    }
                }

                // Territory ID
                if (!string.IsNullOrEmpty(territory_id) && !string.IsNullOrWhiteSpace(territory_id))
                {
                    if (territory_id.IndexOf(",") > 0)
                    {
                        string[] territory_ids = Regex.Split(territory_id, @"\D+");

                        territory_ids = territory_ids.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.territory_id) && territory_ids.Contains(x.territory_id));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.territory_id) && x.territory_id.Equals(territory_id));
                    }
                }

                // Total number of rows count
                recordsTotal = baData.Count();

                // Paging     
                var data = baData.Skip(skip).Take(pageSize).ToList();

                // Returning Json Data
                return Json(new { draw = draw, recordsFiltered = recordsTotal, recordsTotal = recordsTotal, data = data });
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public JsonResult AccountsFilterCount(string npi, string account_name, string cot, string last_updated_date, string facility_type, string state, string status, string territory_id)
        {
            try
            {
                // Getting all data
                var baData = from ba in hcoBestAddressCollection.AsQueryable() select ba;

                // NPI
                if (!string.IsNullOrEmpty(npi) && !string.IsNullOrWhiteSpace(npi))
                {
                    if (npi.IndexOf(",") > 0)
                    {
                        string[] arr = npi.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.NPI) && arr.Contains(x.NPI));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.NPI) && x.NPI.Contains(npi));
                    }
                }

                // Account Name
                if (!string.IsNullOrEmpty(account_name) && !string.IsNullOrWhiteSpace(account_name))
                {
                    if (account_name.IndexOf(",") > 0)
                    {
                        string[] arr = account_name.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.name) && arr.Contains(x.name));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.name) && x.name.ToLower().Contains(account_name.ToLower()));
                    }
                }

                // Class Of Trade
                if (!string.IsNullOrEmpty(cot) && !string.IsNullOrWhiteSpace(cot))
                {
                    if (cot.IndexOf(",") > 0)
                    {
                        string[] arr = cot.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.class_of_trade) && arr.Contains(x.class_of_trade));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.class_of_trade) && x.class_of_trade.Equals(cot));
                    }
                }

                // Last Updated Date
                if (!string.IsNullOrEmpty(last_updated_date) && !string.IsNullOrWhiteSpace(last_updated_date))
                {
                    if (last_updated_date.IndexOf(" · ") > 0)
                    {
                        string[] str = last_updated_date.Split(new char[] { '·' });
                        string datestart = str[0];
                        string dateend = str[1];

                        baData = baData.Where(x => x.name_date != null && x.name_date >= Convert.ToDateTime(String.Format("{0}T00:00:00.000+00:00", datestart)).Date && x.name_date <= Convert.ToDateTime(String.Format("{0}T00:00:00.000+00:00", dateend)).Date);
                    }
                    else
                    {
                        baData = baData.Where(x => x.name_date != null && x.name_date.Equals(String.Format("{0}T00:00:00.000+00:00", last_updated_date)));
                    }
                }

                // Facility Type
                if (!string.IsNullOrEmpty(facility_type) && !string.IsNullOrWhiteSpace(facility_type))
                {
                    if (facility_type.IndexOf(",") > 0)
                    {
                        string[] arr = facility_type.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.facility_type) && arr.Contains(x.facility_type));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.facility_type) && x.facility_type.Equals(facility_type));
                    }
                }

                // State
                if (!string.IsNullOrEmpty(state) && !string.IsNullOrWhiteSpace(state))
                {
                    if (state.IndexOf(",") > 0)
                    {
                        string[] arr = state.Split(new char[] { ',' });
                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();
                        List<string> l = new List<string>();

                        foreach (var a in arr)
                        {
                            l.Add(ConvertStateToAbbreviation(a));
                        }

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.state) && l.Contains(x.state));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.state) && x.state.Equals(state));
                    }
                }

                // Status
                if (!string.IsNullOrEmpty(status) && !string.IsNullOrWhiteSpace(status))
                {
                    if (status.IndexOf(",") > 0)
                    {
                        string[] arr = status.Split(new char[] { ',' });
                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.status) && arr.Contains(x.status));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.status) && x.status.Equals(status));
                    }
                }

                // Territory ID
                if (!string.IsNullOrEmpty(territory_id) && !string.IsNullOrWhiteSpace(territory_id))
                {
                    if (territory_id.IndexOf(",") > 0)
                    {
                        string[] territory_ids = Regex.Split(territory_id, @"\D+");

                        territory_ids = territory_ids.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.territory_id) && territory_ids.Contains(x.territory_id));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.territory_id) && x.territory_id.Equals(territory_id));
                    }
                }

                // Account
                var accountCount = (from r in baData
                                    group r by r.HCO_MDM_ID into grp
                                    select new
                                    {
                                        accountKey = grp.Key
                                    }).Distinct().Count();

                // NPI
                var npiCount = (from r in baData
                                group r by r.NPI into grp
                                select new
                                {
                                    npiKey = grp.Key
                                }).Distinct().Count();

                // Class Of Trade
                var cotCount = (from r in baData
                                group r by r.class_of_trade into grp
                                select new
                                {
                                    cotKey = grp.Key
                                }).Distinct().Count();

                // Facility Type
                var facilityTypeCount = (from r in baData
                                         group r by r.facility_type into grp
                                         select new
                                         {
                                             facilityTypeKey = grp.Key
                                         }).Distinct().Count();

                // State
                var stateCount = (from r in baData
                                  group r by r.state into grp
                                  select new
                                  {
                                      stateKey = grp.Key
                                  }).Distinct().Count();

                var json = new
                {
                    data = new
                    {
                        hco_mdm_id = accountCount,
                        npi = npiCount,
                        cot = cotCount,
                        facility_type = facilityTypeCount,
                        state = stateCount
                    },
                    length = (int)accountCount
                };

                // Returning Json Data
                return Json(new { data = json });
            }
            catch (Exception e)
            {
                // Returning Json Data
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public ActionResult AccountProfile(string hco_mdm_id)
        {
            if (Session != null || (string)Session["username"] != "")
            {
                if (!string.IsNullOrEmpty(hco_mdm_id))
                {
                    ViewBag.param = hco_mdm_id;

                    return View();
                }
            }

            return RedirectToAction("Login");
        }

        [HttpPost]
        public JsonResult GetBestAddressAccountInformation(string hco_mdm_id)
        {
            try
            {
                var query = (dynamic)null;

                if (!string.IsNullOrEmpty(hco_mdm_id))
                {
                    query = from ba in hcoBestAddressCollection.AsQueryable()
                            where ba.HCO_MDM_ID.Equals(hco_mdm_id)
                            select ba;
                }

                object json = new { status = "success", success = query };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public JsonResult GetHCODetails(string hco_mdm_id)
        {
            var query = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(hco_mdm_id))
                {
                    query = from ph in hcoDetailsCollection.AsQueryable()
                            where ph.HCO_MDM_ID.Equals(hco_mdm_id)
                            select ph;
                }

                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public JsonResult GetHCOAffiliation(string hco_mdm_id)
        {
            var Qaffiliation = (dynamic)null;
            ArrayList arrList = new ArrayList();
            ArrayList arrDetail = new ArrayList();

            try
            {
                if (!string.IsNullOrEmpty(hco_mdm_id))
                {
                    Qaffiliation = (from a in hcoAffiliationCollection.AsQueryable()
                                    where a.HCO_MDM_ID.Equals(hco_mdm_id)
                                    select new
                                    {
                                        a.Address_ID
                                    }).ToList();

                    foreach (var q in Qaffiliation)
                    {
                        arrList.Add(q.Address_ID);
                    }

                    foreach (var q in hcoDetailsCollection.AsQueryable())
                    {
                        if (q.Address != null)
                        {
                            foreach (var i in q.Address)
                            {
                                if (arrList.Contains(i.Address_ID))
                                {
                                    if (q.Name.Count > 0)
                                    {
                                        arrDetail.Add(String.Format("{0}|{1}|{2}", q.HCO_MDM_ID, q.Name[0].value, q.Name[0].source));
                                    }
                                }
                            }
                        }
                    }
                }

                object json = new { data = arrDetail };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public JsonResult GetHCPHCOAffiiation(string id, string lookup)
        {
            var query = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(id))
                {
                    if (lookup.ToLower().Equals("hcp"))
                    {
                        query = from a in hcphcoAffiliationCollection.AsQueryable()
                                where a.HCP_MDM_ID.Equals(id)
                                select new
                                {
                                    a.HCO_MDM_ID
                                };
                    }
                    else if (lookup.ToLower().Equals("hco"))
                    {
                        query = from a in hcphcoAffiliationCollection.AsQueryable()
                                where a.HCO_MDM_ID.Equals(id)
                                select new
                                {
                                    a.HCP_MDM_ID
                                };
                    }
                }

                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public JsonResult GetHCOBestAddress(string hco_mdm_id)
        {
            var query = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(hco_mdm_id))
                {
                    query = from a in hcoBestAddressCollection.AsQueryable()
                            where a.HCO_MDM_ID.Equals(hco_mdm_id)
                            select a;
                }

                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        public string ChangeRequestByType()
        {
            List<string> arr = new List<string>();
            List<DataPoint> dataPoints = new List<DataPoint>();

            var query = from q in changeRequestCollection.AsQueryable()
                        where !string.IsNullOrEmpty(q.REQ_TYPE)
                        group q by new { q.REQ_TYPE } into grouping
                        select new
                        {
                            Value = grouping.Key.REQ_TYPE,
                            Count = grouping.Count()
                        };

            foreach (var g in query)
            {
                dataPoints.Add(new DataPoint(g.Value, g.Count));
            }

            return JsonConvert.SerializeObject(dataPoints);
        }

        public string TopTenCredentials()
        {
            List<string> arr = new List<string>();
            List<DataPoint> dataPoints = new List<DataPoint>();

            var query = (from q in bestaddressCollection.AsQueryable()
                         where !string.IsNullOrEmpty(q.degree)
                         orderby q.degree
                         group q by new { q.degree } into grouping
                         select new
                         {
                             Value = grouping.Key.degree,
                             Count = grouping.Count()
                         }).OrderByDescending(o => o.Count).Take(10);

            foreach (var g in query)
            {
                dataPoints.Add(new DataPoint(g.Value, g.Count));
            }

            return JsonConvert.SerializeObject(dataPoints);
        }

        public string CustomerInSource()
        {
            List<string> arr = new List<string>();
            List<DataPoint> dataPoints = new List<DataPoint>();

            var QuerySyntax = (from std in bestaddressCollection.AsQueryable()
                               from program in std.record_source
                               select new
                               {
                                   Value = program.value
                               }).ToList();

            var query = from q in QuerySyntax
                        where !string.IsNullOrEmpty(q.Value)
                        group q by new { q.Value } into grouping
                        select new
                        {
                            Value = grouping.Key.Value,
                            Count = grouping.Count()
                        };

            foreach (var g in query)
            {
                dataPoints.Add(new DataPoint(g.Value, g.Count));
            }

            return JsonConvert.SerializeObject(dataPoints);
        }

        [HttpGet]
        public JsonResult KPIsInitialCount()
        {
            try
            {
                // Getting all data
                var baData = from ba in bestaddressCollection.AsQueryable() select ba;

                var hcpCount = (from r in baData
                                group r by r.HCP_MDM_ID into grp
                                select new
                                {
                                    hcpKey = grp.Key
                                }).Count();

                var npiCount = (from r in baData
                                group r by r.NPI into grp
                                select new
                                {
                                    npiKey = grp.Key
                                }).Distinct().Count();

                var specialtyCount = (from r in baData
                                      group r by r.specialty into grp
                                      select new
                                      {
                                          specialtyKey = grp.Key
                                      }).Distinct().Count();

                var degreeCount = (from r in baData
                                   group r by r.degree into grp
                                   select new
                                   {
                                       degreeKey = grp.Key
                                   }).Distinct().Count();

                var stateCount = (from r in baData
                                  group r by r.state into grp
                                  select new
                                  {
                                      stateKey = grp.Key
                                  }).Distinct().Count();

                var targetCount = (from r in baData
                                   where r.target.Equals("Yes") // target is equal to client value
                                   select new
                                   {
                                       targetKey = r.target
                                   }).Count();

                var result = new
                {
                    data = new
                    {
                        client_id = hcpCount,
                        npi = npiCount,
                        specialty = specialtyCount,
                        degree = degreeCount,
                        state = stateCount,
                        target = targetCount
                    },
                    length = (int)hcpCount
                };

                // Returning Json Data
                object json = new { status = "success", data = result };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        public string StewardshipRequestPerYear()
        {
            List<string> arr = new List<string>();
            List<DataPoint> dataPoints = new List<DataPoint>();

            var query = (from q in dataStewardshipCollection.AsQueryable()
                         where q.Steward_Status != null && q.Steward_Status.created != null && !string.IsNullOrEmpty(q.receive_info.OnlineValidationStatus)
                         group q by new { year = q.Steward_Status.created.Value.Year } into grouping
                         select new
                         {
                             Value = grouping.Key.year,
                             Count = grouping.Count()
                         });

            foreach (var g in query)
            {
                dataPoints.Add(new DataPoint(g.Value.ToString(), g.Count));
            }

            return JsonConvert.SerializeObject(dataPoints);
        }

        public string ChangeRequestPerYear()
        {
            List<string> arr = new List<string>();
            List<DataPoint> dataPoints = new List<DataPoint>();

            var query = (from q in changeRequestCollection.AsQueryable()
                         where q.CR_CREATION_DATE != null
                         group q by new { year = q.CR_CREATION_DATE.Value.Year } into grouping
                         select new
                         {
                             Value = grouping.Key.year,
                             Count = grouping.Count()
                         }).OrderBy(x => x.Value);

            foreach (var g in query)
            {
                dataPoints.Add(new DataPoint(g.Value.ToString(), g.Count));
            }

            return JsonConvert.SerializeObject(dataPoints);
        }

        [HttpPost]
        public JsonResult GetExceptionStatusChangeRequest(string hcp_mdm_id)
        {
            var query = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(hcp_mdm_id))
                {
                    query = from a in changeRequestCollection.AsQueryable()
                            where a.HCP_MDM_ID.Equals(hcp_mdm_id)
                            select new
                            {
                                id = a._id,
                                exception_status = a.CR_EXCEPTION_STATUS,
                                exception_desc = a.CR_EXCEPTION_DESC,
                                name = !string.IsNullOrEmpty(a.HCP_MIDDLE_NAME) ? a.HCP_FIRST_NAME + " " + a.HCP_MIDDLE_NAME + " " + a.HCP_LAST_NAME : a.HCP_FIRST_NAME + " " + a.HCP_LAST_NAME,
                                address1 = a.HCP_ADDR_1,
                                address2 = a.HCP_ADDR_2,
                                city = a.HCP_CITY,
                                state = a.HCP_STATE,
                                zip = a.HCP_ZIP5,
                                telephone = a.HCP_PHONE,
                                credentials = a.HCP_CREDENTIALS,
                                primary_specialty = a.HCP_PRY_SPECIALTY,
                                secondary_specialty = a.HCP_SEC_SPECIALTY,
                                request_type = a.REQ_TYPE,
                                territory = a.SRC_CR_USER_TERR_ID + " " + a.SRC_CR_USER_TERR_NAME
                            };
                }

                object json = new { data = query };

                return new JsonResult { Data = json };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public string GetHCOName(string hcp_mdm_id)
        {
            var query = (dynamic)null;
            string id = "";

            try
            {
                if (!string.IsNullOrEmpty(id))
                {
                    query = (from h in hcoBestAddressCollection.AsQueryable()
                             join c in changeRequestCollection.AsQueryable()
                             on h.HCO_MDM_ID equals c.HCO_MDM_ID
                             where c.HCP_MDM_ID.Equals(hcp_mdm_id)
                             select new
                             {
                                 account_name = h.name
                             }).FirstOrDefault().account_name;
                }

                return query;
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }

        [HttpGet]
        public bool StewardshipExist()
        {
            bool exist = false;

            try
            {
                var query = (from ba in dataStewardshipCollection.AsQueryable() select ba).Count();

                if (query > 0)
                {
                    exist = true;
                }

                return exist;
            }
            catch (Exception e)
            {
                return exist;
            }
        }

        [HttpGet]
        public bool AccountExist()
        {
            bool exist = false;

            try
            {
                var query = (from ba in hcoBestAddressCollection.AsQueryable() select ba).Count();

                if (query > 0)
                {
                    exist = true;
                }

                return exist;
            }
            catch (Exception e)
            {
                return exist;
            }
        }

        [HttpGet]
        public bool ExceptionExist()
        {
            bool exist = false;

            try
            {
                var query = (from ba in changeRequestCollection.AsQueryable()
                             where ba.CR_EXCEPTION_CREATED != null && ba.CR_EXCEPTION_CREATED >= Convert.ToDateTime("2020-09-24T00:00:00.000+00:00").Date
                             select ba).Count();

                if (query > 0)
                {
                    exist = true;
                }

                return exist;
            }
            catch (Exception e)
            {
                return exist;
            }
        }

        [HttpPost]
        public ActionResult LoadExceptionsData()
        {
            try
            {
                var draw = Request.Form.GetValues("draw").FirstOrDefault();
                var start = Request.Form.GetValues("start").FirstOrDefault();
                var length = Request.Form.GetValues("length").FirstOrDefault();
                var searchValue = Request.Form.GetValues("search[value]").FirstOrDefault();
                var sortColumn = Request.Form.GetValues("columns[" + Request.Form.GetValues("order[0][column]").FirstOrDefault() + "][name]").FirstOrDefault();
                var sortColumnDir = Request.Form.GetValues("order[0][dir]").FirstOrDefault();

                // Custom column search fields
                string name = Request.Form.GetValues("columns[0][search][value]").FirstOrDefault();
                string request_type = Request.Form.GetValues("columns[1][search][value]").FirstOrDefault();
                string exception = Request.Form.GetValues("columns[2][search][value]").FirstOrDefault();
                string source = Request.Form.GetValues("columns[3][search][value]").FirstOrDefault();
                string processed = Request.Form.GetValues("columns[5][search][value]").FirstOrDefault();
                string status = Request.Form.GetValues("columns[6][search][value]").FirstOrDefault();
                string final_exception = Request.Form.GetValues("columns[7][search][value]").FirstOrDefault();

                // Paging Size (10,20,50,100)
                int pageSize = length != null ? Convert.ToInt32(length) : 0;
                int skip = start != null ? Convert.ToInt32(start) : 0;
                int recordsTotal = 0;

                // Getting all data
                var baData = from ba in changeRequestCollection.AsQueryable()
                             where ba.CR_EXCEPTION_CREATED != null && ba.CR_EXCEPTION_CREATED >= Convert.ToDateTime("2020-10-14T00:00:00.000+00:00").Date // 3 months dynamic
                             select ba;

                // Sorting    
                if (!string.IsNullOrEmpty(sortColumn) && !string.IsNullOrEmpty(sortColumnDir))
                {
                    baData = baData.OrderBy(sortColumn + " " + sortColumnDir);
                }

                // Name
                if (!string.IsNullOrEmpty(name) && !string.IsNullOrWhiteSpace(name))
                {
                    if (name.IndexOf(",") > 0)
                    {
                        string[] arr = name.ToLower().Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => arr.Contains(x.HCP_FIRST_NAME.ToLower()) || arr.Contains(x.HCP_MIDDLE_NAME.ToLower()) || arr.Contains(x.HCP_LAST_NAME.ToLower()) || arr.Contains(x.HCO_NAME.ToLower()));
                    }
                    else
                    {
                        baData = baData.Where(
                                x => x.HCP_FIRST_NAME.ToLower().Contains(name.ToLower()) ||
                                x.HCP_MIDDLE_NAME.ToLower().Contains(name.ToLower()) ||
                                x.HCP_LAST_NAME.ToLower().Contains(name.ToLower()) ||
                                x.HCO_NAME.ToLower().Contains(name.ToLower())
                            );
                    }
                }

                // Request Type
                if (!string.IsNullOrEmpty(request_type) && !string.IsNullOrWhiteSpace(request_type))
                {
                    if (request_type.IndexOf(",") > 0)
                    {
                        string[] arr = request_type.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.REQ_TYPE) && arr.Contains(x.REQ_TYPE));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.REQ_TYPE) && x.REQ_TYPE.Equals(request_type));
                    }
                }

                // Exception
                if (!string.IsNullOrEmpty(exception) && !string.IsNullOrWhiteSpace(exception))
                {
                    if (exception.IndexOf(",") > 0)
                    {
                        string[] arr = exception.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.CR_MDM_COMMENT) && arr.Contains(x.CR_MDM_COMMENT));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.CR_MDM_COMMENT) && x.CR_MDM_COMMENT.Equals(exception));
                    }
                }

                // Source
                if (!string.IsNullOrEmpty(source) && !string.IsNullOrWhiteSpace(source))
                {
                    if (source.IndexOf(",") > 0)
                    {
                        string[] arr = source.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_NAME) && arr.Contains(x.SRC_NAME));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_NAME) && x.SRC_NAME.Equals(source));
                    }
                }

                // Processed
                if (!string.IsNullOrEmpty(processed) && !string.IsNullOrWhiteSpace(processed))
                {
                    if (processed.IndexOf(" · ") > 0)
                    {
                        string[] str = processed.Split(new char[] { '·' });
                        string datestart = str[0];
                        string dateend = str[1];

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        baData = baData.Where(
                                x => x.CR_EXCEPTION_PROCESSED != null &&
                                x.CR_EXCEPTION_PROCESSED >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                x.CR_EXCEPTION_PROCESSED <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.CR_EXCEPTION_PROCESSED != null && x.CR_EXCEPTION_PROCESSED.Equals(String.Format("{0}T00:00:00.000+00:00", processed)));
                    }
                }

                // Status
                if (!string.IsNullOrEmpty(status) && !string.IsNullOrWhiteSpace(status))
                {
                    if (status.IndexOf(",") > 0)
                    {
                        string[] arr = status.Split(new char[] { ',' });

                        baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Equals("False") || x.CR_EXCEPTION_STATUS.Equals("True")) && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) || string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION)) && (x.CR_EXCEPTION_PROCESSED != null || x.CR_EXCEPTION_PROCESSED == null));
                    }
                    else
                    {
                        if (status.ToLower().Equals("closed"))
                        {
                            baData = baData.Where(x => x.CR_EXCEPTION_STATUS.Equals("False") && !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_PROCESSED != null);
                        }
                        else if (status.ToLower().Equals("open"))
                        {
                            baData = baData.Where(x => x.CR_EXCEPTION_STATUS.Equals("True") && x.CR_EXCEPTION_PROCESSED == null);
                        }
                    }
                }

                // Final Exception/Result
                if (!string.IsNullOrEmpty(final_exception) && !string.IsNullOrWhiteSpace(final_exception))
                {
                    if (final_exception.IndexOf(",") > 0)
                    {
                        string[] arr = final_exception.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        if (arr.Count() == 2) // count 2
                        {
                            if (arr.Contains("In Progress") && arr.Contains("Approved"))
                            {
                                baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Contains("True") && !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_PROCESSED == null) || (x.CR_EXCEPTION_STATUS.Contains("False") && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_ACTION.Equals("Approved")) && x.CR_EXCEPTION_PROCESSED != null));
                            }
                            else if (arr.Contains("In Progress") && arr.Contains("Rejected"))
                            {
                                baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Contains("True") && !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_PROCESSED == null) || (x.CR_EXCEPTION_STATUS.Contains("False") && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_ACTION.Equals("Rejected")) && x.CR_EXCEPTION_PROCESSED != null));
                            }
                            else if (!arr.Contains("In Progress"))
                            {
                                baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Contains("False") && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && arr.Contains(x.CR_EXCEPTION_ACTION)) && x.CR_EXCEPTION_PROCESSED != null));
                            }
                        }
                        else if (arr.Count() == 3) // count 3
                        {
                            baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Contains("True") && !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_PROCESSED == null) || (x.CR_EXCEPTION_STATUS.Contains("False") && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && arr.Contains(x.CR_EXCEPTION_ACTION)) && x.CR_EXCEPTION_PROCESSED != null));
                        }
                    }
                    else
                    {
                        if (final_exception == "In Progress")
                        {
                            // In Progress (if ‘Status’ = ‘Open’ & ‘Approve or Rejected’ has been selected & awaiting our nightly processing)
                            baData = baData.Where(x => x.CR_EXCEPTION_STATUS.Contains("True") && !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_PROCESSED == null);
                        }
                        else if (final_exception == "Approved" || final_exception == "Rejected")
                        {
                            // Approved or Rejected (if ‘Status’ = ‘Closed’ which triggers the nightly processing date to be displayed in ‘Processed’ field)
                            baData = baData.Where(x => x.CR_EXCEPTION_STATUS.Contains("False") && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_ACTION.Equals(final_exception)) && x.CR_EXCEPTION_PROCESSED != null);
                        }
                    }
                }

                // Total number of rows count
                recordsTotal = baData.Count();

                // Paging     
                var data = baData.Skip(skip).Take(pageSize).ToList();

                // Returning Json Data
                return Json(new { draw = draw, recordsFiltered = recordsTotal, recordsTotal = recordsTotal, data = data });
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public ActionResult ExceptionsFilterCount(string name, string request_type, string exception, string source, string processed_date, string status, string final_exception)
        {
            try
            {
                // Getting all data    
                var baData = from ba in changeRequestCollection.AsQueryable()
                             where ba.CR_EXCEPTION_CREATED != null && ba.CR_EXCEPTION_CREATED >= Convert.ToDateTime("2020-10-14T00:00:00.000+00:00").Date
                             select ba;

                // Name
                if (!string.IsNullOrEmpty(name) && !string.IsNullOrWhiteSpace(name))
                {
                    if (name.IndexOf(",") > 0)
                    {
                        string[] arr = name.ToLower().Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => arr.Contains(x.HCP_FIRST_NAME.ToLower()) || arr.Contains(x.HCP_MIDDLE_NAME.ToLower()) || arr.Contains(x.HCP_LAST_NAME.ToLower()) || arr.Contains(x.HCO_NAME.ToLower()));
                    }
                    else
                    {
                        baData = baData.Where(
                                x => x.HCP_FIRST_NAME.ToLower().Contains(name.ToLower()) ||
                                x.HCP_MIDDLE_NAME.ToLower().Contains(name.ToLower()) ||
                                x.HCP_LAST_NAME.ToLower().Contains(name.ToLower()) ||
                                x.HCO_NAME.ToLower().Contains(name.ToLower())
                            );
                    }
                }

                // Request Type
                if (!string.IsNullOrEmpty(request_type) && !string.IsNullOrWhiteSpace(request_type))
                {
                    if (request_type.IndexOf(",") > 0)
                    {
                        string[] arr = request_type.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.REQ_TYPE) && arr.Contains(x.REQ_TYPE));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.REQ_TYPE) && x.REQ_TYPE.Equals(request_type));
                    }
                }

                // Exception Description
                if (!string.IsNullOrEmpty(exception) && !string.IsNullOrWhiteSpace(exception))
                {
                    if (exception.IndexOf(",") > 0)
                    {
                        string[] arr = exception.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.CR_MDM_COMMENT) && arr.Contains(x.CR_MDM_COMMENT));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.CR_MDM_COMMENT) && x.CR_MDM_COMMENT.Equals(exception));
                    }
                }

                // Source
                if (!string.IsNullOrEmpty(source) && !string.IsNullOrWhiteSpace(source))
                {
                    if (source.IndexOf(",") > 0)
                    {
                        string[] arr = source.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_NAME) && arr.Contains(x.SRC_NAME));
                    }
                    else
                    {
                        baData = baData.Where(x => !string.IsNullOrEmpty(x.SRC_NAME) && x.SRC_NAME.Equals(source));
                    }
                }

                // Processed
                if (!string.IsNullOrEmpty(processed_date) && !string.IsNullOrWhiteSpace(processed_date))
                {
                    if (processed_date.IndexOf(" · ") > 0)
                    {
                        string[] str = processed_date.Split(new char[] { '·' });
                        string datestart = str[0];
                        string dateend = str[1];

                        DateTime sDate = Convert.ToDateTime(datestart);
                        DateTime eDate = Convert.ToDateTime(dateend);

                        baData = baData.Where(
                                x => x.CR_EXCEPTION_PROCESSED != null &&
                                x.CR_EXCEPTION_PROCESSED >= Convert.ToDateTime(sDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff")) &&
                                x.CR_EXCEPTION_PROCESSED <= Convert.ToDateTime(eDate.Date.ToString("yyyy-MM-ddTHH:mm:ss.fff+ff:ff"))
                            );
                    }
                    else
                    {
                        baData = baData.Where(x => x.CR_EXCEPTION_PROCESSED != null && x.CR_EXCEPTION_PROCESSED.Equals(String.Format("{0}T00:00:00.000+00:00", processed_date)));
                    }
                }

                // Status
                if (!string.IsNullOrEmpty(status) && !string.IsNullOrWhiteSpace(status))
                {
                    if (status.IndexOf(",") > 0)
                    {
                        string[] arr = status.Split(new char[] { ',' });

                        baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Equals("False") || x.CR_EXCEPTION_STATUS.Equals("True")) && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) || string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION)) && (x.CR_EXCEPTION_PROCESSED != null || x.CR_EXCEPTION_PROCESSED == null));
                    }
                    else
                    {
                        if (status.ToLower().Equals("closed"))
                        {
                            baData = baData.Where(x => x.CR_EXCEPTION_STATUS.Equals("False") && !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_PROCESSED != null);
                        }
                        else if (status.ToLower().Equals("open"))
                        {
                            baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Equals("True") || x.CR_EXCEPTION_STATUS.Equals("False")) && (string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) || !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION)) && x.CR_EXCEPTION_PROCESSED == null);
                        }
                    }
                }

                // Final Exception/Result
                if (!string.IsNullOrEmpty(final_exception) && !string.IsNullOrWhiteSpace(final_exception))
                {
                    if (final_exception.IndexOf(",") > 0)
                    {
                        string[] arr = final_exception.Split(new char[] { ',' });

                        arr = arr.Where(x => !string.IsNullOrEmpty(x)).ToArray();

                        if (arr.Count() == 2) // count 2
                        {
                            if (arr.Contains("In Progress") && arr.Contains("Approved"))
                            {
                                baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Contains("True") && !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_PROCESSED == null) || (x.CR_EXCEPTION_STATUS.Contains("False") && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_ACTION.Equals("Approved")) && x.CR_EXCEPTION_PROCESSED != null));
                            }
                            else if (arr.Contains("In Progress") && arr.Contains("Rejected"))
                            {
                                baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Contains("True") && !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_PROCESSED == null) || (x.CR_EXCEPTION_STATUS.Contains("False") && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_ACTION.Equals("Rejected")) && x.CR_EXCEPTION_PROCESSED != null));
                            }
                            else if (!arr.Contains("In Progress"))
                            {
                                baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Contains("False") && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && arr.Contains(x.CR_EXCEPTION_ACTION)) && x.CR_EXCEPTION_PROCESSED != null));
                            }
                        }
                        else if (arr.Count() == 3) // count 3
                        {
                            baData = baData.Where(x => (x.CR_EXCEPTION_STATUS.Contains("True") && !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_PROCESSED == null) || (x.CR_EXCEPTION_STATUS.Contains("False") && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && arr.Contains(x.CR_EXCEPTION_ACTION)) && x.CR_EXCEPTION_PROCESSED != null));
                        }
                    }
                    else
                    {
                        if (final_exception == "In Progress")
                        {
                            // In Progress (if ‘Status’ = ‘Open’ & ‘Approve or Rejected’ has been selected & awaiting our nightly processing)
                            baData = baData.Where(x => x.CR_EXCEPTION_STATUS.Contains("True") && !string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_PROCESSED == null);
                        }
                        else if (final_exception == "Approved" || final_exception == "Rejected")
                        {
                            // Approved or Rejected (if ‘Status’ = ‘Closed’ which triggers the nightly processing date to be displayed in ‘Processed’ field)
                            baData = baData.Where(x => x.CR_EXCEPTION_STATUS.Contains("False") && (!string.IsNullOrEmpty(x.CR_EXCEPTION_ACTION) && x.CR_EXCEPTION_ACTION.Equals(final_exception)) && x.CR_EXCEPTION_PROCESSED != null);
                        }
                    }
                }

                var totalExceptions = baData.Count();

                var openExceptions = (from r in baData
                                      where r.CR_EXCEPTION_STATUS.Equals("True") && r.CR_EXCEPTION_PROCESSED == null
                                      select r).Count();

                var closedExceptions = (from r in baData
                                        where r.CR_EXCEPTION_STATUS.Equals("False") && !string.IsNullOrEmpty(r.CR_EXCEPTION_ACTION) && r.CR_EXCEPTION_PROCESSED != null
                                        select r).Count();

                var totalApproved = (from r in baData
                                     where r.CR_EXCEPTION_STATUS.Equals("False") && r.CR_EXCEPTION_ACTION.Equals("Approved") && !string.IsNullOrEmpty(r.CR_EXCEPTION_ACTION) && r.CR_EXCEPTION_PROCESSED != null
                                     select r).Count();

                var totalRejected = (from r in baData
                                     where r.CR_EXCEPTION_STATUS.Equals("False") && r.CR_EXCEPTION_ACTION.Equals("Rejected") && !string.IsNullOrEmpty(r.CR_EXCEPTION_ACTION) && r.CR_EXCEPTION_PROCESSED != null
                                     select r).Count();

                var json = new
                {
                    data = new
                    {
                        totalExceptions = totalExceptions,
                        openExceptions = openExceptions,
                        closedExceptions = closedExceptions,
                        totalApproved = totalApproved,
                        totalRejected = totalRejected
                    },
                    length = (int)totalExceptions
                };

                return Json(new { data = json });
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public JsonResult GetStewardshipDataSentInfo(string cr_stewardship_id)
        {
            var query = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(cr_stewardship_id))
                {
                    query = from ba in dataStewardshipCollection.AsQueryable()
                            where ba.transaction_id.Contains(cr_stewardship_id)
                            select new
                            {
                                transaction_id = ba.transaction_id,
                                HCP_MDM_ID = ba.HCP_MDM_ID,
                                fname = ba.sent_info != null ? ba.sent_info.FirstName : "",
                                lname = ba.sent_info != null ? ba.sent_info.LastName : "",
                                mname = ba.sent_info != null ? ba.sent_info.MiddleName : "",
                                credentials = ba.sent_info != null ? ba.sent_info.Credentials : "",
                                npi = ba.sent_info != null ? ba.sent_info.NPI : "",
                                pry_specialty = ba.sent_info != null ? ba.sent_info.PrimarySpecialty : "",
                                sec_specialty = ba.sent_info != null ? ba.sent_info.SecondarySpecialty : "",
                                address_1 = ba.sent_info != null ? ba.sent_info.AddressLine1 : "",
                                address_2 = ba.sent_info != null ? ba.sent_info.AddressLine2 : "",
                                city = ba.sent_info != null ? ba.sent_info.City : "",
                                state = ba.sent_info != null ? ba.sent_info.State : "",
                                zip_code = ba.sent_info != null ? ba.sent_info.PostalCode : ""
                            };
                }

                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpGet]
        public JsonResult GetExceptionDescription()
        {
            try
            {
                var query = (from c in changeRequestCollection.AsQueryable()
                             where c.CR_EXCEPTION_CREATED != null && !string.IsNullOrEmpty(c.CR_EXCEPTION_DESC) && !string.IsNullOrEmpty(c.CR_MDM_COMMENT)
                             select new { c.CR_MDM_COMMENT }).Distinct().OrderBy(x => x.CR_MDM_COMMENT);

                object json = new { data = query };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet, MaxJsonLength = int.MaxValue };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
        }

        [HttpPost]
        public JsonResult GetException(string cr_id)
        {
            var query = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(cr_id))
                {
                    query = from ba in changeRequestCollection.AsQueryable()
                            where ba.CR_ID.Equals(cr_id)
                            select ba;
                }

                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpGet]
        public string GetToken()
        {
            return tokenCollection.AsQueryable().FirstOrDefault().access_token;
        }

        [HttpPost]
        public JsonResult FlagUpdatedValueById(string hcp_mdm_id, string hco_mdm_id)
        {
            var query = (dynamic)null;
            var d = DateTime.Now.ToString("yyyy-MM-d") + "T00:00:00.000+00:00";

            try
            {
                if (!string.IsNullOrEmpty(hcp_mdm_id))
                {
                    query = from cr in changeRequestCollection.AsQueryable()
                            where cr.CR_TYPE.Equals("HCP") && cr.HCP_MDM_ID.Equals(hcp_mdm_id) /*&& cr.CR_CREATION_DATE <= Convert.ToDateTime(d).Date*/
                            orderby cr.CR_CREATION_DATE descending
                            select cr;

                    
                }
                else if (!string.IsNullOrEmpty(hco_mdm_id))
                {
                    query = from cr in changeRequestCollection.AsQueryable()
                            where cr.CR_TYPE.Equals("HCO") && cr.HCO_MDM_ID.Equals(hco_mdm_id) /*&& cr.CR_CREATION_DATE <= Convert.ToDateTime(d).Date*/
                            orderby cr.CR_CREATION_DATE descending
                            select cr;
                }

                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                return new JsonResult { Data = e };
            }
        }

        [HttpPost]
        public ActionResult LoadHcpChangeRequestData(string hcp_mdm_id)
        {
            try
            {
                var query = from ba in changeRequestCollection.AsQueryable(new AggregateOptions { AllowDiskUse = true })
                            where (!ba.CR_STATUS.Equals("Approved") && !ba.CR_STATUS.Equals("Denied")) && ba.HCP_MDM_ID.Equals(hcp_mdm_id)
                            select ba;

                // Returning Json Data
                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public ActionResult LoadHcoChangeRequestData(string hco_mdm_id)
        {
            try
            {
                var query = from ba in changeRequestCollection.AsQueryable(new AggregateOptions { AllowDiskUse = true })
                             where (!ba.CR_STATUS.Equals("Approved") && !ba.CR_STATUS.Equals("Denied")) && ba.HCO_MDM_ID.Equals(hco_mdm_id)
                             select ba;

                // Returning Json Data
                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public ActionResult GetHCOChangeRequestIds(string client_id, string type)
        {
            try
            {
                var query = from ba in changeRequestCollection.AsQueryable(new AggregateOptions { AllowDiskUse = true })
                            where (!ba.CR_STATUS.Equals("Approved") && !ba.CR_STATUS.Equals("Denied")) && ba.CR_TYPE.Equals(type) && ba.HCO_MDM_ID.Equals(client_id)
                            select new {
                                ba.HCO_NPI_ID,
                                ba.HCO_SHS_ID,
                                ba.HCO_CRM_ID,
                                ba.HCO_DEA_ID,
                                ba.HCO_HIN_ID,
                                ba.HCO_DUNS_ID,
                                ba.HCO_POS_ID,
                                ba.HCO_FED_TAX_ID,
                                ba.HCO_GLN_ID,
                                ba.HCO_OPENDATA_ID,
                                ba.HCO_ONEKEY_ID
                            };

                // Returning Json Data
                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public ActionResult GetHCPChangeRequestIds(string client_id, string type)
        {
            try
            {
                var query = from ba in changeRequestCollection.AsQueryable(new AggregateOptions { AllowDiskUse = true })
                            where (!ba.CR_STATUS.Equals("Approved") && !ba.CR_STATUS.Equals("Denied")) && ba.CR_TYPE.Equals(type) && ba.HCP_MDM_ID.Equals(client_id)
                            select new
                            {
                                ba.HCP_NPI_ID,
                                ba.HCP_SHS_ID,
                                ba.HCP_CRM_ID,
                                ba.HCP_AMA_ID,
                                ba.HCP_DEA_ID,
                                ba.HCP_AOA_ID,
                                ba.HCP_ADA_ID,
                                ba.HCP_AAPA_ID,
                                ba.HCP_ACNM_ID,
                                ba.HCP_MSCHST_ID,
                                ba.HCP_AOPA_ID,
                                ba.HCP_MEDICAID_ID,
                                ba.HCP_OPENDATA_ID,
                                ba.HCP_ONEKEY_ID,
                                ba.HCP_UPIN_ID,
                                ba.HCP_FED_TAX_ID
                            };

                // Returning Json Data
                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                return Json(new { data = e.Message });
            }
        }

        [HttpPost]
        public JsonResult GetProfileHcpIds(string client_id)
        {
            var query = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(client_id))
                {
                    query = from ph in detailsCollection.AsQueryable()
                            where ph.HCP_MDM_ID.Equals(client_id)
                            select new { ph.ID };
                }

                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }

        [HttpPost]
        public JsonResult GetProfileHcoIds(string client_id)
        {
            var query = (dynamic)null;

            try
            {
                if (!string.IsNullOrEmpty(client_id))
                {
                    query = from ph in hcoDetailsCollection.AsQueryable()
                            where ph.HCO_MDM_ID.Equals(client_id)
                            select new { ph.ID };
                }

                return new JsonResult { Data = query };
            }
            catch (Exception e)
            {
                object json = new { status = "error", error = e.Message };

                return new JsonResult { Data = json };
            }
        }
    }
}