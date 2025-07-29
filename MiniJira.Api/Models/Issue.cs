using System.Collections.Generic;

namespace MiniJira.Api.Models
{
    public class Issue
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium";  // Low, Medium, High
        
        // Foreign keys
        public int ProjectId { get; set; }
        public int? AssigneeId { get; set; }
        public int IssueTypeId { get; set; }
        public int IssueStatusId { get; set; }
        
        // Navigation properties
        public Project Project { get; set; } = null!;
        public User? Assignee { get; set; }
        public IssueType IssueType { get; set; } = null!;
        public IssueStatus Status { get; set; } = null!;
        public List<Comment> Comments { get; set; } = new List<Comment>();
    }
}
