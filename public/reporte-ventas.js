// Reporte de Ventas - Simple como Inventario y Utilidades
async function renderReporteVentas() {
    const cont = document.getElementById('reporteVentas');
    if (!cont) return;
    cont.innerHTML = '<div class="item">Cargando ventas...</div>';
    try {
        const res = await fetch('/api/admin/ventas');
        const data = await res.json();
        
        if (!data.ok || !data.ventas || data.ventas.length === 0) {
            cont.innerHTML = '<div class="item">No hay datos de ventas.</div>';
            return;
        }
        
        // Construir tabla
        let html = `<table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:var(--surface-alt);">
                <th style="padding:8px;text-align:left;border:1px solid #eee;">Venta #</th>
                <th style="padding:8px;text-align:left;border:1px solid #eee;">Fecha</th>
                <th style="padding:8px;text-align:left;border:1px solid #eee;">Cliente</th>
                <th style="padding:8px;text-align:left;border:1px solid #eee;">Vendedor</th>
                <th style="padding:8px;text-align:left;border:1px solid #eee;">Tipo Pago</th>
                <th style="padding:8px;text-align:right;border:1px solid #eee;">Monto</th>
              </tr>
            </thead>
            <tbody>`;
        
        let totalVentas = 0;
        data.ventas.forEach(v => {
            const monto = Number(v.total_venta || 0);
            totalVentas += monto;
            const fecha = new Date(v.fecha_hora).toLocaleDateString('es-VE');
            
            html += `<tr style="background: ${totalVentas % 2 === 0 ? '#fff' : '#f9f9f9'};">
                <td style="padding:8px;border:1px solid #f4f4f4;">#${v.id_venta}</td>
                <td style="padding:8px;border:1px solid #f4f4f4;">${fecha}</td>
                <td style="padding:8px;border:1px solid #f4f4f4;">${v.cliente || 'Cliente'}</td>
                <td style="padding:8px;border:1px solid #f4f4f4;">${v.vendedor || 'N/A'}</td>
                <td style="padding:8px;border:1px solid #f4f4f4;">${v.tipo_pago || 'N/A'}</td>
                <td style="padding:8px;text-align:right;border:1px solid #f4f4f4;font-weight:bold;">$${monto.toFixed(2)}</td>
            </tr>`;
        });
        
        html += `</tbody></table>`;
        html += `<div style="padding:15px;background:#f0f0f0;margin-top:15px;border-radius:4px;font-weight:bold;">Total Ventas: $${totalVentas.toFixed(2)}</div>`;
        
        cont.innerHTML = html;
    } catch (e) {
        cont.innerHTML = '<div class="item">Error al cargar ventas.</div>';
    }
}
