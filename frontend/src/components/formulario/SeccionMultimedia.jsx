import React from 'react';

export default function SeccionMultimedia({ 
  formData, 
  abrirWidgetProducto, 
  eliminarFotoProducto, 
  getThumbnailUrl, 
  getPreviewUrl, // Asegúrate de recibir esto desde el padre
  abrirWidgetFactura, 
  eliminarFactura 
}) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      
      {/* --- SECCIÓN 1: GALERÍA DE PRODUCTOS (MÁX 3) --- */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center ml-1">
            <label className="text-xs sm:text-sm font-black text-gray-500 uppercase flex items-center gap-2">
                <span>📷</span> Galería del Producto
            </label>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${formData.imagenes.length === 3 ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                {formData.imagenes.length} / 3 Fotos
            </span>
        </div>

        {/* CONTENEDOR GRID: Muestra las fotos y el botón de agregar */}
        <div className="grid grid-cols-3 gap-3 h-32 sm:h-40 w-full">
            
            {/* A. RENDERIZAR FOTOS EXISTENTES */}
            {formData.imagenes.map((img, index) => (
                <div key={index} className="relative group rounded-2xl overflow-hidden border-2 border-green-500 bg-white shadow-md h-full w-full">
                    {/* Imagen (Cover para que se vea bonita en el cuadro) */}
                    <img 
                        src={getThumbnailUrl(img.url)} 
                        className="h-full w-full object-cover" 
                        alt={`Producto ${index + 1}`} 
                    />
                    
                    {/* Etiqueta PRINCIPAL (Solo la primera) */}
                    {index === 0 && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm z-10">
                            PRINCIPAL
                        </div>
                    )}

                    {/* OVERLAY DE ACCIONES (Aparece al pasar el mouse o tocar) */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button 
                            type="button"
                            onClick={() => window.open(img.url, '_blank')}
                            className="text-white text-[10px] font-bold hover:scale-110 transition-transform bg-white/20 px-2 py-1 rounded-lg"
                        >
                            👁️ VER
                        </button>
                        <button 
                            type="button"
                            onClick={() => eliminarFotoProducto(index)} // <--- IMPORTANTE: Pasamos el índice
                            className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                            title="Eliminar esta foto"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}

            {/* B. BOTÓN "AGREGAR" (Solo si hay menos de 3) */}
            {formData.imagenes.length < 3 && (
                <button 
                    type="button"
                    onClick={abrirWidgetProducto}
                    className="h-full w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all flex flex-col items-center justify-center group cursor-pointer"
                >
                    <span className="text-2xl opacity-40 group-hover:scale-110 group-hover:opacity-100 transition-all">📷</span>
                    <span className="text-[8px] font-black text-gray-400 group-hover:text-blue-500 uppercase text-center leading-tight mt-1">
                        {formData.imagenes.length === 0 ? 'Subir Principal' : 'Agregar Extra'}
                    </span>
                    <span className="text-[10px] text-blue-500 font-black opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                </button>
            )}

            {/* C. RELLENO (Estético: Si está vacío, mostramos cuadros grises para que no se vea roto) */}
            {formData.imagenes.length === 0 && (
               <>
                 <div className="rounded-2xl border border-dashed border-gray-100 bg-gray-50/30 flex items-center justify-center opacity-30">
                    <span className="text-xl grayscale">🖼️</span>
                 </div>
                 <div className="rounded-2xl border border-dashed border-gray-100 bg-gray-50/30 flex items-center justify-center opacity-30 sm:flex">
                    <span className="text-xl grayscale">🖼️</span>
                 </div>
               </>
            )}
        </div>
      </div>

      {/* --- SECCIÓN 2: FACTURA (Esta se queda igual, visualización documento) --- */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
        <label className="text-xs sm:text-sm font-black text-gray-500 uppercase ml-1 flex items-center gap-2">
            <span>📄</span> Comprobante / Factura
        </label>
        
        <div 
            className={`
                h-24 sm:h-32 w-full rounded-3xl border-4 border-dashed relative overflow-hidden group transition-all duration-300
                ${formData.factura_url 
                    ? 'border-blue-500 bg-white shadow-md' 
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30'
                }
            `}
        >
          {formData.factura_url ? (
            <>
              {/* Usamos object-contain para leer el documento */}
              <img
                loading="lazy"
                src={getThumbnailUrl(formData.factura_url)} 
                className="h-full w-full object-contain p-2 opacity-90" 
                alt="Factura Preview" 
              />
              
              <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm flex items-center justify-center gap-4 transition-opacity opacity-0 group-hover:opacity-100">
                  <button 
                      type="button" 
                      onClick={() => window.open(formData.factura_url, '_blank')} 
                      className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                      👁️
                  </button>
                  <button 
                      type="button" 
                      onClick={abrirWidgetFactura} 
                      className="w-10 h-10 bg-white text-yellow-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                      🔄
                  </button>
                  <button 
                      type="button" 
                      onClick={eliminarFactura} 
                      className="w-10 h-10 bg-white text-red-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                      🗑️
                  </button>
              </div>
              
              <div className="absolute top-2 right-2 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-md z-10 uppercase tracking-wide">
                  LISTO
              </div>
            </>
          ) : (
            <button 
               type="button" 
               onClick={abrirWidgetFactura} 
               className="w-full h-full flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
               <span className="text-2xl">🧾</span>
               <span className="text-[10px] font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest">Subir PDF/Foto</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}