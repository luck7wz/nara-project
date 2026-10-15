import pandas as pd
from sqlalchemy import create_engine
url_csv = 'https://dados.recife.pe.gov.br/dataset/c63f29cf-682c-4593-9f31-40dd8bd8204f/resource/7927e663-6753-489c-943c-f20cdd72555e/download/unidades-basicas-de-saude-ubs.csv'

df = pd.read_csv(url_csv, sep=';', encoding='latin1')

engine = create_engine('sqlite:///ubs.db')
df.to_sql(name='ubs', con=engine, if_exists='replace', index=False)