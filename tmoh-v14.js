/* Tmoh V14 — six-section shell on top of the existing app.
   Additive: wraps VIEWS/enter/render, never touches localStorage key "tmoh2" formats,
   the chatbot URL (CONFIG.AI_URL) or any existing page. Extra data lives in d.tm14.
   Load this file LAST (after tmoh-flow.js / tmoh-v9.js ...). */
(function(){
'use strict';
if(typeof VIEWS==='undefined'||typeof PAGES==='undefined'||typeof esc!=='function'||typeof go!=='function')return;

const E=v=>esc(String(v??''));
const SECTIONS=[['home','🏠','الرئيسية'],['study','📚','المذاكرة'],['chatbook','🤖','ChatBook'],['rewardhub','🏆','التحفيز والمكافآت'],['progress','🚀','رحلتي وتقدمي'],['moretools','🧰','أدوات أخرى']];
const OWN=new Set(SECTIONS.map(s=>s[0]));
const SECTION_OF={};
[['study',['curriculum','books','bacc','planner','focus','focusroom','backlog','smartbacklog','weekplan','daily','exams','quickquiz','cards','mistakes','rest','movement','studytools','mylibrary']],
 ['chatbook',['assistant']],
 ['rewardhub',['rewards','achievements','league','museum','mascot']],
 ['progress',['journey','analytics','report','weekstory']],
 ['moretools',['settings','notes','library','health','cloudsync','search']]].forEach(([k,a])=>a.forEach(p=>SECTION_OF[p]=k));

const MOODS=[
 ['😊','سعيد','جميل! خلّي الإحساس ده يدفعك لخطوة صغيرة في مذاكرتك النهاردة.'],
 ['🚀','متحمس','استغل حماسك وابدأ بأصعب مهمة، وبعدها كمّل بالباقي.'],
 ['🌿','مرتاح','وقت مناسب لجلسة هادية بإيقاع ثابت.'],
 ['😴','متعب','اختار مهمة خفيفة أو جلسة قصيرة، وخد راحة بين الجلسات.'],
 ['😟','قلق','قسّم المطلوب لخطوات صغيرة وابدأ بأسهلها. لو القلق مستمر أو بيأثر عليك، اتكلم مع حد قريب منك أو مع مختص.'],
 ['😐','ملل','جرّب تغيّر المادة أو طريقة المذاكرة، أو ابدأ بجلسة قصيرة 10 دقايق.']
];
const LEGACY_FEEL={'أشعر بالملل':['😐','ملل'],'أشعر بالتعب':['😴','متعب'],'أشعر بالحماس':['🚀','متحمس'],'أشعر بالراحة':['🌿','مرتاح']};
const ICONS={'اللغة العربية':'📖','اللغة الإنجليزية':'🔤','الرياضيات':'📐','العلوم المتكاملة':'🔬','الفيزياء':'⚡','الكيمياء':'🧪','الأحياء':'🌱','التاريخ':'🏛️','الجغرافيا':'🌍','الفلسفة والمنطق':'💡','الثقافة المالية':'💰'};
const NAMES={'اللغة الأجنبية الأولى':'اللغة الإنجليزية','الرياضيات العامة':'الرياضيات','التاريخ المصري':'التاريخ','إحصاء':'الرياضيات','الإحصاء':'الرياضيات'};
const norm=s=>NAMES[s]||s;
const HOBBY_IDEAS={
 'القراءة':['اقرأ 15 دقيقة من كتاب تحبه واكتب جملة أعجبتك.','لخّص آخر فصل قرأته في ثلاث جمل.','ابحث عن كلمة جديدة من قراءتك واستخدمها في جملة.'],
 'الكتابة':['اكتب فقرة من 5 جمل عن مشهد حولك من غير ما تذكر اسمه.','غيّر نهاية قصة تعرفها واكتب النهاية الجديدة.','اكتب حوارًا قصيرًا بين شخصين مختلفين في الطباع.'],
 'الرسم':['ارسم شيئًا قدامك لمدة 10 دقايق من غير ما ترفع القلم.','جرّب رسم نفس الشكل بتظليل فاتح وغامق.','ارسم مشهدًا من درس ذاكرته النهاردة.'],
 'البرمجة':['حل لغز منطقي على الورق قبل ما تكتب أي كود.','اكتب خطوات برنامج صغير (خوارزمية) لحساب متوسط ثلاث درجات.','فكّر في مشروع صغير يخدم مذاكرتك واكتب مميزاته.'],
 'العلوم':['لاحظ ظاهرة من حياتك اليومية واكتب سؤالًا علميًا عنها.','اشرح مفهومًا علميًا لصديق في دقيقة واحدة.'],
 'الموسيقى':['استمع لمقطوعة بتركيز 5 دقايق وحاول تحديد الإيقاع.','دوّن إيقاعًا بسيطًا بالتصفيق وكرره 4 مرات.'],
 'التصوير':['صوّر نفس الشيء من 3 زوايا واختار الأوضح.','لاحظ مصدر الضوء قبل ما تصوّر.'],
 'كرة القدم':['اعمل تمدد خفيف 5 دقايق بعد المذاكرة.','اكتب تحدّي معلومات رياضية بسيط لنفسك واختبر نفسك فيه.']
};
const WDAYS=7;

/* ---------- data helpers (always from the student's real records) ---------- */
function store(){
 if(!d.tm14||typeof d.tm14!=='object'||Array.isArray(d.tm14))d.tm14={};
 const s=d.tm14;
 if(!Array.isArray(s.moods))s.moods=[];
 if(!s.sel||typeof s.sel!=='object')s.sel={subject:'',lessonId:''};
 if(!Array.isArray(s.reports))s.reports=[];
 return s;
}
const LESSONS=()=>window.TMOH_STUDY_CONTENT?.lessons||[];
function gradeIdx(){
 if(typeof PREP_GRADES!=='undefined'&&PREP_GRADES.includes(d.grade))return PREP_GRADES.indexOf(d.grade)-3;
 const i=typeof SECONDARY_GRADES!=='undefined'?SECONDARY_GRADES.indexOf(d.grade):-1;
 return i>=0?i+1:1;
}
function dayRange(back){const a=new Date();a.setHours(0,0,0,0);a.setDate(a.getDate()-back);const b=new Date(a);b.setDate(b.getDate()+1);return [+a,+b];}
const sessions=()=>(d.sessions||[]).filter(s=>s&&Number.isFinite(Number(s.end)));
const minsIn=(a,b)=>Math.round(sessions().filter(s=>s.end>=a&&s.end<b).reduce((t,s)=>t+(Number(s.ms)||0),0)/6e4);
const dateStr=ts=>new Date(ts-new Date(ts).getTimezoneOffset()*6e4).toISOString().slice(0,10);
function weekTasks(){const from=dateStr(dayRange(WDAYS-1)[0]),to=iso();return (d.tasks||[]).filter(t=>t&&t.date>=from&&t.date<=to);}
function weekPct(){const t=weekTasks();return t.length?Math.round(t.filter(x=>x.done).length/t.length*100)+'%':'—';}
function lessonsDone(){return Object.keys(d.done||{}).length+Object.keys(d.studyV1?.completed||{}).length;}
function lessonTitle(id){const l=LESSONS().find(x=>x.id===id);return l?l.title:id;}
function xpParts(){
 const doneTasks=(d.tasks||[]).filter(t=>t.done).length,steps=(d.backlog||[]).reduce((a,b)=>a+(b.subs||[]).filter(s=>s.done).length,0),rev=(d.mistakes||[]).filter(m=>m.rev).length;
 return [['⏱️ وقت المذاكرة الفعلي (1 لكل دقيقة)',mins(0)],['✅ مهام مكتملة (5 لكل مهمة)',5*doneTasks],['⏳ خطوات تراكمات (5 لكل خطوة)',5*steps],['🧠 أخطاء تمت مراجعتها (3 لكل خطأ)',3*rev],['📘 دروس مكتملة (10 لكل درس)',10*Object.keys(d.done||{}).length],['✨ نقاط إضافية من التحديات',Math.max(0,Number(d.v6?.bonusXP)||0)]];
}
function level(){const x=xp(),lv=Math.floor(x/100)+1;return{x,lv,into:x%100,next:lv*100};}
function lastSession(){const a=sessions();return a.length?a.reduce((m,s)=>s.end>m.end?s:m):null;}
function latestMood(){
 const mine=store().moods.map(m=>({e:m.e,l:m.l,at:m.at,msg:(MOODS.find(x=>x[1]===m.l)||[])[2]||''}));
 const old=(d.feelings||[]).filter(f=>LEGACY_FEEL[f.value]).map(f=>({e:LEGACY_FEEL[f.value][0],l:LEGACY_FEEL[f.value][1],at:f.at||0,msg:(MOODS.find(x=>x[1]===LEGACY_FEEL[f.value][1])||[])[2]||''}));
 const all=mine.concat(old);return all.length?all.reduce((m,x)=>x.at>m.at?x:m):null;
}
function greeting(){const h=new Date().getHours();return h<5?'ليلة هادية':h<12?'صباح الخير':h<18?'نهارك سعيد':'مساء الخير';}
function setTimerCtx(subject,lessonName){
 if(!d.timer)return;
 if(typeof cut==='function'){if((subject||'')!==(d.timer.subject||''))cut('subject',subject||'');if((lessonName||'')!==(d.timer.lesson||''))cut('lesson',lessonName||'');}
 else{d.timer.subject=subject||'';d.timer.lesson=lessonName||'';save();}
}
const emptyBox=(t,s)=>`<div class="tm14-empty"><b>${E(t)}</b><span>${E(s)}</span></div>`;
function weekBars(){
 const days=[];for(let i=WDAYS-1;i>=0;i--){const [a,b]=dayRange(i);days.push({label:new Date(a).toLocaleDateString('ar-EG',{weekday:'short'}),m:minsIn(a,b)});}
 const mx=Math.max(...days.map(x=>x.m));
 if(mx===0)return emptyBox('لسه مفيش نشاط الأسبوع ده 🌱','ابدأ جلسة مذاكرة قصيرة وهتظهر هنا دقايقك كل يوم.');
 return `<div class="tm14-bars" role="img" aria-label="دقائق المذاكرة آخر 7 أيام">${days.map(x=>`<div class="tm14-bar"><span style="height:${Math.max(4,Math.round(x.m/mx*100))}%"></span><b>${x.m}</b><small>${E(x.label)}</small></div>`).join('')}</div>`;
}
function challenges(){
 const goal=Math.max(15,Number(d.daily)||60),today=minsIn(...dayRange(0)),wk=minsIn(dayRange(WDAYS-1)[0],dayRange(0)[1]),wkGoal=Math.max(60,Number(d.weekGoal)||goal*5);
 const tt=(d.tasks||[]).filter(t=>t.date===iso()),ttd=tt.filter(t=>t.done).length;
 const row=(t,v,max,unit)=>`<div class="tm14-chal"><div><b>${t}</b><small>${v} من ${max} ${unit}</small></div><div class="tm14-meter"><span style="width:${Math.min(100,Math.round(v/Math.max(1,max)*100))}%"></span></div></div>`;
 return row('🎯 هدف مذاكرة اليوم',today,goal,'دقيقة')+row('📅 هدف الأسبوع',wk,wkGoal,'دقيقة')+(tt.length?row('✅ مهام اليوم',ttd,tt.length,'مهمة'):'');
}

/* ---------- HOME ---------- */
function stat(i,t,v,s){return `<div class="tm14-stat"><i>${i}</i><strong>${v}</strong><span>${E(t)}</span>${s?`<small>${E(s)}</small>`:''}</div>`;}
function taskRow(t){
 return `<label class="tm14-task ${t.done?'done':''}"><input type="checkbox" data-act="ttask" data-id="${E(t.id)}" ${t.done?'checked':''} aria-label="إكمال المهمة"><span class="tm14-task-main"><b>${E(t.title)}</b><small>${t.subject?E(t.subject):'عام'} • ${t.time?E(t.time):'بدون وقت'} • ${t.done?'مكتملة':'لم تكتمل'}</small></span>${t.done?'':`<button type="button" class="soft" data-tm14="starttask" data-subject="${E(t.subject||'')}" data-title="${E(t.title)}">ابدأ المذاكرة</button>`}</label>`;
}
function homeView(){
 if(!d)return '';
 const lv=level(),ls=lastSession(),mood=latestMood(),todayTasks=(d.tasks||[]).filter(t=>t.date===iso());
 const badgesOn=(typeof badges==='function'?badges():[]).filter(b=>b[2]);
 const nextSubject=(todayTasks.find(t=>!t.done)||{}).subject||ls?.subject||d.timer?.subject||(d.subjects||[])[0]||'';
 const recent=[];
 Object.entries(d.studyV1?.completed||{}).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([id,at])=>recent.push(['📘','درس مكتمل: '+lessonTitle(id),at]));
 const doneToday=todayTasks.filter(t=>t.done).length;if(doneToday)recent.push(['✅','أنهيت '+doneToday+' من '+todayTasks.length+' مهمة اليوم',Date.now()]);
 const rh=(d.rewardHistory||[]).slice(-1)[0];if(rh)recent.push([rh.icon||'🎁','مكافأة: '+(rh.title||''),Date.parse(rh.date)||0]);
 recent.sort((a,b)=>b[2]-a[2]);
 return `<section class="tm14-hero card"><div><small>${E(greeting())} 🌟</small><h1>${E(d.name)}</h1><p>${d.dream?E(dreamMsg()):'حدّد حلمك من «أدوات أخرى ← ملفي الشخصي» علشان رسائلك تتخصص ليك.'}</p></div><button class="primary" data-tm14="quickstart" data-subject="${E(nextSubject)}">▶ ابدأ جلسة المذاكرة${nextSubject?' • '+E(nextSubject):''}</button></section>
 <section class="tm14-stats">${stat('✅','إنجاز مهام الأسبوع',weekPct(),'آخر 7 أيام')}${stat('⏱️','ساعات المذاكرة',hrs(mins(0)),'الإجمالي')}${stat('🎧','جلسات مكتملة',sessions().length,'')}${stat('📘','دروس مكتملة',lessonsDone(),'')}${stat('⭐','النقاط',lv.x,'المستوى '+lv.lv)}${stat('🏅','الإنجازات',badgesOn.length,'من '+(typeof badges==='function'?badges().length:0))}</section>
 <div class="tm14-cols">
  <section class="card"><h2>📋 مهام اليوم</h2>${todayTasks.length?`<div class="tm14-tasks">${todayTasks.map(taskRow).join('')}</div>`:emptyBox('مفيش مهام لليوم','أضف مهامك من مخطط المذاكرة.')}<div class="btnrow"><button class="soft" data-tm14="go" data-p="planner">إدارة المهام</button></div></section>
  <section class="card"><h2>رحلتك النفسية 💜</h2>${mood?`<div class="tm14-mood"><span>${mood.e}</span><div><b>آخر شعور: ${E(mood.l)}</b><small>${new Date(mood.at).toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'short'})}</small></div></div><p>${E(mood.msg)}</p>`:`<p class="muted">لسه ما سجلتش شعورك. اختار اللي بيوصفك دلوقتي:</p>`}<div class="tm14-moods">${MOODS.map(m=>`<button type="button" class="soft" data-tm14="mood" data-l="${E(m[1])}" data-e="${m[0]}">${m[0]} ${E(m[1])}</button>`).join('')}</div><p class="tiny">دي مجرد أداة لتنظيم يومك، مش تشخيص ولا نصيحة طبية.</p></section>
 </div>
 <div class="tm14-cols">
  <section class="card"><h2>📖 آخر جلسة مذاكرة</h2>${ls?`<p class="tm14-big">${E(ls.subject||'عام')}</p><p class="muted">${E(ls.lesson||'من غير اسم درس')} • ${hrs(Math.round((Number(ls.ms)||0)/6e4))}<br>${new Date(ls.end).toLocaleString('ar-EG',{weekday:'long',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</p><button class="primary" data-tm14="resume" data-subject="${E(ls.subject||'')}" data-lesson="${E(ls.lesson||'')}">كمّل المذاكرة</button>`:emptyBox('لسه مفيش جلسات','أول جلسة هتظهر هنا.')}</section>
  <section class="card"><h2>🏅 آخر الإنجازات</h2>${recent.length||badgesOn.length?`<ul class="tm14-list">${recent.slice(0,4).map(r=>`<li>${r[0]} ${E(r[1])}</li>`).join('')}${badgesOn.slice(0,4).map(b=>`<li>${b[0]} وسام: ${E(b[1])}</li>`).join('')}</ul>`:emptyBox('إنجازك الأول قريب','أنهِ درسًا أو مهمة وهتظهر هنا.')}</section>
 </div>
 <div class="tm14-cols">
  <section class="card"><h2>🎯 التحديات والمستوى</h2><div class="tm14-level"><b>المستوى ${lv.lv}</b><small>${lv.into} من 100 نقطة للمستوى التالي</small><div class="tm14-meter big"><span style="width:${lv.into}%"></span></div></div>${challenges()}<p class="tiny">${lv.into>=50?'قربت جدًا من المستوى الجاي، كمّل بنفس الهدوء 💪':'كل دقيقة مذاكرة حقيقية بتزوّد نقاطك.'}</p></section>
  <section class="card"><h2>📈 مذاكرتي آخر 7 أيام</h2>${weekBars()}</section>
 </div>`;
}

/* ---------- STUDY hub: choose subject ONCE, six tools share it ---------- */
function syncTools(subject,lesson){
 const x=(d.tmohTools&&typeof d.tmohTools==='object'&&!Array.isArray(d.tmohTools))?d.tmohTools:(d.tmohTools={});
 x.subject=norm(subject||'');if(lesson){x.lessonId=lesson.id;x.grade=lesson.grade;}else{x.lessonId='';x.grade=gradeIdx();}
 if(!Array.isArray(x.reviews))x.reviews=[];if(typeof x.accent!=='string')x.accent='#6459d5';
}
const subjectLessons=s=>LESSONS().filter(l=>l.grade===gradeIdx()&&l.subject===norm(s));
function selectedLesson(){const s=store().sel;return s.lessonId?LESSONS().find(l=>l.id===s.lessonId)||null:null;}
function studyView(){
 if(!d)return '';
 const sel=store().sel,subs=d.subjects||[];
 if(!sel.subject||!subs.includes(sel.subject)){
  return `<div class="heading"><div><h1>📚 المذاكرة</h1><p>اختار المادة اللي عايز تذاكرها</p></div></div>${subs.length?`<div class="tm14-grid">${subs.map(s=>{const n=subjectLessons(s).length;return `<button type="button" class="tm14-card" data-tm14="subject" data-s="${E(s)}"><span>${ICONS[norm(s)]||'📘'}</span><b>${E(s)}</b><small>${n?n+' دروس تأسيسية':'بدون دروس موثقة داخل طموح'}</small></button>`}).join('')}</div>`:emptyBox('مفيش مواد في ملفك','أضف موادك من أدوات أخرى ← ملفي الشخصي.')}`;
 }
 const lessons=subjectLessons(sel.subject),les=selectedLesson(),unrev=(d.mistakes||[]).filter(m=>m.subject===sel.subject&&!m.rev).length,open=(d.backlog||[]).filter(b=>b.subject===sel.subject&&typeof bprog==='function'&&bprog(b)<100).length;
 const needLesson=!lessons.length;
 const tool=(t,i,name,sub,off)=>`<button type="button" class="tm14-card ${off?'is-off':''}" data-tm14="tool" data-t="${t}" ${off?'aria-disabled="true"':''}><span>${i}</span><b>${name}</b><small>${E(sub)}</small></button>`;
 return `<div class="heading"><div><h1>${ICONS[norm(sel.subject)]||'📘'} ${E(sel.subject)}</h1><p>${E(d.grade)}${les?' • الدرس: '+E(les.title):''}</p></div><button class="soft" data-tm14="changesubject">تغيير المادة</button></div>
 <section class="card tm14-lessonpick"><h3>الدرس (بتختاره مرة واحدة لكل الأدوات)</h3>${lessons.length?`<div class="tm14-chips">${lessons.map(l=>`<button type="button" class="${les&&les.id===l.id?'primary':'soft'}" data-tm14="lesson" data-id="${E(l.id)}">${E(l.title)}</button>`).join('')}${les?`<button type="button" class="soft" data-tm14="lesson" data-id="">بدون درس محدد</button>`:''}</div>`:`<p class="muted">مفيش دروس تأسيسية موثقة لهذه المادة في صفك حاليًا. العدّاد والتراكمات ومراجعة الأخطاء شغالين، وتقدر تسأل ChatBook (شرح عام غير موثق بالمنهج).</p>`}<p class="tiny">الدروس هنا شروح تأسيسية أصلية، مش نسخ من كتب الوزارة. راجع الكتاب الرسمي.</p></section>
 <div class="tm14-grid tools">
  ${tool('timer','⏱️','ابدأ العدّ','مؤقت مع راحة بعد الجلسة')}
  ${tool('summary','📝','لخّصلي',needLesson?'يحتاج درسًا تأسيسيًا':'نصي • صوتي • خريطة ذهنية',needLesson)}
  ${tool('explain','💡','اشرحلي',needLesson?'يحتاج درسًا تأسيسيًا':'مبسّط • متوسط • تفصيلي',needLesson)}
  ${tool('quiz','📋','اعملّي امتحان',needLesson?'يحتاج درسًا تأسيسيًا':'يُحفظ ويُضاف للأخطاء',needLesson)}
  ${tool('review','🎯','راجع أخطائي',unrev?unrev+' خطأ غير مراجَع':'لا أخطاء غير مراجعة')}
  ${tool('backlog','📚','قوللي تراكماتي',open?open+' تراكم مفتوح':'خطة جلسات صغيرة')}
 </div>`;
}
function waitClick(selector,tries){const el=document.querySelector(selector);if(el){el.click();return;}if(tries>0)setTimeout(()=>waitClick(selector,tries-1),70);}
function openTool(t){
 const sel=store().sel,les=selectedLesson();
 if(t==='timer'){setTimerCtx(sel.subject,les?.title||'');go('focus');return;}
 if(t==='backlog'){go(VIEWS.smartbacklog?'smartbacklog':'backlog');return;}
 if(['summary','explain','quiz'].includes(t)&&!les){msg(subjectLessons(sel.subject).length?'اختار الدرس الأول':'مفيش دروس موثقة للمادة دي لسه');return;}
 syncTools(sel.subject,les);save();go('studytools');waitClick('[data-tm7="'+t+'"]',14);
}

/* ---------- ChatBook (text only: the current Worker has no image/PDF endpoint) ---------- */
let cbMode='ask';
const MODES={
 ask:['💬','اسألني أي سؤال','',''],
 understand:['🧠','فهّمني المعلومة','اشرح لي تدريجيًا بخطوات بسيطة ومثال، ومن غير اختراع مصادر: ','اكتب النقطة اللي مش فاهمها…'],
 analyze:['🔍','حلّل إجابتي','راجع إجابتي: اذكر الصح والخطأ وسبب كل خطأ وإزاي أحسّنها.\n','اكتب السؤال ثم إجابتك…'],
 hint:['✍️','ساعدني في الحل','ساعدني بتلميحات وخطوات متدرجة، ولا تعطني الإجابة النهائية قبل محاولتي: ','اكتب المسألة…'],
 translate:['🌍','ترجملي','ترجم بين العربية والإنجليزية والفرنسية والإسبانية مع شرح المعنى والسياق عند الحاجة: ','اكتب النص واللغة المطلوبة…'],
 discuss:['📚','ناقشني في درس','','اكتب إجابتك على سؤال المساعد، أو اضغط إرسال للبدء…']
};
function lessonContext(){const l=selectedLesson();if(!l)return '';return '\n[سياق من شرح طموح التأسيسي (ليس نص الوزارة): '+(l.subject+' — '+l.title+': '+(l.intro||'')+' '+(l.points||[]).slice(0,3).join('؛ ')).slice(0,320)+']';}
function buildPrompt(text){
 const m=MODES[cbMode]||MODES.ask,les=selectedLesson();
 if(cbMode==='discuss'){
  if(!les)return null;
  return ('ناقشني في درس «'+les.title+'» ('+les.subject+'): اسألني سؤالًا واحدًا فقط وانتظر إجابتي ثم صحّح وناقش. '+(text||'ابدأ.')+lessonContext());
 }
 const ctx=['understand','hint'].includes(cbMode)?lessonContext():'';
 return (m[2]+text+ctx).slice(0,1100);
}
function chatView(){
 if(!d)return '';
 const on=typeof CONFIG!=='undefined'&&!!CONFIG.AI_URL,ch=d.chat||[],les=selectedLesson();
 const tiles=Object.entries(MODES).map(([k,v])=>`<button type="button" class="tm14-card ${cbMode===k?'is-sel':''}" data-tm14="mode" data-m="${k}"><span>${v[0]}</span><b>${v[1]}</b></button>`).join('')+
  `<button type="button" class="tm14-card is-off" aria-disabled="true" data-tm14="off" data-why="رفع صورة السؤال يحتاج Backend يدعم الصور. الخدمة الحالية نصية فقط."><span>📸</span><b>صوّر سؤالك</b><small>غير متاح — يحتاج Backend للصور</small></button>`+
  `<button type="button" class="tm14-card is-off" aria-disabled="true" data-tm14="off" data-why="رفع PDF لخدمة خارجية يحتاج Backend وموافقتك الصريحة. غير متاح حاليًا."><span>📄</span><b>ارفع ملف PDF</b><small>غير متاح — يحتاج Backend</small></button>`;
 const m=MODES[cbMode];
 return `<section class="tm14-cb-head"><div class="tm14-cb-logo">🤖</div><h1>ChatBook</h1><p>مساعدك الذكي في رحلة التعلم</p><small>اسأل، افهم، ناقش، وتعلّم</small></section>
 ${!on?'<div class="warn">المساعد غير مفعّل (CONFIG.AI_URL فارغ).</div>':''}
 <div class="tm14-grid cb">${tiles}</div>
 ${cbMode==='discuss'&&!les?'<div class="warn">اختار درسًا من قسم المذاكرة أولًا علشان نناقشه.</div>':''}
 <section class="card tm14-chat">
  <div class="chat" id="chat">${ch.map(x=>`<div class="bubble ${x.r==='u'?'user':''}">${E(x.t).replace(/\n/g,'<br>')}</div>`).join('')||emptyBox('ابدأ بسؤال','الوضع الحالي: '+m[1])}${typeof busy!=='undefined'&&busy?'<div class="bubble">جاري التفكير…</div>':''}</div>
  <form id="tm14ChatForm" class="tm14-compose"><textarea id="tm14q" rows="2" maxlength="600" ${cbMode==='discuss'?'':'required'} placeholder="${E(m[3]||'اكتب سؤالك هنا…')}" ${on?'':'disabled'}></textarea><button class="primary" ${on&&!(typeof busy!=='undefined'&&busy)?'':'disabled'}>إرسال</button></form>
  <div class="btnrow"><button type="button" class="soft" data-tm14="chatclear">مسح المحادثة</button></div>
  <p class="tiny">إجابات الذكاء الاصطناعي قد تخطئ. لا يوجد حاليًا ربط (RAG) بكتب الوزارة، فالشرح عام وغير موثق بالمنهج الرسمي ${les?'— وبنرسل مع سؤالك ملخصًا قصيرًا من شرح طموح التأسيسي للدرس المختار':''}. راجع كتابك المدرسي. لا ترسل بيانات شخصية.</p>
 </section>`;
}

/* ---------- Rewards hub ---------- */
function rewardView(){
 if(!d)return '';
 const lv=level(),all=typeof badges==='function'?badges():[],on=all.filter(b=>b[2]),parts=xpParts(),hobby=d.hobby||'',ideas=HOBBY_IDEAS[hobby]||[];
 return `<div class="heading"><div><h1>🏆 التحفيز والمكافآت</h1><p>كل إنجاز صغير بيقرّبك من حلمك — من غير منافسة أو ضغط</p></div></div>
 <div class="tm14-stats two">${stat('⭐','نقاطك الحالية',lv.x,'مجمّعة من نشاطك الفعلي')}${stat('🏅','إنجازاتك',on.length,'من '+all.length)}</div>
 <section class="card"><h3>مستواك الحالي: المستوى ${lv.lv}</h3><div class="tm14-meter big"><span style="width:${lv.into}%"></span></div><p class="muted">${lv.into} من 100 نقطة — يتبقى ${100-lv.into} للمستوى ${lv.lv+1}</p></section>
 <section class="card"><h3>🎁 مكافآتي</h3><p class="muted">${hobby?'هوايتك: '+E(hobby):'اختار هوايتك من ملفك الشخصي علشان نقترح أنشطة تناسبها.'}</p>${ideas.length?`<ul class="tm14-list">${ideas.map(i=>`<li>${E(i)}</li>`).join('')}</ul>`:''}<div class="btnrow"><button class="primary" data-tm14="go" data-p="rewards">🎁 صناديق الهدايا والمسابقات</button><button class="soft" data-tm14="go" data-p="settings">تغيير الهواية</button></div><p class="tiny">المكافآت أنشطة وتحديات معرفية فقط — لا مشتريات ولا وعود بمنتجات حقيقية.</p></section>
 <section class="card"><h3>🧾 سجل النقاط المكتسبة</h3>${parts.map(p=>`<p class="row">${E(p[0])}<b style="margin-right:auto">${p[1]}</b></p>`).join('')}<p class="row"><b>الإجمالي</b><b style="margin-right:auto">${lv.x}</b></p><p class="tiny">النقاط تُحسب من سجلاتك مباشرة، فمفيش تكرار. صندوق الهدايا بيفتح عند 100×(عدد الصناديق+1) ولا ينقص نقاطك.</p></section>
 <section class="card"><h3>🏅 الأوسمة</h3><div class="tm14-grid badges">${all.map(b=>`<div class="tm14-badge ${b[2]?'':'locked'}"><span>${b[0]}</span><b>${E(b[1])}</b><small>${b[2]?'تم':'لم يُفتح بعد'}</small></div>`).join('')}</div></section>
 <section class="card"><h3>المزيد</h3><div class="btnrow">${[['league','🏆 دوري Tmoh'],['museum','🖼️ المتحف'],['mascot','🐣 رفيقي'],['achievements','🎖️ كل الإنجازات']].filter(x=>VIEWS[x[0]]).map(x=>`<button class="soft" data-tm14="go" data-p="${x[0]}">${x[1]}</button>`).join('')}</div></section>`;
}

/* ---------- Progress ---------- */
function reportData(){
 const w0=dayRange(WDAYS-1)[0],end=dayRange(0)[1],p0=dayRange(2*WDAYS-1)[0];
 const thisW=minsIn(w0,end),prevW=minsIn(p0,w0),tasks=weekTasks(),done=tasks.filter(t=>t.done),miss=tasks.filter(t=>!t.done);
 const bySub=(a,b)=>{const m={};sessions().filter(s=>s.end>=a&&s.end<b).forEach(s=>{const k=s.subject||'عام';m[k]=(m[k]||0)+(Number(s.ms)||0)/6e4;});return m;};
 const cur=bySub(w0,end),prev=bySub(p0,w0);
 const progressed=Object.keys(cur).filter(k=>cur[k]>(prev[k]||0)).map(k=>k+' (+'+Math.round(cur[k]-(prev[k]||0))+' د)');
 const needs=[];const mi={};(d.mistakes||[]).filter(m=>!m.rev).forEach(m=>{mi[m.subject||'عام']=(mi[m.subject||'عام']||0)+1;});
 Object.entries(mi).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([k,v])=>needs.push(k+': '+v+' أخطاء غير مراجَعة'));
 const sc=(d.exams||[]).filter(e=>e.total&&e.score/e.total<0.6).slice(-3).map(e=>(e.subject||'عام')+': '+Math.round(e.score/e.total*100)+'% في اختبار');
 const lessonsWk=Object.values(d.studyV1?.completed||{}).filter(t=>t>=w0).length;
 const goal=prevW>0||thisW>0?Math.max(60,Math.round(Math.max(thisW,prevW)*1.1/10)*10):Math.max(60,(Number(d.daily)||60)*3);
 return{thisW,prevW,tasks:tasks.length,done:done.length,miss:miss.map(t=>t.title).slice(0,5),missN:miss.length,progressed,needs:needs.concat(sc),lessonsWk,sessionsWk:sessions().filter(s=>s.end>=w0).length,goal};
}
function reportHTML(){
 const r=reportData(),has=r.thisW>0||r.tasks>0||r.lessonsWk>0;
 if(!has)return `<h3>تقريري الأسبوعي 💜</h3>${emptyBox('لسه مفيش بيانات كفاية للتقرير','سجّل جلسة أو مهمة وهيتكوّن تقريرك من سجلاتك الفعلية.')}`;
 const li=a=>a.length?`<ul class="tm14-list">${a.map(x=>`<li>${E(x)}</li>`).join('')}</ul>`:'<p class="muted">—</p>';
 return `<h3>تقريري الأسبوعي 💜</h3>
 <h4>ماذا أنجزت هذا الأسبوع؟</h4>${li(['ذاكرت '+hrs(r.thisW)+' في '+r.sessionsWk+' جلسة','أنجزت '+r.done+' من '+r.tasks+' مهمة','أنهيت '+r.lessonsWk+' درس تأسيسي'])}
 <h4>ما الذي لم أستطع إنجازه؟</h4>${r.missN?li(['مهام لم تكتمل ('+r.missN+'): '+r.miss.join('، ')]):'<p class="muted">كل مهام الأسبوع المسجلة اكتملت (أو لا توجد مهام).</p>'}
 <h4>ما المواد التي تقدمت فيها؟</h4>${r.progressed.length?li(r.progressed):'<p class="muted">لا توجد مادة زاد وقتها عن الأسبوع السابق.</p>'}
 <h4>ما الذي يحتاج إلى تحسين؟</h4>${r.needs.length?li(r.needs):'<p class="muted">لا توجد نقاط ضعف مسجلة.</p>'}
 <h4>الهدف الواقعي المقترح للأسبوع القادم</h4><p><b>${r.goal} دقيقة</b> <small class="muted">(اقتراح محسوب من أعلى أسبوعين، مش التزام)</small></p>`;
}
function progressView(){
 if(!d)return '';
 const t=minsIn(...dayRange(0)),w=minsIn(dayRange(WDAYS-1)[0],dayRange(0)[1]),pw=minsIn(dayRange(2*WDAYS-1)[0],dayRange(WDAYS-1)[0]),mo=minsIn(dayRange(29)[0],dayRange(0)[1]);
 const diff=pw>0?(w>=pw?'أعلى من الأسبوع الماضي بـ '+(w-pw)+' د':'أقل من الأسبوع الماضي بـ '+(pw-w)+' د'):'';
 const by={};sessions().forEach(s=>{const k=s.subject||'عام';by[k]=(by[k]||0)+(Number(s.ms)||0)/6e4;});
 const subs=[...new Set([...(d.subjects||[]),...Object.keys(by)])];
 const rows=subs.map(k=>{const ex=(d.exams||[]).filter(e=>(e.subject||'عام')===k&&e.total),avg=ex.length?Math.round(ex.reduce((a,e)=>a+e.score/e.total,0)/ex.length*100)+'%':'—',unrev=(d.mistakes||[]).filter(m=>(m.subject||'عام')===k&&!m.rev).length,dn=Object.keys(d.studyV1?.completed||{}).filter(id=>{const l=LESSONS().find(x=>x.id===id);return l&&(norm(l.subject)===norm(k));}).length;return `<tr><td>${E(k)}</td><td>${Math.round(by[k]||0)} د</td><td>${dn}</td><td>${avg}</td><td>${unrev}</td></tr>`}).join('');
 const moods=store().moods.slice(-7).reverse();const goals=d.dreamGoals||[];
 return `<div class="heading"><div><h1>🚀 رحلتي وتقدمي</h1><p>كل خطوة بتقربك من حلمك</p></div></div>
 <section class="tm14-stats">${stat('⏱️','ساعات المذاكرة',hrs(mins(0)),'الإجمالي')}${stat('🎧','جلسات',sessions().length,'')}${stat('📘','دروس مكتملة',lessonsDone(),'')}${stat('✅','إنجاز المهام',weekPct(),'آخر 7 أيام')}</section>
 <section class="card"><h3>⏳ اليوم • الأسبوع • الشهر</h3><div class="tm14-stats"><div class="tm14-stat"><strong>${hrs(t)}</strong><span>اليوم</span></div><div class="tm14-stat"><strong>${hrs(w)}</strong><span>آخر 7 أيام</span><small>${E(diff)}</small></div><div class="tm14-stat"><strong>${hrs(mo)}</strong><span>آخر 30 يومًا</span></div></div>${weekBars()}</section>
 <section class="card"><h3>📊 تطوري الدراسي لكل مادة</h3>${rows?`<div class="tm14-scroll"><table class="tm14-table"><thead><tr><th>المادة</th><th>وقت المذاكرة</th><th>دروس مكتملة</th><th>متوسط الامتحانات</th><th>أخطاء غير مراجعة</th></tr></thead><tbody>${rows}</tbody></table></div>`:emptyBox('لا مواد بعد','أضف موادك وابدأ المذاكرة.')}</section>
 <section class="card"><h3>💜 رحلتي النفسية</h3>${moods.length?`<ul class="tm14-list">${moods.map(m=>`<li>${m.e} ${E(m.l)} — ${new Date(m.at).toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'short'})}</li>`).join('')}</ul>`:'<p class="muted">سجّل شعورك من الصفحة الرئيسية.</p>'}<p class="tiny">بنسجل شعورك بعد الجلسة أو من الرئيسية فقط، فمقارنة «قبل وبعد» الجلسة مش متاحة حاليًا. ومفيش تحليل نفسي.</p></section>
 <section class="card tm14-report" id="tm14Report">${reportHTML()}<div class="btnrow no-print"><button class="soft" data-tm14="savereport">💾 احفظ التقرير</button><button class="primary" data-tm14="printreport">🖨️ طباعة / PDF</button></div>${store().reports.length?`<p class="tiny">محفوظ: ${store().reports.length} تقرير على هذا الجهاز.</p>`:''}</section>
 <section class="card"><h3>🌠 رحلتي نحو حلمي</h3><p class="tm14-big">${d.dream?E(d.dream):'لم تحدد حلمك بعد'}</p>${goals.length?goals.map((g,i)=>`<label class="row"><input type="checkbox" data-act="goalDone" data-i="${i}" ${g.done?'checked':''}> ${E(g.title)}</label>`).join(''):'<p class="muted">لسه مفيش أهداف. ضيف أهدافك من صفحة رحلتي.</p>'}<p>${goals.length?goals.filter(g=>g.done).length+' من '+goals.length+' هدف مكتمل':''}</p><div class="btnrow"><button class="soft" data-tm14="go" data-p="journey">إدارة أهدافي</button><button class="soft" data-tm14="go" data-p="analytics">تحليلات أكتر</button></div></section>`;
}

/* ---------- More tools (calculator is a safe parser; no eval) ---------- */
function calcEval(src){
 const s=String(src).replace(/×/g,'*').replace(/÷/g,'/').replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/،/g,'.').replace(/\s+/g,'');
 if(!s||!/^[0-9+\-*/().%]+$/.test(s))throw Error('تعبير غير صالح');
 let i=0;
 const peek=()=>s[i];
 function num(){const m=/^\d*\.?\d+(?:\.)?/.exec(s.slice(i));if(!m)throw Error('تعبير غير صالح');i+=m[0].length;const v=parseFloat(m[0]);if(!Number.isFinite(v))throw Error('رقم غير صالح');return v;}
 function primary(){let v;if(peek()==='('){i++;v=expr();if(peek()!==')')throw Error('قوس ناقص');i++;}else v=num();while(peek()==='%'){i++;v/=100;}return v;}
 function factor(){if(peek()==='-'){i++;return -factor();}if(peek()==='+'){i++;return factor();}return primary();}
 function term(){let v=factor();while(peek()==='*'||peek()==='/'){const o=s[i++],r=factor();if(o==='/'){if(r===0)throw Error('القسمة على صفر');v/=r;}else v*=r;}return v;}
 function expr(){let v=term();while(peek()==='+'||peek()==='-'){const o=s[i++],r=term();v=o==='+'?v+r:v-r;}return v;}
 const out=expr();if(i!==s.length)throw Error('تعبير غير صالح');
 if(!Number.isFinite(out))throw Error('نتيجة غير صالحة');return +out.toFixed(10);
}
let calc={expr:'',res:'',open:false};
function toolsView(){
 if(!d)return '';
 const cards=[['calc','🧮','الآلة الحاسبة','حسابات سريعة',true],['notes','📝','ملاحظاتي','اكتب واحفظ أفكارك',false],['library','📚','مكتبتي','ملفات وروابط محفوظة على جهازك',false],['planner','📅','المخطط والمواعيد','مهام ومواعيد الدراسة',false],['settings','👤','ملفي والإعدادات','بياناتك، النسخ الاحتياطي، اللغة',false],['assistant','🛟','المساعدة والدعم','صندوق مشكلات محفوظ محليًا (مش بيتبعت لأحد)',false]];
 const keys=['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','%','+','(',')','⌫','C'];
 const legacy=PAGES.filter(p=>!OWN.has(p[0]));
 return `<div class="heading"><div><h1>🧰 أدوات أخرى</h1><p>كل الأدوات المساعدة في مكان واحد</p></div></div>
 <div class="tm14-grid tools">${cards.map(c=>`<button type="button" class="tm14-card" data-tm14="${c[4]?'calcopen':'go'}" data-p="${c[0]}"><span>${c[1]}</span><b>${c[2]}</b><small>${c[3]}</small></button>`).join('')}<button type="button" class="tm14-card is-off" aria-disabled="true" data-tm14="off" data-why="القاموس يحتاج مصدرًا أو خدمة ترجمة مرخّصة. غير متاح حاليًا — استخدم «ترجملي» في ChatBook."><span>🌐</span><b>القاموس</b><small>غير متاح — جرّب ChatBook</small></button></div>
 ${calc.open?`<section class="card tm14-calc"><h3>🧮 الآلة الحاسبة</h3><form id="tm14CalcForm"><input id="tm14CalcIn" inputmode="decimal" autocomplete="off" dir="ltr" value="${E(calc.expr)}" aria-label="العملية الحسابية"><button class="primary">=</button></form><p class="tm14-calc-res" role="status" dir="ltr">${E(calc.res)}</p><div class="tm14-keys">${keys.map(k=>`<button type="button" class="soft" data-tm14="key" data-k="${k}">${k}</button>`).join('')}</div></section>`:''}
 <details class="card"><summary>صفحات الأدوات القديمة (كلها شغالة ومحفوظة)</summary><div class="btnrow">${legacy.map(p=>`<button class="soft" data-tm14="go" data-p="${E(p[0])}">${E(p[1])}</button>`).join('')}</div></details>`;
}

/* ---------- registration ---------- */
VIEWS.home=homeView;VIEWS.study=studyView;VIEWS.chatbook=chatView;VIEWS.rewardhub=rewardView;VIEWS.progress=progressView;VIEWS.moretools=toolsView;
const TITLES=Object.fromEntries(SECTIONS.map(s=>[s[0],s[2]]));

function buildNav(){
 const nav=document.getElementById('nav');if(!nav||!d)return;
 nav.innerHTML=SECTIONS.map(s=>`<button type="button" class="tm14-nav" data-tm14="nav" data-p="${s[0]}"><span>${s[1]}</span> ${s[2]}</button>`).join('');
 markNav();
}
function markNav(){
 const cur=OWN.has(page)?page:(SECTION_OF[page]||'');
 document.querySelectorAll('#nav [data-tm14="nav"]').forEach(b=>{b.classList.toggle('active',b.dataset.p===cur);b.setAttribute('aria-current',b.dataset.p===cur?'page':'false');});
 const legacy=PAGES.find(x=>x[0]===page);
 const t=TITLES[page]||(legacy?String(legacy[1]).replace(/^\S+\s/,''):null);
 if(t)document.title='طُمُوح | '+t;
}
if(typeof enter==='function'){const o0=window.enter;window.enter=function(){const r=o0.apply(this,arguments);try{buildNav();}catch(e){}return r;};}
if(typeof render==='function'){const o1=window.render;window.render=function(){const r=o1.apply(this,arguments);try{markNav();}catch(e){}return r;};}

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-tm14]');if(!b||!d)return;
 const a=b.dataset.tm14,s=store();
 if(a==='nav'||a==='go'){go(b.dataset.p);return;}
 if(a==='off'){msg(b.dataset.why||'غير متاح حاليًا');return;}
 if(a==='subject'){s.sel={subject:b.dataset.s,lessonId:''};syncTools(b.dataset.s,null);save();render('study');return;}
 if(a==='changesubject'){s.sel={subject:'',lessonId:''};save();render('study');return;}
 if(a==='lesson'){const l=b.dataset.id?LESSONS().find(x=>x.id===b.dataset.id):null;s.sel.lessonId=l?l.id:'';syncTools(s.sel.subject,l);save();render('study');return;}
 if(a==='tool'){if(b.getAttribute('aria-disabled')==='true'){msg('الأداة دي محتاجة درس تأسيسي موثق، وده مش متاح لهذه المادة لسه.');return;}openTool(b.dataset.t);return;}
 if(a==='quickstart'||a==='starttask'){const sub=b.dataset.subject||'';setTimerCtx(sub,sub===(d.timer?.subject||'')?(d.timer?.lesson||''):'');go('focus');return;}
 if(a==='resume'){setTimerCtx(b.dataset.subject||'',b.dataset.lesson||'');go('focus');return;}
 if(a==='mood'){s.moods.push({e:b.dataset.e,l:b.dataset.l,at:Date.now(),date:iso()});if(s.moods.length>200)s.moods.shift();save();render(page);msg('اتسجّل شعورك 💜');return;}
 if(a==='mode'){cbMode=b.dataset.m;render('chatbook');return;}
 if(a==='chatclear'){if(confirm('مسح سجل المحادثة؟')){d.chat=[];save();render('chatbook');}return;}
 if(a==='savereport'){const r=reportData();s.reports.push({at:Date.now(),data:r});if(s.reports.length>12)s.reports.shift();save();render('progress');msg('اتحفظ التقرير على الجهاز ✅');return;}
 if(a==='printreport'){window.print();return;}
 if(a==='calcopen'){calc.open=!calc.open;render('moretools');return;}
 if(a==='key'){const k=b.dataset.k;if(k==='C'){calc.expr='';calc.res='';}else if(k==='⌫')calc.expr=calc.expr.slice(0,-1);else calc.expr=(calc.expr+k).slice(0,120);render('moretools');return;}
});
document.addEventListener('input',e=>{if(e.target&&e.target.id==='tm14CalcIn')calc.expr=e.target.value.slice(0,120);});
document.addEventListener('submit',e=>{
 const f=e.target;if(!f||!d)return;
 if(f.id==='tm14CalcForm'){e.preventDefault();try{calc.res='= '+calcEval(calc.expr);}catch(err){calc.res=String(err.message||'خطأ');}render('moretools');return;}
 if(f.id==='tm14ChatForm'){
  e.preventDefault();
  if(typeof ask!=='function')return;if(typeof busy!=='undefined'&&busy)return msg('استنى الرد الحالي');
  const text=(document.getElementById('tm14q')?.value||'').trim();
  if(cbMode!=='discuss'&&text.length<2)return msg('اكتب سؤالك الأول');
  const p=buildPrompt(text);if(!p)return msg('اختار درسًا من قسم المذاكرة الأول');
  ask(p);
 }
});
window.TMOH_V14=Object.freeze({calcEval,reportData});

if(d){try{buildNav();if(typeof route==='function')route();}catch(e){}}
})();
