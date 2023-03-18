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
    public class HCPHCOAffiliationModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string HCP_MDM_ID { get; set; }
        public string HCO_MDM_ID { get; set; }
        public string TIKA_HCO_ID { get; set; }
        public string TIKA_HCP_ID { get; set; }
        public string CHILD { get; set; }
        public string PARENT { get; set; }
        public string PRIMARY_AFFILIATION { get; set; }
        public string AFFILIATION_START { get; set; }
        public string AFFILIATION_END { get; set; }
        public List<History> history { get; set; }

        public class History
        {
            public string action { get; set; }
            public string primary { get; set; }
            public string date { get; set; }
        }
    }
}