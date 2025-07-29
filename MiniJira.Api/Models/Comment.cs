using System;

namespace MiniJira.Api.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Foreign keys
        public int IssueId { get; set; }
        public int UserId { get; set; }
        
        // Navigation properties
        public Issue Issue { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}