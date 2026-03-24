/* ========== STATE ========== */
const DEF = {
    timezone: "America/New_York",
    savedNames: [
        "Uthman Saiyed",
        "Ibrahim Hassan",
        "Yusuf Malik",
        "Abdullah Rahman",
    ],
    savedSessions: ["Sabaq", "Sabqi", "Manzil", "Juz Test", "Dhor"],
    savedComments: [
        "Masha Allah, Passed.",
        "Needs improvement.",
        "Good progress.",
        "Alhamdulillah, well done.",
        "Please practice more.",
    ],
};
let S = { ...DEF, selectedSession: "" };
const SHOW_LIMIT = 5;
let showAllNames = false,
    showAllSessions = false,
    showAllComments = false;

/* ========== INIT ========== */
function init() {
    loadStorage();
    updateDate();
    setInterval(updateDate, 30000);
    const yr = new Date().getFullYear();
    document
        .querySelectorAll("#copy-year, #settings-copy-year")
        .forEach((el) => (el.textContent = yr));
    addEntry("mistake");
    addEntry("stuck");
    renderCS();
    renderSM();
    document.getElementById("tz-select").value = S.timezone;
}

function loadStorage() {
    try {
        const d = JSON.parse(localStorage.getItem("spr-v2") || "{}");
        if (d.timezone) S.timezone = d.timezone;
        if (Array.isArray(d.savedNames)) S.savedNames = d.savedNames;
        if (Array.isArray(d.savedSessions)) S.savedSessions = d.savedSessions;
        if (Array.isArray(d.savedComments)) S.savedComments = d.savedComments;
    } catch (e) { }
}

function persist() {
    localStorage.setItem(
        "spr-v2",
        JSON.stringify({
            timezone: S.timezone,
            savedNames: S.savedNames,
            savedSessions: S.savedSessions,
            savedComments: S.savedComments,
        }),
    );
}

/* ========== DATE ========== */
function updateDate() {
    try {
        document.getElementById("current-date").textContent =
            new Date().toLocaleDateString("en-US", {
                timeZone: S.timezone,
                month: "numeric",
                day: "numeric",
                year: "numeric",
            });
    } catch (e) {
        document.getElementById("current-date").textContent =
            new Date().toLocaleDateString();
    }
}
function saveTZ() {
    S.timezone = document.getElementById("tz-select").value;
    persist();
    updateDate();
    toast("✓ Timezone updated");
}

/* ========== JUZ / PAGE ========== */
function maxPage(juz) {
    const j = parseInt(juz);
    if (!j || j < 1 || j > 30) return null;
    if (j <= 28) return 20;
    if (j === 29) return 24;
    return 25;
}
function onJuzChange() {
    const max = maxPage(document.getElementById("juz-num").value);
    document.getElementById("page-hint").textContent = max
        ? "Max: " + max
        : "Enter Juz first";
    if (max) document.getElementById("page-num").setAttribute("max", max);
    else document.getElementById("page-num").removeAttribute("max");
    onPageChange();
}
function onPageChange() {
    const juz = parseInt(document.getElementById("juz-num").value);
    const val = document.getElementById("page-num").value;
    const max = maxPage(juz);
    const inp = document.getElementById("page-num");
    inp.style.borderColor =
        max && val && parseInt(val) > max ? "var(--danger)" : "";
}

/* ========== AUTOCOMPLETE ========== */
let acIdx = -1;
function showAC() {
    acIdx = -1;
    const val = document
        .getElementById("student-name")
        .value.trim()
        .toLowerCase();
    const dd = document.getElementById("ac-dropdown");
    if (!val) {
        dd.classList.remove("show");
        return;
    }
    const m = S.savedNames.filter((n) => n.toLowerCase().includes(val));
    if (!m.length) {
        dd.classList.remove("show");
        return;
    }
    dd.innerHTML = m
        .map(
            (n) =>
                `<div class="ac-item" onmousedown="pickName(${JSON.stringify(n)})">${n}</div>`,
        )
        .join("");
    dd.classList.add("show");
}
function hideAC() {
    setTimeout(
        () => document.getElementById("ac-dropdown").classList.remove("show"),
        160,
    );
}
function pickName(n) {
    document.getElementById("student-name").value = n;
    document.getElementById("ac-dropdown").classList.remove("show");
    acIdx = -1;
}
function acKeyDown(e) {
    const dd = document.getElementById("ac-dropdown");
    const items = [...dd.querySelectorAll(".ac-item")];
    if (!dd.classList.contains("show") || !items.length) return;
    if (e.key === "ArrowDown") {
        e.preventDefault();
        acIdx = Math.min(acIdx + 1, items.length - 1);
        items.forEach((it, i) =>
            it.classList.toggle("ac-active", i === acIdx),
        );
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        acIdx = Math.max(acIdx - 1, 0);
        items.forEach((it, i) =>
            it.classList.toggle("ac-active", i === acIdx),
        );
    } else if (e.key === "Enter") {
        e.preventDefault();
        const t = acIdx >= 0 ? items[acIdx] : items[0];
        if (t) pickName(t.textContent);
    } else if (e.key === "Escape") {
        dd.classList.remove("show");
        acIdx = -1;
    }
}

/* ========== CUSTOM SELECT ========== */
let csIdx = -1;
function renderCS() {
    const dd = document.getElementById("cs-dropdown");
    dd.innerHTML =
        S.savedSessions
            .map(
                (s) =>
                    `<div class="cs-item ${S.selectedSession === s ? "selected" : ""}" onclick='pickSession(${JSON.stringify(s)})'><span>${s}</span></div>`,
            )
            .join("") +
        `<div class="cs-add-row">
<input class="cs-add-input" id="cs-add-inp" placeholder="New session…" onkeydown="if(event.key==='Enter')addSessionInline()">
<button class="btn-xs" onclick="addSessionInline()">+ Add</button>
</div>`;
}
function toggleCS() {
    const dd = document.getElementById("cs-dropdown");
    const btn = document.getElementById("cs-btn");
    dd.classList.toggle("open");
    btn.classList.toggle("active", dd.classList.contains("open"));
    csIdx = -1;
}
function pickSession(s) {
    S.selectedSession = s;
    const sel = document.getElementById("cs-selected");
    sel.textContent = s;
    sel.style.color = "";
    sel.style.fontStyle = "";
    setTimeout(() => {
        document.getElementById("cs-dropdown").classList.remove("open");
        document.getElementById("cs-btn").classList.remove("active");
    }, 0);
    renderCS();
}
function addSessionInline() {
    const inp = document.getElementById("cs-add-inp");
    if (!inp) return;
    const v = inp.value.trim();
    if (!v || S.savedSessions.includes(v)) return;
    S.savedSessions.push(v);
    persist();
    renderCS();
    renderSessionsList();
}
function csKeyDown(e) {
    const dd = document.getElementById("cs-dropdown");
    if (!dd.classList.contains("open")) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCS();
        }
        return;
    }
    const items = [...dd.querySelectorAll(".cs-item")];
    if (e.key === "ArrowDown") {
        e.preventDefault();
        csIdx = Math.min(csIdx + 1, items.length - 1);
        items.forEach((it, i) =>
            it.classList.toggle("kb-focus", i === csIdx),
        );
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        csIdx = Math.max(csIdx - 1, 0);
        items.forEach((it, i) =>
            it.classList.toggle("kb-focus", i === csIdx),
        );
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (csIdx >= 0 && items[csIdx])
            pickSession(items[csIdx].querySelector("span").textContent);
        csIdx = -1;
    } else if (e.key === "Escape") {
        dd.classList.remove("open");
        document.getElementById("cs-btn").classList.remove("active");
        csIdx = -1;
    }
}

/* ========== ENTRIES ========== */
function addEntry(type) {
    const list = document.getElementById(type + "-list");
    const row = document.createElement("div");
    row.className = "entry-row";

    const pageInp = document.createElement("input");
    pageInp.type = "number";
    pageInp.min = 1;
    pageInp.className = "e-input";
    pageInp.placeholder = "__";
    pageInp.dataset.role = "page";
    pageInp.title =
        "Page number (Enter → go to Ayah; Backspace on empty → delete row)";
    pageInp.oninput = () => recalc(type);
    pageInp.onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            focusAyah(row);
        }
        if (e.key === "Backspace" && !pageInp.value) {
            const rows = list.querySelectorAll(".entry-row");
            if (rows.length > 1) {
                e.preventDefault();
                const idx = [...rows].indexOf(row);
                row.remove();
                recalc(type);
                updateDelBtns(type);
                const rem = list.querySelectorAll(".entry-row");
                const prev = rem[Math.max(0, idx - 1)];
                if (prev) prev.querySelector("input").focus();
            }
        }
    };

    const ayahWrap = document.createElement("div");
    ayahWrap.className = "ayah-wrap";

    const delBtn = document.createElement("button");
    delBtn.className = "entry-del";
    delBtn.innerHTML = "✕";
    delBtn.title = "Remove this row (or Backspace on empty Page field)";
    delBtn.onclick = () => removeEntry(type, row);

    row.appendChild(mkSpan("entry-lbl", "Page"));
    row.appendChild(pageInp);
    row.appendChild(mkSpan("entry-lbl", "Ayah"));
    row.appendChild(ayahWrap);
    row.appendChild(delBtn);
    list.appendChild(row);

    addAyahInput(type, ayahWrap, false);
    updateDelBtns(type);
    setTimeout(() => pageInp.focus(), 30);
    recalc(type);
}

function updateDelBtns(type) {
    const rows = document
        .getElementById(type + "-list")
        .querySelectorAll(".entry-row");
    rows.forEach((row, i) => {
        const btn = row.querySelector(".entry-del");
        if (btn) btn.classList.toggle("hidden", i === 0);
    });
}

function addAyahInput(type, ayahWrap, withComma) {
    const group = document.createElement("span");
    group.className = "ayah-group";
    if (withComma) {
        const c = document.createElement("span");
        c.className = "ayah-comma";
        c.textContent = ",";
        group.appendChild(c);
    }
    const inp = document.createElement("input");
    inp.type = "number";
    inp.min = 1;
    inp.className = "e-input";
    inp.placeholder = "__";
    inp.dataset.role = "ayah";
    inp.title =
        "Ayah number — Tab: add more Ayah on same line | Enter: new row | Backspace on empty: remove";
    inp.oninput = () => recalc(type);
    inp.onkeydown = (e) => {
        if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            addAyahInput(type, ayahWrap, true);
            const all = ayahWrap.querySelectorAll("input");
            if (all.length) all[all.length - 1].focus();
        } else if (e.key === "Enter") {
            e.preventDefault();
            addEntry(type);
        } else if (e.key === "Backspace" && !inp.value) {
            const allG = ayahWrap.querySelectorAll(".ayah-group");
            if (allG.length > 1) {
                group.remove();
                recalc(type);
                const rem = ayahWrap.querySelectorAll("input");
                if (rem.length) rem[rem.length - 1].focus();
            }
        }
    };
    group.appendChild(inp);
    ayahWrap.appendChild(group);
}

function focusAyah(row) {
    const i = row.querySelector(".ayah-wrap input");
    if (i) i.focus();
}
function removeEntry(type, row) {
    const list = document.getElementById(type + "-list");
    if (list.querySelectorAll(".entry-row").length === 1) {
        row.querySelector('input[data-role="page"]').value = "";
        const aw = row.querySelector(".ayah-wrap");
        aw.querySelectorAll(".ayah-group").forEach((g, i) => {
            if (i > 0) g.remove();
        });
        aw.querySelector("input").value = "";
    } else {
        row.remove();
    }
    recalc(type);
    updateDelBtns(type);
}
function recalc(type) {
    let count = 0;
    document
        .getElementById(type + "-list")
        .querySelectorAll(".entry-row")
        .forEach((row) => {
            if (row.querySelector('input[data-role="page"]').value)
                row.querySelectorAll(".ayah-wrap input").forEach((inp) => {
                    if (inp.value) count++;
                });
        });
    document.getElementById(type + "-count").textContent = count;
    document.getElementById(type + "-pill").textContent = count;
}
function getEntriesText(type) {
    const lines = [];
    document
        .getElementById(type + "-list")
        .querySelectorAll(".entry-row")
        .forEach((row) => {
            const page = row.querySelector('input[data-role="page"]').value;
            if (!page) return;
            const ayahs = [];
            row.querySelectorAll(".ayah-wrap input").forEach((inp) => {
                if (inp.value) ayahs.push(inp.value);
            });
            if (ayahs.length)
                lines.push(`Page ${page} Ayah ${ayahs.join(", ")}`);
        });
    return lines.join("\n");
}
function mkSpan(cls, text) {
    const s = document.createElement("span");
    s.className = cls;
    s.textContent = text;
    return s;
}

/* ========== SAVED MESSAGES ========== */
let smIdx = -1;
function renderSM() {
    const dd = document.getElementById("sm-dropdown");
    dd.innerHTML =
        S.savedComments
            .map(
                (c, i) =>
                    `<div class="sm-item" onclick='pickComment(${JSON.stringify(c)})'>
<span class="sm-item-text">${c}</span>
<span class="sm-del" onclick="delSavedComment(event,${i})">✕</span>
</div>`,
            )
            .join("") +
        `<div class="sm-add-row">
<input class="sm-add-input" id="sm-add-inp" placeholder="New comment…" onkeydown="if(event.key==='Enter')addCommentInline()">
<button class="btn-xs" onclick="addCommentInline()">+ Add</button>
</div>`;
}
function toggleSavedMsgs() {
    document.getElementById("sm-dropdown").classList.toggle("open");
    smIdx = -1;
}
function pickComment(c) {
    const ta = document.getElementById("comment-ta");
    ta.value = ta.value.trim() ? ta.value.trim() + "\n" + c : c;
    setTimeout(
        () => document.getElementById("sm-dropdown").classList.remove("open"),
        0,
    );
}
function delSavedComment(e, idx) {
    e.stopPropagation();
    S.savedComments.splice(idx, 1);
    persist();
    renderSM();
    renderCommentsList();
}
function addCommentInline() {
    const inp = document.getElementById("sm-add-inp");
    if (!inp) return;
    const v = inp.value.trim();
    if (!v || S.savedComments.includes(v)) return;
    S.savedComments.push(v);
    persist();
    renderSM();
    renderCommentsList();
    inp.value = "";
}
function smKeyDown(e) {
    const dd = document.getElementById("sm-dropdown");
    if (!dd.classList.contains("open")) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleSavedMsgs();
        }
        return;
    }
    const items = [...dd.querySelectorAll(".sm-item")];
    if (e.key === "ArrowDown") {
        e.preventDefault();
        smIdx = Math.min(smIdx + 1, items.length - 1);
        items.forEach((it, i) =>
            it.classList.toggle("kb-focus", i === smIdx),
        );
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        smIdx = Math.max(smIdx - 1, 0);
        items.forEach((it, i) =>
            it.classList.toggle("kb-focus", i === smIdx),
        );
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (smIdx >= 0 && items[smIdx])
            pickComment(
                items[smIdx].querySelector(".sm-item-text").textContent,
            );
        smIdx = -1;
    } else if (e.key === "Escape") {
        dd.classList.remove("open");
        smIdx = -1;
    }
}

/* ========== COPY REPORT ========== */
function copyReport() {
    const date = document.getElementById("current-date").textContent;
    const name =
        document.getElementById("student-name").value.trim() || "—";
    const juz = document.getElementById("juz-num").value || "—";
    const page = document.getElementById("page-num").value || "—";
    const sess = S.selectedSession || "—";
    const mc =
        parseInt(document.getElementById("mistake-count").textContent) || 0;
    const sc =
        parseInt(document.getElementById("stuck-count").textContent) || 0;
    const mt = getEntriesText("mistake");
    const st = getEntriesText("stuck");
    const comm = document.getElementById("comment-ta").value.trim();

    const lines = [
        "Student Daily Progress Report",
        `Date: ${date}`,
        `Student Name: ${name}`,
        "",
        `Juz Number: ${juz}`,
        `Page: ${page}`,
        "",
        "Session Summary",
        `Session Name: ${sess}`,
    ];
    if (mc > 0) lines.push(`Mistake: ${mc}`);
    if (sc > 0) lines.push(`Stuck: ${sc}`);
    if (mc > 0) {
        lines.push("");
        lines.push("Mistake");
        lines.push(mt || "—");
    }
    if (sc > 0) {
        lines.push("");
        lines.push("Stuck");
        lines.push(st || "—");
    }
    if (comm) {
        lines.push("");
        lines.push("Comment");
        lines.push(comm);
    }

    const text = lines.join("\n");
    const btn = document.getElementById("copy-btn");
    navigator.clipboard
        .writeText(text)
        .then(() => { })
        .catch(() => {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.cssText = "position:fixed;opacity:0;";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        });
    toast("✓ Report copied!");
    btn.textContent = "✓ Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
        btn.innerHTML = "⧉ Copy Report";
        btn.classList.remove("copied");
    }, 2200);
}

/* ========== RESET ========== */
function resetForm() {
    document.getElementById("student-name").value = "";
    document.getElementById("juz-num").value = "";
    document.getElementById("page-num").value = "";
    document.getElementById("page-hint").textContent = "Enter Juz first";
    document.getElementById("page-num").style.borderColor = "";
    S.selectedSession = "";
    const sel = document.getElementById("cs-selected");
    sel.textContent = "Select session…";
    sel.style.color = "var(--text-light)";
    sel.style.fontStyle = "italic";
    renderCS();
    document.getElementById("comment-ta").value = "";
    document.getElementById("mistake-list").innerHTML = "";
    document.getElementById("stuck-list").innerHTML = "";
    addEntry("mistake");
    addEntry("stuck");
    toast("↺ Form reset");
}

/* ========== SETTINGS ========== */
function openSettings() {
    document.getElementById("settings-modal").classList.add("open");
    document.getElementById("tz-select").value = S.timezone;
    renderNamesList();
    renderSessionsList();
    renderCommentsList();
}
function closeSettings() {
    document.getElementById("settings-modal").classList.remove("open");
}
function onOverlayClick(e) {
    if (e.target === document.getElementById("settings-modal"))
        closeSettings();
}

function renderList(id, arr, delFn, showAll, toggleFn) {
    const c = document.getElementById(id);
    if (!arr.length) {
        c.innerHTML =
            '<div style="color:var(--text-light);font-size:12.5px;padding:4px 0;">None saved</div>';
        return;
    }
    const vis = showAll ? arr : arr.slice(0, SHOW_LIMIT);
    let html = vis
        .map(
            (n, i) => `<div class="settings-item">
<span class="settings-item-text">${n}</span>
<button class="settings-del" onclick="${delFn}(${i})" title="Delete">✕</button>
</div>`,
        )
        .join("");
    if (arr.length > SHOW_LIMIT)
        html += `<button class="show-toggle" onclick="${toggleFn}()">${showAll ? "▲ Show less" : "▼ Show more (" + (arr.length - SHOW_LIMIT) + " more)"}</button>`;
    c.innerHTML = html;
}
function renderNamesList() {
    renderList(
        "s-names-list",
        S.savedNames,
        "delName",
        showAllNames,
        "toggleNames",
    );
}
function renderSessionsList() {
    renderList(
        "s-sessions-list",
        S.savedSessions,
        "delSession",
        showAllSessions,
        "toggleSessions",
    );
}
function renderCommentsList() {
    renderList(
        "s-comments-list",
        S.savedComments,
        "delComment",
        showAllComments,
        "toggleCommentsAll",
    );
}
function toggleNames() {
    showAllNames = !showAllNames;
    renderNamesList();
}
function toggleSessions() {
    showAllSessions = !showAllSessions;
    renderSessionsList();
}
function toggleCommentsAll() {
    showAllComments = !showAllComments;
    renderCommentsList();
}

function addSavedName() {
    const v = document.getElementById("s-name-input").value.trim();
    if (!v || S.savedNames.includes(v)) return;
    S.savedNames.push(v);
    persist();
    renderNamesList();
    document.getElementById("s-name-input").value = "";
}
function delName(i) {
    S.savedNames.splice(i, 1);
    persist();
    renderNamesList();
}
function addSavedSession() {
    const v = document.getElementById("s-session-input").value.trim();
    if (!v || S.savedSessions.includes(v)) return;
    S.savedSessions.push(v);
    persist();
    renderSessionsList();
    renderCS();
    document.getElementById("s-session-input").value = "";
}
function delSession(i) {
    S.savedSessions.splice(i, 1);
    persist();
    renderSessionsList();
    renderCS();
}
function addSavedComment() {
    const v = document.getElementById("s-comment-input").value.trim();
    if (!v || S.savedComments.includes(v)) return;
    S.savedComments.push(v);
    persist();
    renderCommentsList();
    renderSM();
    document.getElementById("s-comment-input").value = "";
}
function delComment(i) {
    S.savedComments.splice(i, 1);
    persist();
    renderCommentsList();
    renderSM();
}

/* ========== GLOBAL EVENTS ========== */
document.addEventListener("click", function (e) {
    const csWrap = document.getElementById("cs-wrap");
    if (csWrap && !csWrap.contains(e.target)) {
        document.getElementById("cs-dropdown").classList.remove("open");
        document.getElementById("cs-btn").classList.remove("active");
    }
    const smDd = document.getElementById("sm-dropdown");
    if (
        smDd &&
        !smDd.contains(e.target) &&
        !e.target.classList.contains("saved-msg-btn")
    )
        smDd.classList.remove("open");
});
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeSettings();
        document.getElementById("cs-dropdown").classList.remove("open");
        document.getElementById("cs-btn").classList.remove("active");
        document.getElementById("sm-dropdown").classList.remove("open");
        document.getElementById("ac-dropdown").classList.remove("show");
    }
    if (e.key === "Enter") {
        if (e.target.id === "s-name-input") addSavedName();
        else if (e.target.id === "s-session-input") addSavedSession();
        else if (e.target.id === "s-comment-input") addSavedComment();
    }
});

/* ========== TOAST ========== */
function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2500);
}

init();
