const $ = (s, r=document) => r.querySelector(s);
const fmt = n => n.toLocaleString('ru-RU') + ' €';
// Фото лежат в папке img/. Чтобы использовать свои фото, замените файлы (или пути здесь).
const img = (tag, lock) => tag==='apartment,interior' ? `flat${lock}-living.svg`
  : tag==='house,architecture' ? `post${lock-100}.svg` : `flat${Math.floor(lock/10)}-${tag}.svg`;
const page = document.body.dataset.page;

// ---- Шапка и подвал ----
const links = [['index.html','Каталог','home'],['blog.html','Новости и блог','blog'],['contacts.html','Контакты и реквизиты','contacts']];
$('#header').innerHTML = `<header><div class="wrap"><a class="logo" href="index.html">Dom<span>Pro</span></a><nav>${
  links.map(l=>`<a href="${l[0]}" class="${(page===l[2]||(page==='article'&&l[2]==='blog'))?'on':''}">${l[1]}</a>`).join('')}</nav></div></header>`;
$('#footer').innerHTML = `<footer><div class="wrap"><span>© 2026 DomPro — учебный проект</span><span>Все данные вымышлены</span></div></footer>`;

// ---- Каталог ----
function card(f){
  return `<article class="card"><a href="apartment.html?id=${f.id}"><img loading="lazy" src="${img('apartment,interior',f.id)}" alt="${f.title}"></a>
  <div class="in"><span class="tag">${f.district}</span><div class="price">${fmt(f.price)}</div>
  <h3>${f.title}</h3><div class="meta">${f.address}</div>
  <div class="meta">${f.rooms} комн. · ${f.area} м² · ${f.floor} этаж</div>
  <a class="btn" style="margin-top:auto;text-align:center" href="apartment.html?id=${f.id}">Подробнее</a></div></article>`;
}
if(page==='home'){
  const districts=[...new Set(FLATS.map(f=>f.district))];
  $('#district').innerHTML='<option value="">Все районы</option>'+districts.map(d=>`<option>${d}</option>`).join('');
  const ids=['q','district','rooms','maxPrice','sort'];
  function render(){
    const q=$('#q').value.toLowerCase(), d=$('#district').value, r=$('#rooms').value, mp=+$('#maxPrice').value||Infinity;
    let list=FLATS.filter(f=>(!q||(f.title+f.address).toLowerCase().includes(q))&&(!d||f.district===d)&&(!r||(r==='4'?f.rooms>=4:f.rooms==r))&&f.price<=mp);
    const s=$('#sort').value;
    if(s==='asc')list.sort((a,b)=>a.price-b.price);
    if(s==='desc')list.sort((a,b)=>b.price-a.price);
    if(s==='area')list.sort((a,b)=>b.area-a.area);
    $('#count').textContent=`Найдено: ${list.length}`;
    $('#list').innerHTML=list.length?list.map(card).join(''):'<div class="empty" style="grid-column:1/-1">Ничего не найдено. Измените параметры фильтра.</div>';
  }
  ids.forEach(i=>$('#'+i).addEventListener('input',render));
  $('#reset').onclick=()=>{ids.forEach(i=>$('#'+i).value='');render()};
  render();
}

// ---- Страница квартиры ----
if(page==='apartment'){
  const f=FLATS.find(x=>x.id==new URLSearchParams(location.search).get('id'));
  if(!f){$('#flat').innerHTML='<div class="empty">Квартира не найдена. <a href="index.html" style="color:var(--sea)">Вернуться в каталог</a></div>'}
  else{
    document.title=f.title+' — DomPro';
    $('#flat').innerHTML=`<div class="detail"><div>
      <img class="main-img" id="main" src="${img('apartment,interior',f.id,900,600)}" alt="${f.title}">
      <div class="thumbs">${['bedroom','kitchen','building'].map((t,i)=>`<img src="${img(t,f.id*10+i,300,200)}" alt="${t}" data-big="${img(t,f.id*10+i,900,600)}">`).join('')}</div>
      <h2 style="margin-top:24px">Описание</h2><p>${f.desc}</p>
      <h2 style="margin-top:24px">Расположение</h2>
      <p class="meta" style="margin-bottom:10px">${f.address}, Варшава, район ${f.district}</p>
      <iframe title="Карта" width="100%" height="300" style="border:0;border-radius:14px" loading="lazy"
        src="https://www.openstreetmap.org/export/embed.html?bbox=20.85,52.12,21.2,52.32&layer=mapnik"></iframe></div>
      <aside class="panel" style="align-self:start"><span class="tag">${f.district}</span>
        <h1 style="font-size:1.5rem;margin:8px 0">${f.title}</h1><div class="price" style="font-size:1.8rem">${fmt(f.price)}</div>
        <div class="meta">≈ ${fmt(Math.round(f.price/f.area))} за м²</div>
        <div class="specs"><div>Комнат<b>${f.rooms}</b></div><div>Площадь<b>${f.area} м²</b></div><div>Этаж<b>${f.floor}</b></div><div>Год постройки<b>${f.year}</b></div></div>
        <form id="lead"><input required placeholder="Ваше имя"><input required type="tel" placeholder="Телефон"><button class="btn">Заказать просмотр</button></form>
        <p class="ok" id="leadOk" hidden>Заявка отправлена! Мы перезвоним в течение часа.</p></aside></div>`;
    document.querySelectorAll('.thumbs img').forEach(t=>t.onclick=()=>$('#main').src=t.dataset.big);
    $('#lead').onsubmit=e=>{e.preventDefault();e.target.hidden=true;$('#leadOk').hidden=false};
  }
}

// ---- Блог ----
const dateRu = s => new Date(s).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
if(page==='blog'){
  const tags=['Все',...new Set(POSTS.map(p=>p.tag))];
  $('#tags').innerHTML=tags.map((t,i)=>`<button class="btn alt tagbtn${i?'':' active'}" data-t="${t}">${t}</button>`).join('');
  const show=t=>{
    $('#posts').innerHTML=POSTS.filter(p=>t==='Все'||p.tag===t).map(p=>`<article class="post"><a href="article.html?id=${p.id}"><img loading="lazy" src="${img('house,architecture',p.id+100)}" alt="${p.title}"></a>
    <div class="in"><span class="tag">${p.tag}</span><h3 style="margin:8px 0"><a href="article.html?id=${p.id}">${p.title}</a></h3>
    <div class="meta">${dateRu(p.date)} · ${p.author} · ${p.read} мин чтения</div><p style="margin:8px 0">${p.text}</p>
    <a class="btn" href="article.html?id=${p.id}">Читать полностью</a></div></article>`).join('');
  };
  document.querySelectorAll('.tagbtn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tagbtn').forEach(x=>x.classList.remove('active'));b.classList.add('active');show(b.dataset.t)});
  show('Все');
}
if(page==='article'){
  const p=POSTS.find(x=>x.id==new URLSearchParams(location.search).get('id'));
  if(!p){$('#article').innerHTML='<div class="empty">Статья не найдена. <a href="blog.html" style="color:var(--sea)">Ко всем статьям</a></div>'}
  else{
    document.title=p.title+' — DomPro';
    const body=p.body.map(t=>t.startsWith('## ')?`<h3 class="art-h">${t.slice(3)}</h3>`:`<p>${t}</p>`).join('');
    const more=POSTS.filter(x=>x.id!==p.id).slice(0,3).map(x=>`<a class="panel more" href="article.html?id=${x.id}"><span class="tag">${x.tag}</span><b>${x.title}</b><span class="meta">${dateRu(x.date)}</span></a>`).join('');
    $('#article').innerHTML=`<article class="art"><span class="tag">${p.tag}</span><h1>${p.title}</h1>
      <div class="meta" style="margin:8px 0 18px">${dateRu(p.date)} · ${p.author} · ${p.read} мин чтения</div>
      <img src="${img('house,architecture',p.id+100)}" alt="${p.title}">
      <p class="lead">${p.text}</p>${body}</article>
      <h2 style="margin-top:40px">Читайте также</h2><div class="grid">${more}</div>`;
  }
}

// ---- Генератор реквизитов ----
if(page==='contacts'){
  const rnd=n=>Array.from({length:n},()=>Math.floor(Math.random()*10)).join('');
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  function nip(){ // NIP с корректной контрольной цифрой
    const w=[6,5,7,2,3,4,5,6,7];
    while(true){
      const d=Array.from({length:9},()=>Math.floor(Math.random()*10));
      const c=d.reduce((s,x,i)=>s+x*w[i],0)%11;
      if(c<10)return d.join('')+c;
    }
  }
  function iban(){ // польский IBAN с корректной контрольной суммой
    const bban=rnd(24), n=BigInt(bban+'252100'), cc=String(98n-n%97n).padStart(2,'0');
    return `PL${cc}${bban}`.replace(/(.{4})/g,'$1 ').trim();
  }
  function gen(){
    const name=pick(['Dom','Nova','Urban','Skyline','Riva','Opal','Capital'])+' '+pick(['Estate','Group','Invest','Property','Bud'])+' Sp. z o.o.';
    const rows=[['Название компании',name],['NIP',nip()],['REGON',rnd(9)],['KRS',rnd(10)],
      ['Адрес','ul. '+pick(['Złota','Piękna','Wolska','Targowa'])+' '+(1+Math.floor(Math.random()*120))+', 00-'+rnd(3)+' Warszawa'],
      ['Банк',pick(['PKO Bank Polski','mBank','ING Bank Śląski','Santander'])],['IBAN',iban()],
      ['SWIFT/BIC',pick(['BPKOPLPW','BREXPLPW','INGBPLPW','WBKPPLPP'])],
      ['Телефон','+48 '+rnd(3)+' '+rnd(3)+' '+rnd(3)],['E-mail','office@'+name.split(' ')[0].toLowerCase()+'.pl']];
    $('#req').innerHTML=rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
    window._req=rows.map(r=>r.join(': ')).join('\n');
  }
  $('#gen').onclick=gen;
  $('#copy').onclick=()=>navigator.clipboard.writeText(window._req).then(()=>{$('#copied').hidden=false;setTimeout(()=>$('#copied').hidden=true,1800)});
  $('#msg').onsubmit=e=>{e.preventDefault();e.target.reset();$('#sent').hidden=false};
  gen();
}
