using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MDM_Portal.Models
{
    public class HCPUserModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string firstname { get; set; }
        public string lastname { get; set; }
        public string password { get; set; }
        public string resetpasswordcode { get; set; }
        public string role { get; set; }
        public string territory { get; set; }
        public string status { get; set; }
        public string creationdate { get; set; }
        public string lastmodifieddate { get; set; }
        public string created_by { get; set; }
        public string modified_by { get; set; }
    }
}