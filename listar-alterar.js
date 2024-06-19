document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://sislojaestacionamentoapi.azurewebsites.net/estacionamento';
    const updateUrl = 'https://sislojaestacionamentoapi.azurewebsites.net/garagens'; // Update endpoint
    const deleteUrl = 'https://sislojaestacionamentoapi.azurewebsites.net/garagens';
    const addUrl = 'https://sislojaestacionamentoapi.azurewebsites.net/garagens';
    const resetUrl = 'https://sislojaestacionamentoapi.azurewebsites.net/garagens/resetar';

    // Get modal elements
    const modal = document.getElementById('novoModal');
    const novoButton = document.getElementById('novoButton');
    const closeSpan = document.getElementsByClassName('close')[0];

    // Open modal
    novoButton.onclick = function() {
        modal.style.display = 'block';
    }

    // Close modal
    closeSpan.onclick = function() {
        modal.style.display = 'none';
    }

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    function fetchGaragens() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const garagensContainer = document.querySelector('#garagens tbody');
                garagensContainer.innerHTML = ''; // Clear any existing content
                data.forEach(garagem => {
                    const row = document.createElement('tr');

                    const nomeCell = document.createElement('td');
                    const nomeInput = document.createElement('input');
                    nomeInput.type = 'text';
                    nomeInput.value = garagem.nome;
                    nomeInput.id = `nome-${garagem.nome}`;
                    nomeCell.appendChild(nomeInput);

                    const totalVagasCell = document.createElement('td');
                    const totalVagasInput = document.createElement('input');
                    totalVagasInput.type = 'number';
                    totalVagasInput.value = garagem.totalVagas;
                    totalVagasInput.id = `totalVagas-${garagem.nome}`;
                    totalVagasCell.appendChild(totalVagasInput);

                    const vagasPreenchidasCell = document.createElement('td');
                    const vagasPreenchidasInput = document.createElement('input');
                    vagasPreenchidasInput.type = 'number';
                    vagasPreenchidasInput.value = garagem.vagasPreenchidas;
                    vagasPreenchidasInput.id = `vagasPreenchidas-${garagem.nome}`;
                    vagasPreenchidasCell.appendChild(vagasPreenchidasInput);

                    const ordemCell = document.createElement('td');
                    const ordemInput = document.createElement('input');
                    ordemInput.type = 'number';
                    ordemInput.value = garagem.ordem || 0; // Default to 0 if undefined
                    ordemInput.id = `ordem-${garagem.nome}`;
                    ordemCell.appendChild(ordemInput);

                    const actionsCell = document.createElement('td');
                    const alterarButton = document.createElement('button');
                    alterarButton.textContent = 'Alterar';
                    alterarButton.onclick = () => alterarGaragem(garagem.nome);

                    const deletarButton = document.createElement('button');
                    deletarButton.textContent = 'Deletar';
                    deletarButton.className = 'delete';
                    deletarButton.onclick = () => deletarGaragem(garagem.nome);

                    const resetarButton = document.createElement('button');
                    resetarButton.textContent = 'Resetar';
                    resetarButton.className = 'reset';
                    resetarButton.onclick = () => resetarGaragem(garagem.nome);

                    actionsCell.appendChild(alterarButton);
                    actionsCell.appendChild(deletarButton);
                    actionsCell.appendChild(resetarButton);

                    row.appendChild(nomeCell);
                    row.appendChild(totalVagasCell);
                    row.appendChild(vagasPreenchidasCell);
                    row.appendChild(ordemCell);
                    row.appendChild(actionsCell);

                    garagensContainer.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API:', error);
            });
    }

    function alterarGaragem(nomeOriginal) {
        const novoNome = document.getElementById(`nome-${nomeOriginal}`).value;
        const totalVagas = document.getElementById(`totalVagas-${nomeOriginal}`).value;
        const vagasPreenchidas = document.getElementById(`vagasPreenchidas-${nomeOriginal}`).value;
        const ordem = document.getElementById(`ordem-${nomeOriginal}`).value;

        fetch(`${updateUrl}?nome=${nomeOriginal}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome: novoNome, totalVagas: parseInt(totalVagas), vagasPreenchidas: parseInt(vagasPreenchidas), ordem: parseInt(ordem) })
        })
        .then(response => response.json())
        .then(data => {
            // Atualizar a lista de garagens após a alteração
            fetchGaragens();
        })
        .catch(error => {
            console.error('Erro ao alterar garagem:', error);
        });
    }

    function deletarGaragem(nome) {
        fetch(`${deleteUrl}?nome=${nome}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                fetchGaragens();
            } else {
                console.error('Erro ao deletar garagem:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Erro ao deletar garagem:', error);
        });
    }

    function resetarGaragem(nome) {
        fetch(`${resetUrl}?nome=${nome}`, {
            method: 'PUT'
        })
        .then(response => {
            if (response.ok) {
                fetchGaragens();
            } else {
                console.error('Erro ao resetar vagas:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Erro ao resetar vagas:', error);
        });
    }

    function adicionarGaragem(event) {
        event.preventDefault();

        const nome = document.getElementById('nomeNovaGaragem').value;
        const totalVagas = document.getElementById('totalVagasNovaGaragem').value;
        const vagasPreenchidas = document.getElementById('vagasPreenchidasNovaGaragem').value;
        const ordem = document.getElementById('ordemNovaGaragem').value;

        fetch(addUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, totalVagas: parseInt(totalVagas), vagasPreenchidas: parseInt(vagasPreenchidas), ordem: parseInt(ordem) })
        })
        .then(response => response.json())
        .then(data => {
            // Fechar o modal e atualizar a lista de garagens
            modal.style.display = 'none';
            fetchGaragens();
        })
        .catch(error => {
            console.error('Erro ao adicionar garagem:', error);
        });
    }

    // Fetch data on initial load
    fetchGaragens();

    // Add event listener to form
    document.getElementById('novaGaragemForm').addEventListener('submit', adicionarGaragem);
});
