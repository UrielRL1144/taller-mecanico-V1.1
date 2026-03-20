import React from 'react';
import { toast } from 'sonner';

export default function CarritoPanel({ 
  carrito, 
  total, 
  onCerrar, 
  onVaciar, 
  onAgregar, 
  onReducir, 
  onCobrar,
  // IMPORTANTE: Necesitamos esta nueva función para actualizar el estado del carrito desde aquí
  // Si no la pasas desde el padre, la definiremos internamente como un hack visual, 
  // pero lo ideal es pasar 'setCarrito' o una función 'onActualizarCantidad' desde VentaMostrador.
  onActualizarCantidad 
}) {
  
  if (!carrito || carrito.length === 0) return null;

  // --- Lógica de Edición Manual ---
  const handleCambioManual = (item, valorInput) => {
      let nuevaCantidad = parseFloat(valorInput);
      
      // Validaciones básicas
      if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) return;

      // Validación de Enteros para Piezas
      const permiteDecimales = ['Metro', 'Litro', 'Kilo'].includes(item.unidad_medida);
      if (!permiteDecimales && !Number.isInteger(nuevaCantidad)) {
          toast.warning("Solo se venden piezas enteras");
          nuevaCantidad = Math.floor(nuevaCantidad);
      }

      // Validación de Stock
      if (nuevaCantidad > item.stock_actual) {
          toast.warning(`Stock insuficiente (Máx: ${item.stock_actual})`);
          nuevaCantidad = item.stock_actual;
      }

      // Llamamos a la función del padre para actualizar
      if (onActualizarCantidad) {
          onActualizarCantidad(item.id, nuevaCantidad);
      }
  };

  return (
    <div className="fixed bottom-18 sm:bottom-20 left-0 right-0 max-w-3xl mx-auto z-50 px-2 sm:px-0 animate-in slide-in-from-bottom duration-500">
      <div className="bg-black backdrop-blur-xl border-t-4 border-yellow-500 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.6)] p-4 sm:p-6 text-white relative">
          
          {/* BOTÓN MINIMIZAR */}
          <button 
            onClick={onCerrar}
            className="absolute -top-5 right-4 bg-gray-800 text-white w-10 h-10 rounded-full border-2 border-yellow-500 shadow-lg flex items-center justify-center font-bold hover:bg-gray-700 active:scale-90 transition-all z-50"
          >
            ▼
          </button>

          {/* CABECERA */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Orden de Venta</p>
            </div>
            <button onClick={onVaciar} className="text-xs sm:text-sm font-bold text-red-400 bg-red-900/30 border border-red-500/50 px-4 py-2 rounded-lg hover:bg-red-900/50 uppercase tracking-wide">
              🗑 Vaciar Todo
            </button>
          </div>
          
          {/* LISTA DE PRODUCTOS */}
          <div className="max-h-[30vh] overflow-y-auto mb-4 space-y-3 pr-1 scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-gray-800">
            {carrito.map(item => (
              <div key={item.id} className="bg-gray-800 border border-gray-600 p-3 sm:p-4 rounded-2xl flex justify-between items-center shadow-lg relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500 group-hover:bg-yellow-500 transition-colors"></div>
                  
                  <div className="flex-1 pl-3 min-w-0">
                     <span className="block text-sm sm:text-lg font-black text-white leading-tight uppercase mb-1 truncate">{item.nombre_tecnico}</span>
                     <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-400">${item.precio_venta}</span>
                        <span className="text-[10px] font-black bg-gray-700 px-2 py-0.5 rounded text-gray-300 uppercase">
                            {item.unidad_medida || 'PZA'}
                        </span>
                     </div>
                  </div>

                  {/* CONTROLES DE CANTIDAD (INPUT EDITABLE) */}
                  <div className="flex items-center gap-1 sm:gap-2 bg-gray-900 rounded-xl p-1 border border-gray-700 mx-2">
                     <button onClick={() => onReducir(item.id)} className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-white font-black flex items-center justify-center active:scale-90 transition-all border border-gray-600">-</button>
                     
                     {/* INPUT CENTRAL */}
                     <input 
                        type="number"
                        step={['Metro', 'Litro', 'Kilo'].includes(item.unidad_medida) ? "0.01" : "1"}
                        value={item.cantidad}
                        onChange={(e) => handleCambioManual(item, e.target.value)}
                        onFocus={(e) => e.target.select()} // Seleccionar todo al tocar
                        className="w-12 sm:w-16 bg-transparent text-center font-black text-xl text-yellow-400 outline-none border-b-2 border-transparent focus:border-yellow-500 transition-colors"
                     />

                     <button onClick={() => onAgregar(item)} disabled={item.cantidad >= item.stock_actual} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-black flex items-center justify-center active:scale-90 transition-all border border-gray-600 ${item.cantidad >= item.stock_actual ? 'bg-gray-800 text-gray-600' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>+</button>
                  </div>

                  <div className="text-right pl-2 w-20 sm:w-28 shrink-0">
                     <span className="block text-lg sm:text-2xl font-black text-yellow-400">${(item.precio_venta * item.cantidad).toFixed(2)}</span>
                  </div>
              </div>
            ))}
          </div>
          
          {/* FOOTER */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-700 pt-4">
            <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total a Pagar</p>
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                    ${total.toFixed(2)}
                </span>
            </div>
            <button onClick={onCobrar} className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white text-xl px-10 py-4 rounded-2xl font-black shadow-lg shadow-green-900/50 active:scale-95 transition-all border-b-4 border-green-800 uppercase tracking-widest">
                ✅ Cobrar
            </button>
          </div>
      </div>
    </div>
  );
}