import { useState } from 'react';
import { Clock, Calendar, Euro, Edit2, Trash2 } from 'lucide-react';

export default function ClaseCard({ clase, onEditar, onEliminar }) {
  const [confirmando, setConfirmando] = useState(false);

  const handleEliminar = () => {
    if (confirmando) {
      onEliminar(clase.id);
      setConfirmando(false);
    } else {
      setConfirmando(true);
      setTimeout(() => setConfirmando(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">
            {clase.estudiante}
          </h3>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <Calendar className="w-4 h-4" />
            <span>{clase.fecha}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{clase.hora}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Euro className="w-4 h-4" />
            <span>{clase.tarifa}€/hora ({clase.duracion} min)</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEditar(clase)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleEliminar}
            className={`p-2 rounded-full transition-colors ${
              confirmando 
                ? 'bg-red-100 text-red-600' 
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 
