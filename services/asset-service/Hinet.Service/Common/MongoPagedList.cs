using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using Hinet.Service.Dto;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace Hinet.Service.Common
{
    public class MongoPagedList<T>
    {
        public MongoPagedList(List<T> items, int pageIndex, int pageSize, int totalCount)
        {
            Items = items;
            PageIndex = pageIndex;
            PageSize = pageSize;
            TotalCount = totalCount;
        }

        public List<T> Items { get; set; }
        public int PageIndex { get; }
        public int PageSize { get; }
        public int TotalCount { get; }
        public int TotalPage => (int)Math.Ceiling(TotalCount / (double)PageSize);

        public static async Task<MongoPagedList<T>> CreateAsync(IQueryable<T> query, SearchBase search)
        {
            var totalCount = await query.CountAsync();
            search.PageIndex = search.PageIndex < 1 ? 1 : search.PageIndex;
            List<T> items;

            if (search.PageSize == -1)
            {
                items = await query.ToListAsync();
                return new MongoPagedList<T>(items, 1, totalCount, totalCount);
            }
            else
            {
                items = await query.Skip((search.PageIndex - 1) * search.PageSize).Take(search.PageSize).ToListAsync();
                return new MongoPagedList<T>(items, search.PageIndex, search.PageSize, totalCount);
            }
        }
    }
}
