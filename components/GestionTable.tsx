
import React, { useState, useEffect } from 'react';
import { Gestion, Estado, Role, Usuario, Urgencia } from '../types';
import { GestionForm } from './GestionForm';
import { AuditHistory } from './AuditHistory';

interface GestionTableProps {
  user: Usuario;
}

export const GestionTable: React.FC<GestionTableProps> = ({ user }) => {
  const [data, setData] = useState<Gestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  // Simulación de carga desde BigQuery
  useEffect(() => {
    const mockData: Gestion[] = [
      {
        id_gestion: 'G-001',
        nro_expediente: '2024-EXP-1002',
        origen: 'Ciudadano',
        estado: Estado.Ingresado,
        fecha_ingreso: '2024-05-10',
        fecha_estado: new Date().toISOString(),
        urgencia: Urgencia.Media,
        ministerio_agencia_id: 'MIN_INFRA',
        categoria_general_id: 'OBRA_VIAL',
        subtipo_detalle: 'Bacheo',
        detalle: 'Reparación de calle principal',
        observaciones: 'Prioridad según vecino',
        departamento: 'Capital',
        localidad: 'Córdoba',
        direccion: 'Av. Colón 1200',
        lat: -31.416,
        lon: -64.183,
        costo_estimado: 500000,
        costo_moneda: 'ARS',
        created_at: new Date().toISOString(),
        created_by: 'operador@gmail.com',
        updated_at: new Date().toISOString(),
        updated_by: 'operador@gmail.com',
        is_deleted: false
      },
      {
        id_gestion: 'G-002',
        nro_expediente: '2024-EXP-1005',
        origen: 'Municipio',
        estado: Estado.Derivado,
        fecha_ingreso: '2024-05-12',
        fecha_estado: new Date().toISOString(),
        urgencia: Urgencia.Alta,
        ministerio_agencia_id: 'MIN_AGUA',
        categoria_general_id: 'RED_CLOACAL',
        subtipo_detalle: 'Nueva Red',
        detalle: 'Extensión red cloacal Barrio Norte',
        observaciones: 'Planificado 2024',
        departamento: 'Colon',
        localidad: 'Salsipuedes',
        direccion: 'Calle Pública s/n',
        costo_estimado: 12000000,
        costo_moneda: 'ARS',
        created_at: new Date().toISOString(),
        created_by: 'operador@gmail.com',
        updated_at: new Date().toISOString(),
        updated_by: 'operador@gmail.com',
        is_deleted: false
      }
    ];
    setData(mockData);
    setLoading(false);
  }, []);

  const filteredData = data.filter(item => 
    item.detalle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nro_expediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Confirmar borrado lógico de esta gestión?')) {
      setData(data.map(item => item.id_gestion === id ? { ...item, is_deleted: true } : item));
    }
  };

  const getStatusStyle = (estado: Estado) => {
    switch (estado) {
      case Estado.Ingresado: return 'bg-blue-100 text-blue-700';
      case Estado.Derivado: return 'bg-amber-100 text-amber-700';
      case Estado.ListaInaugurar: return 'bg-emerald-100 text-emerald-700';
      case Estado.Finalizada: return 'bg-slate-100 text-slate-700 font-bold';
      case Estado.NoRemite: return 'bg-red-100 text-red-700';
      case Estado.Archivado: return 'bg-slate-200 text-slate-500';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input 
            type="text" 
            placeholder="Buscar por detalle, expte o depto..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {user.rol !== Role.Consulta && (
          <button 
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Nueva Gestión
          </button>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Nro Expediente</th>
              <th className="px-4 py-3">Urgencia</th>
              <th className="px-4 py-3">Geografía</th>
              <th className="px-4 py-3">Detalle / Obra</th>
              <th className="px-4 py-3">Último Cambio</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Cargando datos operativos de BigQuery...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No se encontraron registros.</td></tr>
            ) : filteredData.map(item => (
              <tr key={item.id_gestion} className={`hover:bg-slate-50 transition-colors ${item.is_deleted ? 'opacity-50 grayscale bg-red-50' : ''}`}>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusStyle(item.estado)}`}>
                    {item.estado}
                  </span>
                </td>
                <td className="px-4 py-4 font-mono text-xs">{item.nro_expediente}</td>
                <td className="px-4 py-4">
                  <span className={`flex items-center gap-1.5 ${item.urgencia === Urgencia.Alta ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${item.urgencia === Urgencia.Alta ? 'bg-red-500 animate-pulse' : item.urgencia === Urgencia.Media ? 'bg-amber-400' : 'bg-slate-400'}`} />
                    {item.urgencia}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-slate-900">{item.departamento}</div>
                  <div className="text-xs text-slate-500">{item.localidad}</div>
                </td>
                <td className="px-4 py-4 max-w-xs truncate">
                  <div className="font-medium text-slate-900">{item.detalle}</div>
                  <div className="text-xs text-slate-500">{item.categoria_general_id}</div>
                </td>
                <td className="px-4 py-4 text-slate-500 whitespace-nowrap">
                  {new Date(item.fecha_estado).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => setHistoryId(item.id_gestion)}
                      title="Ver Historial"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
                    </button>
                    {!item.is_deleted && user.rol !== Role.Consulta && (
                      <button 
                        onClick={() => handleEdit(item.id_gestion)}
                        title="Editar"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                    )}
                    {!item.is_deleted && (user.rol === Role.Admin || user.rol === Role.Supervisor) && (
                      <button 
                        onClick={() => handleDelete(item.id_gestion)}
                        title="Eliminar"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <GestionForm 
          user={user}
          editingId={editingId} 
          onClose={() => setShowForm(false)} 
          initialData={editingId ? data.find(d => d.id_gestion === editingId) : undefined}
          onSave={(updated) => {
            if (editingId) {
              setData(data.map(d => d.id_gestion === editingId ? { ...d, ...updated } : d));
            } else {
              setData([{ ...updated, id_gestion: `G-${Math.floor(Math.random() * 1000)}` }, ...data]);
            }
            setShowForm(false);
          }}
        />
      )}

      {historyId && (
        <AuditHistory 
          id_gestion={historyId} 
          onClose={() => setHistoryId(null)} 
        />
      )}
    </div>
  );
};
