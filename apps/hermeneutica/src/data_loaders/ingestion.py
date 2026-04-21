import pandas as pd
import os

# Localizador de raíz: hermeneutica_app/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def load_hermeneutic_data(file_name='98_nodos_gato_v4_corregido.csv'):
    """Carga y valida el corpus de 98 nodos felinos."""
    path = os.path.join(BASE_DIR, 'data', 'raw', file_name)
    
    if not os.path.exists(path):
        raise FileNotFoundError(f"CRÍTICO: Archivo no encontrado en: {path}")

    df = pd.read_csv(path)

    # Validación v3.01
    if len(df) != 98:
        raise ValueError(f"ERROR DE ESQUEMA: Se detectaron {len(df)} nodos de 98 esperados.")
    
    return df

def get_kabbalah_mapping(df):
    """Indexa temas por Sefirá."""
    return df.groupby('Rel_Kabbalah')['Tema_Nodo'].apply(list).to_dict()
