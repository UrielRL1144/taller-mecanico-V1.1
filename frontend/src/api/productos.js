const API_URL = "http://localhost:3000/api";

export const buscarProductos = async (termino) => {
    try {
        const response = await fetch(`${API_URL}/productos/buscar?termino=${termino}`);
        if (!response.ok) throw new Error("Error en la búsqueda");
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
};