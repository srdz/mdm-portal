using System;
using System.Collections.Generic;
using System.DirectoryServices;
using System.Linq;
using System.Text;
using System.Web;

namespace MDM_Portal.Models
{
    public class LdapAuthentication
    {
        private string _path = "LDAP://...";

        public LdapAuthentication()
        {
        }

        public string GetUserADFullName()
        {
            string full_name = string.Empty;

            using (DirectoryEntry directoryEntry = new DirectoryEntry(_path, "username", "password"))
            {
                using (DirectorySearcher searcher = new DirectorySearcher(directoryEntry))
                {
                    searcher.Filter = String.Format(@"(&(objectClass=user)(sAMAccountName={0}))", "username");
                    searcher.PropertiesToLoad.Add("displayName");
                    searcher.PropertiesToLoad.Add("mail");
                    searcher.PropertiesToLoad.Add("userPrincipalName");
                    searcher.PropertiesToLoad.Add("userAccountControl");

                    SearchResult adsSearchResult = searcher.FindOne();

                    if (adsSearchResult != null)
                    {
                        if (adsSearchResult.Properties["displayName"].Count == 1)
                        {
                            full_name = (string)adsSearchResult.Properties["displayName"][0];
                        }
                    }
                }
            }

            return full_name;
        }
    }
}