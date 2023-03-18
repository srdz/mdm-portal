using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;

namespace MDM_Portal.Models
{
    [BsonIgnoreExtraElements]
    public class HCOAffiliationModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string HCO_MDM_ID { get; set; }
        public int NPI { get; set; }
        public string Address_ID { get; set; }
        public string best_address { get; set; }
        public string source { get; set; }
        public History[] history { get; set; }
        public aContact Contact { get; set; }
        public string CRM_Address_ID { get; set; }
        public string CRM_ID { get; set; }
        public string Target { get; set; }

        public class aContact
        {
            public Fax[] fax { get; set; }
            public Website[] website { get; set; }
            public Phone[] phone { get; set; }
            public Email[] email { get; set; }
        }

        public class Fax
        {
            public string date { get; set; }
            public string source { get; set; }
            public string value { get; set; }
        }

        public class Website
        {
            public string date { get; set; }
            public string source { get; set; }
            public string value { get; set; }
        }

        public class Phone
        {
            public string date { get; set; }
            public string source { get; set; }
            public string value { get; set; }
        }

        public class Email
        {
            public string date { get; set; }
            public string source { get; set; }
            public string value { get; set; }
        }

        public class History
        {
            public string source { get; set; }
            public int rank { get; set; }
            public string date { get; set; }
        }
    }
}