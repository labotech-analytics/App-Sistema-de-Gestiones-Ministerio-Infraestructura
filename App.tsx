
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { GestionTable } from './components/GestionTable';
import { Dashboard } from './components/Dashboard';
import { UserAdmin } from './components/UserAdmin';
import { Role, Usuario } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [view, setView] = useState<'gestiones' | 'dashboard' | 'usuarios'>('gestiones');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular chequeo de sesión OAuth
    const savedUser = localStorage.getItem('infra_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (email: string) => {
    // En producción esto validaría contra el endpoint /me
    // Simulamos un usuario Admin por defecto para la demo
    const mockUser: Usuario = {
      email,
      nombre: email.split('@')[0],
      rol: Role.Admin, // Simulado
      activo: true
    };
    setUser(mockUser);
    localStorage.setItem('infra_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('infra_user');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Cargando...</div>;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <Layout user={user} onLogout={handleLogout} activeView={view} onViewChange={setView}>
      {view === 'gestiones' && <GestionTable user={user} />}
      {view === 'dashboard' && <Dashboard />}
      {view === 'usuarios' && user.rol === Role.Admin && <UserAdmin />}
      {view === 'usuarios' && user.rol !== Role.Admin && (
        <div className="p-8 bg-white rounded shadow text-center">
          Acceso denegado. Se requiere rol de Administrador.
        </div>
      )}
    </Layout>
  );
};

export default App;
