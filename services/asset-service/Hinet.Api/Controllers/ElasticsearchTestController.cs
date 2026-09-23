using Elastic.Clients.Elasticsearch;
using Microsoft.AspNetCore.Mvc;

namespace Hinet.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ElasticsearchTestController : ControllerBase
    {
        private readonly ElasticsearchClient _client;

        public ElasticsearchTestController(ElasticsearchClient client)
        {
            _client = client;
        }

        [HttpPost("insert-sample")]
        public async Task<IActionResult> InsertSample()
        {
            var document = new SampleDocument
            {
                Id = Guid.NewGuid().ToString(),
                Title = "Test Document Elasticsearch",
                Content = "This is a sample document inserted into Elasticsearch for testing.",
                CreatedAt = DateTime.UtcNow
            };

            var response = await _client.IndexAsync(document, idx => idx.Index("sample-index").Id(document.Id));

            if (response.IsValidResponse)
            {
                return Ok(new { Message = "Inserted successfully", DocumentId = document.Id });
            }
            return BadRequest(new { Message = "Failed to insert", Details = response.DebugInformation });
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return BadRequest("Query parameter is required.");
            }

            var response = await _client.SearchAsync<SampleDocument>(s => s
                .Index("sample-index")
                .Query(q => q
                    .QueryString(qs => qs
                        .Query(query)
                    )
                )
            );

            if (response.IsValidResponse)
            {
                return Ok(response.Documents);
            }
            return BadRequest(new { Message = "Failed to search", Details = response.DebugInformation });
        }
    }

    public class SampleDocument
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
