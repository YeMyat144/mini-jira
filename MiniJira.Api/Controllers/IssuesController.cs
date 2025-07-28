using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniJira.Api.Data;
using MiniJira.Api.Models;

namespace MiniJira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IssuesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public IssuesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/issues
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Issue>>> GetIssues()
        {
            return await _context.Issues.ToListAsync();
        }

        // GET: api/issues/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Issue>> GetIssue(int id)
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null)
                return NotFound();

            return issue;
        }

        // POST: api/issues
        [HttpPost]
        public async Task<ActionResult<Issue>> CreateIssue(Issue issue)
        {
            try
            {
                // Ensure Id is not set for new issues
                issue.Id = 0;
                
                // Validate required fields
                if (string.IsNullOrWhiteSpace(issue.Title))
                {
                    return BadRequest("Title is required");
                }

                _context.Issues.Add(issue);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetIssue), new { id = issue.Id }, issue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/issues/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIssue(int id, Issue issue)
        {
            try
            {
                var existingIssue = await _context.Issues.FindAsync(id);
                if (existingIssue == null)
                    return NotFound();

                // Validate required fields
                if (string.IsNullOrWhiteSpace(issue.Title))
                {
                    return BadRequest("Title is required");
                }

                // Update properties
                existingIssue.Title = issue.Title;
                existingIssue.Description = issue.Description;
                existingIssue.Status = issue.Status;
                existingIssue.Priority = issue.Priority;
                existingIssue.Project = issue.Project;
                existingIssue.Assignee = issue.Assignee;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IssueExists(id))
                    return NotFound();
                else
                    throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/issues/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssue(int id)
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null)
                return NotFound();

            _context.Issues.Remove(issue);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool IssueExists(int id) =>
            _context.Issues.Any(e => e.Id == id);
    }
}
