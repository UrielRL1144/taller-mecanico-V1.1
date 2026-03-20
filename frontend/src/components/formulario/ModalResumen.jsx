import React from 'react';

export default function ModalResumen({ isOpen, onClose, onConfirm, formData, proveedores, guardando }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
       {/* CONTENEDOR PRINCIPAL: Estilo Oscuro y Bordes Metálicos */}
       <div className="bg-gray-900 w-full max-w-2xl rounded-4xl shadow-2xl border-2 border-gray-700 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
          
          {/* CABECERA */}
          <div className="bg-gray-800 p-6 border-b border-gray-700 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <span className="bg-blue-600/20 text-blue-400 p-3 rounded-xl text-2xl border border-blue-500/30">📋</span>
                <div>
                   <h3 className="font-black text-xl text-white uppercase tracking-wide">Confirmar Alta</h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verifica los datos antes de guardar</p>
                </div>
             </div>
             <button 
                onClick={onClose} 
                className="bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 w-10 h-10 rounded-full transition-all flex items-center justify-center font-black"
             >
                ✕
             </button>
          </div>

          {/* CUERPO DEL RESUMEN (SCROLLABLE) */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700">
             
             {/* 1. IDENTIDAD DEL PRODUCTO */}
             <div className="flex gap-5 items-start">
                {/* FOTO MINIATURA (Con fondo blanco para ver bien la pieza) */}
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-2 border-gray-600 p-2 flex items-center justify-center shrink-0">
                   {formData.imagen_url ? (
                      <img src={formData.imagen_url} className="w-full h-full object-contain rounded-xl" alt="Preview" />
                   ) : (
                      <span className="text-3xl grayscale opacity-30">📷</span>
                   )}
                </div>
                
                {/* DATOS DE TEXTO */}
                <div className="flex-1">
                   <h4 className="font-black text-white text-lg sm:text-xl leading-tight uppercase mb-2">{formData.nombre_tecnico}</h4>
                   
                   <div className="flex flex-wrap gap-2 mb-2">
                       <span className="bg-blue-900/50 text-blue-300 border border-blue-500/30 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                          {formData.categoria}
                       </span>
                       {formData.alias_comun && (
                           <span className="bg-purple-900/50 text-purple-300 border border-purple-500/30 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                              Alias: {formData.alias_comun}
                           </span>
                       )}
                   </div>
                   
                   <p className="text-xs text-gray-500 font-mono bg-gray-800 inline-block px-2 py-1 rounded border border-gray-700">
                      CODE: <span className="text-gray-300 font-bold tracking-widest">{formData.codigo_barras}</span>
                   </p>
                </div>
             </div>

             {/* 2. DATOS FINANCIEROS (TARJETAS OSCURAS) */}
             <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="bg-gray-800 p-3 rounded-2xl border border-gray-700">
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Costo</p>
                   <p className="text-lg font-black text-gray-300">${formData.precio_compra}</p>
                </div>
                
                {/* PRECIO VENTA DESTACADO */}
                <div className="bg-gray-800 p-3 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                   <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Venta</p>
                   <p className="text-xl font-black text-blue-400">${formData.precio_venta}</p>
                </div>
                
                {/* GANANCIA DESTACADA */}
                <div className="bg-green-900/20 p-3 rounded-2xl border border-green-500/30">
                   <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">Ganancia</p>
                   <p className="text-lg font-black text-green-400">
                      +${(parseFloat(formData.precio_venta || 0) - parseFloat(formData.precio_compra || 0)).toFixed(2)}
                   </p>
                </div>
             </div>

             {/* 3. INVENTARIO Y PROVEEDOR */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex justify-between items-center">
                   <div>
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Stock Inicial</p>
                       <p className="text-2xl font-black text-white">{formData.stock_actual}</p>
                   </div>
                   <span className="text-2xl opacity-20">📦</span>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Proveedor</p>
                   <div className="flex items-center gap-2">
                      <span className="text-lg">🚛</span>
                      <span className="font-bold text-xs uppercase truncate text-purple-300">
                         {proveedores.find(p => p.id.toString() === formData.proveedor_id.toString())?.nombre || "Sin Asignar"}
                      </span>
                   </div>
                </div>
             </div>
             
             {/* 4. CHECKLIST FINAL */}
             <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase pt-2 border-t border-gray-800">
                <span className={`px-3 py-1 rounded-full border ${formData.factura_url ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
                    {formData.factura_url ? '✅ Factura Adjunta' : '❌ Sin Factura'}
                </span>
                <span className={`px-3 py-1 rounded-full border ${formData.descripcion ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-yellow-900/30 text-yellow-400 border-yellow-800'}`}>
                    {formData.descripcion ? '✅ Con Descripción' : '⚠️ Sin Descripción'}
                </span>
             </div>
          </div>

          {/* FOOTER ACCIONES */}
          <div className="p-6 bg-gray-800 border-t border-gray-700 flex gap-4">
             <button 
                onClick={onClose} 
                className="flex-1 py-4 bg-gray-900 text-gray-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-gray-700 hover:border-gray-500 transition-all active:scale-95"
             >
                Corregir
             </button>
             
             <button 
                onClick={onConfirm} 
                disabled={guardando} 
                className="flex-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/50 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
             >
                {guardando ? (
                    <span className="animate-pulse">Guardando...</span>
                ) : (
                    <>
                        <span>Confirmar Alta</span>
                        <span className="text-lg">🚀</span>
                    </>
                )}
             </button>
          </div>
       </div>
    </div>
  );
}