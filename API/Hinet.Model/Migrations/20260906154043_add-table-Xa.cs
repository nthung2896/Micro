using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hinet.Model.Migrations
{
    /// <inheritdoc />
    public partial class addtableXa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Xa",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaXa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TenXa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaHuyen = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Loai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaTinh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsXaMoi = table.Column<bool>(type: "bit", nullable: true),
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
                    table.PrimaryKey("PK_Xa", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "d2b9b59c-d29c-4fac-adf5-ed63249f3054", "AQAAAAIAAYagAAAAECsJ/WcLfaBs/Cku3Jv24c2+RiJjzp9HRTToROzZvLo2+EjZj/WhG7yUgoC3PW6yog==", "ba5c3194-fceb-430e-90b7-3e2911886940" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Xa");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "871694db-d63b-4973-9cae-5121c3a84c05", "AQAAAAIAAYagAAAAEB8pCAlfZembxGYb6NsisBM8QeflHGfUhy6TbWxc8SkruZxLoH0zW844tiJtciKbkQ==", "376d4f7a-6672-4e82-9149-870e3de48e2d" });
        }
    }
}
