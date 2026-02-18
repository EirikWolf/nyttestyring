export const INIT_GOALS=[
  {id:"G-01",title:"Øke digitaliseringsgrad til 80%",type:"Hovedmål",parent:null,metric:"Digitaliseringsgrad (%)",baseline:"52",target:"80",current:"58",deadline:"2026-12-31",kpiStatus:"on-track"},
  {id:"G-02",title:"Redusere manuelt arbeid med 30%",type:"Delmål",parent:"G-01",metric:"Manuelle timer/uke",baseline:"120",target:"84",current:"105",deadline:"2026-09-30",kpiStatus:"at-risk"},
  {id:"G-03",title:"Forbedre pasientsikkerhet gjennom IKT",type:"Hovedmål",parent:null,metric:"IKT-relaterte avvik",baseline:"12",target:"4",current:"9",deadline:"2026-12-31",kpiStatus:"on-track"},
  {id:"G-04",title:"Styrke informasjonssikkerhet",type:"Delmål",parent:"G-03",metric:"Sikkerhetshendelser/kvartal",baseline:"8",target:"2",current:"5",deadline:"2026-06-30",kpiStatus:"on-track"},
  {id:"G-05",title:"Redusere ventetider gjennom digitalisering",type:"Delmål",parent:"G-03",metric:"Gj.snittlig ventetid (min)",baseline:"45",target:"20",current:"38",deadline:"2026-12-31",kpiStatus:"at-risk"},
  {id:"G-06",title:"Effektivisere administrative prosesser",type:"Hovedmål",parent:null,metric:"Adm. kostnader (MNOK)",baseline:"14.2",target:"10.5",current:"13.1",deadline:"2026-12-31",kpiStatus:"on-track"},
  {id:"G-07",title:"Øke medarbeidertilfredshet med IKT-verktøy",type:"Delmål",parent:"G-06",metric:"Tilfredshet (1-10)",baseline:"5.8",target:"8.0",current:"6.2",deadline:"2026-12-31",kpiStatus:"on-track"},
];

export const INIT_TASKS=[
  {id:"T-001",title:"Automatisere fakturautsending",desc:"Robotisere manuell fakturaprosess i økonomiavd.",tracks:["rpa"],value:5,urgency:4,risk:3,feasibility:4,deps:5,effort:4,size:8,status:"ready",sprintId:"S-27",submitterName:"Kari Haugen",submitterDept:"Økonomiavd.",processOwner:"Økonomisjef Trond Lie",date:"2026-01-20",reviewed:true,priority:"high",goals:["G-02","G-06"],eqsRef:"EQS-2024-0142 Fakturahåndtering",personalData:"no",parentId:null,rpa_volume:5,rpa_rule:5,rpa_digital:4,rpa_stability:4,rpa_roi:5,comments:[{author:"Utviklingsforum",text:"Høy ROI – prioriteres i S-27.",time:"2026-01-22 09:15"}],history:[{who:"System",what:"Opprettet",time:"2026-01-20 08:00"},{who:"Utviklingsforum",what:"Status → Klar for sprint",time:"2026-01-22 09:15"}],attachments:[]},
  {id:"T-001-A",title:"Kartlegge fakturaprosess (AS-IS)",desc:"Dokumentere nåværende manuell flyt.",tracks:["rpa"],value:5,urgency:4,risk:2,feasibility:5,deps:5,effort:5,size:3,status:"done",sprintId:"S-27",submitterName:"Kari Haugen",submitterDept:"Økonomiavd.",processOwner:"Økonomisjef Trond Lie",date:"2026-01-21",reviewed:true,priority:"high",goals:["G-02"],parentId:"T-001",personalData:"no",comments:[],history:[],attachments:[]},
  {id:"T-001-B",title:"Utvikle RPA-bot for faktura",desc:"Bygge UiPath-bot for automatisk fakturabehandling.",tracks:["rpa"],value:5,urgency:4,risk:3,feasibility:4,deps:4,effort:3,size:5,status:"in-progress",sprintId:"S-27",submitterName:"Kari Haugen",submitterDept:"Økonomiavd.",processOwner:"Økonomisjef Trond Lie",date:"2026-01-22",reviewed:true,priority:"high",goals:["G-02"],parentId:"T-001",personalData:"no",rpa_volume:5,rpa_rule:5,rpa_digital:4,rpa_stability:4,rpa_roi:5,comments:[],history:[],attachments:[]},
  {id:"T-001-C",title:"Test og pilot faktura-bot",desc:"UAT med økonomiavdelingen, pilotperiode 2 uker.",tracks:["rpa"],value:5,urgency:3,risk:3,feasibility:4,deps:4,effort:4,size:3,status:"ready",sprintId:"S-28",submitterName:"Kari Haugen",submitterDept:"Økonomiavd.",processOwner:"Økonomisjef Trond Lie",date:"2026-01-22",reviewed:true,priority:"high",goals:["G-02"],parentId:"T-001",personalData:"no",comments:[{author:"Leveranseteam",text:"Planlagt Sprint 28.",time:"2026-02-05 10:00"}],history:[],attachments:[]},
  {id:"T-002",title:"Bygge kundedashboard",desc:"Samlet oversikt over henvendelser.",tracks:["sysdev"],value:5,urgency:2,risk:2,feasibility:5,deps:4,effort:2,size:13,status:"ready",sprintId:"S-27",submitterName:"Per Olsen",submitterDept:"Kundeservice",processOwner:"Leder kundeservice",date:"2026-01-22",reviewed:true,priority:"high",goals:["G-01"],parentId:null,rice_reach:4,rice_impact:5,rice_confidence:4,rice_effort:2,comments:[],history:[],attachments:[]},
  {id:"T-002-A",title:"Design UI/UX for dashboard",desc:"Wireframes og prototyp i Figma.",tracks:["sysdev"],value:5,urgency:2,risk:1,feasibility:5,deps:5,effort:4,size:5,status:"ready",sprintId:"S-27",submitterName:"Per Olsen",submitterDept:"Kundeservice",processOwner:"Leder kundeservice",date:"2026-01-23",reviewed:true,priority:"high",goals:["G-01"],parentId:"T-002",comments:[],history:[],attachments:[]},
  {id:"T-002-B",title:"Implementere backend API for dashboard",desc:"REST-endepunkter for henvendelsesdata.",tracks:["sysdev"],value:5,urgency:2,risk:2,feasibility:4,deps:3,effort:2,size:8,status:"ready",sprintId:"S-28",submitterName:"Per Olsen",submitterDept:"Kundeservice",processOwner:"Leder kundeservice",date:"2026-01-23",reviewed:true,priority:"high",goals:["G-01"],parentId:"T-002",rice_reach:4,rice_impact:5,rice_confidence:4,rice_effort:2,comments:[{author:"Leveranseteam",text:"Sprint 28 – avhenger av T-002-A.",time:"2026-02-03 11:00"}],history:[],attachments:[]},
  {id:"T-003",title:"Oppgradere CRM-integrasjon",desc:"Ny REST-API versjon.",tracks:["integration"],value:4,urgency:3,risk:2,feasibility:3,deps:3,effort:3,size:8,status:"in-progress",sprintId:"S-27",submitterName:"Erik Holm",submitterDept:"IT-drift",processOwner:"CRM-forvalter",date:"2026-01-18",parentId:null,reviewed:true,priority:"medium",goals:["G-01"],cod_business:4,cod_time:3,cod_opportunity:2,cod_downstream:4,comments:[],history:[],attachments:[]},
  {id:"T-004",title:"Migrere legacy-API",desc:"Flytte SOAP til REST – blokkerer flere initiativ.",tracks:["integration","sysdev"],value:3,urgency:5,risk:4,feasibility:2,deps:2,effort:1,size:21,status:"blocked",sprintId:null,submitterName:"Lise Berg",submitterDept:"Arkitektur",processOwner:"Sjefsarkitekt",date:"2026-01-15",parentId:null,reviewed:true,priority:"high",goals:["G-01","G-04"],cod_business:5,cod_time:5,cod_opportunity:3,cod_downstream:5,rice_reach:3,rice_impact:3,rice_confidence:3,rice_effort:2,comments:[{author:"Utviklingsforum",text:"Blokkert av leverandør – følges opp.",time:"2026-02-01 14:00"}],history:[],attachments:[]},
  {id:"T-005",title:"SSO-pålogging alle systemer",desc:"Azure AD SSO for interne systemer.",tracks:["sysdev"],value:4,urgency:3,risk:3,feasibility:4,deps:4,effort:3,size:5,status:"ready",sprintId:"S-27",submitterName:"Jonas Ribe",submitterDept:"Sikkerhet",processOwner:"CISO",date:"2026-01-25",parentId:null,reviewed:true,priority:"medium",goals:["G-04"],eqsRef:"EQS-2023-0088 Tilgangsstyring",personalData:"yes",rice_reach:5,rice_impact:4,rice_confidence:5,rice_effort:3,comments:[],history:[],attachments:[]},
  {id:"T-006",title:"Redesigne onboarding-flyt",desc:"Power Apps onboarding for nye ansatte.",tracks:["lowcode"],value:5,urgency:2,risk:1,feasibility:5,deps:5,effort:4,size:8,status:"assessed",sprintId:null,submitterName:"Sofie Aasen",submitterDept:"HR",processOwner:"HR-leder",date:"2026-02-01",parentId:null,reviewed:true,priority:"medium",goals:["G-07"],ice_impact:5,ice_confidence:4,ice_ease:4,comments:[],history:[],attachments:[]},
  {id:"T-007",title:"Lisenshåndteringsverktøy",desc:"Erstatte Excel med hyllevare-løsning.",tracks:["cots"],value:4,urgency:3,risk:2,feasibility:5,deps:5,effort:4,size:3,status:"assessed",sprintId:null,submitterName:"Ida Berg",submitterDept:"Innkjøp",processOwner:"IT innkjøpsansvarlig",date:"2026-02-03",parentId:null,reviewed:true,priority:"medium",goals:["G-06"],cots_fit:4,cots_tco:4,cots_vendor:5,cots_integration:3,cots_security:4,comments:[],history:[],attachments:[]},
  {id:"T-008",title:"Power App avviksmeldinger",desc:"Erstatte papirskjema for avviksrapportering.",tracks:[],value:4,urgency:3,risk:2,feasibility:5,deps:5,effort:5,size:0,status:"submitted",sprintId:null,submitterName:"Ona Nilsen",submitterDept:"Kvalitet",processOwner:"Kvalitetssjef",date:"2026-02-07",parentId:null,reviewed:false,priority:"medium",goals:["G-06"],comments:[],history:[],attachments:[]},
  {id:"T-009",title:"Bedre venteromsinfo",desc:"Digital informasjonstavle for pasienter.",tracks:[],value:3,urgency:2,risk:1,feasibility:3,deps:3,effort:3,size:0,status:"submitted",sprintId:null,submitterName:"Anna Sæther",submitterDept:"Poliklinikk",processOwner:"Avd.leder poliklinikk",date:"2026-02-10",parentId:null,reviewed:false,priority:"low",goals:["G-05"],comments:[],history:[],attachments:[]},
  {id:"T-010",title:"E-signeringsløsning",desc:"Digital signering for kontrakter og samtykker.",tracks:[],value:5,urgency:4,risk:3,feasibility:4,deps:4,effort:4,size:0,status:"submitted",sprintId:null,submitterName:"Toril Strand",submitterDept:"Jus",processOwner:"Juridisk rådgiver",date:"2026-02-12",parentId:null,reviewed:false,priority:"high",goals:["G-06"],comments:[],history:[],attachments:[]},
];

export const INIT_CONFIG={defaultSprintWeeks:2,notifyEmails:["utviklingsforum@hemit.no","leder@hemit.no"],emailNotifications:true,emailOnStatusChange:true,emailOnReview:true,notifyProcessOwner:true,scoringWeights:{wsjf:60,trackSpecific:40},dpiaLink:"https://eqs.hemit.no/doc/DPIA-mal-2024",dpiaEqsRef:"EQS-2024-0200 DPIA-prosedyre",
  auth:{enabled:false,provider:"azure-ad",tenantId:"",clientId:"",allowedDomains:["hemit.no","helse-midt.no","helseplattformen.no"],requireMfa:false,sessionTimeout:480,
    roleMappings:[
      {id:"rm1",groupId:"",groupName:"IT Utviklingsforum",role:"forum"},
      {id:"rm2",groupId:"",groupName:"Leveranseteam",role:"team"},
      {id:"rm3",groupId:"",groupName:"IT Administrasjon",role:"admin"},
    ],
    defaultRole:"employee",autoProvision:true,
  },
  azureDevOps:{enabled:false,orgUrl:"",pat:"",defaultProject:"",syncWorkItems:true,syncOnStatusChange:true,
    fieldMapping:{title:"System.Title",description:"System.Description",priority:"Microsoft.VSTS.Common.Priority",status:"System.State"},
    workItemType:"User Story",areaPath:"",iterationPath:"",
    statusMapping:[
      {id:"sm1",appStatus:"ready",devOpsState:"New"},
      {id:"sm2",appStatus:"in-progress",devOpsState:"Active"},
      {id:"sm3",appStatus:"done",devOpsState:"Closed"},
    ],
  },
  serviceNow:{enabled:false,instanceUrl:"",authMethod:"basic",username:"",password:"",clientId:"",clientSecret:"",
    syncIncidents:true,syncChangeRequests:false,syncOnStatusChange:true,
    table:"incident",assignmentGroup:"",category:"Software",
    fieldMapping:{shortDescription:"title",description:"description",priority:"priority",state:"status"},
    statusMapping:[
      {id:"sn1",appStatus:"submitted",snowState:"New"},
      {id:"sn2",appStatus:"in-progress",snowState:"In Progress"},
      {id:"sn3",appStatus:"done",snowState:"Resolved"},
    ],
  },
  trackSubtasks:{
    rpa:[{title:"Kartlegge prosess (AS-IS)",size:3},{title:"Utvikle RPA-bot",size:5},{title:"Test og pilot",size:3}],
    integration:[{title:"Kartlegge integrasjonspunkter",size:3},{title:"Utvikle integrasjon",size:5},{title:"Test og verifisering",size:3}],
    sysdev:[{title:"Kravspesifikasjon",size:3},{title:"Design og arkitektur",size:3},{title:"Utvikling",size:8},{title:"Test og QA",size:3}],
    lowcode:[{title:"Prototyping",size:2},{title:"Konfigurasjon og bygging",size:5},{title:"Brukertesting",size:2}],
    cots:[{title:"Behovsanalyse",size:3},{title:"Leverandørvurdering",size:3},{title:"Implementering og tilpasning",size:5},{title:"Akseptansetest",size:3}],
  },
};

export const INIT_TEAM=[
  {id:"m1",name:"Lars Kristiansen",role:"Backend",availability:100,skills:["Backend","DevOps"],track:"sysdev"},
  {id:"m2",name:"Marte Solberg",role:"Frontend",availability:80,skills:["Frontend","UX"],track:"sysdev"},
  {id:"m3",name:"Erik Nordli",role:"Fullstack",availability:60,skills:["Frontend","Backend"],track:"sysdev"},
  {id:"m4",name:"Sofie Aasen",role:"UX/UI",availability:50,skills:["UX"],track:"lowcode"},
  {id:"m5",name:"Jonas Ribe",role:"QA",availability:100,skills:["QA"],track:"sysdev"},
  {id:"m6",name:"Ida Berg",role:"RPA-utvikler",availability:70,skills:["RPA"],track:"rpa"},
];

export const INIT_SPRINTS=[
  {id:"S-21",name:"Sprint 21",start:"2025-09-15",end:"2025-09-26",weeks:2,status:"completed",planned:34,delivered:29},
  {id:"S-22",name:"Sprint 22",start:"2025-09-29",end:"2025-10-10",weeks:2,status:"completed",planned:38,delivered:35},
  {id:"S-23",name:"Sprint 23",start:"2025-10-13",end:"2025-10-24",weeks:2,status:"completed",planned:40,delivered:38},
  {id:"S-24",name:"Sprint 24",start:"2025-10-27",end:"2025-11-07",weeks:2,status:"completed",planned:36,delivered:36},
  {id:"S-25",name:"Sprint 25",start:"2025-11-10",end:"2025-11-21",weeks:2,status:"completed",planned:42,delivered:39},
  {id:"S-26",name:"Sprint 26",start:"2025-11-24",end:"2025-12-05",weeks:2,status:"completed",planned:38,delivered:37},
  {id:"S-27",name:"Sprint 27",start:"2026-02-03",end:"2026-02-14",weeks:2,status:"active",planned:0,delivered:0},
  {id:"S-28",name:"Sprint 28",start:"2026-02-17",end:"2026-02-28",weeks:2,status:"planned",planned:0,delivered:0},
];
