document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-login-premium');

    if (!btn) {
        console.error("No se encontró el botón con ID 'btn-login-premium'");
        return;
    }

    btn.addEventListener('click', async () => {
        const correo = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!correo || !password) {
            alert("⚠️ Por favor, llena todos los campos.");
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 1. AJUSTE: Usamos Mayúsculas para que coincida con el DTO de C#
                body: JSON.stringify({ 
                    Correo: correo, 
                    Password: password 
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // 2. LO QUE FALTABA: Guardar al usuario para que aparezca en el TICKET
                sessionStorage.setItem('user', JSON.stringify({
                    id: data.id_usuario || data.id,
                    nombre: data.nombre,
                    rol: data.rol,
                    correo: correo // Guardamos el correo que ingresó
                }));

                console.log("Sesión guardada para:", data.nombre);

                // Redirección
                window.location.href = (data.rol === 'ADMIN') ? 'admin.html' : 'index.html';
            } else {
                alert("❌ ACCESO DENEGADO: Correo o contraseña incorrectos.");
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
            alert("⚠️ ERROR DE SERVIDOR: Asegúrate de que Visual Studio esté corriendo.");
        }
    });
});
