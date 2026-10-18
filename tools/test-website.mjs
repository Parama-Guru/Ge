import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const data=JSON.parse(await readFile(path.resolve('src','data','site.json'),'utf8'));
const base=process.env.SITE_URL || 'http://127.0.0.1:3000';
const output=path.resolve('quality');
await mkdir(output,{recursive:true});
const report={status:'running',checks:[],accessibility:[],errors:[]};
const check=(value,message)=>{assert.ok(value,message);report.checks.push(message);};
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  const ids=['index','founder','team','org','project1','project2','project3','project4','ehs','downloads'];
  let rowCount=0;
  for(const id of ids) {
    const response=await page.goto(`${base}/${id}.html`,{waitUntil:'networkidle'});
    check(response.status()===200,`Original URL works: ${id}.html`);
    check(await page.locator('h1').count()===1,`One page heading: ${id}`);
    check(await page.getByRole('link',{name:/original (content|website|archive)|browse.*archive/i}).count()===0,`No customer-facing archive links: ${id}`);
    check(await page.locator('.mode-switch,.chapter-rail,.journey-dock,.explore-panel').count()===0,`No presentation controls: ${id}`);
    if(id.startsWith('project')) {
      const actual=await page.locator('tbody tr').evaluateAll(rows=>rows.map(row=>[...row.cells].map(cell=>cell.textContent)));
      const expected=data.pages.find(p=>p.id===id).tables.flatMap(table=>table.slice(1));
      assert.deepEqual(actual,expected);
      rowCount+=actual.length;
      report.checks.push(`All project fields match: ${id}`);
    }
    if(id==='team'||id==='org') {
      const actual=await page.locator('.organisation-page > .team-tree').evaluate(root=>{
        const parse=list=>[...list.children].map(li=>({label:li.querySelector(':scope > span').textContent,children:li.querySelector(':scope > ul')?parse(li.querySelector(':scope > ul')):[]}));
        return parse(root);
      });
      assert.deepEqual(actual,data.trees[id]);
      report.checks.push(`Original organisation hierarchy preserved: ${id}`);
      check(await page.locator('.organisation-page > .team-tree > li > span').first().evaluate(element=>getComputedStyle(element).whiteSpace==='pre-line'&&element.textContent.includes('\n')),`Names and roles are visibly separated: ${id}`);
    }
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    report.accessibility.push({page:id,violations:audit.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))});
  }
  check(rowCount===45,'All 45 original project rows, including repeats, remain available');
  await page.goto(`${base}/index.html`,{waitUntil:'networkidle'});
  const home=data.pages.find(p=>p.id==='home');
  const text=await page.locator('main').innerText();
  for(const paragraph of home.paragraphs.slice(5,20)) check(text.includes(paragraph),`Homepage original content: ${paragraph.slice(0,45)}`);
  check(await page.locator('.company-clients img').count()===12,'All 12 client logos present');
  for(const image of await page.locator('img').all()) await image.evaluate(async element=>{element.loading='eager';await element.decode();});
  check(await page.locator('img').evaluateAll(images=>images.every(i=>i.naturalWidth>0)),'Homepage images decode');
  for(const width of [320,390,768,1280,1440,1920,2560]) {
    await page.setViewportSize({width,height:900});
    for(const route of ids.map(id=>`/${id}.html`)) {
      await page.goto(base+route,{waitUntil:'networkidle'});
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No document overflow: ${route} at ${width}`);
      if(route==='/project1.html'&&width<=768) check(await page.locator('.company-table-hint').isVisible(),`Mobile table scrolling is explained at ${width}px`);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Menu',exact:true}).click();
  check(await page.getByRole('dialog',{name:'Website menu'}).isVisible(),'Mobile menu opens');
  await page.keyboard.press('Escape');
  check(await page.getByRole('button',{name:'Menu',exact:true}).evaluate(e=>e===document.activeElement),'Menu returns keyboard focus');
  await page.screenshot({path:path.join(output,'website-mobile.png')});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(output,'website-desktop.png')});
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.getByLabel('Your name').fill('Website Test');
  await page.getByLabel('Email address').fill('test@example.invalid');
  await page.getByLabel('Tell us about your project').fill('Validation only; do not send.');
  await page.getByRole('button',{name:'Prepare email draft'}).click();
  check((await page.locator('.prepared-draft').getAttribute('href')).startsWith('mailto:ganeshvar@yahoo.com?'),'Enquiry prepares an email draft without a false send claim');
  check(report.errors.length===0,'No uncaught browser errors');
  const animatedContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  const animated=await animatedContext.newPage();
  animated.on('pageerror',error=>report.errors.push(error.message));
  await animated.goto(`${base}/index.html`,{waitUntil:'networkidle'});
  await animated.locator('.image-carousel').scrollIntoViewIfNeeded();
  await animated.mouse.move(0,0);
  await animated.waitForFunction(()=>document.querySelector('.image-carousel')?.getAttribute('data-active')!=='0',null,{timeout:15000});
  check(true,'Images rotate automatically without scrolling or pressing Next');
  check(await animated.locator('.carousel-stage img').count()<=3,'Only current and transition images are mounted');
  await animated.getByRole('button',{name:'Pause image rotation',exact:true}).click();
  const pausedImage=await animated.locator('.image-carousel').getAttribute('data-active');
  await animated.mouse.move(0,0);
  await animated.waitForTimeout(5600);
  check(await animated.locator('.image-carousel').getAttribute('data-active')===pausedImage,'Image pause stops automatic rotation');
  await animated.getByRole('button',{name:'Next image',exact:true}).click();
  await animated.waitForFunction(previous=>document.querySelector('.image-carousel')?.getAttribute('data-active')!==previous,pausedImage);
  check(true,'Manual image navigation remains available when paused');
  await animated.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await animated.waitForFunction(()=>document.querySelector('.cinema-shell')?.getAttribute('data-world')==='ready',null,{timeout:25000});
  check(await animated.locator('.world-stage canvas').count()===1,'Three.js renders one working background canvas');
  await animated.waitForTimeout(800);
  await animated.waitForFunction(()=>Number(document.querySelector('.world-stage canvas')?.dataset.drawCalls)>0);
  report.scene=await animated.locator('.world-stage canvas').evaluate(element=>({drawCalls:Number(element.dataset.drawCalls),triangles:Number(element.dataset.triangles)}));
  check(report.scene.drawCalls<=30&&report.scene.triangles>1000&&report.scene.triangles<=80000,'Procedural cable renders within 30 draw calls and 80k triangles');
  check(await animated.evaluate(()=>document.documentElement.dataset.motion)==='enabled','GSAP motion initializes on capable devices');
  await animated.locator('#why-us').scrollIntoViewIfNeeded();
  await animated.waitForTimeout(1000);
  const offscreenTime=await animated.locator('.world-stage canvas').getAttribute('data-elapsed');
  await animated.waitForTimeout(700);
  check(await animated.locator('.world-stage canvas').getAttribute('data-elapsed')===offscreenTime,'3D animation pauses after the hero leaves view');
  await animated.locator('#contact').scrollIntoViewIfNeeded();
  await animated.waitForTimeout(1600);
  check(await animated.locator('.company-contact [data-reveal]').evaluateAll(elements=>elements.every(e=>Number(getComputedStyle(e).opacity)>.95)),'Contact content becomes visible after scroll reveal');
  await animated.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await animated.waitForTimeout(1200);
  report.transfer=await animated.evaluate(()=>({
    encodedResourceKiB:Math.round(performance.getEntriesByType('resource').reduce((sum,entry)=>sum+(entry.encodedBodySize||0),0)/1024),
    requests:performance.getEntriesByType('resource').length,
  }));
  await animated.screenshot({path:path.join(output,'website-animated-desktop.png')});
  await animated.setViewportSize({width:390,height:844});
  await animated.goto(`${base}/index.html`,{waitUntil:'networkidle'});
  await animated.screenshot({path:path.join(output,'website-animated-mobile.png')});
  await animated.emulateMedia({reducedMotion:'reduce'});
  await animated.waitForTimeout(250);
  check(await animated.locator('.world-stage canvas').count()===0,'Changing reduced motion disables the active renderer');
  check(await animated.evaluate(()=>document.documentElement.dataset.motion!=='enabled'),'Changing reduced motion reverts GSAP animations');
  check(await animated.locator('[data-reveal]').evaluateAll(elements=>elements.every(e=>Number(getComputedStyle(e).opacity)>.95)),'Reduced motion restores all previously hidden reveal content');
  await animatedContext.close();
  const plainContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const plain=await plainContext.newPage();
  await plain.goto(`${base}/index.html`);
  check(await plain.getByRole('heading',{level:1}).isVisible(),'Company heading is readable without JavaScript');
  check(await plain.getByRole('navigation',{name:'All website pages'}).isVisible(),'All original page links work without JavaScript');
  await plain.goto(`${base}/project1.html`);
  check(await plain.locator('tbody tr').count()===13,'Project data is complete without JavaScript');
  await plainContext.close();
  const saverContext=await browser.newContext({viewport:{width:390,height:844}});
  await saverContext.addInitScript(()=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true}}));
  const saver=await saverContext.newPage();
  const saverRequests=[];
  saver.on('request',request=>saverRequests.push(request.url()));
  await saver.goto(`${base}/index.html`,{waitUntil:'networkidle'});
  await saver.waitForTimeout(1800);
  check(await saver.locator('.world-stage canvas').count()===0,'Data Saver avoids the WebGL renderer');
  check(await saver.locator('.image-carousel').getAttribute('data-rotating')==='false','Data Saver avoids automatic image downloads');
  check(!saverRequests.some(url=>/\.glb|\.gltf|\.hdr/.test(url)),'No external 3D model or lighting downloads are required');
  await saverContext.close();
  const unsupportedContext=await browser.newContext({reducedMotion:'no-preference'});
  await unsupportedContext.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(type==='webgl2'||type==='webgl')return null;
      return original.call(this,type,...args);
    };
  });
  const unsupported=await unsupportedContext.newPage();
  await unsupported.goto(`${base}/index.html`,{waitUntil:'networkidle'});
  await unsupported.waitForFunction(()=>document.querySelector('.cinema-shell')?.dataset.world==='fallback',null,{timeout:12000});
  check(await unsupported.locator('.world-status').isVisible(),'Unavailable WebGL reports an honest fallback');
  check(await unsupported.getByRole('heading',{level:1}).isVisible(),'Company content remains visible without WebGL');
  await unsupportedContext.close();
  check(report.errors.length===0,'Animation and static pages have no uncaught browser errors');
  const violations=report.accessibility.flatMap(p=>p.violations.map(v=>({page:p.page,...v})));
  if(violations.length) console.log(JSON.stringify(violations,null,2));
  check(violations.length===0,'No automated WCAG A/AA violations in inspected pages');
  report.status='passed';
  console.log(JSON.stringify({status:report.status,checks:report.checks.length,projectRows:rowCount,transfer:report.transfer}));
} catch(error) {report.status='failed';report.failure=error.message;console.error(error);process.exitCode=1;}
finally {report.checkedAt=new Date().toISOString();await writeFile(path.join(output,'website-validation.json'),JSON.stringify(report,null,2));await browser.close();}
