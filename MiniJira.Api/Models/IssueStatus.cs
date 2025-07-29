using System.Collections.Generic;

namespace MiniJira.Api.Models
{
    public class IssueStatus
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;  // To Do, In Progress, Done
        public int Order { get; set; }  // For ordering in Kanban view
        
        // Navigation properties
        public List<Issue> Issues { get; set; } = new List<Issue>();
    }
}