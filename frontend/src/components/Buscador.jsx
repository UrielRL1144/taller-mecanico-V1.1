export default function Buscador({ placeholder, alBuscar, valor }) {
  return (
    <div className="relative mb-8 mt-4 z-20 px-4 sm:px-6 lg:px-0">
      <div className="max-w-3xl xl:max-w-4xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={valor}
            onChange={(e) => alBuscar(e.target.value)}
            placeholder={placeholder || "Buscar refacción, producto o marca..."}
            className="w-full p-4 sm:p-5 md:p-6 pl-14 sm:pl-16 md:pl-20 rounded-2xl md:rounded-3xl shadow-xl border-2 border-gray-300 hover:border-blue-400 outline-none focus:ring-4 focus:ring-orange-500/40 focus:border-orange-600 text-lg sm:text-xl md:text-2xl lg:text-3xl bg-linear-to-br from-white to-gray-50 placeholder-gray-400 transition-all duration-300 hover:shadow-2xl focus:shadow-2xl"
            aria-label={placeholder || "Buscar en refaccionaria"}
            // Accesibilidad y móviles
            inputMode="search"
            autoCapitalize="none"
            autoComplete="off"
            // Para texto grande y fácil lectura
            style={{ 
              minHeight: '56px', // Más grande para mejor toque
              fontSize: 'clamp(1.125rem, 4vw, 2rem)', // Escala dinámica
              lineHeight: '1.4'
            }}
          />
          
          {/* Icono de lupa con tema mecánico */}
          <span 
            className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl md:text-4xl text-blue-600"
            aria-hidden="true"
          >
            <div className="relative">
              <div className="absolute -inset-3 bg-blue-100 rounded-full opacity-20"></div>
              <span className="relative">🔍</span>
            </div>
          </span>
          
          {/* Botón para limpiar búsqueda - Grande y accesible */}
          {valor && (
            <button
              type="button"
              onClick={() => alBuscar('')}
              className="absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all duration-300 group"
              aria-label="Limpiar búsqueda"
              style={{ 
                minWidth: '48px', 
                minHeight: '48px',
                fontSize: 'clamp(1.25rem, 5vw, 1.75rem)'
              }}
            >
              <div className="relative">
                <span className="group-hover:scale-110 transition-transform duration-200">✕</span>
                <div className="absolute -inset-2 bg-red-100 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
              </div>
            </button>
          )}
        </div>
        
        {/* Indicador accesible con ícono */}
        <div className="mt-3 sm:mt-4 px-2 flex items-center justify-center sm:justify-start gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm sm:text-base md:text-lg text-gray-600 font-medium opacity-90">
            Escribe para buscar automáticamente
          </span>
        </div>

        {/* Sugerencias de búsqueda (opcional para accesibilidad) */}
        <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
          <span className="text-xs sm:text-sm text-gray-500 font-medium px-2">Sugerencias:</span>
          <button 
            type="button"
            onClick={() => alBuscar('aceite')}
            className="text-xs sm:text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200"
            style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)' }}
          >
            Aceite
          </button>
          <button 
            type="button"
            onClick={() => alBuscar('frenos')}
            className="text-xs sm:text-sm px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors duration-200"
            style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)' }}
          >
            Frenos
          </button>
          <button 
            type="button"
            onClick={() => alBuscar('Bujía')}
            className="text-xs sm:text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors duration-200"
            style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)' }}
          >
            Bujía
          </button>
        </div>
      </div>
    </div>
  );
}