/* ==========================================================
   IMPERIAL COUNTY DA · DASHBOARDS · script.js
   Five interactive charts, max-600px height, mobile-friendly
   ========================================================== */

/* ---------- helpers ---------- */
const $     = q => document.querySelector(q);
const months= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const rand  = (min,max)=>Math.floor(Math.random()*(max-min+1)+min);

/* stamp footer year */
$('#yearNow').textContent = new Date().getFullYear();

/* color palette for charts */
const palette = {
  blue:'#6992ff',
  blueFill:'rgba(105,146,255,.7)',
  orange:'#ff9f40',
  orangeFill:'rgba(255,159,64,.7)',
  teal:'#4bc0c0',
  pink:'#ff6384',
  yellow:'#ffce54',
  purple:'#9966ff',
  grey:'#9599a8'
};

/* ────────────────── 1 · Arrests & Prosecutions (stacked bar) ────────────────── */
const arrests = { violent:{}, non:{} };
for(let y=2011;y<=2025;y++){
  arrests.violent[y] = {
    arrests: months.map(()=>rand(70,160)),
    prosec : months.map(()=>rand(30,90))
  };
  arrests.non[y] = {
    arrests: months.map(()=>rand(40,100)),
    prosec : months.map(()=>rand(15,60))
  };
}

const arrestsChart = new Chart($('#arrestsChart'),{
  type:'bar',
  data:{
    labels:months,
    datasets:[
      {label:'Arrests',      data:arrests.violent[2025].arrests, backgroundColor:palette.blueFill ,borderColor:palette.blue ,stack:'s'},
      {label:'Prosecutions', data:arrests.violent[2025].prosec , backgroundColor:palette.orangeFill,borderColor:palette.orange,stack:'s'}
    ]
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    scales:{y:{beginAtZero:true,stacked:true,grid:{color:'#26294a'}},
            x:{stacked:true,grid:{display:false}}},
    plugins:{title:{display:true,text:'Violent – 2025',color:'#fff',font:{size:18}},
             legend:{labels:{color:'#fff'}}}
  }
});

function updateArrests(){
  const y   = +$('#arrestsYear').value;
  const key = $('#arrestsType').value==='Violent'?'violent':'non';
  arrestsChart.data.datasets[0].data = arrests[key][y].arrests;
  arrestsChart.data.datasets[1].data = arrests[key][y].prosec;
  arrestsChart.options.plugins.title.text = `${$('#arrestsType').value} – ${y}`;
  arrestsChart.update();
  $('#arrestsYearOut').textContent = y;
}
$('#arrestsYear').oninput  = updateArrests;
$('#arrestsType').onchange = updateArrests;

/* ────────────────── 2 · DA Actions (two pies) ────────────────── */
const severity = {}, outcomes = {};
for(let y=2011;y<=2025;y++){
  const mis=rand(200,350), fel=rand(100,250);
  severity[y] = [mis,fel];

  const total       = mis+fel;
  const convicted   = rand(total*0.6,total*0.8);
  const nocontest   = rand(total*0.1,total*0.2);
  const dropped     = rand(total*0.03,total*0.07);
  const acquitted   = total - convicted - nocontest - dropped;
  outcomes[y]       = [convicted,nocontest,dropped,acquitted];
}

const pieBase = t=>({plugins:{title:{display:true,text:t,color:'#fff',font:{size:18}},
                              legend:{labels:{color:'#fff'}}}});

const sevPie = new Chart($('#severityPie'),{
  type:'pie',
  data:{labels:['Misdemeanor','Felony'],
        datasets:[{data:severity[2025],backgroundColor:[palette.teal,palette.pink]}]},
  options:pieBase('Severity – 2025')
});

const outPie = new Chart($('#outcomePie'),{
  type:'pie',
  data:{labels:['Convicted','No Contest','Dropped','Acquitted'],
        datasets:[{data:outcomes[2025],
                   backgroundColor:[palette.blue,palette.yellow,palette.grey,palette.purple]}]},
  options:pieBase('Outcomes – 2025')
});

$('#actionsYear').oninput = e=>{
  const y = +e.target.value;
  sevPie.data.datasets[0].data           = severity[y];
  outPie.data.datasets[0].data           = outcomes[y];
  sevPie.options.plugins.title.text      = `Severity – ${y}`;
  outPie.options.plugins.title.text      = `Outcomes – ${y}`;
  sevPie.update(); outPie.update();
  $('#actionsYearOut').textContent = y;
};

/* ────────────────── 3 · Victim Services (line) ────────────────── */
const services = ['Compensation','Court Escorts','Crisis Counseling'];
const victim   = {};
for(let y=2011;y<=2025;y++)
  victim[y] = services.map(()=>months.map(()=>rand(20,70)));

let victimChart;
function buildVictim(kind,y){
  return new Chart($('#victimLine'),{
    type:'line',
    data:{labels:months,
          datasets:[{label:services[kind],
                     data:victim[y][kind],
                     borderColor:palette.yellow,
                     backgroundColor:'rgba(255,206,86,.35)',
                     fill:true,tension:.3}]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{title:{display:true,text:`${services[kind]} – ${y}`,color:'#fff',font:{size:18}},
               legend:{labels:{color:'#fff'}}},
      scales:{y:{beginAtZero:true,grid:{color:'#26294a'}},
              x:{grid:{display:false}}}
    }
  });
}
function updateVictim(){
  const y   = +$('#victimYear').value;
  const idx = $('#victimType').selectedIndex;
  victimChart?.destroy();
  victimChart = buildVictim(idx,y);
  $('#victimYearOut').textContent = y;
}
updateVictim();
$('#victimYear').oninput  = updateVictim;
$('#victimType').onchange = updateVictim;

/* ────────────────── 4 · Special Crimes (grouped bar) ────────────────── */
const special = {};
for(let y=2011;y<=2025;y++){
  special[y] = {Fraud:rand(40,120),'Elder Abuse':rand(20,70),'Public Integrity':rand(10,50)};
}
let specialChart;
function buildSpecial(y){
  return new Chart($('#specialBar'),{
    type:'bar',
    data:{labels:Object.keys(special[y]),
          datasets:[{data:Object.values(special[y]),
                     backgroundColor:[palette.purple,palette.orangeFill,palette.teal]}]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{title:{display:true,text:`Special Crimes – ${y}`,color:'#fff',font:{size:18}},
               legend:{display:false}},
      scales:{y:{beginAtZero:true,grid:{color:'#26294a'}},
              x:{grid:{display:false}}}
    }
  });
}
function updateSpecial(){
  const y = +$('#specialYear').value;
  specialChart?.destroy();
  specialChart = buildSpecial(y);
  $('#specialYearOut').textContent = y;
}
updateSpecial();
$('#specialYear').oninput = updateSpecial;

/* ────────────────── 5 · Narcotics (stacked bar) ────────────────── */
const schedules = ['I','II','III','IV'];
const narc      = {};
for(let y=2011;y<=2025;y++){
  narc[y] = {};
  schedules.forEach(s=> narc[y][s] = months.map(()=>rand(15,80)));
}
const scheduleColors = [palette.pink,palette.blue,palette.yellow,palette.purple];

const narcChart = new Chart($('#narcoticsStack'),{
  type:'bar',
  data:{
    labels:months,
    datasets:schedules.map((s,i)=>({
      label:`Schedule ${s}`,
      backgroundColor:scheduleColors[i],
      data:narc[2025][s],
      stack:'all'
    }))
  },
  options:{
    responsive:true,maintainAspectRatio:false,
    scales:{y:{beginAtZero:true,stacked:true,grid:{color:'#26294a'}},
            x:{stacked:true,grid:{display:false}}},
    plugins:{title:{display:true,text:'Narcotics by Schedule – 2025',color:'#fff',font:{size:18}},
             legend:{labels:{color:'#fff'}}}
  }
});

$('#narcYear').oninput = e=>{
  const y = +e.target.value;
  narcChart.data.datasets.forEach((ds,i)=> ds.data = narc[y][schedules[i]]);
  narcChart.options.plugins.title.text = `Narcotics by Schedule – ${y}`;
  narcChart.update();
  $('#narcYearOut').textContent = y;
};
