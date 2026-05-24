export const Products = {
    render(productos, contenedor) {
        if (!productos) return;
        contenedor.innerHTML = productos.map(p => {
            const imgSrc = p.imagen ? `data:image/png;base64,${p.imagen.trim().replace(/\s/g, '')}` : 'assets/Air Max.png';
            return `
                <div class="product-section">
                    <h1 class="brand-text">${p.nombre}</h1>
                    <img src="${imgSrc}" class="main-shoe" onerror="this.src='assets/Air Max.png'">
                    <div class="action-area">
                        <div class="mini-title" style="color: #d32f2f; letter-spacing: 3px; font-weight: bold; text-transform: uppercase;">${p.nombre}</div>
                        <h2 style="font-size: 3rem; font-weight: 900;">$${p.precio}</h2>
                        <button class="btn-cart btn-add" 
                                data-id="${p.id}" 
                                data-producto='${JSON.stringify(p)}' 
                                style="border-radius: 50px;">
                            ADD TO CART
                        </button>
                    </div>
                </div>`;
        }).join('');
    }
};
