export interface Aviso {
  id: number;
  autor: string;
  fotoAutor: string;
  asunto: string;
  fecha: string;
  mensaje: {
    saludo: string;
    cuerpo: string[]; // Array para manejar múltiples párrafos
  };
}