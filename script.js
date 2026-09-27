const box=document.querySelector('#lightbox'), big=document.querySelector('#lightboxImg');
document.querySelectorAll('.photo').forEach(p=>p.addEventListener('click',()=>{big.src=p.dataset.src;box.classList.add('open');box.setAttribute('aria-hidden','false')}));
function closeBox(){box.classList.remove('open');box.setAttribute('aria-hidden','true');big.src=''}
document.querySelector('.close').addEventListener('click',closeBox);box.addEventListener('click',e=>{if(e.target===box)closeBox()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeBox()});document.querySelector('#year').textContent=new Date().getFullYear();
