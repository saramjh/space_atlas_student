#!/usr/bin/env node
// Regression of code-smell issues that escaped static build verification.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

class FakeElement {
  constructor(name = '') {
    this.id = name;
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.style = {};
    this.dataset = {};
    this.attrs = {};
    this.handlers = new Map();
    this.innerHTML = '';
    this.textContent = '';
    this.isConnected = true;
    this.children = [];
  }
  addEventListener(name, fn) { this.handlers.set(name, fn); }
  dispatch(name, payload = {}) {
    assert.ok(this.handlers.has(name), `missing event ${name}`);
    this.handlers.get(name)({target:this, currentTarget:this, preventDefault() {}, ...payload});
  }
  setAttribute(k,v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k]; }
  focus() { if (this.document) this.document.activeElement = this; }
  replaceChildren() { this.children = []; this.innerHTML = ''; }
  append(element) { this.children.push(element); }
  appendChild(element) { this.children.push(element); }
  querySelector(selector) {
    if (selector === 'a.search-item' && this.innerHTML.includes('class="search-item"'))
      return {href:'/space_atlas_student/moon/phases/'};
    return null;
  }
  querySelectorAll(selector) { return []; }
}
async function testSearch() {
  const ids = new Map();
  const doc = {
    readyState:'complete',
    activeElement:null,
    body: {style:{}},
    createElement(){return new FakeElement();},
    querySelector(sel) {
      if (sel === 'link[rel="icon"]') return {getAttribute:() => '/space_atlas_student/assets/favicon.svg'};
      if (!ids.has(sel)) {const element=new FakeElement(sel);element.document=doc;ids.set(sel,element);}
      return ids.get(sel);
    }
  };
  const trigger = doc.querySelector('#searchTrigger');
  const input = doc.querySelector('#searchInput');
  const close = doc.querySelector('#searchClose');
  const modal = doc.querySelector('#searchModal');
  const results = doc.querySelector('#searchResults');
  modal.hidden=true;
  trigger.focus();
  let resolveFetch;
  const fetch = () => new Promise(resolve => {resolveFetch=resolve;});
  const winHandlers = new Map();
  const win = {
    location: {href:'/'},
    addEventListener(event, fn) {winHandlers.set(event,fn);}
  };
  const context = {window:win, document:doc, fetch, console, setTimeout};
  runInNewContext(readFileSync('assets/js/search-modal.js','utf8'),context);

  trigger.dispatch('click');
  assert.equal(modal.hidden,false);
  assert.equal(doc.activeElement,input);
  input.value = 'moon';
  input.dispatch('input');
  assert.ok(results.children[0].textContent.includes('Loading'));
  // Resolve the network request after the learner has already typed.
  resolveFetch({ok:true,json:async()=>[
    {title:'Moon phases',desc:'Moon Earth',kicker:'Moon',path:'/moon/phases/'},
    {title:'Mars facts',desc:'Mars only',kicker:'Solar System',path:'/solar-system/planet-types/'},
  ]});
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.ok(results.innerHTML.includes('Moon phases'), 'deferred index should render the waiting query');

  close.focus();
  winHandlers.get('keydown')({key:'Enter', preventDefault(){}, shiftKey:false});
  assert.equal(win.location.href,'/','Enter on Close must not navigate search result');
  close.dispatch('click');
  assert.equal(modal.hidden,true);
  assert.equal(doc.activeElement,trigger,'focus restored after close');

  trigger.dispatch('click');
  for (let i=0; i<3; i++) await Promise.resolve();
  input.value='moon';
  input.dispatch('input');
  input.focus();
  winHandlers.get('keydown')({key:'Enter', preventDefault(){}, shiftKey:false});
  assert.equal(win.location.href,'/space_atlas_student/moon/phases/','Enter in input selects first matching result');
}
function testVisibilityLoop() {
  let visible = true;
  const listeners = new Map();
  const frames = new Map();
  let seq = 0, now = 1000, renders = 0;
  const doc = {
    get hidden(){return !visible;},
    addEventListener:(name,fn)=>listeners.set(name,fn),
    removeEventListener:(name)=>listeners.delete(name)
  };
  const context = {
    document:doc,performance:{now:()=>now},
    requestAnimationFrame(fn){const id=++seq;frames.set(id,fn);return id;},
    cancelAnimationFrame(id){frames.delete(id);}
  };
  const src=readFileSync('assets/js/three-base.js','utf8');
  const fragment=src.slice(src.indexOf('export function animateLoop(')).replace('export function animateLoop','function animateLoop');
  runInNewContext(fragment+';this.makeLoop=animateLoop;',context);
  const dispose=context.makeLoop(()=>renders++);
  assert.equal(frames.size,1);
  function tick(){const [id,fn]=frames.entries().next().value;frames.delete(id);now+=16.67;fn(now);}
  tick();assert.equal(renders,1);
  visible=false;listeners.get('visibilitychange')();
  assert.equal(frames.size,0,'hidden tab must stop scheduling new work');
  visible=true;now+=50000;listeners.get('visibilitychange')();
  assert.equal(frames.size,1);
  tick();assert.equal(renders,2,'restored tab resumes');
  dispose();assert.equal(frames.size,0);assert.equal(listeners.size,0);
}
function testQuizAnnouncements(){
 const src=readFileSync('assets/js/quiz-widget.js','utf8')
   .replaceAll('export function','function');
 const ids = new Map();
 const get=id=>{if(!ids.has(id))ids.set(id,new FakeElement(id));return ids.get(id);};
 const doc={querySelector:get,createElement:()=>new FakeElement()};
 // Test the actual shared code, not markup from one particular lesson.
 const cx={document:doc};
 runInNewContext(src+';this.initQuiz=initQuiz;',cx);
 cx.initQuiz([{q:'Test?',options:[{label:'Yes',correct:true}],right:'Correct',wrong:'Incorrect'}]);
 const feedback=get('#quizFeedback');
 assert.equal(feedback.attrs['role'],'status');
 assert.equal(feedback.attrs['aria-live'],'polite');
 assert.equal(feedback.attrs['aria-atomic'],'true');
}
await testSearch();
testVisibilityLoop();
testQuizAnnouncements();
console.log('Code quality regressions: late search index, keyboard close/focus, hidden RAF, accessible quiz feedback PASS');
