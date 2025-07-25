namespace SisLoja.EstacionamentoApi
{
    public class Garagem
    {
        public int? Ordem {  get; set; }
        public string Nome { get; set; }
        public int TotalVagas { get; set; }
        public int VagasPreenchidas { get; set; }
        public int VagasDisponiveis { get { return TotalVagas - VagasPreenchidas; } }

        public static Garagem Create()
        {
            Garagem garagem = new()
            {
                Nome = "G1",
                VagasPreenchidas = 0,
                TotalVagas = 150
            };

            return garagem;
        }
    }
}