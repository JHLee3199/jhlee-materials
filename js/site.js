const menu = document.querySelector('#menuBtn');
const nav = document.querySelector('#sidenav');
const overlay = document.querySelector('#overlay');
function closeMenu(){nav?.classList.remove('open');overlay.hidden=true;document.body.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');}
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');overlay.hidden=!open;document.body.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));});
overlay?.addEventListener('click',closeMenu);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.querySelectorAll('[data-year]').forEach(el=>{el.textContent=new Date().getFullYear();});
