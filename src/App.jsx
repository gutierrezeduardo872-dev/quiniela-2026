import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "bomberquiniela24";

const STORAGE_KEY_PLAYERS     = "quiniela_players";
const STORAGE_KEY_PREDICTIONS = "quiniela_predictions";
const STORAGE_KEY_RESULTS     = "quiniela_results";
const STORAGE_KEY_BONUS       = "quiniela_bonus";
const STORAGE_KEY_KO          = "quiniela_ko_picks";
const STORAGE_KEY_LOGS        = "quiniela_logs";

// Full match data: id, group, home, away, date (display), city, utcTime (ISO), phase
const GROUP_MATCHES = [
  // ── GROUP A: Mexico, South Africa, South Korea, Czechia ──
  { id:"A1", group:"A", home:"Mexico",       away:"South Africa", date:"Jun 11", city:"Mexico City", utcTime:"2026-06-11T19:00:00Z", phase:"group" },
  { id:"A2", group:"A", home:"South Korea",  away:"Czechia",      date:"Jun 11", city:"Guadalajara", utcTime:"2026-06-12T02:00:00Z", phase:"group" },
  { id:"A3", group:"A", home:"Mexico",       away:"South Korea",  date:"Jun 18", city:"Guadalajara", utcTime:"2026-06-19T01:00:00Z", phase:"group" },
  { id:"A4", group:"A", home:"Czechia",      away:"South Africa", date:"Jun 18", city:"Atlanta",     utcTime:"2026-06-18T16:00:00Z", phase:"group" },
  { id:"A5", group:"A", home:"South Africa", away:"South Korea",  date:"Jun 24", city:"Monterrey",   utcTime:"2026-06-25T01:00:00Z", phase:"group" },
  { id:"A6", group:"A", home:"Czechia",      away:"Mexico",       date:"Jun 24", city:"Mexico City", utcTime:"2026-06-25T01:00:00Z", phase:"group" },
  // ── GROUP B: Canada, Bosnia & Herz., Qatar, Switzerland ──
  { id:"B1", group:"B", home:"Canada",         away:"Bosnia & Herz.", date:"Jun 12", city:"Toronto",       utcTime:"2026-06-12T19:00:00Z", phase:"group" },
  { id:"B2", group:"B", home:"Qatar",          away:"Switzerland",    date:"Jun 13", city:"San Francisco", utcTime:"2026-06-13T19:00:00Z", phase:"group" },
  { id:"B3", group:"B", home:"Canada",         away:"Qatar",          date:"Jun 18", city:"Vancouver",     utcTime:"2026-06-18T22:00:00Z", phase:"group" },
  { id:"B4", group:"B", home:"Switzerland",    away:"Bosnia & Herz.", date:"Jun 18", city:"Los Angeles",   utcTime:"2026-06-18T19:00:00Z", phase:"group" },
  { id:"B5", group:"B", home:"Switzerland",    away:"Canada",         date:"Jun 24", city:"Vancouver",     utcTime:"2026-06-24T19:00:00Z", phase:"group" },
  { id:"B6", group:"B", home:"Bosnia & Herz.", away:"Qatar",          date:"Jun 24", city:"Seattle",       utcTime:"2026-06-24T19:00:00Z", phase:"group" },
  // ── GROUP C: Brazil, Morocco, Haiti, Scotland ──
  { id:"C1", group:"C", home:"Brazil",   away:"Morocco", date:"Jun 13", city:"New York",     utcTime:"2026-06-13T22:00:00Z", phase:"group" },
  { id:"C2", group:"C", home:"Haiti",    away:"Scotland", date:"Jun 13", city:"Boston",       utcTime:"2026-06-14T01:00:00Z", phase:"group" },
  { id:"C3", group:"C", home:"Brazil",   away:"Haiti",    date:"Jun 19", city:"Philadelphia", utcTime:"2026-06-20T00:30:00Z", phase:"group" },
  { id:"C4", group:"C", home:"Scotland", away:"Morocco",  date:"Jun 19", city:"Boston",       utcTime:"2026-06-19T22:00:00Z", phase:"group" },
  { id:"C5", group:"C", home:"Scotland", away:"Brazil",   date:"Jun 24", city:"Miami",        utcTime:"2026-06-24T22:00:00Z", phase:"group" },
  { id:"C6", group:"C", home:"Morocco",  away:"Haiti",    date:"Jun 24", city:"Atlanta",      utcTime:"2026-06-24T22:00:00Z", phase:"group" },
  // ── GROUP D: USA, Paraguay, Australia, Türkiye ──
  { id:"D1", group:"D", home:"USA",       away:"Paraguay",  date:"Jun 12", city:"Los Angeles",   utcTime:"2026-06-13T01:00:00Z", phase:"group" },
  { id:"D2", group:"D", home:"Australia", away:"Türkiye",   date:"Jun 14", city:"Vancouver",     utcTime:"2026-06-14T04:00:00Z", phase:"group" },
  { id:"D3", group:"D", home:"USA",       away:"Australia", date:"Jun 19", city:"Seattle",       utcTime:"2026-06-19T19:00:00Z", phase:"group" },
  { id:"D4", group:"D", home:"Türkiye",   away:"Paraguay",  date:"Jun 19", city:"San Francisco", utcTime:"2026-06-20T03:00:00Z", phase:"group" },
  { id:"D5", group:"D", home:"Türkiye",   away:"USA",       date:"Jun 25", city:"Los Angeles",   utcTime:"2026-06-26T02:00:00Z", phase:"group" },
  { id:"D6", group:"D", home:"Paraguay",  away:"Australia", date:"Jun 25", city:"San Francisco", utcTime:"2026-06-26T02:00:00Z", phase:"group" },
  // ── GROUP E: Germany, Curaçao, Ivory Coast, Ecuador ──
  { id:"E1", group:"E", home:"Germany",     away:"Curaçao",     date:"Jun 14", city:"Houston",     utcTime:"2026-06-14T17:00:00Z", phase:"group" },
  { id:"E2", group:"E", home:"Ivory Coast", away:"Ecuador",     date:"Jun 14", city:"Philadelphia",utcTime:"2026-06-14T23:00:00Z", phase:"group" },
  { id:"E3", group:"E", home:"Germany",     away:"Ivory Coast", date:"Jun 20", city:"Toronto",     utcTime:"2026-06-20T20:00:00Z", phase:"group" },
  { id:"E4", group:"E", home:"Ecuador",     away:"Curaçao",     date:"Jun 20", city:"Kansas City", utcTime:"2026-06-21T00:00:00Z", phase:"group" },
  { id:"E5", group:"E", home:"Ecuador",     away:"Germany",     date:"Jun 25", city:"New York",    utcTime:"2026-06-25T20:00:00Z", phase:"group" },
  { id:"E6", group:"E", home:"Curaçao",     away:"Ivory Coast", date:"Jun 25", city:"Philadelphia",utcTime:"2026-06-25T20:00:00Z", phase:"group" },
  // ── GROUP F: Netherlands, Japan, Sweden, Tunisia ──
  { id:"F1", group:"F", home:"Netherlands", away:"Japan",       date:"Jun 14", city:"Dallas",      utcTime:"2026-06-14T20:00:00Z", phase:"group" },
  { id:"F2", group:"F", home:"Sweden",      away:"Tunisia",     date:"Jun 14", city:"Monterrey",   utcTime:"2026-06-15T02:00:00Z", phase:"group" },
  { id:"F3", group:"F", home:"Netherlands", away:"Sweden",      date:"Jun 20", city:"Houston",     utcTime:"2026-06-20T17:00:00Z", phase:"group" },
  { id:"F4", group:"F", home:"Tunisia",     away:"Japan",       date:"Jun 21", city:"Monterrey",   utcTime:"2026-06-21T04:00:00Z", phase:"group" },
  { id:"F5", group:"F", home:"Tunisia",     away:"Netherlands", date:"Jun 25", city:"Kansas City", utcTime:"2026-06-25T23:00:00Z", phase:"group" },
  { id:"F6", group:"F", home:"Japan",       away:"Sweden",      date:"Jun 25", city:"Dallas",      utcTime:"2026-06-25T23:00:00Z", phase:"group" },
  // ── GROUP G: Belgium, Egypt, Iran, New Zealand ──
  { id:"G1", group:"G", home:"Belgium",     away:"Egypt",       date:"Jun 15", city:"Seattle",    utcTime:"2026-06-15T19:00:00Z", phase:"group" },
  { id:"G2", group:"G", home:"Iran",        away:"New Zealand", date:"Jun 15", city:"Los Angeles",utcTime:"2026-06-16T01:00:00Z", phase:"group" },
  { id:"G3", group:"G", home:"Belgium",     away:"Iran",        date:"Jun 21", city:"Los Angeles",utcTime:"2026-06-21T19:00:00Z", phase:"group" },
  { id:"G4", group:"G", home:"New Zealand", away:"Egypt",       date:"Jun 21", city:"Vancouver",  utcTime:"2026-06-22T01:00:00Z", phase:"group" },
  { id:"G5", group:"G", home:"New Zealand", away:"Belgium",     date:"Jun 26", city:"Vancouver",  utcTime:"2026-06-27T03:00:00Z", phase:"group" },
  { id:"G6", group:"G", home:"Egypt",       away:"Iran",        date:"Jun 26", city:"Seattle",    utcTime:"2026-06-27T03:00:00Z", phase:"group" },
  // ── GROUP H: Spain, Cape Verde, Saudi Arabia, Uruguay ──
  { id:"H1", group:"H", home:"Spain",        away:"Cape Verde",    date:"Jun 15", city:"Atlanta",    utcTime:"2026-06-15T16:00:00Z", phase:"group" },
  { id:"H2", group:"H", home:"Saudi Arabia", away:"Uruguay",       date:"Jun 15", city:"Miami",      utcTime:"2026-06-15T22:00:00Z", phase:"group" },
  { id:"H3", group:"H", home:"Spain",        away:"Saudi Arabia",  date:"Jun 21", city:"Atlanta",    utcTime:"2026-06-21T16:00:00Z", phase:"group" },
  { id:"H4", group:"H", home:"Uruguay",      away:"Cape Verde",    date:"Jun 21", city:"Miami",      utcTime:"2026-06-21T22:00:00Z", phase:"group" },
  { id:"H5", group:"H", home:"Uruguay",      away:"Spain",         date:"Jun 26", city:"Guadalajara",utcTime:"2026-06-27T00:00:00Z", phase:"group" },
  { id:"H6", group:"H", home:"Cape Verde",   away:"Saudi Arabia",  date:"Jun 26", city:"Houston",    utcTime:"2026-06-27T00:00:00Z", phase:"group" },
  // ── GROUP I: France, Senegal, Iraq, Norway ──
  { id:"I1", group:"I", home:"France",  away:"Senegal", date:"Jun 16", city:"New York",     utcTime:"2026-06-16T19:00:00Z", phase:"group" },
  { id:"I2", group:"I", home:"Iraq",    away:"Norway",  date:"Jun 16", city:"Boston",       utcTime:"2026-06-16T22:00:00Z", phase:"group" },
  { id:"I3", group:"I", home:"France",  away:"Iraq",    date:"Jun 22", city:"Philadelphia", utcTime:"2026-06-22T21:00:00Z", phase:"group" },
  { id:"I4", group:"I", home:"Norway",  away:"Senegal", date:"Jun 22", city:"New York",     utcTime:"2026-06-23T00:00:00Z", phase:"group" },
  { id:"I5", group:"I", home:"Norway",  away:"France",  date:"Jun 26", city:"Boston",       utcTime:"2026-06-26T19:00:00Z", phase:"group" },
  { id:"I6", group:"I", home:"Senegal", away:"Iraq",    date:"Jun 26", city:"Toronto",      utcTime:"2026-06-26T19:00:00Z", phase:"group" },
  // ── GROUP J: Argentina, Algeria, Austria, Jordan ──
  { id:"J1", group:"J", home:"Argentina", away:"Algeria",  date:"Jun 16", city:"Kansas City",  utcTime:"2026-06-17T01:00:00Z", phase:"group" },
  { id:"J2", group:"J", home:"Austria",   away:"Jordan",   date:"Jun 17", city:"San Francisco",utcTime:"2026-06-17T04:00:00Z", phase:"group" },
  { id:"J3", group:"J", home:"Argentina", away:"Austria",  date:"Jun 22", city:"Dallas",       utcTime:"2026-06-22T17:00:00Z", phase:"group" },
  { id:"J4", group:"J", home:"Jordan",    away:"Algeria",  date:"Jun 22", city:"San Francisco",utcTime:"2026-06-23T03:00:00Z", phase:"group" },
  { id:"J5", group:"J", home:"Jordan",    away:"Argentina",date:"Jun 27", city:"Dallas",       utcTime:"2026-06-28T02:00:00Z", phase:"group" },
  { id:"J6", group:"J", home:"Algeria",   away:"Austria",  date:"Jun 27", city:"Kansas City",  utcTime:"2026-06-28T02:00:00Z", phase:"group" },
  // ── GROUP K: Portugal, DR Congo, Uzbekistan, Colombia ──
  { id:"K1", group:"K", home:"Portugal",   away:"DR Congo",   date:"Jun 17", city:"Houston",     utcTime:"2026-06-17T17:00:00Z", phase:"group" },
  { id:"K2", group:"K", home:"Uzbekistan", away:"Colombia",   date:"Jun 17", city:"Mexico City", utcTime:"2026-06-18T02:00:00Z", phase:"group" },
  { id:"K3", group:"K", home:"Portugal",   away:"Uzbekistan", date:"Jun 23", city:"Houston",     utcTime:"2026-06-23T17:00:00Z", phase:"group" },
  { id:"K4", group:"K", home:"Colombia",   away:"DR Congo",   date:"Jun 23", city:"Guadalajara", utcTime:"2026-06-24T02:00:00Z", phase:"group" },
  { id:"K5", group:"K", home:"Colombia",   away:"Portugal",   date:"Jun 27", city:"Miami",       utcTime:"2026-06-27T23:30:00Z", phase:"group" },
  { id:"K6", group:"K", home:"DR Congo",   away:"Uzbekistan", date:"Jun 27", city:"Atlanta",     utcTime:"2026-06-27T23:30:00Z", phase:"group" },
  // ── GROUP L: England, Croatia, Ghana, Panama ──
  { id:"L1", group:"L", home:"England", away:"Croatia", date:"Jun 17", city:"Dallas",       utcTime:"2026-06-17T20:00:00Z", phase:"group" },
  { id:"L2", group:"L", home:"Ghana",   away:"Panama",  date:"Jun 17", city:"Toronto",      utcTime:"2026-06-17T23:00:00Z", phase:"group" },
  { id:"L3", group:"L", home:"England", away:"Ghana",   date:"Jun 23", city:"Boston",       utcTime:"2026-06-23T20:00:00Z", phase:"group" },
  { id:"L4", group:"L", home:"Panama",  away:"Croatia", date:"Jun 23", city:"Toronto",      utcTime:"2026-06-23T23:00:00Z", phase:"group" },
  { id:"L5", group:"L", home:"Panama",  away:"England", date:"Jun 27", city:"New York",     utcTime:"2026-06-27T21:00:00Z", phase:"group" },
  { id:"L6", group:"L", home:"Croatia", away:"Ghana",   date:"Jun 27", city:"Philadelphia", utcTime:"2026-06-27T21:00:00Z", phase:"group" },
];

const KNOCKOUT_ROUNDS = [
  { id:"R32", label:"Round of 32", phase:"r32",   pts:2  },
  { id:"R16", label:"Round of 16", phase:"r16",   pts:4  },
  { id:"QF",  label:"Quarterfinals",phase:"qf",   pts:6  },
  { id:"SF",  label:"Semifinals",  phase:"sf",    pts:8  },
  { id:"FIN", label:"Final",       phase:"final", pts:10 },
];

const FLAGS = {
  "Mexico":"🇲🇽", "South Africa":"🇿🇦", "South Korea":"🇰🇷", "Czechia":"🇨🇿",
  "Canada":"🇨🇦", "Bosnia & Herz.":"🇧🇦", "Qatar":"🇶🇦", "Switzerland":"🇨🇭",
  "Brazil":"🇧🇷", "Morocco":"🇲🇦", "Haiti":"🇭🇹", "Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "USA":"🇺🇸", "Paraguay":"🇵🇾", "Australia":"🇦🇺", "Türkiye":"🇹🇷",
  "Germany":"🇩🇪", "Curaçao":"🇨🇼", "Ivory Coast":"🇨🇮", "Ecuador":"🇪🇨",
  "Netherlands":"🇳🇱", "Japan":"🇯🇵", "Sweden":"🇸🇪", "Tunisia":"🇹🇳",
  "Belgium":"🇧🇪", "Egypt":"🇪🇬", "Iran":"🇮🇷", "New Zealand":"🇳🇿",
  "Spain":"🇪🇸", "Cape Verde":"🇨🇻", "Saudi Arabia":"🇸🇦", "Uruguay":"🇺🇾",
  "France":"🇫🇷", "Senegal":"🇸🇳", "Iraq":"🇮🇶", "Norway":"🇳🇴",
  "Argentina":"🇦🇷", "Algeria":"🇩🇿", "Austria":"🇦🇹", "Jordan":"🇯🇴",
  "Portugal":"🇵🇹", "DR Congo":"🇨🇩", "Uzbekistan":"🇺🇿", "Colombia":"🇨🇴",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croatia":"🇭🇷", "Ghana":"🇬🇭", "Panama":"🇵🇦",
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const GAS_URL = "https://script.google.com/macros/s/AKfycbzg9kmYGessa3WDgSc8FJa2ljYmX12fjY0riWcXX4EmrkcHHZeINBfIt1Giao3Vlad1/exec";

async function loadData(key) {
  try {
    // Try Google Sheets backend first
    const r = await fetch(`${GAS_URL}?key=${key}`, {
      method:"GET",
      redirect:"follow",
    });
    if(r.ok){
      const j = await r.json();
      // Always mirror to localStorage as cache
      if(j.value) localStorage.setItem(`q_${key}`, j.value);
      return j.value ? JSON.parse(j.value) : null;
    }
  } catch(e){ console.warn("GAS load failed, using localStorage:", e); }
  // Fallback to localStorage
  try {
    const v = localStorage.getItem(`q_${key}`);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

async function saveData(key, value) {
  const str = JSON.stringify(value);
  // Always save to localStorage immediately (instant, works offline)
  localStorage.setItem(`q_${key}`, str);
  // Then sync to Google Sheets
  try {
    await fetch(GAS_URL, {
      method:"POST",
      redirect:"follow",
      headers:{"Content-Type":"text/plain"}, // text/plain avoids CORS preflight
      body: JSON.stringify({key, value: str}),
    });
  } catch(e){ console.warn("GAS save failed:", e); }
}

// ─── SCORING ─────────────────────────────────────────────────────────────────
function calcPoints(pred,result,phase){
  if(!pred||!result)return 0;
  const{homeScore:ph,awayScore:pa}=pred;
  const{homeScore:rh,awayScore:ra}=result;
  if(ph===null||pa===null||rh===null||ra===null)return 0;
  const phasePts={r32:2,r16:4,qf:6,sf:8,final:10};
  if(phase==="group"){
    if(ph===rh&&pa===ra)return 3;
    const pR=ph>pa?"H":ph<pa?"A":"D", rR=rh>ra?"H":rh<ra?"A":"D";
    return pR===rR?1:0;
  }
  const pts=phasePts[phase]||2;
  if(ph===rh&&pa===ra)return pts+2;
  const pW=ph>pa?"H":"A", rW=rh>ra?"H":"A";
  return pW===rW?pts:0;
}

function computeLeaderboard(players,predictions,results){
  return players.map(player=>{
    let total=0,exact=0,correct=0;
    const breakdown={};
    GROUP_MATCHES.forEach(m=>{
      const res=results[m.id], pred=predictions[player.id]?.[m.id];
      if(res&&pred){
        const pts=calcPoints(pred,res,m.phase);
        total+=pts; breakdown[m.id]=pts;
        if(pts===3)exact++; else if(pts===1)correct++;
      }
    });
    return{...player,total,exact,correct,breakdown};
  }).sort((a,b)=>b.total-a.total||b.exact-a.exact);
}

// ─── TIME HELPERS ─────────────────────────────────────────────────────────────
function fmtLocalTime(iso){
  try{
    const d=new Date(iso);
    return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
  }catch{return"";}
}
// Derive the match date in the viewer's local timezone (avoids stale/incorrect static date labels)
function fmtLocalDate(iso){
  try{
    const d=new Date(iso);
    return d.toLocaleDateString([],{month:"short",day:"numeric"});
  }catch{return"";}
}
// Mexico City has used fixed UTC-6 (no DST) since 2022
function fmtMexicoTime(iso){
  try{
    const d=new Date(iso);
    const mx=new Date(d.getTime()-6*60*60*1000);
    const h=mx.getUTCHours();
    const m=mx.getUTCMinutes().toString().padStart(2,'0');
    const ampm=h>=12?'pm':'am';
    const h12=h%12||12;
    return `${h12}:${m} ${ampm} CDMX`;
  }catch{return"";}
}
function matchStatus(iso){
  const now=new Date(), start=new Date(iso);
  const diff=(now-start)/60000;
  if(diff<0)return"upcoming";
  if(diff<110)return"live";
  return"finished";
}


// ─── COUNTDOWN HOOK ───────────────────────────────────────────────────────────
function useCountdown(utcTime){
  const[label,setLabel]=useState("");
  useEffect(()=>{
    function calc(){
      const diff=new Date(utcTime)-new Date();
      if(diff<=0){setLabel("");return;}
      const d=Math.floor(diff/86400000);
      const h=Math.floor((diff%86400000)/3600000);
      const m=Math.floor((diff%3600000)/60000);
      const s=Math.floor((diff%60000)/1000);
      if(d>0)setLabel(`${d}d ${h}h ${m}m`);
      else if(h>0)setLabel(`${h}h ${m}m`);
      else if(m>0)setLabel(`${m}m ${s}s`);
      else setLabel(`${s}s`);
    }
    calc();
    const id=setInterval(calc,1000);
    return()=>clearInterval(id);
  },[utcTime]);
  return label;
}

// ─── MATCH CARD with countdown ────────────────────────────────────────────────
function MatchCountdown({utcTime}){
  const label=useCountdown(utcTime);
  const status=matchStatus(utcTime);
  if(status==="finished"||status==="live"||!label)return null;
  return(
    <div style={{fontFamily:"var(--fH)",fontSize:11,fontWeight:700,letterSpacing:1,
      color:"var(--purple)",background:"rgba(75,10,174,.08)",
      border:"1px solid rgba(75,10,174,.18)",borderRadius:4,
      padding:"2px 7px",marginTop:2,textAlign:"center"}}>
      ⏱ {label}
    </div>
  );
}

// ─── LOCKING HELPERS ─────────────────────────────────────────────────────────
// First match of the tournament: Mexico vs South Africa, Jun 11 19:00 UTC
const TOURNAMENT_START_UTC = "2026-06-11T19:00:00Z";

// Server time ref — fetched once on app load, used for all locking checks
// Falls back to browser time if the fetch fails
let _serverTimeOffset = 0; // ms difference between server and browser

async function syncServerTime() {
  try {
    const before = Date.now();
    const r = await fetch("https://worldtimeapi.org/api/timezone/UTC", {cache:"no-store"});
    const after = Date.now();
    if(r.ok) {
      const data = await r.json();
      const serverMs = new Date(data.utc_datetime).getTime();
      const roundTrip = (after - before) / 2;
      _serverTimeOffset = serverMs - (before + roundTrip);
    }
  } catch {
    // Silently fall back to browser time — offset stays 0
    console.warn("Could not sync server time, using browser clock");
  }
}

// Always use this instead of new Date() for locking checks
function now() {
  return new Date(Date.now() + _serverTimeOffset);
}

// Bonus picks lock when the very first match kicks off
function isBonusLocked() {
  return now() >= new Date(TOURNAMENT_START_UTC);
}

// A match's score input locks at kick-off time (not when result is entered)
function isMatchLocked(utcTime) {
  return now() >= new Date(utcTime);
}

// ─── API FETCH ────────────────────────────────────────────────────────────────
// Uses the free openfootball worldcup.json — no key needed
const WC_JSON="https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

// Explicit alias map: openfootball name → our app name
const TEAM_ALIASES={
  "czech republic":"Czechia",
  "czechia":"Czechia",
  "türkiye":"Türkiye",
  "turkey":"Türkiye",
  "ivory coast":"Ivory Coast",
  "côte d'ivoire":"Ivory Coast",
  "cote d'ivoire":"Ivory Coast",
  "bosnia and herzegovina":"Bosnia & Herz.",
  "bosnia & herzegovina":"Bosnia & Herz.",
  "south korea":"South Korea",
  "korea republic":"South Korea",
  "new zealand":"New Zealand",
  "saudi arabia":"Saudi Arabia",
  "south africa":"South Africa",
  "cape verde":"Cape Verde",
  "dr congo":"DR Congo",
  "congo dr":"DR Congo",
  "iran":"Iran",
  "ir iran":"Iran",
  "curacao":"Curaçao",
  "curaçao":"Curaçao",
  "uzbekistan":"Uzbekistan",
  "colombia":"Colombia",
  "norway":"Norway",
  "scotland":"Scotland",
  "haiti":"Haiti",
  "jordan":"Jordan",
  "austria":"Austria",
  "algeria":"Algeria",
  "sweden":"Sweden",
  "iraq":"Iraq",
};

function normalizeTeam(raw=""){
  const lower=raw.toLowerCase().trim();
  return TEAM_ALIASES[lower]||raw.trim();
}

async function fetchLiveResults(){
  try{
    const r=await fetch(WC_JSON,{cache:"no-store"});
    if(!r.ok)return null;
    const data=await r.json();
    const mapped={};
    (data.matches||[]).forEach(m=>{
      if(!m.score?.ft)return;
      const apiHome=normalizeTeam(m.team1||"");
      const apiAway=normalizeTeam(m.team2||"");
      const match=GROUP_MATCHES.find(gm=>
        gm.home===apiHome && gm.away===apiAway
      );
      if(match){
        mapped[match.id]={homeScore:m.score.ft[0],awayScore:m.score.ft[1],_fromApi:true};
      }
    });
    return mapped;
  }catch(e){console.warn("API fetch failed:",e);return null;}
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --red:#E8001C;
  --crimson:#8B0000;
  --purple:#4B0AAE;
  --lime:#A8D200;
  --green:#00A550;
  --white:#FFFFFF;
  --offwhite:#F5F3EE;
  --bg:#F5F3EE;
  --dark:#111111;
  --muted:#777;
  --border:rgba(0,0,0,0.10);
  --r:12px;
  --fH:'Barlow Condensed',sans-serif;
  --fB:'Barlow',sans-serif;
}

body{background:var(--bg);color:var(--dark);font-family:var(--fB);}

/* ── BACKGROUND: colour-block mosaic like the official branding ── */
.app{min-height:100vh;position:relative;overflow-x:hidden;}

/* Decorative colour blocks — top-left purple, top-right red strip, bottom-right lime */
.app::before{
  content:'';position:fixed;top:0;left:0;width:260px;height:260px;
  background:var(--purple);border-radius:0 0 9999px 0;
  pointer-events:none;z-index:0;opacity:.12;
}
.app::after{
  content:'26';position:fixed;right:-30px;bottom:-40px;
  font-family:var(--fH);font-size:clamp(220px,28vw,380px);font-weight:900;
  color:rgba(232,0,28,0.06);letter-spacing:-8px;pointer-events:none;z-index:0;
  line-height:1;user-select:none;
}
.app>*{position:relative;z-index:1;}

/* top colour stripe — mirrors the horizontal band in the image */
.color-stripe{
  height:6px;width:100%;display:flex;flex-shrink:0;
}
.cs-purple{flex:2;background:var(--purple);}
.cs-red{flex:3;background:var(--red);}
.cs-lime{flex:1.2;background:var(--lime);}
.cs-green{flex:.6;background:var(--green);}

/* ── NAV ── */
.nav{
  display:flex;align-items:center;padding:0 20px;
  background:var(--white);
  border-bottom:1px solid rgba(0,0,0,.08);
  position:sticky;top:0;z-index:100;gap:2px;
  box-shadow:0 2px 12px rgba(0,0,0,.06);
}
.nav-logo{
  font-family:var(--fH);font-size:17px;font-weight:900;letter-spacing:2px;
  color:var(--dark);padding:12px 16px 12px 0;
  border-right:1px solid rgba(0,0,0,.08);margin-right:6px;
  white-space:nowrap;display:flex;align-items:center;gap:8px;text-transform:uppercase;
}
.nav-logo-badge{
  background:var(--red);color:#fff;font-size:9px;font-weight:800;
  letter-spacing:1.5px;padding:2px 7px;border-radius:3px;text-transform:uppercase;
}
.nav-tab{
  font-family:var(--fH);font-size:14px;font-weight:700;letter-spacing:1px;
  color:rgba(0,0,0,.35);padding:16px 13px;cursor:pointer;border:none;background:none;
  border-bottom:3px solid transparent;transition:all .2s;white-space:nowrap;text-transform:uppercase;
}
.nav-tab:hover{color:var(--dark);}
.nav-tab.active{color:var(--red);border-bottom-color:var(--red);}
.nav-sp{flex:1;}
.nav-live{display:flex;align-items:center;gap:6px;font-family:var(--fH);
  font-size:11px;font-weight:700;color:var(--red);margin-right:10px;letter-spacing:1.5px;}
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--red);animation:pulse 1.2s infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(0.6)}}
.nav-btn{
  font-family:var(--fH);font-size:11px;font-weight:700;letter-spacing:1.5px;
  background:transparent;border:1.5px solid var(--purple);
  color:var(--purple);border-radius:5px;padding:6px 14px;cursor:pointer;transition:all .2s;
  text-transform:uppercase;
}
.nav-btn:hover{background:var(--purple);color:#fff;}

/* ── LAYOUT ── */
.page{max-width:860px;margin:0 auto;padding:32px 16px 80px;}
.page-title{
  font-family:var(--fH);font-size:clamp(36px,9vw,68px);font-weight:900;
  letter-spacing:3px;line-height:0.95;margin-bottom:8px;text-transform:uppercase;
  color:var(--dark);
}
.title-accent{color:var(--red);}
.page-sub{color:var(--muted);font-size:13px;margin-bottom:28px;letter-spacing:.2px;}

/* ── CARD ── */
.card{
  background:var(--white);border:1px solid var(--border);
  border-radius:var(--r);padding:18px;
  box-shadow:0 2px 12px rgba(0,0,0,.05);
}

/* ── FORM ── */
.field{margin-bottom:14px;}
.label{
  display:block;font-family:var(--fH);font-size:11px;font-weight:700;letter-spacing:2px;
  color:var(--muted);text-transform:uppercase;margin-bottom:6px;
}
.inp{
  width:100%;padding:10px 14px;background:var(--offwhite);
  border:1.5px solid rgba(0,0,0,.12);border-radius:7px;color:var(--dark);
  font-family:var(--fB);font-size:14px;transition:border-color .2s;outline:none;
}
.inp:focus{border-color:var(--red);}
.inp::placeholder{color:rgba(0,0,0,.25);}
select.inp option{background:#fff;color:var(--dark);}

/* ── BUTTONS ── */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  padding:11px 24px;border-radius:7px;font-family:var(--fH);font-size:14px;
  font-weight:800;cursor:pointer;border:none;transition:all .2s;
  letter-spacing:1.5px;text-transform:uppercase;
}
.btn-gold{background:var(--red);color:#fff;}
.btn-gold:hover{background:#c8001a;transform:translateY(-1px);box-shadow:0 6px 20px rgba(232,0,28,.3);}
.btn-ghost{background:transparent;border:1.5px solid rgba(0,0,0,.2);color:var(--dark);}
.btn-ghost:hover{border-color:var(--dark);background:rgba(0,0,0,.03);}
.btn-wa{background:#25d366;color:#fff;}
.btn-wa:hover{background:#1db954;transform:translateY(-1px);}
.btn-sm{padding:7px 14px;font-size:12px;}
.btn:disabled{opacity:.3;cursor:not-allowed;transform:none!important;}
.w-full{width:100%;}

/* ── MODE TOGGLE (sign in / new player) ── */
.mode-toggle{
  display:flex;gap:0;max-width:400px;margin-bottom:20px;
  background:var(--offwhite);border-radius:10px;padding:4px;
  border:1.5px solid rgba(0,0,0,.08);
}
.mode-btn{
  flex:1;padding:9px 0;border-radius:7px;border:none;cursor:pointer;
  font-family:var(--fH);font-weight:800;font-size:12px;letter-spacing:.5px;
  transition:all .2s;text-transform:uppercase;
}
.mode-btn.on{background:var(--red);color:#fff;box-shadow:0 2px 8px rgba(232,0,28,.25);}
.mode-btn.off{background:transparent;color:var(--muted);}

/* ── GROUP TABS ── */
.g-tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px;}
.g-tab{
  font-family:var(--fH);padding:5px 13px;border-radius:5px;font-size:12px;font-weight:700;
  cursor:pointer;border:1.5px solid rgba(0,0,0,.1);background:transparent;
  color:var(--muted);letter-spacing:1.5px;transition:all .2s;text-transform:uppercase;
}
.g-tab:hover{color:var(--dark);border-color:rgba(0,0,0,.25);}
.g-tab.active{background:var(--purple);color:#fff;border-color:var(--purple);}

/* ── MATCH CARD ── */
.m-card{
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;
  padding:12px 14px;border-radius:10px;
  background:var(--white);border:1.5px solid rgba(0,0,0,.07);
  transition:all .2s;margin-bottom:8px;
  box-shadow:0 1px 6px rgba(0,0,0,.04);
}
.m-card.pred{border-color:var(--purple);border-width:1.5px;}
.m-card.done{border-color:var(--lime);border-width:1.5px;}
.m-card.live-now{
  border-color:var(--red);border-width:2px;
  box-shadow:0 0 0 3px rgba(232,0,28,.12);
  animation:glow 2s ease-in-out infinite;
}
@keyframes glow{
  0%,100%{box-shadow:0 0 0 3px rgba(232,0,28,.1)}
  50%{box-shadow:0 0 0 5px rgba(232,0,28,.2)}
}
.team{display:flex;align-items:center;gap:7px;font-weight:500;font-size:13px;color:var(--dark);}
.team.away{justify-content:flex-end;text-align:right;}
.team.away .flag{order:2;}
.team.away .t-name{order:1;}
.flag{font-size:20px;flex-shrink:0;}
.t-name{font-size:12px;font-weight:600;line-height:1.2;}
.score-inp{
  width:42px;padding:6px;text-align:center;
  background:var(--offwhite);border:1.5px solid rgba(0,0,0,.15);
  border-radius:6px;color:var(--dark);font-size:16px;font-weight:700;
  outline:none;transition:border-color .2s;
}
.score-inp:focus{border-color:var(--red);}
.sep{font-family:var(--fH);font-size:20px;color:var(--muted);}
.score-show{font-family:var(--fH);font-size:24px;color:var(--red);letter-spacing:3px;font-weight:900;}
.m-meta{font-size:10px;color:var(--muted);text-align:center;line-height:1.6;}
.live-tag{color:var(--red);font-weight:800;font-size:9px;letter-spacing:2px;}
.pts-pill{
  display:inline-flex;align-items:center;justify-content:center;
  width:28px;height:28px;border-radius:50%;font-size:10px;font-weight:700;
}
.pts-3{background:rgba(168,210,0,.2);color:#5a7a00;border:1.5px solid rgba(168,210,0,.4);}
.pts-1{background:rgba(75,10,174,.1);color:var(--purple);border:1.5px solid rgba(75,10,174,.2);}
.pts-0{background:rgba(0,0,0,.05);color:var(--muted);}

/* ── LEADERBOARD ── */
.lb-hdr{
  display:grid;grid-template-columns:40px 1fr 62px 62px 80px;
  gap:10px;padding:8px 16px;font-family:var(--fH);font-size:10px;font-weight:700;
  letter-spacing:2px;color:var(--muted);text-transform:uppercase;
  border-bottom:2px solid rgba(0,0,0,.07);
}
.lb-row{
  display:grid;grid-template-columns:40px 1fr 62px 62px 80px;
  align-items:center;gap:10px;padding:14px 16px;
  border-bottom:1px solid rgba(0,0,0,.05);transition:all .2s;cursor:pointer;
}
.lb-row:hover{background:rgba(0,0,0,.02);}
.lb-row.r1{background:rgba(232,0,28,.04);border-left:4px solid var(--red);}
.lb-row.r2{background:rgba(75,10,174,.03);border-left:4px solid var(--purple);}
.lb-row.r3{background:rgba(168,210,0,.05);border-left:4px solid var(--lime);}
.rn{font-family:var(--fH);font-size:20px;font-weight:900;color:var(--muted);text-align:center;}
.rn.g{color:var(--red);}
.p-name{font-weight:700;font-size:15px;color:var(--dark);}
.pts-big{font-family:var(--fH);font-size:28px;font-weight:900;color:var(--red);text-align:right;}
.stat{text-align:center;font-size:12px;color:var(--muted);}
.lb-hdr .abbr{display:none;}
.lb-hdr .full{display:inline;}
.expand{
  background:var(--offwhite);padding:10px 16px 16px;margin-bottom:2px;
  border-bottom:1px solid rgba(0,0,0,.06);
}

/* ── PODIUM ── */
.podium{display:flex;gap:8px;margin-bottom:28px;align-items:flex-end;}
.pod-item{flex:1;text-align:center;}
.pod-bar{border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;}
.pod-name{font-weight:700;font-size:12px;margin-bottom:5px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:var(--fH);
  letter-spacing:1px;text-transform:uppercase;}
.pod-medal{font-size:20px;margin-bottom:4px;}

/* ── KO LOCK ── */
.ko-lock{
  text-align:center;padding:48px 20px;
  border:2px dashed rgba(0,0,0,.1);border-radius:var(--r);color:var(--muted);
  background:var(--white);
}

/* ── TOAST ── */
.toast{
  position:fixed;bottom:22px;left:50%;transform:translateX(-50%);
  background:var(--red);color:#fff;padding:12px 24px;border-radius:7px;
  font-family:var(--fH);font-weight:800;font-size:13px;letter-spacing:1.5px;
  text-transform:uppercase;z-index:999;animation:fadeUp .3s ease;
  box-shadow:0 8px 32px rgba(232,0,28,.35);
}
.toast.err{background:var(--crimson);color:#fff;}
@keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

/* ── MODAL ── */
.modal-bg{
  position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);
  display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;
}
.modal{
  background:var(--white);border:1px solid rgba(0,0,0,.1);border-radius:var(--r);
  padding:28px;width:100%;max-width:360px;
  box-shadow:0 20px 60px rgba(0,0,0,.2);
}
.modal-t{
  font-family:var(--fH);font-size:28px;font-weight:900;margin-bottom:6px;
  letter-spacing:2px;text-transform:uppercase;color:var(--red);
}
.modal-s{color:var(--muted);font-size:12px;margin-bottom:20px;}

/* ── MISC ── */
.div{height:1px;background:rgba(0,0,0,.08);margin:20px 0;}
.sec-t{
  font-family:var(--fH);font-size:22px;font-weight:800;letter-spacing:3px;
  margin-bottom:14px;text-transform:uppercase;color:var(--dark);
}
.empty{text-align:center;padding:44px 20px;color:var(--muted);font-size:13px;}
.empty-i{font-size:40px;margin-bottom:10px;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.flex{display:flex;} .gap8{gap:8px;} .gap10{gap:10px;} .gap12{gap:12px;}
.mt8{margin-top:8px;} .mt16{margin-top:16px;} .mb16{margin-bottom:16px;}
.api-badge{
  display:inline-flex;align-items:center;gap:5px;font-family:var(--fH);font-size:10px;
  color:var(--green);background:rgba(0,165,80,.08);border:1.5px solid rgba(0,165,80,.2);
  border-radius:4px;padding:3px 10px;font-weight:700;letter-spacing:1px;
}
.preview-tag{
  display:inline-block;background:rgba(168,210,0,.15);
  border:1.5px solid rgba(168,210,0,.4);color:#5a7a00;
  font-family:var(--fH);font-size:10px;font-weight:700;letter-spacing:2px;
  padding:3px 10px;border-radius:4px;text-transform:uppercase;margin-bottom:16px;
}

/* ── GOAL ANIMATION ── */
@keyframes goalPop{0%{transform:scale(1)}40%{transform:scale(1.45)}70%{transform:scale(.95)}100%{transform:scale(1)}}
.goal-anim{animation:goalPop .5s ease;}

@media(max-width:640px){
  /* Hide top nav tabs on mobile — use bottom bar instead */
  .nav{padding:0 12px;}
  .nav-logo{font-size:13px;padding:10px 10px 10px 0;letter-spacing:1px;}
  .nav-logo-badge{font-size:8px;padding:1px 5px;}
  .nav-tab{display:none;}
  .nav-sp{display:none;}
  .nav-live{font-size:10px;margin-right:6px;}
  .nav-btn{font-size:10px;padding:5px 10px;}

  /* Bottom tab bar */
  .bottom-nav{
    display:flex;position:fixed;bottom:0;left:0;right:0;z-index:100;
    background:var(--white);border-top:1px solid rgba(0,0,0,.1);
    box-shadow:0 -4px 20px rgba(0,0,0,.1);
    padding-bottom:env(safe-area-inset-bottom);
  }
  .bottom-tab{
    flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:8px 4px 10px;border:none;background:none;cursor:pointer;
    font-family:var(--fH);font-size:9px;font-weight:700;letter-spacing:1px;
    color:rgba(0,0,0,.35);text-transform:uppercase;gap:3px;transition:all .2s;
    border-top:3px solid transparent;
  }
  .bottom-tab.active{color:var(--red);border-top-color:var(--red);}
  .bottom-tab-icon{font-size:18px;line-height:1;}

  .page{padding:20px 14px 100px;}
  .lb-hdr,.lb-row{grid-template-columns:26px 1fr 36px 36px 60px;gap:6px;}
  .lb-hdr .full{display:none;}
  .lb-hdr .abbr{display:inline;}
  .stat{font-size:13px;}
  .pts-big{font-size:22px;}
  .t-name{font-size:11px;}
  .app::after{display:none;}
  .app::before{display:none;}
}

/* Hide bottom nav on desktop */
@media(min-width:641px){
  .bottom-nav{display:none;}
}
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const[tab,setTab]=useState("predict");
  const[players,setPlayers]=useState([]);
  const[predictions,setPredictions]=useState({});
  const[results,setResults]=useState({});
  const[bonus,setBonus]=useState({});
  const[logs,setLogs]=useState([]);
  const[isAdmin,setIsAdmin]=useState(false);
  const[showLogin,setShowLogin]=useState(false);
  const[toast,setToast]=useState(null);
  const[loading,setLoading]=useState(true);
  const[apiStatus,setApiStatus]=useState("idle");
  const[liveMatches,setLiveMatches]=useState([]);
  const[tick,setTick]=useState(0); // increments every 30s to re-evaluate match locks
  const intervalRef=useRef(null);
  const tickRef=useRef(null);

  useEffect(()=>{
    async function load(){
      const[p,pr,r,b,lg]=await Promise.all([
        loadData(STORAGE_KEY_PLAYERS),loadData(STORAGE_KEY_PREDICTIONS),
        loadData(STORAGE_KEY_RESULTS),loadData(STORAGE_KEY_BONUS),
        loadData(STORAGE_KEY_LOGS),
        syncServerTime(),
      ]);
      if(p)setPlayers(p);
      if(pr)setPredictions(pr);
      if(r)setResults(r);
      if(b)setBonus(b);
      if(lg)setLogs(lg);
      setLoading(false);
    }
    load();
    // Tick every 15s to re-lock any matches that just kicked off
    tickRef.current=setInterval(()=>setTick(t=>t+1),15000);
    // When the tab regains focus/visibility, immediately re-sync time and re-check locks
    const onVisible=()=>{
      if(document.visibilityState==="visible"){
        syncServerTime();
        setTick(t=>t+1);
      }
    };
    document.addEventListener("visibilitychange",onVisible);
    window.addEventListener("focus",onVisible);
    return()=>{
      clearInterval(tickRef.current);
      document.removeEventListener("visibilitychange",onVisible);
      window.removeEventListener("focus",onVisible);
    };
  },[]);

  // Auto-fetch live results every 60s
  const doFetch=useCallback(async()=>{
    const live=await fetchLiveResults();
    if(live){
      setApiStatus("ok");
      // Merge: API fills in scores, but never overwrites a manually-entered admin result.
      // Persist any new API-derived scores so they survive page reloads / re-syncs.
      setResults(prev=>{
        let changed=false;
        const merged={...prev};
        Object.entries(live).forEach(([id,score])=>{
          const existing=merged[id];
          const isNewOrApiOwned = !existing || existing._fromApi;
          const scoreChanged = !existing
            || existing.homeScore!==score.homeScore
            || existing.awayScore!==score.awayScore;
          if(isNewOrApiOwned && scoreChanged){
            merged[id]={...score,_fromApi:true};
            changed=true;
          }
        });
        if(changed){
          // Fire-and-forget save so API scores persist to Google Sheets too
          saveData(STORAGE_KEY_RESULTS,merged);
        }
        return merged;
      });
      // Detect live matches
      const nowLive=GROUP_MATCHES.filter(m=>matchStatus(m.utcTime)==="live").map(m=>m.id);
      setLiveMatches(nowLive);
    }else{
      setApiStatus("error");
    }
  },[]);

  useEffect(()=>{
    doFetch();
    intervalRef.current=setInterval(doFetch,60000);
    return()=>clearInterval(intervalRef.current);
  },[doFetch]);

  const showToast=(msg,err=false)=>{
    setToast({msg,err});
    setTimeout(()=>setToast(null),3000);
  };

  const leaderboard=computeLeaderboard(players,predictions,results);

  if(loading)return(
    <>
      <style>{CSS}</style>
      <div className="app" style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:14,animation:"goalPop 1s infinite"}}>⚽</div>
          <div style={{fontFamily:"var(--fH)",fontSize:22,letterSpacing:3,color:"var(--red)"}}>LOADING QUINIELA…</div>
        </div>
      </div>
    </>
  );

  return(
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="color-stripe"><div className="cs-purple"/><div className="cs-red"/><div className="cs-lime"/><div className="cs-green"/></div>
        <nav className="nav">
          <div className="nav-logo">
            QUINIELA MUNDIAL
            <span className="nav-logo-badge">2026</span>
          </div>
          <button className={`nav-tab ${tab==="predict"?"active":""}`} onClick={()=>setTab("predict")}>My Picks</button>
          <button className={`nav-tab ${tab==="leaderboard"?"active":""}`} onClick={()=>setTab("leaderboard")}>Standings</button>
          <button className={`nav-tab ${tab==="knockout"?"active":""}`} onClick={()=>setTab("knockout")}>Knockouts</button>
          <button className={`nav-tab ${tab==="rules"?"active":""}`} onClick={()=>setTab("rules")}>Reglas</button>
          {isAdmin&&<button className={`nav-tab ${tab==="admin"?"active":""}`} onClick={()=>setTab("admin")}>Admin</button>}
          <div className="nav-sp"/>
          {liveMatches.length>0&&(
            <div className="nav-live"><span className="live-dot"/>{liveMatches.length} LIVE</div>
          )}
          {apiStatus==="ok"&&liveMatches.length===0&&(
            <div style={{fontSize:10,color:"var(--muted)",marginRight:10}}>🔄 Auto-sync on</div>
          )}
          {isAdmin
            ?<button className="nav-btn" onClick={()=>{setIsAdmin(false);setTab("predict");}}>Exit Admin</button>
            :<button className="nav-btn" onClick={()=>setShowLogin(true)}>🔐 Admin</button>
          }
        </nav>

        {tab==="predict"&&<PredictView players={players} setPlayers={setPlayers}
          predictions={predictions} setPredictions={setPredictions}
          results={results} bonus={bonus} setBonus={setBonus}
          liveMatches={liveMatches} showToast={showToast} tick={tick}
          logs={logs} setLogs={setLogs}/>}
        {tab==="leaderboard"&&<LeaderboardView leaderboard={leaderboard}
          predictions={predictions} results={results} showToast={showToast}/>}
        {tab==="knockout"&&<KnockoutView isAdmin={isAdmin} showToast={showToast}/>}
        {tab==="rules"&&<RulesView players={players}/>}
        {tab==="admin"&&isAdmin&&<AdminView players={players} setPlayers={setPlayers}
          results={results} setResults={setResults} predictions={predictions}
          setPredictions={setPredictions} bonus={bonus} setBonus={setBonus}
          showToast={showToast} doFetch={doFetch} logs={logs}/>}

        {showLogin&&<LoginModal onSuccess={()=>{setIsAdmin(true);setShowLogin(false);setTab("admin");}}
          onClose={()=>setShowLogin(false)}/>}
        {toast&&<div className={`toast ${toast.err?"err":""}`}>✓ {toast.msg}</div>}

        {/* Mobile bottom navigation */}
        <div className="bottom-nav">
          {[
            {id:"predict",  icon:"⚽", label:"Picks"},
            {id:"leaderboard", icon:"🏆", label:"Tabla"},
            {id:"knockout", icon:"⚔️",  label:"Knockout"},
            {id:"rules",    icon:"📋", label:"Reglas"},
          ].map(t=>(
            <button key={t.id} className={`bottom-tab ${tab===t.id?"active":""}`}
              onClick={()=>setTab(t.id)}>
              <span className="bottom-tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
          {isAdmin&&(
            <button className={`bottom-tab ${tab==="admin"?"active":""}`}
              onClick={()=>setTab("admin")}>
              <span className="bottom-tab-icon">🔐</span>
              Admin
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── PREDICTIONS ──────────────────────────────────────────────────────────────
const GROUPS=["A","B","C","D","E","F","G","H","I","J","K","L"];
const ALL_TEAMS=Object.keys(FLAGS).sort();

// Simple hash — not cryptographic, but stops casual snooping in storage
function hashPw(str){
  let h=5381;
  for(let i=0;i<str.length;i++) h=((h<<5)+h)^str.charCodeAt(i);
  return (h>>>0).toString(36);
}

const STORAGE_SESSION_KEY = "quiniela_session_pid";

function PredictView({players,setPlayers,predictions,setPredictions,results,bonus,setBonus,liveMatches,showToast,tick,logs,setLogs}){
  const[step,setStep]=useState("id");
  const[mode,setMode]=useState("existing");
  const[selectedPid,setSelectedPid]=useState("");
  const[pw,setPw]=useState("");
  const[newName,setNewName]=useState("");
  const[newLastName,setNewLastName]=useState("");
  const[newPw,setNewPw]=useState("");
  const[newPw2,setNewPw2]=useState("");
  const[pwErr,setPwErr]=useState("");
  const[pid,setPid]=useState(null);
  const[activeG,setActiveG]=useState("A");
  const[localP,setLocalP]=useState({});
  const[champion,setChampion]=useState("");
  const[topScorer,setTopScorer]=useState("");
  const[saving,setSaving]=useState(false);

  // ── Auto-login from remembered session ──
  useEffect(()=>{
    if(players.length===0) return; // wait until players are loaded
    const savedPid=localStorage.getItem(STORAGE_SESSION_KEY);
    if(savedPid){
      const player=players.find(p=>p.id===savedPid);
      if(player){
        setLocalP(predictions[player.id]||{});
        if(bonus[player.id]){
          setChampion(bonus[player.id].champion||"");
          setTopScorer(bonus[player.id].topScorer||"");
        }
        setPid(player.id);
        setStep("pick");
      } else {
        // Player was deleted — clear stale session
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    }
  },[players]); // runs when players list loads from Sheets

  // ── Login as existing player ──
  const handleLogin=async()=>{
    setPwErr("");
    const player=players.find(p=>p.id===selectedPid);
    if(!player){setPwErr("Selecciona un jugador.");return;}
    if(hashPw(pw)!==player.pwHash){setPwErr("Contraseña incorrecta.");return;}
    setLocalP(predictions[player.id]||{});
    if(bonus[player.id]){setChampion(bonus[player.id].champion||"");setTopScorer(bonus[player.id].topScorer||"");}
    localStorage.setItem(STORAGE_SESSION_KEY, player.id); // remember session
    setPid(player.id); setStep("pick");
  };

  // ── Register new player ──
  const handleRegister=async()=>{
    setPwErr("");
    const t=newName.trim();
    const tl=newLastName.trim();
    if(!t){setPwErr("El nombre es requerido.");return;}
    const fullName=`${t} ${tl}`.trim();
    if(players.find(p=>`${p.name} ${p.lastName||''}`.trim().toLowerCase()===fullName.toLowerCase())){setPwErr("Ese nombre ya está registrado.");return;}
    if(newPw.length<4){setPwErr("La contraseña debe tener mínimo 4 caracteres.");return;}
    if(newPw!==newPw2){setPwErr("Las contraseñas no coinciden.");return;}
    const id=`p_${Date.now()}`;
    const newPlayer={id,name:t,lastName:tl,pwHash:hashPw(newPw)};
    const up=[...players,newPlayer];
    setPlayers(up); await saveData(STORAGE_KEY_PLAYERS,up);
    localStorage.setItem(STORAGE_SESSION_KEY, id); // remember new player too
    setPid(id); setStep("pick");
  };

  // ── Sign out ──
  const handleSignOut=()=>{
    localStorage.removeItem(STORAGE_SESSION_KEY);
    setStep("id"); setMode("existing"); setSelectedPid("");
    setPw(""); setNewName(""); setNewLastName(""); setNewPw(""); setNewPw2(""); setPwErr("");
    setPid(null); setLocalP({}); setChampion(""); setTopScorer("");
  };

  const setScore=(matchId,field,val)=>{
    const num=val===""?null:Math.max(0,Math.min(20,parseInt(val)||0));
    setLocalP(prev=>({...prev,[matchId]:{...(prev[matchId]||{homeScore:null,awayScore:null}),[field]:num}}));
  };

  const save=async(silent=false)=>{
    setSaving(true);
    const prevForPlayer=predictions[pid]||{};
    const applied={};   // matchId -> {old, new} for unlocked matches that changed
    const blocked={};   // matchId -> {attempted, kept} for locked matches with attempted edits

    GROUP_MATCHES.forEach(m=>{
      const oldVal=prevForPlayer[m.id];
      const newVal=localP[m.id];
      const oldStr=oldVal?`${oldVal.homeScore}-${oldVal.awayScore}`:null;
      const newStr=newVal?`${newVal.homeScore}-${newVal.awayScore}`:null;
      if(oldStr===newStr) return; // no change attempted

      if(isMatchLocked(m.utcTime)){
        // Match already started — block the edit, log the attempt
        blocked[m.id]={attempted:newStr, kept:oldStr};
      } else {
        applied[m.id]={old:oldStr, new:newStr};
      }
    });

    // Strip any picks for matches that have now kicked off (extra server-side safety)
    const safePreds={...localP};
    GROUP_MATCHES.forEach(m=>{
      if(isMatchLocked(m.utcTime)) delete safePreds[m.id];
    });
    // Merge safe preds with existing locked picks already stored
    const merged={...(predictions[pid]||{}), ...safePreds};
    const up={...predictions,[pid]:merged};
    setPredictions(up); await saveData(STORAGE_KEY_PREDICTIONS,up);
    // Only update bonus if tournament hasn't started yet
    if(!isBonusLocked()){
      const ub={...bonus,[pid]:{champion,topScorer}};
      setBonus(ub); await saveData(STORAGE_KEY_BONUS,ub);
    }

    // Write audit log entry if anything changed or was blocked
    if(Object.keys(applied).length>0 || Object.keys(blocked).length>0){
      const pl=players.find(p=>p.id===pid);
      const playerName=pl?`${pl.name}${pl.lastName?' '+pl.lastName:''}`:'';
      const entry={
        ts: new Date(Date.now()+_serverTimeOffset).toISOString(),
        pid, name: playerName,
        applied: Object.keys(applied).length?applied:undefined,
        blocked: Object.keys(blocked).length?blocked:undefined,
      };
      const newLogs=[...(logs||[]), entry].slice(-300); // keep last 300 entries
      setLogs(newLogs);
      await saveData(STORAGE_KEY_LOGS,newLogs);
    }

    setSaving(false);
    if(Object.keys(blocked).length>0){
      showToast("Algunos cambios no se guardaron (partido ya comenzó)", true);
    } else if(!silent){
      showToast("Predicciones guardadas!");
    }
  };

  // ── Auto-save: persist picks automatically a couple seconds after the
  // last change, and immediately if the tab is hidden/closed/navigated away
  // from — so nothing is lost even if the user never taps the Save button. ──
  const autoSaveTimer=useRef(null);
  const [autoSaveStatus,setAutoSaveStatus]=useState(""); // "" | "pending" | "saved"
  const firstLoadRef=useRef(true);

  useEffect(()=>{
    if(step!=="pick"||!pid) return;
    if(firstLoadRef.current){ firstLoadRef.current=false; return; } // skip the initial load-in
    setAutoSaveStatus("pending");
    if(autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current=setTimeout(async()=>{
      await save(true);
      setAutoSaveStatus("saved");
      setTimeout(()=>setAutoSaveStatus(""),2000);
    },1500);
    return()=>{ if(autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[localP,champion,topScorer]);

  // Flush immediately if the tab becomes hidden or the page is about to unload
  useEffect(()=>{
    if(step!=="pick"||!pid) return;
    const flush=()=>{
      if(autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      save(true);
    };
    const onVisibility=()=>{ if(document.visibilityState==="hidden") flush(); };
    document.addEventListener("visibilitychange",onVisibility);
    window.addEventListener("pagehide",flush);
    window.addEventListener("beforeunload",flush);
    return()=>{
      document.removeEventListener("visibilitychange",onVisibility);
      window.removeEventListener("pagehide",flush);
      window.removeEventListener("beforeunload",flush);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[step,pid,localP,champion,topScorer]);

  const shareWA=()=>{
    const pl=players.find(p=>p.id===pid);
    const pName=pl?`${pl.name}${pl.lastName?' '+pl.lastName:''}`:'';
    const done=Object.keys(localP).filter(id=>{const p=localP[id];return p&&p.homeScore!==null&&p.awayScore!==null;}).length;
    const msg=`🏆 Quiniela Mundial 2026\n${pName} ha enviado ${done} predicciones para el Mundial!\n¿Ya hiciste tus picks? Entra aquí: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  };

  const done=Object.keys(localP).filter(id=>{const p=localP[id];return p&&p.homeScore!==null&&p.awayScore!==null;}).length;
  const gm=GROUP_MATCHES.filter(m=>m.group===activeG);
  const currentPlayer=players.find(p=>p.id===pid);
  const pName=currentPlayer?`${currentPlayer.name}${currentPlayer.lastName?' '+currentPlayer.lastName:''}`:'';;

  const activeResults = results;
  const activeLocalP  = localP;

  if(step==="id")return(
    <div className="page">
      <div className="page-title">TUS <span className="title-accent">PICKS</span></div>
      <div className="page-sub">Sign in to manage your predictions</div>

      {/* Mode toggle */}
      <div className="mode-toggle">
        {["existing","new"].map(m=>(
          <button key={m} className={`mode-btn ${mode===m?"on":"off"}`}
            onClick={()=>{setMode(m);setPwErr("");}}>
            {m==="existing"?"🙋 Sign In":"✨ New Player"}
          </button>
        ))}
      </div>

      <div className="card" style={{maxWidth:400}}>
        {mode==="existing"?(
          <>
            {players.length===0?(
              <div style={{textAlign:"center",padding:"20px 0",color:"var(--muted)",fontSize:13}}>
                No players yet — be the first to join!<br/>
                <button className="btn btn-ghost btn-sm" style={{marginTop:10}}
                  onClick={()=>setMode("new")}>Create account →</button>
              </div>
            ):(
              <>
                <div className="field">
                  <label className="label">Select Player</label>
                  <select className="inp" value={selectedPid} onChange={e=>{setSelectedPid(e.target.value);setPwErr("");}}>
                    <option value="">Choose your name…</option>
                    {players.map(p=>(
                      <option key={p.id} value={p.id}>{p.name}{p.lastName?' '+p.lastName:''}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label className="label">Password</label>
                  <input type="password" className="inp" placeholder="Your password"
                    value={pw} onChange={e=>{setPw(e.target.value);setPwErr("");}}
                    onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                    style={{borderColor:pwErr?"var(--red)":undefined}}/>
                </div>
                {pwErr&&<div style={{color:"var(--red)",fontSize:11,marginBottom:10,fontWeight:600}}>⚠ {pwErr}</div>}
                <button className="btn btn-gold w-full" onClick={handleLogin}
                  disabled={!selectedPid||!pw}>
                  Sign In →
                </button>
              </>
            )}
          </>
        ):(
          <>
            <div className="grid2">
              <div className="field" style={{margin:0}}>
                <label className="label">Nombre</label>
                <input className="inp" placeholder="ej. Carlos"
                  value={newName} onChange={e=>{setNewName(e.target.value);setPwErr("");}}
                  style={{borderColor:pwErr&&pwErr.includes("nombre")?"var(--red)":undefined}}/>
              </div>
              <div className="field" style={{margin:0}}>
                <label className="label">Apellido</label>
                <input className="inp" placeholder="ej. López"
                  value={newLastName} onChange={e=>{setNewLastName(e.target.value);setPwErr("");}}/>
              </div>
            </div>
            <div style={{marginBottom:14}}/>
            <div className="field">
              <label className="label">Choose a Password</label>
              <input type="password" className="inp" placeholder="Min. 4 characters"
                value={newPw} onChange={e=>{setNewPw(e.target.value);setPwErr("");}}
                style={{borderColor:pwErr&&pwErr.includes("Password")?"var(--red)":undefined}}/>
            </div>
            <div className="field">
              <label className="label">Confirm Password</label>
              <input type="password" className="inp" placeholder="Repeat password"
                value={newPw2} onChange={e=>{setNewPw2(e.target.value);setPwErr("");}}
                onKeyDown={e=>e.key==="Enter"&&handleRegister()}
                style={{borderColor:pwErr&&pwErr.includes("match")?"var(--red)":undefined}}/>
            </div>
            {pwErr&&<div style={{color:"var(--red)",fontSize:11,marginBottom:10,fontWeight:600}}>⚠ {pwErr}</div>}
            <button className="btn btn-gold w-full" onClick={handleRegister}
              disabled={!newName.trim()||!newPw||!newPw2}>
              Create Account →
            </button>
          </>
        )}
      </div>
    </div>
  );

  return(
    <div className="page">
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:22}}>
        <div className="page-title" style={{marginBottom:0}}>TUS <span className="title-accent">PICKS</span></div>
        <div style={{background:"rgba(75,10,174,.1)",border:"1.5px solid rgba(75,10,174,.25)",
          borderRadius:20,padding:"4px 13px",color:"var(--purple)",fontWeight:700,fontSize:13}}>
          {pName}
        </div>
        <div style={{fontSize:12,color:"var(--muted)",marginLeft:"auto"}}>{done}/72 predicted</div>
        {autoSaveStatus==="pending"&&<span style={{fontSize:11,color:"var(--muted)"}}>💾 guardando…</span>}
        {autoSaveStatus==="saved"&&<span style={{fontSize:11,color:"var(--green)"}}>✓ guardado</span>}
        <button className="btn btn-wa btn-sm" onClick={shareWA}>📲 Invite</button>
      </div>



      {/* Bonus */}
      {(()=>{
        const bonusLocked=isBonusLocked();
        return(
          <div className="card mb16" style={{position:"relative",opacity:bonusLocked?0.85:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div className="sec-t" style={{fontSize:17,margin:0}}>🏆 Bonus Picks</div>
              {bonusLocked
                ? <span style={{fontSize:10,fontWeight:700,letterSpacing:1,background:"rgba(232,0,28,.1)",
                    color:"var(--red)",border:"1.5px solid rgba(232,0,28,.25)",borderRadius:20,padding:"2px 10px"}}>
                    🔒 LOCKED — Tournament started
                  </span>
                : <span style={{fontSize:10,fontWeight:700,letterSpacing:1,background:"rgba(168,210,0,.15)",
                    color:"#5a7a00",border:"1.5px solid rgba(168,210,0,.35)",borderRadius:20,padding:"2px 10px"}}>
                    {`Cierra ${fmtLocalTime(TOURNAMENT_START_UTC)}`}
                  </span>
              }
            </div>
            <div className="grid2" style={{alignItems:"stretch"}}>
              <div className="field" style={{margin:0,display:"flex",flexDirection:"column"}}>
                <label className="label">Champion +10pts</label>
                {bonusLocked
                  ? <div className="inp" style={{opacity:0.6,cursor:"not-allowed",display:"flex",alignItems:"center",gap:6}}>
                      {champion?<>{FLAGS[champion]||""} {champion}</>:<span style={{color:"var(--muted)"}}>No pick made</span>}
                    </div>
                  : <select className="inp" style={{flex:1}} value={champion} onChange={e=>setChampion(e.target.value)}>
                      <option value="">Pick a team…</option>
                      {ALL_TEAMS.map(t=><option key={t} value={t}>{FLAGS[t]||""} {t}</option>)}
                    </select>
                }
              </div>
              <div className="field" style={{margin:0,display:"flex",flexDirection:"column"}}>
                <label className="label">Top Scorer +5pts</label>
                {bonusLocked
                  ? <div className="inp" style={{opacity:0.6,cursor:"not-allowed"}}>
                      {topScorer||<span style={{color:"var(--muted)"}}>No pick made</span>}
                    </div>
                  : <input className="inp" style={{flex:1}} placeholder="e.g. Messi" value={topScorer} onChange={e=>setTopScorer(e.target.value)}/>
                }
              </div>
            </div>
          </div>
        );
      })()}

      {/* Group selector */}
      <div className="sec-t">Group Stage Predictions</div>
      <div style={{fontSize:11,color:"var(--muted)",marginBottom:10}}>
        ⭐ Exact score = <b style={{color:"var(--purple)"}}>3 pts</b> &nbsp;·&nbsp; ✓ Correct result = <b style={{color:"var(--red)"}}>1 pt</b> &nbsp;·&nbsp; 🔒 Predictions hidden until kick-off
      </div>
      <div className="g-tabs">
        {GROUPS.map(g=><button key={g} className={`g-tab ${activeG===g?"active":""}`} onClick={()=>setActiveG(g)}>Group {g}</button>)}
      </div>

      {gm.map(m=>{
        const pred=activeLocalP[m.id];
        const res=activeResults[m.id];
        const hasPred=pred&&pred.homeScore!==null&&pred.awayScore!==null;
        const kickoffLocked=isMatchLocked(m.utcTime);
        const hasResult=!!res;
        const isLive=liveMatches.includes(m.id);
        const pts=res&&pred?calcPoints(pred,res,m.phase):null;
        const localTime=fmtLocalTime(m.utcTime);
        return(
          <div key={m.id} className={`m-card ${hasPred&&!kickoffLocked?"pred":""} ${hasResult?"done":""} ${isLive?"live-now":""}`}>
            <div className="team">
              <span className="flag">{FLAGS[m.home]||"🏳"}</span>
              <span className="t-name">{m.home}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div className="m-meta">
                {isLive&&<div className="live-tag">🔴 LIVE</div>}
                <div>{fmtLocalDate(m.utcTime)} · {m.city}</div>
                <div>{localTime}</div>
                <div style={{opacity:0.7}}>{fmtMexicoTime(m.utcTime)}</div>
                <MatchCountdown utcTime={m.utcTime}/>
              </div>

              {/* Centre: show result if available, else show locked prediction or open input */}
              {hasResult?(
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {hasPred&&(
                    <div style={{fontSize:11,color:"var(--muted)",borderRight:"1px solid var(--border)",paddingRight:8}}>
                      {pred.homeScore}–{pred.awayScore}
                    </div>
                  )}
                  <div className={`score-show ${isLive?"goal-anim":""}`}>{res.homeScore}–{res.awayScore}</div>
                  {pts!==null&&<div className={`pts-pill ${pts===3?"pts-3":pts>0?"pts-1":"pts-0"}`}>{pts>0?`+${pts}`:"0"}</div>}
                </div>
              ):kickoffLocked?(
                // Kicked off but no result yet — show locked prediction (or dash)
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontFamily:"var(--fH)",fontSize:18,color:"var(--muted)",letterSpacing:2,opacity:0.5}}>
                      {hasPred?`${pred.homeScore} – ${pred.awayScore}`:"– : –"}
                    </div>
                  </div>
                  <div style={{fontSize:9,color:"var(--muted)",letterSpacing:1,fontWeight:700,textTransform:"uppercase"}}>
                    🔒 Locked · Awaiting result
                  </div>
                </div>
              ):(
                // Open — allow input
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <input type="number" className="score-inp" inputMode="numeric" pattern="[0-9]*" min="0" max="20"
                    value={pred?.homeScore??""} onChange={e=>setScore(m.id,"homeScore",e.target.value)} onFocus={e=>{const v=e.target.value;e.target.value="";e.target.value=v;}} placeholder="–"/>
                  <span className="sep">:</span>
                  <input type="number" className="score-inp" inputMode="numeric" pattern="[0-9]*" min="0" max="20"
                    value={pred?.awayScore??""} onChange={e=>setScore(m.id,"awayScore",e.target.value)} onFocus={e=>{const v=e.target.value;e.target.value="";e.target.value=v;}} placeholder="–"/>
                </div>
              )}
            </div>
            <div className="team away">
              <span className="flag">{FLAGS[m.away]||"🏳"}</span>
              <span className="t-name">{m.away}</span>
            </div>
          </div>
        );
      })}

      <div className="flex gap10 mt16">
        <button className="btn btn-gold" onClick={save} disabled={saving}>
          {saving?"Saving…":"💾 Save Predictions"}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );
}


// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
function LeaderboardView({leaderboard,predictions,results,showToast}){
  const[view,setView]=useState("table");
  const[selectedP,setSelectedP]=useState(null);

  // Auto-fill H2H Player A with the logged-in user
  const sessionPid=localStorage.getItem(STORAGE_SESSION_KEY)||"";
  const[h2hA,setH2hA]=useState(sessionPid);
  const[h2hB,setH2hB]=useState("");
  const[h2hGroup,setH2hGroup]=useState("A");
  const medals=["🥇","🥈","🥉"];
  const done=GROUP_MATCHES.filter(m=>results[m.id]);
  const hasR=done.length>0;
  const isPreview=leaderboard.length===0||!hasR;
  const displayBoard=leaderboard;
  const activePredictions=predictions;
  const activeResults=results;
  const activeDone=done;

  const shareWA=()=>{
    if(leaderboard.length===0){showToast("No players yet!",true);return;}
    const top3=leaderboard.slice(0,3).map((p,i)=>`${medals[i]} ${p.name}${p.lastName?' '+p.lastName:''}: ${p.total} pts`).join("\n");
    const msg=`🏆 Quiniela Mundial 2026 — Standings\n${top3}\n\n¡Entra a ver el tablero completo!\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  };

  const podColors=[
    {bar:"rgba(232,0,28,.08)",border:"rgba(232,0,28,.35)",pts:"var(--red)"},
    {bar:"rgba(75,10,174,.07)",border:"rgba(75,10,174,.3)",pts:"var(--purple)"},
    {bar:"rgba(168,210,0,.1)",border:"rgba(168,210,0,.4)",pts:"#5a7a00"},
  ];

  // ── Player detail view ──
  if(view==="detail"&&selectedP){
    const p=leaderboard.find(x=>x.id===selectedP);
    if(!p)return(<div className="page"><button className="btn btn-ghost btn-sm" style={{marginBottom:16}} onClick={()=>{setView("table");setSelectedP(null);}}>← Volver</button><div className="empty"><div className="empty-i">👤</div>Jugador no encontrado.</div></div>);
    const fullName=`${p.name}${p.lastName?' '+p.lastName:''}`;
    const startedMatches=GROUP_MATCHES.filter(m=>isMatchLocked(m.utcTime));
    const withResults=startedMatches.filter(m=>activeResults[m.id]);
    const locked_no_result=startedMatches.filter(m=>!activeResults[m.id]);
    return(
      <div className="page">
        <button className="btn btn-ghost btn-sm" style={{marginBottom:16}}
          onClick={()=>{setView("table");setSelectedP(null);}}>← Volver</button>
        <div className="page-title" style={{fontSize:32}}>{fullName}</div>
        <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
          <div style={{background:"var(--white)",border:"1.5px solid rgba(232,0,28,.2)",borderRadius:8,
            padding:"10px 16px",textAlign:"center",minWidth:80}}>
            <div style={{fontFamily:"var(--fH)",fontSize:28,color:"var(--red)",fontWeight:900}}>{p.total}</div>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>Puntos</div>
          </div>
          <div style={{background:"var(--white)",border:"1.5px solid rgba(168,210,0,.3)",borderRadius:8,
            padding:"10px 16px",textAlign:"center",minWidth:80}}>
            <div style={{fontFamily:"var(--fH)",fontSize:28,color:"#5a7a00",fontWeight:900}}>{p.exact}</div>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>Exactos ⭐</div>
          </div>
          <div style={{background:"var(--white)",border:"1.5px solid rgba(75,10,174,.2)",borderRadius:8,
            padding:"10px 16px",textAlign:"center",minWidth:80}}>
            <div style={{fontFamily:"var(--fH)",fontSize:28,color:"var(--purple)",fontWeight:900}}>{p.correct}</div>
            <div style={{fontSize:10,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>Correctos ✓</div>
          </div>
        </div>

        {withResults.length>0&&(
          <>
            <div className="sec-t" style={{fontSize:16,marginBottom:10}}>Partidos jugados</div>
            {withResults.map(m=>{
              const pred=activePredictions[p.id]?.[m.id];
              const res=activeResults[m.id];
              const pts=pred&&res?calcPoints(pred,res,m.phase):null;
              const hasPred=pred&&pred.homeScore!==null&&pred.awayScore!==null;
              return(
                <div key={m.id} style={{background:"var(--white)",border:"1.5px solid rgba(0,0,0,.07)",
                  borderRadius:8,padding:"11px 14px",marginBottom:8,
                  borderLeft:`4px solid ${pts===3?"#5a7a00":pts>0?"var(--purple)":"rgba(0,0,0,.15)"}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <div style={{flex:1,fontSize:13,fontWeight:600}}>
                      {FLAGS[m.home]} {m.home} <span style={{color:"var(--muted)"}}>vs</span> {FLAGS[m.away]} {m.away}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {hasPred?(
                        <div style={{fontSize:12,color:"var(--muted)"}}>
                          Tu pick: <strong style={{color:"var(--dark)"}}>{pred.homeScore}–{pred.awayScore}</strong>
                        </div>
                      ):<div style={{fontSize:12,color:"var(--muted)"}}>Sin pick</div>}
                      <div style={{fontFamily:"var(--fH)",fontSize:18,color:"var(--red)",fontWeight:900,minWidth:40,textAlign:"center"}}>
                        {res.homeScore}–{res.awayScore}
                      </div>
                      <div className={`pts-pill ${pts===3?"pts-3":pts>0?"pts-1":"pts-0"}`} style={{fontSize:11,width:32,height:32}}>
                        {pts!==null?(pts>0?`+${pts}`:"0"):"—"}
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:"var(--muted)",marginTop:4}}>{fmtLocalDate(m.utcTime)} · {m.city}</div>
                </div>
              );
            })}
          </>
        )}

        {locked_no_result.length>0&&(
          <>
            <div className="sec-t" style={{fontSize:16,marginBottom:10,marginTop:20}}>En curso / Sin resultado aún</div>
            {locked_no_result.map(m=>{
              const pred=activePredictions[p.id]?.[m.id];
              const hasPred=pred&&pred.homeScore!==null&&pred.awayScore!==null;
              return(
                <div key={m.id} style={{background:"var(--white)",border:"1.5px dashed rgba(0,0,0,.1)",
                  borderRadius:8,padding:"11px 14px",marginBottom:8,opacity:0.7}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1,fontSize:13,fontWeight:600}}>
                      {FLAGS[m.home]} {m.home} <span style={{color:"var(--muted)"}}>vs</span> {FLAGS[m.away]} {m.away}
                    </div>
                    {hasPred?(
                      <div style={{fontSize:12,color:"var(--muted)"}}>
                        🔒 <strong style={{color:"var(--dark)"}}>{pred.homeScore}–{pred.awayScore}</strong>
                      </div>
                    ):<div style={{fontSize:12,color:"var(--muted)"}}>Sin pick</div>}
                    <div style={{fontFamily:"var(--fH)",fontSize:16,color:"var(--muted)"}}>?–?</div>
                  </div>
                  <div style={{fontSize:10,color:"var(--muted)",marginTop:4}}>{fmtLocalDate(m.utcTime)} · {m.city}</div>
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  }

  // ── Head to head view ──
  if(view==="h2h"){
    const pA=leaderboard.find(x=>x.id===h2hA);
    const pB=leaderboard.find(x=>x.id===h2hB);
    const ready=pA&&pB&&h2hA!==h2hB;
    const nameA=pA?`${pA.name}${pA.lastName?' '+pA.lastName:''}`:"";
    const nameB=pB?`${pB.name}${pB.lastName?' '+pB.lastName:''}`:"";
    const matchedM=activeDone.filter(m=>activeResults[m.id]);

    // Build rows for ALL matches across all 3 states
    let winsA=0,winsB=0,draws=0;

    // Only count finished matches for the score summary
    const finishedRows=GROUP_MATCHES.filter(m=>activeResults[m.id]).map(m=>{
      const predA=activePredictions[h2hA]?.[m.id];
      const predB=activePredictions[h2hB]?.[m.id];
      const res=activeResults[m.id];
      const ptsA=predA&&res?calcPoints(predA,res,m.phase):0;
      const ptsB=predB&&res?calcPoints(predB,res,m.phase):0;
      if(ptsA>ptsB)winsA++; else if(ptsB>ptsA)winsB++; else draws++;
      return{m,predA,predB,res,ptsA,ptsB,state:"finished"};
    });

    // Kicked off but no result yet
    const lockedRows=GROUP_MATCHES.filter(m=>isMatchLocked(m.utcTime)&&!activeResults[m.id]).map(m=>({
      m, predA:activePredictions[h2hA]?.[m.id],
      predB:activePredictions[h2hB]?.[m.id],
      res:null, ptsA:0, ptsB:0, state:"locked"
    }));

    // Upcoming — not kicked off yet, picks visible to both
    const upcomingRows=GROUP_MATCHES.filter(m=>!isMatchLocked(m.utcTime)).map(m=>({
      m, predA:activePredictions[h2hA]?.[m.id],
      predB:activePredictions[h2hB]?.[m.id],
      res:null, ptsA:0, ptsB:0, state:"upcoming"
    }));

    const allRows=[...finishedRows,...lockedRows,...upcomingRows];
    const groupRows=allRows.filter(r=>r.m.group===h2hGroup);

    return(
      <div className="page">
        <button className="btn btn-ghost btn-sm" style={{marginBottom:16}} onClick={()=>setView("table")}>← Volver</button>
        <div className="page-title" style={{fontSize:28}}>HEAD <span className="title-accent">TO HEAD</span></div>

        <div className="grid2" style={{marginBottom:20,alignItems:"stretch"}}>
          <div className="field" style={{margin:0,display:"flex",flexDirection:"column"}}>
            <label className="label">Jugador A (tú)</label>
            {sessionPid&&leaderboard.find(x=>x.id===sessionPid)?(
              <div className="inp" style={{flex:1,background:"rgba(0,165,80,.07)",
                border:"1.5px solid rgba(0,165,80,.3)",color:"var(--green)",fontWeight:700,
                display:"flex",alignItems:"center",gap:6}}>
                👤 {leaderboard.find(x=>x.id===sessionPid)?.name}{' '}
                {leaderboard.find(x=>x.id===sessionPid)?.lastName||''}
              </div>
            ):(
              <select className="inp" style={{flex:1}} value={h2hA} onChange={e=>setH2hA(e.target.value)}>
                <option value="">Selecciona…</option>
                {leaderboard.map(p=><option key={p.id} value={p.id}>{p.name}{p.lastName?' '+p.lastName:''}</option>)}
              </select>
            )}
          </div>
          <div className="field" style={{margin:0,display:"flex",flexDirection:"column"}}>
            <label className="label">Jugador B</label>
            <select className="inp" style={{flex:1}} value={h2hB} onChange={e=>setH2hB(e.target.value)}>
              <option value="">Selecciona…</option>
              {leaderboard.map(p=><option key={p.id} value={p.id}>{p.name}{p.lastName?' '+p.lastName:''}</option>)}
            </select>
          </div>
        </div>

        {ready&&(
          <>
            {/* Score summary */}
            <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:12,
              background:"var(--white)",border:"1.5px solid rgba(0,0,0,.07)",borderRadius:10,
              padding:"16px 20px",marginBottom:20,boxShadow:"0 2px 10px rgba(0,0,0,.05)"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"var(--fH)",fontSize:32,color:"var(--red)",fontWeight:900}}>{winsA}</div>
                <div style={{fontWeight:700,fontSize:13,marginTop:2}}>{nameA}</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>{pA.total} pts total</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"var(--fH)",fontSize:13,color:"var(--muted)",letterSpacing:2}}>VS</div>
                <div style={{fontFamily:"var(--fH)",fontSize:20,color:"var(--muted)",marginTop:4}}>{draws}</div>
                <div style={{fontSize:10,color:"var(--muted)"}}>empates</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"var(--fH)",fontSize:32,color:"var(--purple)",fontWeight:900}}>{winsB}</div>
                <div style={{fontWeight:700,fontSize:13,marginTop:2}}>{nameB}</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>{pB.total} pts total</div>
              </div>
            </div>

            {/* Legend */}
            <div style={{display:"flex",gap:12,marginBottom:14,fontSize:11,color:"var(--muted)",flexWrap:"wrap"}}>
              <span>⭐ Exacto = 3pts</span>
              <span>✓ Resultado = 1pt</span>
              <span>🔒 Cerrado sin resultado</span>
              <span>⏱ Por jugarse</span>
            </div>

            {/* Group tabs */}
            <div className="g-tabs">
              {GROUPS.map(g=>{
                const cnt=allRows.filter(r=>r.m.group===g&&r.state==="finished").length;
                return(
                  <button key={g} className={`g-tab ${h2hGroup===g?"active":""}`}
                    onClick={()=>setH2hGroup(g)}>
                    Grp {g}{cnt>0?` ✓${cnt}`:""}
                  </button>
                );
              })}
            </div>

            {/* Match rows */}
            {groupRows.map(({m,predA,predB,res,ptsA,ptsB,state})=>{
              const hasPredA=predA&&predA.homeScore!==null&&predA.awayScore!==null;
              const hasPredB=predB&&predB.homeScore!==null&&predB.awayScore!==null;
              const borderColor=state==="finished"
                ?(ptsA>0||ptsB>0?"rgba(0,0,0,.1)":"rgba(0,0,0,.06)")
                :state==="locked"?"rgba(75,10,174,.2)":"rgba(0,0,0,.06)";

              return(
                <div key={m.id} style={{background:"var(--white)",
                  border:`1.5px solid ${borderColor}`,
                  borderRadius:8,padding:"10px 14px",marginBottom:8,
                  opacity:state==="upcoming"?0.75:1}}>

                  {/* Match header */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                    marginBottom:8,flexWrap:"wrap",gap:4}}>
                    <div style={{fontSize:12,fontWeight:700,color:"var(--dark)"}}>
                      {FLAGS[m.home]} {m.home} vs {FLAGS[m.away]} {m.away}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {state==="finished"&&(
                        <div style={{fontFamily:"var(--fH)",fontSize:18,color:"var(--red)",
                          fontWeight:900,letterSpacing:2}}>
                          {res.homeScore}–{res.awayScore}
                        </div>
                      )}
                      {state==="locked"&&(
                        <div style={{fontSize:10,fontWeight:700,color:"var(--purple)",
                          background:"rgba(75,10,174,.08)",border:"1px solid rgba(75,10,174,.2)",
                          borderRadius:4,padding:"2px 7px",letterSpacing:1}}>🔒 SIN RESULTADO</div>
                      )}
                      {state==="upcoming"&&(
                        <div style={{fontSize:10,fontWeight:700,color:"var(--muted)",
                          background:"rgba(0,0,0,.04)",border:"1px solid rgba(0,0,0,.08)",
                          borderRadius:4,padding:"2px 7px",letterSpacing:1}}>⏱ {fmtLocalDate(m.utcTime)}</div>
                      )}
                    </div>
                  </div>

                  {/* Picks comparison */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 28px 1fr",alignItems:"center",gap:6}}>

                    {/* Player A pick */}
                    <div style={{textAlign:"center",padding:"6px 8px",borderRadius:6,
                      background:state==="finished"&&ptsA>ptsB?"rgba(232,0,28,.06)":
                                 state==="finished"&&ptsB>ptsA?"rgba(0,0,0,.02)":"rgba(0,0,0,.02)"}}>
                      <div style={{fontSize:10,color:"var(--muted)",marginBottom:3,
                        textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{nameA}</div>
                      <div style={{fontFamily:"var(--fH)",fontSize:state==="upcoming"?13:16,fontWeight:700,
                        color:state==="finished"?(ptsA>0?"var(--red)":"var(--muted)"):"var(--dark)"}}>
                        {state==="upcoming"
                          ? hasPredA
                            ? `${predA.homeScore}–${predA.awayScore}`
                            : <span style={{fontSize:12,color:"var(--muted)"}}>sin pick</span>
                          : hasPredA?`${predA.homeScore}–${predA.awayScore}`:"—"
                        }
                      </div>
                      {state==="finished"&&(
                        <div className={`pts-pill ${ptsA===3?"pts-3":ptsA>0?"pts-1":"pts-0"}`}
                          style={{fontSize:10,margin:"4px auto"}}>
                          {ptsA>0?`+${ptsA}`:"0"}
                        </div>
                      )}
                    </div>

                    {/* Arrow / VS */}
                    <div style={{textAlign:"center",fontFamily:"var(--fH)",fontSize:14,
                      color:state==="finished"?(ptsA>ptsB?"var(--red)":ptsB>ptsA?"var(--purple)":"var(--muted)"):"var(--muted)"}}>
                      {state==="finished"?(ptsA>ptsB?"←":ptsB>ptsA?"→":"="):"vs"}
                    </div>

                    {/* Player B pick */}
                    <div style={{textAlign:"center",padding:"6px 8px",borderRadius:6,
                      background:state==="finished"&&ptsB>ptsA?"rgba(75,10,174,.06)":
                                 state==="finished"&&ptsA>ptsB?"rgba(0,0,0,.02)":"rgba(0,0,0,.02)"}}>
                      <div style={{fontSize:10,color:"var(--muted)",marginBottom:3,
                        textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{nameB}</div>
                      <div style={{fontFamily:"var(--fH)",fontSize:state==="upcoming"?13:16,fontWeight:700,
                        color:state==="finished"?(ptsB>0?"var(--purple)":"var(--muted)"):"var(--dark)"}}>
                        {state==="upcoming"
                          ? <span style={{fontSize:12,color:"var(--muted)"}}>🔒 oculto</span>
                          : hasPredB?`${predB.homeScore}–${predB.awayScore}`:"—"
                        }
                      </div>
                      {state==="finished"&&(
                        <div className={`pts-pill ${ptsB===3?"pts-3":ptsB>0?"pts-1":"pts-0"}`}
                          style={{fontSize:10,margin:"4px auto"}}>
                          {ptsB>0?`+${ptsB}`:"0"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        {leaderboard.length===0
          ?<div className="empty"><div className="empty-i">⚔️</div>Aún no hay jugadores registrados.</div>
          :!ready&&<div className="empty"><div className="empty-i">⚔️</div>Selecciona dos jugadores para comparar.</div>}
      </div>
    );
  }

  // ── Main table view ──
  return(
    <div className="page">
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:6}}>
        <div className="page-title" style={{marginBottom:0}}>TABLA <span className="title-accent">GENERAL</span></div>
        <button className="btn btn-wa btn-sm" onClick={shareWA}>📲 Share</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>{setView("h2h");setH2hA(sessionPid);setH2hB("");setH2hGroup("A");}}>
          ⚔️ Head to Head
        </button>
      </div>
      <div className="page-sub">
        {isPreview?"Preview — live standings appear once the tournament begins":`${done.length} matches played · ${leaderboard.length} players`}
      </div>


      {/* Podium */}
      {leaderboard.length>=2&&(
        <div className="podium">
          {[1,0,2].filter(i=>displayBoard[i]).map(i=>{
            const p=displayBoard[i];
            const h=i===0?100:i===1?76:58;
            const col=podColors[i];
            return(
              <div key={p.id} className="pod-item">
                <div className="pod-medal">{medals[i]}</div>
                <div className="pod-name" style={{fontFamily:"var(--fH)",fontSize:i===0?14:12,
                  letterSpacing:1,textTransform:"uppercase",color:i===0?"var(--red)":i===1?"var(--purple)":"#5a7a00"}}>
                  {p.name}{p.lastName?' '+p.lastName:''}
                </div>
                <div className="pod-bar" style={{height:h,background:col.bar,border:`1px solid ${col.border}`}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"var(--fH)",fontSize:i===0?34:26,fontWeight:900,color:col.pts,lineHeight:1}}>{p.total}</div>
                    <div style={{fontSize:9,color:"var(--muted)",letterSpacing:1,textTransform:"uppercase"}}>pts</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Header */}
      <div className="lb-hdr">
        <div>#</div><div>Jugador</div>
        <div style={{textAlign:"center"}}><span className="full">Exactos</span><span className="abbr">⭐</span></div>
        <div style={{textAlign:"center"}}><span className="full">Correctos</span><span className="abbr">✓</span></div>
        <div style={{textAlign:"right"}}>Pts</div>
      </div>

      {displayBoard.map((p,i)=>(
        <div key={p.id}>
          <div
            className={`lb-row ${i===0?"r1":i===1?"r2":i===2?"r3":""}`}
            onClick={()=>{setSelectedP(p.id);setView("detail");}}

          >
            <div className={`rn ${i===0?"g":""}`} style={{fontSize:i<3?20:15}}>
              {medals[i]||i+1}
            </div>
            <div>
              <div className="p-name">{p.name}{p.lastName?' '+p.lastName:''}</div>
              <div style={{fontSize:10,color:"var(--muted)"}}>Ver picks →</div>
            </div>
            <div className="stat" style={{color:p.exact>=4?"#5a7a00":"var(--muted)"}}>{p.exact}</div>
            <div className="stat">{p.correct}</div>
            <div className="pts-big">{p.total}</div>
          </div>
        </div>
      ))}

      {leaderboard.length===0&&(
        <div className="empty">
          <div className="empty-i">🏆</div>
          <div style={{fontFamily:"var(--fH)",fontSize:18,letterSpacing:1,marginBottom:8}}>
            NADIE REGISTRADO AÚN
          </div>
          <div style={{fontSize:13}}>Los jugadores aparecerán aquí una vez que se registren.</div>
        </div>
      )}
      {leaderboard.length>0&&!hasR&&(
        <div className="empty">
          <div className="empty-i">⏳</div>
          <div style={{fontFamily:"var(--fH)",fontSize:18,letterSpacing:1,marginBottom:8}}>
            EL TORNEO AÚN NO EMPIEZA
          </div>
          <div style={{fontSize:13}}>La tabla se actualiza con el primer partido el <strong>11 de junio</strong>.</div>
          <div style={{marginTop:12,fontSize:12,color:"var(--muted)"}}>
            {leaderboard.length} jugador{leaderboard.length!==1?"es":""} registrado{leaderboard.length!==1?"s":""}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── KNOCKOUT VIEW ────────────────────────────────────────────────────────────
function KnockoutView({isAdmin,showToast}){
  return(
    <div className="page">
      <div className="page-title">RONDA <span className="title-accent">ELIMINATORIA</span></div>
      <div className="page-sub">Starts after the group stage — June 28, 2026</div>

      <div className="ko-lock">
        <div className="ko-lock-icon">🔒</div>
        <div style={{fontFamily:"var(--fH)",fontSize:22,letterSpacing:2,marginBottom:8}}>
          COMING SOON
        </div>
        <div style={{fontSize:13,marginBottom:16}}>
          The knockout bracket unlocks after the group stage ends on June 27.
        </div>
        <div style={{fontSize:12,color:"var(--muted)"}}>
          You'll be able to predict winners for all 5 knockout rounds:
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginTop:14}}>
          {KNOCKOUT_ROUNDS.map(r=>(
            <div key={r.id} style={{background:"rgba(255,255,255,.05)",border:"1px solid var(--border)",
              borderRadius:8,padding:"6px 14px",fontSize:11,fontWeight:700,letterSpacing:1}}>
              {r.label} <span style={{color:"var(--red)"}}>+{r.pts}pts</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:24,padding:16,background:"rgba(0,194,212,.05)",
        border:"1px solid rgba(0,194,212,.12)",borderRadius:10,fontSize:12}}>
        <div style={{fontWeight:700,marginBottom:6,color:"var(--purple)"}}>📋 Knockout Scoring Rules</div>
        <div style={{color:"var(--muted)",lineHeight:1.8}}>
          Round of 32: 2 pts per correct winner (+2 bonus for exact score)<br/>
          Round of 16: 4 pts (+2 bonus)<br/>
          Quarterfinals: 6 pts (+2 bonus)<br/>
          Semifinals: 8 pts (+2 bonus)<br/>
          Final: 10 pts (+2 bonus)
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView({players,setPlayers,results,setResults,predictions,setPredictions,bonus,setBonus,showToast,doFetch,logs}){
  const[activeG,setActiveG]=useState("A");
  const[localR,setLocalR]=useState({...results});
  const[saving,setSaving]=useState(false);
  const[fetching,setFetching]=useState(false);
  const[overridePid,setOverridePid]=useState(null);
  const[overrideGroup,setOverrideGroup]=useState("A");
  const[overridePreds,setOverridePreds]=useState({});
  const[overrideBonus,setOverrideBonus]=useState({});
  const[savingOverride,setSavingOverride]=useState(false);

  // Sync localR when results changes (from API auto-fetch)
  useEffect(()=>{setLocalR(r=>({...results,...r}));},[results]);

  const setScore=(id,field,val)=>{
    const num=val===""?null:Math.max(0,Math.min(20,parseInt(val)||0));
    setLocalR(prev=>({...prev,[id]:{...(prev[id]||{homeScore:null,awayScore:null,_fromApi:false}),[field]:num,_fromApi:false}}));
  };

  const save=async()=>{
    setSaving(true);
    setResults(localR);
    await saveData(STORAGE_KEY_RESULTS,localR);
    // Verify the save actually round-tripped to the backend
    const check=await loadData(STORAGE_KEY_RESULTS);
    const ok = check && JSON.stringify(check)===JSON.stringify(localR);
    setSaving(false);
    if(ok){
      showToast("Results saved!");
    }else{
      showToast("⚠️ No se pudo confirmar el guardado — revisa tu conexión e intenta de nuevo", true);
    }
  };

  const manualFetch=async()=>{
    setFetching(true);
    await doFetch();
    setFetching(false);
    showToast("Synced with live API!");
  };

  const removePlayer=async(pid,predictions,bonus,setPredictions,setBonus)=>{
    // Remove from players list
    const up=players.filter(p=>p.id!==pid);
    setPlayers(up);
    await saveData(STORAGE_KEY_PLAYERS,up);

    // Remove their predictions
    const upPreds={...predictions};
    delete upPreds[pid];
    setPredictions(upPreds);
    await saveData(STORAGE_KEY_PREDICTIONS,upPreds);

    // Remove their bonus picks
    const upBonus={...bonus};
    delete upBonus[pid];
    setBonus(upBonus);
    await saveData(STORAGE_KEY_BONUS,upBonus);

    showToast("Jugador y sus datos eliminados");
  };

  const gm=GROUP_MATCHES.filter(m=>m.group===activeG);
  const completed=GROUP_MATCHES.filter(m=>{const r=localR[m.id];return r&&r.homeScore!==null&&r.awayScore!==null;}).length;

  return(
    <div className="page">
      <div className="page-title">ADMIN <span className="title-accent">PANEL</span></div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <div style={{fontSize:13,color:"var(--muted)"}}>{completed}/{GROUP_MATCHES.length} results entered</div>
        <div className="api-badge">🔄 Auto-sync every 60s</div>
        <button className="btn btn-ghost btn-sm" onClick={manualFetch} disabled={fetching}>
          {fetching?"Syncing…":"⚡ Sync Now"}
        </button>
      </div>

      {/* Players */}
      <div className="sec-t">Players ({players.length})</div>
      <div className="card mb16">
        {players.length===0?<div style={{color:"var(--muted)",fontSize:12}}>No players yet.</div>
          :players.map(p=>{
            const cnt=Object.keys(predictions[p.id]||{}).filter(id=>{
              const pr=predictions[p.id][id];return pr&&pr.homeScore!==null&&pr.awayScore!==null;
            }).length;
            return(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",
                background:"rgba(0,0,0,.2)",borderRadius:8,marginBottom:6}}>
                <div style={{flex:1,fontWeight:600}}>{p.name}{p.lastName?' '+p.lastName:''}</div>
                {p.pwHash
                  ? <div style={{fontSize:9,fontWeight:700,letterSpacing:1,color:"var(--green)",
                      background:"rgba(0,165,80,.1)",border:"1.5px solid rgba(0,165,80,.2)",
                      borderRadius:20,padding:"2px 8px"}}>🔑 PW SET</div>
                  : <div style={{fontSize:9,fontWeight:700,letterSpacing:1,color:"var(--muted)",
                      background:"rgba(255,255,255,.05)",border:"1px solid var(--border)",
                      borderRadius:20,padding:"2px 8px"}}>NO PW</div>
                }
                <div style={{fontSize:11,color:"var(--muted)"}}>{cnt} picks</div>
                <button className="btn btn-ghost btn-sm" style={{padding:"3px 9px"}}
                  onClick={()=>setOverridePid(overridePid===p.id?null:p.id)}>
                  {overridePid===p.id?"Cerrar":"✏️ Editar"}
                </button>
                <button className="btn btn-ghost btn-sm" style={{color:"var(--red)",borderColor:"rgba(230,57,70,.25)",padding:"3px 9px"}}
                  onClick={()=>removePlayer(p.id,predictions,bonus,setPredictions,setBonus)}>✕</button>
              </div>
            );
          })}
      </div>

      {/* Player Override panel */}
      {overridePid && (()=>{
        const p=players.find(x=>x.id===overridePid);
        if(!p) return null;
        const fullName=`${p.name}${p.lastName?' '+p.lastName:''}`;
        const playerPreds=overridePreds[overridePid] || predictions[overridePid] || {};
        const playerBonus=overrideBonus[overridePid] || bonus[overridePid] || {champion:"",topScorer:""};

        const setOverrideScore=(mid,field,val)=>{
          const num=val===""?null:Math.max(0,Math.min(20,parseInt(val)||0));
          setOverridePreds(prev=>({
            ...prev,
            [overridePid]:{
              ...(prev[overridePid]||predictions[overridePid]||{}),
              [mid]:{...((prev[overridePid]||predictions[overridePid]||{})[mid]||{homeScore:null,awayScore:null}),[field]:num}
            }
          }));
        };

        const setOverrideBonusField=(field,val)=>{
          setOverrideBonus(prev=>({
            ...prev,
            [overridePid]:{...(prev[overridePid]||bonus[overridePid]||{champion:"",topScorer:""}),[field]:val}
          }));
        };

        const saveOverride=async()=>{
          setSavingOverride(true);
          // Predictions
          const newPreds={...predictions,[overridePid]:playerPreds};
          setPredictions(newPreds);
          await saveData(STORAGE_KEY_PREDICTIONS,newPreds);
          // Bonus
          const newBonus={...bonus,[overridePid]:playerBonus};
          setBonus(newBonus);
          await saveData(STORAGE_KEY_BONUS,newBonus);
          // Verify the predictions save actually round-tripped (GAS can silently fail)
          const check=await loadData(STORAGE_KEY_PREDICTIONS);
          const ok = check && JSON.stringify(check[overridePid]||{})===JSON.stringify(playerPreds);
          // Log this manual override for the audit trail, including what changed
          const prevPreds=predictions[overridePid]||{};
          const changedMatches={};
          GROUP_MATCHES.forEach(m=>{
            const oldV=prevPreds[m.id];
            const newV=playerPreds[m.id];
            const oldStr=oldV?`${oldV.homeScore}-${oldV.awayScore}`:null;
            const newStr=newV?`${newV.homeScore}-${newV.awayScore}`:null;
            if(oldStr!==newStr) changedMatches[m.id]={old:oldStr,new:newStr};
          });
          const prevBonus=bonus[overridePid]||{};
          const bonusChanged = prevBonus.champion!==playerBonus.champion || prevBonus.topScorer!==playerBonus.topScorer;

          const entry={
            ts:new Date(Date.now()+_serverTimeOffset).toISOString(),
            pid:overridePid, name:fullName,
            adminOverride:true,
            applied: Object.keys(changedMatches).length?changedMatches:undefined,
            bonusChange: bonusChanged?{
              champion:`${prevBonus.champion||"—"} → ${playerBonus.champion||"—"}`,
              topScorer:`${prevBonus.topScorer||"—"} → ${playerBonus.topScorer||"—"}`,
            }:undefined,
          };
          const newLogs=[...(logs||[]),entry].slice(-300);
          await saveData(STORAGE_KEY_LOGS,newLogs);
          setSavingOverride(false);
          if(ok){
            showToast(`Picks de ${fullName} actualizados`);
          }else{
            showToast(`⚠️ No se pudo confirmar el guardado para ${fullName} — intenta de nuevo`, true);
          }
          setOverridePid(null);
          setOverridePreds(prev=>{const c={...prev};delete c[overridePid];return c;});
          setOverrideBonus(prev=>{const c={...prev};delete c[overridePid];return c;});
        };

        return(
          <div style={{background:"rgba(75,10,174,.04)",border:"1.5px solid rgba(75,10,174,.2)",
            borderRadius:10,padding:"16px 18px",marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:"var(--fH)",fontSize:15,fontWeight:800,color:"var(--purple)"}}>
                ✏️ EDITANDO: {fullName}
              </div>
              <div style={{fontSize:10,color:"var(--muted)"}}>Esto omite el bloqueo por horario</div>
            </div>

            {/* Bonus picks override */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div className="field" style={{margin:0}}>
                <label className="label">Campeón</label>
                <select className="inp" value={playerBonus.champion||""} onChange={e=>setOverrideBonusField("champion",e.target.value)}>
                  <option value="">Sin pick</option>
                  {ALL_TEAMS.map(t=><option key={t} value={t}>{FLAGS[t]||""} {t}</option>)}
                </select>
              </div>
              <div className="field" style={{margin:0}}>
                <label className="label">Goleador</label>
                <input className="inp" placeholder="ej. Mbappé" value={playerBonus.topScorer||""}
                  onChange={e=>setOverrideBonusField("topScorer",e.target.value)}/>
              </div>
            </div>

            {/* Match predictions override, grouped by group tabs */}
            <div className="g-tabs" style={{marginBottom:10}}>
              {GROUPS.map(g=>(
                <button key={g} className={`g-tab ${overrideGroup===g?"active":""}`}
                  onClick={()=>setOverrideGroup(g)}>Grp {g}</button>
              ))}
            </div>
            {GROUP_MATCHES.filter(m=>m.group===overrideGroup).map(m=>{
              const pred=playerPreds[m.id];
              return(
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,
                  background:"var(--white)",borderRadius:8,padding:"8px 12px",marginBottom:6}}>
                  <div style={{flex:1,fontSize:12}}>
                    {FLAGS[m.home]} {m.home} <span style={{color:"var(--muted)"}}>vs</span> {m.away} {FLAGS[m.away]}
                  </div>
                  <input type="number" className="score-inp" inputMode="numeric" pattern="[0-9]*" min="0" max="20"
                    style={{width:40}}
                    value={pred?.homeScore??""} onChange={e=>setOverrideScore(m.id,"homeScore",e.target.value)}
                    onFocus={e=>{const v=e.target.value;e.target.value="";e.target.value=v;}} placeholder="–"/>
                  <span className="sep">:</span>
                  <input type="number" className="score-inp" inputMode="numeric" pattern="[0-9]*" min="0" max="20"
                    style={{width:40}}
                    value={pred?.awayScore??""} onChange={e=>setOverrideScore(m.id,"awayScore",e.target.value)}
                    onFocus={e=>{const v=e.target.value;e.target.value="";e.target.value=v;}} placeholder="–"/>
                </div>
              );
            })}

            <div className="flex gap10 mt16">
              <button className="btn btn-gold" onClick={saveOverride} disabled={savingOverride}>
                {savingOverride?"Guardando…":"💾 Guardar cambios"}
              </button>
              <button className="btn btn-ghost" onClick={()=>setOverridePid(null)}>Cancelar</button>
            </div>
          </div>
        );
      })()}

      {/* Results */}
      <div className="sec-t">Enter / Override Results</div>
      <div style={{fontSize:11,color:"var(--muted)",marginBottom:12}}>
        ⚡ Results auto-populate from the live API. You can override manually if needed.
      </div>
      <div className="g-tabs">
        {GROUPS.map(g=>{
          const cnt=GROUP_MATCHES.filter(m=>m.group===g&&localR[m.id]?.homeScore!==null&&localR[m.id]?.awayScore!==null).length;
          return<button key={g} className={`g-tab ${activeG===g?"active":""}`} onClick={()=>setActiveG(g)}>
            Grp {g} {cnt>0?`(${cnt}/6)`:""}</button>;
        })}
      </div>

      {gm.map(m=>{
        const r=localR[m.id];
        const savedR=results[m.id];
        const isApi=r?._fromApi;
        const localTime=fmtLocalTime(m.utcTime);
        const status=matchStatus(m.utcTime);
        const isDirty = JSON.stringify({h:r?.homeScore??null,a:r?.awayScore??null})
                      !== JSON.stringify({h:savedR?.homeScore??null,a:savedR?.awayScore??null});
        return(
          <div key={m.id} className={`m-card ${r?.homeScore!==null&&r?.awayScore!==null?"done":""}`}
            style={isDirty?{outline:"2px solid #D9A400",outlineOffset:"2px"}:undefined}>
            <div className="team">
              <span className="flag">{FLAGS[m.home]||"🏳"}</span>
              <span className="t-name">{m.home}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div className="m-meta">
                {status==="live"&&<div className="live-tag">🔴 LIVE</div>}
                <div>{fmtLocalDate(m.utcTime)} · {m.city}</div>
                <div>{localTime}</div>
                <div style={{opacity:0.7}}>{fmtMexicoTime(m.utcTime)}</div>
                {isApi&&<div style={{color:"var(--green)",fontSize:9,fontWeight:700}}>API ✓</div>}
                {isDirty&&<div style={{color:"#D9A400",fontSize:9,fontWeight:700,letterSpacing:1}}>● SIN GUARDAR</div>}
                <MatchCountdown utcTime={m.utcTime}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <input type="number" className="score-inp" inputMode="numeric" pattern="[0-9]*" min="0" max="20"
                  value={r?.homeScore??""} onChange={e=>setScore(m.id,"homeScore",e.target.value)} onFocus={e=>{const v=e.target.value;e.target.value="";e.target.value=v;}} placeholder="–"/>
                <span className="sep">:</span>
                <input type="number" className="score-inp" inputMode="numeric" pattern="[0-9]*" min="0" max="20"
                  value={r?.awayScore??""} onChange={e=>setScore(m.id,"awayScore",e.target.value)} onFocus={e=>{const v=e.target.value;e.target.value="";e.target.value=v;}} placeholder="–"/>
              </div>
            </div>
            <div className="team away">
              <span className="flag">{FLAGS[m.away]||"🏳"}</span>
              <span className="t-name">{m.away}</span>
            </div>
          </div>
        );
      })}

      <div className="flex gap10 mt16" style={{alignItems:"center"}}>
        <button className="btn btn-gold" onClick={save} disabled={saving}>
          {saving?"Saving…":"💾 Save Results"}
        </button>
        {(()=>{
          const dirtyCount=GROUP_MATCHES.filter(m=>{
            const r=localR[m.id], savedR=results[m.id];
            return JSON.stringify({h:r?.homeScore??null,a:r?.awayScore??null})
                !== JSON.stringify({h:savedR?.homeScore??null,a:savedR?.awayScore??null});
          }).length;
          return dirtyCount>0
            ? <span style={{color:"#D9A400",fontWeight:700,fontSize:12}}>● {dirtyCount} sin guardar</span>
            : <span style={{color:"var(--green)",fontWeight:700,fontSize:12}}>✓ Todo guardado</span>;
        })()}
      </div>

      {/* Audit log */}
      <div className="sec-t" style={{fontSize:16,marginTop:28,marginBottom:10}}>📋 Registro de cambios</div>
      {(!logs||logs.length===0)?(
        <div className="empty"><div className="empty-i">📋</div>Sin actividad registrada aún.</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[...logs].reverse().slice(0,50).map((entry,i)=>{
            const hasBlocked=entry.blocked&&Object.keys(entry.blocked).length>0;
            const d=new Date(entry.ts);
            const dateStr=d.toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
            return(
              <div key={i} style={{background:"var(--white)",
                border:`1.5px solid ${hasBlocked?"rgba(232,0,28,.25)":"rgba(0,0,0,.07)"}`,
                borderRadius:8,padding:"10px 14px",fontSize:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{display:"flex",alignItems:"center",gap:6}}>
                    <strong style={{color:"var(--dark)"}}>{entry.name||entry.pid}</strong>
                    {entry.adminOverride&&(
                      <span style={{fontSize:9,fontWeight:700,letterSpacing:1,color:"var(--purple)",
                        background:"rgba(75,10,174,.08)",border:"1px solid rgba(75,10,174,.2)",
                        borderRadius:4,padding:"1px 6px"}}>ADMIN</span>
                    )}
                  </span>
                  <span style={{color:"var(--muted)",fontSize:11}}>{dateStr}</span>
                </div>
                {entry.applied&&Object.entries(entry.applied).map(([mid,ch])=>(
                  <div key={mid} style={{color:"var(--muted)"}}>
                    ✏️ {mid}: {ch.old||"—"} → {ch.new||"—"}
                  </div>
                ))}
                {entry.bonusChange&&(
                  <>
                    <div style={{color:"var(--muted)"}}>🏆 Campeón: {entry.bonusChange.champion}</div>
                    <div style={{color:"var(--muted)"}}>⚽ Goleador: {entry.bonusChange.topScorer}</div>
                  </>
                )}
                {!entry.applied&&!entry.bonusChange&&!hasBlocked&&(
                  <div style={{color:"var(--muted)",fontStyle:"italic"}}>Sin cambios detectados</div>
                )}
                {hasBlocked&&Object.entries(entry.blocked).map(([mid,ch])=>(
                  <div key={mid} style={{color:"var(--red)",fontWeight:600}}>
                    🚫 {mid}: intentó {ch.attempted||"—"} (partido ya empezó) — se mantuvo {ch.kept||"sin pick"}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── RULES VIEW ───────────────────────────────────────────────────────────────
const ENTRY_FEE = 1000; // MXN

function RulesView({players}){
  const pot = players.length * ENTRY_FEE;
  const prizes = [
    { place:"1er lugar",  emoji:"🥇", pct:55, color:"var(--red)",    colorBg:"rgba(232,0,28,.06)",   colorBorder:"rgba(232,0,28,.2)"    },
    { place:"2do lugar",  emoji:"🥈", pct:30, color:"var(--purple)", colorBg:"rgba(75,10,174,.05)",  colorBorder:"rgba(75,10,174,.18)"  },
    { place:"3er lugar",  emoji:"🥉", pct:10, color:"#5a7a00",       colorBg:"rgba(168,210,0,.07)",  colorBorder:"rgba(168,210,0,.25)"  },
    { place:"Administración", emoji:"⚙️", pct:5, color:"var(--muted)", colorBg:"rgba(0,0,0,.02)", colorBorder:"rgba(0,0,0,.08)" },
  ];

  const Block=({color,label,children})=>(
    <div style={{background:"var(--white)",border:"1px solid rgba(0,0,0,.07)",
      borderRadius:10,padding:"20px 22px",marginBottom:12,
      boxShadow:"0 2px 10px rgba(0,0,0,.04)",
      borderLeft:`4px solid ${color}`}}>
      <div style={{fontFamily:"var(--fH)",fontSize:13,fontWeight:800,letterSpacing:2,
        textTransform:"uppercase",color:color,marginBottom:10}}>{label}</div>
      {children}
    </div>
  );

  const Row=({label,value,bold})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
      padding:"7px 0",borderBottom:"1px solid rgba(0,0,0,.05)",fontSize:14}}>
      <span style={{color:"var(--muted)"}}>{label}</span>
      <span style={{fontWeight:bold?700:500,color:"var(--dark)"}}>{value}</span>
    </div>
  );

  return(
    <div className="page">
      <div className="page-title">REGLAS <span className="title-accent">& PREMIOS</span></div>
      <div className="page-sub">Todo lo que necesitas saber para participar en la Quiniela Mundial 2026</div>

      {/* Prize pool calculator */}
      <div style={{background:"var(--red)",borderRadius:12,padding:"22px 24px",marginBottom:24,color:"#fff"}}>
        <div style={{fontFamily:"var(--fH)",fontSize:12,letterSpacing:2,opacity:.8,marginBottom:4,textTransform:"uppercase"}}>
          Bote actual · {players.length} jugadores × $1,000 MXN
        </div>
        <div style={{fontFamily:"var(--fH)",fontSize:52,fontWeight:900,lineHeight:1,letterSpacing:2}}>
          ${pot.toLocaleString("es-MX")} MXN
        </div>
        <div style={{marginTop:16,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {prizes.map(p=>(
            <div key={p.place} style={{background:"rgba(255,255,255,.15)",borderRadius:8,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:18,marginBottom:2}}>{p.emoji}</div>
              <div style={{fontFamily:"var(--fH)",fontSize:20,fontWeight:900}}>${Math.round(pot*p.pct/100).toLocaleString("es-MX")}</div>
              <div style={{fontSize:10,opacity:.8,marginTop:2,letterSpacing:.5}}>{p.pct}% · {p.place}</div>
            </div>
          ))}
        </div>
        {players.length===0&&(
          <div style={{marginTop:10,fontSize:11,opacity:.7}}>
            * El bote crece con cada jugador que se registre
          </div>
        )}
      </div>

      {/* Points system */}
      <Block color="var(--purple)" label="🏆 Sistema de Puntos">
        <div style={{marginBottom:12,fontFamily:"var(--fH)",fontSize:13,letterSpacing:1,
          color:"var(--purple)",textTransform:"uppercase"}}>Fase de grupos</div>
        <Row label="Marcador exacto (ej. 2-1 ✓)" value="3 puntos" bold/>
        <Row label="Resultado correcto (W/D/L)" value="1 punto" bold/>
        <Row label="Resultado incorrecto" value="0 puntos"/>

        <div style={{marginTop:16,marginBottom:10,fontFamily:"var(--fH)",fontSize:13,letterSpacing:1,
          color:"var(--purple)",textTransform:"uppercase"}}>Ronda eliminatoria</div>
        <Row label="Ronda de 32 — ganador correcto" value="2 pts (+2 exacto)"/>
        <Row label="Ronda de 16 — ganador correcto" value="4 pts (+2 exacto)"/>
        <Row label="Cuartos de final" value="6 pts (+2 exacto)"/>
        <Row label="Semifinales" value="8 pts (+2 exacto)"/>
        <Row label="Final" value="10 pts (+2 exacto)"/>

        <div style={{marginTop:16,marginBottom:10,fontFamily:"var(--fH)",fontSize:13,letterSpacing:1,
          color:"var(--purple)",textTransform:"uppercase"}}>Picks de bonus (una sola vez)</div>
        <Row label="Campeón del torneo correcto" value="10 puntos" bold/>
        <Row label="Goleador del torneo correcto" value="5 puntos" bold/>
      </Block>

      {/* Deadlines */}
      <Block color="var(--red)" label="⏰ Fechas límite">
        <Row label="Registro de jugadores" value="Antes del 11 Jun"/>
        <Row label="Picks de Bonus (Campeón + Goleador)" value="11 Jun · 13:00 CST" bold/>
        <Row label="Predicción por partido" value="Al momento del kick-off" bold/>
        <Row label="Picks de eliminatoria" value="Disponibles 28 Jun"/>
        <div style={{marginTop:12,padding:"10px 14px",background:"rgba(232,0,28,.06)",
          borderRadius:8,fontSize:12,color:"var(--red)",lineHeight:1.6}}>
          ⚠️ Las predicciones se bloquean automáticamente al inicio de cada partido. No se aceptan cambios después del kick-off.
        </div>
      </Block>

      {/* Tiebreaker */}
      <Block color="#5a7a00" label="🔢 Desempate">
        <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.8}}>
          En caso de empate en puntos al final del torneo, el ganador se determina por:
        </div>
        <div style={{marginTop:10}}>
          <Row label="1. Mayor número de marcadores exactos" value="⭐ Prioridad 1"/>
          <Row label="2. Mayor número de resultados correctos" value="✓ Prioridad 2"/>
          <Row label="3. Mayor puntaje en fase eliminatoria" value="Prioridad 3"/>
          <Row label="4. Decisión del administrador" value="Último recurso"/>
        </div>
      </Block>

      {/* Fair play */}
      <Block color="var(--muted)" label="⚽ Reglas de juego limpio">
        <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.9}}>
          🔒 <strong style={{color:"var(--dark)"}}>Predicciones privadas</strong> — nadie puede ver los picks de otro jugador hasta que el partido comience.<br/>
          ✏️ <strong style={{color:"var(--dark)"}}>Puedes editar</strong> tus predicciones de partidos futuros en cualquier momento antes del kick-off.<br/>
          🚫 <strong style={{color:"var(--dark)"}}>Prohibido compartir</strong> tus predicciones con otros jugadores antes del partido.<br/>
          💰 <strong style={{color:"var(--dark)"}}>Cuota de entrada</strong> — $1,000 MXN por jugador, pagaderos al administrador antes de registrarse.<br/>
          📩 <strong style={{color:"var(--dark)"}}>Disputas</strong> — cualquier inconformidad debe reportarse al administrador antes de que termine el torneo.
        </div>
      </Block>

      {/* Contact */}
      <div style={{textAlign:"center",padding:"20px 0",color:"var(--muted)",fontSize:13}}>
        ¿Dudas? Contacta al administrador de la quiniela · Quiniela Mundial 2026 ⚽
      </div>
    </div>
  );
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
function LoginModal({onSuccess,onClose}){
  const[pw,setPw]=useState("");
  const[err,setErr]=useState(false);
  const go=()=>{
    if(pw===ADMIN_PASSWORD){onSuccess();}
    else{setErr(true);setTimeout(()=>setErr(false),1500);}
  };
  return(
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-t">🔐 Admin</div>
        <div className="modal-s">Enter the admin password to manage results</div>
        <div className="field">
          <label className="label">Password</label>
          <input type="password" className="inp" value={pw}
            style={{borderColor:err?"var(--red)":undefined}}
            onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
            placeholder="••••••••" autoFocus/>
          {err&&<div style={{color:"var(--red)",fontSize:11,marginTop:5}}>Wrong password</div>}
        </div>
        <div className="flex gap10">
          <button className="btn btn-gold" style={{flex:1}} onClick={go}>Enter</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
