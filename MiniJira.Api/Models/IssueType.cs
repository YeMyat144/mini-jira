using System.Collections.Generic;

namespace MiniJira.Api.Models
{
    public class IssueType
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;  // Bug, Task, Epic
        public string Icon { get; set; } = string.Empty;  // CSS class for icon
        public string Color { get; set; } = string.Empty;  // Color code
        
        // Navigation properties
        public List<Issue> Issues { get; set; } = new List<Issue>();
    }
}