using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Data.Models;

var builder = WebApplication.CreateBuilder(args);

#region Service Configurations
builder.Services.AddDbContext<TodoDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.")));

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
            ?? throw new InvalidOperationException("Missing valid origins for front-end access."))
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});
#endregion

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDatabaseDeveloperPageExceptionFilter();
}

var app = builder.Build();
app.UseCors("CorsPolicy");

#region /api/todoitems
var todoItems = app.MapGroup("/api/todoitems");
todoItems.MapGet("/", GetAllTodos);
todoItems.MapGet("/complete", GetCompleteTodos);
todoItems.MapGet("/{id}", GetTodo);
todoItems.MapPost("/", CreateTodo);
todoItems.MapPut("/{id}", UpdateTodo);
todoItems.MapDelete("/{id}", DeleteTodo);

app.Run();

static async Task<IResult> GetAllTodos(TodoDbContext db)
{
    return TypedResults.Ok(await db.TodoList.ToArrayAsync());
}

static async Task<IResult> GetCompleteTodos(TodoDbContext db)
{
    return TypedResults.Ok(await db.TodoList.Where(t => t.IsComplete).ToListAsync());
}

static async Task<IResult> GetTodo(int id, TodoDbContext db)
{
    return await db.TodoList.FindAsync(id) is Todo todo ? TypedResults.Ok(todo) : TypedResults.NotFound();
}

static async Task<IResult> CreateTodo(Todo todo, TodoDbContext db)
{
    db.TodoList.Add(todo);
    await db.SaveChangesAsync();
    return TypedResults.Created($"/api/todoitems/{todo.Id}", todo);
}

static async Task<IResult> UpdateTodo(int id, Todo inputTodo, TodoDbContext db)
{
    var todo = await db.TodoList.FindAsync(id);

    if (todo is null)
        return TypedResults.NotFound();

    todo.Title = inputTodo.Title;
    todo.Description = inputTodo.Description;
    todo.DueDate = inputTodo.DueDate;
    todo.IsComplete = inputTodo.IsComplete;

    await db.SaveChangesAsync();

    return TypedResults.NoContent();
}

static async Task<IResult> DeleteTodo(int id, TodoDbContext db)
{
    if (await db.TodoList.FindAsync(id) is Todo todo)
    {
        db.TodoList.Remove(todo);
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    return TypedResults.NotFound();
}
#endregion