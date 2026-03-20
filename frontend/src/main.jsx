// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// 1. Importamos el BrowserRouter
import { BrowserRouter } from 'react-router-dom' 

// --- NUEVO: Importamos React Query ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 2. Creamos una instancia del cliente (El cerebro del caché)
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Envolvemos TODO con el proveedor de Query */}
    <QueryClientProvider client={queryClient}>
      
      <BrowserRouter>
        <App />
      </BrowserRouter>

    </QueryClientProvider>
  </React.StrictMode>,
)