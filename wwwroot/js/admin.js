import { API } from './api.js';
import { Auth } from './auth.js';
import { UI } from './ui.js'; // Importamos tus toasts premium

async function validarAcceso() {
    await Auth.checkSession();
    if (!Auth.user || Auth.user.rol !== 'ADMIN') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

const lista = document.getElementById('lista-admin-productos');
const modal = document.getElementById('modal-producto');
const form = document.getElementById('form-producto');
let productosLocales = []; // Para buscar datos sin volver a la API al editar

async function cargarGestion() {
    try {
        productosLocales = await API.getProductos();
        lista.innerHTML = productosLocales.map(p => `
            <tr>
                <td><img src="data:image/png;base64,${p.imagen}" class="table-img" style="width:40px; border-radius:4px;"></td>
                <td>${p.nombre}</td>
                <td>$${p.precio}</td>
                <td>${p.stock}</td>
                <td>
                    <span class="btn-edit" data-id="${p.id}" style="cursor:pointer; color:#00ff00; margin-right:10px;">EDITAR</span>
                    <span class="btn-delete" data-id="${p.id}" style="cursor:pointer; color:#ff0000;">ELIMINAR</span>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        UI.showToast("ERROR AL CARGAR PRODUCTOS");
    }
}

document.addEventListener('click', async (e) => {
    // ELIMINAR
    if (e.target.classList.contains('btn-delete')) {
        const id = e.target.dataset.id;
        if(confirm("¿Seguro que quieres eliminar este producto de ICE DROP?")) {
            const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
            if(res.ok) {
                UI.showToast("PRODUCTO ELIMINADO");
                cargarGestion();
            }
        }
    }
    
    // EDITAR (Cargar datos al form)
    if (e.target.classList.contains('btn-edit')) {
        const id = parseInt(e.target.dataset.id);
        const prod = productosLocales.find(p => p.id === id);
        if(prod) {
            document.getElementById('modal-titulo').innerText = "EDITAR PRODUCTO";
            // Llenamos el form con los datos actuales
            form['prod-nombre'].value = prod.nombre;
            form['prod-precio'].value = prod.precio;
            form['prod-stock'].value = prod.stock;
            form['prod-categoria'].value = prod.categoriaPublico;
            // Guardamos el ID en un campo oculto o en el dataset del form
            form.dataset.editId = id; 
            modal.classList.add('active');
        }
    }
    
    if (e.target.id === 'btn-nuevo-producto') {
        form.reset();
        delete form.dataset.editId;
        document.getElementById('modal-titulo').innerText = "NUEVO PRODUCTO";
        modal.classList.add('active');
    }

    if (e.target.id === 'btn-cancelar') modal.classList.remove('active');
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    // Si estamos editando, podrías enviar el ID también
    const url = form.dataset.editId ? `/api/productos/${form.dataset.editId}` : '/api/productos';
    const metodo = form.dataset.editId ? 'PUT' : 'POST'; // O seguir usando POST si así lo prefieres

    const res = await fetch(url, {
        method: metodo,
        body: formData
    });
    
    if(res.ok) {
        UI.showToast(form.dataset.editId ? "PRODUCTO ACTUALIZADO" : "PRODUCTO AGREGADO");
        modal.classList.remove('active');
        cargarGestion();
    }
});

validarAcceso().then(permitido => {
    if (permitido) cargarGestion();
});
