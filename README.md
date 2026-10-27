<p align="center">
  <img src="static/img/logo-readme.png" alt="Logo da Nara" width="200">
</p>

<h1 align="center">Nara</h1>

<p align="center"><b>Há cuidado mais perto do que você imagina.</b></p>

Projeto de hackathon que democratiza o acesso das mulheres à saúde: encontre unidades de saúde perto de você, conheça benefícios e direitos, e acesse informações sobre dignidade menstrual.

## Funcionalidades

- **Mapa interativo** com as unidades de saúde (UBS, USF, policlínicas, maternidades, Hospital da Mulher, Farmácias da Família e unidades de vacinação).
- **Filtros por tipo de unidade** e ícone próprio para cada categoria.
- **Detalhes da unidade** (endereço, telefone, horário, especialidades) e **rota até o local**.
- **Sobre a Nara** e **Benefícios e Direitos**, com cards de programas como Saúde e bem-estar, Dignidade Menstrual, Rede Alyne e Útero é Vida.
- Menu animado que leva direto à aba escolhida.

## Tecnologias

- **Backend:** Python, FastAPI, SQLite
- **Frontend:** HTML, CSS e JavaScript puros
- **Mapa:** Leaflet e Leaflet Routing Machine, com tiles do OpenStreetMap
- **Ícones:** Font Awesome
- **Fontes:** Outfit, Bebas Neue e Alata (Google Fonts), além de fontes locais em `static/fonts/`

## Estrutura

```
nara-project/
├── main.py              # API FastAPI e servidor de arquivos estáticos
├── ubs.db               # Banco SQLite com as unidades de saúde
├── index.html           # Página principal
├── scripts/
│   └── mapa.py          # Escolhe o ícone de cada tipo de unidade
└── static/
    ├── css/style.css
    ├── js/script.js
    ├── fonts/
    └── img/
```

## Como rodar

Pré-requisito: Python 3.10 ou superior.

> **Importante:** antes de iniciar o servidor, é necessário instalar as dependências do arquivo `requirements.txt` (passo 3). Sem isso, o projeto não executa.

```bash
# 1. Clone o repositório
git clone https://github.com/<seu-usuario>/<nome-do-repositorio>.git
cd <nome-do-repositorio>

# 2. (Opcional) crie um ambiente virtual
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/macOS

# 3. Instale as dependências (obrigatório)
pip install -r requirements.txt

# 4. Inicie o servidor
uvicorn main:app --reload
```

Abra **Endereço do servidor: http://000.0.0.0:0000 ** no navegador.

> Acesse sempre pelo endereço do servidor. Abrir o `index.html` direto no navegador não carrega o mapa nem as fontes.

## API

| Método | Rota                | Descrição                                   |
|--------|---------------------|---------------------------------------------|
| GET    | `/`                 | Página principal                            |
| GET    | `/api/ubs/pontos`   | Lista todas as unidades com o ícone do mapa |
| GET    | `/api/ubs/{id}`     | Detalhes completos de uma unidade           |

## Créditos

- Mapas: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- [Leaflet](https://leafletjs.com/) e [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/)
- [Font Awesome](https://fontawesome.com/) e [Google Fonts](https://fonts.google.com/)
- Fontes locais (Coolvetica, Meriva, St Camino Frontera, Helvetica): consulte as respectivas licenças antes de redistribuir.
- Dados das unidades de saúde: _informar a fonte (ex.: dados abertos da prefeitura)_.


## Equipe

- [@peddrolucas](https://github.com/peddrolucas)
- [@geovanalarissa](https://github.com/geovanalarissa)
- [@jvhenriquecw ](https://github.com/jvhenriquecw)
