from src.data_loaders.ingestion import load_hermeneutic_data
from src.engine.poetic_core import PoeticEngine
import sys

def main():
    try:
        # Carga del corpus v3.01
        df = load_hermeneutic_data()
        engine = PoeticEngine(df)
        
        print("\n--- Motor Poético v3.02: Hermenéutica Felina ---")
        user_input = input("¿Qué fragmento de caos deseas ordenar?: ")
        
        projection = engine.project_thought(user_input)
        
        if isinstance(projection, dict):
            print(f"\n[Nodo: {projection['nodo']}]")
            print(f"Propósito: {projection['mensaje']}")
            print(f"Sefirá: {projection['kabbalah']}")
        else:
            print(f"\n{projection}")

    except Exception as e:
        print(f"Error en el despliegue: {e}")

if __name__ == '__main__':
    main()
