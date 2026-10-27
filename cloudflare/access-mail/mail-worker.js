async function notify(id,env){
 const row=await env.ACCESS_DB.prepare("UPDATE access_requests SET notification_status='sending',notification_attempts=notification_attempts+1,last_attempt=unixepoch() WHERE id=? AND notification_attempts<10 AND (notification_status='pending' OR (notification_status='sending' AND last_attempt<unixepoch()-300)) RETURNING *").bind(id).first();
 if(!row)return;
 try{
  const subject=row.kind==='contact'?'Seamless: message to the founders':'Seamless: early-access request';
  const body=[subject,'',`Name: ${row.name||'(not provided)'}`,`Email: ${row.email}`,`Source: ${row.source||'website'}`,`Page: ${row.page||'/seamless'}`,'',row.message||'(no additional message)','',`Request ID: ${row.id}`].join('\n');
  await env.EMAIL.send({from:'Seamless <requests@notify.philantropica.co>',to:env.RECIPIENT,subject,text:body,replyTo:row.email});
  await env.ACCESS_DB.prepare("UPDATE access_requests SET notification_status='sent',notification_error=NULL WHERE id=?").bind(id).run();
 }catch(error){await env.ACCESS_DB.prepare("UPDATE access_requests SET notification_status='pending',notification_error=? WHERE id=?").bind(String(error?.message??'Notification failed').slice(0,250),id).run();console.error('Early access email pending');}
}
export default {
 async fetch(request,env){
  if(request.method!=='POST'||new URL(request.url).hostname!=='internal.seamless')return new Response('Not found',{status:404});
  const data=await request.json();if(typeof data.id!=='string')return new Response('Invalid request',{status:400});
  await notify(data.id,env);return Response.json({ok:true});
 },
 async scheduled(controller,env,ctx){
  const {results}=await env.ACCESS_DB.prepare("SELECT id FROM access_requests WHERE notification_attempts<10 AND (notification_status='pending' OR (notification_status='sending' AND last_attempt<unixepoch()-300)) ORDER BY created_at LIMIT 25").all();
  for(const row of results)await notify(row.id,env);
  await env.ACCESS_DB.prepare('DELETE FROM request_limits WHERE expires<unixepoch()').run();
 }
};


