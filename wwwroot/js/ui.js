import { Cart } from './cart.js';

export const UI = {

    // --- RENDERIZADO DEL CARRITO (ARREGLADO: COMPACTO Y PREMIUM) ---
    renderCarrito() {
        const contenedor = document.getElementById('cart-items');
        const contador = document.getElementById('cart-count');
        const totalElemento = document.getElementById('cart-total');
        
        if (!contenedor) return;

        // Actualizar contador del badge
        if (contador) contador.innerText = Cart.getCount();

        // Si el carrito está vacío
        if (Cart.items.length === 0) {
            contenedor.innerHTML = `<p style="text-align:center; opacity:0.3; margin-top:30px; font-size:0.7rem; letter-spacing:2px;">TU CARRITO ESTÁ VACÍO</p>`;
            if (totalElemento) totalElemento.innerText = "0.00";
            return;
        }

        // Dibujar productos (Estilo ICE DROP Compacto)
        contenedor.innerHTML = Cart.items.map(item => `
            <div class="cart-item" style="display: flex; align-items: center; gap: 12px; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <img src="data:image/png;base64,${item.imagen}" alt="${item.nombre}" 
                    style="width: 50px; height: 50px; object-fit: contain; background: #000; border-radius: 6px;">
                
                <div class="item-info" style="flex-grow: 1;">
                    <h4 style="font-size: 0.75rem; margin: 0; text-transform: uppercase; color: #fff;">${item.nombre}</h4>
                    <p style="font-size: 0.85rem; color: #d32f2f; font-weight: 900; margin: 2px 0;">$${item.precio}</p>
                    
                    <div class="quantity-controls" style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                        <button class="decrease" data-id="${item.id}" style="background:none; border:1px solid #333; color:white; width:20px; height:20px; cursor:pointer; border-radius:4px; display:flex; align-items:center; justify-content:center;">-</button>
                        <span style="font-size: 0.8rem; font-weight: bold;">${item.cantidad}</span>
                        <button class="increase" data-id="${item.id}" style="background:none; border:1px solid #333; color:white; width:20px; height:20px; cursor:pointer; border-radius:4px; display:flex; align-items:center; justify-content:center;">+</button>
                    </div>
                </div>
                
                <button class="btn-remove-item" data-id="${item.id}" style="background:none; border:none; cursor:pointer; font-size:1.1rem; opacity:0.6;">🗑️</button>
            </div>
        `).join('');

        if (totalElemento) {
            totalElemento.innerText = Cart.getTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 });
        }
    },

    // --- NOTIFICACIÓN TOAST (TU CÓDIGO ACTUAL) ---
    showToast(mensaje) {
        const viejoToast = document.querySelector('.ice-toast');
        if (viejoToast) viejoToast.remove();

        const toast = document.createElement('div');
        toast.className = 'ice-toast';
        toast.innerText = mensaje;
        
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #d32f2f;
            color: white;
            padding: 15px 35px;
            border-radius: 4px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(211, 47, 47, 0.4);
            border-left: 6px solid white;
            pointer-events: none;
            font-family: sans-serif;
        `;
        
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = "all 0.4s ease";
            toast.style.transform = "translateX(120%)";
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    },

    // --- MODAL DE CHECKOUT ---
    showModalCheckout() {
        alert("¡GRACIAS POR TU COMPRA EN ICE DROP! Procesando pedido...");
    }
};