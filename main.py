from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import sqlite3
import os

app = FastAPI(title="Nara - Rede de Saúde")

# Habilita CORS caso precise testar em portas diferentes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

def get_db():
    conn = sqlite3.connect("ubs.db")
    conn.row_factory = sqlite3.Row
    return conn

# Rota principal
@app.get("/")
def home():
    caminho_index = os.path.join(os.path.dirname(__file__), "index.html")
    return FileResponse(caminho_index)

# Rota para pegar todos os marcadores do mapa
@app.get("/api/ubs/pontos")
def listar_pontos():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nome_oficial, tipo_unidade, latitude, longitude FROM ubs")
    pontos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return pontos

# Rota para buscar os detalhes completos da UBS clicada
@app.get("/api/ubs/{ubs_id}")
def obter_detalhes_ubs(ubs_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ubs WHERE id = ?", (ubs_id,))
    linha = cursor.fetchone()
    conn.close()
    
    if not linha:
        raise HTTPException(status_code=404, detail="Unidade não encontrada")
    
    return dict(linha)