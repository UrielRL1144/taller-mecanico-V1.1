import React from 'react';

export default function SeccionInfo({ formData, handleChange, errores, irAInventario }) {
  // ESTILO COMÚN PARA TODOS LOS INPUTS
  const inputStyle = `
    w-full p-4 sm:p-5 rounded-2xl outline-none transition-all duration-200
    border-2 border-gray-300 bg-gray-100
    text-base sm:text-lg font-bold text-gray-900 tracking-tight
    placeholder:text-gray-400 placeholder:font-semibold
    focus:bg-white focus:border-blue-600 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)]
    shadow-sm
  `;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-left duration-500">
      
      {/* Título de la Sección */}
      <div className="flex items-center gap-3 mb-2 border-l-4 border-blue-600 pl-3">
        <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest">Información Básica</h3>
      </div>

      {/* NOMBRE TÉCNICO */}
      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-black text-gray-600 uppercase ml-1 tracking-widest">
          Nombre Técnico <span className="text-red-600">*</span>
        </label>
        <input 
          required 
          name="nombre_tecnico" 
          value={formData.nombre_tecnico} 
          onChange={handleChange}
          className={`
            ${inputStyle}
            ${errores.nombre_tecnico ? 'bg-red-50! border-red-500! focus:border-red-600!' : ''}
          `}
          placeholder="EJ. KIT DE ARRASTRE PULSAR 200"
        />
        {errores.nombre_tecnico && (
          <div className="flex items-center gap-2 mt-1 ml-2 animate-pulse">
            <span className="text-lg">🚫</span>
            <span className="text-xs font-black text-red-600 uppercase">{errores.nombre_tecnico}</span>
          </div>
        )}
      </div>

      {/* GRID: ALIAS Y UBICACIÓN (Para aprovechar espacio horizontal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* ALIAS */}
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-black text-gray-600 uppercase ml-1">
              Alias / Nombre Corto
            </label>
            <input 
              name="alias_comun" 
              value={formData.alias_comun} 
              onChange={handleChange}
              className={inputStyle}
              placeholder="EJ. KIT PULSAR"
            />
          </div>

          {/* --- NUEVO CAMPO: UBICACIÓN --- */}
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-black text-gray-600 uppercase ml-1 flex items-center gap-1">
              <span>📍</span> Ubicación
            </label>
            <input 
              name="ubicacion" 
              value={formData.ubicacion} 
              onChange={handleChange}
              className={`${inputStyle} border-l-4 border-l-yellow-400`} // Toque visual amarillo para ubicación
              placeholder="EJ. ESTANTE 3, NIVEL 2"
            />
          </div>

      </div>

      {/* DESCRIPCIÓN */}
      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-black text-gray-600 uppercase ml-1">
          Descripción Detallada
        </label>
        <textarea 
          name="descripcion" 
          value={formData.descripcion} 
          onChange={handleChange}
          className={`
            ${inputStyle}
            min-h-30 resize-y
          `}
          placeholder="Escribe aquí detalles técnicos, compatibilidad o notas importantes..."
        />
      </div>

      {/* CÓDIGO DE BARRAS (CAMPO CRÍTICO) */}
      <div className="flex flex-col gap-2">
        <label className="text-xs sm:text-sm font-black text-blue-900 uppercase ml-1 tracking-widest flex items-center gap-2">
            <span>🔍</span> Código de Barras <span className="text-red-600">*</span>
        </label>
        <div className="relative group">
          <input 
            required 
            name="codigo_barras" 
            value={formData.codigo_barras} 
            onChange={handleChange}
            className={`
              w-full p-4 sm:p-5 rounded-2xl outline-none border-2 font-mono transition-all duration-200
              text-lg sm:text-xl font-black tracking-wider text-gray-900
              shadow-sm
              ${errores.codigo_barras 
                ? 'bg-red-50 border-red-500 focus:border-red-600' 
                : 'bg-blue-50/50 border-blue-200 focus:border-blue-600 focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' 
              }
            `}
            placeholder="ESCANEA O ESCRIBE"
          />
          
          {/* Botón de acción dentro del input */}
          {errores.codigo_barras?.includes("🚫") && (
            <button 
              type="button" 
              onClick={() => irAInventario(formData.codigo_barras)}
              className="
                absolute right-2 top-1/2 -translate-y-1/2 
                bg-red-600 text-white 
                px-4 py-2 sm:py-3 rounded-xl 
                font-black text-xs sm:text-sm uppercase tracking-wide
                shadow-lg hover:bg-red-700 active:scale-95 transition-all
                border-b-4 border-red-800
              "
            >
              Ver en Almacén
            </button>
          )}

          {/* Icono de scanner decorativo */}
          {!errores.codigo_barras && !formData.codigo_barras && (
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl opacity-30 pointer-events-none text-gray-500">
                ║▌║█║
             </span>
          )}
        </div>
        {errores.codigo_barras && (
          <div className="flex items-center gap-2 mt-1 ml-2 animate-pulse">
             <span className="text-lg">⚠️</span>
             <span className="text-xs font-black text-red-600 uppercase italic">{errores.codigo_barras}</span>
          </div>
        )}
      </div>
    </div>
  );
}