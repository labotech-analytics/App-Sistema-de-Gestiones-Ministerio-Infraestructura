
export enum Role {
  Admin = 'Admin',
  Operador = 'Operador',
  Supervisor = 'Supervisor',
  Consulta = 'Consulta'
}

export enum Estado {
  Ingresado = 'INGRESADO',
  Derivado = 'DERIVADO A SUAC',
  ListaInaugurar = 'LISTA PARA INNAUGURAR',
  Finalizada = 'FINALIZADA',
  NoRemite = 'NO REMITE SUAC',
  Archivado = 'ARCHIVADO'
}

export enum Urgencia {
  Alta = 'Alta',
  Media = 'Media',
  Baja = 'Baja'
}

export interface Usuario {
  email: string;
  nombre: string;
  rol: Role;
  activo: boolean;
}

export interface Gestion {
  id_gestion: string;
  nro_expediente: string;
  origen: string;
  estado: Estado;
  fecha_ingreso: string;
  fecha_estado: string;
  fecha_finalizacion?: string;
  urgencia: Urgencia;
  ministerio_agencia_id: string;
  categoria_general_id: string;
  subtipo_detalle: string;
  detalle: string;
  observaciones: string;
  geo_id?: string;
  departamento: string;
  localidad: string;
  direccion: string;
  lat?: number;
  lon?: number;
  costo_estimado: number;
  costo_moneda: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  is_deleted: boolean;
}

export interface Evento {
  id_evento: string;
  id_gestion: string;
  ts_evento: string;
  actor_email: string;
  actor_rol: string;
  tipo_evento: string;
  estado_anterior?: string;
  estado_nuevo?: string;
  comentario?: string;
  payload_json?: string;
}

export interface CatalogoItem {
  id: string;
  nombre: string;
}

export interface LocalidadGeo {
  departamento: string;
  localidad: string;
  lat: number;
  lon: number;
}
