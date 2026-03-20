import { useState } from 'react';
import PanelGestionAvanzada from './PanelGestionAvanzada';
import ModalEdicionProducto from './ModalEdicionProducto';
import { toast } from 'sonner';

export default function ListaInventario({ 
  productos, 
  onActualizar, 
  usuarioLogueado, 
  onRecargar, 
  onCargarMas, // <--- Prop para cargar más páginas
  hayMas       // <--- Prop booleano (true si faltan productos)
}) {
  const [productoEnGestion, setProductoEnGestion] = useState(null);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);
  const [imgExpandida, setImgExpandida] = useState(null);
  const [modoPapelera, setModoPapelera] = useState(false);

  // --- FUNCIÓN DE SCROLL CORREGIDA ---
  const scrollToTop = () => {
    // Intentamos scroll global por si acaso
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // PERO, como tu App.jsx tiene un <main> con scroll, este es el que importa:
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRestaurar = async (id) => {
     const toastId = toast.loading("Restaurando...");
     try {
        const res = await fetch(`http://localhost:3000/api/productos/${id}/reactivar`, { method: 'PUT' });
        if (res.ok) {
            toast.success("Producto recuperado", { id: toastId });
            onRecargar(true); // Recargar desde cero
        } else {
            toast.error("Error al restaurar", { id: toastId });
        }
     } catch (e) { toast.error("Error de conexión", { id: toastId }); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-32 font-sans animate-in fade-in duration-500 relative">
      
      {/* HEADER DE LA LISTA (Sticky: se queda pegado al bajar) */}
      <div className="sticky top-0 z-40 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/95 backdrop-blur-md p-4 rounded-b-3xl shadow-sm border-b border-gray-100 transition-all">
          <div className="flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full animate-pulse ${modoPapelera ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
             <h3 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-widest">
                {modoPapelera ? 'Papelera de Reciclaje' : 'Catálogo Activo'}
             </h3>
             <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-xs font-bold" title="Productos cargados actualmente">
                Visibles: {productos.length}
             </span>
          </div>

          {/* SWITCH PAPELERA */}
          <button 
              onClick={() => {
                  const nuevoModo = !modoPapelera;
                  setModoPapelera(nuevoModo);
                  // Al cambiar modo, recargamos desde cero (pasamos el modo explícitamente)
                  if (onRecargar) onRecargar(nuevoModo); 
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all flex items-center gap-2 border shadow-sm active:scale-95 ${modoPapelera ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-700' : 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-500 hover:bg-red-50'}`}
          >
              {modoPapelera ? '🔙 Ver Catálogo' : '🗑️ Ver Eliminados'}
          </button>
      </div>

      {/* ESTADO VACÍO */}
      {productos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <span className="text-6xl mb-4">📦</span>
              <p className="font-black text-gray-400 uppercase tracking-widest">No hay productos cargados</p>
          </div>
      )}

      {/* GRID RESPONSIVO DE TARJETAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
        {productos.map(prod => (
          <div key={prod.id} className="bg-white p-5 rounded-4xl shadow-lg border border-gray-100 transition-all hover:border-blue-200 hover:shadow-xl flex flex-col justify-between group relative overflow-hidden">
            
            {/* Decoración lateral (Rojo si falta stock) */}
            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${parseFloat(prod.stock_actual) <= parseFloat(prod.stock_minimo) ? 'bg-red-500' : 'bg-blue-500'} group-hover:w-2 transition-all`}></div>

            {/* CABECERA TARJETA */}
            <div className="mb-4 pl-3">
               <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-bold uppercase tracking-wide border border-gray-200">
                         {prod.categoria}
                      </span>
                      {prod.alias_comun && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-black uppercase tracking-wide border border-blue-100">
                           {prod.alias_comun}
                        </span>
                      )}
                  </div>
               </div>
               
               <h3 className="font-black text-gray-800 text-lg leading-tight uppercase mb-1 line-clamp-2" title={prod.nombre_tecnico}>
                  {prod.nombre_tecnico}
               </h3>
               
               <div className="flex flex-col gap-1 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 w-fit">
                      🆔 {prod.codigo_barras || '---'}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                      <span>📍</span> {prod.ubicacion || 'Sin Ubicación'}
                  </div>
               </div>
            </div>

            {/* TABLA DE DATOS RÁPIDOS */}
            <div className="grid grid-cols-3 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-200 mb-4 mx-1">
               <div className="bg-white p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Stock</span>
                  <span className={`text-sm font-black ${parseFloat(prod.stock_actual) <= parseFloat(prod.stock_minimo) ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
                     {prod.stock_actual}
                     {/* Pequeña unidad abajo */}
                     <span className="text-[8px] ml-0.5 text-gray-400 font-normal block -mt-1 uppercase">{prod.unidad_medida?.substring(0,3)}</span>
                  </span>
               </div>
               <div className="bg-white p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Costo</span>
                  <span className="text-sm font-bold text-gray-500">${prod.precio_compra}</span>
               </div>
               <div className="bg-green-50/50 p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-black text-green-600 uppercase">Venta</span>
                  <span className="text-sm font-black text-green-700">${prod.precio_venta}</span>
               </div>
            </div>

            {/* BOTONERA DE ACCIONES */}
            <div className="flex items-center justify-between pl-3 border-t border-gray-50 pt-3">
               <div className="flex gap-2">
                  {!modoPapelera && (
                     <>
                        <button onClick={() => setProductoEnGestion(prod)} className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-100 hover:text-white text-gray-600 rounded-lg transition-colors shadow-sm" title="Gestión Avanzada">
                           ⚙️
                        </button>
                        {prod.imagen_url && (
                           <button onClick={() => setImgExpandida({ url: prod.imagen_url, titulo: prod.nombre_tecnico })} className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors shadow-sm" title="Ver Foto">
                              🖼️
                           </button>
                        )}
                     </>
                  )}
               </div>

               <div>
                  {!modoPapelera ? (
                     <button 
                       onClick={() => setProductoEnEdicion(prod)} 
                       className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center gap-1"
                     >
                       ✏️ Editar
                     </button>
                  ) : (
                     <button 
                        onClick={() => handleRestaurar(prod.id)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 text-[10px] font-black uppercase px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1"
                     >
                        ♻️ Restaurar
                     </button>
                  )}
               </div>
            </div>

          </div>
        ))}
      </div>

      {/* --- BOTÓN CARGAR MÁS (Aparece solo si hayMas es true) --- */}
      {/* --- ZONA DE PAGINACIÓN --- */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8 pb-4">
          
          {/* BOTÓN CARGAR MÁS */}
          {hayMas && (
              <button 
                  onClick={onCargarMas}
                  className="bg-white border-2 border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 font-black uppercase tracking-widest text-xs px-10 py-4 rounded-full shadow-lg active:scale-95 transition-all flex items-center gap-2 group"
              >
                  <span className="group-hover:translate-y-1 transition-transform">⬇️</span> 
                  Cargar siguientes 50
              </button>
          )}

          {/* BOTÓN MOSTRAR MENOS (Solo si hemos cargado más de una página) */}
          {productos.length > 50 && (
              <button 
                  onClick={() => {
                      scrollToTop();
                      if (onRecargar) onRecargar(modoPapelera);
                  }}
                  className="bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400 font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full transition-all flex items-center gap-2"
              >
                  <span>✖</span> 
                  Contraer Lista
              </button>
          )}
      </div>

      {/* --- BOTÓN FLOTANTE "IR ARRIBA" --- */}
      {productos.length > 50 && ( // Solo aparece si hay más de 50 items (es decir, si cargaste más páginas)
          <button 
            onClick={() => {
                scrollToTop(); // 1. Sube visualmente
                // 2. Resetea la lista a 50 items (respetando si estás en papelera o no)
                if (onRecargar) onRecargar(modoPapelera); 
            }}
            className="fixed bottom-24 right-6 sm:bottom-6 sm:right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-90 transition-all z-50 border-4 border-white/20 animate-in zoom-in"
            title="Volver al inicio y contraer lista"
          >
            <span>⬆</span>
            <span className="hidden sm:inline">Inicio (Reset)</span>
          </button>
      )}

      {/* --- MODALES DE EDICIÓN Y GESTIÓN --- */}
      {productoEnEdicion && (
        <ModalEdicionProducto 
          producto={productoEnEdicion}
          onClose={() => setProductoEnEdicion(null)}
          onActualizar={onActualizar}
          usuarioLogueado={usuarioLogueado}
          onEliminar={() => {
             setProductoEnEdicion(null);
             if (onRecargar) onRecargar(true); 
          }}
        />
      )}

      {productoEnGestion && (
        <PanelGestionAvanzada 
          producto={productoEnGestion}
          usuarioLogueado={usuarioLogueado}
          onClose={() => setProductoEnGestion(null)}
          onActualizar={onActualizar}
        />
      )}

      {imgExpandida && (
        <div className="fixed inset-0 z-110 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in" onClick={() => setImgExpandida(null)}>
           <div className="relative flex flex-col items-center w-full max-w-4xl" onClick={e => e.stopPropagation()}>
             <span className="text-yellow-500 font-black uppercase text-xs sm:text-sm mb-6 tracking-[0.3em] bg-gray-900 px-6 py-2 rounded-full border border-yellow-500/30 shadow-lg">{imgExpandida.titulo}</span>
             <img src={imgExpandida.url} className="rounded-2xl shadow-2xl max-h-[75vh] w-auto object-contain bg-white border-2 border-gray-800" alt="Vista" />
             <button onClick={() => setImgExpandida(null)} className="mt-8 bg-gray-800 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 shadow-xl hover:bg-gray-700 border border-gray-600 transition-colors">
                Cerrar Imagen
             </button>
           </div>
        </div>
      )}
    </div>
  );
}