document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://sislojaestacionamentoapi.azurewebsites.net/estacionamento';

    function fetchGaragens() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const garagensContainer = document.getElementById('garagens');
                garagensContainer.innerHTML = ''; // Clear any existing content
                data.forEach(garagem => {
                    const garagemDiv = document.createElement('div');
                    garagemDiv.className = 'garagem';

                    const garagemName = document.createElement('h2');
                    garagemName.textContent = garagem.nome;

                    const vagasDisponiveis = document.createElement('p');
                    vagasDisponiveis.textContent = garagem.vagasDisponiveis;

                    garagemDiv.appendChild(garagemName);
                    garagemDiv.appendChild(vagasDisponiveis);

                    garagensContainer.appendChild(garagemDiv);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API:', error);
            });
    }

    // Atualiza a lista de garagens a cada 5 segundos
    setInterval(fetchGaragens, 5000);

    // Fetch data on initial load
    fetchGaragens();
});
