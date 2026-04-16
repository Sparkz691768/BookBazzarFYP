// Services/Interfaces/IPaymentServices.cs
namespace EBookNepal.Services.Interfaces
{
    public interface IPaymentServices
    {
        Task<object> InitiatePaymentAsync(string orderId, string userId);
        Task<bool> VerifyPaymentAsync(string encodedResponse);
    }
}