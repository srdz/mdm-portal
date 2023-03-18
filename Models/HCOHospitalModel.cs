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
    public class HCOHospitalModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string HCO_MDM_ID { get; set; }
        public HCO_ID ID { get; set; }
        public HCO_Name Name { get; set; }
        public Class_Of_Trade class_of_trade { get; set; }
        public Sub_Class_Of_Trade sub_class_of_trade { get; set; }
        public Type type { get; set; }
        public Sub_type sub_type { get; set; }
        public Department department { get; set; }
        public IDN IDN { get; set; }

        [BsonIgnore]
        public string Customer_data { get; set; }
        public string Target { get; set; }
        public string Status { get; set; }
        public Metadata Metadata { get; set; }
        public Verified verified { get; set; }
    }

    public class HCO_ID
    {
        public List<DPH_HCO_ID> HCO_MDM_ID { get; set; }
        public List<HCO_NPI> NPI { get; set; }
        public List<HCO_CRM_ID> CRM_ID { get; set; }
        public List<HCO_SHS_ID> SHS_ID { get; set; }
        public List<HCO_DEA> DEA { get; set; }
        public List<HCO_HIN> HIN { get; set; }
        public List<HCO_DS_ACCT_ID> DS_ACCT_ID { get; set; }
        public List<HCO_HOSP_ID> HOSP_ID { get; set; }
    }

    public class HCO_NPI {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class HCO_DEA
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class HCO_HIN
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class HCO_HOSP_ID
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class DPH_HCO_ID
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class HCO_CRM_ID
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class HCO_SHS_ID
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class HCO_DS_ACCT_ID
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class FAC_ADDR_PHONE
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class FAC_ADDR_FAX
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class FACILITY_TIER
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class FLAG_340B
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class GPO_MEMBERSHIP
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class COMPLEX
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class NETWORK
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class FACILITY_CLASSIFICATION
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class Metadata
    {
        public string creation_date { get; set; }
        public string source { get; set; }
        public Status_History[] status_history { get; set; }
    }

    public class Status_History
    {
        public string status { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }

    public class Verified
    {
        public string cms { get; set; }
        public string usps { get; set; }
        public string tomtom { get; set; }
    }

    public class HCO_Name
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

    public class Sub_Class_Of_Trade
    {
        public string value { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }

    public class Type
    {
        public string value { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }

    public class Department
    {
        public string value { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }

    public class Sub_type
    {
        public string value { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }

    public class IDN
    {
        public string value { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }
}