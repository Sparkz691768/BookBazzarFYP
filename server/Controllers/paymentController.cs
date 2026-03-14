// Controllers/PaymentController.cs
using EBookNepal.Data;
using EBookNepal.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EBookNepal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentServices _paymentServices;
        private readonly ILogger<PaymentController> _logger;
        private readonly ApplicationDbContext _context;

        public PaymentController(IPaymentServices paymentServices, ILogger<PaymentController> logger, ApplicationDbContext context)
        {
            _paymentServices = paymentServices;
            _logger = logger;
            _context = context;
        }

        // Client calls this → gets back the form fields to POST to eSewa
        [HttpPost("InitiatePayment/{orderId}/{userId}")]
        public async Task<IActionResult> InitiatePayment(string orderId, string userId)
        {
            try
            {
                var result = await _paymentServices.InitiatePaymentAsync(orderId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Payment initiation failed: {ex.Message}");
                return StatusCode(500, "An error occurred while initiating payment.");
            }
        }

        // eSewa redirects here after payment — ?data=<base64-encoded JSON>
        [HttpGet("VerifyPayment")]
        public async Task<IActionResult> VerifyPayment([FromQuery] string data)
        {
            try
            {
                var success = await _paymentServices.VerifyPaymentAsync(data);

                if (!success)
                    return BadRequest("Payment verification failed. Signature mismatch or invalid status.");

                return Ok("Payment verified successfully. Order marked as completed.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Payment verification failed: {ex.Message}");
                return StatusCode(500, "An error occurred during payment verification.");
            }
        }



        // ============================================================
        // GET PAYMENT STATUS (user checks their own order)
        // ============================================================
        [HttpGet("GetPaymentStatus/{orderId}/{userId}")]
        public async Task<IActionResult> GetPaymentStatus(string orderId, string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(orderId) || string.IsNullOrWhiteSpace(userId))
                    return BadRequest("Order ID and User ID are required.");

                var payment = await _context.Payments
                    .Where(p => p.OrderId == orderId && p.UserId == userId)
                    .OrderByDescending(p => p.CreatedAt)
                    .Select(p => new
                    {
                        p.PaymentId,
                        p.OrderId,
                        p.Amount,
                        PaymentStatus = p.PaymentStatus.ToString(),
                        p.TransactionCode,
                        p.RefId,
                        p.CreatedAt,
                        p.PaidAt
                    })
                    .FirstOrDefaultAsync();

                if (payment == null)
                    return NotFound("No payment record found for this order.");

                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching payment status: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching payment status.");
            }
        }

    }
}