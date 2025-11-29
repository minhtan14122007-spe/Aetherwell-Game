// game.js - Aetherwell demo using UNIT5 & UNIT6 questions
// Source: UNIT 5 & UNIT 6 (uploaded by user). See file citation in chat. :contentReference[oaicite:2]{index=2}

// ---------- FACTIONS ----------
const FACTIONS = [
  { id: "viking", name: "Viking Kingdom", short: "Viking", img: "images/viking.svg" },
  { id: "dragon", name: "Dragon Temple Knights", short: "Dragon", img: "images/dragon.svg" },
  { id: "samurai", name: "Samurai Clan", short: "Samurai", img: "images/samurai.svg" },
  { id: "spartan", name: "Spartan Feast Legion", short: "Spartan", img: "images/spartan.svg" },
  { id: "amazon", name: "Amazon Forest Tribe", short: "Amazon", img: "images/amazon.svg" },
  { id: "pharaoh", name: "Pharaoh Dynasty", short: "Pharaoh", img: "images/pharaoh.svg" },
  { id: "elf", name: "Elf Light Kingdom", short: "Elf", img: "images/elf.svg" }
];

// ---------- CARDS: QUESTIONS FROM UNIT5 & UNIT6 (mapped to 20 cards) ----------
const CARDS = [
  // Unit 5 - Personal Care (10)
  { id:1, title:"Manicure/Pedicure", question:"What do people usually get when they want their nails cleaned and shaped?", answers:["manicure","pedicure"], correctEffect:{type:"grantShield",value:1}, wrongEffect:{type:"noAttackNext",value:1} },

  { id:2, title:"Shampoo Strike", question:"What personal care product do you use to wash your hair?", answers:["shampoo"], correctEffect:{type:"damage",value:2}, wrongEffect:{type:"shieldLoss",value:1} },

  { id:3, title:"Haircut Slash", question:"Which service do you need if you want someone to wash, cut, and style your hair?", answers:["haircut","a haircut"], correctEffect:{type:"damage",value:3}, wrongEffect:{type:"manaLoss",value:1} },

  { id:4, title:"Deodorant Mist", question:"What product helps prevent body odor?", answers:["deodorant"], correctEffect:{type:"grantShield",value:1}, wrongEffect:{type:"slow",value:1} },

  { id:5, title:"Mouthwash Roar", question:"What do people use to keep their breath fresh?", answers:["mouthwash"], correctEffect:{type:"stunTarget",value:1}, wrongEffect:{type:"noAttackNext",value:1} },

  { id:6, title:"Facial Light", question:"What service do you get if you want your face cleaned and treated at a salon?", answers:["facial"], correctEffect:{type:"heal",value:2}, wrongEffect:{type:"loseTurn",value:1} },

  { id:7, title:"Lotion Barrier", question:"What product do you use to keep your skin from becoming dry?", answers:["lotion","moisturizer","moisturiser"], correctEffect:{type:"grantShield",value:2}, wrongEffect:{type:"disableSkill",value:1} },

  { id:8, title:"Massage Recovery", question:"What do you call the service where someone gives you a relaxing body treatment?", answers:["a massage","massage"], correctEffect:{type:"heal",value:3}, wrongEffect:{type:"none",value:0} },

  { id:9, title:"Dental Floss", question:"What item do you use to remove food stuck between your teeth?", answers:["dental floss","floss"], correctEffect:{type:"damage",value:2}, wrongEffect:{type:"nextDamagePenalty",value:1} },

  { id:10, title:"Hairspray Slash", question:"What personal care product helps keep your hair in place?", answers:["hairspray","hair gel","gel"], correctEffect:{type:"speed",value:1}, wrongEffect:{type:"speed",value:-1} },

  // Unit 6 - Eating Well (10)
  { id:11, title:"Junk Food Curse", question:"What word describes food that is high in sugar and fat and not healthy?", answers:["junk food","unhealthy food"], correctEffect:{type:"applyDebuffOnTarget",debuff:{name:"fatigue",value:1}}, wrongEffect:{type:"applyDebuffOnSelf",debuff:{name:"fatigue",value:1}} },

  { id:12, title:"Fried Oil Burst", question:"What do you call food that is cooked using a lot of oil?", answers:["fried food","fried"], correctEffect:{type:"burn",value:2,duration:2}, wrongEffect:{type:"burn",value:1,duration:1} },

  { id:13, title:"Vegan Beam", question:"Which word describes food containing no animal products?", answers:["vegan"], correctEffect:{type:"healAndBuff",heal:1,damage:1}, wrongEffect:{type:"cannotAttackNext",value:1} },

  { id:14, title:"Organic Blessing", question:"What is the term for food that is fresh and not processed?", answers:["organic","natural","fresh"], correctEffect:{type:"grantShield",value:2}, wrongEffect:{type:"cannotHealNext",value:1} },

  { id:15, title:"Nutritious Shot", question:"What word describes food with a lot of vitamins and minerals?", answers:["nutritious"], correctEffect:{type:"buffExtraDamage",value:2}, wrongEffect:{type:"none",value:0} },

  { id:16, title:"Flavor Test", question:"What word describes the way food tastes (sweet, salty, spicy)?", answers:["flavor","taste","flavour"], correctEffect:{type:"drawExtraCard",value:1}, wrongEffect:{type:"loseTurn",value:1} },

  { id:17, title:"Organic Food", question:"What do you call food grown without chemicals?", answers:["organic food","organic"], correctEffect:{type:"grantShield",value:2}, wrongEffect:{type:"shieldLoss",value:1} },

  { id:18, title:"Healthy Guard", question:"What adjective describes food that is low in fat and good for your body?", answers:["healthy","low-fat","low fat"], correctEffect:{type:"grantAllyHeal",value:2}, wrongEffect:{type:"none",value:0} },

  { id:19, title:"Fast Food Ambush", question:"What do you call easy but unhealthy food like pizza or hamburgers?", answers:["fast food"], correctEffect:{type:"quickAttack",value:2}, wrongEffect:{type:"slow",value:1} },

  { id:20, title:"Vegetarian Blessing", question:"What is the term for a person who doesn’t eat meat?", answers:["vegetarian"], correctEffect:{type:"grantAllyHeal",value:3}, wrongEffect:{type:"none",value:0} }
];

// ---------- GAME STATE ----------
let playerCount = 4;
let selections = [];
let usedFactions = new Set();
let teams = [];
let currentTurnIndex = 0;
let drawnCard = null;
let questionTimer = null;
let timerCount = 10;

// ---------- DOM references ----------
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
const submitAnswerBtn = document.getElementById("submitAnswerBtn");
const timerSpan = document.getElementById("timerCount");
const autoBtn = document.getElementById("autofill");

// wire submit
submitAnswerBtn.addEventListener('click', handleSubmitAnswer);

// ---------- selection UI ----------
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

// ---------- start game ----------
function startGame(){
  if(selections.length < playerCount){
    alert("Chọn đủ nền văn minh trước khi bắt đầu.");
    return;
  }
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
  startBtn.disabled = true;
  playerCountSel.disabled = true;
  document.querySelectorAll(".faction").forEach(el=>el.onclick = ()=>{});
  autoBtn.disabled = true;
  drawBtn.disabled = false;
}

// ---------- render teams ----------
function renderTeams(){
  teamsArea.innerHTML = "";
  teams.forEach(team=>{
    const div = document.createElement("div");
    div.className = "team";
    div.id = "team_" + team.factionId;
    const fobj = FACTIONS.find(f=>f.id===team.factionId);
    const imgSrc = fobj ? fobj.img : "";
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

// ---------- log ----------
function log(text){
  const row = document.createElement("div");
  row.className = "log-item";
  row.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logArea.prepend(row);
}

// ---------- draw & question ----------
function drawCard(){
  if(!teams.length) return;
  const team = teams[currentTurnIndex];
  if(team.dead){ advanceTurn(); return; }
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

  const idx = Math.floor(Math.random() * CARDS.length);
  drawnCard = CARDS[idx];
  cardBox.innerHTML = `${drawnCard.title} — ${drawnCard.question}`;
  showQuestion(drawnCard);
  drawBtn.disabled = true;
}

function showQuestion(card){
  cardTitle.textContent = card.title;
  cardQuestion.textContent = card.question;
  answerInput.value = "";
  timerCount = 10;
  timerSpan.textContent = timerCount;
  questionPanel.classList.remove("hidden");
  answerInput.focus();
  if(questionTimer) clearInterval(questionTimer);
  questionTimer = setInterval(()=>{
    timerCount--;
    timerSpan.textContent = timerCount;
    if(timerCount <= 0){
      clearInterval(questionTimer);
      questionTimer = null;
      log(`Hết giờ! Tính là trả lời sai.`);
      hideQuestionPanel();
      processAnswer(false, "");
    }
  }, 1000);
}

function hideQuestionPanel(){
  questionPanel.classList.add("hidden");
  if(questionTimer){ clearInterval(questionTimer); questionTimer = null; }
}

// ---------- answer handling ----------
function handleSubmitAnswer(){
  if(!drawnCard) return;
  const raw = answerInput.value || "";
  const answer = raw.trim().toLowerCase();
  if(questionTimer){ clearInterval(questionTimer); questionTimer = null; }
  hideQuestionPanel();
  const isCorrect = checkAnswer(drawnCard, answer);
  processAnswer(isCorrect, answer);
}

function checkAnswer(card, answer){
  if(!answer) return false;
  const a = answer.replace(/\s+/g,' ').trim().toLowerCase();
  for(const acc of card.answers){
    const norm = acc.toLowerCase().trim();
    if(a === norm) return true;
  }
  return false;
}

function processAnswer(isCorrect, answerText){
  const attacker = teams[currentTurnIndex];
  const targets = teams.filter(t => t !== attacker && t.hp > 0);
  const target = targets.length ? targets[0] : null;
  log(`${attacker.name} rút: ${drawnCard.title}. Trả lời: "${answerText}" → ${isCorrect ? "ĐÚNG" : "SAI"}.`);
  const effect = isCorrect ? drawnCard.correctEffect : drawnCard.wrongEffect;
  applyEffect(effect, attacker, target, isCorrect);
  drawnCard = null;
  renderTeams();
  tickEndOfTurn();
  advanceTurn();
}

// ---------- effects ----------
function applyEffect(effect, attacker, target, isCorrect){
  if(!effect) return;
  const a = attacker;
  const t = target;
  switch(effect.type){
    case "damage": {
      if(!t) { log("No valid target."); break; }
      let dmg = effect.value + (a.status.extraDmg || 0);
      if(a.status.fatigue > 0) dmg = Math.max(0, dmg - 1);
      const absorbed = Math.min(t.shield, dmg);
      t.shield -= absorbed;
      const net = dmg - absorbed;
      t.hp = Math.max(0, t.hp - net);
      log(`${a.name} gây ${dmg} dmg lên ${t.name} (shield hấp thụ ${absorbed}).`);
      break;
    }

    case "grantShield":
      a.shield += effect.value;
      log(`${a.name} nhận khiên +${effect.value}.`);
      break;

    case "shieldLoss":
      a.shield = Math.max(0, a.shield - effect.value);
      log(`${a.name} mất ${effect.value} shield.`);
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

    case "heal":
      a.hp = Math.min(a.maxHp, a.hp + effect.value);
      log(`${a.name} hồi ${effect.value} HP.`);
      break;

    case "disableSkill":
      a.status.disabledSkill = (a.status.disabledSkill||0) + effect.value;
      log(`${a.name} không dùng kỹ năng đặc biệt ${effect.value} lượt.`);
      break;

    case "nextDamagePenalty":
      a.status.extraDmg = Math.max(0, (a.status.extraDmg||0) - effect.value);
      log(`${a.name} bị trừ sát thương lượt sau ${effect.value}.`);
      break;

    case "speed":
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
      log(`${a.name} bị debuff ${effect.debuff.name}.`);
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
      log(`${a.name} bốc thêm 1 lá bài (auto).`);
      const idx = Math.floor(Math.random() * CARDS.length);
      const card = CARDS[idx];
      applyEffect(card.correctEffect, a, target, true);
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
      log("Effect type chưa được implement: " + (effect.type || JSON.stringify(effect)));
  }

  teams.forEach(ti=>{
    if(ti.hp <= 0 && !ti.dead){
      ti.dead = true;
      log(`${ti.name} đã bị loại!`);
      const el = document.getElementById("team_" + ti.factionId);
      if(el) el.style.opacity = 0.5;
    }
  });
}

// ---------- end of turn tick ----------
function tickEndOfTurn(){
  teams.forEach(team=>{
    if(team.status.burn && team.status.burn.length){
      let totalBurn = 0;
      team.status.burn.forEach(b=>{
        totalBurn += b.dmg;
        b.turns--;
      });
      team.hp = Math.max(0, team.hp - totalBurn);
      log(`${team.name} chịu ${totalBurn} burn damage.`);
      team.status.burn = team.status.burn.filter(b=>b.turns > 0);
    }
    if(team.status.fatigue && team.status.fatigue>0) team.status.fatigue = Math.max(0, team.status.fatigue-1);
    if(team.status.disabledSkill && team.status.disabledSkill>0) team.status.disabledSkill--;
    if(team.status.cannotAttack && team.status.cannotAttack>0) team.status.cannotAttack--;
    if(team.status.slow && team.status.slow>0) team.status.slow = Math.max(0, team.status.slow-1);
    if(team.status.noDamageNext && team.status.noDamageNext>0) team.status.noDamageNext--;
    if(team.status.skipTurn && team.status.skipTurn>0) team.status.skipTurn = Math.max(0, team.status.skipTurn);
    updateTeamUI(team);
    updateStatusUI(team);
  });
}

// ---------- advance turn ----------
function advanceTurn(){
  const alive = teams.filter(t=>t.hp>0);
  if(alive.length <= 1){
    log("KẾT THÚC: " + (alive[0] ? alive[0].name + " thắng!" : "Không còn ai sống"));
    drawBtn.disabled = true;
    return;
  }
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

// ---------- reset ----------
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

// ---------- init ----------
setupSelection();

// ---------- expose globals ----------
window.setupSelection = setupSelection;
window.autoFill = autoFill;
window.startGame = startGame;
window.drawCard = drawCard;
window.unpick = unpick;
