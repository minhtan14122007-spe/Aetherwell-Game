// game.js — Aetherwell demo with question mechanic (10s timer)

// === FACTIONS ===
console.log("game.js loaded");
console.log("FACTIONS count:", typeof FACTIONS);
const FACTIONS = [
  { id: "viking", name: "Viking Kingdom", short: "Viking", img: "images/viking.png" },
  { id: "dragon", name: "Dragon Temple Knights", short: "Dragon", img: "images/dragon.png" },
  { id: "samurai", name: "Samurai Clan", short: "Samurai", img: "images/samurai.png" },
  { id: "spartan", name: "Spartan Feast Legion", short: "Spartan", img: "images/spartan.png" },
  { id: "amazon", name: "Amazon Forest Tribe", short: "Amazon", img: "images/amazon.png" },
  { id: "pharaoh", name: "Pharaoh Dynasty", short: "Pharaoh", img: "images/pharaoh.png" },
  { id: "elf", name: "Elf Light Kingdom", short: "Elf", img: "images/elf.png" }
];

// === CARDS: full 20 cards with question + accepted answers and effects ===
// answers are lowercase; the check is case-insensitive & trims spaces
const CARDS = [
  { id:1, title:"Shampoo Strike", question:"What personal care product do you use to wash your hair?", answers:["shampoo"], correctEffect:{type:"damage",value:2}, wrongEffect:{type:"shieldLoss",value:1} },

  { id:2, title:"Deodorant Mist", question:"What product helps prevent body odor?", answers:["deodorant"], correctEffect:{type:"grantShield",value:2}, wrongEffect:{type:"slow",value:1} },

  { id:3, title:"Mouthwash Roar", question:"What do people use to keep their breath fresh?", answers:["mouthwash"], correctEffect:{type:"stunTarget",value:1}, wrongEffect:{type:"noAttackNext",value:1} },

  { id:4, title:"Sacred Haircut Slash", question:"Which service do you need if you want someone to wash, cut, and style your hair?", answers:["haircut","a haircut"], correctEffect:{type:"damage",value:3}, wrongEffect:{type:"manaLoss",value:1} },

  { id:5, title:"Holy Facial Light", question:"What service do you get if you want your face cleaned at a salon?", answers:["facial"], correctEffect:{type:"heal",value:2}, wrongEffect:{type:"loseTurn",value:1} },

  { id:6, title:"Lotion Barrier", question:"What product keeps your skin from becoming dry?", answers:["lotion","moisturizer","moisturising lotion","moisturiser"], correctEffect:{type:"grantShield",value:2}, wrongEffect:{type:"disableSkill",value:1} },

  { id:7, title:"Floss Cut Technique", question:"What item removes food stuck between your teeth?", answers:["dental floss","floss","tooth floss"], correctEffect:{type:"damage",value:2}, wrongEffect:{type:"nextDamagePenalty",value:1} },

  { id:8, title:"Hairspray Slash", question:"What personal care product keeps hair in place?", answers:["hairspray","hair gel","gel","hairgel"], correctEffect:{type:"speed",value:1}, wrongEffect:{type:"speed",value:-1} },

  { id:9, title:"Massage Recovery", question:"What do you call the relaxing body treatment service?", answers:["a massage","massage"], correctEffect:{type:"heal",value:3}, wrongEffect:{type:"none",value:0} },

  { id:10, title:"Junk Food Curse", question:"What describes food high in sugar and fat?", answers:["junk food"], correctEffect:{type:"applyDebuffOnTarget",debuff:{name:"fatigue",value:1,duration:1}}, wrongEffect:{type:"applyDebuffOnSelf",debuff:{name:"fatigue",value:1,duration:1}} },

  { id:11, title:"Fried Oil Burst", question:"What do you call food cooked using a lot of oil?", answers:["fried food","fried"], correctEffect:{type:"burn",value:2,duration:2}, wrongEffect:{type:"burn",value:1,duration:1} },

  { id:12, title:"Organic Blessing", question:"What is food grown without chemicals?", answers:["organic food","organic"], correctEffect:{type:"heal",value:2}, wrongEffect:{type:"cannotHealNext",value:1} },

  { id:13, title:"Nutritious Shot", question:"What describes food with many vitamins?", answers:["nutritious"], correctEffect:{type:"buffExtraDamage",value:2}, wrongEffect:{type:"none",value:0} },

  { id:14, title:"Taste Test Trial", question:"What describes how food tastes (sweet, salty…)?", answers:["flavor","flavour","taste"], correctEffect:{type:"drawExtraCard",value:1}, wrongEffect:{type:"loseTurn",value:1} },

  { id:15, title:"Healthy Guard", question:"What adjective describes low-fat good food?", answers:["healthy","low-fat","low fat"], correctEffect:{type:"grantShield",value:2}, wrongEffect:{type:"shieldLoss",value:1} },

  { id:16, title:"Vegan Beam", question:"What describes food with no animal products?", answers:["vegan"], correctEffect:{type:"healAndBuff",heal:1,damage:1}, wrongEffect:{type:"cannotAttackNext",value:1} },

  { id:17, title:"Fast Food Ambush", question:"What is easy but unhealthy food like pizza or hamburgers?", answers:["fast food"], correctEffect:{type:"quickAttack",value:2}, wrongEffect:{type:"slow",value:1} },

  { id:18, title:"Vegetarian Blessing", question:"What do you call a person who doesn’t eat meat?", answers:["vegetarian"], correctEffect:{type:"grantAllyHeal",value:3}, wrongEffect:{type:"none",value:0} },

  { id:19, title:"Used-to Knowledge Shot", question:"I _______ eat vegetables, but now I do.", answers:["didn't use to","didn't used to","didnt use to","didnt used to"], correctEffect:{type:"damage",value:3}, wrongEffect:{type:"noDamageNext",value:1} },

  { id:20, title:"Spicy Food Memory", question:"Did you use to like spicy food?", answers:["yes","no","did you use to like spicy food?"], correctEffect:{type:"targetLoseTurn",value:1}, wrongEffect:{type:"self",value:-2} }
];

// game state
let playerCount = 4;
let selections = []; // {slot, factionId}
let usedFactions = new Set();
let teams = []; // {slot, factionId, name, hp, maxHp, shield, status:{stun:0, burn:[], fatigue:0, disabledSkill:0, cannotAttack:0, slow:0, speed:0, extraDmg:0}, dead:false}
let currentTurnIndex = 0; // index in teams array of who's turn it is
let drawnCard = null;
let questionTimer = null;
let timerCount = 10;

// DOM refs
const factionGrid = document.getElementById("factionGrid");
const pickedList = document.getElementById("pickedList");
const startBtn = document.getElementById("startBtn");
const playerCountSel = document.getElementById("playerCount");
const arena = document.getElementById("arena");
const teamsArea = document.getElementById("teamsArea");
const logArea = document.getElementById("logArea");
const cardBox = document.getElementById("cardBox");
const drawBtn = document.getElementById("drawBtn");
const questionPanel = document.getElementById("questionPanel");
const cardTitle = document.getElementById("cardTitle");
const cardQuestion = document.getElementById("cardQuestion");
const answerInput = document.getElementById("answerInput");
const timerSpan = document.getElementById("timerCount");
const autoBtn = document.getElementById("autofill");

// --- Selection UI ---
function setupSelection(){
  playerCount = parseInt(playerCountSel.value || "4");
  selections = [];
  usedFactions.clear();
  renderFactionGrid();
  renderPickedList();
  startBtn.disabled = true;
  arena.classList.add("hidden");
  drawBtn.disabled = true;
  resetStateUI();
}

function renderFactionGrid(){
  factionGrid.innerHTML = "";
  FACTIONS.forEach(f=>{
    const div = document.createElement("div");
    div.className = "faction";
    div.id = "f_" + f.id;
    if(usedFactions.has(f.id)) div.classList.add("disabled");
    div.innerHTML = `
      <div class="thumb">${f.short[0]}</div>
      <div class="meta">
        <h4>${f.name}</h4>
        <p class="hint">${f.short}</p>
      </div>
    `;
    div.onclick = ()=> {
      if(usedFactions.has(f.id)) return;
      if(selections.length >= playerCount){
        alert("Bạn đã chọn đủ số người chơi.");
        return;
      }
      const slot = selections.length + 1;
      selections.push({slot, factionId: f.id});
      usedFactions.add(f.id);
      renderFactionGrid();
      renderPickedList();
      if(selections.length === playerCount) startBtn.disabled = false;
    };
    factionGrid.appendChild(div);
  });
}

function renderPickedList(){
  pickedList.innerHTML = "";
  for(let i=1;i<=playerCount;i++){
    const sel = selections.find(s=>s.slot===i);
    const el = document.createElement("div");
    el.className = "picked";
    if(sel){
      const f = FACTIONS.find(x=>x.id===sel.factionId);
      el.innerHTML = `<strong>Player ${i}:</strong> ${f.name} <button onclick="unpick('${sel.factionId}')">✕</button>`;
    } else {
      el.innerHTML = `<strong>Player ${i}:</strong> —`;
    }
    pickedList.appendChild(el);
  }
}

function unpick(factionId){
  selections = selections.filter(s=>s.factionId !== factionId);
  usedFactions.delete(factionId);
  startBtn.disabled = selections.length < playerCount;
  renderFactionGrid();
  renderPickedList();
}

// auto-fill remaining slots with random unused factions
function autoFill(){
  const available = FACTIONS.map(f=>f.id).filter(id=>!usedFactions.has(id));
  while(selections.length < playerCount && available.length){
    const idx = Math.floor(Math.random() * available.length);
    const id = available.splice(idx,1)[0];
    selections.push({slot: selections.length+1, factionId: id});
    usedFactions.add(id);
  }
  renderFactionGrid();
  renderPickedList();
  startBtn.disabled = selections.length < playerCount;
}

// --- Start game ---
function startGame(){
  if(selections.length < playerCount){
    alert("Chọn đủ nền văn minh trước khi bắt đầu.");
    return;
  }
  // create teams
  teams = selections.map(s=>{
    const f = FACTIONS.find(x=>x.id===s.factionId);
    return {
      slot: s.slot,
      factionId: f.id,
      name: f.name,
      hp: 20,
      maxHp: 20,
      shield: 0,
      status: {stun:0, burn:[], fatigue:0, disabledSkill:0, cannotAttack:0, slow:0, speed:0, extraDmg:0, skipTurn:0},
      dead:false
    };
  });

  arena.classList.remove("hidden");
  renderTeams();
  log("Game started. Lượt Player 1 bắt đầu.");
  currentTurnIndex = 0;
  updateActiveTeamUI();
  // disable selection changes
  startBtn.disabled = true;
  playerCountSel.disabled = true;
  document.querySelectorAll(".faction").forEach(el=>el.onclick = ()=>{});
  autoBtn.disabled = true;
  drawBtn.disabled = false;
}

// --- Render teams ---
function renderTeams(){
  teamsArea.innerHTML = "";
  teams.forEach(team=>{
    const div = document.createElement("div");
    div.className = "team";
    div.id = "team_" + team.factionId;
    const imgSrc = (FACTIONS.find(f=>f.id===team.factionId).img) || "";
    div.innerHTML = `
      <div class="team-head">
        <img src="${imgSrc}" onerror="this.style.display='none'"/>
        <div>
          <div class="team-name">Player ${team.slot} — ${team.name}</div>
          <div class="hpbar"><div class="hpfill" id="hpfill_${team.factionId}" style="width:${(team.hp/team.maxHp)*100}%"></div></div>
          <div class="stat-row">
            <div class="stat">HP: <span id="hp_${team.factionId}">${team.hp}</span>/<span>${team.maxHp}</span></div>
            <div class="stat">Shield: <span id="shield_${team.factionId}">${team.shield}</span></div>
            <div class="stat">Status: <span id="status_${team.factionId}">—</span></div>
          </div>
        </div>
      </div>
    `;
    teamsArea.appendChild(div);
    updateStatusUI(team);
  });
}

function updateStatusUI(team){
  const stat = document.getElementById("status_" + team.factionId);
  if(!stat) return;
  const s = team.status;
  let parts = [];
  if(s.stun>0) parts.push(`stun(${s.stun})`);
  if(s.burn && s.burn.length) parts.push(`burn(${s.burn.map(b=>b.dmg+'/'+b.turns).join(',')})`);
  if(s.fatigue>0) parts.push(`fatigue`);
  if(s.cannotAttack>0) parts.push(`noAtk`);
  if(s.slow>0) parts.push(`slow`);
  if(s.extraDmg>0) parts.push(`+dmg(${s.extraDmg})`);
  stat.textContent = parts.length? parts.join(' • '): '—';
}

// --- Logging utility ---
function log(text){
  const row = document.createElement("div");
  row.className = "log-item";
  row.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logArea.prepend(row);
}

// --- Turn & draw logic ---
// Only the active team can draw. drawCard shows question and starts timer.
function drawCard(){
  if(!teams.length) return;
  const team = teams[currentTurnIndex];
  if(team.dead){ advanceTurn(); return; }
  // check skip states
  if(team.status.skipTurn > 0){
    log(`${team.name} mất lượt (skip).`);
    team.status.skipTurn--;
    advanceTurn();
    return;
  }
  if(team.status.stun > 0){
    log(`${team.name} bị choáng và bỏ qua lượt.`);
    team.status.stun--;
    advanceTurn();
    return;
  }
  if(team.status.cannotAttack > 0){
    // they can still draw a card/question but effect may block attack; we'll allow answer though.
    log(`${team.name} không thể tấn công lượt này nếu trả lời đúng (effect sẽ bị giới hạn).`);
  }

  // pick random card
  const idx = Math.floor(Math.random() * CARDS.length);
  drawnCard = CARDS[idx];
  cardBox.innerHTML = `${drawnCard.title} — ${drawnCard.question}`;
  // show question panel
  showQuestion(drawnCard);
  drawBtn.disabled = true;
}

// show question UI & start 10s timer
function showQuestion(card){
  cardTitle.textContent = card.title;
  cardQuestion.textContent = card.question;
  answerInput.value = "";
  timerCount = 10;
  timerSpan.textContent = timerCount;
  questionPanel.classList.remove("hidden");
  // focus input
  answerInput.focus();
  // start timer
  if(questionTimer) clearInterval(questionTimer);
  questionTimer = setInterval(()=>{
    timerCount--;
    timerSpan.textContent = timerCount;
    if(timerCount <= 0){
      clearInterval(questionTimer);
      questionTimer = null;
      // time out => treat as wrong
      log(`Hết giờ! Tính là trả lời sai.`);
      hideQuestion();
      processAnswer(false, "");
    }
  }, 1000);
}

// hide question UI
function hideQuestion(){
  questionPanel.classList.add("hidden");
  if(questionTimer){
    clearInterval(questionTimer);
    questionTimer = null;
  }
}

// submit answer by user
function submitAnswer(){
  if(!drawnCard) return;
  const raw = answerInput.value || "";
  const answer = raw.trim().toLowerCase();
  // stop timer
  if(questionTimer){ clearInterval(questionTimer); questionTimer = null; }
  hideQuestion();
  const isCorrect = checkAnswer(drawnCard, answer);
  processAnswer(isCorrect, answer);
}

function checkAnswer(card, answer){
  if(!answer) return false;
  // normalize
  const a = answer.replace(/\s+/g,' ').trim().toLowerCase();
  // accept any accepted answer
  for(const acc of card.answers){
    const norm = acc.toLowerCase().trim();
    if(a === norm) return true;
  }
  return false;
}

// apply effects depending on correctness
function processAnswer(isCorrect, answerText){
  const attacker = teams[currentTurnIndex];
  // pick a target: choose next living team (wrap)
  const targets = teams.filter(t => t !== attacker && t.hp > 0);
  let target = null;
  if(targets.length) target = targets[0]; // simple: first alive different team
  // log
  log(`${attacker.name} rút: ${drawnCard.title}. Trả lời: "${answerText}" → ${isCorrect ? "ĐÚNG" : "SAI"}.`);
  // choose which effect to run
  const effect = isCorrect ? drawnCard.correctEffect : drawnCard.wrongEffect;
  applyEffect(effect, attacker, target, isCorrect);
  drawnCard = null;
  // update UI
  renderTeams();
  // after action, tick burn & end turn
  tickEndOfTurn();
  advanceTurn();
}

// effect handler (many effect types)
function applyEffect(effect, attacker, target, isCorrect){
  if(!effect) return;
  // convenience
  const a = attacker;
  const t = target;
  switch(effect.type){
    case "damage":
      if(!t) { log("No valid target."); break; }
      let dmg = effect.value + (a.status.extraDmg || 0);
      // fatigue reduces dmg
      if(a.status.fatigue > 0) dmg = Math.max(0, dmg - 1);
      // shield reduces target damage
      const absorbed = Math.min(t.shield, dmg);
      t.shield -= absorbed;
      const net = dmg - absorbed;
      t.hp = Math.max(0, t.hp - net);
      log(`${a.name} gây ${dmg} dmg lên ${t.name} (shield hấp thụ ${absorbed}).`);
      break;

    case "grantShield":
      a.shield += effect.value;
      log(`${a.name} nhận khiên +${effect.value}.`);
      break;

    case "shieldLoss":
      // remove shield from attacker (or target if chosen)
      a.shield = Math.max(0, a.shield - effect.value);
      log(`${a.name} mất ${effect.value} shield vì sai câu.`);
      break;

    case "stunTarget":
      if(!t) break;
      t.status.stun = (t.status.stun || 0) + effect.value;
      log(`${t.name} bị choáng ${effect.value} lượt.`);
      break;

    case "noAttackNext":
      a.status.cannotAttack = (a.status.cannotAttack||0) + effect.value;
      log(`${a.name} sẽ không thể tấn công lượt tiếp theo.`);
      break;

    case "manaLoss":
      // demo: just log (no mana system in this demo)
      log(`${a.name} bị -1 mana (mana chưa implement).`);
      break;

    case "heal":
      a.hp = Math.min(a.maxHp, a.hp + effect.value);
      log(`${a.name} hồi ${effect.value} HP.`);
      break;

    case "disableSkill":
      a.status.disabledSkill = (a.status.disabledSkill||0) + effect.value;
      log(`${a.name} không dùng kỹ năng đặc biệt trong ${effect.value} lượt.`);
      break;

    case "nextDamagePenalty":
      a.status.extraDmg = Math.max(0, (a.status.extraDmg||0) - effect.value);
      log(`${a.name} bị trừ sát thương lượt sau ${effect.value}.`);
      break;

    case "speed":
      // speed changes not fully used in this demo; store value
      a.status.speed = (a.status.speed||0) + effect.value;
      log(`${a.name} speed thay đổi ${effect.value}.`);
      break;

    case "applyDebuffOnTarget":
      if(!t) break;
      t.status[effect.debuff.name] = (t.status[effect.debuff.name] || 0) + effect.debuff.value;
      log(`${t.name} bị debuff ${effect.debuff.name}.`);
      break;

    case "applyDebuffOnSelf":
      a.status[effect.debuff.name] = (a.status[effect.debuff.name] || 0) + effect.debuff.value;
      log(`${a.name} bị debuff ${effect.debuff.name} (lỡ câu).`);
      break;

    case "burn":
      if(!t) break;
      t.status.burn = t.status.burn || [];
      t.status.burn.push({dmg:effect.value, turns:effect.duration});
      log(`${t.name} nhận burn ${effect.value} dmg suốt ${effect.duration} lượt.`);
      break;

    case "cannotHealNext":
      a.status.cannotHeal = (a.status.cannotHeal||0) + effect.value;
      log(`${a.name} không thể hồi máu lượt sau.`);
      break;

    case "buffExtraDamage":
      a.status.extraDmg = (a.status.extraDmg||0) + effect.value;
      log(`${a.name} nhận +${effect.value} sát thương (tích luỹ).`);
      break;

    case "drawExtraCard":
      // simple: immediately draw another card for same attacker (no question for second draw in demo)
      log(`${a.name} bốc thêm 1 lá bài (demo: auto apply random).`);
      // perform one immediate random effect without question for demo simplicity
      const idx = Math.floor(Math.random() * CARDS.length);
      const card = CARDS[idx];
      log(`(Extra draw) ${a.name} rút ${card.title} — sẽ auto kích hoạt đúng.`);
      applyEffect(card.correctEffect, a, target, true);
      break;

    case "nextDamagePenalty":
      // handled above
      break;

    case "healAndBuff":
      a.hp = Math.min(a.maxHp, a.hp + effect.heal);
      a.status.extraDmg = (a.status.extraDmg||0) + effect.damage;
      log(`${a.name} hồi ${effect.heal} HP và +${effect.damage} sát thương.`);
      break;

    case "quickAttack":
      if(!t) break;
      let qd = effect.value + (a.status.extraDmg||0);
      const ab = Math.min(t.shield, qd);
      t.shield -= ab;
      t.hp = Math.max(0, t.hp - (qd - ab));
      log(`${a.name} gây quick ${qd} dmg lên ${t.name}.`);
      break;

    case "grantAllyHeal":
      // heal all allies except attacker
      teams.forEach(team=>{
        if(team !== a && team.hp > 0){
          team.hp = Math.min(team.maxHp, team.hp + effect.value);
        }
      });
      log(`${a.name} gọi Thần Rau: tất cả đồng minh hồi ${effect.value} HP.`);
      break;

    case "noDamageNext":
      a.status.noDamageNext = (a.status.noDamageNext||0) + effect.value;
      log(`${a.name} sẽ không gây sát thương lượt sau.`);
      break;

    case "targetLoseTurn":
      if(t) t.status.skipTurn = (t.status.skipTurn||0) + effect.value;
      log(`${t ? t.name : "target"} mất ${effect.value} lượt.`);
      break;

    default:
      log("Effect type chưa được implement: " + effect.type);
  }

  // clamp hp to >=0 and set dead flag when hp=0
  teams.forEach(ti=>{
    if(ti.hp <= 0 && !ti.dead){
      ti.dead = true;
      log(`${ti.name} đã bị loại!`);
      const el = document.getElementById("team_" + ti.factionId);
      if(el) el.style.opacity = 0.5;
    }
  });
}

// tick end of turn: reduce burn, durations, etc.
function tickEndOfTurn(){
  // process burn & reduce durations for all teams
  teams.forEach(team=>{
    // burn
    if(team.status.burn && team.status.burn.length){
      let totalBurn = 0;
      team.status.burn.forEach(b=>{
        totalBurn += b.dmg;
        b.turns--;
      });
      team.hp = Math.max(0, team.hp - totalBurn);
      log(`${team.name} chịu ${totalBurn} burn damage.`);
      // remove expired
      team.status.burn = team.status.burn.filter(b=>b.turns > 0);
    }
    // reduce simple counters
    if(team.status.fatigue && team.status.fatigue>0) team.status.fatigue = Math.max(0, team.status.fatigue-1);
    if(team.status.disabledSkill && team.status.disabledSkill>0) team.status.disabledSkill--;
    if(team.status.cannotAttack && team.status.cannotAttack>0) team.status.cannotAttack--;
    if(team.status.slow && team.status.slow>0) team.status.slow = Math.max(0, team.status.slow-1);
    if(team.status.noDamageNext && team.status.noDamageNext>0) team.status.noDamageNext--;
    if(team.status.skipTurn && team.status.skipTurn>0) team.status.skipTurn = Math.max(0, team.status.skipTurn); // will be consumed at start
    // update UI
    updateTeamUI(team);
    updateStatusUI(team);
  });
}

// advance to next alive team
function advanceTurn(){
  // check win condition
  const alive = teams.filter(t=>t.hp>0);
  if(alive.length <= 1){
    log("KẾT THÚC: " + (alive[0] ? alive[0].name + " thắng!" : "Không còn ai sống"));
    drawBtn.disabled = true;
    return;
  }
  // find next index
  let attempts = 0;
  do {
    currentTurnIndex = (currentTurnIndex + 1) % teams.length;
    attempts++;
    if(attempts > teams.length + 2) break;
  } while(teams[currentTurnIndex].hp <= 0);
  updateActiveTeamUI();
  drawBtn.disabled = false;
  log(`Lượt hiện tại: ${teams[currentTurnIndex].name}`);
}

// UI updates
function updateTeamUI(team){
  const hpEl = document.getElementById("hp_" + team.factionId);
  const shieldEl = document.getElementById("shield_" + team.factionId);
  const fill = document.getElementById("hpfill_" + team.factionId);
  if(hpEl) hpEl.textContent = team.hp;
  if(shieldEl) shieldEl.textContent = team.shield;
  if(fill) fill.style.width = ((team.hp/team.maxHp)*100) + "%";
  updateStatusUI(team);
}

function updateActiveTeamUI(){
  teams.forEach((t, idx)=>{
    const el = document.getElementById("team_" + t.factionId);
    if(!el) return;
    if(idx === currentTurnIndex) el.classList.add("active"); else el.classList.remove("active");
  });
}

// reset UI if come back to selection
function resetStateUI(){
  teamsArea.innerHTML = "";
  logArea.innerHTML = "";
  cardBox.innerHTML = "No card drawn";
  questionPanel.classList.add("hidden");
  drawnCard = null;
  if(questionTimer){ clearInterval(questionTimer); questionTimer = null; }
  drawBtn.disabled = true;
  autoBtn.disabled = false;
}

// init
setupSelection();
