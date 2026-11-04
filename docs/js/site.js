"use strict";
const data = window.SITE_CONTENT || { profile:{}, research:[], news:[], publications:[], projects:[], experience:[], earlierExperience:[] };
const $ = (s) => document.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = u => { let s=String(u||''); return /^(https?:\/\/|mailto:)/i.test(s) ? esc(s) : '#'; };
const ext = 'target="_blank" rel="noopener noreferrer"';
const profile=data.profile||{};
const txt=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v||''};
txt('profile-name',profile.name);txt('profile-role',profile.role);txt('profile-affiliation',profile.affiliation);
txt('profile-qualification',profile.qualification);txt('profile-intro',profile.introduction);txt('contact-text',profile.contactText);
const heroTitle=$('#hero-title'); if(heroTitle) heroTitle.innerHTML=`${esc(profile.heroLine1)}<br><em>${esc(profile.heroLine2)}</em>`;
const topics=$('#profile-topics'); if(topics) topics.innerHTML=(profile.topics||[]).map(t=>`<span>${esc(t)}</span>`).join('');
const heroImg=$('.hero-image'); if (heroImg && profile.heroImage) heroImg.src=profile.heroImage;
const researchGrid=$('#research-grid');
if(researchGrid) researchGrid.innerHTML=(data.research||[]).map(r=>`<article class="research-item"><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p></article>`).join('');
const timelineHTML=arr=>arr.map(e=>`<article><time>${esc(e.period)}</time><div><h3>${esc(e.place)}</h3><p>${esc(e.details)}</p></div></article>`).join('');
const exp=$('#experience-list'); if(exp) exp.innerHTML=timelineHTML(data.experience||[]);
const eexp=$('#earlier-experience-list'); if(eexp) eexp.innerHTML=timelineHTML(data.earlierExperience||[]);

const formatAuthorName = author => {
  const s = String(author || '').trim();
  const i = s.indexOf(',');
  return i < 0 ? s : s.slice(i + 1).trim() + ' ' + s.slice(0, i).trim();
};
const papers=[...(data.publications||[])].sort((a,b)=>(Number(b.year)||0)-(Number(a.year)||0));
const paperList=$('#paper-list');
if(paperList) paperList.innerHTML=papers.map((p,i)=>{
  const optional=p.key==='ma2024osmsc' ? '<a class="pill" href="https://github.com/ruirzma/osmsc" '+ext+'>Code ↗</a>':p.key==='ma2023tiled'?'<a class="pill" href="https://doi.org/10.6084/m9.figshare.20799637.v5" '+ext+'>Data ↗</a>':'';
  const name = (p.authors || '').split(';').map(author => {
  const original = author.trim();
  const displayed = formatAuthorName(original);

  if (original === 'Ma, Rui') {
    const star = p.corresponding === true ? '*' : '';
    return '<strong>' + esc(displayed) + star + '</strong>';
  }

  return esc(displayed);
}).join('; ');
  return `<article class="paper" data-index="${i}"><button class="image-button" aria-label="Enlarge image for ${esc(p.title)}" style="border:0;padding:0;background:transparent;align-self:start;line-height:0"><img class="paper-image" src="${esc(p.image)}" alt="Research image for ${esc(p.title)}" loading="lazy"></button><div><h3 class="paper-title"><a href="${link(p.url)}" ${ext}>${esc(p.title)}</a></h3><p class="authors">${name}</p><p class="venue">${esc(p.journal)} <b>· ${esc(p.year)}</b></p><div class="paper-links"><a class="pill" href="${link(p.url)}" ${ext}>Paper ↗</a>${optional}${p.bibtex?`<details><summary class="pill">BibTeX</summary><pre class="bib">${esc(p.bibtex)}</pre></details>`:''}</div></div></article>`;
}).join('');
const plist=$('#project-list'); if(plist) plist.innerHTML=(data.projects||[]).map(p=>`<article class="project-card"><a href="${link(p.url)}" ${ext}><img src="${esc(p.image)}" alt="${esc(p.title)} project image" loading="lazy"></a><div class="project-copy"><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><a href="${link(p.url)}" ${ext}>Explore project ↗</a></div></article>`).join('');
const news=[...(data.news||[])].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
const newsHTML=n=>`<div class="news-row"><time datetime="${esc(n.date)}">${esc(n.date).replaceAll('-','.')}</time><a href="${link(n.url)}" ${ext}>${esc(n.text)} ↗</a></div>`;
const nlist=$('#news-list'); if(nlist) nlist.innerHTML=news.slice(0,3).map(newsHTML).join('')+(news.length>3?`<details class="older"><summary>Earlier milestones (${news.length-3})</summary>${news.slice(3).map(newsHTML).join('')}</details>`:'');

let selected='selected';const search=$('#search'),year=$('#year');
if(year) [...new Set(papers.map(p=>String(p.year)))].forEach(y=>year.add(new Option(y,y)));
function filter(){let count=0;const q=(search?.value||'').toLowerCase().trim();document.querySelectorAll('.paper').forEach(el=>{const p=papers[Number(el.dataset.index)];const visible=(selected==='all'||p.selected===true)&&((!year)||year.value==='all'||String(p.year)===year.value)&&[p.title,p.authors,p.journal].join(' ').toLowerCase().includes(q);el.hidden=!visible;if(visible)count++});
const rc=$('#result-count'); if(rc) rc.textContent=`${count} ${count===1?'paper':'papers'} shown · ${papers.length} records`; const nr=$('.no-results'); if(nr) nr.hidden=count!==0;
}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{selected=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filter();});if(search) search.addEventListener('input',filter);if(year) year.addEventListener('change',filter);
const nav=[...document.querySelectorAll('.nav-links a')];
function updateNav(){let current='about';document.querySelectorAll('main>section[id]').forEach(s=>{if(s.getBoundingClientRect().top<210)current=s.id});if(current==='news')current='research';nav.forEach(a=>{let on=a.hash==='#'+current;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});const max=document.documentElement.scrollHeight-innerHeight;const bar=$('.reading');if(bar)bar.style.width=(max>0?scrollY/max*100:0)+'%';}
addEventListener('scroll',updateNav,{passive:true});addEventListener('resize',updateNav);filter();updateNav();
const dialog=$('#image-dialog');document.querySelectorAll('.image-button').forEach(b=>b.onclick=()=>{const source=b.querySelector('img'),target=dialog.querySelector('img');target.src=source.src;target.alt=source.alt;if(typeof dialog.showModal==='function')dialog.showModal();});
$('#close-image').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
