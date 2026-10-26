import sqlite3
import pandas as pd
import folium

# 1. Leitura de dados do DB
conn = sqlite3.connect("ubs.db")
df = pd.read_sql_query("SELECT * FROM ubs", conn)
conn.close()

# 2. Garante que as colunas de coordenadas estão no formato numérico e sem valores vazios
df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
df = df.dropna(subset=['latitude', 'longitude'])

# 3. Cria o mapa centralizado em Recife (-8.0476, -34.8770)
mapa = folium.Map(location=[-8.0476, -34.8770], zoom_start=12)

# 4. Adiciona um marcador para cada UBS encontrada
for _, row in df.iterrows():
    nome = row.get('nome_oficial', 'UBS')
    bairro = row.get('bairro', 'Não informado')
    endereco = row.get('endereço', '')
    fone = row.get('fone', '')

    popup_texto = f"""
    <div style="font-family: sans-serif; min-width: 180px;">
        <h4 style="margin: 0 0 5px 0; color: #0056b3;">{nome}</h4>
        <p style="margin: 2px 0;"><b>Bairro:</b> {bairro}</p>
        <p style="margin: 2px 0;"><b>Endereço:</b> {endereco}</p>
        <p style="margin: 2px 0;"><b>Telefone:</b> {fone}</p>
    </div>
    """

    folium.Marker(
        location=[row['latitude'], row['longitude']],
        popup=folium.Popup(popup_texto, max_width=300),
        tooltip=nome,
        icon=folium.Icon(color='red', icon='plus-sign')
    ).add_to(mapa)

ICONES_POR_TIPO = {
    '10.1|Hospital da Mulher': '/static/img/icones/hospital.png',
    '2.1|Unidades Básicas de Saúde': '/static/img/icones/ubs.png',
    '2.2|Unidades Saúde da Família': '/static/img/icones/usf.png',
    '3|Farmácias da Família': '/static/img/icones/farmacia.png',
    '4.1|Unidades Saúde da Família': '/static/img/icones/usf.png',
    '7|Policlínicas': '/static/img/icones/policlinica.png',
    '8|Maternidades': '/static/img/icones/maternidade.png',
    '5.2|Unidades de Vacinação': '/static/img/icones/vacina.png'
}

def definir_icone_unidade(tipo: str) -> str:
    return ICONES_POR_TIPO.get(tipo, '/static/img/icones/default.png')

# 5. Salva o resultado em um arquivo HTML
mapa.save("static/mapa_ubs_recife.html")