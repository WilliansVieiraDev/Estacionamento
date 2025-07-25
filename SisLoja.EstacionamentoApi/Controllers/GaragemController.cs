using Microsoft.AspNetCore.Mvc;

namespace SisLoja.EstacionamentoApi.Controllers
{
    [ApiController]
    [Route("garagens")]
    public class GaragemController : ControllerBase
    {
        private readonly ILogger<EstacionamentoController> _logger;
        private readonly List<Garagem> _garagens;

        public GaragemController(ILogger<EstacionamentoController> logger, List<Garagem> garagens)
        {
            _logger = logger;
            _garagens = garagens;
        }

        [HttpPost]
        public async Task<List<Garagem>> CriarGaragem([FromBody] Garagem garagem)
        {
            _garagens.Add(garagem);
            return _garagens;
        }

        [HttpDelete]
        public async Task<List<Garagem>> Delete(string nome)
        {
            _garagens.Remove(_garagens.Find(x => x.Nome.Equals(nome)));
            return _garagens;
        }

        [HttpPut]
        public async Task<List<Garagem>> AlterarGaragem(string nome, [FromBody] Garagem garagem)
        {
            _garagens[_garagens.FindIndex(x => x.Nome.Equals(nome))] = garagem;
            return _garagens;
        }

        [HttpPut("resetar")]
        public async Task<List<Garagem>> Resetar(string nome)
        {
            _garagens[_garagens.FindIndex(x => x.Nome.Equals(nome))].VagasPreenchidas = 0;
            return _garagens;
        }
    }
}