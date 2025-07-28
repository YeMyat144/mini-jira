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
    }
}
