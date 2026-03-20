import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import ModalConfirmacionSimple from './ModalConfirmacionSimple';

export default function PanelGestionAvanzada({ producto, onClose, onActualizar, usuarioLogueado }) {
  // Helper para saber si la unidad permite decimales
  const permiteDecimales = ['Metro', 'Litro', 'Kilo'].includes(producto.unidad_medida);
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [modo, setModo] = useState('detalle'); 
  
  // --- ESTADOS DEL MOTOR FINANCIERO ---
  const [nuevaCantidad, setNuevaCantidad] = useState("");
  const [nuevoPrecioCompra, setNuevoPrecioCompra] = useState(producto.precio_compra);
  
  // Calculamos el margen actual del producto para usarlo de base
  const margenInicial = producto.precio_compra > 0 
    ? (((producto.precio_venta - producto.precio_compra) / producto.precio_compra) * 100).toFixed(0) 
    : 30;

  const [margenDeseado, setMargenDeseado] = useState(margenInicial);
  const [nuevoPrecioVenta, setNuevoPrecioVenta] = useState(producto.precio_venta);
  
  const [motivo, setMotivo] = useState('');
  const [nuevaFactura, setNuevaFactura] = useState(null);
  const [deleteToken, setDeleteToken] = useState(null);

  // Modales
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // --- EFECTO: MOTOR DE CÁLCULO INTELIGENTE ---
  // Cada vez que cambia el Costo o el Margen, sugerimos un precio
  useEffect(() => {
    if (modo === 'reabastecer' && nuevoPrecioCompra > 0 && margenDeseado > 0) {
      const costo = parseFloat(nuevoPrecioCompra);
      const margen = parseFloat(margenDeseado);
      
      // Fórmula: Precio = Costo * (1 + (Margen/100))
      const sugerido = costo * (1 + (margen / 100));
      
      // Redondeamos a 2 decimales, o podríamos redondear a enteros si prefieres (Math.ceil)
      setNuevoPrecioVenta(sugerido.toFixed(2));
    }
  }, [nuevoPrecioCompra, margenDeseado, modo]);

  // --- LÓGICA DE DETECCIÓN DE CAMBIOS ---
  const hayCambiosSinGuardar = () => {
    if (modo === 'reabastecer') {
      return (
        (nuevaCantidad !== "" && nuevaCantidad > 0) || 
        motivo !== "" || 
        nuevaFactura !== null || 
        nuevoPrecioCompra != producto.precio_compra ||
        nuevoPrecioVenta != producto.precio_venta
      );
    }
    return false;
  };

  const subirFacturaNueva = () => {
    // Si ya había una factura subida y la estamos reemplazando, la borramos primero
    if (deleteToken) {
       eliminarImagenDeCloudinary();
    }

    window.cloudinary.openUploadWidget({
      cloudName: 'djorynixa', 
      uploadPreset: 'factura_ultra_eco',
      sources: ['local', 'camera'],
      multiple: false,
      cropping: false,
      folder: 'facturas_historial',
      return_delete_token: true // <--- ESTO ES LA CLAVE: Nos da permiso de borrar si nos equivocamos
    }, (error, result) => {
      if (!error && result && result.event === "success") { 
        setNuevaFactura(result.info.secure_url);
        setDeleteToken(result.info.delete_token); // <--- Guardamos la llave para borrar
        toast.success("Comprobante cargado (Temporal)");
      }
    });
  };

  useEffect(() => {
    if (modo === 'historial') obtenerHistorial();
  }, [modo]);

const [paginaHistorial, setPaginaHistorial] = useState(1);
const [hayMasHistorial, setHayMasHistorial] = useState(false);
const [filtroHistorial, setFiltroHistorial] = useState('TODO'); // 'TODO', 'REABASTECIMIENTO', 'EDICIÓN'

  // --- FUNCIÓN DE CARGA ACTUALIZADA ---
const obtenerHistorial = async (reset = false) => {
  try {
    const paginaSolicitada = reset ? 1 : paginaHistorial;
    const res = await fetch(`http://localhost:3000/api/productos/${producto.id}/historial?page=${paginaSolicitada}&limit=10`);
    const data = await res.json();
    
    if (reset) {
      setHistorial(data.datos);
      setPaginaHistorial(2); // Preparamos la siguiente
    } else {
      setHistorial(prev => [...prev, ...data.datos]); // Añadimos al final
      setPaginaHistorial(prev => prev + 1);
    }
    
    setHayMasHistorial(data.meta.hayMas);
  } catch (err) {
    toast.error("Error al cargar historial");
  }
};

// Resetear historial cuando entramos a la pestaña
useEffect(() => {
  if (modo === 'historial') obtenerHistorial(true);
}, [modo]);

// --- FILTRADO EN CLIENTE (Para UX instantánea en los 10-50 items cargados) ---
const historialFiltrado = historial.filter(mov => {
  if (filtroHistorial === 'TODO') return true;
  if (filtroHistorial === 'ENTRADAS') return mov.tipo_movimiento === 'REABASTECIMIENTO';
  if (filtroHistorial === 'PRECIOS') return parseFloat(mov.precio_compra_anterior) !== parseFloat(mov.precio_compra_nuevo);
  return true; 
});

  const handleCloseRequest = () => {
    if (hayCambiosSinGuardar()) {
      setIsExitModalOpen(true);
    } else {
      onClose();
    }
  };

  const validarYConfirmar = () => {
    if (!usuarioLogueado || !usuarioLogueado.id) return toast.error("Error de sesión.");

    if (modo === 'reabastecer') {
      if (!nuevaCantidad || parseInt(nuevaCantidad) <= 0) return toast.warning("Ingresa una cantidad válida.");
      if (!motivo.trim()) return toast.warning("El motivo es obligatorio.");
      if (parseFloat(nuevoPrecioCompra) <= 0) return toast.warning("El costo debe ser mayor a 0.");
      
      // Validación de Seguridad Financiera
      if (parseFloat(nuevoPrecioVenta) <= parseFloat(nuevoPrecioCompra)) {
        return toast.error("¡Cuidado! Estás vendiendo al mismo precio o más barato que el costo.");
      }
    }
    setIsSaveModalOpen(true);
  };

  const ejecutarActualizacion = async () => {
    setLoading(true);
    try {
      // Parseamos la cantidad dependiendo de la unidad
      const cantidadNumerica = parseFloat(nuevaCantidad);
      const success = await onActualizar(producto.id, {
        stock_actual: modo === 'reabastecer' ? parseFloat(producto.stock_actual) + cantidadNumerica : producto.stock_actual,
        precio_compra: nuevoPrecioCompra,
        precio_venta: nuevoPrecioVenta, // <--- ENVIAMOS EL NUEVO PRECIO CALCULADO
        motivo: motivo,
        usuario_id: usuarioLogueado.id,
        factura_url_nueva: nuevaFactura,
        proveedor_id_movimiento: proveedorSeleccionado.id, // Enviamos quién surtió ESTA VEZ
        actualizar_proveedor_default: true // Opcional: Si quieres que este proveedor quede como el nuevo predeterminado
      });

      if (success) {
        toast.success("Inventario y Precios actualizados");
        setIsSaveModalOpen(false);
        onClose();
      }
    } catch (error) {
      toast.error("Error al procesar");
    } finally {
      setLoading(false);
    }
  };

  const getMensajeConfirmacion = () => {
  const gananciaNueva =
    (parseFloat(nuevoPrecioVenta) - parseFloat(nuevoPrecioCompra)).toFixed(2);

  return (
    "RESUMEN DE OPERACIÓN:\n\n" +
    `🏷️ Proveedor seleccionado: ${proveedorSeleccionado.nombre}\n` +
    `📄 Factura: ${nuevaFactura ? '✅ ADJUNTA' : '❌ NO SE SUBIÓ'}\n` +
    `📦 Stock: + ${nuevaCantidad || 0} unidades\n` +
    `💰 Nuevo Costo: $${nuevoPrecioCompra}\n` +
    `🏷️ Nuevo Precio Venta: $${nuevoPrecioVenta}\n` +
    `📈 Ganancia Estimada: $${gananciaNueva} por pieza\n\n` +
    `Operado por: ${usuarioLogueado?.nombre_completo || 'Desconocido'}`
  );
};


  // --- FUNCIÓN PARA LIMPIAR EL FORMULARIO ---
  const limpiarReabastecimiento = () => {
    if (deleteToken) eliminarImagenDeCloudinary();
    // Restauramos los precios originales del producto
    setNuevoPrecioCompra(producto.precio_compra);
    setNuevoPrecioVenta(producto.precio_venta);
    
    // Recalculamos el margen original para que coincida visualmente
    const margenOriginal = producto.precio_compra > 0 
      ? (((producto.precio_venta - producto.precio_compra) / producto.precio_compra) * 100).toFixed(0) 
      : 30;
    setMargenDeseado(margenOriginal);

    // Limpiamos los campos de entrada
    setNuevaCantidad("");
    setMotivo("");
    setNuevaFactura(null);
    
    toast.info("Formulario reiniciado");
  };

  // NUEVOS ESTADOS PARA GESTIÓN MULTI-PROVEEDOR
  const [listaProveedores, setListaProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState({
      id: producto.proveedor_id, // Asumiendo que viene en el producto
      nombre: producto.nombre_proveedor || producto.proveedor || "Sin Asignar",
      telefono: producto.telefono_proveedor || ""
  });

  // CARGAR PROVEEDORES AL INICIAR
  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/proveedores');
        if(res.ok) {
           const data = await res.json();
           setListaProveedores(data);
        }
      } catch (err) {
        console.error("Error cargando proveedores", err);
      }
    };
    cargarProveedores();
  }, []);

  // CUANDO CAMBIA EL PROVEEDOR EN EL SELECT
  const manejarCambioProveedor = (e) => {
     const idProv = e.target.value;
     const provObj = listaProveedores.find(p => p.id.toString() === idProv.toString());
     if(provObj) {
        setProveedorSeleccionado({
           id: provObj.id,
           nombre: provObj.nombre_empresa || provObj.nombre,
           telefono: provObj.telefono
        });
        // Opcional: Si el proveedor cambia, quizás el costo sugerido también debería resetearse o buscarse
        toast.info(`Proveedor cambiado a: ${provObj.nombre_empresa || provObj.nombre}`);
     }
  };

  const eliminarImagenDeCloudinary = async () => {
    if (deleteToken) {
      const toastId = toast.loading("Eliminando archivo incorrecto...");
      try {
        const formData = new FormData();
        formData.append('token', deleteToken);
        
        // Llamada directa a la API de limpieza de Cloudinary
        await fetch(`https://api.cloudinary.com/v1_1/djorynixa/delete_by_token`, {
          method: 'POST',
          body: formData
        });
        
        toast.success("Espacio liberado", { id: toastId });
      } catch (error) {
        console.error("No se pudo eliminar de la nube", error);
        // No mostramos error al usuario para no asustar, pero logueamos
      }
    }
    // Limpiamos los estados locales
    setNuevaFactura(null);
    setDeleteToken(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-130 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg  shadow-2xl flex flex-col animate-in zoom-in duration-300 max-h-[95vh] overflow-hidden">
        
        {/* CABECERA */}
        <div className="p-8 pb-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Centro de Rentabilidad</p>
            <h2 className="text-2xl font-black text-gray-800 uppercase leading-tight">{producto.nombre_tecnico}</h2>
            <div className="flex gap-2 mt-1">
                <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                  {producto.alias_comun || 'Sin Alias'}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">ID: {producto.codigo_barras}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-gray-400 uppercase">Stock Actual</p>
            <p className="text-2xl font-black text-gray-900">{producto.stock_actual}</p>
          </div>
          <button onClick={handleCloseRequest} className="text-gray-300 hover:text-red-500 text-2xl transition-colors">✕</button>
        </div>

        {/* TABS */}
        <div className="flex bg-gray-100 p-1 mx-8 mt-4 rounded-2xl">
          {[
            { id: 'detalle', label: 'Análisis', color: 'text-blue-700' },
            { id: 'reabastecer', label: 'Reabastecer', color: 'text-green-700' },
            { id: 'historial', label: 'Historial', color: 'text-purple-700' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                if (hayCambiosSinGuardar()) {
                   toast.warning("Termina tu operación actual antes de cambiar.");
                } else {
                   setModo(tab.id);
                }
              }} 
              className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${modo === tab.id ? `bg-white shadow-sm ${tab.color}` : 'text-gray-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CUERPO */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          
          {modo === 'reabastecer' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* --- NUEVA TARJETA DE PROVEEDOR (CONTACTO RÁPIDO) --- */}
                {/* --- TARJETA DE PROVEEDOR INTELIGENTE Y FUNCIONAL --- */}
                {/* --- TARJETA DE PROVEEDOR MULTI-FUENTE --- */}
                <div className="bg-purple-900 p-6 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden group transition-all hover:shadow-purple-200">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                   
                   <div className="flex justify-between items-start relative z-10">
                      <div className="w-full pr-4">
                        <p className="text-[9px] font-black text-purple-200 uppercase tracking-widest mb-1 flex items-center gap-2">
                           Proveedor de este pedido
                           {/* Indicador de cambio */}
                           {proveedorSeleccionado.nombre !== (producto.nombre_proveedor || "Sin Asignar") && (
                              <span className="bg-yellow-400 text-purple-900 text-[8px] px-1.5 rounded animate-pulse">CAMBIO</span>
                           )}
                        </p>
                        
                        {/* SELECTOR OCULTO PERO FUNCIONAL (TRUCO DE INGENIERÍA UI) */}
                        <div className="relative">
                           <select 
                              className="w-full bg-transparent text-xl font-black uppercase leading-none outline-none appearance-none cursor-pointer relative z-20 focus:text-purple-200 transition-colors"
                              value={proveedorSeleccionado.id || ""}
                              onChange={manejarCambioProveedor}
                           >
                              <option value="" className="text-black">-- Seleccionar --</option>
                              {listaProveedores.map(p => (
                                 <option key={p.id} value={p.id} className="text-black font-bold">
                                    {p.nombre_empresa || p.nombre}
                                 </option>
                              ))}
                           </select>
                           {/* Icono de flecha hacia abajo custom para indicar que es un menú */}
                           <div className="absolute top-1 right-0 z-10 pointer-events-none opacity-50">
                              ▼
                           </div>
                        </div>

                        {/* VISUALIZACIÓN DEL NÚMERO DEL SELECCIONADO */}
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] font-medium opacity-80">
                                {proveedorSeleccionado.telefono ? `📞 ${proveedorSeleccionado.telefono}` : '🚫 Sin teléfono'}
                            </span>
                        </div>
                      </div>
                      
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner">
                         <span className="text-2xl">🚛</span>
                      </div>
                   </div>

                   {/* BOTONES FUNCIONALES (Ahora operan sobre el proveedor SELECCIONADO) */}
                   <div className="flex gap-3 mt-5 relative z-10">
                      {proveedorSeleccionado.telefono ? (
                          <>
                            <a 
                                href={`tel:${proveedorSeleccionado.telefono}`}
                                className="flex-1 bg-white text-purple-900 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 hover:bg-gray-100"
                            >
                                📞 Llamar
                            </a>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(proveedorSeleccionado.telefono);
                                    toast.success(`Contacto de ${proveedorSeleccionado.nombre} copiado`);
                                }}
                                className="flex-1 bg-purple-800 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all border border-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                            >
                                📋 Copiar
                            </button>
                          </>
                      ) : (
                          <div className="w-full bg-purple-800/50 text-purple-300 py-3 rounded-xl text-[9px] font-bold uppercase text-center border border-purple-800 border-dashed">
                              Selecciona un proveedor con contacto
                          </div>
                      )}
                   </div>
                </div>
                {/* --------------------------------------------------- */}
                
                {/* PASO 1: CANTIDAD */}
                <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-black text-white text-[9px] font-black px-2 py-1 rounded-md uppercase">Paso 1</span>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">¿Cuántos llegaron?</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="0"
                      // SI ES METRO, PERMITE 0.01. SI ES PIEZA, SOLO 1.
                      step={permiteDecimales ? "0.01" : "1"}
                      className="w-full bg-transparent text-4xl font-black focus:outline-none text-gray-800"
                      placeholder="0"
                      value={nuevaCantidad}
                      onChange={(e) => { 
                          // Validación extra: No permitir negativos
                          if (parseFloat(e.target.value) >= 0 || e.target.value === '') {
                              setNuevaCantidad(e.target.value) 
                          }
                      }}
                      // Bloqueo físico de la tecla punto si no es decimal
                      onKeyDown={(e) => {
                          if (!permiteDecimales && (e.key === '.' || e.key === ',')) {
                              e.preventDefault();
                          }
                      }}
                    />
                    <span className="text-xl font-black text-gray-300 uppercase">
                        {producto.unidad_medida || 'PZS'}
                    </span>
                  </div>
                </div>

                {/* PASO 2: MOTOR FINANCIERO (MEJORADO CON COMPARATIVA Y GANANCIA) */}
                <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase">Paso 2</span>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Calculadora de Precios</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                        {/* COSTO */}
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase">Costo Nuevo ($)</label>
                                <span className="text-[8px] font-bold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                                    Actual: ${producto.precio_compra}
                                </span>
                            </div>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full bg-white p-3 rounded-xl font-bold text-gray-700 outline-none border border-blue-100 focus:border-blue-400 transition-colors"
                                value={nuevoPrecioCompra}
                                onChange={(e) => { if (e.target.value >= 0) setNuevoPrecioCompra(e.target.value) }}
                            />
                        </div>
                        
                        {/* MARGEN */}
                        <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Ganancia Deseada (%)</label>
                            <div className="flex items-center relative">
                                <input 
                                    type="number" 
                                    className="w-full bg-white p-3 rounded-xl font-bold text-blue-600 outline-none border border-blue-100 focus:border-blue-400 transition-colors"
                                    value={margenDeseado}
                                    onChange={(e) => setMargenDeseado(e.target.value)}
                                />
                                <span className="absolute right-3 text-gray-300 font-black">%</span>
                            </div>
                        </div>
                    </div>

                    {/* FLECHA INDICADORA */}
                    <div className="flex justify-center my-2 opacity-20">⬇</div>

                    {/* PRECIO FINAL SUGERIDO */}
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Precio Venta ($)</label>
                            <span className="text-[8px] font-bold text-blue-400 bg-white px-1.5 py-0.5 rounded border border-blue-50">
                                Actual: ${producto.precio_venta}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                             <input 
                                type="number" 
                                className="w-full bg-white p-4 rounded-2xl font-black text-xl text-green-600 outline-none border-2 border-green-100 focus:border-green-400 transition-colors"
                                value={nuevoPrecioVenta}
                                onChange={(e) => setNuevoPrecioVenta(e.target.value)}
                            />
                            {parseFloat(nuevoPrecioVenta) !== parseFloat(producto.precio_venta) && (
                                <span className="text-[8px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold uppercase animate-pulse">
                                    Cambia
                                </span>
                            )}
                        </div>
                        
                        {/* VISUALIZADOR DE GANANCIA NETA (NUEVO) */}
                        <div className="mt-3 bg-green-500/10 p-3 rounded-2xl border border-green-500/20 flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="text-[8px] font-black text-green-700 uppercase tracking-wide">Tu Ganancia Neta</span>
                                <span className="text-[8px] text-green-600 font-medium">Por cada pieza vendida</span>
                             </div>
                             <span className="text-lg font-black text-green-700">
                                +${(parseFloat(nuevoPrecioVenta || 0) - parseFloat(nuevoPrecioCompra || 0)).toFixed(2)}
                             </span>
                        </div>
                    </div>
                </div>

                {/* PASO 3: CONTEXTO */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="bg-gray-200 text-gray-600 text-[9px] font-black px-2 py-1 rounded-md uppercase">Paso 3</span>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Evidencia</p>
                    </div>
                    
                    <div className="flex gap-2 mb-2">
                        {['Reposición', 'Oferta Proveedor', 'Ajuste Precio'].map(m => (
                            <button key={m} onClick={() => setMotivo(m)} className={`text-[9px] px-3 py-2 rounded-xl font-bold transition-all ${motivo === m ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>{m}</button>
                        ))}
                    </div>
                    <textarea 
                        className="w-full p-4 bg-gray-50 rounded-3xl border border-gray-100 text-sm outline-none focus:ring-2 focus:ring-gray-200 min-h-20"
                        placeholder="Detalles adicionales..."
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                    />
                     {/* GESTOR DE EVIDENCIA (PREVIEW & ACCIONES) */}
                    {!nuevaFactura ? (
                        /* ESTADO 1: NO HAY FACTURA (BOTÓN DE SUBIDA) */
                        <button 
                            onClick={subirFacturaNueva}
                            className="w-full py-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">📎</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-500">Adjuntar Comprobante</span>
                        </button>
                    ) : (
                        /* ESTADO 2: FACTURA CARGADA (VISTA PREVIA Y CONTROLES) */
                        <div className="relative w-full h-32 rounded-3xl overflow-hidden border-2 border-green-500 shadow-lg group">
                            {/* IMAGEN DE FONDO (PREVIEW) */}
                            <img 
                                src={nuevaFactura} 
                                alt="Previsualización" 
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                            />
                            
                            {/* OVERLAY OSCURO */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

                            {/* ETIQUETA DE ESTADO */}
                            <div className="absolute top-0 left-0 bg-green-500 text-white text-[8px] font-black px-3 py-1 rounded-br-xl z-20">
                                LISTA PARA GUARDAR
                            </div>

                            {/* BOTONES DE ACCIÓN (FLOTANTES) */}
                            <div className="absolute inset-0 flex items-center justify-center gap-3 z-30">
                                <button 
                                    onClick={() => window.open(nuevaFactura, '_blank')}
                                    className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    title="Ver en grande"
                                >
                                    👁️
                                </button>
                                
                                {/* BOTÓN CAMBIAR: Llama a subirFacturaNueva, la cual ya incluye la lógica de borrar la anterior */}
                                <button 
                                    onClick={subirFacturaNueva} 
                                    className="w-8 h-8 bg-white text-yellow-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    title="Cambiar archivo (Borra el anterior)"
                                >
                                    🔄
                                </button>
                                
                                {/* BOTÓN ELIMINAR: Llama a eliminarImagenDeCloudinary */}
                                <button 
                                    onClick={eliminarImagenDeCloudinary}
                                    className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    title="Eliminar y liberar espacio"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* --- NUEVO BOTÓN DE LIMPIEZA --- */}
                <div className="pt-2">
                    <button 
                        onClick={limpiarReabastecimiento}
                        className="w-full py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        🗑️ Limpiar Formulario
                    </button>
                </div>
            </div>
          )}

          {/* MODO: HISTORIAL INTELIGENTE */}
          {modo === 'historial' && (
             <div className="space-y-4 animate-in fade-in duration-300 pb-6">
                
                {/* FILTROS RÁPIDOS */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { key: 'TODO', label: 'Todo' },
                    { key: 'ENTRADAS', label: 'Entradas' },
                    { key: 'PRECIOS', label: 'Cambios Costo' }
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setFiltroHistorial(f.key)}
                      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                        filtroHistorial === f.key 
                          ? 'bg-gray-800 text-white border-gray-800' 
                          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* LISTA VACÍA */}
                {historialFiltrado.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-4xl">
                    <p className="text-2xl mb-2">🕵️‍♂️</p>
                    <p className="text-gray-400 text-[10px] font-bold uppercase">
                      {historial.length === 0 ? "Sin registros previos" : "No hay resultados con este filtro"}
                    </p>
                  </div>
                )}

                {/* TIMELINE */}
                {historialFiltrado.map((mov) => (
                      <div key={mov.id} className="relative pl-6 border-l-2 border-gray-100 py-2 animate-in slide-in-from-bottom-2">
                          <div className={`absolute -left-1.5 top-3 w-3 h-3 rounded-full border-2 ${mov.tipo_movimiento === 'REABASTECIMIENTO' ? 'bg-green-500 border-green-100' : 'bg-white border-gray-300'}`}></div>
                          
                          <div className="bg-gray-50 p-5 rounded-4xl border border-gray-100 hover:shadow-md transition-shadow">
                              {/* Encabezado Tarjeta */}
                              <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                    mov.tipo_movimiento === 'REABASTECIMIENTO' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                      {mov.tipo_movimiento}
                                  </span>
                                  <span className="text-[9px] text-gray-400 font-bold tracking-tighter">
                                    {new Date(mov.fecha_movimiento).toLocaleDateString()}
                                    <span className="ml-1 opacity-50 font-normal">
                                       {new Date(mov.fecha_movimiento).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  </span>
                              </div>

                              <p className="text-xs font-bold text-gray-700 mb-3 italic">"{mov.motivo}"</p>
                              
                              {/* Datos Clave */}
                              <div className="flex gap-4 p-3 bg-white rounded-xl border border-gray-50">
                                  <div className="text-[9px]">
                                      <p className="text-gray-400 font-black uppercase mb-0.5">Stock</p>
                                      <p className="font-bold text-gray-800">
                                        {mov.cantidad_anterior} <span className="text-gray-300">→</span> {mov.cantidad_nueva}
                                      </p>
                                  </div>
                                  {/* Solo mostramos precio si hubo cambio o es reabastecimiento */}
                                  {(mov.tipo_movimiento === 'REABASTECIMIENTO' || mov.precio_compra_anterior !== mov.precio_compra_nuevo) && (
                                    <div className="text-[9px]">
                                        <p className="text-gray-400 font-black uppercase mb-0.5">Costo</p>
                                        <p className={`font-bold ${parseFloat(mov.precio_compra_nuevo) > parseFloat(mov.precio_compra_anterior) ? 'text-red-500' : 'text-blue-600'}`}>
                                          ${mov.precio_compra_nuevo}
                                        </p>
                                    </div>
                                  )}
                              </div>

                              {mov.factura_url_momento && mov.factura_url_momento !== 'EXPIRADA' && (
                                  <button onClick={() => window.open(mov.factura_url_momento, '_blank')} className="mt-3 w-full py-2 bg-white rounded-xl text-[8px] font-black text-blue-500 uppercase border border-blue-100 tracking-widest hover:bg-blue-50">
                                    Ver Factura 📄
                                  </button>
                              )}
                              
                              <p className="text-[7px] font-bold text-gray-300 uppercase mt-3 text-right tracking-widest">
                                {mov.nombre_usuario?.split(' ')[0] || 'Sistema'}
                              </p>
                          </div>
                      </div>
                ))}

                {/* BOTÓN CARGAR MÁS (Solo si hay más en el server) */}
                {hayMasHistorial && filtroHistorial === 'TODO' && (
                  <button 
                    onClick={() => obtenerHistorial(false)}
                    className="w-full py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    ⬇ Cargar movimientos anteriores
                  </button>
                )}
            </div>
          )}

          {/* MODO: DETALLE (Sin cambios) */}
          {modo === 'detalle' && (
             <div className="space-y-6 animate-in fade-in duration-300">
             <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 text-center">
                     <p className="text-[9px] font-black text-blue-400 uppercase mb-2 tracking-widest">Ganancia / Pza</p>
                     <p className="text-2xl font-black text-green-600">${(producto.precio_venta - producto.precio_compra).toFixed(2)}</p>
                 </div>
                 <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 text-center">
                     <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Valor Inventario</p>
                     <p className="text-2xl font-black text-gray-800">${(producto.precio_compra * producto.stock_actual).toFixed(2)}</p>
                 </div>
             </div>
             <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-xl mt-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 text-center">Archivo Digital</p>
                    <div className="flex gap-4">
                        
                        {/* 1. BOTÓN PRODUCTO (Lógica Inteligente) */}
                        {producto.imagen_url ? (
                            /* CASO A: SI TIENE FOTO */
                            <button 
                                onClick={() => window.open(producto.imagen_url, '_blank')} 
                                className="flex-1 bg-white/5 p-5 rounded-3xl hover:bg-white/10 transition-all text-center border border-white/5 group"
                            >
                                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">🖼️</span>
                                <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400 group-hover:text-white">FOTO</span>
                            </button>
                        ) : (
                            /* CASO B: NO TIENE FOTO (Aviso Guiado) */
                            <button 
                                onClick={() => toast.warning("Este producto no tiene imagen. Ve al botón 'Editar' en el listado principal para subir una.")} 
                                className="flex-1 bg-gray-800/50 p-5 rounded-3xl border border-gray-700 border-dashed flex flex-col items-center justify-center cursor-help group hover:bg-gray-800 transition-colors"
                            >
                                <span className="text-2xl mb-1 opacity-50 group-hover:opacity-100 transition-opacity">🚫</span>
                                <span className="text-[8px] font-black uppercase text-gray-600 text-center leading-tight group-hover:text-gray-400">Sin Imagen</span>
                            </button>
                        )}

                        {/* 2. BOTÓN FACTURA (Siempre muestra la vigente/última) */}
                        {producto.factura_url ? (
                            <button 
                                onClick={() => window.open(producto.factura_url, '_blank')} 
                                className="flex-1 bg-green-500/20 p-5 rounded-3xl hover:bg-green-500/30 transition-all text-center border border-green-500/30 group relative overflow-hidden"
                            >
                                {/* Indicador de "Vivo" */}
                                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                                
                                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">🧾</span>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-tighter text-green-400 group-hover:text-green-200">Factura Vigente</span>
                                    <span className="text-[7px] font-bold text-green-600 uppercase mt-1">(Última subida)</span>
                                </div>
                            </button>
                        ) : (
                            /* ESTADO VACÍO FACTURA */
                            <div className="flex-1 bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center opacity-50">
                                <span className="text-2xl mb-1 grayscale">🚫</span>
                                <span className="text-[8px] font-black uppercase text-gray-500 text-center leading-tight">Sin Factura</span>
                            </div>
                        )}
                    </div>
                </div>
         </div>
          )}
        </div>

        {/* PIE DE MODAL */}
        <div className="p-8 border-t border-gray-100 bg-white">
          <button 
            onClick={validarYConfirmar} 
            disabled={!hayCambiosSinGuardar() || loading} 
            className={`w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.25em] shadow-xl transition-all ${
              !hayCambiosSinGuardar() || loading 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                : 'bg-gray-900 text-white active:scale-95'
            }`}
          >
            {loading ? 'Procesando...' : 'Guardar y Actualizar'}
          </button>
        </div>
      </div>

      {/* --- MODALES AUXILIARES --- */}
      <ModalConfirmacionSimple 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={ejecutarActualizacion}
        titulo="¿Confirmar Actualización?"
        mensaje={getMensajeConfirmacion()} 
        textoBotonConfirmar="Sí, registrar operación"
      />

      <ModalConfirmacionSimple 
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={onClose} 
        titulo="¿Salir sin guardar?"
        mensaje="Tienes datos capturados en el reabastecimiento. Si sales ahora, se perderán los cálculos."
        textoBotonConfirmar="Sí, descartar"
      />
    </div>
  );
}