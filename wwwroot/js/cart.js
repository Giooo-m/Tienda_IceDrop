export const Cart = {
    // 1. Cambiamos a 'icedrop_cart' para que coincida con tu marca
    items: JSON.parse(localStorage.getItem('icedrop_cart')) || [],

    add(producto) {
        // CORRECCIÓN: Habías cerrado la función add() antes de tiempo
        
        // Animación del badge (contador del carrito)
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.classList.add('bump-animation');
            setTimeout(() => badge.classList.remove('bump-animation'), 300);
        }

        // CORRECCIÓN: Decía 'product.nombre', debe ser 'producto.nombre' (como el parámetro)
        if (typeof UI !== 'undefined') {
            UI.showToast(`¡${producto.nombre} al carrito!`);
        }
        
        // Sonido opcional
        const audio = new Audio('assets/sounds/click.mp3');
        audio.volume = 0.2;
        audio.play().catch(() => {});

        // Lógica de agregado
        const existente = this.items.find(item => item.id === producto.id);
        
        if (existente) {
            existente.cantidad++;
        } else {
            // Agregamos el producto con cantidad inicial de 1
            this.items.push({ ...producto, cantidad: 1 });
        }
        
        this.save();
    },

    increase(id) {
        const item = this.items.find(i => i.id === id);
        if (item) item.cantidad++;
        this.save();
    },

    decrease(id) {
        const item = this.items.find(i => i.id === id);
        if (item && item.cantidad > 1) {
            item.cantidad--;
        } else {
            this.remove(id);
        }
        this.save();
    },

    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },

    save() {
        // Guardamos con el nuevo nombre de marca
        localStorage.setItem('icedrop_cart', JSON.stringify(this.items));
        
        // Disparamos evento para que la interfaz se refresque sola
        document.dispatchEvent(new CustomEvent('cartUpdated'));
    },

    getTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    },

    getCount() {
        return this.items.reduce((count, item) => count + item.cantidad, 0);
    }
};