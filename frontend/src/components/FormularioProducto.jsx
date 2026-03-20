import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// --- IMPORTAMOS LOS NUEVOS COMPONENTES DIVIDIDOS ---
import SeccionInfo from './formulario/SeccionInfo';
import SeccionFinanzas from './formulario/SeccionFinanzas';
import SeccionInventario from './formulario/SeccionInventario';
import SeccionMultimedia from './formulario/SeccionMultimedia';
import BarraAcciones from './formulario/BarraAcciones';
import ModalResumen from './formulario/ModalResumen';
import ModalConfirmacionSimple from './ModalConfirmacionSimple';

export default function FormularioProducto({ alGuardar, irAInventario, setPestana, registradoPor }) {
  // --- ESTADOS Y LÓGICA (Se mantienen intactos) ---
  const [isResumenOpen, setIsResumenOpen] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [errores, setErrores] = useState({});
  const [esPaquete, setEsPaquete] = useState(false);
  const [datosPaquete, setDatosPaquete] = useState({ costo_total: '', piezas: '' });

  const estadoInicial = {
    codigo_barras: '', nombre_tecnico: '', alias_comun: '', unidad_medida: 'Pieza', ubicacion: '', proveedor_id: '',
    stock_actual: '', stock_minimo: 2, precio_compra: '', precio_venta: '',
    categoria: 'Refacción', descripcion: '', notas: '', 
    imagenes: [], // <--- NUEVO ARRAY
    factura_url: '' // La factura se queda igual (una sola)
  };

  const [formData, setFormData] = useState(estadoInicial);
  const [margenDeseado, setMargenDeseado] = useState(30);
  const [isCancelarOpen, setIsCancelarOpen] = useState(false);
  const [deleteTokenFactura, setDeleteTokenFactura] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // --- EFECTOS (Cargas iniciales) ---
  useEffect(() => {
    fetch("http://localhost:3000/api/proveedores")
      .then(res => res.json())
      .then(data => setProveedores(data))
      .catch(() => toast.error("Error al cargar proveedores"));
      
    const datosTemporales = localStorage.getItem('registro_producto_pendiente');
    if (datosTemporales) {
      setFormData(JSON.parse(datosTemporales));
      localStorage.removeItem('registro_producto_pendiente');
      toast.info("Continuando con el registro...");
    }
  }, []);

  // --- LÓGICA DE VALIDACIÓN Y MANEJO DE DATOS ---
  const validar = async (name, value) => {
    let msg = "";
    if (['precio_compra', 'precio_venta', 'stock_actual'].includes(name)) {
      if (parseFloat(value) < 0) msg = "⚠️ No se permiten números negativos.";
      if (name === 'stock_actual' && parseFloat(value) <= 0) msg = "⚠️ El stock debe ser al menos 1.";
    }
    if (name === 'precio_venta' && parseFloat(value) <= parseFloat(formData.precio_compra)) {
        msg = "⚠️ Alerta: Precio venta menor al costo.";
    }
    if (name === 'stock_actual') {
        if (parseFloat(value) < 0) msg = "⚠️ No negativo";
        // Eliminamos la validación de "solo enteros" si la tenías, 
        // o la condicionamos:
        if (formData.unidad_medida === 'Pieza' && value.includes('.')) {
             // Opcional: Advertencia si intentan poner 1.5 bujías
             // msg = "⚠️ Las piezas suelen ser enteras."; 
        }
    }
    if ((name === 'nombre_tecnico' || name === 'codigo_barras') && value.length > 2) {
      try {
        const res = await fetch(`http://localhost:3000/api/productos/verificar?columna=${name}&valor=${value}`);
        const data = await res.json();
        if (data.existe) msg = `🚫 Ya existe un producto con este ${name.replace('_', ' ')}.`;
      } catch (e) { console.error(e); }
    }
    setErrores(prev => ({ ...prev, [name]: msg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validar(name, value);
  };

  // --- LÓGICA FINANCIERA ---
  const handleCambioCosto = (e) => {
    const costo = parseFloat(e.target.value);
    setFormData(prev => ({ ...prev, precio_compra: e.target.value }));
    if (!isNaN(costo) && costo >= 0) {
       const precioSugerido = costo * (1 + (margenDeseado / 100));
       setFormData(prev => ({ ...prev, precio_compra: e.target.value, precio_venta: precioSugerido.toFixed(2) }));
    }
    validar('precio_compra', e.target.value);
  };

  const handleCambioMargen = (e) => {
    const margen = parseFloat(e.target.value);
    setMargenDeseado(e.target.value);
    const costo = parseFloat(formData.precio_compra);
    if (!isNaN(margen) && !isNaN(costo)) {
       const precioSugerido = costo * (1 + (margen / 100));
       setFormData(prev => ({ ...prev, precio_venta: precioSugerido.toFixed(2) }));
    }
  };

  const handleCambioPrecioVenta = (e) => {
    const venta = parseFloat(e.target.value);
    setFormData(prev => ({ ...prev, precio_venta: e.target.value }));
    const costo = parseFloat(formData.precio_compra);
    if (!isNaN(venta) && !isNaN(costo) && costo > 0) {
       const margenReal = ((venta - costo) / costo) * 100;
       setMargenDeseado(margenReal.toFixed(1));
    }
    validar('precio_venta', e.target.value);
  };

  const calcularUnitarioDesdePaquete = (e) => {
      const { name, value } = e.target;
      const nuevosDatos = { ...datosPaquete, [name]: value };
      setDatosPaquete(nuevosDatos);
      if (nuevosDatos.costo_total && nuevosDatos.piezas && parseFloat(nuevosDatos.piezas) > 0) {
          const costoUnitario = parseFloat(nuevosDatos.costo_total) / parseFloat(nuevosDatos.piezas);
          handleCambioCosto({ target: { value: costoUnitario.toFixed(2) } }); 
          setFormData(prev => ({ ...prev, stock_actual: nuevosDatos.piezas, precio_compra: costoUnitario.toFixed(2) }));
      }
  };

  // --- LÓGICA DE IMÁGENES (Cloudinary) ---
  const eliminarDeCloudinary = async (token) => {
      if (!token) return;
      const fd = new FormData(); fd.append('token', token);
      await fetch(`https://api.cloudinary.com/v1_1/djorynixa/delete_by_token`, { method: 'POST', body: fd });
  };

  // Función específica para eliminar UNA foto de la lista
  const eliminarFotoProducto = async (index) => {
      const imagen = formData.imagenes[index];
      if (imagen.token) {
          await eliminarDeCloudinary(imagen.token);
          toast.info("Imagen eliminada");
      }
      
      // Filtramos el array para quitar la foto borrada
      const nuevasImagenes = formData.imagenes.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, imagenes: nuevasImagenes }));
  };

  const abrirWidget = (tipo, setToken, setUrl) => { // setToken y setUrl se usan solo para factura ahora
    
    // VALIDACIÓN DE LÍMITE (Solo para productos)
    if (tipo === 'producto' && formData.imagenes.length >= 3) {
        return toast.warning("Máximo 3 imágenes permitidas");
    }

    const preset = tipo === 'producto' ? 'producto_eco' : 'factura_ultra_eco';

    window.cloudinary.openUploadWidget(
      {
        cloudName: 'djorynixa',
        uploadPreset: preset,
        sources: ['local', 'camera'],
        multiple: false, // Mantenemos false para que suba de 1 en 1 y controle el array
        maxFiles: 1,
        return_delete_token: true,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        cropping: tipo === 'producto', // Solo recortamos productos
      },
      (error, result) => {
        if (!error && result?.event === 'success') {
          
          if (tipo === 'producto') {
              // AGREGAMOS AL ARRAY
              const nuevaImg = {
                  url: result.info.secure_url,
                  token: result.info.delete_token
              };
              setFormData(prev => ({
                  ...prev,
                  imagenes: [...prev.imagenes, nuevaImg]
              }));
              toast.success(`Imagen ${formData.imagenes.length + 1}/3 agregada`);
          } else {
              // LÓGICA FACTURA (REEMPLAZO)
              if (deleteTokenFactura) eliminarDeCloudinary(deleteTokenFactura);
              setFormData(prev => ({ ...prev, factura_url: result.info.secure_url }));
              setDeleteTokenFactura(result.info.delete_token);
              toast.success("Factura vinculada");
          }
        }
      }
    );
  };


  const getThumbnailUrl = (url) => {
  if (!url) return '';
  return url.replace(
    '/upload/',
    '/upload/f_auto,q_auto:eco,w_600,h_600,c_contain/'
  );
};


  // --- ACCIONES GENERALES ---
  const irANuevoProveedor = () => {
    localStorage.setItem('registro_producto_pendiente', JSON.stringify(formData));
    setPestana('proveedores'); 
  };

  // 3. LIMPIEZA AL CANCELAR (Iterar sobre el array)
  const procederConCancelacion = async () => {
      // Borrar todas las fotos de productos
      for (const img of formData.imagenes) {
          if (img.token) await eliminarDeCloudinary(img.token);
      }
      // Borrar factura
      if (deleteTokenFactura) await eliminarDeCloudinary(deleteTokenFactura);
      
      setFormData(estadoInicial);
      setDeleteTokenFactura(null); 
      setErrores({});
      setIsCancelarOpen(false);
      toast.info("Formulario reiniciado");
  };

  const abrirConfirmacionCancelar = () => {
      if (JSON.stringify(formData) === JSON.stringify(estadoInicial)) {
          toast.info("El formulario ya está limpio."); return;
      }
      setIsCancelarOpen(true);
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (Object.values(errores).some(m => m?.includes("🚫"))) return toast.error("Corrige los errores");
    setIsResumenOpen(true);
  };

  const confirmarGuardadoFinal = async () => {
    setGuardando(true);
    const exito = await alGuardar({ ...formData, registrado_por_id: registradoPor?.id });
    if (exito) {
      toast.success(`Producto registrado con éxito`);
      setFormData(estadoInicial); setErrores({}); setIsResumenOpen(false);
      setDeleteTokenProducto(null); setDeleteTokenFactura(null);
    }
    setGuardando(false);
  };

  const getPreviewUrl = (url) => {
  if (!url) return '';
  return url.replace(
    '/upload/',
    '/upload/f_auto,q_auto,w_1200/'
  );
};


 // --- RENDERIZADO RESPONSIVO ---
  return (
    <form 
      onSubmit={handlePreSubmit} 
      className="w-full bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl border border-gray-200 transition-all duration-300"
    >
        {/* ENCABEZADO */}
        <div className="mb-8 border-b border-gray-100 pb-6">
           <h2 className="text-2xl sm:text-3xl font-black text-gray-800 uppercase tracking-tighter">
             {formData.id ? 'Editar Producto' : 'Registro de Inventario'}
           </h2>
           <p className="text-sm font-medium text-gray-400 mt-1">Ficha técnica y financiera del producto.</p>
        </div>

        {/* GRID MAGISTRAL: 
           - Móvil: 1 columna
           - PC: 2 columnas (Info a la izquierda, Dinero a la derecha)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* COLUMNA IZQUIERDA: Identidad y Fotos */}
          <div className="space-y-8">
            <SeccionInfo 
               formData={formData} 
               handleChange={handleChange} 
               errores={errores} 
               irAInventario={irAInventario} 
            />

            <SeccionMultimedia 
               formData={formData}
               abrirWidgetProducto={() => abrirWidget('producto')}
               eliminarFotoProducto={eliminarFotoProducto} // Pasamos la función que acepta índice
               abrirWidgetFactura={() => abrirWidget('factura', setDeleteTokenFactura, (url) => setFormData(p => ({...p, factura_url: url})))}
               eliminarFactura={() => { eliminarDeCloudinary(deleteTokenFactura); setFormData(p => ({...p, factura_url: ''})); }}
               getThumbnailUrl={getThumbnailUrl}
               getPreviewUrl={getPreviewUrl}
            />
          </div>

          {/* COLUMNA DERECHA: Dinero e Inventario */}
          <div className="space-y-8">
            <SeccionFinanzas 
               formData={formData} 
               handleCambioCosto={handleCambioCosto}
               handleCambioMargen={handleCambioMargen}
               handleCambioPrecioVenta={handleCambioPrecioVenta}
               errores={errores}
               margenDeseado={margenDeseado}
               esPaquete={esPaquete}
               setEsPaquete={setEsPaquete}
               datosPaquete={datosPaquete}
               calcularUnitarioDesdePaquete={calcularUnitarioDesdePaquete}
            />

            <SeccionInventario 
               formData={formData}
               handleChange={handleChange}
               errores={errores}
               esPaquete={esPaquete}
               proveedores={proveedores}
               irANuevoProveedor={irANuevoProveedor}
            />
          </div>
        </div>

        {/* PIE DE PÁGINA: Botones */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <BarraAcciones 
             abrirConfirmacionCancelar={abrirConfirmacionCancelar} 
             guardando={guardando} 
             errores={errores} 
             registradoPor={registradoPor}
          />
        </div>

        {/* MODALES */}
        <ModalResumen 
           isOpen={isResumenOpen} 
           onClose={() => setIsResumenOpen(false)} 
           onConfirm={confirmarGuardadoFinal} 
           formData={formData} 
           proveedores={proveedores} 
           guardando={guardando}
        />

        <ModalConfirmacionSimple 
          isOpen={isCancelarOpen}
          onClose={() => setIsCancelarOpen(false)}
          onConfirm={procederConCancelacion}
          titulo="¿Cancelar Registro?"
          mensaje="Se perderán todos los datos capturados y tendrás que empezar de nuevo."
          textoBotonConfirmar="Sí, borrar todo"
        />
    </form>
  );
}