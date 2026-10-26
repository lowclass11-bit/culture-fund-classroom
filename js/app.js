"use strict";
const BUDGET = 1000000, PRICE_VERSION = 2, CONTENT_VERSION = 3;
const storageKey = "culture-investment-click-gallery-v4";
const meta = {
 A:{title:"사라질 유산을 디지털로",category:"TECH & HERITAGE",group:"기술·미디어"},
 B:{title:"전통 음식의 건강한 미래",category:"FOOD & HEALTH",group:"삶·공동체"},
 C:{title:"우리 문화를 세상에 연결",category:"STORY & MEDIA",group:"기술·미디어"},
 D:{title:"사라지는 언어를 지키다",category:"LANGUAGE & PEOPLE",group:"삶·공동체"},
 E:{title:"마을의 미래를 친환경으로",category:"NATURE & VILLAGE",group:"자연·여행"},
 F:{title:"택견의 다음 세대를 찾다",category:"SPORT & TRADITION",group:"예술·스포츠"},
 G:{title:"전통 예술의 새로운 감각",category:"ART & DESIGN",group:"예술·스포츠"},
 H:{title:"전통시장에 내일을 더하다",category:"BUSINESS & COMMUNITY",group:"삶·공동체"},
 I:{title:"전통 음악과 기술의 만남",category:"MUSIC & TECHNOLOGY",group:"기술·미디어"},
 J:{title:"여행이 문화를 지키도록",category:"TRAVEL & CULTURE",group:"자연·여행"}
};
for(const p of projects)if(p.focus)meta[p.id].title=p.focus;
const cost = p => Number(p.cost.replace(/[^0-9]/g,""));
const money = n => "$" + n.toLocaleString("en-US");
const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const validId = id => projects.some(p=>p.id===id);
const uniqueIds = ids => [...new Set(Array.isArray(ids)?ids:[])].filter(validId);
const byId = id => projects.find(p=>p.id===id);
const readingVersion = p => p.id==='E'?4:CONTENT_VERSION;
const paragraphs = Object.fromEntries(projects.map(p=>[p.id,p.reading.split(/\n\n/).map(t=>t.trim().split(/(?<=[.!?])\s+/))]));
let state={top:[],priority:[],ranking:[],answers:{},finalReason:"",current:"A",priceVersion:PRICE_VERSION};
let storageAvailable=true,budgetChanged=false,contentChanged=false,tulouChanged=false;
try{
 const saved=JSON.parse(localStorage.getItem(storageKey)||"{}");
 if(saved&&typeof saved==="object"){
  if(Object.hasOwn(saved,"evidence")){delete saved.evidence;localStorage.setItem(storageKey,JSON.stringify(saved));}
  state.top=uniqueIds(saved.top).slice(0,3);
  state.priority=uniqueIds(saved.priority).filter(id=>state.top.includes(id)).slice(0,2);
  state.ranking=uniqueIds(saved.ranking).slice(0,3);
  if(saved.answers&&typeof saved.answers==="object"&&!Array.isArray(saved.answers))state.answers=saved.answers;
  if(typeof saved.finalReason==="string")state.finalReason=saved.finalReason;
  if(validId(saved.current))state.current=saved.current;
  contentChanged=saved.contentVersion!==CONTENT_VERSION&&state.top.length>0;
  tulouChanged=state.top.includes('E')&&(saved.readingVersions?.E??saved.contentVersion)!==4;
  budgetChanged=state.top.length>0&&saved.priceVersion!==PRICE_VERSION;
 }
}catch{storageAvailable=false;}
const main=document.getElementById("main");
let activeFilter="전체",query="",compareActive="",toastTimer;
const chosen=()=>state.top.map(byId);
const spent=()=>chosen().reduce((sum,p)=>sum+cost(p),0);
const remaining=()=>BUDGET-spent();
const ready=()=>state.top.length===3&&remaining()>=0;
function normalize(){
 state.priority=uniqueIds(state.priority).filter(id=>state.top.includes(id)).slice(0,2);
 if(!ready()||state.priority.length!==2||state.ranking.length!==3||!state.ranking.every(id=>state.top.includes(id))||!state.priority.every(id=>state.ranking.slice(0,2).includes(id)))state.ranking=[];
}
normalize();
function notify(message){const t=document.getElementById("toast");t.textContent=message;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),3300);}
function updateNav(){const route=location.hash.slice(1).split("/")[0]||"guide";document.querySelectorAll("[data-nav]").forEach(a=>{const current=a.dataset.nav===(route==="project"?"explore":route==="mission"?"guide":route);a.classList.toggle("active",current);if(current)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});document.querySelectorAll(".nav-count").forEach(el=>el.textContent=state.top.length);}
function save(){normalize();state.priceVersion=PRICE_VERSION;state.contentVersion=CONTENT_VERSION;state.readingVersions=Object.fromEntries(projects.map(p=>[p.id,readingVersion(p)]));try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{if(storageAvailable)notify("이 브라우저에서는 저장할 수 없습니다. 학습지에 기록해 주세요.");storageAvailable=false;}updateNav();}
function storageWarning(){return storageAvailable?"":'<p class="storage-warning">브라우저 저장 기능을 사용할 수 없습니다. 선택과 순위는 학습지에 기록해 주세요.</p>';}
function warning(){return storageWarning()+(tulouChanged?'<p class="storage-warning">E 프로젝트가 중국 푸젠의 토루로 바뀌었습니다. E를 선택했다면 새 지문을 확인해 주세요. 기존 메모는 유지됩니다.</p>':"")+(contentChanged?'<p class="storage-warning">구체적인 세계문화 사례로 지문이 새로 바뀌었습니다. 선택과 개인 메모는 유지되며, 새 지문을 확인해 주세요.</p>':"");}
function cultureContext(p){return `<div class="culture-context"><span class="culture-place">${esc(p.culture)}</span><p>실제 문화를 바탕으로 구성한 수업용 가상 투자 계획입니다. 제안된 활동과 예산은 실제 사업 정보가 아닙니다.</p><a class="culture-source" href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">문화 소개 출처 · UNESCO ↗</a></div>`;}
function reportNotice(){return '<section class="report-pending"><div><h3>학습지와 함께 진행하세요</h3><p>1쪽 선택 · 2쪽 비교와 설득 · 3쪽 창의적 병합. 1·2·3차시 학습지 모두(총 3장)를 제출하세요. 제출 방법은 선생님의 안내를 따르세요.</p></div><a class="btn btn-purple btn-small" href="resources/worksheet.pdf?v=20261026-5" download="세계문화_영어투자프로젝트_활동지.pdf">활동지 PDF ↓</a></section>';}
function budgetBar(){return `<aside class="budget-bar" aria-label="나의 예산 현황"><div class="budget-bar-main"><div class="budget-bar-label">${remaining()<0?"예산 초과 · 선택 조정 필요":"남은 가상 투자금"}</div><strong>${money(remaining())}</strong><div class="budget-track" aria-hidden="true"><span style="width:${Math.min(100,spent()/BUDGET*100)}%"></span></div></div><div class="budget-bar-side"><p>선택한 프로젝트 <b>${state.top.length} / 3</b></p><a class="btn btn-lime btn-small" href="#portfolio">투자 보드 ↗</a></div></aside>`;}
function guide(){main.innerHTML=warning()+`
 <section class="hero"><div><div class="eyebrow">YOUR CHOICE. THEIR FUTURE.</div><h1>100만 달러로<br>어떤 문화를<br><em>지킬 것인가?</em></h1><p class="hero-copy">10개의 프로젝트를 영어로 읽고<br>예산 안에서 지키고 싶은 3개를 고르세요.<br>우선 후보 둘을 비교한 뒤, 새로운 아이디어로 연결합니다.</p><div class="hero-actions"><a class="btn btn-primary" href="#explore">프로젝트 살펴보기 ↗</a><a class="btn" href="#mission">활동 방법 알아보기 ↓</a></div></div><div class="hero-art"><img class="hero-photo" src="images/culture-a.webp" alt="문화유산을 디지털로 기록하는 사람들"><img class="hero-photo second" src="images/culture-f.webp" alt="택견을 배우는 사람들"><div class="art-stamp">READ<br>COMPARE<br>CREATE</div><div class="budget-ticket"><small>YOUR VIRTUAL FUND</small><strong>$1,000,000</strong></div><span class="art-caption">INVEST IN CULTURE. INVEST IN THE FUTURE.</span></div></section>
 <div class="fact-strip"><div class="fact"><strong>3<small>개</small></strong><span>예산 안에서<br>투자 대상 선택</span></div><div class="fact"><strong>2<small>개</small></strong><span>우선 후보 비교<br>1·2·3위 결정</span></div><div class="fact"><strong>1<small>개</small></strong><span>1·2위를 합쳐<br>새 프로젝트 구상</span></div></div>
 <section id="mission"><div class="section-head"><h2>웹앱에서 찾고, 학습지에 남기세요.</h2><p>앱과 학습지에 같은 답을 두 번 쓰지 않아도 됩니다.<br>앱은 읽기·단어 뜻 확인·비교를 돕는 공간입니다.</p></div><div class="steps">
 <article class="step"><span class="step-number">학습지 01</span><h3>읽고 세 개 선택하기</h3><p>사진과 지문, 어휘 도움말을 살펴보세요. 프로젝트 금액 전액을 투자하며, 세 금액의 합계는 100만 달러 이하여야 합니다.</p><span class="step-note">모르는 단어를 누르면 뜻이 나와요</span></article>
 <article class="step"><span class="step-number">학습지 02</span><h3>두 후보 비교하고 설득하기</h3><p>세 프로젝트 중 1위로 고민되는 두 개를 고르세요. 같은 질문으로 비교한 뒤 1위를 누르면 1·2·3위가 정리됩니다.</p><span class="step-note">1·2차시 · 번역기 사용 가능</span></article>
 <article class="step"><span class="step-number">학습지 03</span><h3>두 아이디어로 새 활동 만들기</h3><p>1위와 2위에서 마음에 든 활동을 하나씩 가져와 합쳐보세요. 3차시 시작 전 필요한 활동을 학습지에 기록해 두세요.</p><span class="step-note">3차시 · 전자기기 사용 불가 · 사전만 사용</span></article></div></section>
 <section class="rules"><div><h3>가상 투자 예산 규칙</h3><ul class="rule-list"><li>프로젝트 3개를 선택합니다. 각 필요 금액 전액을 투자합니다.</li><li>총액은 $1,000,000 이하입니다. 이번 예산은 프로젝트별 $310,000~$350,000입니다.</li><li>예산이 넘으면 어떤 프로젝트를 바꿀지 고민해 보세요.</li><li>처음 선택한 3개는 모두 투자 대상입니다. 비교는 우선순위를 정하는 과정입니다.</li></ul></div><div><h3>기록과 작성 도구</h3><ul class="rule-list"><li>영어 요약과 어휘, 비교 이유와 설득문은 학습지에 씁니다.</li><li>필요한 프로젝트 내용은 2차시까지 학습지에 기록해 두세요.</li><li>3차시는 전자기기 사용 불가이며 사전만 사용할 수 있습니다.</li><li>통합 프로젝트의 추가 예산 계산은 없습니다.</li></ul></div></section>
 ${reportNotice()}<p class="save-note">선택·순위는 이 기기와 브라우저에 저장됩니다. 교사에게 자동 제출되거나 다른 기기로 공유되지는 않습니다.</p>`;}
function card(p){const m=meta[p.id],selected=state.top.includes(p.id);return `<article class="project-card"><a class="card-link" href="#project/${p.id}" aria-label="프로젝트 ${p.id} ${m.title} 영어 지문 읽기"><div class="card-image"><img src="${p.image}" alt="${esc(p.imageAlt||p.title)}" loading="lazy"><span class="tag">PROJECT ${p.id}</span>${selected?'<span class="selected-mark">✓ 나의 선택</span>':""}</div><div class="card-content"><div class="card-category">${m.category}</div><p class="card-place">${esc(p.culture)}</p><h2>${m.title}</h2><p class="card-en" lang="en">${esc(p.title)}</p><p class="career">${esc(p.careers)}</p><div class="card-bottom"><span>필요 금액 <strong>${p.cost}</strong></span><span class="card-arrow" aria-hidden="true">↗</span></div></div></a><button class="btn btn-quiet card-add ${selected?"selected":""}" data-toggle="${p.id}" aria-pressed="${selected}">${selected?"✓ 선택됨 · 선택 취소":"+ 투자 보드에 담기"}</button></article>`;}
function renderCards(){const filtered=projects.filter(p=>(activeFilter==="전체"||meta[p.id].group===activeFilter)&&(!query||`${p.title} ${p.culture} ${p.careers} ${meta[p.id].title} ${p.id}`.toLowerCase().includes(query.toLowerCase())));document.getElementById("projectsGrid").innerHTML=filtered.length?filtered.map(card).join(""):'<div class="empty"><h2>일치하는 프로젝트가 없어요.</h2><p>검색어나 분야를 바꿔 보세요.</p></div>';document.getElementById("resultCount").textContent=`${filtered.length}개 프로젝트`;}
function explore(){main.innerHTML=warning()+`<div class="page-intro"><div><div class="eyebrow">학습지 01 · READ & CHOOSE</div><h1 class="page-title">어떤 미래에 투자할까요?</h1><p>사진을 누르면 영어 지문이 열립니다. 모르는 단어를 누르면 이 문장에서의 뜻이 나옵니다.</p></div><span class="tag">10 PROJECTS</span></div>${budgetBar()}<div class="explore-toolbar"><span class="count-label" id="resultCount"></span><input class="search" id="search" type="search" aria-label="문화, 나라, 프로젝트 또는 진로 검색" placeholder="문화 · 나라 · 프로젝트 · 진로 검색" value="${esc(query)}"></div><div class="filter-row" aria-label="프로젝트 분야 필터">${["전체","기술·미디어","삶·공동체","예술·스포츠","자연·여행"].map(f=>`<button class="chip ${f===activeFilter?"active":""}" data-filter="${f}" aria-pressed="${f===activeFilter}">${f}</button>`).join("")}</div><div class="projects-grid" id="projectsGrid"></div>`;renderCards();}
// Match vocabulary in the original text, including its inflected forms.
const vocabForms={
 'coach':['coaches'],'dye':['dyeing','dyed'],'film':['filmed','filming'],'pair':['paired','pairing'],
 'adapt':['adapted','adapting'],'accompany':['accompanied','accompanying'],
 'agree':['agreed'],'prepare':['prepared','preparing'],'explore':['exploring'],
 'restore':['restored','restoring'],'care for':['cares for','caring for'],
 'pass on':['passes on','passing on'],'leave out':['leaves out','leaving out'],
 'afford':['afford'],'balance':['balancing'],'handle':['handling'],
 'record':['recording','recorded'],'preserve':['preserving','preserved']
};
const regexEscape=s=>[...s].map(c=>'.*+?^$()|{}[]'.includes(c)||c.charCodeAt(0)===92?String.fromCharCode(92)+c:c).join('');
const glossaries=Object.fromEntries(projects.map(p=>[p.id,p.vocab.map((v,index)=>{
 const match=v.match(/^(.+?) +([가-힣].*)$/u);
 const term=match?match[1]:v,meaning=match?match[2]:'';
 const plural=term.endsWith('y')?term.slice(0,-1)+'ies':term.endsWith('s')?term+'es':term+'s';
 return {index,term,meaning,forms:[term,plural,...(vocabForms[term.toLowerCase()]||[])]};
})]));
const keyGlossaries=Object.fromEntries(Object.entries(glossaries).map(([id,entries])=>[id,[...entries]]));
for(const p of projects){for(const [term,meaning] of Object.entries(readingWordMeanings)){glossaries[p.id].push({index:glossaries[p.id].length,term,meaning,forms:[term]});}}
const contextualMeanings={A:{'have':'~이 있다','digital record':'디지털 기록','work with':'~와 협력하다','repair work':'수리 작업','closely':'자세히','3D':'3차원'},B:{'have':'~이 있다','run':'운영하다','cooks':'요리사들','prepare':'조리하다','work closely':'긴밀하게 협력하다'},C:{'have died':'세상을 떠난','dead':'죽은 사람들','film':'촬영하다'},D:{'sounds':'소리가 나다','speakers':'아이누어 사용자들','working to':'~하려고 노력하는'},E:{'square':'사각형의','care':'관리, 보수','guides':'안내문들','work with':'~와 협력하다'},F:{'values':'소중히 여기다','look like':'~처럼 보이다','guides':'안내문들','bring':'함께 모이게 하다'},G:{'takes':'걸리다','carry':'담다, 지니다','designs':'디자인들','makers':'제작 장인들'},H:{'have':'가지다','workshops':'공방들','care':'관리','opens':'운영을 시작하다','work with':'~와 협력하다'},I:{'workshops':'체험 수업들','record':'녹음하다','recording':'녹음 자료','closely connected':'밀접하게 연결된','led by':'~가 진행하는'},J:{'work':'직물 제작 작업','guides':'안내자들','makers':'직물 제작 장인들','led by':'~가 이끄는','bring':'불러오다','supports':'지원하다'}};
for(const p of projects){let list=Object.entries(contextualMeanings[p.id]).map(([term,meaning])=>({term,meaning,forms:[term]}));glossaries[p.id]=[...list,...glossaries[p.id]].map((e,index)=>({...e,index}));}
function wordMatches(p,text,keyOnly=false){
 const candidates=[];
 for(const entry of (keyOnly?keyGlossaries[p.id]:glossaries[p.id]))for(const form of entry.forms){
  const boundary=String.fromCharCode(92)+'b';const re=new RegExp(boundary+regexEscape(form)+boundary,'gi');
  for(const match of text.matchAll(re))candidates.push({start:match.index,end:match.index+match[0].length,text:match[0],entry});
 }
 candidates.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));
 let end=0;return candidates.filter(m=>{if(m.start<end)return false;end=m.end;return true;});
}
function glossedSentence(p,text){
 let html='',cursor=0;
 for(const m of wordMatches(p,text)){
  html+=esc(text.slice(cursor,m.start))+`<button type="button" class="vocab-word" data-word="${p.id}|${m.entry.index}" aria-label="${esc(m.text)} 뜻 보기" aria-expanded="false" aria-controls="word-help">${esc(m.text)}</button>`;
  cursor=m.end;
 }
 return html+esc(text.slice(cursor));
}
function nearbyVocab(p,text){
 const entries=[...new Map(wordMatches(p,text,true).map(m=>[m.entry.index,m.entry])).values()].slice(0,4);
 return entries.length?`<aside class="paragraph-vocab" lang="ko" aria-label="이 문단의 핵심 어휘"><span class="paragraph-vocab-label">이 문단의 어휘</span><ul>${entries.map(e=>`<li><b lang="en">${esc(e.term)}</b> <span>${esc(e.meaning)}</span></li>`).join('')}</ul></aside>`:'';
}
function readingHtml(p){return `<div class="reading" lang="en">${paragraphs[p.id].map((sentences,pi)=>`<section class="reading-paragraph" aria-label="${pi+1}문단"><div class="paragraph-heading" lang="ko"><span>${String(pi+1).padStart(2,'0')}</span> ${['문화 소개','투자 과제','실행 계획','고민할 점'][pi]}</div><div class="paragraph-text">${sentences.map(sentence=>`<div class="reading-sentence"><span class="sentence-text">${glossedSentence(p,sentence)}</span></div>`).join('')}</div>${nearbyVocab(p,sentences.join(' '))}</section>`).join('')}</div>`;}
let activeWord=null,wordAnchor=null;
const wordHelp=document.createElement('aside');wordHelp.id='word-help';wordHelp.hidden=true;
wordHelp.setAttribute('role','dialog');wordHelp.setAttribute('aria-label','어휘 뜻');wordHelp.setAttribute('lang','ko');document.body.appendChild(wordHelp);
function closeWord(restoreFocus=false){const old=activeWord;if(old)old.setAttribute('aria-expanded','false');activeWord=null;wordAnchor=null;wordHelp.hidden=true;if(restoreFocus&&old?.isConnected)old.focus({preventScroll:true});}
function showWord(button){
 if(activeWord===button&&!wordHelp.hidden){closeWord();return;}
 closeWord();const [id,index]=button.dataset.word.split('|'),entry=glossaries[id]?.[Number(index)];if(!entry)return;
 activeWord=button;button.setAttribute('aria-expanded','true');
 wordHelp.innerHTML=`<div><strong lang="en">${esc(button.textContent)}</strong><p>${esc(entry.meaning)}</p></div><button type="button" data-close-word aria-label="어휘 뜻 닫기">×</button>`;
 wordHelp.hidden=false;
 const rect=button.getBoundingClientRect(),box=wordHelp.getBoundingClientRect();wordAnchor={top:rect.top,left:rect.left};
 const maxTop=Math.max(8,innerHeight-box.height-8);
 wordHelp.style.left=Math.max(8,Math.min(rect.left,innerWidth-box.width-8))+'px';
 wordHelp.style.top=Math.max(8,Math.min(rect.bottom+8+box.height>innerHeight?rect.top-box.height-8:rect.bottom+8,maxTop))+'px';
}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.vocab-word,#word-help'))closeWord();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!wordHelp.hidden){e.preventDefault();closeWord(true);}});
wordHelp.addEventListener('click',e=>{if(e.target.closest('[data-close-word]'))closeWord(true);});
window.addEventListener('resize',()=>closeWord());
window.addEventListener('scroll',()=>{if(!activeWord||!wordAnchor)return;const rect=activeWord.getBoundingClientRect();if(Math.abs(rect.top-wordAnchor.top)>1||Math.abs(rect.left-wordAnchor.left)>1)closeWord();},{passive:true});

function vocabHtml(p){return `<details class="vocab-box" open><summary>전체 어휘 모아보기 · 복습용</summary><div class="vocab-list">${p.vocab.map(v=>`<span>${esc(v)}</span>`).join("")}</div></details>`;}
function selectionMessage(p){if(state.top.includes(p.id))return "투자 보드에 담겨 있어요. 선택을 취소할 수도 있습니다.";if(state.top.length===3)return "세 개를 골랐어요. 다른 선택을 취소하면 바꿀 수 있습니다.";if(cost(p)>remaining())return `예산이 ${money(cost(p)-remaining())} 부족해요. 기존 선택을 조정해 보세요.`;return `선택하면 ${money(remaining()-cost(p))}가 남습니다.`;}
function optionalNotes(p){const a=state.answers[p.id]||{},has=Object.values(a).some(Boolean);return `<details class="questions optional-notes" ${has?"open":""}><summary>선택 사항 · 개인 메모</summary><p>학습지에 썼다면 다시 입력하지 않아도 됩니다. 기존 메모는 그대로 보관됩니다.</p>${[{key:"problem",en:"What is the problem?",hint:"The problem is ..."},{key:"plan",en:"What will the project do?",hint:"This project will ..."},{key:"why",en:"Why would you support it?",hint:"I would support it because ..."}].map(q=>`<div class="question"><label for="${q.key}" lang="en">${q.en}</label><textarea id="${q.key}" data-answer="${q.key}" placeholder="${q.hint}">${esc(a[q.key])}</textarea></div>`).join("")}<p class="save-note">이 브라우저에만 자동 저장됩니다.</p></details>`;}
function detail(id){const p=byId(id);if(!p){location.hash="explore";return;}state.current=id;save();const selected=state.top.includes(id),blocked=!selected&&(state.top.length>=3||cost(p)>remaining()),index=projects.indexOf(p);
 main.innerHTML=warning()+`<a class="back-link" href="#explore">← 모든 프로젝트</a><div class="detail-layout"><article><div class="detail-cover"><img src="${p.image}" alt="${esc(p.imageAlt||p.title)}"><span class="tag">PROJECT ${id}</span></div><p class="image-caption">프로젝트 내용을 바탕으로 만든 AI 학습용 이미지입니다. 실제 인물·현장을 촬영한 사진은 아닙니다.</p><div class="detail-title"><div class="card-category">${meta[id].category}</div><h1>${meta[id].title}</h1><p class="en-title" lang="en">${esc(p.title)}</p><p class="career">진로 연결 · ${esc(p.careers)}</p></div>${cultureContext(p)}<section class="reading-block"><div class="reading-label"><h2>Read the project</h2><span>문화 · 과제 · 계획 · 고민할 점</span></div><p class="word-help-instruction">모르는 단어를 눌러 보세요. 명사·동사·형용사·부사와 주요 표현을 누르면 이 문장에서의 뜻이 나옵니다.</p>${readingHtml(p)}${vocabHtml(p)}</section>${optionalNotes(p)}<nav class="next-project" aria-label="이전 다음 프로젝트">${index?`<a href="#project/${projects[index-1].id}">← Project ${projects[index-1].id}</a>`:'<span></span>'}${index<9?`<a href="#project/${projects[index+1].id}">다음 Project ${projects[index+1].id} →</a>`:'<a href="#compare">두 후보 비교 →</a>'}</nav></article><aside class="detail-side"><div class="eyebrow">YOUR INVESTMENT</div><h2>이 프로젝트의 필요 금액</h2><div class="project-cost">${p.cost}</div><div class="budget-mini"><span>현재 남은 예산</span><strong>${money(remaining())}</strong></div><p class="action-status ${blocked?"error":""}" id="selectionStatus">${selectionMessage(p)}</p><button class="btn ${selected?"btn-lime":"btn-purple"}" data-toggle="${id}" aria-pressed="${selected}" ${blocked?'disabled aria-describedby="selectionStatus"':""}>${selected?"✓ 선택됨 · 선택 취소":"+ 투자 보드에 담기"}</button><a class="btn btn-quiet" href="#compare">우선 후보 비교하기 ⇄</a></aside></div>`;}
function priorityButton(p){const selected=state.priority.includes(p.id);return `<button class="btn btn-small ${selected?"btn-lime":"btn-quiet"}" data-priority="${p.id}" aria-pressed="${selected}">${selected?"✓ 우선 후보 · 취소":"우선 후보로 선택"}</button>`;}
function rankSummary(){if(!state.ranking.length)return '<div class="rank-pending">우선 후보 둘을 비교한 뒤 1위로 투자하고 싶은 프로젝트를 눌러주세요. 아직 순위는 정해지지 않았습니다.</div>';return `<section class="rank-section"><div class="section-head"><h2>나의 최종 투자 순위</h2><p>비교한 두 후보가 1·2위, 남은 프로젝트가 3위입니다.<br>순위를 바꿔도 처음 고른 세 프로젝트의 투자금은 같습니다.</p></div><div class="rank-grid">${state.ranking.map((id,i)=>{const p=byId(id);return `<a class="rank-card ${i===0?"first":""}" href="#project/${id}"><div class="rank-number">${i+1}<small>위</small></div><img src="${p.image}" alt=""><div><span class="micro">PROJECT ${id}</span><h3>${meta[id].title}</h3><strong>${p.cost}</strong></div></a>`;}).join("")}</div></section>`;}
function compareProject(p){const first=state.ranking[0]===p.id;return `<article class="compare-project ${compareActive===p.id?"active":""}" id="compare-panel-${p.id}" role="tabpanel" aria-labelledby="compare-tab-${p.id}"><div class="compare-project-head"><img src="${p.image}" alt="${esc(p.imageAlt||p.title)}"><div><span class="tag">PROJECT ${p.id}</span><h2>${meta[p.id].title}</h2><p lang="en">${esc(p.title)}</p><strong>${p.cost}</strong></div></div><button class="btn ${first?"btn-lime":"btn-purple"} winner-button" data-winner="${p.id}" aria-pressed="${first}">${first?"✓ 나의 1위 프로젝트":"이 프로젝트를 1위로 선택"}</button>${cultureContext(p)}<details class="compare-full-reading" open><summary>영어 지문 확인하기</summary><p class="word-help-instruction">모르는 단어를 눌러 보세요. 명사·동사·형용사·부사와 주요 표현을 누르면 이 문장에서의 뜻이 나옵니다.</p>${readingHtml(p)}${vocabHtml(p)}</details></article>`;}
function compare(){
 main.innerHTML=warning()+`<div class="page-intro"><div><div class="eyebrow">학습지 02 · COMPARE & PERSUADE</div><h1 class="page-title">두 후보 중, 어디에 투자할까요?</h1><p>우선 후보 두 개를 비교해 1위를 정하세요. 생각과 영어 설득문은 학습지에 씁니다.</p></div><span class="tag tag-purple">1·2차시 · 번역기 사용 가능</span></div>`;
 if(!ready()){main.insertAdjacentHTML("beforeend",`${budgetBar()}<div class="empty"><h2>먼저 예산 안에서 세 프로젝트를 골라주세요.</h2><p>세 프로젝트의 필요 금액 합계가 100만 달러 이하여야 비교를 시작할 수 있어요.</p><a class="btn btn-primary" href="#explore">프로젝트 탐색 ↗</a></div>`);return;}
 if(!state.priority.includes(compareActive))compareActive=state.priority[0]||"";
 main.insertAdjacentHTML("beforeend",`<section class="priority-picker"><div class="section-head"><h2>1위를 정할 우선 후보 2개</h2><p>더 투자하고 싶은 두 후보를 골라주세요.<br>나머지 프로젝트는 최종 3위가 됩니다.</p></div><div class="candidate-grid">${chosen().map(p=>`<article class="candidate-card"><img src="${p.image}" alt=""><div><span class="micro">PROJECT ${p.id} · ${p.cost}</span><h3>${meta[p.id].title}</h3>${priorityButton(p)}</div></article>`).join("")}</div><p class="save-note">우선 후보 ${state.priority.length}/2 선택 · 후보를 바꾸려면 기존 선택을 취소하세요.</p></section>`);
 if(state.priority.length<2){main.insertAdjacentHTML("beforeend",'<div class="rank-pending">우선 후보 두 개를 고르면 두 프로젝트의 지문이 열립니다.</div>');return;}
 const pair=state.priority.map(byId);
 main.insertAdjacentHTML("beforeend",`<section id="comparisonReading"><div class="section-head"><h2>학습지와 같은 세 질문으로 비교하세요.</h2><p>각 후보에 투자할 이유와 방법을 생각해 보세요.<br>기대하는 변화를 비교해 1위를 정합니다.</p></div><div class="comparison-questions"><span><b>01</b> Why do you want to invest?<small>왜 투자하고 싶은가?</small></span><span><b>02</b> How will you invest?<small>어떻게 투자할 건가?</small></span><span><b>03</b> What change do you expect?<small>기대하는 변화는?</small></span></div><div class="compare-tabs" role="tablist" aria-label="비교할 프로젝트">${pair.map(p=>`<button role="tab" id="compare-tab-${p.id}" aria-controls="compare-panel-${p.id}" aria-selected="${compareActive===p.id}" data-compare-tab="${p.id}" class="${compareActive===p.id?"active":""}">Project ${p.id} · ${meta[p.id].title}</button>`).join("")}</div><div class="compare-layout">${pair.map(compareProject).join("")}</div></section>${rankSummary()}<section class="classroom-handoff"><h2>다음은 학습지에 남기는 시간</h2><p><strong>2쪽:</strong> 최종 순위를 옮겨 적고, 지문 근거를 활용해 1위 영어 설득문을 쓰세요. 전자기기 사용이 가능합니다.</p><p><strong>3쪽:</strong> 1·2위에서 활동을 하나씩 골라 새 프로젝트를 구상하세요. <strong>3차시는 전자기기 사용 불가입니다. 사전만 사용하세요.</strong></p></section>${reportNotice()}`);
}
function portfolio(){const selected=chosen();main.innerHTML=warning()+`<div class="page-intro"><div><div class="eyebrow">MY CULTURE PORTFOLIO</div><h1 class="page-title">나의 투자 선택.</h1><p>선택 순서는 순위가 아닙니다. 두 후보를 비교한 뒤 최종 순위를 정하세요.</p></div><a class="btn btn-quiet btn-small" href="#explore">프로젝트 더 살펴보기 ↗</a></div>${budgetChanged?'<p class="storage-warning">수업용 프로젝트 예산이 조정되었습니다. 현재 금액과 합계를 다시 확인해 주세요.</p>':""}<div class="portfolio-layout"><div><div class="board-items">${selected.length?selected.map(p=>`<article class="board-item"><a href="#project/${p.id}" aria-label="프로젝트 ${p.id} 지문 다시 읽기"><img src="${p.image}" alt=""></a><div><span class="tag tag-purple">PROJECT ${p.id}${state.ranking.length?' · '+(state.ranking.indexOf(p.id)+1)+'위':""}</span><h2><a href="#project/${p.id}">${meta[p.id].title}</a></h2><p class="en-title" lang="en">${esc(p.title)}</p></div><div><strong>${p.cost}</strong><br><button class="remove-btn" data-toggle="${p.id}" aria-label="프로젝트 ${p.id} 선택 취소">선택 취소</button></div></article>`).join(""):'<div class="empty"><h2>어떤 문화를 지키고 싶나요?</h2><p>관심 있는 프로젝트를 찾아 투자 보드에 담아보세요.</p><a class="btn btn-primary" href="#explore">첫 프로젝트 찾아보기 ↗</a></div>'}</div><section class="board-report"><h2>1위를 정할 두 후보를 비교해 보세요.</h2><p>두 후보의 지문을 함께 볼 수 있습니다. 선택한 세 프로젝트는 모두 투자 대상이며, 비교는 우선순위를 정하는 활동입니다.</p><a class="btn btn-purple" href="#compare">우선 후보 선택하고 비교하기 ⇄</a></section><details class="board-report optional-notes" ${state.finalReason?"open":""}><summary>선택 사항 · 투자 이유 개인 메모</summary><p>학습지에 작성했다면 여기에 다시 쓰지 않아도 됩니다.</p><div class="question"><label for="finalReason" lang="en">Which project matters most to you, and why?</label><textarea id="finalReason" placeholder="I most want to support Project __ because ...">${esc(state.finalReason)}</textarea></div></details></div><aside class="board-total"><div class="eyebrow">BUDGET CHECK</div><h2>가상 예산 사용 내역</h2><div class="ledger-row"><span>시작 예산</span><strong>$1,000,000</strong></div>${selected.map(p=>`<div class="ledger-row"><span>Project ${p.id}</span><span>${p.cost}</span></div>`).join("")}<div class="ledger-row"><span>총 투자금</span><strong>${money(spent())}</strong></div><div class="ledger-row ledger-total"><span>${remaining()<0?"초과 금액":"남은 예산"}</span><strong>${money(Math.abs(remaining()))}</strong></div><div class="budget-check ${ready()?"ready":remaining()<0?"error":""}" role="status">${ready()?"✓ 예산 확인 완료! 두 우선 후보를 비교할 수 있어요.":remaining()<0?"예산을 초과했어요. 선택을 조정해 주세요.":`프로젝트 ${3-state.top.length}개를 더 선택해 주세요.`}</div><ul class="checklist"><li class="${state.top.length===3?"complete":""}">${state.top.length===3?"✓":"○"} 프로젝트 3개 선택</li><li class="${remaining()>=0?"complete":""}">${remaining()>=0?"✓":"○"} 합계 100만 달러 이하</li><li class="${state.ranking.length?"complete":""}">${state.ranking.length?"✓":"○"} 두 후보 비교 후 1·2·3위 결정</li></ul></aside></div>${ready()?rankSummary():""}${reportNotice()}<p class="board-notice">선택과 순위는 이 기기·브라우저에 저장됩니다. 학습지 1·2·3차시 학습지 모두(총 3장)를 제출하세요. 제출 방법은 선생님의 안내를 따르세요.</p>`;}
function render(moveFocus=true){closeWord();normalize();const raw=location.hash.slice(1)||"guide",route=raw.split("/")[0];document.getElementById("toast").classList.remove("show");document.body.classList.toggle("reading-page",route==="project");if(route==="explore")explore();else if(route==="project")detail(raw.split("/")[1]);else if(route==="compare")compare();else if(route==="portfolio")portfolio();else guide();
 if(route==="project"){const p=byId(raw.split("/")[1]);if(p){const selected=state.top.includes(p.id),blocked=!selected&&(state.top.length>=3||cost(p)>remaining());main.insertAdjacentHTML("beforeend",`<aside class="mobile-invest" aria-label="빠른 투자 선택"><div><small>필요 ${p.cost} · 잔액 ${money(remaining())}</small><strong>PROJECT ${p.id} <span>${state.top.length}/3 선택</span></strong></div><button class="btn ${selected?"btn-lime":"btn-purple"}" data-mobile-id="${p.id}" ${blocked?"disabled":""}>${selected?"선택 취소":blocked?"선택 조정 필요":"+ 선택하기"}</button></aside>`);}}
 updateNav();const titles={guide:"활동 안내",explore:"프로젝트 탐색",project:"프로젝트 읽기",compare:"두 후보 비교",portfolio:"나의 투자 보드"};document.title=`${titles[route]||titles.guide} | CULTURE FUND`;if(moveFocus){window.scrollTo({top:0,behavior:"instant"});main.focus({preventScroll:true});}if(raw==="mission")requestAnimationFrame(()=>document.getElementById("mission")?.scrollIntoView());}
function repaint(){const y=window.scrollY;render(false);window.scrollTo({top:y,behavior:"instant"});}
function toggle(id){const p=byId(id);if(!p)return;const removing=state.top.includes(id);if(removing)state.top=state.top.filter(x=>x!==id);else{if(state.top.length>=3){notify("프로젝트는 세 개까지 선택할 수 있어요. 기존 선택을 취소하면 바꿀 수 있습니다.");return;}}
 if(!removing){if(cost(p)>remaining()){notify(`예산이 ${money(cost(p)-remaining())} 부족해요. 다른 선택을 조정해 주세요.`);return;}state.top.push(id);}state.ranking=[];save();repaint();notify(removing?`Project ${id} 선택을 취소했어요.`:`Project ${id}를 담았어요. 잔액 ${money(remaining())}`);main.querySelector(`[data-toggle="${id}"]`)?.focus({preventScroll:true});}
function choosePriority(id){if(!ready()||!state.top.includes(id))return;if(state.priority.includes(id))state.priority=state.priority.filter(x=>x!==id);else if(state.priority.length<2)state.priority.push(id);else{notify("우선 후보는 두 개입니다. 기존 후보를 취소하면 바꿀 수 있어요.");return;}state.ranking=[];save();repaint();if(state.priority.length===2)document.getElementById("comparisonReading")?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});}
function chooseWinner(id){if(!ready()||state.priority.length!==2||!state.priority.includes(id))return;state.ranking=[id,state.priority.find(x=>x!==id),state.top.find(x=>!state.priority.includes(x))];save();repaint();notify(`1위 Project ${state.ranking[0]} · 2위 ${state.ranking[1]} · 3위 ${state.ranking[2]}`);main.querySelector(`[data-winner="${id}"]`)?.focus({preventScroll:true});}
main.addEventListener("click",e=>{let b;if(b=e.target.closest("[data-word]")){showWord(b);return;}if(b=e.target.closest("[data-toggle],[data-mobile-id]")){toggle(b.dataset.toggle||b.dataset.mobileId);return;}if(b=e.target.closest("[data-priority]")){choosePriority(b.dataset.priority);return;}if(b=e.target.closest("[data-winner]")){chooseWinner(b.dataset.winner);return;}if(b=e.target.closest("[data-filter]")){activeFilter=b.dataset.filter;main.querySelectorAll("[data-filter]").forEach(el=>{el.classList.toggle("active",el===b);el.setAttribute("aria-pressed",String(el===b));});renderCards();return;}if(b=e.target.closest("[data-compare-tab]")){compareActive=b.dataset.compareTab;main.querySelectorAll("[data-compare-tab]").forEach(el=>{el.classList.toggle("active",el===b);el.setAttribute("aria-selected",String(el===b));});main.querySelectorAll(".compare-project").forEach(el=>el.classList.toggle("active",el.id===`compare-panel-${compareActive}`));}});
main.addEventListener("keydown",e=>{const tab=e.target.closest("[data-compare-tab]");if(!tab||!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;e.preventDefault();const tabs=[...main.querySelectorAll("[data-compare-tab]")];let i=tabs.indexOf(tab);i=e.key==="Home"?0:e.key==="End"?tabs.length-1:(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;tabs[i].click();tabs[i].focus();});
main.addEventListener("input",e=>{if(e.target.id==="search"){query=e.target.value;renderCards();return;}if(e.target.dataset.answer){const id=state.current;if(!state.answers[id]||typeof state.answers[id]!=="object"||Array.isArray(state.answers[id]))state.answers[id]={};state.answers[id][e.target.dataset.answer]=e.target.value;save();}if(e.target.id==="finalReason"){state.finalReason=e.target.value;save();}});
window.addEventListener("hashchange",()=>render());render(false);
