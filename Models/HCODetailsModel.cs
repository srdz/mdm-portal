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
    public class HCODetailsModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string HCO_MDM_ID { get; set; }
        public dID ID { get; set; }
        public List<dName> Name { get; set; }
        public List<Class_Of_Trade> class_of_trade { get; set; }
        public List<Facility_Type> facility_type { get; set; }
        public string Target { get; set; }
        public string Status { get; set; }
        public List<dAddress> Address { get; set; }

        public class dID
        {
            public List<dHCO_MDM_ID> HCO_MDM_ID { get; set; }
            public List<NPI> NPI { get; set; }
            public List<CRM_ID> CRM_ID { get; set; }
            public List<SHS_ID> SHS_ID { get; set; }
            public List<DEA> DEA { get; set; }
            public List<HIN> HIN { get; set; }
            public List<DS_ACCT_ID> DS_ACCT_ID { get; set; }
            public List<HOSP_ID> HOSP_ID { get; set; }
        }

        public class dHCO_MDM_ID
        {
            public string value { get; set; }
            public string date { get; set; }
            public string source { get; set; }
        }

        public class NPI
        {
            public string value { get; set; }
            public string date { get; set; }
            public string source { get; set; }
        }

        public class CRM_ID
        {
            public string value { get; set; }
            public string date { get; set; }
            public string source { get; set; }
        }

        public class SHS_ID
        {
            public string value { get; set; }
            public string date { get; set; }
            public string source { get; set; }
        }

        public class HIN
        {
            public string value { get; set; }
            public string date { get; set; }
            public string source { get; set; }
        }

        public class DS_ACCT_ID
        {
            public string value { get; set; }
            public string date { get; set; }
            public string source { get; set; }
        }

        public class HOSP_ID
        {
            public string value { get; set; }
            public string date { get; set; }
            public string source { get; set; }
        }

        public class dName
        {
            public string value { get; set; }
            public string source { get; set; }
            public string date { get; set; }
        }

        public class Class_Of_Trade
        {
            public string value { get; set; }
            public string source { get; set; }
            public string date { get; set; }
        }

        public class Facility_Type
        {
            public string value { get; set; }
            public string date { get; set; }
            public string source { get; set; }
        }

        public class dAddress
        {
            public string Address { get; set; }
            public string Address_ID { get; set; }
            public string address_1 { get; set; }
            public string address_2 { get; set; }
            public string city { get; set; }
            public string date { get; set; }
            public string lat { get; set; }
            public string lon { get; set; }
            public string state { get; set; }
            public string zip { get; set; }
            public object source { get; set; }
        }
    }
}