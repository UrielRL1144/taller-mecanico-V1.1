import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function DashboardDueño() {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);

    // FUNCIÓN DE CARGA
    const cargarFinanzas = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/finanzas/resumen');
            if (res.ok) {
                const data = await res.json();
                setDatos(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error cargando finanzas");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarFinanzas();
    }, []);

    if (cargando) return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 animate-pulse">
            <span className="text-4xl mb-2">📊</span>
            <p className="font-black uppercase tracking-widest text-xs">Analizando Negocio...</p>
        </div>
    );

    if (!datos) return <p className="text-center p-10">Sin datos disponibles.</p>;

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            
            {/* ENCABEZADO */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Tablero Maestro</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado financiero en tiempo real</p>
                </div>
                <button 
                    onClick={cargarFinanzas}
                    className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-90"
                >
                    🔄
                </button>
            </div>

            {/* SECCIÓN 1: KPIs (TARJETAS SUPERIORES) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* TARJETA 1: VENTAS HOY */}
                <div className="bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-200 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Ventas de Hoy</p>
                    <h3 className="text-4xl font-black">${datos.hoy.venta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
                    <div className="mt-4 flex items-center gap-2">
                         <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-bold">🛒 Ingreso Bruto</span>
                    </div>
                </div>

                {/* TARJETA 2: UTILIDAD HOY (LA CORONA) */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Ganancia Neta (Estimada)</p>
                    <h3 className="text-4xl font-black text-gray-800 flex items-center gap-2">
                        ${datos.hoy.utilidad.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        <span className="text-sm text-gray-300 font-medium">MXN</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">
                        Lo que te queda libre hoy
                    </p>
                </div>

                {/* TARJETA 3: CAPITAL EN BODEGA */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1">Capital en Almacén</p>
                    <h3 className="text-3xl font-black text-gray-800">
                        ${datos.inventario.valor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">
                        Dinero invertido en piezas
                    </p>
                </div>
            </div>

            {/* SECCIÓN 2: GRÁFICA DE RENDIMIENTO */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                     <h3 className="font-black text-gray-800 uppercase tracking-tight text-lg">Tendencia de Ventas (7 Días)</h3>
                     <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase">Histórico Semanal</span>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={datos.grafica}>
                            <defs>
                                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis 
                                dataKey="fecha" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 'bold'}} 
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="venta_total" 
                                stroke="#2563eb" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorVentas)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* SECCIÓN 3: RECORDATORIO DE RENTABILIDAD */}
            <div className="mt-8 bg-linear-to-r from-gray-900 to-gray-800 p-8 rounded-[2.5rem] shadow-xl text-white flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="font-black text-lg uppercase mb-1">Tu Margen Promedio</h4>
                    <p className="text-gray-400 text-xs font-medium max-w-xs">
                        Recuerda mantener tus precios actualizados. Si el costo de tus proveedores sube, tu utilidad baja.
                    </p>
                </div>
                <div className="text-right relative z-10">
                    <span className="block text-3xl font-black text-green-400">
                        {datos.hoy.venta > 0 ? ((datos.hoy.utilidad / datos.hoy.venta) * 100).toFixed(1) : 0}%
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Rentabilidad Hoy</span>
                </div>
                
                {/* Decoración de fondo */}
                <div className="absolute left-0 top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
        </div>
    );
}