const fetch = require('node-fetch');
(async ()=>{
  try {
    const url = 'https://api.dolarvzla.com/public/exchange-rate';
    console.log('Consultando', url);
    const res = await fetch(url, { timeout: 8000 });
    const j = await res.json();
    console.log('Respuesta recibida (parcial):', Object.keys(j).slice(0,10));
    if (j && j.current && typeof j.current.usd !== 'undefined') {
      console.log('Tasa detectada current.usd =', j.current.usd);
      console.log('Fecha detected current.date =', j.current.date || '(no date)');
      process.exit(0);
    }
    if (j && (j.tasa || j.valor)) {
      console.log('Tasa detectada (tasa/valor) =', j.tasa || j.valor);
      process.exit(0);
    }
    console.log('Formato inesperado. Mostrar objeto completo:');
    console.log(JSON.stringify(j, null, 2));
    process.exit(2);
  } catch (e) {
    console.error('Error consultando API externa:', e && e.message ? e.message : e);
    process.exit(3);
  }
})();
