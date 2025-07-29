using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniJira.Api.Data;
using MiniJira.Api.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
        public async Task<ActionResult<IEnumerable<Issue>>> GetIssues([FromQuery] int? projectId = null, [FromQuery] int? assigneeId = null, [FromQuery] int? issueTypeId = null, [FromQuery] int? issueStatusId = null)
        {
            var query = _context.Issues
                .Include(i => i.Project)
                .Include(i => i.Assignee)
                .Include(i => i.IssueType)
                .Include(i => i.Status)
                .AsQueryable();

            // Apply filters if provided
            if (projectId.HasValue)
                query = query.Where(i => i.ProjectId == projectId.Value);
            
            if (assigneeId.HasValue)
                query = query.Where(i => i.AssigneeId == assigneeId.Value);
            
            if (issueTypeId.HasValue)
                query = query.Where(i => i.IssueTypeId == issueTypeId.Value);
            
            if (issueStatusId.HasValue)
                query = query.Where(i => i.IssueStatusId == issueStatusId.Value);

            return await query.ToListAsync();
        }

        // GET: api/issues/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Issue>> GetIssue(int id)
        {
            var issue = await _context.Issues
                .Include(i => i.Project)
                .Include(i => i.Assignee)
                .Include(i => i.IssueType)
                .Include(i => i.Status)
                .Include(i => i.Comments)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(i => i.Id == id);

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

                // Validate relationships
                if (issue.ProjectId <= 0)
                {
                    return BadRequest("Project is required");
                }

                if (issue.IssueTypeId <= 0)
                {
                    return BadRequest("Issue Type is required");
                }

                if (issue.IssueStatusId <= 0)
                {
                    // Default to first status if not provided
                    var firstStatus = await _context.IssueStatuses
                        .OrderBy(s => s.Order)
                        .FirstOrDefaultAsync();
                    
                    if (firstStatus != null)
                        issue.IssueStatusId = firstStatus.Id;
                    else
                        return BadRequest("Issue Status is required and no default status exists");
                }

                // Verify that referenced entities exist
                var projectExists = await _context.Projects.AnyAsync(p => p.Id == issue.ProjectId);
                if (!projectExists)
                    return BadRequest("Specified project does not exist");

                if (issue.AssigneeId.HasValue)
                {
                    var assigneeExists = await _context.Users.AnyAsync(u => u.Id == issue.AssigneeId);
                    if (!assigneeExists)
                        return BadRequest("Specified assignee does not exist");
                }

                var issueTypeExists = await _context.IssueTypes.AnyAsync(t => t.Id == issue.IssueTypeId);
                if (!issueTypeExists)
                    return BadRequest("Specified issue type does not exist");

                var issueStatusExists = await _context.IssueStatuses.AnyAsync(s => s.Id == issue.IssueStatusId);
                if (!issueStatusExists)
                    return BadRequest("Specified issue status does not exist");

                _context.Issues.Add(issue);
                await _context.SaveChangesAsync();

                // Reload the issue with related entities for the response
                var createdIssue = await _context.Issues
                    .Include(i => i.Project)
                    .Include(i => i.Assignee)
                    .Include(i => i.IssueType)
                    .Include(i => i.Status)
                    .FirstOrDefaultAsync(i => i.Id == issue.Id);

                return CreatedAtAction(nameof(GetIssue), new { id = issue.Id }, createdIssue);
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

                // Validate relationships if provided
                if (issue.ProjectId > 0)
                {
                    var projectExists = await _context.Projects.AnyAsync(p => p.Id == issue.ProjectId);
                    if (!projectExists)
                        return BadRequest("Specified project does not exist");
                    existingIssue.ProjectId = issue.ProjectId;
                }

                if (issue.IssueTypeId > 0)
                {
                    var issueTypeExists = await _context.IssueTypes.AnyAsync(t => t.Id == issue.IssueTypeId);
                    if (!issueTypeExists)
                        return BadRequest("Specified issue type does not exist");
                    existingIssue.IssueTypeId = issue.IssueTypeId;
                }

                if (issue.IssueStatusId > 0)
                {
                    var issueStatusExists = await _context.IssueStatuses.AnyAsync(s => s.Id == issue.IssueStatusId);
                    if (!issueStatusExists)
                        return BadRequest("Specified issue status does not exist");
                    existingIssue.IssueStatusId = issue.IssueStatusId;
                }

                // Update assignee (can be null)
                if (issue.AssigneeId.HasValue)
                {
                    var assigneeExists = await _context.Users.AnyAsync(u => u.Id == issue.AssigneeId);
                    if (!assigneeExists)
                        return BadRequest("Specified assignee does not exist");
                }
                existingIssue.AssigneeId = issue.AssigneeId;

                // Update properties
                existingIssue.Title = issue.Title;
                existingIssue.Description = issue.Description;
                existingIssue.Priority = issue.Priority;

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
            try
            {
                var issue = await _context.Issues
                    .Include(i => i.Comments)
                    .FirstOrDefaultAsync(i => i.Id == id);
                    
                if (issue == null)
                    return NotFound();

                // Remove associated comments first
                if (issue.Comments != null && issue.Comments.Any())
                {
                    _context.Comments.RemoveRange(issue.Comments);
                }

                _context.Issues.Remove(issue);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/issues/kanban
        [HttpGet("kanban")]
        public async Task<ActionResult<object>> GetKanbanBoard([FromQuery] int? projectId = null)
        {
            try
            {
                // Get all statuses ordered by their defined order
                var statuses = await _context.IssueStatuses
                    .OrderBy(s => s.Order)
                    .ToListAsync();

                // Build query for issues
                var issuesQuery = _context.Issues
                    .Include(i => i.Project)
                    .Include(i => i.Assignee)
                    .Include(i => i.IssueType)
                    .Include(i => i.Status)
                    .AsQueryable();

                // Filter by project if specified
                if (projectId.HasValue)
                {
                    issuesQuery = issuesQuery.Where(i => i.ProjectId == projectId.Value);
                }

                var issues = await issuesQuery.ToListAsync();

                // Group issues by status
                var columns = statuses.Select(status => new
                {
                    id = status.Id,
                    name = status.Name,
                    order = status.Order,
                    issues = issues.Where(i => i.IssueStatusId == status.Id).ToList()
                }).ToList();

                return new { columns };
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/issues/5/status/2
        [HttpPut("{id}/status/{statusId}")]
        public async Task<IActionResult> UpdateIssueStatus(int id, int statusId)
        {
            try
            {
                var issue = await _context.Issues.FindAsync(id);
                if (issue == null)
                    return NotFound();

                var status = await _context.IssueStatuses.FindAsync(statusId);
                if (status == null)
                    return BadRequest("Specified status does not exist");

                issue.IssueStatusId = statusId;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool IssueExists(int id) =>
            _context.Issues.Any(e => e.Id == id);
    }
}
