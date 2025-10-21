using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;

var builder = WebApplication.CreateBuilder(args);

//Services Go Here
builder.Services.AddDbContext<TodoDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.")));
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
