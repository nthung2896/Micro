using System;

namespace Hinet.Service.RabbitMQ
{
    public interface IRabbitMQService
    {
        void SendMessage<T>(T message, string queueName);
    }
}
