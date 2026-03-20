import { useState } from 'react';
import { toast } from 'sonner';
import ModalConfirmacionSimple from './ModalConfirmacionSimple';

export default function ModalEdicionProducto({ producto, onClose, onActualizar, onEliminar, usuarioLogueado }) {
  
  // 1. PREPARACIÓN DE IMÁGENES EXISTENTES
  // Convertimos lo que venga de la BD (JSON, Array o String simple) en un Array estandarizado
  const getImagenesIniciales = () => {
      let imgs = [];
      try {
          if (producto.galeria_imagenes) {
              // Si viene como string JSON (PostgreSQL a veces lo devuelve así), lo parseamos
              imgs = typeof producto.galeria_imagenes === 'string' 
                  ? JSON.parse(producto.galeria_imagenes) 
                  : producto.galeria_imagenes;
          } else if (producto.imagen_url) {
              // Retrocompatibilidad: Si solo tiene imagen principal, la metemos al array
              imgs = [{ url: producto.imagen_url }];
          }
      } catch (e) { console.error("Error parseando imágenes", e); }
      return imgs || [];
  };

  const valoresIniciales = {
    nombre_tecnico: producto.nombre_tecnico,
    alias_comun: producto.alias_comun || '',
    categoria: producto.categoria,
    ubicacion: producto.ubicacion || '',
    descripcion: producto.descripcion || '',
    imagenes: getImagenesIniciales() // <--- AHORA USAMOS ARRAY
  };

  const [formData, setFormData] = useState(valoresIniciales);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false);

  // Helper para mostrar miniaturas optimizadas
  const getThumbnailUrl = (url) => {
    if (!url) return '';
    return url.replace('/upload/', '/upload/f_auto,q_auto:eco,w_300,c_scale/');
  };

  // Detección de cambios (Comparamos strings JSON para profundidad)
  const hayCambios = JSON.stringify(formData) !== JSON.stringify(valoresIniciales);

  // --- LÓGICA CLOUDINARY (Gestión de Array) ---
  
  const eliminarDeCloudinary = async (token) => {
      if (!token) return;
      const fd = new FormData(); fd.append('token', token);
      await fetch(`https://api.cloudinary.com/v1_1/djorynixa/delete_by_token`, { method: 'POST', body: fd });
  };

  const agregarImagen = () => {
    // Validación de límite
    if (formData.imagenes.length >= 3) return toast.warning("Máximo 3 imágenes permitidas");

    window.cloudinary.openUploadWidget({
      cloudName: 'djorynixa', 
      uploadPreset: 'producto_eco',
      sources: ['local', 'camera'],
      multiple: false,
      cropping: true,
      return_delete_token: true 
    }, (error, result) => {
      if (!error && result && result.event === "success") { 
        // Agregamos al array existente
        const nuevaImg = { url: result.info.secure_url, token: result.info.delete_token };
        setFormData(prev => ({ ...prev, imagenes: [...prev.imagenes, nuevaImg] }));
        toast.success("Imagen agregada a la galería");
      }
    });
  };

  const eliminarImagenEspecifica = async (index) => {
      const imagen = formData.imagenes[index];
      
      // Si es una imagen recién subida (tiene token), la borramos de la nube ya mismo
      if (imagen.token) {
          await eliminarDeCloudinary(imagen.token);
          toast.info("Imagen temporal eliminada");
      }

      // La sacamos del array visual
      const nuevasImagenes = formData.imagenes.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, imagenes: nuevasImagenes }));
  };

  // --- CIERRE SEGURO ---
  const handleCloseSafe = async () => {
    // Si el usuario subió fotos nuevas (tienen token) pero cancela, hay que borrarlas para no dejar basura
    const fotosNuevas = formData.imagenes.filter(img => img.token);
    for (const img of fotosNuevas) {
        await eliminarDeCloudinary(img.token);
    }
    onClose();
  };

  const handleGuardar = async () => {
    const idCarga = toast.loading("Actualizando catálogo...");
    
    // Enviamos 'imagenes' al backend (tu controlador ya sabe manejarlo)
    const exito = await onActualizar(producto.id, {
      ...formData,
      usuario_id: usuarioLogueado?.id,
      motivo: "Actualización de identidad y multimedia"
    });

    if (exito) {
      toast.success("¡Producto actualizado!", { id: idCarga });
      onClose();
    } else {
      toast.error("Error al guardar", { id: idCarga });
    }
  };

  // --- ELIMINAR PRODUCTO (Igual que antes) ---
  const handleEliminarProducto = async () => {
    const toastId = toast.loading("Procesando...");
    try {
      const res = await fetch(`http://localhost:3000/api/productos/${producto.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        if (data.tipo === 'ARCHIVADO') {
          toast.success("Producto ARCHIVADO", { id: toastId, description: "Se ocultó del inventario." });
        } else {
          toast.success("Producto ELIMINADO", { id: toastId, description: "Borrado permanente." });
        }
        if (onEliminar) onEliminar(); 
        onClose(); 
      } else {
        toast.error("No se pudo eliminar", { id: toastId, description: data.error });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión", { id: toastId });
    }
    setIsDeleteProductOpen(false);
  };

  return (
    <div className="fixed inset-0 z-120 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 sm:p-10 shadow-2xl animate-in zoom-in duration-300 overflow-y-auto max-h-[95vh]">
        
        {/* HEADER */}
        <header className="mb-8 border-b border-gray-100 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white p-3 rounded-2xl text-xl shadow-lg shadow-blue-200">📝</span>
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">Editor de Identidad</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modifica la base del producto</p>
            </div>
          </div>
          <button onClick={handleCloseSafe} className="text-gray-300 hover:text-red-500 text-2xl transition-colors font-bold">✕</button>
        </header>

        <div className="space-y-6">
          
          {/* SECCIÓN 1: GALERÍA DE FOTOS (NUEVO DISEÑO) */}
          <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-3xl border border-gray-100">
             <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Galería Multimedia</label>
                <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${formData.imagenes.length === 3 ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                    {formData.imagenes.length} / 3
                </span>
             </div>

             {/* GRID DE IMÁGENES */}
             <div className="grid grid-cols-3 gap-3 h-28 w-full">
                
                {/* 1. RENDERIZAR EXISTENTES */}
                {formData.imagenes.map((img, index) => (
                    <div key={index} className="relative group rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white">
                        <img 
                            src={getThumbnailUrl(img.url)} 
                            className="w-full h-full object-cover" 
                            alt="Producto"
                        />
                        {/* Etiqueta Principal */}
                        {index === 0 && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-[6px] font-black px-1.5 py-0.5 rounded shadow-sm z-10">
                                PRINCIPAL
                            </div>
                        )}
                        {/* Botón Borrar */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                onClick={() => eliminarImagenEspecifica(index)}
                                className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                                title="Eliminar foto"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}

                {/* 2. BOTÓN AGREGAR (Si hay espacio) */}
                {formData.imagenes.length < 3 && (
                    <button 
                        type="button"
                        onClick={agregarImagen}
                        className="h-full w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all flex flex-col items-center justify-center group"
                    >
                        <span className="text-2xl opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all">📷</span>
                        <span className="text-[7px] font-black text-gray-400 group-hover:text-blue-500 uppercase mt-1">
                            {formData.imagenes.length === 0 ? 'Principal' : 'Agregar'}
                        </span>
                    </button>
                )}
                
                {/* 3. RELLENO (Estética) */}
                {formData.imagenes.length === 0 && (
                    <>
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-100/50 opacity-30"></div>
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-100/50 opacity-30"></div>
                    </>
                )}
             </div>
          </div>

          {/* SECCIÓN 2: IDENTIFICACIÓN */}
          <div className="space-y-3">
            <div className="group">
              <label className="text-[9px] font-black text-blue-600 uppercase ml-3 mb-1 block">Nombre Técnico Oficial</label>
              <input 
                className="w-full p-4 bg-blue-50/50 rounded-2xl font-bold text-gray-700 outline-none border-2 border-transparent focus:border-blue-500 transition-all placeholder:text-blue-200"
                value={formData.nombre_tecnico}
                onChange={e => setFormData({...formData, nombre_tecnico: e.target.value})}
                placeholder="Ej. Kit de Arrastre Racing"
              />
            </div>

            {/* GRID PARA ALIAS Y UBICACIÓN */}
            <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-3 mb-1 block">Alias</label>
                  <input 
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs uppercase text-blue-800 outline-none border-2 border-transparent focus:border-gray-200 focus:bg-white transition-all"
                    value={formData.alias_comun}
                    onChange={e => setFormData({...formData, alias_comun: e.target.value})}
                    placeholder="Ej. KIT PULSAR"
                  />
                </div>

                <div className="group">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-3 mb-1 flex items-center gap-1">
                     <span>📍</span> Ubicación
                  </label>
                  <input 
                    className="w-full p-4 bg-yellow-50/50 rounded-2xl font-bold text-xs uppercase text-gray-800 outline-none border-l-4 border-l-yellow-400 border-y-2 border-r-2 border-transparent focus:border-yellow-400 focus:bg-white transition-all placeholder:text-yellow-600/30"
                    value={formData.ubicacion}
                    onChange={e => setFormData({...formData, ubicacion: e.target.value})}
                    placeholder="Ej. Estante 3"
                  />
                </div>
            </div>
          </div>

          {/* SECCIÓN 3: CLASIFICACIÓN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase ml-3 mb-1 block">Categoría</label>
              <select 
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs outline-none border-2 border-transparent focus:border-gray-200 cursor-pointer"
                value={formData.categoria}
                onChange={e => setFormData({...formData, categoria: e.target.value})}
              >
                <option value="Refacción">Refacción</option>
                <option value="Aceite">Aceite</option>
                <option value="Accesorio">Accesorio</option>
                <option value="Mano de Obra">Servicio</option>
              </select>
            </div>

            <div>
               <label className="text-[9px] font-black text-gray-400 uppercase ml-3 mb-1 block">Proveedor Actual</label>
               <div className="w-full p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-2 overflow-hidden">
                  <span className="text-lg">🚛</span>
                  <span className="font-bold text-[10px] text-purple-700 uppercase truncate" title={producto.nombre_proveedor}>
                    {producto.nombre_proveedor || producto.proveedor || 'Sin Asignar'}
                  </span>
               </div>
            </div>
          </div>

          {/* SECCIÓN 4: DESCRIPCIÓN */}
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase ml-3 mb-1 block">Descripción Técnica</label>
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-2xl font-medium text-sm outline-none min-h-25 resize-none border-2 border-transparent focus:border-gray-200 focus:bg-white transition-all"
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Detalles de compatibilidad, medidas, marca..."
            />
          </div>
        </div>

        {/* ZONA DE PELIGRO */}
        <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">⚠️ Zona de Peligro</p>
            <div className="bg-red-50 p-5 rounded-3xl border border-red-100 flex justify-between items-center">
                <div className="pr-4">
                    <h4 className="font-bold text-red-900 text-sm">Eliminar Producto</h4>
                    <p className="text-[9px] text-red-700/70 mt-1 leading-tight">Si tiene historial, se archivará. Si es nuevo, se borra.</p>
                </div>
                <button onClick={() => setIsDeleteProductOpen(true)} className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-sm">Eliminar</button>
            </div>
        </div>

        {/* ACCIONES FINALES */}
        <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-gray-100">
          <button 
            disabled={!hayCambios}
            onClick={() => setIsConfirmOpen(true)}
            className={`w-full py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl transition-all ${hayCambios ? 'bg-blue-600 text-white shadow-blue-200 active:scale-95 hover:bg-blue-700' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
          >
            {hayCambios ? 'Confirmar Cambios' : 'No hay cambios pendientes'}
          </button>
          
          <button onClick={handleCloseSafe} className="py-2 font-black text-red-400 uppercase text-[9px] tracking-widest hover:text-red-500 transition-colors">
            Descartar y Salir
          </button>
        </div>
      </div>

      <ModalConfirmacionSimple 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleGuardar}
        titulo="¿Guardar Identidad?"
        mensaje="Se actualizará la ficha técnica del producto."
        textoBotonConfirmar="Sí, actualizar"
      />

      <ModalConfirmacionSimple 
        isOpen={isDeleteProductOpen}
        onClose={() => setIsDeleteProductOpen(false)}
        onConfirm={handleEliminarProducto}
        titulo="¿Eliminar este Producto?"
        mensaje={`Estás a punto de eliminar "${producto.nombre_tecnico}".`}
        textoBotonConfirmar="Sí, Eliminar"
        estiloBoton="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
}