import React from 'react';
import { Link } from 'react-router-dom';

function Header({ usuarioLogueado, cerrarSesion }) {
  return (
    <header className={`
      /* --- COMPORTAMIENTO MÓVIL (Normal) --- */
      relative shrink-0 z-50
      
      /* --- COMPORTAMIENTO ESCRITORIO (Animado) --- */
      sm:fixed sm:top-0 sm:left-0 sm:right-0  /* Se fija al techo */
      
      /* Animación de entrada/salida */
      transition-transform duration-500 ease-in-out
      
      /* Estado Oculto (PC): Se sube el 88%, dejando solo un borde visible */
      sm:-translate-y-[88%]
      
      /* Estado Visible (PC): Al pasar el mouse, baja a 0 */
      sm:hover:translate-y-0

      /* Estilos Visuales Base */
      bg-linear-to-r from-gray-900 via-gray-800 to-blue-900 
      p-4 sm:p-5 shadow-2xl text-white 
      flex justify-between items-center 
      overflow-visible /* Importante para que se vea la pestaña colgando */
    `}>
      
      {/* --- PESTAÑA DETECTORA (Solo PC) --- */}
      {/* Zona invisible debajo del header para detectar el mouse antes */}
      <div className="hidden sm:block absolute -bottom-6 left-0 right-0 h-6 bg-transparent w-full z-40"></div>
      
      {/* Etiqueta visual "INFO" que cuelga */}
      <div className="hidden sm:flex absolute -bottom-5 left-10/12 -translate-x-1/2 bg-blue-900/90 border border-white/10 text-blue-200 px-4 py-0.5 rounded-b-lg font-bold text-[10px] uppercase tracking-widest shadow-lg pointer-events-none group-hover:opacity-0 transition-opacity">
        Info ▼
      </div>

      {/* --- FONDO DECORATIVO --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 opacity-5">
          <div className="w-full h-full border-4 border-blue-400 rounded-full"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-yellow-500 via-orange-500 to-transparent opacity-30"></div>
      </div>
      
      {/* --- LOGO --- */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-yellow-500 to-orange-500 shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <div>
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tighter leading-tight">
            <span className="block text-yellow-300">REFACCIONARIA</span>
            <span className="block text-sm sm:text-base font-semibold text-blue-200">ZACAPOAXTLA</span>
          </h1>
          <p className="hidden xs:block text-[10px] sm:text-xs text-gray-300 mt-1 font-medium">
            <span className="text-yellow-400">✓</span> Refacciones y Servicio Mecánico
          </p>
        </div>
      </div>

      {/* --- ÁREA DE USUARIO --- */}
      {usuarioLogueado ? (
        <div className="relative z-10 flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 min-w-35 sm:min-w-40">
            <div className="relative shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
            </div>
            
            <div className="text-right flex-1 overflow-hidden">
              <p className="text-[9px] font-black uppercase text-yellow-400 tracking-wider truncate">
                EN TURNO
              </p>
              <p className="text-xs sm:text-sm font-bold leading-tight truncate" 
                  title={usuarioLogueado.nombre_completo}>
                {usuarioLogueado.nombre_completo}
              </p>
            </div>
          </div>

          <button 
            onClick={cerrarSesion}
            className="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-red-600 to-red-700 shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 hover:from-red-700 hover:to-red-800"
            aria-label="Cerrar sesión"
          >
            <span className="text-base sm:text-lg">🚪</span>
            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                Cerrar sesión
              </div>
            </div>
          </button>
        </div>
      ) : (
        <Link 
          to="/login" 
          className="relative z-10 group flex items-center gap-2 bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 font-bold uppercase text-xs sm:text-sm tracking-wider"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="hidden xs:inline">Acceso Staff</span>
          <span className="xs:hidden">Acceso</span>
        </Link>
      )}
    </header>
  );
}

export default Header;