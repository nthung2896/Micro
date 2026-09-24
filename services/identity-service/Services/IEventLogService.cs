using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using SharedKernel.Events;

namespace IdentityService.Services
{
    public interface IEventLogService
    {
        void LogEvent(EventLogItem item);
        List<EventLogItem> GetRecentEvents(int count = 50);
    }

    public class EventLogService : IEventLogService
    {
        private readonly ConcurrentQueue<EventLogItem> _logs = new();
        private const int MaxLogs = 100;

        public void LogEvent(EventLogItem item)
        {
            _logs.Enqueue(item);
            while (_logs.Count > MaxLogs && _logs.TryDequeue(out _)) { }
        }

        public List<EventLogItem> GetRecentEvents(int count = 50)
        {
            return _logs.OrderByDescending(x => x.Timestamp).Take(count).ToList();
        }
    }
}
