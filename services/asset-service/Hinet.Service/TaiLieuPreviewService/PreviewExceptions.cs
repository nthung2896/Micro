namespace Hinet.Service.TaiLieuPreviewService
{
    public class PreviewNotFoundException : Exception
    {
        public PreviewNotFoundException(string message) : base(message) { }
    }

    public class PreviewUnsupportedException : Exception
    {
        public PreviewUnsupportedException(string message) : base(message) { }
    }

    public class PreviewConversionException : Exception
    {
        public PreviewConversionException(string message) : base(message) { }
    }

    public class PreviewTimeoutException : Exception
    {
        public PreviewTimeoutException(string message) : base(message) { }
    }

    public class PreviewConfigurationException : Exception
    {
        public PreviewConfigurationException(string message) : base(message) { }
    }
}
