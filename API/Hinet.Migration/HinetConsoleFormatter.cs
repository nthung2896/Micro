using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Logging.Console;
using Microsoft.Extensions.Options;

namespace Hinet.Migration;

public class HinetConsoleFormatter : ConsoleFormatter, IDisposable
{
    private readonly IDisposable? _optionsReloadToken;
    private ConsoleFormatterOptions _options;

    public HinetConsoleFormatter(IOptionsMonitor<ConsoleFormatterOptions> options)
        : base("hinet")
    {
        _optionsReloadToken = options.OnChange(o => _options = o);
        _options = options.CurrentValue;
    }

    public override void Write<TState>(in LogEntry<TState> logEntry, IExternalScopeProvider? scopeProvider, TextWriter textWriter)
    {
        var message = logEntry.Formatter?.Invoke(logEntry.State, logEntry.Exception);
        if (message == null) return;

        // Format: HH:mm:ss message
        var timestamp = DateTime.Now.ToString("HH:mm:ss");
        textWriter.WriteLine($"{timestamp} {message}");

        if (logEntry.Exception != null)
        {
            textWriter.WriteLine($"{timestamp} {logEntry.Exception}");
        }
    }

    public void Dispose() => _optionsReloadToken?.Dispose();
}
