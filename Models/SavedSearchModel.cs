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
    public class SavedSearchModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string search_name { get; set; }
        public string search_value { get; set; }
        public string table { get; set; }
        public string user { get; set; }
    }
}