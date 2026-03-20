import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';

// Componentes
import Login from './components/Login';
import ListaInventario from './components/ListaInventario';
import GestionPersonal from './components/GestionPersonal';
import GestionProveedores from './components/GestionProveedores';
import FormularioProducto from './components/FormularioProducto';
import Buscador from './components/Buscador';
import Header from './components/Header'; 
import BottomNav from './components/BottomNav'; 

// Páginas Nuevas
import VentaMostrador from './pages/VentaMostrador'; 
import DashboardDueño from './pages/DashboardDueño';

function App() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // Persistencia de Sesión
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('token_usuario'); 
    if (sesionGuardada) {
       const userObj = JSON.parse(localStorage.getItem('usuario_datos') || 'null'); 
       if (userObj) setUsuarioLogueado(userObj);
    }
  }, []);

  const handleLogin = (user) => {
    setUsuarioLogueado(user);
    localStorage.setItem('usuario_datos', JSON.stringify(user));
    localStorage.setItem('token_usuario', 'token-simulado'); 
    navigate('/inventario'); 
  };

  const cerrarSesion = () => {
    setUsuarioLogueado(null);
    localStorage.clear();
    navigate('/'); 
    toast.info("Sesión cerrada");
  };

  // --- LÓGICA DE INVENTARIO PAGINADA ---
  const [productosInventario, setProductosInventario] = useState([]);
  const [terminoInventario, setTerminoInventario] = useState('');
  
  // NUEVOS ESTADOS PARA PAGINACIÓN
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(true);

  // Función Maestra de Carga
  const cargarInventarioCompleto = async (reset = false, terminoOverride = null, modoArchivados = false) => {
    try {
      // Si es reset (nueva búsqueda o recarga total), empezamos de la página 1
      const pagActual = reset ? 1 : pagina;
      // Usamos el término que nos pasen o el del estado
      const terminoBusqueda = terminoOverride !== null ? terminoOverride : terminoInventario;

      // Construimos la URL con todos los parámetros
      const url = `http://localhost:3000/api/productos?page=${pagActual}&termino=${terminoBusqueda}&archivados=${modoArchivados}`;
      
      const res = await fetch(url);
      
      if(res.ok) {
          const data = await res.json();
          
          if (reset) {
              // Si es reset, REEMPLAZAMOS la lista
              setProductosInventario(data.productos);
              setPagina(2); // La siguiente será la 2
          } else {
              // Si es "Cargar Más", AÑADIMOS a la lista existente
              setProductosInventario(prev => [...prev, ...data.productos]);
              setPagina(prev => prev + 1);
          }
          
          // El backend nos dice si hay más (true/false)
          setHayMas(data.hayMas);
      }
    } catch (e) { console.error(e); }
  };

  // Carga inicial al loguear
  useEffect(() => {
    if(usuarioLogueado) cargarInventarioCompleto(true); // Reset inicial
  }, [usuarioLogueado]);

  // Manejador del Buscador (Debounce manual o directo)
  const handleBusquedaInventario = (val) => {
      setTerminoInventario(val);
      // Al buscar, SIEMPRE reseteamos a página 1 (reset = true)
      cargarInventarioCompleto(true, val); 
  };

  return (
    <div className="h-screen bg-slate-400 flex flex-col overflow-hidden font-sans">
      <Toaster position="top-center" richColors />

      <Header 
        usuarioLogueado={usuarioLogueado} 
        cerrarSesion={cerrarSesion} 
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-slate-100 relative">
        <Routes>
            <Route path="/" element={<VentaMostrador />} />
            <Route path="/login" element={
                !usuarioLogueado ? <Login onLogin={handleLogin} /> : <Navigate to="/inventario" />
            } />
            
            <Route path="/inventario" element={
                usuarioLogueado ? (
                    <div className="p-4 pb-24 max-w-7xl mx-auto animate-in slide-in-from-right duration-300">
                        <h2 className="text-sm font-black text-blue-900/40 uppercase mb-4 tracking-widest text-center">Gestión de Inventario</h2>
                        
                        <FormularioProducto 
                            registradoPor={usuarioLogueado}
                            alGuardar={async (datos) => {
                                const datosCompletos = { ...datos, registrado_por_id: usuarioLogueado.id };
                                const res = await fetch("http://localhost:3000/api/productos", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datosCompletos) });
                                if (res.ok) { cargarInventarioCompleto(true); return true; } // Recarga completa al guardar
                                return false;
                            }}
                            irAInventario={(codigo) => {
                                handleBusquedaInventario(codigo); // Usamos el nuevo handler que busca en servidor
                                toast.info("Filtrando: " + codigo);
                            }} 
                            setPestana={() => {}} 
                        />

                        {/* Buscador Conectado al Server */}
                        <Buscador 
                            placeholder="Buscar en todo el catálogo..." 
                            valor={terminoInventario} 
                            alBuscar={handleBusquedaInventario} 
                        />

                        <div className="mt-8">
                             <ListaInventario 
                                // OJO: Ya no usamos 'productosFiltrados', pasamos el estado directo
                                productos={productosInventario} 
                                usuarioLogueado={usuarioLogueado}
                                
                                // Pasamos props de paginación
                                hayMas={hayMas}
                                onCargarMas={() => cargarInventarioCompleto(false)} // false = no resetear (append)
                                
                                // Al recargar (ej. switch papelera), forzamos reset
                                onRecargar={(modoPapelera) => cargarInventarioCompleto(true, null, modoPapelera)}
                                
                                onActualizar={async (id, nuevos) => {
                                    const res = await fetch(`http://localhost:3000/api/productos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevos) });
                                    if (res.ok) { 
                                        // Truco de optimización: Actualizamos solo el item en local para no recargar toda la lista y perder el scroll
                                        setProductosInventario(prev => prev.map(p => p.id === id ? { ...p, ...nuevos } : p));
                                        return true; 
                                    }
                                    return false;
                                }}
                             />
                        </div>
                    </div>
                ) : <Navigate to="/login" />
            } />

            <Route path="/proveedores" element={
                usuarioLogueado ? (
                    <div className="p-4 pb-24 max-w-7xl mx-auto animate-in slide-in-from-right duration-300">
                         <GestionProveedores onFinalizar={() => navigate('/inventario')} />
                    </div>
                ) : <Navigate to="/login" />
            } />

            <Route path="/ajustes" element={
                usuarioLogueado?.rol === 'admin' ? (
                    <div className="p-4 pb-24 max-w-7xl mx-auto animate-in fade-in duration-300">
                        <GestionPersonal />
                    </div>
                ) : <Navigate to="/" />
            } />

            <Route path="/dashboard" element={
                usuarioLogueado?.rol === 'admin' ? <DashboardDueño /> : <Navigate to="/" />
            } />

        </Routes>
      </main>

      <BottomNav usuarioLogueado={usuarioLogueado} />
      
    </div>
  );
}

export default App;