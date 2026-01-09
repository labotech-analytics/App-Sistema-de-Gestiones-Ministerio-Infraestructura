
import React, { useState, useEffect } from 'react';
import { Evento } from '../types';

interface AuditHistoryProps {
  id_gestion: string;
  onClose: () => void;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({ id_gestion, onClose }) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular fetch de infra_gestion.gestiones_eventos
    setTimeout(() => {
      const mockEvents: Evento[] = [
        {
          id_evento: 'EV-1',
          id_gestion,
          ts_evento: new Date().toISOString(),
          actor_email: 'operador@gmail.com',
          actor_rol: 'Operador',
          tipo_evento: 'CREACION',
          payload_json: '{"detalle": "Alta inicial"}'
        },
        {
          id_evento: 'EV-2',
          id_gestion,
          ts_evento: new Date().toISOString(),
          actor_email: 'supervisor@gmail.com',
          actor_rol: 'Supervisor',
          tipo_evento: 'CAMBIO_ESTADO',
          estado_anterior: 'INGRESADO',
          estado_nuevo: 'DERIVADO A SUAC',
          comentario: 'Derivado para validación técnica'
        }
      ];
      setEventos(mockEvents.sort((a,b) => b.ts_evento.localeCompare(a.ts_evento)));
      setLoading(false);
    }, 500);
  }, [id_gestion]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-left">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Historial de Eventos</h3>
            <p className="text-xs text-slate-400 font-mono">{id_gestion}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
             <div className="text-center text-slate-400 py-10">Consultando logs de auditoría...</div>
          ) : eventos.map((ev, idx) => (
            <div key={ev.id_evento} className="relative pl-6 border-l-2 border-slate-100 last:border-0">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-600" />
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">{ev.tipo_evento}</span>
                <span className="text-[10px] text-slate-400">{new Date(ev.ts_evento).toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-sm font-medium text-slate-800">
                   {ev.actor_email} <span className="text-[10px] font-normal text-slate-400">({ev.actor_rol})</span>
                </p>
                {ev.tipo_evento === 'CAMBIO_ESTADO' && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-slate-400 line-through">{ev.estado_anterior}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    <span className="font-bold text-slate-700">{ev.estado_nuevo}</span>
                  </div>
                )}
                {ev.comentario && (
                  <p className="mt-2 text-xs italic text-slate-500 border-t border-slate-200 pt-2">
                    "{ev.comentario}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
