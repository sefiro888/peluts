/* PELUTS · comportamiento del sitio */
(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- tiendas: datos reales sacados de carrerdesants.cat, comerciantslamarina.cat e Instagram ---- */
var SHOPS={
  sants:{n:'Sants',h:{1:[[10,14],[17,20.5]],2:[[10,14],[17,20.5]],3:[[10,14],[17,20.5]],4:[[10,14],[17,20.5]],5:[[10,14],[17,20.5]],6:[[10,14],[17,20.5]],0:[]},wa:'34608621979'},
  zf:{n:'Zona Franca',h:{1:[[10,13.5],[17,20.5]],2:[[10,13.5],[17,20.5]],3:[[10,13.5],[17,20.5]],4:[[10,13.5],[17,20.5]],5:[[10,13.5],[17,20.5]],6:[[10,14]],0:[]},wa:'34660632371'},
  vh:{n:"Violant d'Hongria",h:null,wa:'34660632371'}
};
function nowBCN(){
  var p=new Intl.DateTimeFormat('es-ES',{timeZone:'Europe/Madrid',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()),o={};
  p.forEach(function(x){o[x.type]=x.value});
  var map={'lun':1,'mar':2,'mié':3,'jue':4,'vie':5,'sáb':6,'dom':0};
  var w=o.weekday.replace('.','').toLowerCase();
  return {d:map[w]!==undefined?map[w]:new Date().getDay(),t:(+o.hour%24)+(+o.minute)/60};
}
function fmt(t){var h=Math.floor(t),m=Math.round((t-h)*60);return h+':'+(m<10?'0':'')+m}
function status(key){
  var s=SHOPS[key];if(!s||!s.h)return {st:'unk',txt:'Horario: consúltalo por WhatsApp'};
  var n=nowBCN(),slots=s.h[n.d]||[];
  for(var i=0;i<slots.length;i++){if(n.t>=slots[i][0]&&n.t<slots[i][1])return {st:'open',txt:'Abierto ahora · cierra a las '+fmt(slots[i][1])}}
  for(var j=0;j<slots.length;j++){if(n.t<slots[j][0])return {st:'closed',txt:'Cerrado · abre hoy a las '+fmt(slots[j][0])}}
  for(var k=1;k<=7;k++){var dd=(n.d+k)%7,sl=s.h[dd]||[];if(sl.length){var nm=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][dd];return {st:'closed',txt:'Cerrado · abre '+(k===1?'mañana':'el '+nm)+' a las '+fmt(sl[0][0])}}}
  return {st:'closed',txt:'Cerrado'};
}
function paintStatus(){
  $$('[data-status]').forEach(function(el){
    var r=status(el.getAttribute('data-status'));
    el.classList.remove('open','closed');if(r.st!=='unk')el.classList.add(r.st);
    var t=$('.t',el);if(t)t.textContent=r.txt;
  });
  var hoy=nowBCN().d;
  $$('tr[data-d]').forEach(function(tr){tr.classList.toggle('hoy',+tr.getAttribute('data-d')===hoy)});
}
paintStatus();setInterval(paintStatus,60000);

/* ---- intro ---- */
var intro=$('.intro');
if(intro){
  var seen=false;try{seen=sessionStorage.getItem('pl-intro')}catch(e){}
  var close=function(){intro.classList.add('out');try{sessionStorage.setItem('pl-intro','1')}catch(e){}};
  if(seen||reduce){intro.remove()}else{setTimeout(close,2300);intro.addEventListener('click',close)}
}

/* ---- menú móvil ---- */
var burger=$('.burger'),nav=$('#nav');
if(burger){burger.addEventListener('click',function(){var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
  $$('a',nav).forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open')})})}

/* ---- progreso con huesito ---- */
var bar=$('.progress span'),bone=$('.progress i');
function prog(){var h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight||1)*100;if(bar)bar.style.width=p+'%';if(bone)bone.style.left=p+'%'}
addEventListener('scroll',prog,{passive:true});prog();

/* ---- reveal (scroll + rAF: no depende de IntersectionObserver) ---- */
var pend=$$('.rv:not(.in)'),ticking=false;
function reveal(){
  ticking=false;var vh=innerHeight*0.94;
  pend=pend.filter(function(el){var r=el.getBoundingClientRect();if(r.top<vh&&r.bottom>-60){el.classList.add('in');return false}return true});
}
function req(){if(!ticking){ticking=true;requestAnimationFrame(reveal)}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);addEventListener('load',req);
reveal();setTimeout(reveal,400);setTimeout(reveal,1200);
setInterval(function(){if(pend.length)reveal()},450); /* red de seguridad: si el navegador no emite scroll, igualmente aparece */

/* ---- huellas de perro siguiendo el cursor ---- */
if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  var last=0,flip=1,lx=0,ly=0;
  addEventListener('mousemove',function(e){
    var now=performance.now();if(now-last<170)return;
    var dx=e.clientX-lx,dy=e.clientY-ly;if(Math.hypot(dx,dy)<46)return;
    last=now;lx=e.clientX;ly=e.clientY;
    var a=Math.atan2(dy,dx)*180/Math.PI+90,p=document.createElement('div');
    p.className='pawprint';flip*=-1;
    p.style.left=(e.clientX-11+flip*9)+'px';p.style.top=(e.clientY-11)+'px';
    p.style.transform='rotate('+a+'deg)';p.style.setProperty('--t','rotate('+a+'deg)');
    p.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="16" rx="5.5" ry="4.5"/><ellipse cx="5" cy="10" rx="2.2" ry="3"/><ellipse cx="9.5" cy="5.5" rx="2.2" ry="3"/><ellipse cx="14.5" cy="5.5" rx="2.2" ry="3"/><ellipse cx="19" cy="10" rx="2.2" ry="3"/></svg>';
    document.body.appendChild(p);setTimeout(function(){p.remove()},1600);
  },{passive:true});
}

/* ---- selector perro / gato ---- */
$$('.switch').forEach(function(sw){
  var btns=$$('button',sw),pill=$('.pill',sw);
  function sel(b){
    btns.forEach(function(x){var on=x===b;x.setAttribute('aria-selected',on);var pane=document.getElementById(x.getAttribute('aria-controls'));if(pane)pane.hidden=!on});
    pill.style.width=b.offsetWidth+'px';pill.style.transform='translateX('+(b.offsetLeft-5)+'px)';
  }
  btns.forEach(function(b){b.addEventListener('click',function(){sel(b)})});
  sel(btns[0]);addEventListener('resize',function(){sel($('[aria-selected=true]',sw))});
  document.fonts&&document.fonts.ready.then(function(){sel($('[aria-selected=true]',sw))});
});

/* ---- copiar teléfono ---- */
$$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){
  var v=b.getAttribute('data-copy'),old=b.innerHTML;
  (navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).catch(function(){}).then(function(){b.textContent='¡Copiado!';setTimeout(function(){b.innerHTML=old},1500)});
})});

/* ---- generador de cita por WhatsApp ---- */
var form=$('form.cita');
if(form){
  var pre=$('.preview'),go=$('#go-wa');
  function val(n){var el=form.elements[n];if(!el)return '';if(el.length&&el[0]&&el[0].type==='radio'){var c=form.querySelector('input[name='+n+']:checked');return c?c.value:''}return el.value.trim()}
  function build(){
    var shop=val('tienda'),pet=val('animal'),srv=val('servicio'),nom=val('nombre'),dia=val('dia'),nota=val('nota');
    var l=['¡Hola Peluts! Me gustaría pedir cita 🐾',''];
    l.push('• Tienda: '+(SHOPS[shop]?SHOPS[shop].n:shop));
    l.push('• Peludo: '+pet+(nom?' ('+nom+')':''));
    l.push('• Servicio: '+srv);
    if(dia){var d=new Date(dia+'T12:00:00');l.push('• Día que mejor me va: '+d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}))}
    if(nota)l.push('• Nota: '+nota);
    l.push('','Gracias 🤎');
    var txt=l.join('\n');
    pre.textContent=txt;
    go.href='https://wa.me/'+(SHOPS[shop]?SHOPS[shop].wa:'34660632371')+'?text='+encodeURIComponent(txt);
    var st=$('#st-cita');if(st){var s=status(shop);st.setAttribute('data-status',shop);paintStatus()}
  }
  form.addEventListener('input',build);form.addEventListener('change',build);
  var q=new URLSearchParams(location.search);
  ['servicio','animal','tienda'].forEach(function(k){if(q.get(k)){var r=form.querySelector('input[name='+k+'][value="'+q.get(k)+'"]');if(r)r.checked=true}});
  build();
}
var y=$('#year');if(y)y.textContent=new Date().getFullYear();
})();

/* ---- guía rápida de servicios ---- */
(function(){
var g=document.getElementById('guide');if(!g)return;
var T={
 Perro:{primera:['Primera visita de cachorro','Una visita corta y tranquila: baño suave, secado con calma y mucho mimo para que asocie la peluquería a algo bonito.','Baño e higiene'],
  mantenimiento:['Baño y mantenimiento','Baño, secado y cepillado, con repaso de las zonas delicadas. Lo ideal es repetirlo con regularidad según su tipo de pelo.','Baño e higiene'],
  look:['Baño y corte a tu gusto','Corte a tijera o máquina según su raza y lo que prefieras. Enséñanos una foto del corte que te gusta.','Baño y corte'],
  especial:['Atención personalizada','Si es miedoso, tiene nudos, la piel delicada o necesita algo especial, cuéntanoslo y adaptamos la visita.','Consulta / otro']},
 Gato:{primera:['Primera higiene felina','Un baño tranquilo, sin prisas y en un ambiente calmado, para que la experiencia sea lo más amable posible.','Higiene felina'],
  mantenimiento:['Higiene felina','Baño y cepillado para mantener su pelo y su piel en buen estado, con consejos para hacerlo en casa.','Higiene felina'],
  look:['Consulta de estilo y cuidado','Cuéntanos qué te gustaría cambiar en su pelo y te asesoramos por mensaje antes de reservar.','Consulta / otro'],
  especial:['Gatos sphynx y casos especiales','Su piel necesita cuidados específicos y baños regulares. Te explicamos cada cuánto y con qué productos.','Sphynx']}
};
function upd(){
 var a=g.querySelector('input[name=g-animal]:checked').value,m=g.querySelector('input[name=g-momento]:checked').value,t=T[a][m];
 g.querySelector('h3').textContent=t[0];g.querySelector('.out p').textContent=t[1];
 g.querySelector('.out a').href='cita.html?animal='+encodeURIComponent(a)+'&servicio='+encodeURIComponent(t[2]);
}
g.addEventListener('change',upd);upd();
})();
