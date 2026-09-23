using Hinet.Service.MOITSignerService.Dto;
using System.Text;

public class MOITSignerService
{
    private readonly HttpClient _http;
    private static string sessionId = "";
    private static readonly SemaphoreSlim _lock = new SemaphoreSlim(1, 1);

    public MOITSignerService(IHttpClientFactory httpClientFactory)
    {
        _http = httpClientFactory.CreateClient("MOITSigner");
    }

    private async Task EnsureInit()
    {
        if (!string.IsNullOrWhiteSpace(sessionId))
            return;

        await _lock.WaitAsync();
        try
        {
            if (string.IsNullOrWhiteSpace(sessionId))
                await Init();
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task Init()
    {
        var res = await _http.PostAsync("/getSession", null);
        sessionId = (await res.Content.ReadAsStringAsync())?.Trim();
    }

    public async Task<VerifyResultDto> Verify(string data, string signature)
    {
        if (string.IsNullOrWhiteSpace(signature))
            return new VerifyResultDto { Success = false, Error = "Signature cannot be empty" };

        await EnsureInit();

        try
        {
            var body = new StringContent(
                $"sessionID={sessionId}&signature={signature}&inData={data}",
                Encoding.UTF8,
                "application/x-www-form-urlencoded"
            );

            var res = await _http.PostAsync("/Verify", body);

            if (!res.IsSuccessStatusCode)
                return new VerifyResultDto { Success = false, Error = "Verify request failed" };

            var text = (await res.Content.ReadAsStringAsync())?.Trim();

            if (string.IsNullOrEmpty(text))
            {
                var err = await GetLastError();

                if (err.Contains("session", StringComparison.OrdinalIgnoreCase))
                {
                    sessionId = "";
                    await EnsureInit();
                    return await Verify(data, signature);
                }

                return new VerifyResultDto { Success = false, Error = err };
            }

            return new VerifyResultDto { Success = true };
        }
        catch (Exception ex)
        {
            return new VerifyResultDto { Success = false, Error = ex.Message };
        }
    }

    private async Task<string> GetLastError()
    {
        var res = await _http.PostAsync("/getLastErr", null);
        var text = (await res.Content.ReadAsStringAsync())?.Trim();
        return $"Plugin error: {text}";
    }
}
