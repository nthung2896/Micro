namespace Hinet.FileServer.Dto
{
    public class DataResponse<T> 
    {
        public string? Message { get; set; }
        public T? Data { get; set; }
        public bool Status { get; set; }

        public static DataResponse<T> False(string message)
        {
            return new DataResponse<T>()
            {
                Status = false,
                Message = message,
            };
        }
        public static DataResponse<T> Success(T? data, string message = "Success")
        {
            return new DataResponse<T>()
            {
                Status = true,
                Data = data,
                Message = message,
            };
        }
    }

    public class DataResponse : DataResponse<object>
    {
        public static new DataResponse False(string message)
        {
            return new DataResponse()
            {
                Status = false,
                Message = message,
            };
        }
        public static new DataResponse Success(object? data, string message = "Success")
        {
            return new DataResponse()
            {
                Status = true,
                Data = data,
                Message = message,
            };
        }
    }


}
