import {populateStory,describeFocal,describeFamily,describeSankey,describeState,number,date} from './story.js?v=20261014-7';

const chartFiles=[
  'c01-treemap.vg.json','c02-coverage.vl.json','c03-richness.vl.json','c04-threatened-share-map.vl.json',
  'c05-records-timeline.vl.json','c06-species-points.vl.json','c07-waffle.vl.json','c08-family-status-sankey.vg.json',
  'c09-listing-matrix.vl.json','c10-threatened-count-map.vl.json','c11-protection-histogram.vl.json','c12-protection-scatter.vl.json'
];
const dataNames=['summary','family_summary','taxonomy_hierarchy','state_summary','yearly_records','focal_species','focal_points','threatened_composition','waffle_cells','family_status_flows','listing_jurisdiction_matrix','bioregion_protection','protection_histogram','dataset_metadata'];
const views=new Map(),errors=[];
const mapRowCharts=new Set(['c03','c04','c09','c10']);
const pairedChartHeights={c01:390,c02:390,c11:320,c12:320};
// Give the Australian land shape most of the card width, including room
// below it for the legend. Keep the two state maps compact on narrow screens.
const fittedMapHeight=width=>Math.round(Math.min(560,Math.max(320,width*0.9+72)));
const chartHeight=(id,width,fallback)=>mapRowCharts.has(id)?fittedMapHeight(width):(pairedChartHeights[id]||fallback);
const diagnostics={ready:false,views,errors,started:performance.now(),data:null};
window.__DV2=diagnostics;

async function getJSON(path){
  const response=await fetch(path,path==='site-config.json'?{cache:'no-store'}:undefined);
  if(!response.ok)throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

// The readable specs keep standalone source URLs. Embed uses the already-loaded
// tables so all charts share one copy and maps do not repeat geography downloads.
function hydrate(node,data){
  if(Array.isArray(node))return node.map(row=>hydrate(row,data));
  if(!node||typeof node!=='object')return node;
  const result={};
  for(const [key,value] of Object.entries(node))result[key]=hydrate(value,data);
  if(typeof node.url==='string'&&node.url.startsWith('data/processed/')){
    const name=node.url.split('/').pop().replace(/\.(geojson|json)$/,'');
    if(!(name in data))throw new Error(`Missing source table: ${name}`);
    result.values=structuredClone(name==='states'?data.states.features:data[name]);
    delete result.url;
    // Data are parsed JSON already; GeoJSON features have been extracted above.
    delete result.format;
  }
  return result;
}

function options(id,rows,value,label){
  const select=document.getElementById(id);
  for(const row of rows){const option=document.createElement('option');option.value=value(row);option.textContent=label(row);select.append(option);}
}

function safeLink(label,url){
  let parsed;
  try{parsed=new URL(url);}catch{return document.createTextNode(label);}
  if(!['https:','http:'].includes(parsed.protocol))return document.createTextNode(label);
  const a=document.createElement('a');a.href=parsed.href;a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';return a;
}

function sources(data){
  const register=document.getElementById('source-register');
  const descriptions={
    APC:{name:'Australian Plant Census',role:'Native plant names, families and genera'},
    ALA:{name:'Atlas of Living Australia',role:'Records of where and when plants were documented'},
    DCCEEW:{name:'National threatened-species list',role:'Conservation categories and listed jurisdictions'},
    CAPAD:{name:'Protected-area data',role:'Protected-land coverage'},
    ABS:{name:'Australian Bureau of Statistics',role:'Map boundaries and jurisdiction reference points'}
  };
  for(const source of data.dataset_metadata.sources){
    const description=descriptions[source.id];
    const article=document.createElement('article');article.className='source-item';
    const h=document.createElement('h3');h.append(safeLink(`${source.id} · ${description.name}`,source.url));
    const p=document.createElement('p');p.textContent=`${date(source.snapshot)}. ${description.role}.`;
    const rights=document.createElement('p');
    if(source.id==='ALA'){
      const credits=document.createElement('a');
      credits.href='data/processed/occurrence_source_credits.json';
      credits.textContent='Original data credits and licences';
      rights.append(credits);
    }else{
      rights.append(source.licence_url?safeLink(source.licence,source.licence_url):document.createTextNode(source.licence));
    }
    article.append(h,p,rights);register.append(article);
  }
}

async function signal(id,name,value){
  const view=views.get(id);
  if(view)await view.signal(name,value).runAsync();
}

function bindControls(data){
  options('treemap-family',[...data.family_summary].sort((a,b)=>a.family.localeCompare(b.family)),r=>r.family,r=>`${r.family} (${number(r.checklist_species)})`);
  options('focal-species',data.focal_species,r=>r.species_key,r=>r.scientific_name);
  options('sankey-family',[...new Set(data.family_status_flows.map(r=>r.family))].sort().map(family=>({family})),r=>r.family,r=>r.family);
  options('scatter-state',data.state_summary,r=>r.state_code,r=>r.state_name);
  document.getElementById('treemap-family').addEventListener('change',async e=>{await signal('c01','selectedFamily',e.target.value);describeFamily(data,e.target.value);});
  document.getElementById('focal-species').addEventListener('change',async e=>{await signal('c06','selectedSpecies',e.target.value);describeFocal(data,e.target.value);});
  document.getElementById('sankey-family').addEventListener('change',async e=>{await signal('c08','selectedFamily',e.target.value);describeSankey(data,e.target.value);});
  document.getElementById('scatter-state').addEventListener('change',async e=>{await signal('c12','selectedState',e.target.value);describeState(data,e.target.value);});
  for(const button of document.querySelectorAll('[data-reset]'))button.addEventListener('click',()=>{const select=document.getElementById(button.dataset.reset);select.selectedIndex=0;select.dispatchEvent(new Event('change',{bubbles:true}));});
}

async function renderChart(file,index,data){
  const id=`c${String(index+1).padStart(2,'0')}`;
  const container=document.getElementById(`chart-${id}`);
  try{
    const original=await getJSON(`charts/${file}`);
    const spec=hydrate(original,data);
    spec.width=Math.floor(container.clientWidth);
    spec.height=chartHeight(id,spec.width,spec.height);
    const embedded=await vegaEmbed(container,spec,{renderer:'svg',actions:false,tooltip:{theme:'light'},defaultStyle:false});
    views.set(id,embedded.view);
    if(id==='c06')await embedded.view.signal('selectedSpecies',data.focal_species[0].species_key).runAsync();
    container.dataset.status='ready';
    // Expose a persistent text equivalent, not solely hover tooltips.
    const svg=container.querySelector('svg');
    if(svg){
      const heading=document.querySelector(`#card-${id} h3`);
      if(!heading.id)heading.id=`title-${id}`;
      svg.setAttribute('role','img');svg.setAttribute('aria-labelledby',heading.id);svg.setAttribute('aria-describedby',`finding-${id}`);
    }
    let timer,renderedWidth=spec.width;
    const observer=new ResizeObserver(()=>{clearTimeout(timer);timer=setTimeout(async()=>{
      const width=Math.floor(container.clientWidth);
      if(width>0&&Math.abs(renderedWidth-width)>1){
        renderedWidth=width;
        embedded.view.width(width);
        embedded.view.height(chartHeight(id,width,spec.height));
        await embedded.view.resize().runAsync();
      }
    },120);});
    observer.observe(container);
  }catch(error){
    errors.push({chart:id,message:error.message});container.dataset.status='error';
    const p=document.createElement('p');p.className='error';p.setAttribute('role','alert');p.textContent=`This chart could not load. ${error.message}. See its linked data and specification, or reload the page.`;container.replaceChildren(p);
    console.error(id,error);
  }
}

async function start(){
  try{
    const [config,rows,states]=await Promise.all([getJSON('site-config.json'),Promise.all(dataNames.map(name=>getJSON(`data/processed/${name}.json`))),getJSON('data/processed/states.geojson')]);
    const data=Object.fromEntries(dataNames.map((name,i)=>[name,rows[i]]));data.states=states;diagnostics.data=data;
    await document.fonts.ready;
    if(!window.vegaEmbed)throw new Error('The local Vega browser libraries did not load');
    populateStory(data,config);sources(data);bindControls(data);describeFocal(data,data.focal_species[0].species_key);
    // Batches preserve responsiveness while each requested chart is rendered.
    for(let i=0;i<chartFiles.length;i+=3)await Promise.all(chartFiles.slice(i,i+3).map((file,j)=>renderChart(file,i+j,data)));
    diagnostics.ready=true;diagnostics.elapsedMs=performance.now()-diagnostics.started;
  }catch(error){
    errors.push({page:true,message:error.message});const el=document.getElementById('page-error');el.hidden=false;el.setAttribute('role','alert');el.textContent=`The data could not load: ${error.message}. Start the page with a local HTTP server as described in the README.`;document.getElementById('scope-line').textContent='Data unavailable; no placeholder results have been substituted.';console.error(error);diagnostics.ready=true;
  }
}
start();
