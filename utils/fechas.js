export function formatearFecha(fecha) {
  if (typeof fecha === 'string') {
    fecha = new Date(fecha);
  }
  
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getFullYear();
  
  return `${dia}/${mes}/${año}`;
}

export function parsearFecha(fechaStr) {
  const [dia, mes, año] = fechaStr.split('/');
  return new Date(año, parseInt(mes) - 1, dia);
}

export function formatearHora(hora) {
  return hora.padStart(5, '0');
} 
