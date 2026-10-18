function iniciarSite() {
    document.body.classList.add('site-ativo');
    const iframe = document.getElementById('iframe-mapa');
    if (iframe && iframe.contentWindow) {
        setTimeout(() => {
            iframe.contentWindow.postMessage('invalidateSize', '*');
            console.log("Mapa do Folium reajustado com sucesso!");
        }, 800);
    }

    const areaAbas = document.getElementById('abas');
    if (areaAbas) {
        areaAbas.style.display = 'block';
        console.log("Área de informações exibida!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
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
