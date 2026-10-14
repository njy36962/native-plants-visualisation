// Narrative is calculated from the same tables used by the charts.
export const number = value => new Intl.NumberFormat('en-MY').format(value);
export const percent = value => `${Number(value).toFixed(1)}%`;
export const date = value => new Intl.DateTimeFormat('en-MY', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value));
// Narrative paragraphs are optional when editing the page layout.
const text = (id,value) => {
  const element=document.getElementById(id);
  if(element)element.textContent=value;
};
const highest = (rows,key) => rows.reduce((best,row) => !best || row[key]>best[key] ? row : best,null);
const lowest = (rows,key) => rows.reduce((best,row) => !best || row[key]<best[key] ? row : best,null);

function familyFinding(data,family){
  const r=family?data.family_summary.find(row=>row.family===family):highest(data.family_summary,'checklist_species');
  return family
    ? `${r.family} contains ${number(r.checklist_species)} selected species. Compare the genus rectangles inside this family: their areas show how that total is divided. Choose All families to restore the national checklist.`
    : `${r.family} is the largest family in this checklist: ${number(r.checklist_species)} species (${percent(100*r.checklist_species/data.summary.checklist_species)}). Explore this family to see which genera contribute to its size; the next chart asks how much of that diversity appears in the records.`;
}

function flowFinding(data,family){
  const rows=data.family_status_flows.filter(row=>!family||row.family===family);
  const total=rows.reduce((sum,row)=>sum+row.species_count,0);
  if(family){
    const dominant=highest(rows,'species_count');
    return `${family} contributes ${number(total)} matched species. ${dominant.status} is its largest category (${number(dominant.species_count)} species). ${rows.map(r=>`${r.status}: ${number(r.species_count)}`).join('; ')}. Follow the highlighted ribbons to compare this family with the full listed set.`;
  }
  const totals=new Map();
  for(const r of rows)totals.set(r.family,(totals.get(r.family)||0)+r.species_count);
  const biggest=[...totals].filter(([name])=>name!=='Other families').sort((a,b)=>b[1]-a[1])[0];
  return `${biggest[0]} is the largest individually shown contributor: ${number(biggest[1])} of ${number(total)} matched species (${percent(100*biggest[1]/total)}). Follow its ribbons to see the category mix. These are counts within the listed set, not each family's chance of being threatened.`;
}

function stateFinding(data,code){
  const r=code?data.state_summary.find(row=>row.state_code===code):highest(data.state_summary,'protected_percent');
  return `${r.state_name} ${code?'has':'leads protected-land coverage here, with'} ${percent(r.protected_percent)} protected land and ${percent(r.verified_threatened_share_percent)} recorded threatened share (${number(r.verified_threatened_species)} of ${number(r.recorded_species)} species). ${code?'Compare the highlighted point with its neighbours.':'Follow its labelled point, then compare it with the other jurisdictions.'} The two percentages have different denominators; this comparison does not measure conservation success.`;
}

export function populateStory(data,config){
  const s=data.summary, families=data.family_summary, states=data.state_summary;
  const largestFamily=highest(families,'checklist_species');
  const richest=highest(states,'recorded_species');
  const largestShare=highest(states,'verified_threatened_share_percent');
  const threatenedCount=highest(states,'verified_threatened_species');
  const cr=data.threatened_composition.find(r=>r.status==='Critically Endangered');
  const peak=highest(data.yearly_records.filter(r=>!r.partial_year),'records');
  const partial=data.yearly_records.find(r=>r.partial_year);
  const modal=highest(data.protection_histogram,'region_count');
  const coverage=100*s.recorded_species/s.checklist_species;
  const studentId=String(config.studentId??'').trim();
  text('metric-checklist',number(s.checklist_species));
  text('metric-recorded',number(s.recorded_species));
  text('metric-records',number(s.retained_records));
  text('metric-threatened',number(s.verified_extant_threatened_species));
  // text('scope-line',`Occurrence window: ${s.observation_window_start_year}–${date(s.observation_request_cutoff_utc)} UTC. Selected native vascular species across ${s.state_jurisdiction_count} main states/territories; source dates differ.`);
  text('finding-c01',familyFinding(data,''));
  const leading=[...families].sort((a,b)=>b.checklist_species-a.checklist_species).slice(0,config.coverageFamilies);
  const covered=highest(leading,'documentation_percent');
  const least=leading.reduce((best,r)=>!best || r.documentation_percent<best.documentation_percent?r:best,null);
  text('finding-c02',`The outlined dots mark the coverage extremes among the ${leading.length} largest families: ${least.family} at ${percent(least.documentation_percent)} and ${covered.family} at ${percent(covered.documentation_percent)}. The ${(covered.documentation_percent-least.documentation_percent).toFixed(1)} percentage-point gap shows that checklist size alone does not tell us how thoroughly a family is represented.`);
  text('finding-c03',`The highlighted bar is ${richest.state_name}, with ${number(richest.recorded_species)} documented species. Next, switch from the species count to the threatened share.${richest.state_code!==largestShare.state_code?' The leading jurisdiction changes.':''} Recording effort and filtering influence these counts.`);
  text('finding-c04',`${largestShare.state_name} has the highest recorded threatened share: ${number(largestShare.verified_threatened_species)} of ${number(largestShare.recorded_species)} species (${percent(largestShare.verified_threatened_share_percent)}). The denominator is recorded native species in that jurisdiction, so this map answers a different question from the richness bars.`);
  text('finding-c05',`The labelled peak is ${peak.year}, with ${number(peak.records)} retained records. This is the highest full-year total. The pattern reflects documentation, influenced by collection, reporting and digitisation.${partial?` The separate ${partial.year} diamond contains ${number(partial.records)} records for an incomplete year; it cannot be read as a full-year fall.`:''}`);
  text('finding-c07',`The coloured tiles represent ${number(cr.species_count)} critically endangered species out of ${number(s.verified_extant_threatened_species)} matched extant threatened species: exactly ${percent(cr.share_percent)}. The tiles round that share. This denominator is the matched threatened set, not all native species.`);
  text('finding-c08',flowFinding(data,''));
  const matrixTop=highest(data.listing_jurisdiction_matrix,'species_count');
  text('finding-c09',`The gold outline marks the largest cell: ${matrixTop.state_name} × ${matrixTop.status}, with ${number(matrixTop.species_count)} matched species indicated by the listing source. Read across a row to compare categories. A species may appear in several jurisdictions, so adding rows would count shared species more than once.`);
  text('finding-c10',`${threatenedCount.state_name} has the largest documented threatened count (${number(threatenedCount.verified_threatened_species)} species). Circle area shows how many; the earlier colour map shows what share of recorded native species they represent. The counts here use ALA documentation, whereas the matrix uses listing-source jurisdictions.`);
  text('finding-c11',`The highlighted ${modal.bin_start}–${modal.bin_end}% interval contains the most bioregions: ${number(modal.region_count)} of ${number(data.bioregion_protection.length)} (${percent(100*modal.region_count/data.bioregion_protection.length)}). Each bioregion counts once regardless of area. This distribution describes regional coverage, not the percentage of Australia protected.`);
  text('finding-c12',stateFinding(data,''));
  text('closing-text',`The story has three distinct findings: ${richest.state_name} leads documented native richness, ${largestShare.state_name} leads recorded threatened share, and protected-land coverage varies across regions. Together, the charts show why biodiversity, assessed risk and land protection need to be read as related but different measures.`);
  text('takeaway-diversity',`${richest.state_name}: ${number(richest.recorded_species)} documented native species. The checklist and retained records describe different scopes.`);
  text('takeaway-risk',`${number(s.verified_extant_threatened_species)} matched threatened species; ${percent(cr.share_percent)} are critically endangered. Unmatched species are not automatically safe.`);
  text('takeaway-protection',`${number(modal.region_count)} of ${number(data.bioregion_protection.length)} bioregions lie in the ${modal.bin_start}–${modal.bin_end}% protected interval. Coverage alone does not establish recovery.`);
  const datedSources=data.dataset_metadata.sources.map(r=>new Date(r.snapshot).getTime());
  text('metadata-dates',`Source reference dates run from ${date(Math.min(...datedSources))} to ${date(Math.max(...datedSources))}. Chart captions identify the relevant snapshots. `);
  text('author-name',`${config.author}${studentId?` ${studentId}`:''}`);
  text('work-meta',config.course);
  text('ai-ack',config.aiAcknowledgement);
  for(const el of document.querySelectorAll('.source-caption')){
    el.textContent='Sources: '+el.dataset.sources.split(',').map(id=>{
      const source=data.dataset_metadata.sources.find(r=>r.id===id);
      return `${id}`;
    }).join(' / ');
  }
  const guide=document.getElementById('jurisdiction-guide');
  for(const r of states){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=r.state_code;dd.textContent=r.state_name;guide.append(dt,dd);}
}

export function describeFocal(data,key){
  const r=data.focal_species.find(row=>row.species_key===key);
  if(!r)return;
  text('focal-title',`The recorded footprint of ${r.scientific_name}`);
  text('focal-name',r.scientific_name);
  text('focal-context',`Family: ${r.family}. Selection reason: ${r.selection_reason}.${r.national_status_match?` Verified national category: ${r.national_status_match.toLowerCase()}.`:' No verified national threat category was assigned; this does not establish safety.'}`);
  text('focal-sample',`${number(r.displayed_points)} displayed records, sampled from ${number(r.point_eligible_records)} eligible locations. Known uncertainty: at most ${number(r.maximum_uncertainty_m)} metres.`);
  const jurisdictions=new Set(data.focal_points.filter(row=>row.species_key===key).map(row=>row.state_code)).size;
  text('finding-c06',`This displayed sample spans ${number(jurisdictions)} ${jurisdictions===1?'jurisdiction':'jurisdictions'}. Compare its footprint with another example using the selector. The full retained dataset contains ${number(r.all_retained_records)} records for this species. The ${number(r.displayed_points)} displayed points are a reproducible sample; they do not show population size or the complete species range.`);
}

export function describeFamily(data,family){
  text('finding-c01',familyFinding(data,family));
}

export function describeSankey(data,family){
  text('finding-c08',flowFinding(data,family));
}

export function describeState(data,code){
  text('finding-c12',stateFinding(data,code));
}
