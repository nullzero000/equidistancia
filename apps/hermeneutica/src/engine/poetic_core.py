class PoeticEngine:
    def __init__(self, dataframe):
        self.df = dataframe

    def project_thought(self, query):
        query = query.lower()
        # Filtro de coincidencia en el corpus de 98 nodos
        mask = self.df['Tema_Nodo'].str.lower().str.contains(query) | \
               self.df['excerpt_esp'].str.lower().str.contains(query)
        
        results = self.df[mask]
        
        if results.empty:
            return "El caos no encuentra eco en los 98 nodos actuales. Intenta otro símbolo."
        
        match = results.iloc[0]
        return {
            "nodo": match['Tema_Nodo'],
            "poeta": match['Poeta'],
            "mensaje": match['excerpt_esp'],
            "kabbalah": match['Rel_Kabbalah']
        }
