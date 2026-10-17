/* Isolated native-CDP browser QA; production files are never instrumented. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const output = path.dirname(fileURLToPath(import.meta.url));
const beforeOnly = process.argv.includes('--before');
const previewOnly = process.argv.includes('--preview');
const chrome = 'C:/Users/Adrien/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const hash = source => createHash('sha256').update(source).digest('hex');
const report = {
  mode: beforeOnly ? 'before' : 'final', url: 'http://localhost:3000', viewport: { width: 1780, height: 883 },
  browserPreferences: { reducedMotion: 'reduce', reason: 'Existing production reduced-motion behavior gives deterministic scroll checkpoints under software rendering.' },
  loadedSources: {}, assetResources: {}, errors: [], resourceErrors: [], networkFailures: [], consoleWarnings: [],
  checkpoints: {}, composition: {}, checks: {},
};
const profile = path.join(os.tmpdir(), `maison-noire-entrance-correction-qa-${process.pid}`);
const launch = spawn(chrome, [
  '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader',
  '--disable-smooth-scrolling', '--disable-dev-shm-usage', '--no-first-run',
  '--no-default-browser-check', '--remote-debugging-port=9343', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let connection;
const bodyTasks = [];

class CDP {
  constructor(socket) {
    this.socket = socket; this.seq = 0; this.pending = new Map(); this.listeners = new Map();
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const entry = this.pending.get(message.id);
        if (entry) {
          this.pending.delete(message.id); clearTimeout(entry.timeout);
          if (message.error) entry.reject(new Error(JSON.stringify(message.error))); else entry.resolve(message.result);
        }
      } else for (const callback of this.listeners.get(message.method) || []) callback(message.params);
    });
  }
  on(method, callback) { this.listeners.set(method, [...(this.listeners.get(method) || []), callback]); }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.seq;
      const timeout = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
      this.pending.set(id, { resolve, reject, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { for (const entry of this.pending.values()) clearTimeout(entry.timeout); this.socket.close(); }
}

async function evaluate(fn, inFrame = true) {
  const expression = inFrame
    ? `(() => { const target = document.querySelector('iframe')?.contentWindow || window; return target.eval(${JSON.stringify(`(${fn.toString()})()`)}); })()`
    : `(${fn.toString()})()`;
  const result = await connection.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function waitFor(fn, timeout = 16000) {
  const start = Date.now(); let lastError;
  while (Date.now() - start < timeout) {
    try { if (await evaluate(fn)) return; } catch (error) { lastError = String(error); }
    await delay(160);
  }
  report.lastState = await evaluate(() => ({ scrollY, height: document.body.scrollHeight, viewportHeight: innerHeight, progress: document.getElementById('bar')?.style.width, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches }));
  if (lastError) report.lastWaitError = lastError;
  throw new Error(`Timed out waiting for ${fn.toString()}`);
}

async function waitForArchitecture() {
  if (beforeOnly) return;
  await waitFor(() => {
    let count = 0, ready = true;
    window.__entranceQA.scene.traverse(object => {
      if (object.material?.userData.architecture) {
        count++; ready = ready && object.material.userData.ready;
      }
    });
    return count > 0 && ready;
  }, 45000);
}

async function screenshot(name) {
  const result = await connection.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true });
  const filename = `${beforeOnly ? 'before' : previewOnly ? 'preview' : 'final'}-${name}.png`;
  fs.writeFileSync(path.join(output, filename), Buffer.from(result.data, 'base64'));
  return filename;
}

async function snapshot() {
  return evaluate(() => {
    const { scene, camera, renderer } = window.__entranceQA;
    const doors = [];
    scene.traverse(o => { if (o.isGroup && Math.abs(Math.abs(o.position.x) - 1.15) < .0001 && Math.abs(o.position.z - 8.1) < .0001) doors.push(o); });
    doors.sort((a, b) => a.position.x - b.position.x);
    const vector = v => v.toArray().map(n => Math.round(n * 1e6) / 1e6);
    const bounds = o => { const box = new THREE.Box3().setFromObject(o); return { min: vector(box.min), max: vector(box.max) }; };
    const materials = new Set(), geometries = new Set(), instances = [], vegetationObjects = [];
    let meshes = 0, lights = 0, physicalGlass = 0;
    scene.traverse(o => {
      if (o.isInstancedMesh) instances.push({ name: o.name, count: o.count });
      if (/olive|olivier|leaf|leaves|foliage|branch|planter|jardini|feuillage|vegetation|végét/i.test(o.name)) vegetationObjects.push({ name: o.name, type: o.type });
      if (o.isMesh) {
        meshes++; geometries.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) { materials.add(m); if (m.isMeshPhysicalMaterial && m.transparent) physicalGlass++; }
      }
      if (o.isLight) lights++;
    });
    return {
      scrollY, scrollFraction: scrollY / (document.body.scrollHeight - innerHeight),
      camera: { position: vector(camera.position), quaternion: vector(camera.quaternion), fov: camera.fov, near: camera.near, far: camera.far },
      doors: doors.map(o => ({ position: vector(o.position), rotation: vector(o.rotation).slice(0, 3), bounds: bounds(o), children: o.children.length,
        glass: o.children.filter(c => c.isMesh && c.material?.isMeshPhysicalMaterial && c.material.transparent).map(c => ({ dimensions: c.geometry.parameters, position: vector(c.position), opacity: c.material.opacity, roughness: c.material.roughness, metalness: c.material.metalness, transmission: c.material.transmission, depthWrite: c.material.depthWrite, transparent: c.material.transparent, envMapIntensity: c.material.envMapIntensity, reflectivity: c.material.reflectivity })) })),
      render: window.__lightingFrameStats || { ...renderer.info.render }, memory: { ...renderer.info.memory },
      scene: { meshes, lights, materials: materials.size, geometries: geometries.size, physicalGlass }, instances, vegetationObjects,
      ui: { introOpacity: Number(getComputedStyle(document.getElementById('intro')).opacity), cardOpacity: Number(getComputedStyle(document.getElementById('card')).opacity), cardTitle: document.getElementById('nm').textContent, cart: document.getElementById('cartB').textContent, catalogueOpen: document.getElementById('all').classList.contains('o') },
    };
  });
}

async function composition() {
  return evaluate(() => {
    const { camera } = window.__entranceQA;
    const rect = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
    const textBounds = element => { const r = document.createRange(); r.selectNodeContents(element); return rect(r); };
    const intro = document.getElementById('intro'), h1 = intro.querySelector('h1'), paragraph = intro.querySelector('p');
    const corners = [];
    for (const x of [-1.2, 1.2]) for (const y of [0, 3.1]) {
      const p = new THREE.Vector3(x, y, 8.2).project(camera);
      corners.push({ x: (p.x + 1) * innerWidth / 2, y: (1 - p.y) * innerHeight / 2 });
    }
    return {
      viewport: { width: innerWidth, height: innerHeight }, documentWidth: document.documentElement.scrollWidth,
      intro: rect(intro), heading: rect(h1), headingText: textBounds(h1), paragraph: rect(paragraph), paragraphText: textBounds(paragraph),
      headingStyle: { fontSize: getComputedStyle(h1).fontSize, lineHeight: getComputedStyle(h1).lineHeight },
      doorway: { left: Math.min(...corners.map(c => c.x)), right: Math.max(...corners.map(c => c.x)), top: Math.min(...corners.map(c => c.y)), bottom: Math.max(...corners.map(c => c.y)) },
    };
  });
}

async function scrollToFraction(fraction) {
  await evaluate(new Function(`scrollTo(0, ${fraction} * (document.body.scrollHeight - innerHeight));`));
  await waitFor(new Function(`scrollTo(0, ${fraction} * (document.body.scrollHeight - innerHeight)); return Math.abs(parseFloat(document.getElementById('bar').style.width) / 100 - ${fraction}) < .0002;`));
  await delay(400);
}

async function clickId(id) {
  const rect = await evaluate(new Function(`const r = document.getElementById(${JSON.stringify(id)}).getBoundingClientRect(); return { x:r.x+r.width/2, y:r.y+r.height/2 };`));
  await connection.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y });
  await connection.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  await connection.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  await delay(220);
}

function compareBaseline() {
  const baseline = JSON.parse(fs.readFileSync(path.join(output, 'baseline-report.json'), 'utf8'));
  report.comparison = {};
  for (const key of Object.keys(report.checkpoints).filter(key => baseline.checkpoints[key])) {
    const a = baseline.checkpoints[key], b = report.checkpoints[key];
    report.comparison[key] = {
      cameraPositionDelta: b.camera.position.map((n, i) => n - a.camera.position[i]),
      doorPivotPositionsEqual: JSON.stringify(a.doors.map(d => d.position)) === JSON.stringify(b.doors.map(d => d.position)),
      doorAngleDelta: b.doors.map((d, i) => d.rotation[1] - a.doors[i].rotation[1]),
      lightsEqual: a.scene.lights === b.scene.lights,
    };
  }
  report.checks.doorPivotsUnchanged = Object.values(report.comparison).every(point => point.doorPivotPositionsEqual);
  report.checks.cameraPathUnchanged = Object.values(report.comparison).every(point => Math.abs(point.cameraPositionDelta[0]) < .015 && Math.abs(point.cameraPositionDelta[2]) < .035);
  report.checks.doorAnglesUnchanged = Object.values(report.comparison).every(point => point.doorAngleDelta.every(delta => Math.abs(delta) < .001));
  report.checks.localizedLightsAdded = report.checkpoints.closed.scene.lights === baseline.checkpoints.closed.scene.lights + 12;
}

try {
  let targets;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { targets = await (await fetch('http://127.0.0.1:9343/json/list')).json(); if (targets.length) break; } catch {}
    await delay(100);
  }
  if (!targets?.length) throw new Error('Chromium remote debugging did not start');
  const socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  connection = new CDP(socket);
  connection.on('Runtime.exceptionThrown', e => report.errors.push(e.exceptionDetails.exception?.description || e.exceptionDetails.text));
  connection.on('Runtime.consoleAPICalled', e => { if (e.type === 'error') report.errors.push(e.args.map(argument => argument.value ?? argument.description).join(' ')); });
  connection.on('Log.entryAdded', e => {
    if (e.entry.level === 'error') (e.entry.source === 'network' ? report.resourceErrors : report.errors).push({ text: e.entry.text, url: e.entry.url });
    else if (e.entry.level === 'warning') report.consoleWarnings.push(e.entry.text);
  });
  connection.on('Network.loadingFailed', e => report.networkFailures.push({ error: e.errorText, canceled: e.canceled || false, type: e.type }));
  const sourceRequests = new Map();
  connection.on('Network.responseReceived', e => {
    if (/\/prototype\/(?:maison-noire\.html|entrance(?:-textures)?\.js|interior-materials\.js|interior-lighting\.js)(?:\?|$)/.test(e.response.url)) sourceRequests.set(e.requestId, e.response.url);
    if (/\/assets\/interior\/.*\.(webp|hdr)$/.test(e.response.url)) report.assetResources[e.response.url] = { status: e.response.status, mimeType: e.response.mimeType };
  });
  connection.on('Network.loadingFinished', e => {
    const url = sourceRequests.get(e.requestId);
    if (url) bodyTasks.push(connection.send('Network.getResponseBody', { requestId: e.requestId }).then(response => {
      const source = response.base64Encoded ? Buffer.from(response.body, 'base64') : Buffer.from(response.body);
      const basename = path.basename(new URL(url).pathname), disk = fs.readFileSync(path.join(output, '../../public/prototype', basename));
      report.loadedSources[url] = { sha256: hash(source), diskSha256: hash(disk), matchesDisk: hash(source) === hash(disk), sourceVegetationPresent: basename === 'entrance.js' && /leafMaterial|leafGeometry|planterMaterial|branchGeometry|Olivier|entrance-olive-uplight|boundInstances/.test(source.toString()) };
    }).catch(error => report.errors.push(String(error))));
  });
  await Promise.all([connection.send('Page.enable'), connection.send('Runtime.enable'), connection.send('Log.enable'), connection.send('Network.enable')]);
  await connection.send('Network.setCacheDisabled', { cacheDisabled: true });
  await connection.send('Emulation.setDeviceMetricsOverride', { ...report.viewport, deviceScaleFactor: 1, mobile: false });
  await connection.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await connection.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { let three; Object.defineProperty(window, 'THREE', { configurable:true, get:()=>three, set(value) { three=value; let Renderer; Object.defineProperty(value, 'WebGLRenderer', { configurable:true, enumerable:true, get:()=>Renderer, set(original) { Renderer = new Proxy(original, { construct(target,args,newTarget) { const renderer=Reflect.construct(target,args,newTarget); const render=renderer.render; renderer.render=function(scene,camera) { const main=scene.children.length>100 && this.getRenderTarget()===null; if(!main) return render.apply(this,arguments); window.__entranceQA={scene,camera,renderer:this}; this.info.reset(); const auto=this.info.autoReset; this.info.autoReset=false; const p=camera.position.toArray(),q=camera.quaternion.toArray(),m=camera.projectionMatrix.elements.slice(); try { return render.apply(this,arguments); } finally { window.__lightingFrameStats={...this.info.render}; window.__lightingCameraStable=window.__lightingCameraStable!==false && p.every((v,i)=>v===camera.position.toArray()[i]) && q.every((v,i)=>v===camera.quaternion.toArray()[i]) && m.every((v,i)=>v===camera.projectionMatrix.elements[i]); this.info.autoReset=auto; } }; return renderer; } }); } }); } }); })();` });
  await connection.send('Page.navigate', { url: report.url });
  await waitFor(() => !!window.__entranceQA && window.__entranceQA.scene.children.length > 100);
  await waitForArchitecture();
  await evaluate(async () => { await document.fonts.ready; });
  await delay(900);
  report.checkpoints.closed = await snapshot();
  report.composition.desktop1780 = await composition();
  report.checkpoints.closed.screenshot = await screenshot('closed');
  if (beforeOnly || previewOnly) {
    await scrollToFraction(1 / 18);
    report.checkpoints.open = await snapshot();
    report.checkpoints.open.screenshot = await screenshot('open');
    await scrollToFraction(1 / 6);
    await waitFor(() => Number(getComputedStyle(document.getElementById('card')).opacity) > .98);
    report.checkpoints.firstVitrine = await snapshot();
    report.checkpoints.firstVitrine.screenshot = await screenshot('first-vitrine');
    fs.writeFileSync(path.join(output, beforeOnly ? 'before-report.json' : 'preview-report.json'), JSON.stringify(report, null, 2));
    console.log('Before captures saved: closed, open, first-vitrine.');
    process.exitCode = report.errors.length ? 1 : 0;
  } else {
  console.log('Closed doors and desktop composition captured.');

  await connection.send('Emulation.setDeviceMetricsOverride', { width: 1870, height: 930, deviceScaleFactor: 1, mobile: false });
  await delay(500);
  report.composition.desktop1870 = await composition();
  report.composition.desktop1870.screenshot = await screenshot('desktop-1870');
  await connection.send('Emulation.setDeviceMetricsOverride', { ...report.viewport, deviceScaleFactor: 1, mobile: false });
  await delay(300);

  await connection.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 1000, y: 400, deltaX: 0, deltaY: 140 });
  await waitFor(() => scrollY >= 100);
  report.checks.mouseWheelScrolls = await evaluate(() => scrollY > 0);
  await scrollToFraction(1 / 36);
  report.checkpoints.halfOpen = await snapshot();
  report.checkpoints.halfOpen.screenshot = await screenshot('half-open');
  await scrollToFraction(1 / 18);
  report.checkpoints.open = await snapshot();
  report.checkpoints.open.screenshot = await screenshot('open');
  await scrollToFraction(.1);
  report.checkpoints.passage = await snapshot();
  report.checkpoints.passage.screenshot = await screenshot('passage');
  console.log('Half-open, open, and passage captured.');
  await scrollToFraction(1 / 6);
  await waitFor(() => Number(getComputedStyle(document.getElementById('card')).opacity) > .98);
  report.checkpoints.firstVitrine = await snapshot();
  report.checkpoints.firstVitrine.screenshot = await screenshot('first-vitrine');
  report.checks.firstVitrineVisible = report.checkpoints.firstVitrine.ui.cardOpacity > .95 && report.checkpoints.firstVitrine.ui.cardTitle === 'Bague Aurore';
  await clickId('add');
  report.checks.addToCart = await evaluate(() => document.getElementById('cartB').textContent === 'Panier (1)');
  await clickId('allB');
  report.checks.catalogueOpens = await evaluate(() => document.getElementById('all').classList.contains('o'));
  report.checks.catalogueContainsSixProducts = await evaluate(() => document.querySelectorAll('#list .li').length === 6);
  report.checks.cartTotalCorrect = await evaluate(() => document.getElementById('tot').textContent.replace(/\s/g, '') === '890€');
  await screenshot('catalogue');
  await clickId('cl');
  report.checks.returnToBoutique = await evaluate(() => !document.getElementById('all').classList.contains('o'));
  await clickId('cartB');
  report.checks.cartButtonOpens = await evaluate(() => document.getElementById('all').classList.contains('o'));
  await clickId('cl');
  const names = ['Bague Aurore', 'Collier Lune', 'Boucles Étoile', 'Bracelet Soleil', 'Bague Nuit', 'Collier Cœur'];
  report.sixVitrines = [report.checkpoints.firstVitrine];
  for (let i = 1; i < 6; i++) {
    await scrollToFraction((i + 1) / 6);
    await waitFor(() => Number(getComputedStyle(document.getElementById('card')).opacity) > .98);
    report.sixVitrines.push(await snapshot());
  }
  report.checks.allSixVitrinesReachable = report.sixVitrines.every((point, i) => point.ui.cardTitle === names[i] && point.ui.cardOpacity > .95);
  report.performance = await evaluate(() => new Promise(resolve => {
    const samples = []; const start = performance.now(); let previous = start;
    function sample(now) { samples.push(now - previous); previous = now; if (now - start < 1200) requestAnimationFrame(sample); else { const ordered = samples.slice(1).sort((a, b) => a - b); resolve({ durationMs: now - start, frames: ordered.length, meanFrameMs: ordered.reduce((a, b) => a + b, 0) / ordered.length, p95FrameMs: ordered[Math.floor((ordered.length - 1) * .95)], maxFrameMs: Math.max(...ordered), renderer: navigator.userAgent, softwareRendering: true }); } }
    requestAnimationFrame(sample);
  }));
  report.checks.twoDoorPivots = report.checkpoints.closed.doors.length === 2;
  report.checks.closedAtStart = report.checkpoints.closed.doors.every(d => Math.abs(d.rotation[1]) < .001);
  report.checks.fullOpeningAngle = report.checkpoints.open.doors.length === 2 && Math.abs(report.checkpoints.open.doors[0].rotation[1] - 1.45) < .01 && Math.abs(report.checkpoints.open.doors[1].rotation[1] + 1.45) < .01;
  report.checks.glassDimensionsPreserved = Object.values(report.checkpoints).every(point => point.doors.every(d => d.glass.some(g => g.dimensions.width === 1.1 && g.dimensions.height === 2.9 && g.dimensions.depth === .03)));
  report.checks.glassTransparentWithSubtleReflections = report.checkpoints.closed.doors.every(d => d.glass.some(g => g.transparent && g.opacity > 0 && g.opacity <= .08 && g.roughness > 0 && g.roughness < .1 && g.metalness === 0 && g.depthWrite === false && g.envMapIntensity <= .6));
  report.checks.noVegetationOrInstances = Object.values(report.checkpoints).every(point => point.instances.length === 0 && point.vegetationObjects.length === 0);
  await scrollToFraction(0);
  report.checkpoints.returnClosed = await snapshot();
  report.checkpoints.returnClosed.screenshot = await screenshot('return-closed');
  report.checks.returnClosesDoors = report.checkpoints.returnClosed.doors.every(d => Math.abs(d.rotation[1]) < .001);
  compareBaseline();
  console.log('All six vitrines, cart, catalogue, and return navigation checked.');

  await connection.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await delay(500);
  report.mobile = { viewport: { width: 390, height: 844 }, closed: await snapshot() };
  report.composition.mobile390 = await composition();
  report.mobile.closed.screenshot = await screenshot('mobile-closed');
  await scrollToFraction(1 / 6);
  await waitFor(() => Number(getComputedStyle(document.getElementById('card')).opacity) > .98);
  report.mobile.firstVitrine = await snapshot();
  report.mobile.firstVitrine.screenshot = await screenshot('mobile-first-vitrine');
  report.checks.mobileCameraFov = report.mobile.closed.camera.fov === 66;
  report.checks.mobileFirstVitrineVisible = report.mobile.firstVitrine.ui.cardOpacity > .95 && report.mobile.firstVitrine.ui.cardTitle === 'Bague Aurore';
  report.checks.desktopIntroClearOfDoorway = [report.composition.desktop1780, report.composition.desktop1870].every(c => c.headingText.right <= c.doorway.left + 2 && c.paragraphText.right <= c.doorway.left + 2);
  const mobile = report.composition.mobile390;
  report.checks.mobileIntroContained = mobile.documentWidth <= mobile.viewport.width && mobile.headingText.left >= 0 && mobile.headingText.right <= mobile.viewport.width && mobile.paragraphText.right <= mobile.viewport.width && mobile.intro.bottom <= mobile.viewport.height;

  await connection.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await connection.send('Page.navigate', { url: report.url });
  await waitFor(() => !!window.__entranceQA && window.__entranceQA.scene.children.length > 100);
  await waitForArchitecture();
  report.standardMotion = { beforeWheel: await snapshot() };
  await connection.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 400, deltaX: 0, deltaY: 240 });
  await waitFor(() => scrollY > 100);
  await waitFor(() => { let opens = false; window.__entranceQA.scene.traverse(o => { if (o.isGroup && Math.abs(o.position.x + 1.15) < .0001 && Math.abs(o.position.z - 8.1) < .0001 && o.rotation.y > .01) opens = true; }); return opens; });
  report.standardMotion.afterWheel = await snapshot();
  report.checks.standardMotionWheelScrolls = report.standardMotion.afterWheel.scrollY > report.standardMotion.beforeWheel.scrollY;
  report.checks.standardMotionDoorsOpenCorrectly = report.standardMotion.afterWheel.doors.length === 2 && report.standardMotion.afterWheel.doors[0].rotation[1] > 0 && report.standardMotion.afterWheel.doors[1].rotation[1] < 0;
  report.programs = await evaluate(() => {
    const renderer = window.__entranceQA.renderer, gl = renderer.getContext();
    return renderer.info.programs.map(program => ({ id: program.id, linked: gl.getProgramParameter(program.program, gl.LINK_STATUS), log: gl.getProgramInfoLog(program.program) }));
  });
  await Promise.allSettled(bodyTasks);
  report.checks.shadersLinked = report.programs.length > 0 && report.programs.every(program => program.linked);
  report.checks.loadedCurrentProductionSources = Object.keys(report.loadedSources).length === 5 && Object.values(report.loadedSources).every(source => source.matchesDisk);
  report.checks.pbrTexturesAndHdriLoaded = Object.keys(report.assetResources).length === 7 && Object.values(report.assetResources).every(asset => asset.status === 200);
  report.checks.vegetationSourceRemoved = Object.entries(report.loadedSources).some(([url, source]) => /\/entrance\.js$/.test(url) && !source.sourceVegetationPresent);
  report.checks.noRuntimeErrors = report.errors.length === 0;
  report.lighting = await evaluate(() => {
    const { scene, renderer } = window.__entranceQA;
    const shadows = [], reflections = [];
    let receivers = 0, casters = 0;
    scene.traverse(object => {
      if (object.receiveShadow) receivers++;
      if (object.isMesh && object.castShadow) casters++;
      if (object.isLight && object.castShadow) shadows.push({
        width: object.shadow.map?.width, height: object.shadow.map?.height,
        bias: object.shadow.bias, normalBias: object.shadow.normalBias,
      });
      if (object.isReflector) reflections.push({
        width: object.getRenderTarget().width, height: object.getRenderTarget().height,
        transparent: object.material.transparent, depthWrite: object.material.depthWrite,
        position: object.position.toArray(),
      });
    });
    return { shadows, reflections, casters, receivers, cameraStable: window.__lightingCameraStable,
      shadowEnabled: renderer.shadowMap.enabled, shadowAutoUpdate: renderer.shadowMap.autoUpdate,
      frameIncludesReflectionPass: true };
  });
  report.checks.realShadowMapsRendered = report.lighting.shadowEnabled && report.lighting.shadows.length === 2
    && report.lighting.shadows.every(light => light.width >= 512 && light.height >= 512);
  report.checks.staticShadowsNotRepeatedPerFrame = report.lighting.shadowAutoUpdate === false;
  report.checks.realPlanarReflectionBounded = report.lighting.reflections.length === 1
    && report.lighting.reflections[0].width <= 1024 && report.lighting.reflections[0].transparent;
  report.checks.reflectionDoesNotMutateVisitCamera = report.lighting.cameraStable === true;
  report.passed = Object.values(report.checks).every(Boolean);
  fs.writeFileSync(path.join(output, 'final-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, checks: report.checks, performance: report.performance, errors: report.errors, resourceErrors: report.resourceErrors, networkFailures: report.networkFailures, sources: report.loadedSources, files: Object.values(report.checkpoints).map(p => p.screenshot) }, null, 2));
  if (!report.passed) process.exitCode = 1;
  }
} catch (error) {
  report.fatal = error.stack;
  fs.writeFileSync(path.join(output, 'final-report.json'), JSON.stringify(report, null, 2));
  console.error(error); process.exitCode = 1;
} finally {
  connection?.close(); launch.kill(); await delay(1800);
  const resolved = path.resolve(profile);
  if (path.dirname(resolved) === path.resolve(os.tmpdir()) && path.basename(resolved).startsWith('maison-noire-entrance-correction-qa-')) {
    try { fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 12, retryDelay: 200 }); } catch (error) { console.error('Profile cleanup:', String(error)); }
  }
}
