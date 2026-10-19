let map; 

function iniciarSite() {
    document.body.classList.add('site-ativo');

    // Reajusta o tamanho do mapa nativo quando a animação/layout expande
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
            console.log("Mapa Leaflet reajustado com sucesso!");
        }, 400);
    }

    const areaAbas = document.getElementById('abas');
    if (areaAbas) {
        areaAbas.style.display = 'block';
        console.log("Área de informações exibida!");
    }
}

function fecharCard() {
    const card = document.getElementById('card-detalhes-ubs');
    if (card) {
        card.classList.add('oculta');
    }
}

let controleRota = null;

function calcularRota(latDestino, lngDestino) {
    if (!navigator.geolocation) {
        alert("O seu navegador não suporta geolocalização.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (posicao) => {
            const latOrigem = posicao.coords.latitude;
            const lngOrigem = posicao.coords.longitude;

            // Se já tiver uma rota traçada, remove antes de criar a nova
            if (controleRota) {
                map.removeControl(controleRota);
            }

            controleRota = L.Routing.control({
                position: 'topleft',

                waypoints: [
                    L.latLng(latOrigem, lngOrigem),
                    L.latLng(latDestino, lngDestino)
                ],
                language: 'pt-BR',
                show: true,
                collapsible: true,
                routeWhileDragging: false
            }).addTo(map);

            // Ajusta o zoom
            map.fitBounds([
                [latOrigem, lngOrigem],
                [latDestino, lngDestino]
            ], { padding: [50, 50] });
        },
        (erro) => {
            alert("Permissão de localização negada ou indisponível.");
        }
    );
}

document.addEventListener("DOMContentLoaded", () => {

    // INICIALIZAÇÃO DO MAPA LEAFLET

    const mapElement = document.getElementById('mapa-nara');
    if (mapElement) {
        // Coordenadas centrais de Recife
        map = L.map('mapa-nara').setView([-8.0578, -34.9000], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const cardDetalhes = document.getElementById('card-detalhes-ubs');
        const conteudoUbs = document.getElementById('conteudo-ubs');

        // Carregar os pontos da API do FastAPI
        fetch('/api/ubs/pontos')
            .then(res => res.json())
            .then(pontos => {
                pontos.forEach(ponto => {
                    const marker = L.marker([ponto.latitude, ponto.longitude]).addTo(map);
                    marker.bindTooltip(ponto.nome_oficial);

                    // Evento de clique para ir buscar os dados detalhados ao SQLite
                    marker.on('click', async () => {
                        if (cardDetalhes) cardDetalhes.classList.remove('oculta');
                        if (conteudoUbs) conteudoUbs.innerHTML = '<p>A carregar detalhes...</p>';

                        try {
                            const res = await fetch(`/api/ubs/${ponto.id}`);
                            const dados = await res.json();

                            if (conteudoUbs) {
                                conteudoUbs.innerHTML = `
                                    <span class="badge-tipo">${dados.tipo_unidade || 'Unidade de Saúde'}</span>
                                    <h3>${dados.nome_oficial}</h3>
                                    <p><strong>Bairro:</strong> ${dados.bairro || 'Não informado'}</p>
                                    <p><strong>Endereço:</strong> ${dados.endereço || 'Não informado'}</p>
                                    <p><strong>Telefone:</strong> ${dados.fone || 'Não informado'}</p>
                                    <p><strong>Horário de Atendimento:</strong> ${dados.horario || 'Não informado'}</p>
                                    <p><strong>Especialidades / Serviços:</strong> ${dados.especialidade || 'Não informado'}</p>

                                    <button type="button" class="btn-rota" onclick="calcularRota(${dados.latitude},${dados.longitude})">
                                        Como chegar
                                    </button>
                                `;
                            }
                        } catch (err) {
                            if (conteudoUbs) {
                                conteudoUbs.innerHTML = '<p style="color: red;">Erro ao obter informações da base de dados.</p>';
                            }
                        }
                    });
                });
            })
            .catch(err => console.error("Erro ao carregar os pontos:", err));
    }

    // LÓGICA DAS ABAS
    const containerAbas = document.querySelector('.container-abas');
    if (!containerAbas) return;

    const todosBlocos = containerAbas.querySelectorAll('.bloco-escolha');

    todosBlocos.forEach(bloco => {
        bloco.addEventListener('click', (evento) => {
            evento.stopPropagation();

            const idAlvoAtual = bloco.getAttribute('data-alvo');

            todosBlocos.forEach(b => {
                b.classList.remove('ativo');
                const idAlvo = b.getAttribute('data-alvo');
                const conteudo = document.getElementById(idAlvo);
                if (conteudo) conteudo.style.display = 'none';
            });

            bloco.classList.add('ativo');
            const conteudoAlvo = document.getElementById(idAlvoAtual);
            if (conteudoAlvo) {
                conteudoAlvo.style.display = 'block';
            }
        });
    });
});