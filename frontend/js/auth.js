// Auth logic module

class AuthManager {
    static init() {
        this.checkAuth();
        this.setupListeners();
    }

    static checkAuth() {
        const token = localStorage.getItem('nh_token');
        if (token) {
            UI.switchView('app-view');
            App.initialize();
        } else {
            UI.switchView('auth-view');
        }
    }

    static setupListeners() {
        // Toggle views
        document.getElementById('to-register').addEventListener('click', (e) => {
            e.preventDefault();
            UI.switchView('register-view');
        });

        document.getElementById('to-login').addEventListener('click', (e) => {
            e.preventDefault();
            UI.switchView('auth-view');
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('nh_token');
            localStorage.removeItem('nh_user');
            UI.switchView('auth-view');
        });

        // Login Handler
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'CONNECTING...';
            btn.disabled = true;

            try {
                const email = document.getElementById('login-email').value;
                const pass = document.getElementById('login-password').value;

                const data = await ApiService.login(email, pass);

                localStorage.setItem('nh_token', data.token);
                localStorage.setItem('nh_user', JSON.stringify(data.user));

                UI.switchView('app-view');
                App.initialize();
            } catch (err) {
                alert(err.message);
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });

        // Register Handler
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'PROCESSING...';
            btn.disabled = true;

            try {
                const name = document.getElementById('reg-name').value;
                const email = document.getElementById('reg-email').value;
                const pass = document.getElementById('reg-password').value;

                const data = await ApiService.register(name, email, pass);

                localStorage.setItem('nh_token', data.token);
                localStorage.setItem('nh_user', JSON.stringify(data.user));

                UI.switchView('app-view');
                App.initialize();
            } catch (err) {
                alert(err.message);
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }
}
