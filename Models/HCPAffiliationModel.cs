using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MDM_Portal.Models
{
    [BsonIgnoreExtraElements]
    public class HCPAffiliationModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }

        public string HCP_MDM_ID { get; set; }
        public string Address_ID { get; set; }
        public string NPI { get; set; }
        public string best_address { get; set; }
        public string source { get; set; }
        public History[] history { get; set; }
        public string CRM_ID { get; set; }
        public string CRM_Address_ID { get; set; }
        public AffiliationSpecialty[] Specialty { get; set; }
        public string Target { get; set; }
        public Contact Contact { get; set; }
    }

    public class Contact
    {
        public object[] phone { get; set; }
        public object[] email { get; set; }
        public object[] website { get; set; }
    }

    public class History
    {
        public string source { get; set; }
        public string rank { get; set; }
        public string date { get; set; }
    }

    public class AffiliationSpecialty
    {
        public string value { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }
}