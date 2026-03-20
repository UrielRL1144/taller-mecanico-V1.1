import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function BottomNav({ usuarioLogueado }) {
  const location = useLocation();

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 
      bg-linear-to-t from-gray-900 to-gray-800 
      border-t-2 border-yellow-500 
      p-1 pb-4 sm:pb-2 
      flex items-end sm:items-center 
      h-18 sm:h-20 
      shadow-[0_-10px_30px_rgba(0,0,0,0.3)] z-50

      /* --- DISPERSIÓN (Lo que hicimos antes) --- */
      justify-evenly           
      sm:justify-center        
      sm:gap-12                
      md:gap-20                
      lg:gap-32                

      /* --- ⬇️ NUEVA ANIMACIÓN: OCULTAR/MOSTRAR EN PC ⬇️ --- */
      transition-transform duration-500 ease-in-out  /* Suavidad del movimiento */
      
      /* ESTADO: MÓVIL (Quieto, siempre visible) */
      translate-y-0
      
      /* ESTADO: PC/TABLET (Escondido por defecto) */
      /* Se baja el 85% de su altura, dejando ver solo el borde amarillo y la puntita */
      sm:translate-y-[85%] 
      
      /* ESTADO: PC/TABLET (Al pasar el mouse encima) */
      /* Regresa a su posición original (0) */
      sm:hover:translate-y-0
    `}>
      
      {/* Pestaña visual "HANDLE" para indicar que hay menú (Solo PC) */}
      {/* Esto es un pequeño semicírculo transparente arriba para ampliar el área donde el mouse detecta el menú */}
      <div className="hidden sm:block absolute -top-6 left-0 right-0 h-6 bg-transparent w-full z-40"></div>
      
      {/* Texto flotante opcional "MENÚ" que aparece cuando está oculto para guiar al usuario */}
      <div className="hidden sm:flex absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-gray-900 px-3 py-0.5 rounded-t-lg font-bold text-[10px] uppercase tracking-widest opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
        Menú ▲
      </div>

      {/* Indicador de borde superior decorativo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-yellow-400 to-transparent"></div>
      
      {/* Elementos de navegación */}
      <NavItem 
        to="/" 
        icon="🛒" 
        label="Ventas" 
        active={location.pathname === '/'} 
        highlight={true}
      />
      
      <NavItem 
        to="/inventario" 
        icon="📦" 
        label="Almacén" 
        active={location.pathname === '/inventario'} 
        disabled={!usuarioLogueado}
      />
      
      <NavItem 
        to="/proveedores" 
        icon="👥" 
        label="Proveedores" 
        active={location.pathname === '/proveedores'} 
        disabled={!usuarioLogueado}
      />
      
      {/* Botón central especial para Admin */}
      {usuarioLogueado?.rol === 'admin' && (
        <div className="relative flex items-end">
          {/* Efecto de destello para admin */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-linear-to-r from-yellow-400 to-orange-500 text-white text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-lg whitespace-nowrap z-10 pointer-events-none">
            Admin
          </div>
          
          <div className="flex gap-2 sm:gap-10 items-end"> 
            
            <div className="hidden sm:block w-px h-8 bg-gray-600/50 mx-2"></div>

            <NavItem 
              to="/dashboard" 
              icon="📊" 
              label="Finanzas" 
              active={location.pathname === '/dashboard'}
              admin={true}
            />
            <NavItem 
              to="/ajustes" 
              icon="⚙️" 
              label="Ajustes" 
              active={location.pathname === '/ajustes'}
              admin={true}
            />
          </div>
        </div>
      )}
    </nav>
  );
}

// Componente NavItem optimizado
function NavItem({ to, icon, label, disabled, active, highlight = false, admin = false }) {
  
  // CAMBIO 2: Ajuste de tamaños para PC/Tablet
  // Antes: sm:w-16 sm:h-16 (Eran botones de 64px, muy grandes)
  // Ahora: sm:w-12 sm:h-12 (Botones de 48px, más elegantes)
  const sizeClasses = "w-11 h-11 sm:w-12 sm:h-12";
  
  // CAMBIO 3: Ajuste de tamaño de iconos
  // Antes: sm:text-3xl (Muy grandes)
  // Ahora: sm:text-xl (Tamaño balanceado)
  const iconSize = active ? "text-xl sm:text-2xl" : "text-xl sm:text-xl";

  // Estado deshabilitado
  if (disabled) {
    return (
      <div className="relative flex flex-col items-center gap-0.5 sm:gap-1 p-1 opacity-40 cursor-not-allowed select-none">
        <div className="absolute inset-0 bg-gray-700/30 rounded-xl blur-sm"></div>
        <div className={`relative flex items-center justify-center ${sizeClasses} rounded-xl sm:rounded-2xl bg-gray-800/50`}>
          <span className={`${iconSize} filter grayscale`}>
            {icon}
          </span>
        </div>
        <span className="hidden sm:block text-[10px] font-bold uppercase text-gray-400 tracking-wider mt-1">
          {label}
        </span>
        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-[8px] sm:text-[10px] font-bold">🔒</span>
        </div>
      </div>
    );
  }

  // Link activo/normal
  return (
    <Link 
      to={to} 
      // CAMBIO 4: Reduje la animación de escala en PC
      // Antes: sm:scale-110 (Crecía mucho y causaba sensación de desborde)
      // Ahora: sm:scale-105 (Un efecto más sutil y controlado)
      className={`relative flex flex-col items-center gap-0.5 sm:gap-1 p-1 transition-all duration-300 group ${
        active 
          ? 'transform scale-105 sm:scale-105 -translate-y-1' 
          : 'hover:scale-105 active:scale-95'
      }`}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <div className="absolute -inset-1 bg-yellow-500/20 rounded-2xl animate-pulse"></div>
      )}
      
      <div className={`
        relative flex items-center justify-center 
        ${sizeClasses}
        rounded-xl sm:rounded-2xl 
        transition-all duration-300
        ${active 
          ? 'bg-linear-to-br from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/30' 
          : admin 
            ? 'bg-linear-to-br from-blue-900/80 to-blue-700/80' 
            : highlight
              ? 'bg-linear-to-br from-green-600/90 to-emerald-700/90'
              : 'bg-linear-to-br from-gray-800 to-gray-900'
        }
        ${!active && 'group-hover:bg-linear-to-br group-hover:from-gray-700 group-hover:to-gray-800'}
        border ${active ? 'border-yellow-400' : 'border-gray-700'}
      `}>
        <span 
          className={`
            ${iconSize}
            transition-transform duration-300
            ${active ? 'scale-110' : 'group-hover:scale-110'}
          `}
        >
          {icon}
        </span>
        
        <div className="absolute inset-0 bg-linear-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/0 rounded-xl sm:rounded-2xl transition-all duration-300"></div>
      </div>
      
      <span 
        className={`
          text-[9px] sm:text-[10px] 
          font-bold uppercase 
          tracking-wider 
          transition-all duration-300
          text-center 
          px-1 py-0.5 sm:px-2 sm:py-1
          rounded-full
          truncate max-w-12.5 sm:max-w-none
          ${active 
            ? 'text-yellow-300 bg-yellow-900/30 font-extrabold' 
            : admin
              ? 'text-blue-300'
              : highlight
                ? 'text-green-300'
                : 'text-gray-400'
          }
          ${!active && 'group-hover:text-white'}
        `}
      >
        {label}
      </span>
      
      {label === "Ventas" && !active && (
        <div className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce z-20">
          <span className="text-[8px] sm:text-[10px] font-bold text-white">!</span>
        </div>
      )}
      
      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl border border-gray-700">
          {label}
          {active && <span className="text-yellow-400 ml-1">• Activo</span>}
        </div>
      </div>
    </Link>
  );
}

export default BottomNav;