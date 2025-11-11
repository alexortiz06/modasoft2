/*
  devoluciones.js
  Funcionalidades para el módulo de devoluciones en caja
*/

document.addEventListener('DOMContentLoaded', function() {
    const formAcceso = document.getElementById('form-acceso-devoluciones');
    const panelDevoluciones = document.getElementById('panelDevoluciones');
    const btnBuscarVenta = document.getElementById('btnBuscarVentaDevolucion');
    
    if (formAcceso) {
        formAcceso.addEventListener('submit', async function(e) {
            e.preventDefault();
            const clave = document.getElementById('claveDevoluciones').value;
            
            try {
                const res = await fetch('/api/devoluciones/validar-clave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clave })
                });
                
                const data = await res.json();
                if (data.ok) {
                    panelDevoluciones.style.display = 'block';
                    formAcceso.reset();
                } else {
                    alert('Clave incorrecta');
                }
            } catch (error) {
                alert('Error de conexión');
            }
        });
    }

    if (btnBuscarVenta) {
        btnBuscarVenta.addEventListener('click', buscarVentasCliente);
    }
});

async function buscarVentasCliente() {
    const inputVenta = document.getElementById('devolucionNumeroVenta');
    if (!inputVenta) {
        console.error('No se encontró el campo devolucionNumeroVenta');
        alert('Error: No se encontró el campo de número de venta');
        return;
    }
    
    const idVenta = inputVenta.value.trim();
    if (!idVenta) {
        alert('Ingrese el número de venta');
        return;
    }

    const idVentaNum = parseInt(idVenta);
    if (isNaN(idVentaNum) || idVentaNum <= 0) {
        alert('El número de venta debe ser un número válido');
        return;
    }

    const contenedor = document.getElementById('ventasClienteDevolucion');
    if (!contenedor) {
        console.error('No se encontró el contenedor ventasClienteDevolucion');
        alert('Error: No se encontró el contenedor de resultados');
        return;
    }

    // Mostrar mensaje de carga
    contenedor.innerHTML = '<div class="item">Buscando venta...</div>';

    try {
        const res = await fetch(`/api/devoluciones/venta?id_venta=${encodeURIComponent(idVentaNum)}`);
        
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('Respuesta del servidor:', data);
        
        if (data.error) {
            contenedor.innerHTML = `<div class="item" style="color:#b71c1c;">${data.error}</div>`;
            return;
        }
        
        if (data.ok && data.ventas && data.ventas.length > 0) {
            contenedor.innerHTML = data.ventas.map(venta => {
                const fechaVenta = new Date(venta.fecha_hora);
                const ahora = new Date();
                const horasTranscurridas = (ahora - fechaVenta) / (1000 * 60 * 60);
                const horasRestantes = Math.max(0, 48 - horasTranscurridas);
                const tiempoInfo = horasRestantes > 0 
                    ? `<span style='color:#2e7d32;font-weight:600;'>Tiempo restante: ${Math.floor(horasRestantes)} horas</span>`
                    : `<span style='color:#b71c1c;font-weight:600;'>Tiempo expirado</span>`;
                
                // Verificar que venta.detalles existe y es un array
                const detalles = venta.detalles || [];
                
                return `
                <div class="item">
                    <div>
                        <strong>Venta #${venta.id_venta}</strong><br>
                        Fecha: ${venta.fecha_hora}<br>
                        Total: $${venta.total_venta}<br>
                        ${tiempoInfo}<br>
                        Productos:
                        <ul style="margin-top:8px;">
                            ${detalles.length > 0 ? detalles.map(det => {
                                const disponible = Number(det.disponible || 0);
                                const badge = disponible > 0 ? `<span style='color:#2e7d32;font-weight:600;margin-left:6px;'>(Disp.: ${disponible})</span>` : `<span style='color:#b71c1c;font-weight:600;margin-left:6px;'>(Sin disp.)</span>`;
                                const btn = disponible > 0 && horasRestantes > 0 ? `<button class="btn btn-small" onclick="procesarDevolucion(${det.id_detalle}, ${disponible})" style="margin-left:10px;">Devolver</button>` : '';
                                return `<li>${det.nombre_producto || 'Producto'} - Talla: ${det.nombre_talla || '-'} - Cantidad vendida: ${det.cantidad} ${badge} - Precio neto: $${Number(det.precio_neto || det.precio_unitario || 0).toFixed(2)} ${btn}</li>`;
                            }).join('') : '<li>No hay detalles disponibles</li>'}
                        </ul>
                    </div>
                </div>
            `;
            }).join('');
        } else {
            contenedor.innerHTML = '<div class="item">No se encontró la venta</div>';
        }
    } catch (error) {
        console.error('Error al buscar venta:', error);
        const contenedor = document.getElementById('ventasClienteDevolucion');
        if (contenedor) {
            contenedor.innerHTML = `<div class="item" style="color:#b71c1c;">Error al buscar venta: ${error.message}</div>`;
        }
        alert('Error al buscar venta. Revisa la consola para más detalles.');
    }
}

window.procesarDevolucion = async function(idDetalle, cantidadMax) {
    const cantidad = prompt(`Ingrese la cantidad a devolver (máximo: ${cantidadMax}):`, cantidadMax);
    if (!cantidad || isNaN(cantidad) || parseInt(cantidad) < 1 || parseInt(cantidad) > cantidadMax) {
        alert('Cantidad inválida');
        return;
    }

    try {
        const res = await fetch('/api/devoluciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_detalle: idDetalle,
                cantidad: parseInt(cantidad)
            })
        });

        const data = await res.json();
        if (data.ok) {
            alert(`Devolución procesada. Reembolso: $${Number(data.monto_reembolsado || 0).toFixed(2)}. Inventario actualizado y venta ajustada.`);
            buscarVentasCliente(); // Recargar ventas
        } else {
            alert('Error: ' + (data.error || ''));
        }
    } catch (error) {
        alert('Error de conexión');
    }
};

