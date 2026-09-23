using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hinet.Model.Migrations
{
    /// <inheritdoc />
    public partial class addtableRoom_BangGia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Room_BangGia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ThuocTinh = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LoaiTin = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaMau = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GiaTin = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsTuDongDuyet = table.Column<bool>(type: "bit", nullable: true),
                    IsDuyTriThem10Ngay = table.Column<bool>(type: "bit", nullable: true),
                    IsHienThiNutGoi = table.Column<bool>(type: "bit", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room_BangGia", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "43b9bbfa-c4c1-4aa1-b33b-a9ef124bfbae", "AQAAAAIAAYagAAAAEC7GGjDcdCfNjFGGA9c90RNGYVphMyCfBCA0MAE9pGJ8j+Vhku2Y6PA7zgU++BGejA==", "f1f0bc26-0845-49a3-806c-9635686d1ba9" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Room_BangGia");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "380a7c53-dfd4-4cda-beca-92d936bbd2de", "AQAAAAIAAYagAAAAEK4uvWv1b1L1pD+F8OljHcH9An4C0ZZpQ5uUuJLR0xPnrMPL/znptVVPCtO9CrTwNw==", "73902d32-3205-4635-b764-53abd2814948" });
        }
    }
}
