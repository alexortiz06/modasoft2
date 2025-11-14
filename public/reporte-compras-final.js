// Función mejorada para renderizar el reporte de compras con diseño profesional
async function renderReporteCompras() {
    const cont = document.getElementById('reporteCompras');
    if (!cont) {
        return;
    }
    
    cont.innerHTML = '<div class="item">Cargando compras...</div>';
    
    const btn = document.getElementById('btnReporteCompras');
    if (btn) {
        try { btn.dataset._origText = btn.textContent; } catch(e){}
        btn.disabled = true;
        btn.textContent = 'Generando...';
    }
    
    try {
        const fi = document.getElementById('comprasFechaInicio')?.value || '';
        const ff = document.getElementById('comprasFechaFin')?.value || '';
        
        const qs = new URLSearchParams();
        if (fi) qs.set('start', fi);
        if (ff) qs.set('end', ff);
        
        const url = '/api/reportes/compras-periodo' + (qs.toString() ? ('?' + qs.toString()) : '');
        
        const res = await fetch(url, { credentials: 'include' });
        
        if (!res.ok) {
            let msg = `Error al solicitar datos (status ${res.status}).`;
            try {
                const j = await res.clone().json();
                if (j && (j.error || j.message)) {
                    msg += ' ' + (j.error || j.message);
                }
            } catch (_) {
                try {
                    const txt = await res.text();
                    if (txt) msg += ' ' + txt;
                } catch (_) {}
            }
            cont.innerHTML = `<div class="item" style="color:red;padding:15px;background:#ffe6e6;border-radius:8px;">❌ ${msg}</div>`;
            return;
        }
        
        const data = await res.json().catch(err => {
            return null;
        });
        
        if (!data) {
            cont.innerHTML = '<div class="item" style="color:red;padding:15px;background:#ffe6e6;border-radius:8px;">❌ Error: No se pudo parsear la respuesta del servidor</div>';
            return;
        }
        
        if (!data.ok) {
            cont.innerHTML = `<div class="item" style="color:red;padding:15px;background:#ffe6e6;border-radius:8px;">❌ Error: ${data.error || 'Error desconocido'}</div>`;
            return;
        }
        
        if (!data.grupos || data.grupos.length === 0) {
            cont.innerHTML = '<div class="item" style="padding:20px;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;text-align:center;">ℹ️ No hay compras en el período seleccionado</div>';
            return;
        }
        
        // Construir vista profesional con tabla detallada
        let html = `
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:15px;">
                <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #2563eb;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <div style="font-size:0.9em;color:#666;margin-bottom:5px;">Total Compras</div>
                    <div style="font-size:1.8em;font-weight:bold;color:#2563eb;">${data.compras_count || data.grupos.reduce((sum, g) => sum + (g.compras?.length || 0), 0)}</div>
                </div>
                <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #10b981;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <div style="font-size:0.9em;color:#666;margin-bottom:5px;">Proveedores</div>
                    <div style="font-size:1.8em;font-weight:bold;color:#10b981;">${data.grupos.length}</div>
                </div>
                <div style="background:#fff;padding:15px;border-radius:8px;border-left:4px solid #f59e0b;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <div style="font-size:0.9em;color:#666;margin-bottom:5px;">Total General</div>
                    <div style="font-size:1.8em;font-weight:bold;color:#f59e0b;">$${Number(data.total_general || 0).toFixed(2)}</div>
                </div>
            </div>
        </div>
        `;
        
        // Agregar tabla principal de todas las compras
        html += `
        <div style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);margin-bottom:20px;">
            <div style="background:linear-gradient(135deg, #2563eb 0%, #1e40af 100%);color:white;padding:15px;">
                <h3 style="margin:0;font-size:1.1em;">📊 Resumen de Compras</h3>
            </div>
            <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;min-width:800px;">
                <thead>
                    <tr style="background:#f3f4f6;border-bottom:2px solid #e5e7eb;">
                        <th style="padding:12px;text-align:left;font-weight:600;color:#374151;">Compra #</th>
                        <th style="padding:12px;text-align:left;font-weight:600;color:#374151;">Proveedor</th>
                        <th style="padding:12px;text-align:center;font-weight:600;color:#374151;">Fecha</th>
                        <th style="padding:12px;text-align:right;font-weight:600;color:#374151;">Items</th>
                        <th style="padding:12px;text-align:right;font-weight:600;color:#374151;">Total</th>
                        <th style="padding:12px;text-align:center;font-weight:600;color:#374151;">Estado</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        let filaNum = 0;
        data.grupos.forEach((g) => {
            if (g.compras && g.compras.length > 0) {
                g.compras.forEach(compra => {
                    const cantidadItems = compra.lineas ? compra.lineas.length : 0;
                    const subtotal = (compra.lineas && compra.lineas.length > 0)
                        ? compra.lineas.reduce((sum, l) => sum + (Number(l.total_linea || 0)), 0)
                        : Number(compra.total_compra || 0);
                    
                    const colorFila = filaNum % 2 === 0 ? '#ffffff' : '#f9fafb';
                    filaNum++;
                    
                    html += `
                    <tr style="background:${colorFila};border-bottom:1px solid #e5e7eb;">
                        <td style="padding:12px;text-align:left;font-weight:600;color:#2563eb;">#${compra.id_compra}</td>
                        <td style="padding:12px;text-align:left;color:#374151;">${g.proveedor || 'Sin proveedor'}</td>
                        <td style="padding:12px;text-align:center;color:#6b7280;font-size:0.9em;">${compra.fecha_compra || 'N/A'}</td>
                        <td style="padding:12px;text-align:right;color:#374151;font-weight:500;">${cantidadItems}</td>
                        <td style="padding:12px;text-align:right;color:#059669;font-weight:600;">$${subtotal.toFixed(2)}</td>
                        <td style="padding:12px;text-align:center;">
                            <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:0.85em;font-weight:500;background:#fecaca;color:#991b1b;">
                                No Pagada
                            </span>
                        </td>
                    </tr>
                    `;
                });
            }
        });
        
        html += `
                </tbody>
            </table>
            </div>
        </div>
        `;
        
        // Detalles por proveedor (tabla detallada)
        html += `<div style="margin-top:30px;border-top:2px solid #e5e7eb;padding-top:20px;">
            <h3 style="color:#1f2937;margin-bottom:15px;font-size:1.1em;">📦 Detalles Completos de Compras</h3>
        `;
        
        data.grupos.forEach((g, provIdx) => {
            html += `
            <div style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);margin-bottom:20px;">
                <div style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:white;padding:15px;display:flex;align-items:center;justify-content:space-between;">
                    <h4 style="margin:0;display:flex;align-items:center;gap:10px;font-size:1em;">
                        <span style="font-size:1.3em;">🏢</span>
                        <span>${g.proveedor || 'Sin proveedor'}</span>
                    </h4>
                    <span style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-weight:600;">
                        ${g.compras?.length || 0} compra(s)
                    </span>
                </div>
                
                <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;min-width:800px;">
                    <thead>
                        <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
                            <th style="padding:12px;text-align:left;font-weight:600;color:#374151;">Compra #</th>
                            <th style="padding:12px;text-align:left;font-weight:600;color:#374151;">Producto (Marca)</th>
                            <th style="padding:12px;text-align:right;font-weight:600;color:#374151;">Cantidad</th>
                            <th style="padding:12px;text-align:right;font-weight:600;color:#374151;">Costo Unit.</th>
                            <th style="padding:12px;text-align:right;font-weight:600;color:#374151;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            if (g.compras && g.compras.length > 0) {
                g.compras.forEach(compra => {
                    if (compra.lineas && compra.lineas.length > 0) {
                        compra.lineas.forEach((linea, idx) => {
                            const colorFila = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
                            html += `
                            <tr style="background:${colorFila};border-bottom:1px solid #e5e7eb;">
                                <td style="padding:12px;text-align:left;color:#2563eb;font-weight:600;">#${compra.id_compra}</td>
                                <td style="padding:12px;text-align:left;color:#374151;">
                                    ${linea.marca ? '<strong>' + linea.marca + '</strong> ' : ''}${linea.producto || ('Producto #' + linea.id_producto)}
                                </td>
                                <td style="padding:12px;text-align:right;color:#374151;">${Number(linea.cantidad||0)}</td>
                                <td style="padding:12px;text-align:right;color:#374151;">$${Number(linea.costo_unitario||0).toFixed(2)}</td>
                                <td style="padding:12px;text-align:right;color:#059669;font-weight:600;">$${Number(linea.total_linea||0).toFixed(2)}</td>
                            </tr>
                            `;
                        });
                    } else {
                        html += `
                        <tr style="background:#fff;border-bottom:1px solid #e5e7eb;">
                            <td colspan="5" style="padding:12px;text-align:center;color:#9ca3af;font-style:italic;">
                                Sin detalles de productos para esta compra
                            </td>
                        </tr>
                        `;
                    }
                });
            }
            
            html += `
                    </tbody>
                </table>
                </div>
            </div>
            `;
        });
        
        html += `</div>`;
        
        // Pie del reporte
        html += `
        <div style="margin-top:30px;padding:20px;background:#f3f4f6;border-radius:8px;border-left:4px solid #6366f1;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
                <div>
                    <div style="font-size:0.9em;color:#666;margin-bottom:5px;">Período Reportado</div>
                    <div style="font-weight:600;color:#1f2937;">${fi ? fi : 'Desde inicio'} a ${ff ? ff : 'Hoy'}</div>
                </div>
                <div>
                    <div style="font-size:0.9em;color:#666;margin-bottom:5px;">Fecha de Generación</div>
                    <div style="font-weight:600;color:#1f2937;">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
                </div>
                <div>
                    <div style="font-size:0.9em;color:#666;margin-bottom:5px;">Monto Total</div>
                    <div style="font-weight:600;color:#059669;font-size:1.1em;">$${Number(data.total_general || 0).toFixed(2)}</div>
                </div>
            </div>
        </div>
        `;
        
        cont.innerHTML = html;
    } catch (e) {
        cont.innerHTML = '<div class="item" style="color:red;padding:15px;background:#ffe6e6;border-radius:8px;">❌ Error al cargar compras: ' + e.message + '</div>';
    } finally {
        if (btn) {
            btn.disabled = false;
            try { btn.textContent = btn.dataset._origText || '🔄 Generar'; } catch(e) { btn.textContent = '🔄 Generar'; }
            try { delete btn.dataset._origText; } catch(e){}
        }
    }
}
