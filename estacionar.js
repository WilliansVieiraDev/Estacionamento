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

                    const estacionarButton = document.createElement('button');
                    estacionarButton.textContent = 'Check in';
                    estacionarButton.onclick = () => estacionarVeiculo(garagem.nome);

                    const liberarButton = document.createElement('button');
                    liberarButton.textContent = 'Liberar Vaga';
                    liberarButton.onclick = () => liberarVaga(garagem.nome);

                    garagemDiv.appendChild(garagemName);
                    garagemDiv.appendChild(vagasDisponiveis);
                    garagemDiv.appendChild(estacionarButton);
                    garagemDiv.appendChild(liberarButton);

                    garagensContainer.appendChild(garagemDiv);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API:', error);
            });
    }

    function estacionarVeiculo(nomeGaragem) {
        fetch(`https://sislojaestacionamentoapi.azurewebsites.net/estacionamento/estacionar?nome=${nomeGaragem}`, {
            method: 'PUT'
        })
        .then(response => {
            if (response.ok) {
                fetchGaragens(); // Atualiza a lista de garagens após a ação
            } else {
                console.error('Erro ao estacionar veículo:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Erro ao estacionar veículo:', error);
        });
    }

    function liberarVaga(nomeGaragem) {
        fetch(`https://sislojaestacionamentoapi.azurewebsites.net/estacionamento/liberar-vaga?nome=${nomeGaragem}`, {
            method: 'PUT'
        })
        .then(response => {
            if (response.ok) {
                fetchGaragens(); // Atualiza a lista de garagens após a ação
            } else {
                console.error('Erro ao liberar vaga:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Erro ao liberar vaga:', error);
        });
    }

    fetchGaragens();
});
