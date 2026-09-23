using System.Text.Json.Serialization;
using System.Xml.Serialization;

namespace Hinet.Service.MoitEnterpriseLookupService.Dto
{
    [XmlRoot(ElementName = "LoginRequest", Namespace = "http://dichvucong.moit.gov.vn/api/v1")]
    public class MoitLookupLoginRequest
    {
        [XmlElement(ElementName = "Username")]
        public string Username { get; set; }

        [XmlElement(ElementName = "Password")]
        public string Password { get; set; }
    }

    [XmlRoot(ElementName = "LoginResponse", Namespace = "http://dichvucong.moit.gov.vn/api/v1")]
    public class MoitLookupLoginResponse
    {
        [XmlElement(ElementName = "ErrorCode")]
        public int ErrorCode { get; set; }

        [XmlElement(ElementName = "Message")]
        public string Message { get; set; }

        [XmlElement(ElementName = "Token")]
        public string Token { get; set; }

        [XmlElement(ElementName = "ExpiresIn")]
        public int ExpiresIn { get; set; }

        [XmlElement(ElementName = "ExpiresAt")]
        public long ExpiresAt { get; set; }
    }

    public class MoitLookupResponse
    {
        [JsonPropertyName("affectedRows")]
        public int AffectedRows { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; }

        [JsonPropertyName("data")]
        public MoitLookupDataWrapper Data { get; set; }
    }

    public class MoitLookupDataWrapper
    {
        [JsonPropertyName("Status")]
        public int Status { get; set; }

        [JsonPropertyName("DataCount")]
        public int DataCount { get; set; }

        [JsonPropertyName("Data")]
        public MoitEnterpriseDetail Data { get; set; }
    }

    public class MoitEnterpriseDetail
    {
        [JsonPropertyName("MainInformation")]
        public MoitEnterpriseMainInfo MainInformation { get; set; }

        [JsonPropertyName("HOAdress")]
        public MoitEnterpriseAddress HOAdress { get; set; }

        [JsonPropertyName("Representatives")]
        public MoitEnterpriseRepresentative Representatives { get; set; }
    }

    public class MoitEnterpriseMainInfo
    {
        [JsonPropertyName("ENTERPRISE_ID")]
        public long EnterpriseId { get; set; }

        [JsonPropertyName("ENTERPRISE_CODE")]
        public string EnterpriseCode { get; set; }

        [JsonPropertyName("ENTERPRISE_GDT_CODE")]
        public string EnterpriseGdtCode { get; set; }

        [JsonPropertyName("NAME")]
        public string Name { get; set; }

        [JsonPropertyName("NAME_F")]
        public string NameF { get; set; }

        [JsonPropertyName("SHORT_NAME")]
        public string ShortName { get; set; }

        [JsonPropertyName("ENTERPRISE_STATUS_ID")]
        public string EnterpriseStatusId { get; set; }

        [JsonPropertyName("ENTERPRISE_STATUS_NAME")]
        public string EnterpriseStatusName { get; set; }

        [JsonPropertyName("ENTERPRISE_TYPE_ID")]
        public string EnterpriseTypeId { get; set; }

        [JsonPropertyName("ENTERPRISE_TYPE_NAME")]
        public string EnterpriseTypeName { get; set; }

        [JsonPropertyName("FOUNDING_DATE")]
        public string FoundingDate { get; set; }

        [JsonPropertyName("LAST_AMEND_DATE")]
        public string LastAmendDate { get; set; }

        [JsonPropertyName("CAPITAL_AMOUNT")]
        public decimal CapitalAmount { get; set; }

        [JsonPropertyName("NUMBER_CHANGES")]
        public int NumberChanges { get; set; }
    }

    public class MoitEnterpriseAddress
    {
        [JsonPropertyName("CityID")]
        public int CityId { get; set; }

        [JsonPropertyName("CityName")]
        public string CityName { get; set; }

        [JsonPropertyName("DistrictID")]
        public int DistrictId { get; set; }

        [JsonPropertyName("DistrictName")]
        public string DistrictName { get; set; }

        [JsonPropertyName("WardID")]
        public int WardId { get; set; }

        [JsonPropertyName("WardName")]
        public string WardName { get; set; }

        [JsonPropertyName("StreetNumber")]
        public string StreetNumber { get; set; }

        [JsonPropertyName("AddressFullText")]
        public string AddressFullText { get; set; }
    }

    public class MoitEnterpriseRepresentative
    {
        [JsonPropertyName("FULL_NAME")]
        public string FullName { get; set; }

        [JsonPropertyName("GENDER_ID")]
        public string GenderId { get; set; }

        [JsonPropertyName("PERS_DOC_NO")]
        public string PersDocNo { get; set; }

        [JsonPropertyName("PERS_DOC_NAME")]
        public string PersDocName { get; set; }

        [JsonPropertyName("PERS_DOC_ISSUE_DATE")]
        public string PersDocIssueDate { get; set; }

        [JsonPropertyName("PERS_DOC_ISSUE_PLACE")]
        public string PersDocIssuePlace { get; set; }

        [JsonPropertyName("PERS_DOC_EXPIRE_DATE")]
        public string PersDocExpireDate { get; set; }

        [JsonPropertyName("DATE_OF_BIRTH")]
        public string DateOfBirth { get; set; }

        [JsonPropertyName("NATIONALITY_NAME")]
        public string NationalityName { get; set; }
    }
}
