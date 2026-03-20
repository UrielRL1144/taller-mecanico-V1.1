import { useState } from 'react';
import { toast } from 'sonner';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  // En Login.jsx, cambia la función manejarLogin por esta:
const manejarLogin = async (e) => {
    e.preventDefault();
    const idCarga = toast.loading("Verificando credenciales...");

    try {
        const res = await fetch("http://localhost:3000/api/usuarios/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: user, password: pass })
        });
        
        const data = await res.json();

        if (res.ok) {
            toast.success(`Bienvenido, ${data.nombre_completo}`, { id: idCarga });
            onLogin(data); // Pasamos los datos del usuario a App.jsx
        } else {
            toast.error(data.error || "Error de acceso", { id: idCarga });
        }
    } catch (error) {
        toast.error("Error de conexión con el servidor", { id: idCarga });
    }
};

  return (
    <div className="h-screen bg-blue-900 flex items-center justify-center p-6 font-sans">
      <form onSubmit={manejarLogin} className="bg-white w-full max-w-sm p-10 rounded-[3rem] shadow-2xl space-y-6">
        <div className="text-center">
          <span className="text-4xl">🛠️</span>
          <h2 className="text-xl font-black text-gray-800 mt-2 uppercase">Acceso Inventarios</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Refaccionaria Zacapoaxtla</p>
        </div>
        
        <div className="space-y-4">
          <input 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none font-bold"
            placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)}
          />
          <input 
            type="password"
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none font-bold"
            placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)}
          />
          <button className="w-full bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg">
            ENTRAR AL SISTEMA
          </button>
        </div>
      </form>
    </div>
  );
}