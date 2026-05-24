document.addEventListener('DOMContentLoaded', () => {
    // Buscamos el formulario de registro por su ID
    const regForm = document.getElementById('register-form');

    if (!regForm) {
        console.error("No se encontró el formulario 'register-form'. Revisa el ID en tu HTML.");
        return;
    }

    regForm.addEventListener('submit', async (e) => {
        // 1. Evitamos que la página se recargue (que se borre todo)
        e.preventDefault();

        // 2. Obtenemos los datos de los inputs del HTML
        const nombre = document.getElementById('reg-nombre').value;
        const correo = document.getElementById('reg-correo').value;
        const password = document.getElementById('reg-pass').value;

        // 3. Feedback visual: deshabilitamos el botón para que no den mil clics
        const btn = regForm.querySelector('button');
        const textoOriginal = btn.innerText;
        btn.innerText = "CREANDO CUENTA...";
        btn.disabled = true;

        try {
            // 4. Mandamos los datos a tu API en C#
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Nombre: nombre,    // Así lo espera tu UsuarioDto
                    Correo: correo,    // Así lo espera tu UsuarioDto
                    Password: password // Así lo espera tu UsuarioDto
                })
            });

            if (res.ok) {
                // 5. Si todo salió bien, avisamos y mandamos al Login
                alert("¡BIENVENIDO A ICE DROP! Cuenta creada con éxito.");
                window.location.href = 'login.html';
            } else {
                // Si el servidor responde con error (ej: correo duplicado)
                const errorData = await res.json();
                alert("ERROR: " + (errorData.mensaje || "No se pudo crear la cuenta. Intenta con otro correo."));
                btn.innerText = textoOriginal;
                btn.disabled = false;
            }
        } catch (error) {
            // Si el servidor ni siquiera responde
            console.error("Error técnico:", error);
            alert("⚠️ EL SERVIDOR NO RESPONDE: Revisa que Visual Studio esté en modo 'Play'.");
            btn.innerText = textoOriginal;
            btn.disabled = false;
        }
    });
});
