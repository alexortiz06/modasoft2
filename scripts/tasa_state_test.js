// Test simple para el mapeo mínimo de tasa (date, price)
function makeApply(json, state) {
  // same logic used in front-end
  try {
    if (!json || typeof json !== 'object') return;
    if (json.current && typeof json.current === 'object') {
      if (typeof json.current.usd !== 'undefined') {
        const p = Number(json.current.usd);
        if (!Number.isNaN(p)) state.price = p;
      }
      if (typeof json.current.date !== 'undefined') {
        state.date = String(json.current.date);
      }
      return;
    }
    if (typeof json.tasa !== 'undefined' || typeof json.valor !== 'undefined') {
      const p = Number(json.tasa || json.valor);
      if (!Number.isNaN(p)) state.price = p;
    }
  } catch (e) { console.warn('apply error', e); }
}

function assertEqual(a,b,msg){
  const ok = (a === b) || (Number.isFinite(a) && Number.isFinite(b) && Math.abs(a-b) < 1e-9);
  console.log((ok? 'PASS':'FAIL') + ' - ' + msg + ' ->', { got: a, expected: b });
  return ok;
}

(function run(){
  console.log('Running tasa_state tests...');
  // Test 1: apply full API sample
  let state = { date: null, price: null };
  const sample = {"current":{"usd":224.3762,"eur":258.41406954,"date":"2025-11-04"},"previous":{"usd":223.9622,"eur":258.1477902,"date":"2025-11-03"},"changePercentage":{"usd":0.18485262245147427,"eur":0.10314995909658561}};
  makeApply(sample, state);
  assertEqual(state.price, 224.3762, 'Test1 price updated from current.usd');
  assertEqual(state.date, '2025-11-04', 'Test1 date updated from current.date');

  // Test 2: apply empty response -> state unchanged
  const before = Object.assign({}, state);
  makeApply({}, state);
  assertEqual(state.price, before.price, 'Test2 price unchanged when response empty');
  assertEqual(state.date, before.date, 'Test2 date unchanged when response empty');

  // Test 3: apply only price change
  makeApply({ current: { usd: 230.5 } }, state);
  assertEqual(state.price, 230.5, 'Test3 price updated to 230.5');
  assertEqual(state.date, '2025-11-04', 'Test3 date unchanged when not provided');

  // Test 4: legacy format {tasa: number}
  state = { date: '2025-11-04', price: 224.3762 };
  makeApply({ tasa: 240 }, state);
  assertEqual(state.price, 240, 'Test4 legacy tasa updates price');
  assertEqual(state.date, '2025-11-04', 'Test4 date unchanged');

  console.log('Tests finished.');
})();
