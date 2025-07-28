namespace MiniJira.Api.Models
{
    public class Issue
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "Open";  // Open, In Progress, Closed
        public string Priority { get; set; } = "Medium";  // Low, Medium, High
        public string? Project { get; set; }
        public string? Assignee { get; set; }
    }
}
