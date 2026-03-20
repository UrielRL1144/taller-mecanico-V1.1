export default function ModalConfirmacionSimple({ isOpen, onClose, onConfirm, titulo, mensaje, textoBotonConfirmar }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-110 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl scale-in-center">
        <div className="flex flex-col items-center text-center">
          {/* Icono de advertencia */}
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl">
            ⚠️
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-2">{titulo}</h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed whitespace-pre-line">
            {mensaje}
          </p>
          
          <div className="flex flex-col w-full gap-2">
            <button 
              onClick={onConfirm}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95"
            >
              {textoBotonConfirmar}
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 text-gray-400 font-semibold hover:text-gray-600 transition-colors"
            >
              No, regresar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}