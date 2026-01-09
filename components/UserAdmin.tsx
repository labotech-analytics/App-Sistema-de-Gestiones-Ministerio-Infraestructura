
import React, { useState } from 'react';
import { Role, Usuario } from '../types';

export const UserAdmin: React.FC = () => {
  const [users, setUsers] = useState<Usuario[]>([
    { email: 'admin@gmail.com', nombre: 'Admin Global', rol: Role.Admin, activo: true },
    { email: 'operador@gmail.com', nombre: 'Juan Perez', rol: Role.Operador, activo: true },
    { email: 'supervisor@gmail.com', nombre: 'Maria Luz', rol: Role.Supervisor, activo: true },
  ]);

  const [newUser, setNewUser] = useState({ email: '', nombre: '', rol: Role.Operador });

  const addUser = () => {
    if (!newUser.email.includes('@gmail.com')) {
      alert('Solo se admiten correos @gmail.com');
      return;
    }
    setUsers([...users, { ...newUser, activo: true }]);
    setNewUser({ email: '', nombre: '', rol: Role.Operador });
  };

  const toggleUser = (email: string) => {
    setUsers(users.map(u => u.email === email ? { ...u, activo: !u.activo } : u));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="16" x2="22" y1="11" y2="11"/></svg>
          Agregar a Whitelist
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={newUser.nombre}
              onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email Google (@gmail.com)</label>
            <input 
              type="email" 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Rol Asignado</label>
            <select 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={newUser.rol}
              onChange={(e) => setNewUser({...newUser, rol: e.target.value as Role})}
            >
              {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button 
            onClick={addUser}
            className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            Autorizar Usuario
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.email} className={!u.activo ? 'bg-slate-50 opacity-60' : ''}>
                <td className="px-4 py-4">
                  <div className="font-medium text-slate-900">{u.nombre}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-4 py-4">
                   <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-600">
                    {u.rol}
                   </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 ${u.activo ? 'text-emerald-600' : 'text-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button 
                    onClick={() => toggleUser(u.email)}
                    className={`text-xs font-medium ${u.activo ? 'text-red-600 hover:underline' : 'text-emerald-600 hover:underline'}`}
                  >
                    {u.activo ? 'Revocar' : 'Reactivar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
