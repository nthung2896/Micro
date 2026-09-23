using System.Text.Json.Serialization;

namespace Hinet.Service.SsoKeycloakService.Dto
{
    public class KeycloakTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("refresh_expires_in")]
        public int RefreshExpiresIn { get; set; }

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; }

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; }

        [JsonPropertyName("id_token")]
        public string IdToken { get; set; }

        [JsonPropertyName("scope")]
        public string Scope { get; set; }
    }

    public class KeycloakUserInfo
    {
        [JsonPropertyName("sub")]
        public string Sub { get; set; }

        [JsonPropertyName("email_verified")]
        public bool EmailVerified { get; set; }

        [JsonPropertyName("preferred_username")]
        public string PreferredUsername { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("given_name")]
        public string GivenName { get; set; }

        [JsonPropertyName("family_name")]
        public string FamilyName { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("identity_number")]
        public string IdentityNumber { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; }

        // Custom attributes from Keycloak VNPT v1.2
        [JsonPropertyName("accountType")]
        public string AccountType { get; set; }

        [JsonPropertyName("transactionCode")]
        public string TransactionCode { get; set; }

        [JsonPropertyName("accountLevel")]
        public string AccountLevel { get; set; }

        [JsonPropertyName("citizenPid")]
        public string CitizenPid { get; set; }

        [JsonPropertyName("fullName")]
        public string FullName { get; set; }

        [JsonPropertyName("birthDate")]
        public string BirthDate { get; set; }

        [JsonPropertyName("orgPid")]
        public string OrgPid { get; set; }

        [JsonPropertyName("orgName")]
        public string OrgName { get; set; }

        [JsonPropertyName("taxCode")]
        public string TaxCode { get; set; }

        [JsonPropertyName("orgIdentifier")]
        public string OrgIdentifier { get; set; }

        [JsonPropertyName("orgCategoryCode")]
        public string OrgCategoryCode { get; set; }
    }
}
