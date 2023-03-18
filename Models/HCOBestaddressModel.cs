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
    public class HCOBestaddressModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string HCO_MDM_ID { get; set; }
        public string SHS_ID { get; set; }
        public string CRM_ID { get; set; }
        public string NPI { get; set; }
        public string name { get; set; }
        public DateTime name_date { get; set; }
        public string name_source { get; set; }
        public string status { get; set; }
        public string address_1 { get; set; }
        public string address_2 { get; set; }
        public string city { get; set; }
        public string state { get; set; }
        public string zip { get; set; }
        public string lat { get; set; }
        public string lon { get; set; }
        public string address_source { get; set; }
        public string fax { get; set; }
        public string phone { get; set; }
        public string website { get; set; }
        public string class_of_trade { get; set; }
        public string facility_type { get; set; }
        public string territory_id { get; set; }
        public string territory_name { get; set; }
        public string territory_date { get; set; }
        public string Under_Validation { get; set; }
        public DateTime address_date { get; set; }
        public List<Record_Source> record_source { get; set; }
    }

    public class Record_Source
    {
        public string value { get; set; }
        public DateTime date { get; set; }
    }
}