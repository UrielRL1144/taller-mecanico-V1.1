import React from 'react';

export default function SeccionInventario({ 
  formData, 
  handleChange, 
  errores, 
  esPaquete, 
  proveedores, 
  irANuevoProveedor 
}) {
  
  const inputStyle = `
    w-full p-4 sm:p-5 rounded-2xl outline-none transition-all duration-200
    border-2 border-gray-300 bg-gray-100
    text-base sm:text-lg font-bold text-gray-900 uppercase tracking-tight
    placeholder:text-gray-400 placeholder:font-semibold
    focus:bg-white focus:border-blue-600 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)]
    shadow-sm appearance-none
  `;

  // --- LÓGICA DE PROTECCIÓN DE DATOS ---
  // Determina si la unidad actual permite partirse en pedazos
  const permiteDecimales = ['Metro', 'Litro', 'Kilo'].includes(formData.unidad_medida);

  // Función que bloquea físicamente la tecla "." si no se permiten decimales
  const bloquearDecimales = (e) => {
    if (!permiteDecimales && (e.key === '.' || e.key === ',')) {
        e.preventDefault(); // Detiene la escritura
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right duration-500">
        
        {/* Título de la Sección */}
        <div className="flex items-center gap-3 mb-2 border-l-4 border-blue-600 pl-3">
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest">Control de Almacén</h3>
        </div>

        {/* --- 1. SELECTOR DE UNIDAD DE MEDIDA --- */}
        <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center ml-1">
                <label className="text-xs sm:text-sm font-black text-gray-600 uppercase flex items-center gap-2">
                    <span>📏</span> Unidad de Venta
                </label>
                {/* Mensaje dinámico de regla */}
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                    {permiteDecimales ? '✅ Acepta Fracciones' : '🔒 Solo Enteros'}
                </span>
             </div>
             
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Pieza', 'Kit', 'Metro', 'Litro'].map((unidad) => (
                    <button
                        key={unidad}
                        type="button"
                        onClick={() => {
                            // Al cambiar, si pasamos de Metro(1.5) a Pieza, redondeamos hacia abajo para no romper la BD
                            if (formData.stock_actual && formData.stock_actual % 1 !== 0 && (unidad === 'Pieza' || unidad === 'Kit')) {
                                handleChange({ target: { name: 'stock_actual', value: Math.floor(formData.stock_actual) } });
                            }
                            handleChange({ target: { name: 'unidad_medida', value: unidad } });
                        }}
                        className={`
                            py-3 px-2 rounded-xl text-xs sm:text-sm font-black uppercase transition-all border-2
                            ${formData.unidad_medida === unidad 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                                : 'bg-white text-gray-400 border-gray-200 hover:border-blue-300 hover:text-blue-500'
                            }
                        `}
                    >
                        {unidad}
                    </button>
                ))}
             </div>
        </div>

        {/* --- 2. GRID DE STOCKS (ACTUAL Y MÍNIMO) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* STOCK INICIAL */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end ml-1">
                  <label className="text-xs sm:text-sm font-black text-gray-600 uppercase tracking-widest">
                    Stock Inicial <span className="text-red-600">*</span>
                  </label>
                  {esPaquete && (
                    <span className="text-[10px] font-black text-white bg-purple-600 px-3 py-1 rounded-full shadow-md animate-pulse">
                      🔒 AUTO
                    </span>
                  )}
              </div>
              
              <div className="relative group">
                  <input 
                    required 
                    type="number" 
                    // Si permite decimales, step es 0.01, si no, es 1 (entero forzado)
                    step={permiteDecimales ? "0.01" : "1"} 
                    onKeyDown={bloquearDecimales} // <--- EL GUARDIÁN
                    name="stock_actual" 
                    value={formData.stock_actual} 
                    onChange={handleChange} 
                    readOnly={esPaquete}
                    className={`
                        ${inputStyle}
                        ${esPaquete 
                            ? 'bg-purple-50! border-purple-200! text-purple-800! cursor-not-allowed opacity-100' 
                            : errores.stock_actual ? 'bg-red-50! border-red-500! focus:border-red-600!' : ''
                        }
                    `}
                    placeholder={esPaquete ? "CALCULADO..." : (permiteDecimales ? "0.00" : "0")}
                  />
                  
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 uppercase pointer-events-none group-focus-within:text-blue-500 transition-colors">
                    {formData.unidad_medida}S
                  </span>
              </div>

              {errores.stock_actual && (
                  <span className="text-xs font-black text-red-600 ml-2 italic">{errores.stock_actual}</span>
              )}
            </div>

            {/* STOCK MÍNIMO (Con explicación visual) */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center ml-1">
                  <label className="text-xs sm:text-sm font-black text-gray-600 uppercase tracking-widest flex items-center gap-1 cursor-help group/tooltip relative">
                    Mínimo Requerido
                    <span className="text-gray-400 text-xs">ℹ️</span>
                    
                    {/* Tooltip Explicativo (Solo aparece al pasar el mouse sobre el título) */}
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                        Cantidad mínima antes de que el sistema te avise que debes comprar más.
                    </div>
                  </label>
              </div>

              <div className="relative group">
                  <input 
                    type="number" 
                    step={permiteDecimales ? "0.01" : "1"}
                    onKeyDown={bloquearDecimales} // <--- EL GUARDIÁN
                    name="stock_minimo" 
                    value={formData.stock_minimo} 
                    onChange={handleChange} 
                    className={`${inputStyle} border-yellow-200 focus:border-yellow-500 focus:shadow-[0_0_0_4px_rgba(234,179,8,0.1)]`} // Borde amarillo para indicar alerta
                    placeholder={permiteDecimales ? "Ej. 5.50" : "Ej. 2"}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 uppercase pointer-events-none group-focus-within:text-yellow-600 transition-colors">
                    ALERTA
                  </span>
              </div>
              <p className="text-[9px] font-bold text-gray-400 ml-2">
                 * Punto de reorden (Alerta baja existencia)
              </p>
            </div>
        </div>

        {/* --- 3. GRID DE CLASIFICACIÓN (CATEGORÍA Y PROVEEDOR) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* CATEGORÍA */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-black text-gray-600 uppercase ml-1 tracking-widest">Categoría</label>
              <div className="relative">
                  <select 
                    name="categoria" 
                    value={formData.categoria} 
                    onChange={handleChange} 
                    className={`${inputStyle} cursor-pointer`}
                  >
                    <option value="Refacción">Refacción</option>
                    <option value="Aceite">Aceite</option>
                    <option value="Accesorio">Accesorio</option>
                    <option value="Mano de Obra">Mano de Obra</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-bold">▼</div>
              </div>
            </div>

            {/* PROVEEDOR */}
            <div className="flex flex-col gap-2">
               <div className="flex justify-between items-end ml-1">
                 <label className="text-xs sm:text-sm font-black text-gray-600 uppercase tracking-widest">
                    Proveedor <span className="text-red-600">*</span>
                 </label>
                 <button 
                   type="button" 
                   onClick={irANuevoProveedor} 
                   className="text-[10px] sm:text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors uppercase tracking-wide"
                 >
                   + Nuevo
                 </button>
               </div>
               
               <div className="relative">
                   <select 
                     required 
                     name="proveedor_id" 
                     value={formData.proveedor_id} 
                     onChange={handleChange}
                     className={`
                        ${inputStyle} 
                        cursor-pointer 
                        ${!formData.proveedor_id ? 'text-gray-400' : 'text-blue-900'}
                     `}
                   >
                     <option value="" className="text-gray-400">-- SELECCIONAR --</option>
                     <option value="0" className="font-bold text-gray-900">🏢 SIN PROVEEDOR (GASTO ÚNICO)</option>
                     {proveedores.map(p => (
                        <option key={p.id} value={p.id} className="text-gray-900 font-bold">
                            🚛 {p.nombre.toUpperCase()}
                        </option>
                     ))}
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600 font-bold">▼</div>
               </div>
            </div>
        </div>

        {/* NOTAS */}
        <div className="flex flex-col gap-2">
           <label className="text-xs sm:text-sm font-black text-gray-600 uppercase ml-1 tracking-widest">Notas Adicionales</label>
           <textarea 
             name="notas" 
             value={formData.notas} 
             onChange={handleChange}
             className={`${inputStyle} min-h-25 resize-y text-gray-700 font-medium normal-case`}
             placeholder="Ej: Se compró de emergencia, falta factura física..."
           />
        </div>
    </div>
  );
}