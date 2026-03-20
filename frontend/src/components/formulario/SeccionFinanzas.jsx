import React from 'react';

export default function SeccionFinanzas({ 
  formData, 
  handleCambioCosto, 
  handleCambioMargen, 
  handleCambioPrecioVenta, 
  errores, 
  margenDeseado, 
  esPaquete, 
  setEsPaquete, 
  datosPaquete, 
  calcularUnitarioDesdePaquete 
}) {
  return (
    // CONTENEDOR PRINCIPAL: Azul suave para diferenciar del resto del formulario
    <div className="bg-blue-50 p-6 sm:p-8 rounded-[2.5rem] border-2 border-blue-100 relative overflow-hidden shadow-sm animate-in slide-in-from-right duration-500">
        
        {/* Título de la Sección */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
               <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-lg shadow-md">💰</span>
               <p className="text-sm font-black text-blue-900 uppercase tracking-widest">Calculadora de Rentabilidad</p>
            </div>
        </div>

        {/* --- INTERRUPTOR DE MODO PAQUETE --- */}
        <div className={`mb-8 p-5 rounded-3xl border-2 transition-colors duration-300 ${esPaquete ? 'bg-purple-50 border-purple-200 shadow-inner' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                   <span className="text-2xl">📦</span>
                   <div>
                       <p className={`text-xs sm:text-sm font-black uppercase ${esPaquete ? 'text-purple-700' : 'text-gray-500'}`}>¿Compras por Caja/Paquete?</p>
                       <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Activa esto para calcular el costo unitario automáticamente.</p>
                   </div>
                </div>
                
                {/* SWITCH GRANDE Y TÁCTIL */}
                <div 
                   onClick={() => setEsPaquete(!esPaquete)}
                   className={`w-16 h-9 rounded-full flex items-center p-1 cursor-pointer transition-colors shadow-sm ${esPaquete ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                   <div className={`bg-white w-7 h-7 rounded-full shadow-md transform transition-transform duration-300 ${esPaquete ? 'translate-x-7' : 'translate-x-0'}`}></div>
                </div>
            </div>

            {esPaquete && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top duration-300 pt-4 border-t border-purple-200/50">
                    <div>
                        <label className="text-xs font-black text-purple-800 uppercase ml-1 mb-1 block">Costo Total ($)</label>
                        <input 
                           type="number" name="costo_total" value={datosPaquete.costo_total} onChange={calcularUnitarioDesdePaquete}
                           className="w-full p-4 rounded-2xl border-2 border-purple-200 outline-none font-black text-lg text-purple-900 placeholder:text-purple-200 bg-white focus:border-purple-500 focus:shadow-lg transition-all"
                           placeholder="EJ. 500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-purple-800 uppercase ml-1 mb-1 block">Piezas (Total)</label>
                        <input 
                           type="number" name="piezas" value={datosPaquete.piezas} onChange={calcularUnitarioDesdePaquete}
                           className="w-full p-4 rounded-2xl border-2 border-purple-200 outline-none font-black text-lg text-purple-900 placeholder:text-purple-200 bg-white focus:border-purple-500 focus:shadow-lg transition-all"
                           placeholder="EJ. 100"
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2 text-center bg-purple-100/50 p-2 rounded-xl mt-2">
                        <p className="text-xs text-purple-600 uppercase font-bold">
                            Costo por pieza: <span className="text-xl text-purple-800 font-black ml-1">${formData.precio_compra || '0.00'}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            {/* COSTO COMPRA */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-500 uppercase ml-1">Costo Unitario ($)</label>
                <input 
                  required type="number" name="precio_compra" 
                  value={formData.precio_compra} onChange={handleCambioCosto} readOnly={esPaquete}
                  className={`
                    w-full p-4 sm:p-5 rounded-2xl outline-none font-black text-xl sm:text-2xl text-gray-800 border-2 shadow-sm transition-all
                    placeholder:text-gray-300
                    ${errores.precio_compra 
                        ? 'bg-red-50 border-red-500 focus:border-red-600' 
                        : esPaquete 
                            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' // Estilo deshabilitado
                            : 'bg-white border-blue-200 focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]'
                    }
                  `}
                  placeholder="0.00"
                />
            </div>

            {/* MARGEN DESEADO */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-500 uppercase ml-1">Margen (%)</label>
                <div className="relative">
                   <input 
                     type="number" value={margenDeseado} onChange={handleCambioMargen}
                     className="w-full p-4 sm:p-5 rounded-2xl outline-none font-black text-xl sm:text-2xl text-blue-600 bg-white border-2 border-blue-200 focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] shadow-sm transition-all placeholder:text-blue-200"
                     placeholder="30"
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 font-black text-lg pointer-events-none">%</span>
                </div>
            </div>
        </div>

        {/* Flecha visual indicando flujo */}
        <div className="flex justify-center -my-3 relative z-10">
            <div className="bg-blue-100 text-blue-400 rounded-full p-1 border-4 border-white">⬇</div>
        </div>

        {/* PRECIO VENTA (EL HÉROE) */}
        <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs font-black text-green-700 uppercase ml-1 tracking-widest">Precio Venta ($)</label>
            <input 
              required type="number" name="precio_venta" 
              value={formData.precio_venta} onChange={handleCambioPrecioVenta}
              className={`
                w-full p-5 sm:p-6 rounded-3xl outline-none font-black text-3xl sm:text-4xl tracking-tight border-4 shadow-md transition-all
                placeholder:text-green-200/50
                ${errores.precio_venta 
                    ? 'bg-red-50 text-red-600 border-red-300 focus:border-red-500' 
                    : 'bg-green-50 text-green-600 border-green-200 focus:border-green-500 focus:bg-white focus:shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                }
              `}
              placeholder="0.00"
            />
        </div>

        {/* GANANCIA VISUAL */}
        {(formData.precio_compra > 0 && formData.precio_venta > 0) && (
            <div className="mt-4 bg-gray-900 p-4 rounded-2xl border-2 border-green-500/50 flex items-center justify-between shadow-lg animate-in slide-in-from-bottom">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tu Ganancia Neta</span>
                    <span className="text-[9px] text-gray-500 font-bold">Por unidad vendida</span>
                 </div>
                 <div className="text-right">
                     <span className="block text-xl sm:text-2xl font-black text-green-400 drop-shadow-md">
                        +${(parseFloat(formData.precio_venta) - parseFloat(formData.precio_compra)).toFixed(2)}
                     </span>
                 </div>
            </div>
        )}
    </div>
  );
}