namespace NordicWebHub.Api.Services;

public class AiSeoServiceException(string message, Exception? innerException = null)
    : Exception(message, innerException);
