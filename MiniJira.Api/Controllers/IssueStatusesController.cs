using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniJira.Api.Data;
using MiniJira.Api.Models;

namespace MiniJira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IssueStatusesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public IssueStatusesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/issuestatuses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IssueStatus>>> GetIssueStatuses()
        {
            return await _context.IssueStatuses.OrderBy(s => s.Order).ToListAsync();
        }

        // GET: api/issuestatuses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IssueStatus>> GetIssueStatus(int id)
        {
            var issueStatus = await _context.IssueStatuses.FindAsync(id);
            if (issueStatus == null)
                return NotFound();

            return issueStatus;
        }

        // POST: api/issuestatuses
        [HttpPost]
        public async Task<ActionResult<IssueStatus>> CreateIssueStatus(IssueStatus issueStatus)
        {
            try
            {
                // Ensure Id is not set for new issue statuses
                issueStatus.Id = 0;
                
                // Validate required fields
                if (string.IsNullOrWhiteSpace(issueStatus.Name))
                {
                    return BadRequest("Name is required");
                }

                // If order is not set, set it to the highest order + 1
                if (issueStatus.Order <= 0)
                {
                    var maxOrder = await _context.IssueStatuses.MaxAsync(s => (int?)s.Order) ?? 0;
                    issueStatus.Order = maxOrder + 1;
                }

                _context.IssueStatuses.Add(issueStatus);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetIssueStatus), new { id = issueStatus.Id }, issueStatus);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/issuestatuses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIssueStatus(int id, IssueStatus issueStatus)
        {
            try
            {
                var existingIssueStatus = await _context.IssueStatuses.FindAsync(id);
                if (existingIssueStatus == null)
                    return NotFound();

                // Validate required fields
                if (string.IsNullOrWhiteSpace(issueStatus.Name))
                {
                    return BadRequest("Name is required");
                }

                // Update properties
                existingIssueStatus.Name = issueStatus.Name;
                
                // Only update order if it's different and valid
                if (issueStatus.Order > 0 && issueStatus.Order != existingIssueStatus.Order)
                {
                    existingIssueStatus.Order = issueStatus.Order;
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IssueStatusExists(id))
                    return NotFound();
                else
                    throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/issuestatuses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssueStatus(int id)
        {
            try
            {
                var issueStatus = await _context.IssueStatuses.FindAsync(id);
                if (issueStatus == null)
                    return NotFound();

                // Check if issue status is used by any issues
                var hasIssues = await _context.Issues.AnyAsync(i => i.IssueStatusId == id);
                if (hasIssues)
                {
                    return BadRequest("Cannot delete issue status that is used by issues");
                }

                _context.IssueStatuses.Remove(issueStatus);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/issuestatuses/reorder
        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderIssueStatuses([FromBody] List<IssueStatus> statuses)
        {
            try
            {
                // Validate input
                if (statuses == null || !statuses.Any())
                {
                    return BadRequest("No statuses provided");
                }

                // Get all existing statuses
                var existingStatuses = await _context.IssueStatuses.ToListAsync();
                
                // Update orders
                foreach (var status in statuses)
                {
                    var existingStatus = existingStatuses.FirstOrDefault(s => s.Id == status.Id);
                    if (existingStatus != null)
                    {
                        existingStatus.Order = status.Order;
                    }
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool IssueStatusExists(int id)
        {
            return _context.IssueStatuses.Any(e => e.Id == id);
        }
    }
}