namespace SisLoja.EstacionamentoApi
{
    public class Presenca
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public DateTime DataHora { get; set; } = DateTime.UtcNow;
    }
}
