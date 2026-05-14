import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function Done() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="rounded-2xl border border-green-200 bg-white p-10 shadow-sm max-w-md w-full">
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={36} className="text-green-600" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          ¡Evaluación completada!
        </h1>
        <p className="mb-6 text-gray-600 leading-relaxed">
          Gracias por completar tu evaluación. Hemos registrado tus respuestas correctamente.
        </p>

        <div className="mb-6 space-y-3 text-left">
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-3">
            <Clock size={16} className="mt-0.5 shrink-0 text-blue-600" />
            <p className="text-sm text-blue-700">
              El equipo evaluador revisará tus resultados y se pondrá en contacto contigo
              a la brevedad.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
            <Mail size={16} className="mt-0.5 shrink-0 text-gray-500" />
            <p className="text-sm text-gray-600">
              Si tienes dudas sobre el proceso, comunícate con el equipo de Recursos Humanos.
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={() => navigate('/')} className="w-full">
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
