namespace EBookNepal.Services.Interfaces
{
    using EBookNepal.DTOs;
    using EBookNepal.Entities;

    public interface IFeedbackServices
    {
        void SendFeedback(FeedbackDTO feedbackDto);
        IEnumerable<FeedbackDTO> GetFeedbacks();
        List<string> GetAllUserEmails();
        bool FeedbackExists(string feedbackId);
        void DeleteFeedback(string feedbackId);
    }
}