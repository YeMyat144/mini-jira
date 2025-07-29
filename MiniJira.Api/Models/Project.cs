using System.Collections.Generic;

namespace MiniJira.Api.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;  // Short key like "PROJ"
        public string Description { get; set; } = string.Empty;
        
        // Navigation properties
        public List<Issue> Issues { get; set; } = new List<Issue>();
    }
}