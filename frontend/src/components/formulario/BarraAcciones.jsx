import React from 'react';

export default function BarraAcciones({ abrirConfirmacionCancelar, guardando, errores, registradoPor }) {
  const tieneErroresCriticos = Object.values(errores).some(m => m?.includes("🚫"));

  return (
    <div className="pt-4 space-y-6 animate-in slide-in-from-bottom duration-500">
        
        {/* GRID DE BOTONES */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
            
            {/* BOTÓN CANCELAR (Estilo "Botón de Seguridad") */}
            <button 
               type="button" 
               onClick={abrirConfirmacionCancelar}
               disabled={guardando} 
               className="
                 group w-full py-4 sm:py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-200
                 bg-white text-gray-400 border-2 border-gray-200 border-b-4
                 hover:bg-red-50 hover:text-red-500 hover:border-red-200 hover:border-b-red-300
                 active:scale-95 active:border-b-2
                 disabled:opacity-50 disabled:cursor-not-allowed
                 flex items-center justify-center gap-2
               "
            >
               <span className="text-xl group-hover:scale-125 transition-transform">🚫</span>
               <span>Cancelar</span>
            </button>

            {/* BOTÓN CONFIRMAR (Estilo "Hero" 3D) */}
            <button 
               type="submit"
               disabled={tieneErroresCriticos || guardando}
               className={`
                 group w-full py-4 sm:py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-200
                 flex items-center justify-center gap-3
                 shadow-xl active:scale-95 active:border-b-0
                 border-b-4
                 ${guardando 
                    ? 'bg-gray-400 border-gray-500 text-gray-100 cursor-wait' 
                    : tieneErroresCriticos
                        ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 border-blue-800 text-white shadow-blue-200 hover:bg-blue-500 hover:shadow-blue-300'
                 }
               `}
            >
               {guardando ? (
                   <>
                      <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                   </>
               ) : (
                   <>
                      <span>CONFIRMAR</span>
                      <span className={`text-xl ${!tieneErroresCriticos && 'group-hover:translate-x-1 transition-transform'}`}>🚀</span>
                   </>
               )}
            </button>
        </div>

        {/* FIRMA DIGITAL (Estilo "System Log") */}
        <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 bg-gray-50 px-5 py-2 rounded-full border border-gray-100 shadow-sm">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                   Operador Activo: <span className="text-blue-700 ml-1">{registradoPor?.nombre_completo || 'Sistema'}</span>
                </p>
            </div>
        </div>
    </div>
  );
}