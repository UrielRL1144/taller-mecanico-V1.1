import React, { useEffect, useState } from 'react';

export default function BotonCarrito({ cantidadTotal, totalDinero, alClick }) {
  const [animar, setAnimar] = useState(false);

  // Efecto: Cada vez que cambia la cantidad, activamos la animación por 300ms
  useEffect(() => {
    if (cantidadTotal > 0) {
      setAnimar(true);
      const timer = setTimeout(() => setAnimar(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cantidadTotal]);

  if (cantidadTotal === 0) return null; // No mostrar si está vacío

  return (
    <button 
      onClick={alClick}
      className={`
        fixed z-40 
        /* POSICIÓN: Ajustada para que no estorbe al Header ni al Buscador */
        top-24 right-4 sm:top-28 sm:right-8
        
        /* ESTÉTICA: Mecánica de Alto Contraste */
        bg-yellow-500 hover:bg-yellow-400 text-gray-900 
        border-4 border-gray-900 
        shadow-[0_0_20px_rgba(234,179,8,0.6)]
        
        /* FORMA Y TAMAÑO */
        flex items-center gap-3 
        pl-4 pr-6 py-3 rounded-full 
        transition-all duration-300
        
        /* ANIMACIÓN DE REBOTE AL AGREGAR */
        ${animar ? 'scale-125 bg-white' : 'scale-100'}
        active:scale-95
      `}
    >
      {/* Icono Carrito */}
      <div className="relative">
        <span className="text-2xl">🛒</span>
        <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-yellow-500">
          {cantidadTotal}
        </span>
      </div>

      {/* Info de Dinero (Solo si cabe, opcional en móviles muy pequeños) */}
      <div className="flex flex-col items-start leading-none">
        <span className="text-[9px] font-black uppercase opacity-80">Total</span>
        <span className="text-lg font-black">${totalDinero}</span>
      </div>
    </button>
  );
}