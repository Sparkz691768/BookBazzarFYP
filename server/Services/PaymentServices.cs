// Services/PaymentServices.cs
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using EBookNepal.Data;
using EBookNepal.Entities;
using EBookNepal.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace EBookNepal.Services
{
    public class PaymentServices : IPaymentServices
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public PaymentServices(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // =====================================================
        // INITIATE PAYMENT
        // Returns the form fields needed to POST to eSewa
        // =====================================================
        public async Task<object> InitiatePaymentAsync(string orderId, string userId)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

            if (order == null)
                throw new KeyNotFoundException("Order not found.");

            if (order.OrderStatus == OrderStatus.Completed)
                throw new InvalidOperationException("Order is already paid.");

            if (order.OrderStatus == OrderStatus.Cancelled)
                throw new InvalidOperationException("Cannot pay for a cancelled order.");

            // Prevent duplicate pending payments
            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p => p.OrderId == orderId && p.PaymentStatus == PaymentStatus.Paid);

            if (existingPayment != null)
                throw new InvalidOperationException("This order has already been paid.");

            var merchantCode = _config["eSewa:MerchantCode"];
            var secretKey = _config["eSewa:SecretKey"];
            var successUrl = _config["eSewa:SuccessUrl"];
            var failureUrl = _config["eSewa:FailureUrl"];
            var paymentUrl = _config["eSewa:PaymentUrl"];

            var amount = order.TotalAmount;
            var taxAmount = 0m;
            var totalAmount = amount;
            var transactionUuid = Guid.NewGuid().ToString();
            var productCode = merchantCode;

            // eSewa v2 signature: "total_amount,transaction_uuid,product_code"
            var message = $"total_amount={totalAmount},transaction_uuid={transactionUuid},product_code={productCode}";
            var signature = GenerateHmacSignature(message, secretKey!);

            // Save pending payment record
            var payment = new Payment
            {
                OrderId = orderId,
                UserId = userId,
                Amount = totalAmount,
                TransactionCode = transactionUuid,
                PaymentStatus = PaymentStatus.Pending
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return new
            {
                PaymentUrl = paymentUrl,
                FormFields = new
                {
                    amount = amount.ToString("F2"),
                    tax_amount = taxAmount.ToString("F2"),
                    total_amount = totalAmount.ToString("F2"),
                    transaction_uuid = transactionUuid,
                    product_code = productCode,
                    product_service_charge = "0",
                    product_delivery_charge = "0",
                    success_url = successUrl,
                    failure_url = failureUrl,
                    signed_field_names = "total_amount,transaction_uuid,product_code",
                    signature = signature
                }
            };
        }

        // =====================================================
        // VERIFY PAYMENT (called from eSewa success redirect)
        // eSewa sends base64-encoded JSON as ?data=...
        // =====================================================
        public async Task<bool> VerifyPaymentAsync(string encodedResponse)
        {
            if (string.IsNullOrEmpty(encodedResponse))
                throw new ArgumentException("Encoded response is required.");

            // Decode base64
            var decodedJson = Encoding.UTF8.GetString(Convert.FromBase64String(encodedResponse));
            var responseData = JsonSerializer.Deserialize<Dictionary<string, string>>(decodedJson);

            if (responseData == null)
                throw new InvalidOperationException("Invalid response from eSewa.");

            var secretKey = _config["eSewa:SecretKey"];

            // Reconstruct and verify signature
            var signedFields = responseData["signed_field_names"].Split(',');
            var message = string.Join(",", signedFields.Select(f => $"{f}={responseData[f]}"));
            var expectedSignature = GenerateHmacSignature(message, secretKey!);

            if (expectedSignature != responseData["signature"])
                return false;

            // Check status from eSewa
            if (!responseData.TryGetValue("status", out var status) || status != "COMPLETE")
                return false;

            var transactionUuid = responseData["transaction_uuid"];
            var refId = responseData.GetValueOrDefault("transaction_code", "");

            // Find the pending payment by transactionUuid
            var payment = await _context.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.TransactionCode == transactionUuid
                                       && p.PaymentStatus == PaymentStatus.Pending);

            if (payment == null)
                return false;

            // Update payment to Paid
            payment.PaymentStatus = PaymentStatus.Paid;
            payment.RefId = refId;
            payment.PaidAt = DateTime.UtcNow;

            // Update order to Completed
            payment.Order.OrderStatus = OrderStatus.Completed;

            await _context.SaveChangesAsync();
            return true;
        }

        // =====================================================
        // HMAC-SHA256 signature helper
        // =====================================================
        private static string GenerateHmacSignature(string message, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using var hmac = new HMACSHA256(keyBytes);
            var hashBytes = hmac.ComputeHash(messageBytes);
            return Convert.ToBase64String(hashBytes);
        }
    }
}