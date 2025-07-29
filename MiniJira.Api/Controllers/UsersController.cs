using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniJira.Api.Data;
using MiniJira.Api.Models;

namespace MiniJira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            return user;
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            try
            {
                // Ensure Id is not set for new users
                user.Id = 0;
                
                // Validate required fields
                if (string.IsNullOrWhiteSpace(user.Username) || string.IsNullOrWhiteSpace(user.Email))
                {
                    return BadRequest("Username and Email are required");
                }

                // Check if username already exists
                if (await _context.Users.AnyAsync(u => u.Username == user.Username))
                {
                    return BadRequest("Username already exists");
                }

                // Check if email already exists
                if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                {
                    return BadRequest("Email already exists");
                }

                // Set display name to username if not provided
                if (string.IsNullOrWhiteSpace(user.DisplayName))
                {
                    user.DisplayName = user.Username;
                }

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            try
            {
                var existingUser = await _context.Users.FindAsync(id);
                if (existingUser == null)
                    return NotFound();

                // Validate required fields
                if (string.IsNullOrWhiteSpace(user.Username) || string.IsNullOrWhiteSpace(user.Email))
                {
                    return BadRequest("Username and Email are required");
                }

                // Check if username already exists (excluding current user)
                if (await _context.Users.AnyAsync(u => u.Username == user.Username && u.Id != id))
                {
                    return BadRequest("Username already exists");
                }

                // Check if email already exists (excluding current user)
                if (await _context.Users.AnyAsync(u => u.Email == user.Email && u.Id != id))
                {
                    return BadRequest("Email already exists");
                }

                // Update properties
                existingUser.Username = user.Username;
                existingUser.Email = user.Email;
                existingUser.DisplayName = string.IsNullOrWhiteSpace(user.DisplayName) ? user.Username : user.DisplayName;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                    return NotFound();
                else
                    throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound();

                // Check if user has assigned issues
                var hasAssignedIssues = await _context.Issues.AnyAsync(i => i.AssigneeId == id);
                if (hasAssignedIssues)
                {
                    return BadRequest("Cannot delete user with assigned issues");
                }

                // Check if user has comments
                var hasComments = await _context.Comments.AnyAsync(c => c.UserId == id);
                if (hasComments)
                {
                    return BadRequest("Cannot delete user with existing comments");
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}