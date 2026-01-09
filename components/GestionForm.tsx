
import React, { useState, useEffect } from 'react';
import { Gestion, Estado, Role, Usuario, Urgencia } from '../types';

interface GestionFormProps {
  user: Usuario;
  editingId: string | null;
  initialData?: Gestion;
  onClose: () => void;
  onSave: (data: Partial<Gestion>) => void;
}

export const GestionForm: React.FC<GestionFormProps> = ({ user, editingId, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Gestion>>(initialData || {
    estado: Estado.Ingresado,
    urgencia: Urgencia.Media,
    costo_moneda: 'ARS',
    fecha_ingreso: new Date().toISOString().split('T')[0],
  });

  const [cambiarEstadoModal, setCambiarEstadoModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<Estado>(initialData?.estado || Estado.Ingresado);
  const [comentarioEstado, setComentarioEstado] = useState('');
  const [errorGeo, setErrorGeo] = useState<string | null>(null);

  // Mock de catálogos
  const departamentos = ['Capital', 'Colon', 'Punilla', 'San Justo'];
  const localidades: Record<string, string[]> = {
    'Capital': ['Córdoba'],
    'Colon': ['Salsipuedes', 'Unquillo', 'Rio Ceballos'],
    'Punilla': ['Villa Carlos Paz', 'Cosquín'],
  };

  const handleGeoChange = (dept?: string, loc?: string) => {
    const d = dept || formData.departamento;
    const l = loc || formData.localidad;

    if (d && l) {
      // Simulación de autocompletado desde infra_gestion.geo_localidades
      if (d === 'Capital' && l === 'Córdoba') {
        setFormData(prev => ({ ...prev, lat: -31.416, lon: -64.183 }));
        setErrorGeo(null);
      } else {
        setFormData(prev => ({ ...prev, lat: undefined, lon: undefined }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones obligatorias
    if (!formData.departamento || !formData.localidad || !formData.ministerio_agencia_id || !formData.categoria_general_id || !formData.detalle) {
      alert('Por favor complete todos los campos obligatorios: Departamento, Localidad, Ministerio, Categoría y Detalle.');
      return;
    }

    onSave({
      ...formData,
      updated_at: new Date().toISOString(),
      updated_by: user.email,
    });
  };

  const puedeCambiarEstado = (desde: Estado, hacia: Estado): boolean => {
    if (user.rol === Role.Admin) return true;
    if (user.rol === Role.Supervisor) {
      return true; // Puede todo, incluso Finalizada/Archivado
    }
    if (user.rol === Role.Operador) {
       // Operador: INGRESADO → DERIVADO A SUAC / NO REMITE SUAC / LISTA PARA INNAUGURAR
       if (desde === Estado.Ingresado) {
          return [Estado.Derivado, Estado.NoRemite, Estado.ListaInaugurar].includes(hacia);
       }
       return false;
    }
    return false;
  };

  const handleCambioEstado = () => {
    if (!puedeCambiarEstado(formData.estado as Estado, nuevoEstado)) {
      alert(`Su rol (${user.rol}) no tiene permisos para transicionar de ${formData.estado} a ${nuevoEstado}`);
      return;
    }

    if ([Estado.Archivado, Estado.NoRemite].includes(nuevoEstado) && !comentarioEstado) {
      alert('El comentario es obligatorio para los estados ARCHIVADO o NO REMITE SUAC.');
      return;
    }

    const updates: Partial<Gestion> = {
      estado: nuevoEstado,
      fecha_estado: new Date().toISOString(),
      observaciones: (formData.observaciones || '') + `\n[${new Date().toLocaleDateString()}] Cambio a ${nuevoEstado}: ${comentarioEstado}`
    };

    if (nuevoEstado === Estado.Finalizada) {
      updates.fecha_finalizacion = new Date().toISOString().split('T')[0];
    }

    setFormData(prev => ({ ...prev, ...updates }));
    setCambiarEstadoModal(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {editingId ? `Editando Gestión: ${initialData?.nro_expediente}` : 'Nueva Gestión Administrativa'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Header / Meta */}
            <div className="lg:col-span-3 bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <div>
                  <label className="block text-xs font-semibold text-blue-700 uppercase mb-1">Estado Actual</label>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold">{formData.estado}</span>
                    <button 
                      type="button" 
                      onClick={() => setCambiarEstadoModal(true)}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Cambiar Estado
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-700 uppercase mb-1">Urgencia</label>
                  <select 
                    value={formData.urgencia}
                    onChange={(e) => setFormData({ ...formData, urgencia: e.target.value as Urgencia })}
                    disabled={user.rol === Role.Operador && editingId !== null}
                    className="bg-white border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={Urgencia.Alta}>Alta</option>
                    <option value={Urgencia.Media}>Media</option>
                    <option value={Urgencia.Baja}>Baja</option>
                  </select>
                </div>
              </div>
              <div className="text-right">
                <label className="block text-xs font-semibold text-blue-700 uppercase mb-1">Expediente</label>
                <input 
                  type="text" 
                  placeholder="Ej: 2024-EXP-001"
                  className="bg-white border border-blue-200 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  value={formData.nro_expediente || ''}
                  onChange={(e) => setFormData({ ...formData, nro_expediente: e.target.value })}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className="md:col-span-1 border-r border-slate-100 pr-2">
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                Ubicación (Geo)
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Departamento *</label>
                  <select 
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={formData.departamento || ''}
                    onChange={(e) => {
                      const d = e.target.value;
                      setFormData({ ...formData, departamento: d, localidad: '' });
                      handleGeoChange(d, '');
                    }}
                  >
                    <option value="">Seleccione...</option>
                    {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Localidad *</label>
                  <select 
                    required
                    disabled={!formData.departamento}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                    value={formData.localidad || ''}
                    onChange={(e) => {
                      const l = e.target.value;
                      setFormData({ ...formData, localidad: l });
                      handleGeoChange(undefined, l);
                    }}
                  >
                    <option value="">Seleccione...</option>
                    {formData.departamento && localidades[formData.departamento]?.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Dirección</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={formData.direccion || ''}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded text-xs text-slate-600">
                  <div>Lat: {formData.lat || 'Auto-fetch'}</div>
                  <div>Lon: {formData.lon || 'Auto-fetch'}</div>
                </div>
              </div>
            </div>

            {/* Clasificación */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                Información Técnica
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Ministerio / Agencia *</label>
                  <select 
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={formData.ministerio_agencia_id || ''}
                    onChange={(e) => setFormData({ ...formData, ministerio_agencia_id: e.target.value })}
                  >
                    <option value="">Seleccione...</option>
                    <option value="MIN_INFRA">Ministerio de Infraestructura</option>
                    <option value="MIN_AGUA">Ministerio de Agua y Energía</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Categoría General *</label>
                  <select 
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={formData.categoria_general_id || ''}
                    onChange={(e) => setFormData({ ...formData, categoria_general_id: e.target.value })}
                  >
                    <option value="">Seleccione...</option>
                    <option value="OBRA_VIAL">Obra Vial</option>
                    <option value="RED_CLOACAL">Red Cloacal</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Detalle de Gestión (Objeto) *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={formData.detalle || ''}
                    onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Costo Estimado</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">$</span>
                    <input 
                      type="number" 
                      className="flex-1 min-w-0 border border-slate-300 rounded-none rounded-r-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      value={formData.costo_estimado || ''}
                      onChange={(e) => setFormData({ ...formData, costo_estimado: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
               <label className="block text-xs font-medium text-slate-500 mb-1">Observaciones</label>
               <textarea 
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData.observaciones || ''}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
               ></textarea>
            </div>

          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400 italic">* Campos obligatorios</span>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              Guardar en BigQuery
            </button>
          </div>
        </div>
      </div>

      {/* Modal Cambio de Estado */}
      {cambiarEstadoModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Cambiar Estado de Gestión</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nuevo Estado</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as Estado)}
                >
                  {Object.values(Estado).map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Comentario / Motivo</label>
                <textarea 
                  required={[Estado.Archivado, Estado.NoRemite].includes(nuevoEstado)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Explique el motivo del cambio..."
                  value={comentarioEstado}
                  onChange={(e) => setComentarioEstado(e.target.value)}
                ></textarea>
                {[Estado.Archivado, Estado.NoRemite].includes(nuevoEstado) && (
                  <p className="text-[10px] text-red-500 mt-1 font-medium">Obligatorio para este estado</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setCambiarEstadoModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Atrás
                </button>
                <button 
                  onClick={handleCambioEstado}
                  className="flex-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Confirmar Cambio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
