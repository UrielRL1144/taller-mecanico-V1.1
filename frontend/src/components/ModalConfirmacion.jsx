export default function ModalConfirmacion({ isOpen, onClose, onConfirm, total, alertas = [] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-100 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-[0_0_50px_rgba(234,179,8,0.2)] border-2 border-yellow-500/30 relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full pointer-events-none"></div>

        {/* SECCIÓN DE ALERTAS DE STOCK (Estilo Industrial) */}
        {alertas.length > 0 && (
          <div className="mb-6 p-4 bg-red-900/20 border-l-4 border-red-500 rounded-r-xl">
            <h3 className="text-red-400 font-black text-xs sm:text-sm uppercase flex items-center gap-2 tracking-wide">
              ⚠️ ATENCIÓN: INVENTARIO BAJO
            </h3>
            <div className="mt-2 space-y-1">
              {alertas.map((msg, i) => (
                <p key={i} className="text-gray-300 text-xs font-bold leading-tight">
                  • {msg}
                </p>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-red-300/70 font-bold uppercase tracking-widest">
              * Se recomienda reabastecer pronto
            </p>
          </div>
        )}

        {/* ENCABEZADO */}
        <div className="text-center mb-6 relative z-10">
            <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-1">Confirmar Cobro</h2>
            <div className="inline-block bg-gray-800 px-6 py-2 rounded-2xl border border-gray-700 mt-2">
                <p className="text-4xl font-black text-yellow-400 tracking-tighter drop-shadow-lg">
                    ${total.toFixed(2)}
                </p>
            </div>
        </div>
        
        {/* BOTONES DE PAGO (Grandes y Táctiles) */}
        <div className="grid grid-cols-1 gap-4 mb-6 relative z-10">
          <button 
            onClick={() => onConfirm('Efectivo')}
            className="group w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-lg border-b-4 border-green-800 active:scale-95 transition-all px-6 flex justify-between items-center uppercase tracking-wide"
          >
            <span className="flex items-center gap-3 text-lg">
                💵 Efectivo
            </span>
            <span className="opacity-50 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button 
            onClick={() => onConfirm('Transferencia')}
            className="group w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg border-b-4 border-blue-800 active:scale-95 transition-all px-6 flex justify-between items-center uppercase tracking-wide"
          >
            <span className="flex items-center gap-3 text-lg">
                📱 Transferencia
            </span>
            <span className="opacity-50 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* BOTÓN CANCELAR */}
        <button onClick={onClose} className="w-full py-3 text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors rounded-xl hover:bg-gray-800">
          ✕ Cancelar y volver
        </button>
      </div>
    </div>
  );
}