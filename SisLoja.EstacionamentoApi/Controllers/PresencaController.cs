using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace SisLoja.EstacionamentoApi.Controllers
{
    [ApiController]
    [Route("presenca")]
    public class PresencaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly List<Convidado> _convidados;

        public PresencaController(AppDbContext context, List<Convidado> convidados)
        {
            _context = context;
            _convidados = convidados;   
        }

        [HttpPost]
        public async Task<IActionResult> Registrar([FromBody] PresencaInput input)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(input.Codigo))
                    return BadRequest("Código inválido.");

                var convidado = _convidados.FirstOrDefault(c => c.Codigo == input.Codigo);
                if (convidado == null)
                    return NotFound($"Código {input.Codigo} não encontrado.");

                bool jaRegistrado = await _context.Presencas
                    .AnyAsync(p => p.Codigo == input.Codigo && p.DataHora.Date == DateTime.UtcNow.Date);

                if (jaRegistrado)
                    return Ok(new { mensagem = $"Presença registrada para {convidado.Nome}." });

                var novaPresenca = new Presenca
                {
                    Codigo = input.Codigo,
                    Nome = convidado.Nome,
                    DataHora = DateTime.UtcNow
                };

                _context.Presencas.Add(novaPresenca);
                await _context.SaveChangesAsync();

                return Ok(new { mensagem = $"Presença registrada para {convidado.Nome}." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); 

                throw;
            }
        }

        [HttpPost("registrar-manualmente")]
        public async Task<IActionResult> RegistrarManualmente([FromBody] PresencaManualInput input)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(input.Nome))
                    return BadRequest("Nome inválido.");

                bool jaRegistrado = await _context.Presencas
                    .AnyAsync(p => p.Nome == input.Nome && p.DataHora.Date == DateTime.UtcNow.Date);

                if (jaRegistrado)
                    return Ok(new { mensagem = $"Presença registrada para {input.Nome}." });

                var dataUtc = DateTime.UtcNow.AddHours(-3); // Garante Kind = UTC

                var novaPresenca = new Presenca
                {
                    Codigo = "0",
                    Nome = input.Nome,
                    DataHora = dataUtc
                };

                _context.Presencas.Add(novaPresenca);
                await _context.SaveChangesAsync();

                return Ok(new { mensagem = $"Presença registrada para {input.Nome}." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);

                throw;
            }
        }


        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var lista = await _context.Presencas
                .OrderByDescending(p => p.DataHora)
                .ToListAsync();

            return Ok(lista);
        }

        public class PresencaInput
        {
            public string Codigo { get; set; }
        }

        public class PresencaManualInput
        {
            public string Nome { get; set; }
        }
    }
}
