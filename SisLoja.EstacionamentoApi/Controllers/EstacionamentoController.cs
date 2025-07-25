using Microsoft.AspNetCore.Mvc;

namespace SisLoja.EstacionamentoApi.Controllers
{
    [ApiController]
    [Route("estacionamento")]
    public class EstacionamentoController : ControllerBase
    {
        private readonly ILogger<EstacionamentoController> _logger;
        private readonly List<Garagem> _garagens;

        public EstacionamentoController(ILogger<EstacionamentoController> logger, List<Garagem> garagens)
        {
            _logger = logger;
            _garagens = garagens;
        }

        [HttpGet]
        public async Task<List<Garagem>> Get()
        {
            return _garagens.OrderBy(x=> x.Ordem).ToList();
        }

        [HttpPut("estacionar")]
        public async Task<List<Garagem>> Estacionar(string nome)
        {
            int index = _garagens.FindIndex(x => x.Nome.Equals(nome));

            if (_garagens[index].VagasPreenchidas + 1 > _garagens[index].TotalVagas)
                throw new Exception($"Não existem vagas disponiveis para {nome}");

            _garagens[index].VagasPreenchidas++;
            
            return _garagens;
        }

        [HttpPut("liberar-vaga")]
        public async Task<List<Garagem>> LiberarVaga(string nome)
        {
            int index = _garagens.FindIndex(x => x.Nome.Equals(nome));

            if (_garagens[index].VagasPreenchidas - 1 < 0)
                throw new Exception($"Não existem vaga a liberar para {nome}");
            
            _garagens[index].VagasPreenchidas--;

            return _garagens;
        }

        [HttpPut("vagas-disponiveis")]
        public async Task<List<Garagem>> AlterarVagasDisponiveis(string nome, int vagasDisponiveis)
        {
            int index = _garagens.FindIndex(x => x.Nome.Equals(nome));

            if (vagasDisponiveis > _garagens[index].TotalVagas)
                throw new Exception($"Não existem vagas o suficiente para liberar para {nome}");
            
            _garagens[index].VagasPreenchidas = _garagens[index].TotalVagas - vagasDisponiveis;
                                                         
            return _garagens;
        }

        [HttpPut("vagas-preenchidas")]
        public async Task<List<Garagem>> AlterarVagasPreenchidas(string nome, int vagasPreenchidas)
        {
            int index = _garagens.FindIndex(x => x.Nome.Equals(nome));

            if (vagasPreenchidas > _garagens[index].TotalVagas)
                throw new Exception($"Não existem vagas o suficientes para {nome}");

            _garagens[index].VagasPreenchidas = vagasPreenchidas;

            return _garagens;
        }
    }
}