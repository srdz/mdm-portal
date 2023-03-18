using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace MDM_Portal.Models
{
    [BsonIgnoreExtraElements]
    public class DataStewardshipModel
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public string _id { get; set; }
        public string transaction_id { get; set; }

        [BsonIgnoreIfNull]
        public string HCP_MDM_ID { get; set; }

        [BsonElement("Sintan Transaction ID")]
        public string SintanTransactionID { get; set; }
        public string source { get; set; }
        public CRM_Info CRM_info { get; set; }

        [BsonIgnoreIfNull]
        public Change Change { get; set; }

        [BsonIgnoreIfNull]
        public Sent_Info sent_info { get; set; }

        [BsonIgnoreIfNull]
        public Receive_Info receive_info { get; set; }
        public Steward_Status Steward_Status { get; set; }

        [BsonIgnore]
        public Update Update { get; set; }
        public Result Result { get; set; }
        public string project { get; set; }
    }

    public class CRM_Info
    {
        public string dcr_id { get; set; }
        public string dcr_line_id { get; set; }
        public string CRM_ID { get; set; }
        public string CRM_Address_ID_old { get; set; }
        public string CRM_Address_ID_new { get; set; }
    }

    public class Change
    {
        public string field { get; set; }
        public string old_value { get; set; }
        public string new_value { get; set; }
    }

    public class Sent_Info
    {
        public string Customer { get; set; }

        [BsonElement("Symphony Transaction ID")]
        public string SymphonyTransactionID { get; set; }

        [BsonElement("Customer Record ID")]
        public string CustomerRecordID { get; set; }

        [BsonElement("Record Type")]
        public string RecordType { get; set; }

        [BsonElement("Suffix Name")]
        public string SuffixName { get; set; }

        [BsonElement("First Name")]
        public string FirstName { get; set; }

        [BsonElement("Middle Name")]
        public string MiddleName { get; set; }

        [BsonElement("Last Name")]
        public string LastName { get; set; }
        public string Gender { get; set; }
        public string Credentials { get; set; }
        public string NPI { get; set; }

        [BsonElement("Primary Specialty")]
        public string PrimarySpecialty { get; set; }

        [BsonElement("Secondary Specialty")]
        public string SecondarySpecialty { get; set; }

        [BsonElement("Address Line 1")]
        public string AddressLine1 { get; set; }

        [BsonElement("Address Line 2")]
        public string AddressLine2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }

        [BsonElement("Postal Code")]
        public string PostalCode { get; set; }
        public string Country { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
        public string Primary { get; set; }

        [BsonElement("Last update date")]
        public string Lastupdatedate { get; set; }
        public string Organization { get; set; }
    }

    public class Receive_Info
    {
        public string Customer { get; set; }

        [BsonElement("Symphony Transaction ID")]
        public string SymphonyTransactionID { get; set; }

        [BsonElement("Sintan Transaction ID")]
        public string SintanTransactionID { get; set; }

        [BsonElement("First Name")]
        public string FirstName { get; set; }

        [BsonElement("Last Name")]
        public string LastName { get; set; }

        [BsonElement("Middle Name")]
        public string MiddleName { get; set; }

        [BsonElement("Suffix Name")]
        public string SuffixName { get; set; }
        public string Gender { get; set; }
        public string Credentials { get; set; }

        [BsonElement("HCP Type")]
        public string HCPType { get; set; }
        public string NPI { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }

        [BsonElement("Phone Extension")]
        public string PhoneExtension { get; set; }
        public string Website { get; set; }

        [BsonElement("Primary Specialty")]
        public string PrimarySpecialty { get; set; }

        [BsonElement("Secondary Specialty")]
        public string SecondarySpecialty { get; set; }

        [BsonElement("Institution Name")]
        public string InstitutionName { get; set; }

        [BsonElement("Address Line 1")]
        public string AddressLine1 { get; set; }

        [BsonElement("Address Line 2")]
        public string AddressLine2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }

        [BsonElement("Postal Code")]
        public string PostalCode { get; set; }

        [BsonElement("Country code")]
        public string Countrycode { get; set; }

        [BsonElement("Primary - Original")]
        public string PrimaryOriginal { get; set; }

        [BsonElement("Primary Address Flag")]
        public string PrimaryAddressFlag { get; set; }

        [BsonElement("Symphony ID of the Master Profile")]
        public string SymphonyIDoftheMasterProfile { get; set; }

        [BsonElement("Reason for Marking as Duplicate")]
        public string ReasonforMarkingasDuplicate { get; set; }

        [BsonElement("Online Validation Status")]
        public string OnlineValidationStatus { get; set; }

        [BsonElement("Online Validation Timestamp")]
        public string OnlineValidationTimestamp { get; set; }

        [BsonElement("Phone Validation Status")]
        public string PhoneValidationStatus { get; set; }

        [BsonElement("Phone Validation Timestamp")]
        public string PhoneValidationTimestamp { get; set; }
        public string Comments { get; set; }
    }
    
    public class Steward_Status
    {
        public DateTime? created { get; set; }
        public DateTime? submitted { get; set; }
        public DateTime? received { get; set; }
    }

    public class Update
    {
        public string CRM { get; set; }
        public string MDM { get; set; }
        public string error { get; set; }
    }

    public class Result
    {
        public string valid { get; set; }
        public string sent_to_client { get; set; }
    }
}