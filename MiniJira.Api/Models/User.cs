using System.Collections.Generic;

namespace MiniJira.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        
        // Navigation properties
        public List<Issue> AssignedIssues { get; set; } = new List<Issue>();
    }
}