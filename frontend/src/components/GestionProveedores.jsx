import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ModalConfirmacionSimple from './ModalConfirmacionSimple';

// --- API FUNCTIONS (Sin cambios) ---
const fetchProveedores = async () => {
    const res = await fetch("http://localhost:3000/api/proveedores");
    if (!res.ok) throw new Error("Error cargando proveedores");
    return res.json();
};

const postProveedor = async (data) => {
    const res = await fetch("http://localhost:3000/api/proveedores", {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error creando proveedor");
    return res.json();
};

const putProveedor = async ({ id, data }) => {
    const res = await fetch(`http://localhost:3000/api/proveedores/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error actualizando proveedor");
    return res.json();
};

const deleteProveedor = async (id) => {
    const res = await fetch(`http://localhost:3000/api/proveedores/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Error eliminando proveedor");
    return res.json();
};

export default function GestionProveedores({ onFinalizar, modoPicker = false }) {
    const queryClient = useQueryClient();
    
    // Estados
    const [busqueda, setBusqueda] = useState('');
    const [formulario, setFormulario] = useState({ id: null, nombre: '', telefono: '', contacto_nombre: '' });
    const [modalEliminar, setModalEliminar] = useState({ open: false, id: null, nombre: '' });
    const [modalConfirmarEdicion, setModalConfirmarEdicion] = useState(false);

    // React Query
    const { data: proveedores = [], isLoading } = useQuery({
        queryKey: ['proveedores'], queryFn: fetchProveedores, staleTime: 1000 * 60 * 5,
    });

    // Mutaciones
    const crearMutacion = useMutation({
        mutationFn: postProveedor,
        onSuccess: () => {
            queryClient.invalidateQueries(['proveedores']);
            toast.success("Proveedor registrado");
            limpiarFormulario();
            if (onFinalizar) onFinalizar();
        },
        onError: () => toast.error("Error al registrar")
    });

    const actualizarMutacion = useMutation({
        mutationFn: putProveedor,
        onSuccess: () => {
            queryClient.invalidateQueries(['proveedores']);
            toast.success("Proveedor actualizado");
            limpiarFormulario();
            setModalConfirmarEdicion(false);
        },
        onError: () => toast.error("Error al actualizar")
    });

    const eliminarMutacion = useMutation({
        mutationFn: deleteProveedor,
        onSuccess: () => {
            queryClient.invalidateQueries(['proveedores']);
            toast.success("Proveedor eliminado");
            setModalEliminar({ open: false, id: null, nombre: '' });
        },
        onError: () => toast.error("No se puede eliminar (Tiene productos asociados)")
    });

    // Lógica
    const limpiarFormulario = () => setFormulario({ id: null, nombre: '', telefono: '', contacto_nombre: '' });

    const iniciarEdicion = (prov) => {
        setFormulario({
            id: prov.id,
            nombre: prov.nombre || prov.nombre_empresa,
            telefono: prov.telefono,
            contacto_nombre: prov.contacto_nombre
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.info("Modo Edición Activado");
    };

    const procesarFormulario = (e) => {
        e.preventDefault();
        if (formulario.telefono.length < 10) return toast.warning("Teléfono incompleto");

        // Validar duplicados
        const existeTelefono = proveedores.find(p => p.telefono === formulario.telefono && p.id !== formulario.id);
        if (existeTelefono) return toast.error(`El teléfono ya existe (${existeTelefono.nombre})`);

        const existeNombre = proveedores.find(p => p.nombre?.toLowerCase() === formulario.nombre.toLowerCase() && p.id !== formulario.id);
        if (existeNombre) return toast.warning(`Ya existe: ${existeNombre.nombre}`);

        if (formulario.id) {
            setModalConfirmarEdicion(true);
        } else {
            crearMutacion.mutate({
                nombre: formulario.nombre.toUpperCase(),
                telefono: formulario.telefono,
                contacto_nombre: formulario.contacto_nombre
            });
        }
    };

    const proveedoresFiltrados = proveedores.filter(p => 
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.contacto_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.telefono?.includes(busqueda)
    );

    // Estilo común de inputs
    const inputStyle = "w-full p-4 rounded-2xl outline-none transition-all duration-200 border-2 border-gray-300 bg-gray-100 text-gray-900 font-bold placeholder:text-gray-400 placeholder:font-semibold focus:bg-white focus:border-blue-600 focus:shadow-md";

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500 font-sans">
            
            {/* SECCIÓN 1: FORMULARIO INTELIGENTE */}
            <div className={`bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border-2 transition-all duration-300 ${formulario.id ? 'border-yellow-400 shadow-yellow-100' : 'border-gray-100 shadow-blue-50'}`}>
                
                {/* Encabezado del Formulario */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl shadow-sm ${formulario.id ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                            {formulario.id ? '✏️' : '🤝'}
                        </span>
                        <div>
                            <h2 className={`text-lg font-black uppercase tracking-tight leading-none ${formulario.id ? 'text-yellow-600' : 'text-blue-900'}`}>
                                {formulario.id ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {formulario.id ? formulario.nombre : 'Registra un socio comercial'}
                            </p>
                        </div>
                    </div>
                    {formulario.id && (
                        <button onClick={limpiarFormulario} className="text-[10px] font-black text-red-400 uppercase bg-red-50 border border-red-100 px-4 py-2 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors">
                            ✕ Cancelar
                        </button>
                    )}
                </div>

                <form onSubmit={procesarFormulario} className="space-y-4">
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase ml-2 mb-1 block">Nombre de la Empresa</label>
                        <input 
                            required 
                            placeholder="EJ. ITALIKA MÉXICO" 
                            className={`${inputStyle} uppercase text-lg`}
                            value={formulario.nombre} 
                            onChange={e => setFormulario({...formulario, nombre: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase ml-2 mb-1 block">Nombre del Contacto</label>
                            <input 
                                required 
                                placeholder="EJ. JUAN PÉREZ" 
                                className={inputStyle}
                                value={formulario.contacto_nombre} 
                                onChange={e => setFormulario({...formulario, contacto_nombre: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-500 uppercase ml-2 mb-1 block">Teléfono (WhatsApp)</label>
                            <div className="relative">
                                <input 
                                    required type="tel" maxLength={10} 
                                    placeholder="10 DÍGITOS"
                                    className={`${inputStyle} font-mono tracking-widest text-lg`}
                                    value={formulario.telefono} 
                                    onChange={e => { if (/^\d*$/.test(e.target.value)) setFormulario({...formulario, telefono: e.target.value}); }}
                                />
                                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black ${formulario.telefono.length === 10 ? 'text-green-500' : 'text-gray-400'}`}>
                                    {formulario.telefono.length}/10
                                </span>
                            </div>
                        </div>
                    </div>

                    <button className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all border-b-4 mt-2 ${formulario.id ? 'bg-yellow-500 border-yellow-700 text-white hover:bg-yellow-400' : 'bg-blue-600 border-blue-800 text-white hover:bg-blue-500'}`}>
                        {formulario.id ? 'Guardar Cambios' : 'Registrar Proveedor 🚀'}
                    </button>
                </form>
            </div>

            {/* SECCIÓN 2: DIRECTORIO DE CONTACTOS */}
            <div className="space-y-6">
                {/* Buscador Estilizado */}
                <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-blue-500 transition-colors">🔍</span>
                    <input 
                        placeholder="BUSCAR PROVEEDOR..." 
                        className="w-full pl-14 pr-6 py-5 bg-white rounded-4xl shadow-sm border-2 border-gray-100 outline-none focus:border-blue-500 focus:shadow-xl transition-all font-black text-gray-600 uppercase tracking-wide placeholder:text-gray-300"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>

                {/* Grid Responsivo de Tarjetas */}
                {isLoading ? (
                    <div className="text-center py-20 opacity-50 flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cargando Directorio...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {proveedoresFiltrados.map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => { if (modoPicker && onFinalizar) onFinalizar(p); }}
                                className={`
                                    bg-white p-6 rounded-4xl shadow-md border-2 border-gray-50 flex flex-col justify-between relative overflow-hidden group transition-all 
                                    ${modoPicker 
                                        ? 'cursor-pointer hover:border-blue-500 hover:shadow-blue-200 hover:scale-[1.02]' 
                                        : 'hover:border-blue-100 hover:shadow-xl'
                                    }
                                `}
                            >
                                {/* Decoración de fondo */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:bg-blue-50"></div>

                                <div>
                                    {/* Encabezado Tarjeta */}
                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${modoPicker ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-colors'}`}>
                                            {modoPicker ? '👆' : '🏢'}
                                        </div>
                                        
                                        {/* Botones Flotantes (Solo Desktop Hover o Móvil) */}
                                        {!modoPicker && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); iniciarEdicion(p); }} 
                                                    className="w-9 h-9 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-yellow-500 hover:text-white transition-all"
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setModalEliminar({ open: true, id: p.id, nombre: p.nombre }); }}
                                                    className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-all"
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Datos */}
                                    <h4 className="text-lg font-black text-gray-800 leading-tight uppercase mb-1 line-clamp-1" title={p.nombre}>{p.nombre || p.nombre_empresa}</h4>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        👤 {p.contacto_nombre || 'Sin contacto'}
                                    </p>
                                </div>

                                {/* Pie de Tarjeta (Teléfono) */}
                                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="font-mono text-sm font-black text-gray-600 tracking-wider">
                                        {p.telefono ? p.telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') : '---'}
                                    </span>
                                    
                                    {/* Acciones Rápidas */}
                                    <div className="flex gap-2">
                                        <a 
                                            href={`https://wa.me/52${p.telefono}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all"
                                            title="Enviar WhatsApp"
                                        >
                                            💬
                                        </a>
                                        <a 
                                            href={`tel:${p.telefono}`} 
                                            onClick={e => e.stopPropagation()}
                                            className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all hover:bg-blue-600 hover:text-white"
                                            title="Llamar"
                                        >
                                            📞
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Estado Vacío */}
                {!isLoading && proveedoresFiltrados.length === 0 && (
                    <div className="text-center py-16 border-4 border-dashed border-gray-200 rounded-[3rem] bg-gray-50/50">
                        <span className="text-5xl opacity-30 grayscale">📇</span>
                        <p className="text-sm font-black text-gray-400 uppercase mt-4">No se encontraron proveedores</p>
                        <p className="text-xs text-gray-400">Intenta con otro nombre o registra uno nuevo.</p>
                    </div>
                )}
            </div>

            {/* MODALES DE CONFIRMACIÓN */}
            <ModalConfirmacionSimple 
                isOpen={modalConfirmarEdicion}
                onClose={() => setModalConfirmarEdicion(false)}
                onConfirm={() => actualizarMutacion.mutate({ id: formulario.id, data: {
                    nombre: formulario.nombre.toUpperCase(),
                    telefono: formulario.telefono,
                    contacto_nombre: formulario.contacto_nombre
                }})}
                titulo="¿Guardar Cambios?"
                mensaje={`Se actualizará la información del proveedor "${formulario.nombre}".`}
                textoBotonConfirmar="Sí, actualizar"
            />

            <ModalConfirmacionSimple 
                isOpen={modalEliminar.open}
                onClose={() => setModalEliminar({ open: false, id: null, nombre: '' })}
                onConfirm={() => eliminarMutacion.mutate(modalEliminar.id)}
                titulo="¿Eliminar Proveedor?"
                mensaje={`Estás a punto de borrar a "${modalEliminar.nombre}". Si tiene productos asociados, no se podrá eliminar.`}
                textoBotonConfirmar="Sí, eliminar definitivamente"
            />
        </div>
    );
}