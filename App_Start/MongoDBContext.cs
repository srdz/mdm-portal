using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MongoDB.Driver;
using System.Configuration;
using System.Security.Cryptography.X509Certificates;
using MongoDB.Bson;

namespace MDM_Portal.App_Start
{
    public class MongoDBContext
    {
        public IMongoDatabase database;

        public MongoDBContext()
        {
            string url = "mongodb://...";

            if (!string.IsNullOrEmpty(url))
            {
                int pos = url.LastIndexOf("/") + 1;
                var server_database = url.Substring(pos, url.Length - pos);

                var mongoClient = new MongoClient(url);
                database = mongoClient.GetDatabase(server_database);
            }
        }  
    }
}