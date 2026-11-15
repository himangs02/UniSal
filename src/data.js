export const ROLES=[
 {id:'student',name:'Aarav Sharma',title:'B.Tech CSE · Student',short:'Student',initials:'AS'},
 {id:'faculty',name:'Dr. Priya Verma',title:'Associate Professor · Faculty',short:'Faculty',initials:'PV'},
 {id:'l1',name:'Mr. Rajesh Kumar',title:'Academic Section Clerk · L1',short:'L1 Resolver',initials:'RK'},
 {id:'l2',name:'Mrs. Sunita Nair',title:'Assistant Registrar · L2',short:'L2 Supervisor',initials:'SN'},
 {id:'l3',name:'Prof. R.K. Malhotra',title:'Vice-Chancellor / Registrar · L3',short:'VC Executive',initials:'RM'}
];
export const CHARTER=[
 {id:'certificate',audience:'student',name:'Bonafide / Transcript Certificate',department:'Academic Section',hours:72,chain:['Academic Clerk','Assistant Registrar','Registrar']},
 {id:'maintenance',audience:'student',name:'Hostel / Campus Wi-Fi & Maintenance',department:'Campus & IT Services',hours:24,chain:['IT/Hostel Supervisor','Chief Warden/IT Head','Dean Student Welfare']},
 {id:'exam',audience:'student',name:'Exam Re-evaluation / Grade Query',department:'Examination Cell',hours:120,chain:['Exam Coordinator','Deputy Controller','Controller of Exams']},
 {id:'leave',audience:'faculty',name:'Leave Approval / Service Book Update',department:'Human Resources',hours:48,chain:['Dept Coordinator','Deputy Registrar HR','Registrar']},
 {id:'research',audience:'faculty',name:'Research Grant / Travel Reimbursement',department:'Research & Finance',hours:96,chain:['Accounts Officer','Finance Officer','Vice-Chancellor']}
];
export const HOUR=3600000;
export const INITIAL_TIME=new Date('2026-11-15T12:00:00+05:30').getTime();
export const fmt=(ms)=>new Date(ms).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'});
export const duration=(ms)=>{const m=Math.max(0,Math.floor(ms/60000));return `${Math.floor(m/60)}h ${String(m%60).padStart(2,'0')}m`;};
export const makeEvent=(type,at,message,actor='System')=>({id:`${at}-${Math.random().toString(36).slice(2,7)}`,type,at,message,actor});
export const seedTickets=()=>{
 const examples=[
  ['UNI-2026-101','student','certificate','Bonafide certificate for scholarship application',-14,'review'],
  ['UNI-2026-102','student','maintenance','Hostel Block C Wi-Fi outage affecting online classes',-19,'review'],
  ['UNI-2026-103','student','exam','Request re-evaluation for CS401 end-semester grade',-37,'review'],
  ['UNI-2026-104','faculty','leave','Casual leave approval for academic conference',-43,'review'],
  ['UNI-2026-105','faculty','research','Reimbursement for IEEE conference registration',-85,'review'],
  ['UNI-2026-106','student','maintenance','Repair corridor lighting in hostel block',-30,'resolved'],
  ['UNI-2026-107','faculty','leave','Service book designation correction',-27,'resolved'],
  ['UNI-2026-108','student','certificate','Transcript for postgraduate admission',-64,'review']
 ];
 return examples.map(([id,applicant,serviceId,description,age,status],i)=>{
  const service=CHARTER.find(s=>s.id===serviceId),createdAt=INITIAL_TIME+age*HOUR;
  const resolvedAt=status==='resolved'?createdAt+(i===5?21:19)*HOUR:null;
  const events=[makeEvent('created',createdAt,'Request submitted and SLA clock started',applicant==='student'?'Aarav Sharma':'Dr. Priya Verma'),makeEvent('review',createdAt+HOUR,'Assigned to Level 1 resolver','System')];
  if(resolvedAt)events.push(makeEvent('resolved',resolvedAt,'Request resolved and closed','Mr. Rajesh Kumar'));
  return {id,applicant,serviceId,description,attachment:null,createdAt,deadline:createdAt+service.hours*HOUR,status,level:1,pausedAt:null,pausedTotal:0,resolvedAt,remarks:resolvedAt?'Completed and verified.':null,feedback:null,events};
 });
};
export const INITIAL_STATE=()=>({tickets:seedTickets(),offset:0,nextId:109,role:'student',tab:'overview'});
export const getService=t=>CHARTER.find(s=>s.id===t.serviceId);
export const effectiveNow=(t,now)=>t.pausedAt??now;
export const elapsed=(t,now)=>Math.max(0,effectiveNow(t,now)-t.createdAt-t.pausedTotal);
export const remaining=(t,now)=>t.deadline+ t.pausedTotal-effectiveNow(t,now);
export const stage=(t,now)=>t.status==='resolved'?'resolved':t.pausedAt?'paused':remaining(t,now)<=0?'breached':elapsed(t,now)>=getService(t).hours*HOUR*.8?'warning':'track';
export const owner=(t)=>{const service=getService(t);if(t.status==='resolved')return 'Completed';if(t.level===1)return `Mr. Rajesh Kumar · ${service.chain[0]}`;if(t.level===2)return `Mrs. Sunita Nair · ${service.chain[1]}`;return `Prof. R.K. Malhotra · ${service.chain[2]}`;};
// A breached ticket advances one escalation level per SLA-sized interval after its deadline.
// A 24-hour service therefore escalates to L2 after 24 hours and L3 after 48 hours.
export function reconcile(tickets,now){let changes=[];const updated=tickets.map(ticket=>{
 if(ticket.status==='resolved'||ticket.pausedAt)return ticket;
 const service=getService(ticket),age=elapsed(ticket,now),interval=service.hours*HOUR;
 const desiredLevel=Math.min(3,1+Math.floor(age/interval));
 const events=[...ticket.events];
 if(age>=interval*.8&&!events.some(e=>e.type==='warning'))events.push(makeEvent('warning',ticket.createdAt+ticket.pausedTotal+interval*.8,'80% of SLA elapsed: warning issued'));
 for(let level=ticket.level+1;level<=desiredLevel;level++){
  const at=ticket.createdAt+ticket.pausedTotal+(level-1)*interval;
  const msg=`SLA breach: automatically escalated to L${level} (${service.chain[level-1]})`;
  events.push(makeEvent('escalation',at,msg));changes.push(`${ticket.id} escalated to L${level}`);
 }
 return {...ticket,level:Math.max(ticket.level,desiredLevel),events:events.sort((a,b)=>a.at-b.at)};
 });return {tickets:updated,changes};}
