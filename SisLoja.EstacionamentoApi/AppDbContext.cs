using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace SisLoja.EstacionamentoApi
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

        public DbSet<Presenca> Presencas => Set<Presenca>();
    }
}
