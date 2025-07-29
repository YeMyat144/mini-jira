using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniJira.Api.Data;
using MiniJira.Api.Models;

namespace MiniJira.Api.Controllers
{
    [ApiController]
    [Route("api/issues/{issueId}/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/issues/5/comments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments(int issueId)
        {
            // Check if issue exists
            if (!await _context.Issues.AnyAsync(i => i.Id == issueId))
            {
                return NotFound("Issue not found");
            }

            return await _context.Comments
                .Where(c => c.IssueId == issueId)
                .Include(c => c.User)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        // GET: api/issues/5/comments/3
        [HttpGet("{id}")]
        public async Task<ActionResult<Comment>> GetComment(int issueId, int id)
        {
            // Check if issue exists
            if (!await _context.Issues.AnyAsync(i => i.Id == issueId))
            {
                return NotFound("Issue not found");
            }

            var comment = await _context.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == id && c.IssueId == issueId);

            if (comment == null)
                return NotFound("Comment not found");

            return comment;
        }

        // POST: api/issues/5/comments
        [HttpPost]
        public async Task<ActionResult<Comment>> CreateComment(int issueId, Comment comment)
        {
            try
            {
                // Check if issue exists
                if (!await _context.Issues.AnyAsync(i => i.Id == issueId))
                {
                    return NotFound("Issue not found");
                }

                // Check if user exists
                if (!await _context.Users.AnyAsync(u => u.Id == comment.UserId))
                {
                    return NotFound("User not found");
                }

                // Ensure Id is not set for new comments
                comment.Id = 0;
                comment.IssueId = issueId;
                comment.CreatedAt = DateTime.UtcNow;
                
                // Validate required fields
                if (string.IsNullOrWhiteSpace(comment.Content))
                {
                    return BadRequest("Content is required");
                }

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                // Load the user for the response
                await _context.Entry(comment).Reference(c => c.User).LoadAsync();

                return CreatedAtAction(nameof(GetComment), new { issueId, id = comment.Id }, comment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/issues/5/comments/3
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateComment(int issueId, int id, Comment comment)
        {
            try
            {
                // Check if issue exists
                if (!await _context.Issues.AnyAsync(i => i.Id == issueId))
                {
                    return NotFound("Issue not found");
                }

                var existingComment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == id && c.IssueId == issueId);
                if (existingComment == null)
                    return NotFound("Comment not found");

                // Validate required fields
                if (string.IsNullOrWhiteSpace(comment.Content))
                {
                    return BadRequest("Content is required");
                }

                // Update properties
                existingComment.Content = comment.Content;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommentExists(id))
                    return NotFound();
                else
                    throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/issues/5/comments/3
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int issueId, int id)
        {
            try
            {
                // Check if issue exists
                if (!await _context.Issues.AnyAsync(i => i.Id == issueId))
                {
                    return NotFound("Issue not found");
                }

                var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == id && c.IssueId == issueId);
                if (comment == null)
                    return NotFound("Comment not found");

                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool CommentExists(int id)
        {
            return _context.Comments.Any(e => e.Id == id);
        }
    }
}