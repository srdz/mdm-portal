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
    public class HCPDetailsModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string HCP_MDM_ID { get; set; }
        public ID ID { get; set; }
        public List<Name> Name { get; set; }
        public List<Degree> Degree { get; set; }
        public Specialty Specialty { get; set; }
        public List<Customer_Data> Customer_data { get; set; }
        public string Target { get; set; }
        public string Status { get; set; }
        public List<Addresses> Address { get; set; }
    }

    public class ID
    {
        public List<NPI> NPI { get; set; }
        public List<REL_ID> REL_ID { get; set; }
        public List<CRM_ID> CRM_ID { get; set; }
        public List<SHS_ID> SHS_ID { get; set; }
        public List<DEA> DEA { get; set; }
        public List<ME_ID> ME_ID { get; set; }
        public List<MEDPRO_ID> MEDPRO_ID { get; set; }
    }

    public class NPI
    {
        public string source { get; set; }
        public string value { get; set; }
        public string date { get; set; }
    }

    public class SHS_ID
    {
        public string source { get; set; }
        public string value { get; set; }
        public string date { get; set; }
    }

    public class MEDPRO_ID
    {
        public string source { get; set; }
        public string value { get; set; }
        public string date { get; set; }
    }

    public class REL_ID
    {
        public string value { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }

    public class CRM_ID
    {
        public string value { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }

    public class DEA
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class ME_ID
    {
        public string value { get; set; }
        public string date { get; set; }
        public string source { get; set; }
    }

    public class Name
    {
        public string value { get; set; }
        public string first { get; set; }
        public string last { get; set; }
        public string source { get; set; }
        public string date { get; set; }
        public string middle { get; set; }
    }

    public class Degree
    {
        public string value { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }

    public class Specialty
    {
        public string value { get; set; }
        public string source { get; set; }
        public string date { get; set; }
        public string primary { get; set; }
    }

    public class Customer_Data
    {
        public string symphony_provider_id { get; set; }
        public string pdrp_indicator { get; set; }
        public string pdrp_date { get; set; }
        public string territory_id { get; set; }
        public string call_status_code { get; set; }
        public string ama_no_contact { get; set; }
        public string source { get; set; }
        public string date { get; set; }
    }

    public class Addresses
    {
        public string Address { get; set; }
        public string Address_ID { get; set; }
        public string address_1 { get; set; }
        public string address_2 { get; set; }
        public string city { get; set; }
        public string state { get; set; }
        public string zip { get; set; }
        public string date { get; set; }
        public string lat { get; set; }
        public string lon { get; set; }
        public string source { get; set; }
    }
}