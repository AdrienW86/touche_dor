/* Browser QA uses native CDP because the local Playwright package is incomplete. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const mode = process.argv[2] || 'final';
if (!['baseline', 'final'].includes(mode)) throw new Error('Usage: node verify-browser.mjs baseline|final');
const output = path.dirname(fileURLToPath(import.meta.url));
const chrome = 'C:/Users/Adrien/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const report = { mode, url: 'http://localhost:3000', viewport: { width: 1780, height: 883 }, loadedScripts: {}, browserPreferences: { reducedMotion: 'reduce', reason: 'Use the existing production reduced-motion path for exact, deterministic scroll checkpoints under software rendering.' }, errors: [], resourceErrors: [], networkFailures: [], consoleWarnings: [], checkpoints: {}, checks: {} };
const profile = path.join(os.tmpdir(), `maison-noire-entrance-qa-${mode}-${process.pid}`);
const launch = spawn(chrome, ['--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--disable-smooth-scrolling', '--disable-dev-shm-usage', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9334', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let connection;

function compareSavedReports() {
  const beforePath = path.join(output, 'baseline-report.json'), afterPath = path.join(output, 'final-report.json');
  if (!fs.existsSync(beforePath) || !fs.existsSync(afterPath)) return;
  const before = JSON.parse(fs.readFileSync(beforePath, 'utf8')), after = JSON.parse(fs.readFileSync(afterPath, 'utf8'));
  if (before.fatal || after.fatal || before.browserPreferences?.reducedMotion !== after.browserPreferences?.reducedMotion) return;
  if (!Object.keys(after.checkpoints).every(key => before.checkpoints[key])) return;
  after.comparison = {};
  for (const key of Object.keys(after.checkpoints)) {
    const a = before.checkpoints[key], b = after.checkpoints[key];
    after.comparison[key] = { cameraPositionDelta: b.camera.position.map((n,i) => n-a.camera.position[i]), doorPivotPositionsEqual: JSON.stringify(a.doors.map(d=>d.position)) === JSON.stringify(b.doors.map(d=>d.position)), doorAngleDelta: b.doors.map((d,i) => d.rotation[1] - a.doors[i].rotation[1]) };
  }
  after.checks.doorPivotsUnchanged = Object.values(after.comparison).every(point => point.doorPivotPositionsEqual);
  after.checks.cameraPathUnchanged = Object.values(after.comparison).every(point => Math.abs(point.cameraPositionDelta[0]) < .015 && Math.abs(point.cameraPositionDelta[2]) < .035);
  after.checks.sceneLightCountUnchanged = Object.keys(after.checkpoints).every(key => before.checkpoints[key].scene.lights === after.checkpoints[key].scene.lights);
  after.passed = Object.values(after.checks).every(Boolean);
  fs.writeFileSync(afterPath, JSON.stringify(after, null, 2));
}

class CDP {
  constructor(socket) { this.socket = socket; this.seq = 0; this.pending = new Map(); this.listeners = new Map(); socket.addEventListener('message', event => { const message = JSON.parse(event.data); if (message.id) { const entry = this.pending.get(message.id); if (entry) { this.pending.delete(message.id); if (message.error) entry.reject(new Error(JSON.stringify(message.error))); else entry.resolve(message.result); } } else { for (const callback of this.listeners.get(message.method) || []) callback(message.params); } }); }
  on(method, callback) { this.listeners.set(method, [...(this.listeners.get(method) || []), callback]); }
  send(method, params = {}) { return new Promise((resolve, reject) => { const id = ++this.seq; this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })); }); }
}

async function evaluate(fn, inFrame = true) {
  const expression = inFrame ? `(() => { const target = document.querySelector('iframe')?.contentWindow || window; return target.eval(${JSON.stringify(`(${fn.toString()})()`)}); })()` : `(${fn.toString()})()`;
  const result = await connection.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function waitFor(fn, timeout = 60000) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeout) { try { if (await evaluate(fn)) return; } catch (error) { lastError = String(error); } await delay(250); }
  report.lastState = await evaluate(() => ({ scrollY, height: document.body.scrollHeight, viewportHeight: innerHeight, progress: document.getElementById('bar')?.style.width, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches }));
  if (lastError) report.lastWaitError = lastError;
  throw new Error(`Timed out waiting for ${fn.toString()}`);
}

async function screenshot(name) {
  const result = await connection.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true });
  const target = path.join(output, `${mode}-${name}.png`);
  fs.writeFileSync(target, Buffer.from(result.data, 'base64'));
  return path.basename(target);
}

async function snapshot() {
  return evaluate(() => {
    const { scene, camera, renderer } = window.__entranceQA;
    const doors = []; scene.traverse(o => { if (o.isGroup && Math.abs(Math.abs(o.position.x) - 1.15) < .0001 && Math.abs(o.position.z - 8.1) < .0001) doors.push(o); }); doors.sort((a, b) => a.position.x - b.position.x);
    const vector = v => v.toArray().map(n => Math.round(n * 1e6) / 1e6);
    const bounds = o => { const box = new THREE.Box3().setFromObject(o); return { min: vector(box.min), max: vector(box.max) }; };
    const materials = new Set(), geometries = new Set(); let meshes = 0, lights = 0, physicalGlass = 0;
    const instances = [], frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    scene.traverse(o => { if (o.isInstancedMesh) instances.push({ name: o.name, count: o.count, frustumCulled: o.frustumCulled, intersectsFrustum: frustum.intersectsObject(o), bounds: o.geometry.boundingSphere ? { center: vector(o.geometry.boundingSphere.center), radius: o.geometry.boundingSphere.radius } : null, worldPosition: vector(o.getWorldPosition(new THREE.Vector3())) }); });
    scene.traverse(o => { if (o.isMesh) { meshes++; geometries.add(o.geometry); for (const m of Array.isArray(o.material) ? o.material : [o.material]) { materials.add(m); if (m.isMeshPhysicalMaterial && m.transparent) physicalGlass++; } } if (o.isLight) lights++; });
    return { scrollY, scrollFraction: scrollY / (document.body.scrollHeight - innerHeight), camera: { position: vector(camera.position), quaternion: vector(camera.quaternion), fov: camera.fov, near: camera.near, far: camera.far }, doors: doors.map(o => ({ position: vector(o.position), rotation: vector(o.rotation).slice(0, 3), bounds: bounds(o), children: o.children.length, glass: o.children.filter(c => c.isMesh && c.material?.isMeshPhysicalMaterial && c.material.transparent).map(c => ({ dimensions: c.geometry.parameters, position: vector(c.position), opacity: c.material.opacity, roughness: c.material.roughness, metalness: c.material.metalness, transmission: c.material.transmission, depthWrite: c.material.depthWrite })) })), render: { ...renderer.info.render }, memory: { ...renderer.info.memory }, scene: { meshes, lights, materials: materials.size, geometries: geometries.size, physicalGlass }, instances, ui: { introOpacity: Number(getComputedStyle(document.getElementById('intro')).opacity), cardOpacity: Number(getComputedStyle(document.getElementById('card')).opacity), cardTitle: document.getElementById('nm').textContent, cart: document.getElementById('cartB').textContent, catalogueOpen: document.getElementById('all').classList.contains('o') } };
  });
}

async function scrollToFraction(fraction) {
  await evaluate(new Function(`scrollTo(0, ${fraction} * (document.body.scrollHeight - innerHeight));`));
  await waitFor(new Function(`scrollTo(0, ${fraction} * (document.body.scrollHeight - innerHeight)); return Math.abs(parseFloat(document.getElementById('bar').style.width) / 100 - ${fraction}) < .0002;`));
  await delay(450);
}

async function clickId(id) {
  const rect = await evaluate(new Function(`const r = document.getElementById(${JSON.stringify(id)}).getBoundingClientRect(); return { x:r.x+r.width/2, y:r.y+r.height/2 };`));
  await connection.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y });
  await connection.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  await connection.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  await delay(300);
}

(async () => {
  try {
    let targets;
    for (let attempt = 0; attempt < 100; attempt++) { try { targets = await (await fetch('http://127.0.0.1:9334/json/list')).json(); if (targets.length) break; } catch {} await delay(100); }
    if (!targets?.length) throw new Error('Chromium remote debugging did not start');
    const socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    connection = new CDP(socket);
    connection.on('Runtime.exceptionThrown', e => report.errors.push(e.exceptionDetails.exception?.description || e.exceptionDetails.text));
    connection.on('Runtime.consoleAPICalled', event => { if (event.type === 'error') report.errors.push(event.args.map(argument => argument.value ?? argument.description).join(' ')); });
    connection.on('Log.entryAdded', e => { if (e.entry.level === 'error') { const target = e.entry.source === 'network' ? report.resourceErrors : report.errors; target.push({ text: e.entry.text, url: e.entry.url }); } else if (e.entry.level === 'warning') report.consoleWarnings.push(e.entry.text); });
    connection.on('Network.loadingFailed', e => report.networkFailures.push({ error: e.errorText, canceled: e.canceled || false, type: e.type }));
    const scriptRequests = new Map();
    connection.on('Network.responseReceived', event => { if (/\/prototype\/entrance(?:-textures)?\.js(?:\?|$)/.test(event.response.url)) scriptRequests.set(event.requestId, event.response.url); });
    connection.on('Network.loadingFinished', event => { const url = scriptRequests.get(event.requestId); if (url) connection.send('Network.getResponseBody', { requestId: event.requestId }).then(response => { const source = response.base64Encoded ? Buffer.from(response.body, 'base64') : Buffer.from(response.body); report.loadedScripts[url] = { sha256: createHash('sha256').update(source).digest('hex'), containsBoundInstances: source.toString().includes('function boundInstances') }; }).catch(error => report.errors.push(String(error))); });
    await Promise.all([connection.send('Page.enable'), connection.send('Runtime.enable'), connection.send('Log.enable'), connection.send('Network.enable')]);
    await connection.send('Network.setCacheDisabled', { cacheDisabled: true });
    await connection.send('Emulation.setDeviceMetricsOverride', { ...report.viewport, deviceScaleFactor: 1, mobile: false });
    await connection.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    if (mode === 'baseline') {
      const original = fs.readFileSync(path.join(output, 'original.html')).toString('base64');
      connection.on('Fetch.requestPaused', event => { connection.send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }], body: original }).catch(error => report.errors.push(String(error))); });
      await connection.send('Fetch.enable', { patterns: [{ urlPattern: '*prototype/maison-noire.html', requestStage: 'Request' }] });
    }
    await connection.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { let three; Object.defineProperty(window, 'THREE', { configurable:true, get:()=>three, set(value) { three=value; let Renderer; Object.defineProperty(value, 'WebGLRenderer', { configurable:true, enumerable:true, get:()=>Renderer, set(original) { Renderer = new Proxy(original, { construct(target,args,newTarget) { const renderer=Reflect.construct(target,args,newTarget); const render=renderer.render; renderer.render=function(scene,camera) { if(scene.children.length>100) window.__entranceQA={scene,camera,renderer:this}; return render.apply(this,arguments); }; return renderer; } }); } }); } }); })();` });
    await connection.send('Page.navigate', { url: report.url });
    await waitFor(() => !!window.__entranceQA && window.__entranceQA.scene.children.length > 100);
    await evaluate(async () => { await document.fonts.ready; });
    await delay(2000);
    if (process.argv.includes('--shader-only')) {
      const programs = await evaluate(() => { const renderer = window.__entranceQA.renderer, gl = renderer.getContext(); return renderer.info.programs.map(program => ({ id: program.id, linked: gl.getProgramParameter(program.program, gl.LINK_STATUS), log: gl.getProgramInfoLog(program.program) })); });
      const shaderReport = { mode, programs, errors: report.errors, loadedScripts: report.loadedScripts, passed: programs.length > 0 && programs.every(program => program.linked) && report.errors.length === 0 };
      fs.writeFileSync(path.join(output, `${mode}-shader-report.json`), JSON.stringify(shaderReport, null, 2));
      console.log(JSON.stringify(shaderReport, null, 2));
      if (!shaderReport.passed) process.exitCode = 1;
      return;
    }
    report.checkpoints.closed = await snapshot();
    report.checkpoints.closed.screenshot = await screenshot('closed');
    console.log(`${mode}: closed capture saved`);
    await connection.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 1000, y: 400, deltaX: 0, deltaY: 140 });
    await waitFor(() => scrollY >= 100);
    await delay(600);
    report.checks.mouseWheelScrolls = await evaluate(() => scrollY > 0);
    await scrollToFraction(1 / 36);
    report.checkpoints.halfOpen = await snapshot();
    report.checkpoints.halfOpen.screenshot = await screenshot('half-open');
    await scrollToFraction(1 / 18);
    report.checkpoints.open = await snapshot();
    report.checkpoints.open.screenshot = await screenshot('open');
    console.log(`${mode}: opening captures saved`);
    await scrollToFraction(.1);
    report.checkpoints.passage = await snapshot();
    report.checkpoints.passage.screenshot = await screenshot('passage');
    await scrollToFraction(1 / 6);
    await waitFor(() => Number(getComputedStyle(document.getElementById('card')).opacity) > .98);
    report.checkpoints.firstVitrine = await snapshot();
    console.log('First vitrine render/culling:', JSON.stringify({ render: report.checkpoints.firstVitrine.render, instances: report.checkpoints.firstVitrine.instances, scripts: report.loadedScripts }));
    report.checkpoints.firstVitrine.screenshot = await screenshot('first-vitrine');
    report.checks.firstVitrineVisible = report.checkpoints.firstVitrine.ui.cardOpacity > .95 && report.checkpoints.firstVitrine.ui.cardTitle === 'Bague Aurore';
    await clickId('add');
    report.checks.addToCart = await evaluate(() => document.getElementById('cartB').textContent === 'Panier (1)');
    await clickId('allB');
    report.checks.catalogueOpens = await evaluate(() => document.getElementById('all').classList.contains('o'));
    report.checks.catalogueContainsSixProducts = await evaluate(() => document.querySelectorAll('#list .li').length === 6);
    await screenshot('catalogue');
    await clickId('cl');
    report.checks.returnToBoutique = await evaluate(() => !document.getElementById('all').classList.contains('o'));
    if (mode === 'final') report.checks.exteriorFoliageCulledFromCorridor = report.checkpoints.firstVitrine.instances.length > 0 && report.checkpoints.firstVitrine.instances.every(instance => instance.frustumCulled && !instance.intersectsFrustum);
    report.performance = await evaluate(() => new Promise(resolve => { const samples = []; const start = performance.now(); let previous = start; function sample(now) { samples.push(now - previous); previous = now; if (now - start < 1500) requestAnimationFrame(sample); else { const ordered = samples.slice(1).sort((a,b)=>a-b); resolve({ durationMs: now - start, frames: ordered.length, meanFrameMs: ordered.reduce((a,b)=>a+b,0)/ordered.length, p95FrameMs: ordered[Math.floor((ordered.length-1)*.95)], maxFrameMs: Math.max(...ordered), renderer: navigator.userAgent, hardwareConcurrency: navigator.hardwareConcurrency, softwareRendering: true }); } } requestAnimationFrame(sample); }));
    report.checks.twoDoorPivots = report.checkpoints.closed.doors.length === 2;
    report.checks.closedAtStart = report.checkpoints.closed.doors.every(d => Math.abs(d.rotation[1]) < .001);
    report.checks.fullOpeningAngle = report.checkpoints.open.doors.length === 2 && Math.abs(report.checkpoints.open.doors[0].rotation[1] - 1.45) < .01 && Math.abs(report.checkpoints.open.doors[1].rotation[1] + 1.45) < .01;
    report.checks.glassPreserved = Object.values(report.checkpoints).every(point => point.doors.every(d => d.glass.some(g => g.dimensions.width === 1.1 && g.dimensions.height === 2.9 && g.dimensions.depth === .03)));
    await scrollToFraction(0);
    report.checkpoints.returnClosed = await snapshot();
    report.checkpoints.returnClosed.screenshot = await screenshot('return-closed');
    report.checks.returnClosesDoors = report.checkpoints.returnClosed.doors.every(d => Math.abs(d.rotation[1]) < .001);
    await connection.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    await delay(500);
    report.mobile = { viewport: { width: 390, height: 844 }, closed: await snapshot() };
    report.mobile.closed.screenshot = await screenshot('mobile-closed');
    await scrollToFraction(1 / 6);
    await waitFor(() => Number(getComputedStyle(document.getElementById('card')).opacity) > .98);
    report.mobile.firstVitrine = await snapshot();
    report.mobile.firstVitrine.screenshot = await screenshot('mobile-first-vitrine');
    report.checks.mobileCameraFov = report.mobile.closed.camera.fov === 66;
    report.checks.mobileFirstVitrineVisible = report.mobile.firstVitrine.ui.cardOpacity > .95 && report.mobile.firstVitrine.ui.cardTitle === 'Bague Aurore';
    await connection.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await connection.send('Page.navigate', { url: report.url });
    await waitFor(() => !!window.__entranceQA && window.__entranceQA.scene.children.length > 100);
    report.standardMotion = { beforeWheel: await snapshot() };
    await connection.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 400, deltaX: 0, deltaY: 240 });
    await waitFor(() => scrollY > 100);
    await waitFor(() => { let opens = false; window.__entranceQA.scene.traverse(o => { if (o.isGroup && Math.abs(o.position.x + 1.15) < .0001 && Math.abs(o.position.z - 8.1) < .0001 && o.rotation.y > .01) opens = true; }); return opens; });
    report.standardMotion.afterWheel = await snapshot();
    report.checks.standardMotionWheelScrolls = report.standardMotion.afterWheel.scrollY > report.standardMotion.beforeWheel.scrollY;
    report.checks.standardMotionDoorsOpenCorrectly = report.standardMotion.afterWheel.doors.length === 2 && report.standardMotion.afterWheel.doors[0].rotation[1] > 0 && report.standardMotion.afterWheel.doors[1].rotation[1] < 0;
    report.checks.noRuntimeErrors = report.errors.length === 0;
    report.passed = Object.values(report.checks).every(Boolean);
    fs.writeFileSync(path.join(output, `${mode}-report.json`), JSON.stringify(report, null, 2));
    compareSavedReports();
    console.log(JSON.stringify({ passed: report.passed, checks: report.checks, performance: report.performance, errors: report.errors, warnings: report.consoleWarnings, files: Object.values(report.checkpoints).map(p=>p.screenshot) }, null, 2));
    if (!report.passed) process.exitCode = 1;
  } catch (error) { report.fatal = error.stack; fs.writeFileSync(path.join(output, `${mode}-report.json`), JSON.stringify(report, null, 2)); console.error(error); process.exitCode = 1; }
  finally { connection?.socket.close(); launch.kill(); await delay(1000); const resolved = path.resolve(profile); if (path.dirname(resolved) === path.resolve(os.tmpdir()) && path.basename(resolved).startsWith('maison-noire-entrance-qa-')) { try { fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch (error) { console.error('Profile cleanup:', String(error)); } } }
})();
