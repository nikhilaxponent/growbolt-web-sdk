(function(){
  const checkBtn = document.getElementById('checkBtn');
  const initBtn = document.getElementById('initBtn');
  const destroyBtn = document.getElementById('destroyBtn');
  const detailBtn = document.getElementById('detailBtn');
  const progressTabs = document.querySelectorAll('.progress-tab');
  const statusEl = document.getElementById('status');
  const logEl = document.getElementById('log');

  function timeStamp(){ return new Date().toLocaleTimeString(); }
  function appendLog(kind, ...args){
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const ts = document.createElement('span');
    ts.className = 'time';
    ts.textContent = `[${timeStamp()}]`;
    entry.appendChild(ts);

    const txt = document.createElement('span');
    const pretty = args.map(a => {
      try{
        if (a === null) return 'null';
        if (typeof a === 'undefined') return 'undefined';
        if (typeof a === 'function') return `function ${a.name || '<anonymous>'}()`;
        if (a instanceof Error) return `${a.name}: ${a.message}`;
        if (typeof a !== 'object') return String(a);
        // For objects, show keys and method signatures to avoid empty '{}'
        const obj = a;
        const own = Object.getOwnPropertyNames(obj || {}).filter(n => typeof (obj || {})[n] !== 'undefined');
        const proto = obj && Object.getPrototypeOf(obj) ? Object.getOwnPropertyNames(Object.getPrototypeOf(obj)) : [];
        const names = Array.from(new Set([...own, ...proto]));
        if (names.length === 0) return '{ }';
        const parts = names.map(n => {
          try{ const v = (obj || {})[n] || Object.getPrototypeOf(obj)[n]; return `${n}: ${typeof v}` }catch(e){ return n }
        });
        return `{ ${parts.join(', ')} }`;
      }catch(e){ return String(a) }
    }).join(' ');
    txt.textContent = `${kind}: ${pretty} `;
    entry.appendChild(txt);

    logEl.prepend(entry);
    console.log(kind, ...args);
  }

  function setStatus(text){ statusEl.textContent = text; appendLog('STATUS', text); }

  function isSDKPresent(){ return typeof window !== 'undefined' && !!window.GrowBolt; }

  function setButtonsState(){
    const present = isSDKPresent();
    checkBtn.disabled = false;
    initBtn.disabled = !present;
    destroyBtn.disabled = !present;
  }

  checkBtn.addEventListener('click', ()=>{
    appendLog('ACTION', 'Checking window.GrowBolt');
    if(isSDKPresent()){
      appendLog('FOUND', window.GrowBolt);
      setStatus('SDK loaded');
    } else {
      appendLog('MISSING', 'window.GrowBolt is not defined');
      setStatus('SDK missing');
    }
    setButtonsState();
  });

  initBtn.addEventListener('click', async ()=>{
    appendLog('ACTION', 'Initialize clicked');
    if(!isSDKPresent()){ appendLog('ERROR','SDK not loaded'); setStatus('SDK missing'); return; }
    try{
      const initFn = window.GrowBolt.init;
      if(typeof initFn !== 'function'){ appendLog('ERROR','GrowBolt.init is not a function'); return; }
      // Call init with proper context binding and test config
      const result = initFn.call(window.GrowBolt, {
        apiKey: 'wS9D_bVsyVRRvoWaWVjqjgStPRkKMfLjfLmuBFUNWA0',
      });                                                       
      if(result && typeof result.then === 'function'){
        appendLog('INFO','init returned a Promise - waiting');
        const res = await result;
        appendLog('SUCCESS', 'init response:', res);
        const offers = window.GrowBolt.getOffers?.();
appendLog('INFO', 'offers count:', offers?.length);
appendLog('INFO', 'first offer:', offers?.[0]);
        // call ongoing for demo (sub4 'postman', tab 'completed')
        try{
          const ongoing = await window.GrowBolt.getOngoing({ sub4: 'postman', tab: 'completed' });
          appendLog('INFO','getOngoing response:', ongoing);
        }catch(e){ appendLog('ERROR','getOngoing failed', e); }
      } else {
        appendLog('INFO','init returned:', result);
      }
      appendLog('SUCCESS','GrowBolt.init() completed');
      setStatus('Initialized');
    }catch(err){ appendLog('ERROR', err); console.error(err); setStatus('Init error'); }
  });

  destroyBtn.addEventListener('click', async ()=>{
    appendLog('ACTION', 'Destroy clicked');
    if(!isSDKPresent()){ appendLog('ERROR','SDK not loaded'); setStatus('SDK missing'); return; }
    try{
      const destroyFn = window.GrowBolt.destroy;
      if(typeof destroyFn !== 'function'){ appendLog('ERROR','GrowBolt.destroy is not a function'); return; }
      const result = destroyFn.call(window.GrowBolt);
      if(result && typeof result.then === 'function'){
        appendLog('INFO','destroy returned a Promise - waiting');
        const res = await result;
        appendLog('SUCCESS', 'destroy response:', res);
      } else {
        appendLog('INFO','destroy returned:', result);
      }
      appendLog('SUCCESS','GrowBolt.destroy() completed');
      setStatus('Destroyed');
    }catch(err){ appendLog('ERROR', err); console.error(err); setStatus('Destroy error'); }
  });

  // initial state
  appendLog('INFO','Playground loaded.');
  setStatus('Ready');
  
  // Auto-check SDK on load
  setTimeout(() => {
    appendLog('ACTION', 'Auto-checking SDK on load');
    if(isSDKPresent()){
      appendLog('SUCCESS', 'SDK present on window');
      appendLog('FOUND', window.GrowBolt);
      setButtonsState();
    } else {
      appendLog('ERROR', 'SDK not found on window');
    }
  }, 500);
  setButtonsState();

  // wire up progress tab demo buttons (if present)
  if(progressTabs && progressTabs.length){
    progressTabs.forEach(tabEl=>{
      tabEl.addEventListener('click', async ()=>{
        const tab = tabEl.dataset.tab || 'completed';
        appendLog('ACTION', `Fetching ongoing tab=${tab}`);
        try{
          const res = await window.GrowBolt.getOngoing({ sub4: 'postman', tab });
          appendLog('SUCCESS', `ongoing ${tab}:`, res);
        }catch(e){ appendLog('ERROR','ongoing fetch failed', e); }
      });
    });
  }

  // demo: offer details button
  if(detailBtn){
    detailBtn.addEventListener('click', async ()=>{
      appendLog('ACTION','Fetching offer details for id=123');
      try{
        const res = await window.GrowBolt.getOfferDetails('123');
        appendLog('SUCCESS','offerDetails:', res);
      }catch(e){ appendLog('ERROR','offerDetails failed', e); }
    });
  }

  // Auto-check after load to indicate whether SDK is already present
  window.addEventListener('load', ()=>{
    if(isSDKPresent()){
      appendLog('AUTO','SDK present on window at load');
      setStatus('SDK loaded');
    }
  });
})();
