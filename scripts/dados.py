import pandas as pd
from sqlalchemy import create_engine

url_csv = 'https://dados.recife.pe.gov.br/dataset/0e15cca5-41a7-447e-b615-71b80fcb675b/resource/c960077b-640c-4cbc-9fac-01be82bf54d9/download/rede-de-atencao-a-saude-no-recife.csv'

df = pd.read_csv(url_csv, sep=';', encoding='utf-8')

df.columns = df.columns.str.lower()

# Filtro
tipo_unid_alvo = [
    '10.1|Hospital da Mulher', 
    '2.1|Unidades Básicas de Saúde', 
    '2.2|Unidades Saúde da Família', 
    '3|Farmácias da Família', 
    '4.1|Unidades Saúde da Família', 
    '7|Policlínicas', 
    '8|Maternidades', 
    '5.2|Unidades de Vacinação'
]
tipo_unid_alvo_upper = [t.upper() for t in tipo_unid_alvo]
df = df[df['tipo_unidade'].astype(str).str.upper().isin(tipo_unid_alvo_upper)].copy()

# Trata latitude e longitude e descarta sem coordenadas
df['latitude'] = pd.to_numeric(df['latitude'].astype(str).str.replace(',', '.'), errors='coerce')
df['longitude'] = pd.to_numeric(df['longitude'].astype(str).str.replace(',', '.'), errors='coerce')
df = df.dropna(subset=['latitude', 'longitude'])

df['id'] = range(1, len(df) + 1)

engine = create_engine('sqlite:///ubs.db')
df.to_sql(name='ubs', con=engine, if_exists='replace', index=False)