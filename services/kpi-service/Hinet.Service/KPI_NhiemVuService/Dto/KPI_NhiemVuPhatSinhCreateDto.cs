using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_NhiemVuService.Dto
{
    public class KPI_NhiemVuPhatSinhCreateDto
    {
        public Guid? Id { get; set; }
        public string? TenNhiemVuDayDu { get; set; }
        public string? TypeNhiemVu { get; set; }
        public List<KPI_DauRaNhiemVuCreateDto>? DanhSachDauRa { get; set; } = new();
        public List<string>? BoTieuChiList { get; set; } = new();
        public Guid? IdLyLich { get; set; }
        public Guid? IdDotTheoDoiDanhGia { get; set; }
        public Guid? IdPhieuDanhGia { get; set; }
        public string? GhiChuGiaTrinh { get; set; }
    }

    public class KPI_NhiemVuSaveWithAttachmentsResponse
    {
        public List<KPI_NhiemVuAttachmentMappingDto> Items { get; set; } = new();
    }

    public class KPI_NhiemVuAttachmentMappingDto
    {
        public string ClientKey { get; set; } = string.Empty;
        public Guid ProductId { get; set; }
        public List<Guid> AttachmentIds { get; set; } = new();
    }

    public class KPI_NhiemVuSaveWithAttachmentsRequest
    {
        public string Payload { get; set; } = string.Empty;
        public List<Microsoft.AspNetCore.Http.IFormFile> Files { get; set; } = new();
        public List<string> FileProductKeys { get; set; } = new();
    }
}
