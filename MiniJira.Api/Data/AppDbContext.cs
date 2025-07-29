using Microsoft.EntityFrameworkCore;
using MiniJira.Api.Models;

namespace MiniJira.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Issue> Issues { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;
        public DbSet<IssueType> IssueTypes { get; set; } = null!;
        public DbSet<IssueStatus> IssueStatuses { get; set; } = null!;
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure relationships
            modelBuilder.Entity<Issue>()
                .HasOne(i => i.Project)
                .WithMany(p => p.Issues)
                .HasForeignKey(i => i.ProjectId);
                
            modelBuilder.Entity<Issue>()
                .HasOne(i => i.Assignee)
                .WithMany(u => u.AssignedIssues)
                .HasForeignKey(i => i.AssigneeId)
                .IsRequired(false);  // Optional assignee
                
            modelBuilder.Entity<Issue>()
                .HasOne(i => i.IssueType)
                .WithMany(t => t.Issues)
                .HasForeignKey(i => i.IssueTypeId);
                
            modelBuilder.Entity<Issue>()
                .HasOne(i => i.Status)
                .WithMany(s => s.Issues)
                .HasForeignKey(i => i.IssueStatusId);
                
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Issue)
                .WithMany(i => i.Comments)
                .HasForeignKey(c => c.IssueId);
                
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId);
                
            // Seed data for Projects
            modelBuilder.Entity<Project>().HasData(
                new Project { Id = 1, Name = "Default Project", Key = "DEF", Description = "Default project for MiniJira" }
            );
            
            // Seed data for Users
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Username = "admin", Email = "admin@minijira.com", DisplayName = "Administrator" },
                new User { Id = 2, Username = "user1", Email = "user1@minijira.com", DisplayName = "User One" }
            );
                
            // Seed data for IssueTypes
            modelBuilder.Entity<IssueType>().HasData(
                new IssueType { Id = 1, Name = "Bug", Icon = "fa-bug", Color = "#E44D42" },
                new IssueType { Id = 2, Name = "Task", Icon = "fa-check-square", Color = "#4FADE6" },
                new IssueType { Id = 3, Name = "Epic", Icon = "fa-bolt", Color = "#8E44AD" }
            );
            
            // Seed data for IssueStatuses
            modelBuilder.Entity<IssueStatus>().HasData(
                new IssueStatus { Id = 1, Name = "To Do", Order = 1 },
                new IssueStatus { Id = 2, Name = "In Progress", Order = 2 },
                new IssueStatus { Id = 3, Name = "Done", Order = 3 }
            );
        }
    }
}
