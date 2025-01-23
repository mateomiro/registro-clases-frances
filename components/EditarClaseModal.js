import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EditarClaseModal({ clase, onGuardar, onCancelar }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  useEffect(() => {
    if (clase) {
      const [dia, mes, año] = clase.fecha.split('/');
      setFecha(`${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);
      setHora(clase.hora);
    }
  }, [clase]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const [año, mes, dia] = fecha.split('-');
    const fechaFormateada = `${parseInt(dia)}/${parseInt(mes)}/${año}`;
    onGuardar({ ...clase, fecha: fechaFormateada, hora });
  };

  if (!clase) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* ... resto del JSX ... */}
      </div>
    </div>
  );
} 
