import { useState } from 'react';
import { toast } from 'sonner';


// Componentes y API
import Buscador from '../components/Buscador';
import BotonCarrito from '../components/BotonCarrito'; // <--- IMPORTAR
import CarritoPanel from '../components/CarritoPanel'; // <--- IMPORTAR
import ModalConfirmacion from '../components/ModalConfirmacion';
import ModalConfirmacionSimple from '../components/ModalConfirmacionSimple';
import { buscarProductos } from '../api/productos';
import { registrarVenta } from '../api/ventas';

// ✅ AGREGA ESTA FUNCIÓN AUXILIAR AQUÍ MISMO:
// 1. Para la foto GRANDE (Alta calidad, optimizada)
const getPreviewUrl = (url) => {
  if (!url) return '';
  return url.replace('/upload/', '/upload/f_auto,q_auto:eco,w_1200/');
};

// 2. Para las MINIATURAS (Pequeñas, carga rápida) <--- ESTA ES LA QUE TE FALTA
const getThumbnailUrl = (url) => {
  if (!url) return '';
  return url.replace('/upload/', '/upload/f_auto,q_auto:eco,w_150,c_fill/');
};

export default function VentaMostrador() {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  
  // --- ESTADO NUEVO: Controla si el panel se ve o no ---
  const [mostrarPanelCarrito, setMostrarPanelCarrito] = useState(false);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVaciarModalOpen, setIsVaciarModalOpen] = useState(false);
  const [productoVerDetalles, setProductoVerDetalles] = useState(null);
  const [productoVerFoto, setProductoVerFoto] = useState(null);

  const handleSearch = async (val) => {
    setTermino(val);
    if (val.length > 2) {
      const data = await buscarProductos(val);
      
      // --- CORRECCIÓN AQUÍ ---
      // Antes: setResultados(data);
      // Ahora: Verificamos si data tiene la propiedad .productos (formato nuevo)
      if (data && data.productos) {
          setResultados(data.productos);
      } else if (Array.isArray(data)) {
          // Por si acaso el backend devolviera el formato antiguo
          setResultados(data);
      } else {
          setResultados([]);
      }
      // -----------------------

    } else {
      setResultados([]);
    }
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    const cantidadActual = existe ? existe.cantidad : 0;

    if (cantidadActual < producto.stock_actual) {
      if (existe) {
        setCarrito(carrito.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        ));
      } else {
        setCarrito([...carrito, { ...producto, cantidad: 1 }]);
      }
      
      // CAMBIO IMPORTANTE: 
      // Ya NO abrimos el panel automáticamente (setMostrarPanelCarrito NO se pone true aquí)
      // El BotonCarrito hará una animación automática al detectar el cambio en 'carrito'.
      toast.success("AGREGADO AL CARRITO", { 
          duration: 1000, 
          position: 'top-right', // Muevo el toast cerca del botón
          style: { background: '#EAB308', color: 'black', fontWeight: 'bold' } // Estilo amarillo
      }); 

    } else {
      toast.warning("STOCK LÍMITE ALCANZADO");
    }
  };

  const reducirCantidad = (id) => {
    const producto = carrito.find(item => item.id === id);
    if (producto.cantidad > 1) {
      setCarrito(carrito.map(item => item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item));
    } else {
      setCarrito(carrito.filter(item => item.id !== id));
      // Si el carrito se vacía por completo al restar, cerramos el panel
      if (carrito.length === 1) setMostrarPanelCarrito(false);
    }
  };

  const vaciarCarritoCompletamente = () => {
    setCarrito([]);
    setResultados([]);
    setTermino('');
    setIsVaciarModalOpen(false);
    setMostrarPanelCarrito(false); // Cerramos panel al vaciar
    toast.info("CARRITO VACIADO");
  };

  const revisarAlertasYConfirmar = () => {
    const alertas = carrito
      .filter(item => (item.stock_actual - item.cantidad) <= item.stock_minimo)
      .map(item => `${item.nombre_tecnico}: Quedarán solo ${item.stock_actual - item.cantidad} pzas.`);
    
    setAlertasStock(alertas);
    setIsModalOpen(true);
  };

  const finalizarProcesoVenta = async (metodoPago) => {
    const idCarga = toast.loading("PROCESANDO...", { style: { background: '#1e293b', color: 'white' } });
    const payload = {
      metodo_pago: metodoPago,
      atendido_por: "Mecánico Zacapoaxtla", 
      productos: carrito.map(i => ({ producto_id: i.id, cantidad: i.cantidad, precio_unitario: i.precio_venta }))
    };

    const res = await registrarVenta(payload);
    if (res.success) {
      toast.success("VENTA COMPLETADA", { id: idCarga, style: { background: '#16a34a', color: 'white' } });
      setCarrito([]);
      setTermino('');
      setResultados([]);
      setIsModalOpen(false);
      setMostrarPanelCarrito(false); // Cerramos el panel
    } else {
      toast.error("ERROR EN VENTA", { id: idCarga });
    }
  };

  // Cálculos para pasar a los componentes
  const totalDinero = carrito.reduce((acc, i) => acc + (i.precio_venta * i.cantidad), 0).toFixed(2);
  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);

  // --- LÓGICA PARA CANTIDADES DECIMALES (Mangueras, Aceites) ---
  
  // 1. Helper para saber si permite decimales
  const permiteFracciones = (producto) => {
      // Ajusta esta lista según tus unidades en BD
      const unidadesFraccionarias = ['Metro', 'Litro', 'Kilo', 'Gramo']; 
      return unidadesFraccionarias.includes(producto.unidad_medida);
  };

  // 2. Función para escribir la cantidad manualmente
  const handleCambioManualCantidad = (id, valorInput) => {
      let nuevaCantidad = parseFloat(valorInput);
      const productoEnCarrito = carrito.find(item => item.id === id);

      if (!productoEnCarrito) return;

      // Validación 1: Si es vacío o 0, no hacemos nada (o podríamos borrarlo)
      if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) return;

      // Validación 2: Regla de Enteros para Piezas
      if (!permiteFracciones(productoEnCarrito) && !Number.isInteger(nuevaCantidad)) {
          toast.warning("Este producto se vende por piezas enteras");
          nuevaCantidad = Math.floor(nuevaCantidad) || 1;
      }

      // Validación 3: Stock
      if (nuevaCantidad > productoEnCarrito.stock_actual) {
          toast.warning(`Solo tienes ${productoEnCarrito.stock_actual} en existencia`);
          nuevaCantidad = productoEnCarrito.stock_actual;
      }

      // Actualizar estado
      setCarrito(carrito.map(item => 
          item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      ));
  };

  // LÓGICA PARA ACTUALIZACIÓN DIRECTA (Decimales y Manual)
  const actualizarCantidadDirecta = (id, nuevaCantidad) => {
      setCarrito(carrito.map(item => 
          item.id === id ? { ...item, cantidad: parseFloat(nuevaCantidad) } : item
      ));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-6 animate-in fade-in duration-300 pb-32">
       
       <div className="bg-gray-900 p-4 rounded-2xl shadow-2xl border border-gray-700 mb-6">
            <Buscador placeholder="BUSCAR REFACCIÓN..." valor={termino} alBuscar={handleSearch} />
       </div>
       
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {resultados.map(prod => {
             const itemEnCarrito = carrito.find(c => c.id === prod.id);
             const sinStock = (itemEnCarrito ? itemEnCarrito.cantidad : 0) >= prod.stock_actual;
             
             return (
               <div key={prod.id} className="bg-gray-800 text-white p-5 rounded-3xl shadow-xl border-2 border-gray-700 flex flex-col gap-4 transition-all hover:border-yellow-500 hover:shadow-yellow-500/20 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none group-hover:bg-yellow-500/10 transition-colors"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex-1 pr-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`text-xs sm:text-sm font-black px-3 py-1 rounded-lg uppercase tracking-wide border ${prod.stock_actual > 0 ? 'bg-green-900/50 text-green-400 border-green-500' : 'bg-red-900/50 text-red-400 border-red-500'}`}>
                            {prod.stock_actual > 0 ? `Stock: ${prod.stock_actual}` : 'AGOTADO'}
                          </span>
                          {prod.alias_comun && <span className="text-xs sm:text-sm bg-blue-900/50 text-blue-300 border border-blue-500 px-3 py-1 rounded-lg font-bold uppercase">{prod.alias_comun}</span>}
                      </div>
                      <h3 className="font-black text-white text-xl sm:text-2xl uppercase leading-none tracking-tight shadow-black drop-shadow-md">
                        {prod.nombre_tecnico}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-400 font-medium mt-2 line-clamp-2 leading-snug">
                        {prod.descripcion || 'Sin descripción adicional.'}
                      </p>

                      {/* --- NUEVO: UBICACIÓN DEL PRODUCTO --- */}
                      <div className="mt-4 flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-gray-700/50">
                          <div className="bg-gray-700/50 p-2 rounded-lg">
                             <span className="text-lg">📍</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                                Ubicación en Almacén
                             </span>
                             <span className="text-sm font-black text-yellow-400 uppercase tracking-wide shadow-black drop-shadow-sm">
                                {prod.ubicacion || 'SIN ASIGNAR'}
                             </span>
                          </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-600">
                      <div className="flex justify-between items-end mb-4">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Precio Unitario</p>
                          <p className="text-yellow-400 font-black text-3xl sm:text-4xl tracking-tighter drop-shadow-lg">${prod.precio_venta}</p>
                      </div>

                      <div className="grid grid-cols-4 gap-2 h-14 sm:h-16">
                          <button onClick={() => setProductoVerDetalles(prod)} className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-2xl font-black border border-gray-600 flex items-center justify-center active:scale-95">ℹ️</button>
                          
                          {prod.imagen_url ? (
                              <button onClick={() => setProductoVerFoto(prod)} className="col-span-1 bg-purple-900/50 hover:bg-purple-800/80 text-purple-200 border border-purple-500 rounded-xl text-2xl font-black flex items-center justify-center active:scale-95">🖼️</button>
                          ) : (
                            <div className="col-span-1 bg-gray-800/50 rounded-xl border border-gray-700/50"></div>
                          )}

                          <button onClick={() => agregarAlCarrito(prod)} disabled={sinStock} className={`col-span-2 rounded-xl font-black shadow-lg active:scale-95 transition-all flex items-center justify-center text-xl sm:text-2xl tracking-widest border-b-4 ${sinStock ? 'bg-gray-600 text-gray-400 border-gray-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800'}`}>
                              {sinStock ? 'SIN STOCK' : 'AGREGAR +'}
                          </button>
                      </div>
                  </div>
               </div>
             )
          })}
       </div>

       {/* --- AQUÍ ESTÁN LOS COMPONENTES NUEVOS --- */}
       
       {/* 1. Botón Flotante (Siempre visible si hay cosas en el carrito) */}
       <BotonCarrito 
          cantidadTotal={totalItems} 
          totalDinero={totalDinero} 
          alClick={() => setMostrarPanelCarrito(true)} 
       />

       {/* 2. Panel Grande (Solo visible si mostrarPanelCarrito es true) */}
       {mostrarPanelCarrito && (
         <CarritoPanel 
            carrito={carrito}
            total={Number(totalDinero)}
            onCerrar={() => setMostrarPanelCarrito(false)}
            onVaciar={() => setIsVaciarModalOpen(true)}
            onAgregar={agregarAlCarrito}
            onReducir={reducirCantidad}
            onCobrar={revisarAlertasYConfirmar}
            onActualizarCantidad={actualizarCantidadDirecta} // <--- NUEVO PROP
         />
       )}

       {/* MODALES VISUALES Y DE CONFIRMACIÓN (Sin cambios) */}
       <ModalConfirmacionSimple isOpen={isVaciarModalOpen} onClose={() => setIsVaciarModalOpen(false)} onConfirm={vaciarCarritoCompletamente} titulo="¿BORRAR VENTA?" mensaje="Se eliminarán todos los productos seleccionados." textoBotonConfirmar="SÍ, BORRAR" />
       <ModalConfirmacion isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={finalizarProcesoVenta} total={Number(totalDinero)} alertas={alertasStock} />

       {productoVerDetalles && (
        <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setProductoVerDetalles(null)}>
           <div className="bg-gray-900 w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl border-2 border-yellow-500/50 overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 bg-linear-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                 <h2 className="text-xl sm:text-2xl font-black text-white uppercase leading-tight">{productoVerDetalles.nombre_tecnico}</h2>
                 {productoVerDetalles.alias_comun && <p className="text-sm font-bold text-yellow-500 mt-1 uppercase tracking-widest">Conocido como: {productoVerDetalles.alias_comun}</p>}
              </div>
              <div className="flex-1 flex flex-col p-6 overflow-hidden bg-gray-900">
                 <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 mb-6 relative flex-1 overflow-y-auto">
                    <span className="absolute top-2 left-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-400">Ficha Técnica</span>
                    <p className="text-lg text-gray-300 font-medium leading-relaxed mt-2 whitespace-pre-line">{productoVerDetalles.descripcion || "Descripción técnica no disponible."}</p>
                 </div>
                 <div className="shrink-0">
                    <div className="flex justify-between items-center bg-gray-800 p-4 rounded-2xl mb-4 border border-gray-700">
                       <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Precio Oficial</span>
                       <span className="text-4xl font-black text-yellow-400">${productoVerDetalles.precio_venta}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => setProductoVerDetalles(null)} className="py-4 rounded-xl font-black text-gray-400 text-sm uppercase hover:bg-gray-800 border border-gray-700">Cerrar</button>
                       <button onClick={() => { agregarAlCarrito(productoVerDetalles); setProductoVerDetalles(null); }} className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm uppercase shadow-lg border-b-4 border-blue-800 active:scale-95 tracking-widest">Agregar Ahora</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
       )}

       {/* MODAL 2: VISUALIZADOR DE FOTO (AHORA CON GALERÍA) */}
       {productoVerFoto && (
        <div className="fixed inset-0 z-110 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in" onClick={() => setProductoVerFoto(null)}>
           
           <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
              
              {/* TÍTULO */}
              <span className="text-yellow-500 font-black uppercase text-xs sm:text-sm mb-4 tracking-[0.3em] bg-gray-900 px-6 py-2 rounded-full border border-yellow-500/30 shadow-lg text-center">
                  {productoVerFoto.nombre_tecnico}
              </span>

              {/* CONTENEDOR DE IMAGEN PRINCIPAL */}
              {/* Usamos un estado local temporal para navegar la galería si existe */}
              <GaleriaVisor producto={productoVerFoto} />

              <button 
                  className="mt-6 bg-gray-800 text-white px-12 py-4 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 shadow-xl hover:bg-gray-700 border border-gray-600 transition-colors" 
                  onClick={() => setProductoVerFoto(null)}
              >
                  Cerrar imagen
              </button>
           </div>
        </div>
       )}
    </div>
  );

  // COMPONENTE INTERNO: Maneja la lógica de cambiar foto solo dentro del modal
function GaleriaVisor({ producto }) {
    // 1. Detectamos si hay galería. Si viene como string JSON, lo parseamos.
    let imagenes = [];
    try {
        if (Array.isArray(producto.galeria_imagenes)) {
            imagenes = producto.galeria_imagenes;
        } else if (typeof producto.galeria_imagenes === 'string') {
            imagenes = JSON.parse(producto.galeria_imagenes);
        }
    } catch (e) { console.error("Error parseando galería", e); }

    // 2. Si no hay galería válida, usamos la imagen principal como única opción
    if (!imagenes || imagenes.length === 0) {
        imagenes = [{ url: producto.imagen_url }];
    }

    // Estado para saber cuál estamos viendo
    const [fotoActual, setFotoActual] = useState(imagenes[0]?.url || '');

    return (
        <div className="flex flex-col items-center w-full">
            {/* FOTO GRANDE */}
            <img 
              src={getPreviewUrl(fotoActual)}
              className="rounded-2xl shadow-2xl max-h-[50vh] sm:max-h-[65vh] w-auto object-contain border-2 border-gray-800 bg-white" 
              alt="Detalle visual"
              loading="lazy"
            />

            {/* TIRA DE MINIATURAS (Solo si hay más de 1) */}
            {imagenes.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto p-2 max-w-full">
                    {imagenes.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setFotoActual(img.url)}
                            className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${fotoActual === img.url ? 'border-yellow-500 scale-110 shadow-lg shadow-yellow-500/20' : 'border-gray-700 opacity-50 hover:opacity-100'}`}
                        >
                            <img 
                              src={getThumbnailUrl(img.url)}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
}