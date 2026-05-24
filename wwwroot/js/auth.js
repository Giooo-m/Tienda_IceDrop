export const Auth = {
    user: null,
    async checkSession() {
        try {
            const res = await fetch('/api/session');
            if (res.ok) {
                this.user = await res.json();
                this.updateNavbar();
            }
        } catch (e) { console.log("Sin sesión"); }
    },

    updateNavbar() {
        const navRight = document.getElementById('nav-right');
        if (this.user) {
            navRight.innerHTML = `
                ${this.user.rol === 'ADMIN' ? '<a href="admin.html" class="nav-link">DASHBOARD</a>' : ''}
                <span class="user-name">HOLA, ${this.user.nombre}</span>
                <button id="btn-logout" class="btn-logout">SALIR</button>
            `;
        }
    }
};
