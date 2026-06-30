// Markup original de Centro de mando (extraido del <body> del index.html).
// Se inyecta tal cual; la logica vive en central-command.app.ts.
export const MARKUP = `<canvas id="fx"></canvas>

<div class="topbar">
  <div class="topinner">
    <div class="brand">
      <span class="sigil">&lt;/&gt;</span>
      <span class="bt">Centro de mando</span>
      <button class="gear" id="openSync" title="Sincronización entre dispositivos" style="position:relative">⚙<span class="dot" id="syncDot" style="display:none"></span></button>
    </div>
    <div class="motto" id="motto"></div>
    <div class="tabs" id="tabs">
      <button class="tab active" data-target="p-rpg"  data-accent="purple"><span class="ic">🎮</span> RPG Study</button>
      <button class="tab"        data-target="p-road" data-accent="cyan"><span class="ic">🗺️</span> Roadmap</button>
      <button class="tab"        data-target="p-rep"  data-accent="gold"><span class="ic">🔁</span> Repaso</button>
      <button class="tab"        data-target="p-ctx"  data-accent="blue"><span class="ic">🔒</span> Contextos</button>
      <button class="tab"        data-target="p-job"  data-accent="teal"><span class="ic">🎯</span> Vacantes</button>
      <button class="tab"        data-target="p-port" data-accent="magenta"><span class="ic">📁</span> Portafolio</button>
      <button class="tab"        data-target="p-salud" data-accent="green"><span class="ic">💚</span> Salud mental</button>
    </div>
  </div>
</div>

<div class="stage">

  <!-- ================= RPG ================= -->
  <section class="panel active" id="p-rpg">
    <div class="phead">
      <div class="eyebrow" style="color:var(--purple)">Entrenamiento diario</div>
      <h1>RPG Study</h1>
      <p>Tu día en misiones. Toca una para completarla y ganar XP.</p>
    </div>
    <div class="stats">
      <div class="stat"><div class="k">Nivel</div><div class="v cyan" id="rpg-level">1</div></div>
      <div class="stat"><div class="k">XP hoy</div><div class="v gold" id="rpg-xptoday">0</div></div>
      <div class="stat"><div class="k">Racha</div><div class="v green" id="rpg-streak">0🔥</div></div>
      <div class="stat"><div class="k">Misiones</div><div class="v" id="rpg-missions">0/8</div></div>
    </div>
    <div class="levelcard">
      <div class="levelrow"><div class="lvl">Nivel <b id="rpg-lvlnum">1</b></div>
        <div class="xpnum"><span id="rpg-lvlcur">0</span> / <span id="rpg-lvlneed">400</span> XP</div></div>
      <div class="bar"><i id="rpg-lvlbar" style="width:0%"></i></div>
    </div>
    <h2>Misiones diarias <span class="tag">se reinician cada día</span></h2>
    <div class="missions" id="rpg-missionList"></div>
    <h2>Árbol de habilidades</h2>
    <div class="skills" id="rpg-skillList"></div>
    <div class="rpgpanels">
      <div class="ppanel">
        <h2 style="margin-top:0">Pomodoro <span class="tag">+150 XP</span></h2>
        <div class="pomo-time" id="rpg-pomo">25:00</div>
        <div class="pomo-btns">
          <button class="app-btn" id="rpg-pomoStart" style="background:linear-gradient(135deg,var(--purple),var(--cyan));border:none;color:#0E0B1A">Iniciar</button>
          <button class="app-btn" id="rpg-pomoReset">Reiniciar</button>
        </div>
      </div>
      <div class="ppanel">
        <h2 style="margin-top:0">Tema de hoy</h2>
        <div class="logform">
          <input id="rpg-topicIn" placeholder="¿Qué estudiaste hoy?">
          <button class="app-btn" id="rpg-topicAdd">Guardar</button>
        </div>
        <div id="rpg-log"></div>
      </div>
    </div>
    <div class="toolbar">
      <button class="app-btn" id="rpg-export">Exportar</button>
      <button class="app-btn" id="rpg-import">Importar</button>
      <button class="app-btn" id="rpg-resetDay">Reiniciar día</button>
      <input type="file" id="rpg-file" accept="application/json" class="file-hidden">
    </div>
    <div class="ftxt">rpg-study-v4 · datos locales</div>
  </section>

  <!-- ================= ROADMAP ================= -->
  <section class="panel" id="p-road">
    <div class="phead">
      <div class="eyebrow" style="color:var(--cyan)">Plan de 8 fases</div>
      <h1>Roadmap técnico</h1>
      <p>Marca cada tema al dominarlo. La barra muestra tu avance global.</p>
    </div>
    <div class="progress">
      <div class="row"><span>Progreso global</span><b id="rd-pct">0%</b></div>
      <div class="bar"><i id="rd-bar" style="width:0%"></i></div>
    </div>
    <div id="rd-phases"></div>
    <div class="toolbar">
      <button class="app-btn" id="rd-export">Exportar</button>
      <button class="app-btn" id="rd-import">Importar</button>
      <input type="file" id="rd-file" accept="application/json" class="file-hidden">
    </div>
    <div class="ftxt">roadmap-v4 · datos locales</div>
  </section>

  <!-- ================= REPASO ================= -->
  <section class="panel" id="p-rep">
    <div class="phead">
      <div class="eyebrow" style="color:var(--gold)">Memoria a largo plazo</div>
      <h1>Repaso espaciado</h1>
      <p>Escribe un tema y se agenda solo: +1 día, +3 días, +1 semana y +1 mes.</p>
    </div>
    <div class="addbar">
      <input id="rep-topic" placeholder="Ej. useMemo vs useCallback, cache-aside, IAM roles…">
      <button class="add" id="rep-add">Agendar</button>
    </div>
    <div class="seg" id="rep-seg">
      <button data-f="due" class="active">Toca hoy <span class="badge" id="rep-bDue">0</span></button>
      <button data-f="upcoming">Próximos <span class="badge" id="rep-bUp">0</span></button>
      <button data-f="done">Consolidados <span class="badge" id="rep-bDone">0</span></button>
    </div>
    <div class="cards" id="rep-cards"></div>
    <div class="toolbar">
      <button class="app-btn" id="rep-export">Exportar</button>
      <button class="app-btn" id="rep-import">Importar</button>
      <input type="file" id="rep-file" accept="application/json" class="file-hidden">
    </div>
    <div class="ftxt">repaso · datos locales</div>
  </section>

  <!-- ================= CONTEXTOS ================= -->
  <section class="panel" id="p-ctx">
    <div class="phead">
      <div class="eyebrow" style="color:var(--blue)">Handoff entre chats</div>
      <h1>Contextos</h1>
      <p>Guarda el contexto compactado de un chat y cópialo para arrancar otro sin repetir todo.</p>
    </div>
    <div class="composer">
      <div class="crow"><input id="ctx-title" placeholder="Título (ej. Estado de Botas Don Lalo)"></div>
      <div class="crow">
        <input id="ctx-project" list="ctx-projects" placeholder="Proyecto (ej. Job search, AWS, Botas)">
        <datalist id="ctx-projects"></datalist>
      </div>
      <textarea id="ctx-body" placeholder="Pega aquí el contexto compactado del chat…"></textarea>
      <div class="ccontrols">
        <span class="tokest" id="ctx-tok">~0 tokens</span>
        <button class="save" id="ctx-save">Guardar en la bóveda</button>
      </div>
    </div>
    <div class="filters">
      <input class="search" id="ctx-search" placeholder="Buscar…">
      <div id="ctx-chips"></div>
    </div>
    <div class="entries" id="ctx-entries"></div>
    <div class="toolbar">
      <button class="app-btn" id="ctx-export">Exportar</button>
      <button class="app-btn" id="ctx-import">Importar</button>
      <input type="file" id="ctx-file" accept="application/json" class="file-hidden">
    </div>
    <div class="ftxt">contextos · datos locales</div>
  </section>

  <!-- ================= ANALIZADOR ================= -->
  <section class="panel" id="p-job">
    <div class="phead">
      <div class="eyebrow" style="color:var(--teal)">Job search</div>
      <h1>Analizador de vacantes</h1>
      <p>Pega una descripción y cruza tu perfil: qué cubres, qué falta, inglés y modalidad.</p>
    </div>
    <div id="job-avg"></div>

    <div class="newproj" id="job-profile-card" style="margin-bottom:18px">
      <h2 style="margin-top:0">Tu perfil <span class="tag">se guarda solo</span></h2>
      <p style="margin:0 0 10px;color:#9C95C2;font-size:13px">Llénalo una vez. Cada vacante que analices se compara contra esto.</p>
      <div class="crow"><textarea id="job-profile-skills" placeholder="Skills que ya dominas, separadas por coma (ej. React, JavaScript, Node.js, Git, HTML, CSS)" style="min-height:60px"></textarea></div>
      <div class="crow"><textarea id="job-profile-gaps" placeholder="Skills que NO dominas pero ves seguido en vacantes, separadas por coma (ej. TypeScript, Docker, GraphQL)" style="min-height:60px"></textarea></div>
      <div class="crow"><input id="job-profile-english" placeholder="Tu nivel de inglés (ej. B1, intermedio, avanzado)"></div>
      <button class="app-btn" id="job-profile-save">Guardar perfil</button>
      <span id="job-profile-saved" style="margin-left:10px;color:#34D399;font-size:13px;display:none">Guardado ✓</span>
    </div>

    <input id="job-name" placeholder="Nombre de la vacante (empresa · puesto)" style="margin-bottom:10px">
    <textarea id="job-jd" placeholder="Pega aquí la descripción completa de la vacante…"></textarea>
    <button class="go" id="job-analyze">Analizar</button>
    <div class="result" id="job-result">
      <div class="scorecard">
        <div class="ring" id="job-ring"></div>
        <div class="verdict">
          <div class="v" id="job-verdict"></div>
          <div class="vd" id="job-verdictD"></div>
          <div class="flags" id="job-flags"></div>
        </div>
      </div>
      <div class="jgrid">
        <div class="col"><h3 style="color:var(--green)">Cubres</h3><div id="job-matches"></div></div>
        <div class="col"><h3 style="color:var(--gold)">Brechas a cubrir</h3><div id="job-gaps"></div></div>
      </div>
      <div class="savebar"><button class="savebtn" id="job-save">💾 Guardar vacante con su % de match</button></div>
    </div>
    <h2 class="sec" id="job-savedTitle" style="display:none">Vacantes guardadas</h2>
    <div class="saved-list" id="job-saved"></div>
    <div class="ftxt">analizador-vacantes · heurística local</div>
  </section>

  <!-- ================= PORTAFOLIO ================= -->
  <section class="panel" id="p-port">
    <div class="phead">
      <div class="eyebrow" style="color:var(--magenta)">Proyectos</div>
      <h1>Portafolio</h1>
      <p>Organiza los proyectos de tu portafolio en tareas y subtareas. El porcentaje de avance se calcula solo conforme las completas.</p>
    </div>
    <div class="newproj">
      <input id="port-title" placeholder="Título del proyecto (ej. Dashboard con Next.js + TanStack Query)">
      <textarea id="port-desc" placeholder="Descripción (qué es, stack, objetivo)…"></textarea>
      <button class="createbtn" id="port-create">Crear proyecto</button>
    </div>
    <div id="port-list"></div>
    <div class="toolbar">
      <button class="app-btn" id="port-export">Exportar</button>
      <button class="app-btn" id="port-import">Importar</button>
      <input type="file" id="port-file" accept="application/json" class="file-hidden">
    </div>
    <div class="ftxt">portfolio-projects · datos locales</div>
  </section>

  <!-- ================= SALUD MENTAL ================= -->
  <section class="panel" id="p-salud">
    <div class="phead">
      <div class="eyebrow" style="color:var(--green)">Cuidado personal</div>
      <h1>Salud mental</h1>
      <p>Lo mínimo para estar bien. Se reinicia cada día.</p>
    </div>
    <div class="stats">
      <div class="stat"><div class="k">Hoy</div><div class="v green" id="salud-count">0/5</div></div>
      <div class="stat"><div class="k">Racha</div><div class="v gold" id="salud-streak">0🔥</div></div>
    </div>
    <div class="missions" id="salud-list"></div>
    <div class="toolbar">
      <button class="app-btn" id="salud-resetDay">Reiniciar día</button>
    </div>
    <div class="ftxt">salud-checklist-v1 · datos locales</div>
  </section>

</div>
<div class="overlay" id="syncOverlay">
  <div class="modal">
    <h2>🔄 Sincronización</h2>
    <p class="desc">Guarda tu progreso en tu propio servidor para que no se pierda entre computadoras. Tus datos siguen guardándose local; esto solo agrega una copia en la nube que tú controlas.</p>
    <div class="field">
      <label>URL del servidor</label>
      <input id="syncUrl" placeholder="https://tu-proyecto.vercel.app/api/sync">
      <div class="hint">El endpoint de tu función en Vercel (instrucciones en el README).</div>
    </div>
    <div class="field">
      <label>Tu código de sync (tu llave personal)</label>
      <input id="syncCode" placeholder="ej. lalo-7f3a9c2e…">
      <div class="hint">Úsalo igual en todas tus computadoras. <button class="codegen" id="genCode">Generar uno aleatorio</button></div>
    </div>
    <div class="syncstatus" id="syncStatus"><span class="sdot"></span><span id="syncStatusText">Sin configurar</span></div>
    <div class="modal-actions">
      <button class="mbtn primary grow" id="syncNow">Guardar y sincronizar ahora</button>
      <button class="mbtn" id="syncClose">Cerrar</button>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>`;
