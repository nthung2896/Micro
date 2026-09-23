const fs = require('fs');
const filePath = 'g:\\Ct_Hinet_v2\\KPI_BTC\\API\\Hinet.Service\\KPI_TieuChiChung_DiemSoService\\KPI_TieuChiChung_DiemSoService.cs';
let content = fs.readFileSync(filePath, 'utf8');

// The file was modified by my previous run to:
// if(ns.DiemTheoDoiDanhGiaQuy.HasValue) { sumScore += ns.DiemTheoDoiDanhGiaQuy.Value; count++; }

content = content.replace(
    /if\(ns\.DiemTheoDoiDanhGiaQuy\.HasValue\) \{ sumScore \+= ns\.DiemTheoDoiDanhGiaQuy\.Value; count\+\+; \}/g,
    'if(ns.DiemTieuChiKQNhiemVu_TrungBinh.HasValue) { sumScore += ns.DiemTieuChiKQNhiemVu_TrungBinh.Value; count++; }'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Success");
