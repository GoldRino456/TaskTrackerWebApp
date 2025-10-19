using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data.Models;

namespace TaskTrackerAPI.Data;

public class TodoDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<Todo> TodoList { get; set; }
}
