using Microsoft.EntityFrameworkCore;
using SisLoja.EstacionamentoApi;
using static SisLoja.EstacionamentoApi.Controllers.PresencaController;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

List<Garagem> garagens = new List<Garagem>();
builder.Configuration.GetSection("Garagens").Bind(garagens);
builder.Services.AddSingleton(garagens);

List<Convidado> convidados = new List<Convidado>();
builder.Configuration.GetSection("Convidados").Bind(convidados);
builder.Services.AddSingleton(convidados);

// Configure CORS para permitir todas as origens
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        builder =>
        {
            builder
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
