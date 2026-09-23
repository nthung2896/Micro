namespace CommonHelper.HCHelper
{
    public static class HttpClientHelper
    {
        // ========================================================
        // 5. HttpClient giả lập trình duyệt
        // ========================================================
        public static HttpClient CreateBrowserClient()
        {
            var client = new HttpClient();

            client.DefaultRequestHeaders.UserAgent.ParseAdd(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36");

            client.DefaultRequestHeaders.Accept.ParseAdd("*/*");
            client.DefaultRequestHeaders.AcceptEncoding.ParseAdd("gzip, deflate");
            client.DefaultRequestHeaders.Connection.ParseAdd("keep-alive");

            return client;
        }
    }
}
