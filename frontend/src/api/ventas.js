export const registrarVenta = async (datosVenta) => {
    try {
        const response = await fetch("http://localhost:3000/api/ventas", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosVenta)
        });
        return await response.json();
    } catch (error) {
        console.error("Error al registrar venta:", error);
        return { success: false };
    }
};