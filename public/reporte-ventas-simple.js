// Reporte de Ventas por Período - Limpio y Funcional
async function renderReporteVentas() {
    const cont = document.getElementById('reporteVentas');
    if (!cont) return;
    
    cont.innerHTML = '<div style="padding:20px;text-align:center;">Cargando ventas...</div>';
    
    const btn = document.getElementById('btnReporteVentas');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Generando...';
    }
    
    try {
        const fi = document.getElementById('ventasFechaInicio')?.value || '';
        const ff = document.getElementById('ventasFechaFin')?.value || '';
        
        if (!fi || !ff) {
            cont.innerHTML = '<div style="padding:20px;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;text-align:center;">⚠️ Selecciona fecha de inicio y fin</div>';
            return;
        }
        
        const qs = new URLSearchParams();
        qs.set('start', fi);
        qs.set('end', ff);
        
        const url = '/api/reportes/ventas-periodo?' + qs.toString();
        
        const res = await fetch(url, { credentials: 'include' });
        
        if (!res.ok) {
            cont.innerHTML = `<div style="padding:20px;background:#ffe6e6;border:1px solid #f5222d;border-radius:8px;color:#d32f2f;">❌ Error: ${res.status} ${res.statusText}</div>`;
            return;
        }
        
        const data = await res.json();
        
        if (!data.ok) {
            cont.innerHTML = `<div style="padding:20px;background:#ffe6e6;border:1px solid #f5222d;border-radius:8px;color:#d32f2f;">❌ ${data.error || 'Error desconocido'}</div>`;
            return;
        }
        
        if (!data.ventas || data.ventas.length === 0) {
            cont.innerHTML = '<div style="padding:20px;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;text-align:center;">ℹ️ No hay ventas en el período seleccionado</div>';
            return;
        }
        
        // Contar ventas por tipo de pago
        const totalesPago = {
            efectivo: 0,
            pago_movil: 0,
            transferencia: 0,
            tarjeta: 0,
            otro: 0
        };
        
        let totalGeneral = 0;
        
        data.ventas.forEach(venta => {
            const monto = Number(venta.total_venta || 0);
            totalGeneral += monto;
            
            const tipo = (venta.tipo_pago || 'otro').toLowerCase();
            if (tipo.includes('efectivo')) totalesPago.efectivo += monto;
            else if (tipo.includes('movil') || tipo.includes('pago móvil')) totalesPago.pago_movil += monto;
            else if (tipo.includes('transferencia')) totalesPago.transferencia += monto;
            else if (tipo.includes('tarjeta')) totalesPago.tarjeta += monto;
            else totalesPago.otro += monto;
        });
        
        // Construir HTML
        let html = `
        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:15px;">
                <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:15px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <div style="font-size:0.85em;opacity:0.9;margin-bottom:5px;">Total Ventas</div>
                    <div style="font-size:1.8em;font-weight:bold;">${data.ventas.length}</div>
                </div>
                <div style="background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%);color:white;padding:15px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <div style="font-size:0.85em;opacity:0.9;margin-bottom:5px;">Total Monto</div>
                    <div style="font-size:1.8em;font-weight:bold;">$${totalGeneral.toFixed(2)}</div>
                </div>
                <div style="background:linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);color:white;padding:15px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <div style="font-size:0.85em;opacity:0.9;margin-bottom:5px;">Promedio por Venta</div>
                    <div style="font-size:1.8em;font-weight:bold;">$${(totalGeneral / data.ventas.length).toFixed(2)}</div>
                </div>
                <div style="background:linear-gradient(135deg, #fa709a 0%, #fee140 100%);color:white;padding:15px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <div style="font-size:0.85em;opacity:0.9;margin-bottom:5px;">Período</div>
                    <div style="font-size:1.2em;font-weight:bold;">${fi} a ${ff}</div>
                </div>
            </div>
        </div>
        `;
        
        // Tabla de ventas
        html += `
        <div style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin-bottom:20px;">
            <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:15px;font-weight:bold;">
                📊 Detalle de Ventas
            </div>
            <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;min-width:900px;">
                <thead>
                    <tr style="background:#f3f4f6;border-bottom:2px solid #e5e7eb;">
                        <th style="padding:12px;text-align:left;font-weight:600;color:#374151;border-right:1px solid #e5e7eb;">Venta #</th>
                        <th style="padding:12px;text-align:left;font-weight:600;color:#374151;border-right:1px solid #e5e7eb;">Fecha y Hora</th>
                        <th style="padding:12px;text-align:left;font-weight:600;color:#374151;border-right:1px solid #e5e7eb;">Cliente</th>
                        <th style="padding:12px;text-align:left;font-weight:600;color:#374151;border-right:1px solid #e5e7eb;">Vendedor</th>
                        <th style="padding:12px;text-align:left;font-weight:600;color:#374151;border-right:1px solid #e5e7eb;">Tipo Pago</th>
                        <th style="padding:12px;text-align:right;font-weight:600;color:#374151;">Monto</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        let rowNum = 0;
        data.ventas.forEach(venta => {
            const bgColor = rowNum % 2 === 0 ? '#ffffff' : '#f9fafb';
            const monto = Number(venta.total_venta || 0);
            const fechaHora = new Date(venta.fecha_hora).toLocaleString('es-VE');
            const tipoPago = venta.tipo_pago || 'N/A';
            
            html += `
            <tr style="background:${bgColor};border-bottom:1px solid #e5e7eb;hover:background:#f0f0f0;">
                <td style="padding:12px;border-right:1px solid #e5e7eb;font-weight:600;color:#667eea;">#${venta.id_venta}</td>
                <td style="padding:12px;border-right:1px solid #e5e7eb;color:#374151;font-size:0.9em;">${fechaHora}</td>
                <td style="padding:12px;border-right:1px solid #e5e7eb;color:#374151;">${venta.cliente || 'Cliente Efectivo'}</td>
                <td style="padding:12px;border-right:1px solid #e5e7eb;color:#374151;">${venta.vendedor || 'N/A'}</td>
                <td style="padding:12px;border-right:1px solid #e5e7eb;">
                    <span style="background:#e3f2fd;color:#1976d2;padding:4px 8px;border-radius:4px;font-size:0.85em;font-weight:600;">
                        ${tipoPago}
                    </span>
                </td>
                <td style="padding:12px;text-align:right;font-weight:600;color:#2e7d32;font-size:1.05em;">$${monto.toFixed(2)}</td>
            </tr>
            `;
            rowNum++;
        });
        
        html += `
                </tbody>
            </table>
            </div>
        </div>
        `;
        
        // Resumen por tipo de pago
        html += `
        <div style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin-bottom:20px;">
            <div style="background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%);color:white;padding:15px;font-weight:bold;">
                💳 Resumen por Tipo de Pago
            </div>
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:#f3f4f6;border-bottom:2px solid #e5e7eb;">
                        <th style="padding:12px;text-align:left;font-weight:600;color:#374151;border-right:1px solid #e5e7eb;">Tipo de Pago</th>
                        <th style="padding:12px;text-align:right;font-weight:600;color:#374151;">Cantidad</th>
                        <th style="padding:12px;text-align:right;font-weight:600;color:#374151;">Monto Total</th>
                        <th style="padding:12px;text-align:right;font-weight:600;color:#374151;">% del Total</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        const tiposArray = [
            { nombre: 'Efectivo', key: 'efectivo', icon: '💵' },
            { nombre: 'Pago Móvil', key: 'pago_movil', icon: '📱' },
            { nombre: 'Transferencia', key: 'transferencia', icon: '🏦' },
            { nombre: 'Tarjeta', key: 'tarjeta', icon: '💳' },
            { nombre: 'Otro', key: 'otro', icon: '❓' }
        ];
        
        tiposArray.forEach((tipo, idx) => {
            const monto = totalesPago[tipo.key] || 0;
            const porcentaje = totalGeneral > 0 ? ((monto / totalGeneral) * 100).toFixed(1) : 0;
            const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
            
            if (monto > 0) {
                html += `
                <tr style="background:${bgColor};border-bottom:1px solid #e5e7eb;">
                    <td style="padding:12px;border-right:1px solid #e5e7eb;font-weight:600;color:#374151;">${tipo.icon} ${tipo.nombre}</td>
                    <td style="padding:12px;text-align:right;border-right:1px solid #e5e7eb;color:#374151;">${data.ventas.filter(v => {
                        const t = (v.tipo_pago || '').toLowerCase();
                        if (tipo.key === 'efectivo') return t.includes('efectivo');
                        if (tipo.key === 'pago_movil') return t.includes('movil') || t.includes('pago móvil');
                        if (tipo.key === 'transferencia') return t.includes('transferencia');
                        if (tipo.key === 'tarjeta') return t.includes('tarjeta');
                        return false;
                    }).length}</td>
                    <td style="padding:12px;text-align:right;border-right:1px solid #e5e7eb;font-weight:600;color:#2e7d32;">$${monto.toFixed(2)}</td>
                    <td style="padding:12px;text-align:right;font-weight:600;color:#1976d2;">${porcentaje}%</td>
                </tr>
                `;
            }
        });
        
        html += `
                </tbody>
            </table>
        </div>
        `;
        
        // Pie del reporte
        html += `
        <div style="margin-top:30px;padding:20px;background:#f3f4f6;border-radius:8px;border-left:4px solid #667eea;">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
                <div>
                    <div style="font-size:0.9em;color:#666;margin-bottom:5px;">Período Reportado</div>
                    <div style="font-weight:600;color:#1f2937;">${fi} a ${ff}</div>
                </div>
                <div>
                    <div style="font-size:0.9em;color:#666;margin-bottom:5px;">Total de Ventas</div>
                    <div style="font-weight:600;color:#1f2937;">${data.ventas.length} transacciones</div>
                </div>
                <div>
                    <div style="font-size:0.9em;color:#666;margin-bottom:5px;">Monto Total Generado</div>
                    <div style="font-weight:600;color:#2e7d32;font-size:1.1em;">$${totalGeneral.toFixed(2)}</div>
                </div>
                <div>
                    <div style="font-size:0.9em;color:#666;margin-bottom:5px;">Fecha de Generación</div>
                    <div style="font-weight:600;color:#1f2937;">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
                </div>
            </div>
        </div>
        `;
        
        cont.innerHTML = html;
        
    } catch (e) {
        cont.innerHTML = `<div style="padding:20px;background:#ffe6e6;border:1px solid #f5222d;border-radius:8px;color:#d32f2f;">❌ Error: ${e.message}</div>`;
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔄 Generar';
        }
    }
}
