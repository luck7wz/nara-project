let map;
let controleRota = null;
let todosOsPontos = [];
let camadaMarcadores = L.layerGroup();

function iniciarSite() {
    document.body.classList.add('site-ativo');

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

function calcularRota(latDestino, lngDestino) {
    if (!navigator.geolocation) {
        alert("O seu navegador não suporta geolocalização.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (posicao) => {
            const latOrigem = posicao.coords.latitude;
            const lngOrigem = posicao.coords.longitude;

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

            map.fitBounds([
                [latOrigem, lngOrigem],
                [latDestino, lngDestino]
            ], { padding: [50, 50] });

            // Mostra o botão de cancelar rota
            const btnCancelar = document.getElementById('btn-cancelar-trajeto');
            if (btnCancelar) {
                btnCancelar.style.display = 'block';
            }
        },
        (erro) => {
            alert("Permissão de localização negada ou indisponível.");
        }
    );
}

/// Renderiza marcadores no layerGroup
function renderizarMarcadores(lista) {
    camadaMarcadores.clearLayers();

    const cardDetalhes = document.getElementById('card-detalhes-ubs');
    const conteudoUbs = document.getElementById('conteudo-ubs');

    lista.forEach(ponto => {
        // 1. Cria o ícone com a imagem vinda do backend
        const iconeCustomizado = L.icon({
            iconUrl: ponto.icone_url || '/static/img/icones/default.png',
            iconSize: [64.73, 103.75],
            iconAnchor: [32.365, 103.75],
            popupAnchor: [0, -32]
        });

        // 2. Passa o ícone customizado para o marcador
        const marker = L.marker([ponto.latitude, ponto.longitude], {
            icon: iconeCustomizado
        });

        marker.bindTooltip(ponto.nome_oficial);

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
                        <p><strong>Endereço:</strong> ${dados.endereço || dados.endereco || 'Não informado'}</p>
                        <p><strong>Telefone:</strong> ${dados.fone || dados.telefone || 'Não informado'}</p>
                        <p><strong>Horário:</strong> ${dados.horario || 'Não informado'}</p>
                        <p><strong>Especialidades:</strong> ${dados.especialidade || 'Não informado'}</p>

                        <button type="button" class="btn-rota" onclick="calcularRota(${dados.latitude}, ${dados.longitude})">
                            Como chegar
                        </button>

                        <button type="button" id="btn-cancelar-trajeto" class="btn-cancelar" style="display: none;" onclick="cancelarRota()">
                            Encerrar trajeto
                        </button>
                    `;
                }
            } catch (err) {
                if (conteudoUbs) {
                    conteudoUbs.innerHTML = '<p style="color: red;">Erro ao obter informações.</p>';
                }
            }
        });

        camadaMarcadores.addLayer(marker);
    });
}

// Dicionário mapeando os filtros para os nomes exatos do banco
const MAPA_TIPOS = {
    'UBS_USF': [
        '2.1|Unidades Básicas de Saúde',
        '2.2|Unidades Saúde da Família',
        '4.1|Unidades Saúde da Família'
    ],
    'POLICLINICA': ['7|Policlínicas'],
    'MATERNIDADE': ['8|Maternidades'],
    'HOSPITAL_MULHER': ['10.1|Hospital da Mulher'],
    'FARMACIA': ['3|Farmácias da Família'],
    'VACINACAO': ['5.2|Unidades de Vacinação']
};

function filtrarPontos(categoria, ev) {
    // 1. Atualiza visual do botão ativo
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('ativo'));
    if (ev && ev.target) {
        ev.target.classList.add('ativo');
    }

    // 2. Se for TODOS, desenha tudo
    if (categoria === 'TODOS') {
        renderizarMarcadores(todosOsPontos);
        return;
    }

    // 3. Obtém as chaves válidas para a categoria clicada
    const tiposPermitidos = MAPA_TIPOS[categoria] || [];

    // 4. Filtra a lista comparando com o campo tipo_unidade
    const filtrados = todosOsPontos.filter(ponto => {
        if (!ponto.tipo_unidade) return false;
        return tiposPermitidos.some(tipo => ponto.tipo_unidade.includes(tipo));
    });

    // 5. Atualiza os marcadores na tela
    renderizarMarcadores(filtrados);
}

function cancelarRota() {
    if (controleRota) {
        map.removeControl(controleRota);
        controleRota = null;
    }

    // Opcional: esconde o botão de cancelar após clicar nele
    const btnCancelar = document.getElementById('btn-cancelar-trajeto');
    if (btnCancelar) {
        btnCancelar.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const mapElement = document.getElementById('mapa-nara');
    if (mapElement) {
        map = L.map('mapa-nara').setView([-8.0578, -34.9000], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Adiciona a camada gerenciada ao mapa
        camadaMarcadores.addTo(map);

        // Busca única de dados no banco SQLite
        fetch('/api/ubs/pontos')
            .then(res => res.json())
            .then(pontos => {
                todosOsPontos = pontos;
                renderizarMarcadores(todosOsPontos);
            })
            .catch(err => console.error("Erro ao carregar os pontos:", err));
    }

    // Controle de exibição das abas informativas
    const containerAbas = document.querySelector('.container-abas');
    if (containerAbas) {
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
    }
});

const telaBeneficios = document.getElementById('conteudo-info');
const telaSaude = document.getElementById('tela-saude');
const trilho = document.getElementById('trilho');
const pontos = document.getElementById('pontos');

let indice = 0;
const CARDS_VISIVEIS = 3; // no celular vira 1 (veja abaixo)

function abrirSaude() {
    telaBeneficios.hidden = true;
    telaSaude.hidden = false;
    indice = 0;
    atualizarCarrossel();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function voltarBeneficios() {
    telaSaude.hidden = true;
    telaBeneficios.hidden = false;
}

function visiveis() {
    return window.innerWidth <= 700 ? 1 : CARDS_VISIVEIS;
}

function moverCarrossel(direcao) {
    const total = trilho.children.length;
    const maximo = Math.max(0, total - visiveis());
    indice = Math.min(Math.max(indice + direcao, 0), maximo);
    atualizarCarrossel();
}

function atualizarCarrossel() {
    const card = trilho.children[0];
    const passo = card.offsetWidth + 20; // largura do card + gap
    trilho.style.transform = `translateX(-${indice * passo}px)`;

    // bolinhas de paginação
    const total = trilho.children.length;
    pontos.innerHTML = '';
    for (let i = 0; i < total; i++) {
        const p = document.createElement('span');
        p.className = 'ponto' + (i === indice ? ' ativo' : '');
        pontos.appendChild(p);
    }
}

window.addEventListener('resize', atualizarCarrossel);

function abrirPrograma(idTela) {
    const tela = document.getElementById(idTela);
    const carrossel = document.getElementById('tela-saude');
    if (!tela || !carrossel) return;

    carrossel.hidden = true;
    tela.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fecharPrograma() {
    document.querySelectorAll('.programa').forEach(p => p.hidden = true);
    document.getElementById('tela-saude').hidden = false;
    atualizarCarrossel();
}

// Botão "Localizar pontos": sobe até o mapa e filtra farmácias
function irParaMapa() {
    document.querySelectorAll('.programa').forEach(p => p.hidden = true);
    document.getElementById('tela-saude').hidden = false;

    document.getElementById('mapa-nara').scrollIntoView({ behavior: 'smooth' });
    filtrarPontos('FARMACIA', {
        target: [...document.querySelectorAll('.btn-filtro')]
            .find(b => b.textContent.includes('Farmácias'))
    });
}