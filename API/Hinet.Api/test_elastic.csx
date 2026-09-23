using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Elastic.Clients.Elasticsearch;
using Hinet.Service.KPI_NhomTieuChiService.Dto;

var builder = new ConfigurationBuilder()
    .SetBasePath("/home/pc/Project/KPI_BTC/KPI_BTC/API/Hinet.Api")
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
var configuration = builder.Build();

var settings = new ElasticsearchClientSettings(new Uri(configuration["Elasticsearch:Url"]))
    .Authentication(new Elastic.Clients.Elasticsearch.BasicAuthentication(configuration["Elasticsearch:Username"], configuration["Elasticsearch:Password"]))
    .ServerCertificateValidationCallback((sender, cert, chain, errors) => true);
var client = new ElasticsearchClient(settings);

var val = "tham muu";
var elasticResponse = await client.SearchAsync<KPI_NhomTieuChiDto>(s => s
    .Index(configuration["Elasticsearch:IndexNhomTieuChi"] ?? "kpi_nhomtieuchi_index_bdt")
    .Query(q => q.Bool(b =>
    {
        b.Must(
            m => m.Term(t => t.Field("level").Value(2)),
            m => m.MultiMatch(mm => mm
                .Fields(new[] { "tenNhomTieuChiKhongDau", "congViecChiTietKhongDau", "sanPhamDauRaKhongDau" })
                .Query(val)
                .Operator(Elastic.Clients.Elasticsearch.QueryDsl.Operator.And)
            )
        );
    }))
);

Console.WriteLine("Hits: " + elasticResponse.Hits.Count);
