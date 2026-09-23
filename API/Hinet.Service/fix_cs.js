const fs = require('fs');
const filePath = 'g:\\Ct_Hinet_v2\\KPI_BTC\\API\\Hinet.Service\\KPI_TieuChiChung_DiemSoService\\KPI_TieuChiChung_DiemSoService.cs';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    /sumScore\s*\+=\s*\(ns\.DiemTheoDoiDanhGiaQuy\s*\?\?\s*0\);\s*count\+\+;/g,
    'if(ns.DiemTheoDoiDanhGiaQuy.HasValue) { sumScore += ns.DiemTheoDoiDanhGiaQuy.Value; count++; }'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Success");
