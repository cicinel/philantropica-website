if(location.pathname.replace(/\/$/,'')==='/seamless'&&location.hash==='#about')location.replace('/about/');
const dialog=document.querySelector('#access-dialog');
if(dialog){
 const form=dialog.querySelector('form'),title=dialog.querySelector('h2'),description=dialog.querySelector('.dialog-description'),submit=form.querySelector('[type=submit]'),error=form.querySelector('.form-error'),success=dialog.querySelector('.access-success'),message=form.elements.message;
 let submitting=false;
 for(const trigger of document.querySelectorAll('[data-access="access"]'))trigger.addEventListener('click',()=>{
  form.reset();form.hidden=false;success.hidden=true;error.textContent='';submit.disabled=false;
  title.textContent='Get early access';description.textContent='Tell us what you’d like to run with Seamless. We’ll get in touch.';
  message.required=false;
  submit.querySelector('span').textContent='Request access';
  form.dataset.source=trigger.dataset.accessSource??'page';dialog.showModal();document.body.classList.add('dialog-open');
 });
 const close=()=>{if(!submitting)dialog.close()};dialog.querySelector('.dialog-close').addEventListener('click',close);dialog.querySelector('[data-dialog-done]').addEventListener('click',close);
 dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
 dialog.addEventListener('cancel',event=>{if(submitting)event.preventDefault()});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close()}});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(submitting||!form.reportValidity())return;submitting=true;submit.disabled=true;submit.setAttribute('aria-busy','true');error.textContent='';
  const data={kind:'access',name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),message:message.value.trim(),website:form.elements.website.value,source:form.dataset.source,page:location.pathname};
  try{const response=await fetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error??'Could not send your request. Please try again.');
   form.hidden=true;success.hidden=false;title.textContent='Request received.';description.textContent='';success.querySelector('p').textContent='Thanks for signing up. We’ll be in touch.';success.querySelector('button').focus();
  }catch(e){error.textContent=['TimeoutError','TypeError','AbortError'].includes(e.name)?'Could not send your request. Please try again.':e.message||'Could not send your request. Please try again.';error.focus()}
  finally{submitting=false;submit.disabled=false;submit.removeAttribute('aria-busy')}
 });
}
