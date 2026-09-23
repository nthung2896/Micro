using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Hinet.Infrastructure;
using Hinet.Model.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

var builder = new ConfigurationBuilder()
    .SetBasePath("/home/pc/Project/KPI_BTC/KPI_BTC/API/Hinet.Api")
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
var configuration = builder.Build();

var services = new ServiceCollection();
services.AddDbContext<HinetContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
var provider = services.BuildServiceProvider();
var db = provider.GetRequiredService<HinetContext>();

var lyLich = db.LyLich2Cs.FirstOrDefault(l => l.HoTen.Contains("Minh Hiếu"));
Console.WriteLine($"LyLich ID: {lyLich?.Id}, DonViSuDungId: {lyLich?.DonViSuDungId}, PhongBanId: {lyLich?.PhongBanId}");

var configs = db.KPI_DotDanhGia_DonVis.ToList();
foreach (var c in configs) {
    Console.WriteLine($"Config - IdDot: {c.IdDotDanhGia}, IdDonVi: {c.IdDonVi}, BoChung: {c.IdBoTieuChiChung}, BoNhiemVu: {c.IdBoChiSoNhiemVu}");
}
