using System;
using System.Collections.Generic;
using System.Linq;
using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.QueryDsl;

public class Test
{
    public void TestTerms()
    {
        var parentIds = new List<Guid> { Guid.NewGuid() };
        var fieldValues = parentIds.Select(p => (FieldValue)p.ToString()).ToList();
        var t = new TermsQueryField(fieldValues);
    }
}
