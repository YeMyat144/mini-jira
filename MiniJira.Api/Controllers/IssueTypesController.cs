using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniJira.Api.Data;
using MiniJira.Api.Models;

namespace MiniJira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IssueTypesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public IssueTypesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/issuetypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IssueType>>> GetIssueTypes()
        {
            return await _context.IssueTypes.ToListAsync();
        }

        // GET: api/issuetypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IssueType>> GetIssueType(int id)
        {
            var issueType = await _context.IssueTypes.FindAsync(id);
            if (issueType == null)
                return NotFound();

            return issueType;
        }

        // POST: api/issuetypes
        [HttpPost]
        public async Task<ActionResult<IssueType>> CreateIssueType(IssueType issueType)
        {
            try
            {
                // Ensure Id is not set for new issue types
                issueType.Id = 0;
                
                // Validate required fields
                if (string.IsNullOrWhiteSpace(issueType.Name))
                {
                    return BadRequest("Name is required");
                }

                _context.IssueTypes.Add(issueType);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetIssueType), new { id = issueType.Id }, issueType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/issuetypes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIssueType(int id, IssueType issueType)
        {
            try
            {
                var existingIssueType = await _context.IssueTypes.FindAsync(id);
                if (existingIssueType == null)
                    return NotFound();

                // Validate required fields
                if (string.IsNullOrWhiteSpace(issueType.Name))
                {
                    return BadRequest("Name is required");
                }

                // Update properties
                existingIssueType.Name = issueType.Name;
                existingIssueType.Icon = issueType.Icon;
                existingIssueType.Color = issueType.Color;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IssueTypeExists(id))
                    return NotFound();
                else
                    throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/issuetypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIssueType(int id)
        {
            try
            {
                var issueType = await _context.IssueTypes.FindAsync(id);
                if (issueType == null)
                    return NotFound();

                // Check if issue type is used by any issues
                var hasIssues = await _context.Issues.AnyAsync(i => i.IssueTypeId == id);
                if (hasIssues)
                {
                    return BadRequest("Cannot delete issue type that is used by issues");
                }

                _context.IssueTypes.Remove(issueType);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool IssueTypeExists(int id)
        {
            return _context.IssueTypes.Any(e => e.Id == id);
        }
    }
}