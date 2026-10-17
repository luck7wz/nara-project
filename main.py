from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(title="API UBS Recife")

# Monta a pasta estática para servir CSS, imagens e o HTML do mapa
app.mount("/static", StaticFiles(directory="static"), name="static")

# Rota principal que entrega o mapa
@app.get("/")
def home():
    caminho_mapa = os.path.join("static", "mapa_ubs_recife.html")
    return FileResponse(caminho_mapa)

# Rota bônus: se você quiser consultar dados como JSON também
@app.get("/api/status")
def status():
    return {"status": "online", "cidade": "Recife"}