import { API } from './api.js';
import { Cart } from './cart.js';
import { UI } from './ui.js';
import { Products } from './products.js';
import { Auth } from './auth.js'; 

let todosLosProductos = [];

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('contenedor-principal');
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    // 1. CARGA INICIAL
    try {
        await Auth.checkSession(); 
        todosLosProductos = await API.getProductos();
        Products.render(todosLosProductos, contenedor);
        UI.renderCarrito();
    } catch (error) {
        console.error("Error al iniciar la tienda ICE DROP:", error);
    }

    // 2. DELEGACIÓN DE EVENTOS (UNIFICADA)
    document.addEventListener('click', (e) => {
        
        // --- FILTROS ---
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = parseInt(e.target.dataset.categoria);
            const filtrados = cat === 0 ? todosLosProductos : todosLosProductos.filter(p => p.categoriaPublico === cat);
            Products.render(filtrados, contenedor);
        }

        // --- AÑADIR AL CARRITO ---
        if (e.target.classList.contains('btn-add')) {
            const p = JSON.parse(e.target.dataset.producto);
            Cart.add(p);
            UI.showToast(`¡${p.nombre} AÑADIDO AL DROP!`);
        }

        // --- ABRIR / CERRAR CARRITO ---
        if (e.target.id === 'open-cart' || e.target.closest('#open-cart')) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        }
        
        if (e.target.id === 'close-cart' || e.target.id === 'cart-overlay') {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }

        // --- CONTROLES DE CANTIDAD ---
        if (e.target.classList.contains('increase')) Cart.increase(parseInt(e.target.dataset.id));
        if (e.target.classList.contains('decrease')) Cart.decrease(parseInt(e.target.dataset.id));
        if (e.target.classList.contains('btn-remove-item')) Cart.remove(parseInt(e.target.dataset.id));

        // --- FINALIZAR COMPRA (CONEXIÓN CON EL NUEVO ENDPOINT) ---
        if (e.target.id === 'btn-checkout') {
            const sessionData = sessionStorage.getItem('user');

            // Validar si hay usuario logueado
            if (!sessionData) {
                UI.showToast("INICIA SESIÓN PARA CONTINUAR");
                setTimeout(() => window.location.href = 'login.html', 1500);
                return;
            }

            // Validar si el carrito tiene productos
            if (Cart.items.length === 0) {
                UI.showToast("TU CARRITO ESTÁ VACÍO");
                return;
            }

            const user = JSON.parse(sessionData);
            const totalCompra = Cart.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

            UI.showToast("¡Transacción exitosa!");

            // PETICIÓN AL BACKEND: Guarda en la tabla 'pedido' usando las nuevas propiedades
            fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    IdUsuario: parseInt(user.id), // Enviamos el ID numérico que requiere tu DB
                    Total: totalCompra
                })
            })
            .then(response => {
                if (response.ok) {
                    console.log("Pedido guardado exitosamente en MariaDB.");
                    
                    // Renderizar el ticket visual en pantalla
                    mostrarTicket(); 

                    // Limpiar carrito de la memoria y del LocalStorage
                    Cart.items = [];
                    localStorage.removeItem('cart');
                    UI.renderCarrito();

                    // Cerrar el sidebar para ver el ticket de fondo
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                } else {
                    alert("❌ Error al registrar el pedido en el servidor.");
                }
            })
            .catch(error => {
                console.error("Error de red al intentar guardar el pedido:", error);
                alert("⚠️ Error de conexión con la API.");
            });
        }

        // --- CERRAR TICKET ---
        if (e.target.id === 'btn-close-ticket') {
            document.getElementById('ticket-modal').style.display = 'none';
        }

        // --- LOGOUT ---
        if (e.target.id === 'btn-logout') {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });

    // 3. EVENTO DE ACTUALIZACIÓN
    document.addEventListener('cartUpdated', () => {
        UI.renderCarrito();
    });
});

// --- FUNCIÓN DEL TICKET ---
function mostrarTicket() {
    // 1. Obtener datos del usuario real (Tester o Admin)
    const sessionData = sessionStorage.getItem('user');
    const user = sessionData ? JSON.parse(sessionData) : { nombre: "Invitado", correo: "n/a" };
    
    // 2. Llenar info del cliente
    document.getElementById('ticket-user-name').innerText = user.nombre.toUpperCase();
    document.getElementById('ticket-user-email').innerText = user.correo;
    document.getElementById('ticket-date').innerText = new Date().toLocaleString();

    // 3. Llenar lista de productos comprados
    const contenedorItems = document.getElementById('ticket-items');
    contenedorItems.innerHTML = Cart.items.map(item => `
        <div class="ticket-item-row" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>${item.cantidad}x ${item.nombre}</span>
            <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
        </div>
    `).join('');

    // 4. Calcular y poner el Total
    const total = Cart.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    document.getElementById('ticket-total').innerText = `$${total.toFixed(2)}`;

    // 5. Mostrar el Modal
    document.getElementById('ticket-modal').style.display = 'flex';
}