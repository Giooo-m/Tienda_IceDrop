export const API = {
    // Función para obtener todos los productos de tu Program.cs
    async getProductos() {
        try {
            const respuesta = await fetch('/api/productos');
            if (!respuesta.ok) throw new Error("Error al conectar con la API");
            return await respuesta.json();
        } catch (error) {
            console.error("Error en API:", error);
            return [];
        }
    }
};
