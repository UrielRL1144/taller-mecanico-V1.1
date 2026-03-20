import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function GestionPersonal() {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre_completo: '',
    usuario: '',
    password: '',
    rol: 'empleado'
  });

  // 1. Cargar lista de personal
  const cargarPersonal = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/usuarios");
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      toast.error("Error al cargar la lista de personal");
    }
  };

  useEffect(() => { cargarPersonal(); }, []);

  // 2. Guardar nuevo personal
  const handleGuardar = async (e) => {
    e.preventDefault();
    const idCarga = toast.loading("Registrando personal...");
    try {
      const res = await fetch("http://localhost:3000/api/usuarios", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...nuevoUsuario, rol: 'admin'})
      });
      
      if (res.ok) {
        toast.success("Personal autorizado correctamente", { id: idCarga });
        setNuevoUsuario({ nombre_completo: '', usuario: '', password: '', rol: 'empleado' });
        cargarPersonal();
      }
    } catch (error) {
      toast.error("Error de conexión", { id: idCarga });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* FORMULARIO DE REGISTRO */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <header className="mb-6 ml-2">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Seguridad</p>
          <h2 className="text-xl font-black text-gray-800">Alta de Personal</h2>
        </header>

        <form onSubmit={handleGuardar} className="space-y-3">
          <input 
            required placeholder="Nombre Completo del Mecánico"
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            value={nuevoUsuario.nombre_completo}
            onChange={e => setNuevoUsuario({...nuevoUsuario, nombre_completo: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-3">
            <input 
              required placeholder="Usuario (ID Acceso)"
              className="p-4 bg-gray-50 rounded-2xl outline-none font-bold"
              value={nuevoUsuario.usuario}
              onChange={e => setNuevoUsuario({...nuevoUsuario, usuario: e.target.value})}
            />
            <input 
              required type="password" placeholder="Contraseña"
              className="p-4 bg-gray-50 rounded-2xl outline-none font-bold"
              value={nuevoUsuario.password}
              onChange={e => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
            />
          </div>
          <button className="w-full bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all">
            AUTORIZAR ACCESO
          </button>
        </form>
      </section>

      {/* LISTA DE PERSONAL ACTUAL */}
      <section className="space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest">Personal con Acceso</p>
        <div className="grid grid-cols-1 gap-3">
          {usuarios.map(u => (
            <div key={u.id} className="bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">👤</div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{u.nombre_completo}</p>
                  <p className="text-[10px] text-blue-500 font-black uppercase italic">{u.rol}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-300">ID: {u.usuario}</span>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}