using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;

namespace MDM_Portal.Models
{
    [BsonIgnoreExtraElements]
    public class HCPBestAddressModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }

        public string HCP_MDM_ID { get; set; }
        public string SHS_ID { get; set; }
        public string CRM_ID { get; set; }
        public string NPI { get; set; }
        public string DEA { get; set; }
        public string ME_ID { get; set; }
        public string specialty { get; set; }
        public DateTime? specialty_date { get; set; }
        public string specialty_source { get; set; }
        public string first { get; set; }
        public string middle { get; set; }
        public string last { get; set; }
        public string full_name { get; set; }
        public DateTime? name_date { get; set; }
        public string name_source { get; set; }
        public string degree { get; set; }
        public DateTime? degree_date { get; set; }
        public string degree_source { get; set; }
        public string target { get; set; }
        public string status { get; set; }
        public string address_1 { get; set; }
        public string address_2 { get; set; }
        public string city { get; set; }
        public string state { get; set; }
        public string zip { get; set; }
        public string lat { get; set; }
        public string lon { get; set; }
        public string address_source { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string website { get; set; }
        public string territory_id { get; set; }
        public string territory_name { get; set; }
        public string territory_date { get; set; }
        public string Under_Validation { get; set; }
        public DateTime? address_date { get; set; }
        public List<dRecord_Source> record_source { get; set; }
    }

    public class dRecord_Source
    {
        public string value { get; set; }
        public DateTime? date { get; set; }
    }
}