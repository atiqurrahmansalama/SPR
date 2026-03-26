// ==================== MODERN JAVASCRIPT (ES6+) ====================

// App State
const AppState = {
    timezone: "Asia/Dhaka",
    theme: "classic",
    dark: 0,
    savedNames: [
    { name: "Uthman Saiyed", group: "Ml Saqib" },
    { name: "Ibrahim Hassan", group: "Ml Saqib" },
    { name: "Yusuf Malik", group: "Ml Saqib" },
    { name: "Abdullah Rahman", group: "Ml Saqib" }
    ],
    savedSessions: ["Sabaq", "Sabqi", "Manzil", "Juz Test", "Dhor"],
    savedComments: ["Masha Allah, excellent!", "Needs improvement", "Good progress", "Alhamdulillah", "Practice more"],
    selectedSession: "",
    juzRows: [],
    showAllNames: false,
    showAllSessions: false,
    showAllComments: false
};

// Helper Functions
const showToast = (msg) => {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
};

const persist = () => {
    localStorage.setItem("spr-v5", JSON.stringify({
    timezone: AppState.timezone,
    theme: AppState.theme,
    dark: AppState.dark,
    savedNames: AppState.savedNames,
    savedSessions: AppState.savedSessions,
    savedComments: AppState.savedComments
    }));
};

const loadStorage = () => {
    try {
    const d = JSON.parse(localStorage.getItem("spr-v5") || "{}");
    if (d.timezone) AppState.timezone = d.timezone;
    if (d.theme) AppState.theme = d.theme;
    if (typeof d.dark === "number") AppState.dark = d.dark;
    if (Array.isArray(d.savedNames)) AppState.savedNames = d.savedNames.map(n => typeof n === "string" ? { name: n, group: "" } : n);
    if (Array.isArray(d.savedSessions)) AppState.savedSessions = d.savedSessions;
    if (Array.isArray(d.savedComments)) AppState.savedComments = d.savedComments;
    } catch(e) {}
};

// Theme Functions
const applyTheme = () => {
    const html = document.documentElement;
    html.setAttribute("data-theme", AppState.theme);
    html.setAttribute("data-dark", AppState.dark);
    document.querySelectorAll(".theme-dot").forEach(d => d.classList.toggle("active", d.dataset.t === AppState.theme));
    document.querySelectorAll(".theme-opt").forEach(o => o.classList.toggle("active", o.dataset.t === AppState.theme));
    const darkBtn = document.getElementById("dark-btn");
    if (darkBtn) darkBtn.textContent = AppState.dark ? "☀️" : "🌙";
    const darkChk = document.getElementById("dark-toggle-chk");
    if (darkChk) darkChk.checked = AppState.dark === 1;
};

window.setTheme = (t) => { AppState.theme = t; persist(); applyTheme(); showToast("Theme updated"); };
window.toggleDark = () => { AppState.dark = AppState.dark ? 0 : 1; persist(); applyTheme(); };
window.toggleDarkFromSettings = (chk) => { AppState.dark = chk.checked ? 1 : 0; persist(); applyTheme(); };

// Date Functions
const updateDate = () => {
    try {
    document.getElementById("current-date").textContent = new Date().toLocaleDateString("en-US", {
        timeZone: AppState.timezone, month: "numeric", day: "numeric", year: "numeric"
    });
    } catch(e) {
    document.getElementById("current-date").textContent = new Date().toLocaleDateString();
    }
};

window.saveTZ = () => {
    AppState.timezone = document.getElementById("tz-select").value;
    persist();
    updateDate();
    showToast("✓ Timezone updated");
};

// Juz Functions
const maxPage = (juz) => {
    const j = parseInt(juz);
    if (!j || j < 1 || j > 30) return null;
    if (j <= 28) return 20;
    if (j === 29) return 24;
    return 25;
};

const renderJuzRows = () => {
    const wrap = document.getElementById("juz-multi-wrap");
    if (!wrap) return;
    wrap.innerHTML = "";
    AppState.juzRows.forEach((row, idx) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "juz-row";
    
    const juzInput = document.createElement("input");
    juzInput.type = "number";
    juzInput.className = "juz-num-input";
    juzInput.min = 1;
    juzInput.max = 30;
    juzInput.placeholder = "Juz";
    juzInput.value = row.juz || "";
    juzInput.oninput = () => {
        AppState.juzRows[idx].juz = juzInput.value;
        renderJuzPageTabs(idx);
        updateEntryJuzSelects();
    };
    
    const pageTabs = document.createElement("div");
    pageTabs.className = "juz-page-tabs";
    pageTabs.id = `juz-page-tabs-${idx}`;
    
    const delBtn = document.createElement("button");
    delBtn.className = "juz-del-btn";
    delBtn.textContent = "✕";
    delBtn.onclick = () => {
        if (AppState.juzRows.length > 1) {
        AppState.juzRows.splice(idx, 1);
        renderJuzRows();
        updateEntryJuzSelects();
        }
    };
    delBtn.style.display = AppState.juzRows.length > 1 ? "" : "none";
    
    rowDiv.appendChild(juzInput);
    rowDiv.appendChild(pageTabs);
    rowDiv.appendChild(delBtn);
    wrap.appendChild(rowDiv);
    
    renderJuzPageTabs(idx);
    });
};

const renderJuzPageTabs = (idx) => {
    const container = document.getElementById(`juz-page-tabs-${idx}`);
    if (!container) return;
    const row = AppState.juzRows[idx];
    if (!row.pages) row.pages = [""];
    container.innerHTML = "";
    
    row.pages.forEach((pageVal, pIdx) => {
    const tabSpan = document.createElement("span");
    tabSpan.className = "juz-page-tab";
    
    if (pIdx > 0) {
        const sep = document.createElement("span");
        sep.className = "juz-page-sep";
        sep.textContent = " / ";
        tabSpan.appendChild(sep);
    }
    
    const pageInput = document.createElement("input");
    pageInput.type = "text";
    pageInput.className = "page-tab-input";
    pageInput.placeholder = "Page";
    pageInput.value = pageVal;
    pageInput.oninput = () => {
        row.pages[pIdx] = pageInput.value;
        const max = maxPage(row.juz);
        if (max && parseInt(pageInput.value) > max) {
        pageInput.style.borderColor = "var(--danger)";
        } else {
        pageInput.style.borderColor = "";
        }
    };
    pageInput.onkeydown = (e) => {
        if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        row.pages.push("");
        renderJuzPageTabs(idx);
        const inputs = container.querySelectorAll(".page-tab-input");
        if (inputs.length) inputs[inputs.length - 1].focus();
        } else if (e.key === "Backspace" && !pageInput.value && row.pages.length > 1) {
        e.preventDefault();
        row.pages.splice(pIdx, 1);
        renderJuzPageTabs(idx);
        }
    };
    
    tabSpan.appendChild(pageInput);
    container.appendChild(tabSpan);
    });
    
    const hint = document.createElement("span");
    hint.className = "page-tab-hint";
    const max = maxPage(row.juz);
    hint.textContent = max ? `max ${max}` : "";
    container.appendChild(hint);
};

window.addJuzRow = () => {
    AppState.juzRows.push({ juz: "", pages: [""] });
    renderJuzRows();
    updateEntryJuzSelects();
};

const getActiveJuzList = () => {
    return AppState.juzRows.map(r => r.juz).filter(j => j && parseInt(j) >= 1 && parseInt(j) <= 30);
};

const updateEntryJuzSelects = () => {
    const juzList = getActiveJuzList();
    ["mistake", "stuck"].forEach(type => {
    const list = document.getElementById(`${type}-list`);
    if (!list) return;
    list.querySelectorAll(".entry-juz-select").forEach(sel => {
        const cur = sel.value;
        sel.innerHTML = juzList.map(j => `<option value="${j}">${j}</option>`).join("");
        if (juzList.includes(cur)) sel.value = cur;
        const show = juzList.length > 1;
        sel.style.display = show ? "" : "none";
        const lbl = sel.previousElementSibling;
        if (lbl?.classList?.contains("entry-juz-label")) lbl.style.display = show ? "" : "none";
    });
    });
};

// Entry Functions
const recalc = (type) => {
    let count = 0;
    const list = document.getElementById(`${type}-list`);
    if (!list) return;
    list.querySelectorAll(".entry-row").forEach(row => {
    const pageInput = row.querySelector('input[data-role="page"]');
    if (pageInput?.value) {
        row.querySelectorAll(".ayah-wrap input").forEach(inp => {
        if (inp.value) count++;
        });
    }
    });
    document.getElementById(`${type}-count`).textContent = count;
    document.getElementById(`${type}-pill`).textContent = count;
};

const updateDelBtns = (type) => {
    const rows = document.getElementById(`${type}-list`)?.querySelectorAll(".entry-row") || [];
    rows.forEach((row, i) => {
    const btn = row.querySelector(".entry-del");
    if (btn) btn.classList.toggle("hidden", i === 0);
    });
};

const addAyahInput = (type, ayahWrap, withComma) => {
    const group = document.createElement("span");
    group.className = "ayah-group";
    
    if (withComma) {
    const comma = document.createElement("span");
    comma.className = "ayah-comma";
    comma.textContent = ",";
    group.appendChild(comma);
    }
    
    const inp = document.createElement("input");
    inp.type = "number";
    inp.min = 1;
    inp.className = "e-input";
    inp.placeholder = "__";
    inp.dataset.role = "ayah";
    inp.oninput = () => recalc(type);
    inp.onkeydown = (e) => {
    if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        addAyahInput(type, ayahWrap, true);
        const inputs = ayahWrap.querySelectorAll("input");
        if (inputs.length) inputs[inputs.length - 1].focus();
    } else if (e.key === "Enter") {
        e.preventDefault();
        window.addEntry(type);
    } else if (e.key === "Backspace" && !inp.value) {
        const groups = ayahWrap.querySelectorAll(".ayah-group");
        if (groups.length > 1) {
        group.remove();
        recalc(type);
        const inputsLeft = ayahWrap.querySelectorAll("input");
        if (inputsLeft.length) inputsLeft[inputsLeft.length - 1].focus();
        }
    }
    };
    
    group.appendChild(inp);
    ayahWrap.appendChild(group);
};

window.addEntry = (type) => {
    const list = document.getElementById(`${type}-list`);
    if (!list) return;
    const row = document.createElement("div");
    row.className = "entry-row";
    
    const juzList = getActiveJuzList();
    const multiJuz = juzList.length > 1;
    
    const juzLbl = document.createElement("span");
    juzLbl.className = "entry-juz-label entry-lbl";
    juzLbl.textContent = "Juz";
    juzLbl.style.display = multiJuz ? "" : "none";
    
    const juzSel = document.createElement("select");
    juzSel.className = "entry-juz-select";
    juzSel.style.display = multiJuz ? "" : "none";
    juzList.forEach(j => {
    const opt = document.createElement("option");
    opt.value = j;
    opt.textContent = j;
    juzSel.appendChild(opt);
    });
    
    const pageLbl = document.createElement("span");
    pageLbl.className = "entry-lbl";
    pageLbl.textContent = "Page";
    
    const pageInput = document.createElement("input");
    pageInput.type = "number";
    pageInput.min = 1;
    pageInput.className = "e-input";
    pageInput.placeholder = "__";
    pageInput.dataset.role = "page";
    pageInput.oninput = () => recalc(type);
    pageInput.onkeydown = (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const ayahInput = row.querySelector(".ayah-wrap input");
        if (ayahInput) ayahInput.focus();
    }
    };
    
    const ayahLbl = document.createElement("span");
    ayahLbl.className = "entry-lbl";
    ayahLbl.textContent = "Ayah";
    
    const ayahWrap = document.createElement("div");
    ayahWrap.className = "ayah-wrap";
    
    const delBtn = document.createElement("button");
    delBtn.className = "entry-del";
    delBtn.textContent = "✕";
    delBtn.onclick = () => {
    const rows = list.querySelectorAll(".entry-row");
    if (rows.length === 1) {
        pageInput.value = "";
        ayahWrap.innerHTML = "";
        addAyahInput(type, ayahWrap, false);
    } else {
        row.remove();
    }
    recalc(type);
    updateDelBtns(type);
    };
    
    row.appendChild(juzLbl);
    row.appendChild(juzSel);
    row.appendChild(pageLbl);
    row.appendChild(pageInput);
    row.appendChild(ayahLbl);
    row.appendChild(ayahWrap);
    row.appendChild(delBtn);
    list.appendChild(row);
    
    addAyahInput(type, ayahWrap, false);
    updateDelBtns(type);
    setTimeout(() => pageInput.focus(), 50);
    recalc(type);
};

window.resetSection = (type) => {
    const list = document.getElementById(`${type}-list`);
    if (list) list.innerHTML = "";
    window.addEntry(type);
    recalc(type);
    updateDelBtns(type);
    showToast(`↺ ${type} entries cleared`);
};

const getEntriesText = (type) => {
    const juzList = getActiveJuzList();
    const multiJuz = juzList.length > 1;
    const lines = [];
    const list = document.getElementById(`${type}-list`);
    if (!list) return "";
    
    if (!multiJuz) {
    list.querySelectorAll(".entry-row").forEach(row => {
        const page = row.querySelector('input[data-role="page"]')?.value;
        if (!page) return;
        const ayahs = [];
        row.querySelectorAll(".ayah-wrap input").forEach(inp => {
        if (inp.value) ayahs.push(inp.value);
        });
        if (ayahs.length) lines.push(`Page ${page} Ayah ${ayahs.join(", ")}`);
    });
    return lines.join("\n");
    } else {
    const byJuz = {};
    list.querySelectorAll(".entry-row").forEach(row => {
        const page = row.querySelector('input[data-role="page"]')?.value;
        if (!page) return;
        const juzSel = row.querySelector(".entry-juz-select");
        const juzVal = juzSel?.value || juzList[0] || "";
        const ayahs = [];
        row.querySelectorAll(".ayah-wrap input").forEach(inp => {
        if (inp.value) ayahs.push(inp.value);
        });
        if (ayahs.length) {
        if (!byJuz[juzVal]) byJuz[juzVal] = [];
        byJuz[juzVal].push(`Page ${page} Ayah ${ayahs.join(", ")}`);
        }
    });
    const juzKeys = juzList.filter(j => byJuz[j]);
    juzKeys.forEach(j => {
        lines.push(`${j}: ${byJuz[j][0]}`);
        byJuz[j].slice(1).forEach(l => lines.push(`      ${l}`));
    });
    return lines.join("\n");
    }
};

// Student Autocomplete
let acIdx = -1;
const showAC = () => {
    acIdx = -1;
    const val = document.getElementById("student-name").value.trim().toLowerCase();
    const dd = document.getElementById("ac-dropdown");
    if (!val) { dd.style.display = "none"; return; }
    const matches = AppState.savedNames.filter(n => n.name.toLowerCase().includes(val));
    if (!matches.length) { dd.style.display = "none"; return; }
    dd.innerHTML = matches.map(n => `<div class="ac-item" data-name="${n.name}" data-group="${n.group}">${n.name} ${n.group ? `<span style="color:var(--text-light);font-size:11px">(${n.group})</span>` : ""}</div>`).join("");
    dd.style.display = "block";
    dd.querySelectorAll(".ac-item").forEach(el => {
    el.onclick = () => {
        document.getElementById("student-name").value = el.dataset.name;
        const group = el.dataset.group;
        if (group) {
        document.getElementById("group-display-row").style.display = "flex";
        document.getElementById("group-display").textContent = group;
        document._selectedGroup = group;
        } else {
        document.getElementById("group-display-row").style.display = "none";
        document._selectedGroup = "";
        }
        dd.style.display = "none";
    };
    });
};

document.getElementById("student-name")?.addEventListener("input", showAC);
document.getElementById("student-name")?.addEventListener("focus", showAC);
document.addEventListener("click", (e) => {
    if (!e.target.closest(".autocomplete-wrap")) {
    document.getElementById("ac-dropdown").style.display = "none";
    }
});

// Session Dropdown
const renderCS = () => {
    const dd = document.getElementById("cs-dropdown");
    if (!dd) return;
    dd.innerHTML = AppState.savedSessions.map(s => 
    `<div class="cs-item ${AppState.selectedSession === s ? "selected" : ""}" data-session="${s}">${s}</div>`
    ).join("") + `<div class="cs-add-row"><input class="cs-add-input" id="cs-add-inp" placeholder="New session…"><button class="btn-xs" onclick="window.addSessionInline()">+ Add</button></div>`;
    dd.querySelectorAll(".cs-item").forEach(el => {
    el.onclick = () => {
        AppState.selectedSession = el.dataset.session;
        const selSpan = document.getElementById("cs-selected");
        if (selSpan) {
        selSpan.textContent = AppState.selectedSession;
        selSpan.style.color = "";
        selSpan.style.fontStyle = "";
        }
        dd.classList.remove("open");
        document.getElementById("cs-btn")?.classList.remove("active");
        renderCS();
    };
    });
};

window.toggleCS = () => {
    const dd = document.getElementById("cs-dropdown");
    const btn = document.getElementById("cs-btn");
    dd?.classList.toggle("open");
    btn?.classList.toggle("active");
};

window.addSessionInline = () => {
    const inp = document.getElementById("cs-add-inp");
    if (!inp) return;
    const val = inp.value.trim();
    if (val && !AppState.savedSessions.includes(val)) {
    AppState.savedSessions.push(val);
    persist();
    renderCS();
    renderSessionsList();
    inp.value = "";
    }
};

document.getElementById("cs-btn")?.addEventListener("click", window.toggleCS);
document.addEventListener("click", (e) => {
    if (!e.target.closest(".cs-wrap")) {
    document.getElementById("cs-dropdown")?.classList.remove("open");
    document.getElementById("cs-btn")?.classList.remove("active");
    }
});

// Saved Messages
const renderSM = () => {
    const dd = document.getElementById("sm-dropdown");
    if (!dd) return;
    dd.innerHTML = AppState.savedComments.map((c, i) => 
    `<div class="sm-item" data-comment="${c.replace(/"/g, '&quot;')}">
        <span class="sm-item-text">${c}</span>
        <span class="sm-del" data-idx="${i}">✕</span>
    </div>`
    ).join("") + `<div class="sm-add-row"><input class="sm-add-input" id="sm-add-inp" placeholder="New comment…"><button class="btn-xs" onclick="window.addCommentInline()">+ Add</button></div>`;
    dd.querySelectorAll(".sm-item").forEach(el => {
    el.onclick = (e) => {
        if (e.target.classList.contains("sm-del")) return;
        const comment = el.dataset.comment;
        const ta = document.getElementById("comment-ta");
        const cur = ta.value;
        ta.value = cur ? cur + "\n" + comment : comment;
        dd.classList.remove("open");
    };
    const delBtn = el.querySelector(".sm-del");
    if (delBtn) {
        delBtn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(delBtn.dataset.idx);
        AppState.savedComments.splice(idx, 1);
        persist();
        renderSM();
        renderCommentsList();
        };
    }
    });
};

window.toggleSavedMsgs = () => {
    document.getElementById("sm-dropdown")?.classList.toggle("open");
};

window.addCommentInline = () => {
    const inp = document.getElementById("sm-add-inp");
    if (!inp) return;
    const val = inp.value.trim();
    if (val && !AppState.savedComments.includes(val)) {
    AppState.savedComments.push(val);
    persist();
    renderSM();
    renderCommentsList();
    inp.value = "";
    }
};

document.addEventListener("click", (e) => {
    if (!e.target.closest(".saved-msg-wrap")) {
    document.getElementById("sm-dropdown")?.classList.remove("open");
    }
});

// Copy Report
window.copyReport = () => {
    const date = document.getElementById("current-date").textContent;
    const name = document.getElementById("student-name").value.trim() || "—";
    const sess = AppState.selectedSession || "—";
    const mc = parseInt(document.getElementById("mistake-count")?.textContent || "0");
    const sc = parseInt(document.getElementById("stuck-count")?.textContent || "0");
    const mt = getEntriesText("mistake");
    const st = getEntriesText("stuck");
    const comm = document.getElementById("comment-ta").value.trim();
    const includeGroup = document.getElementById("include-group-chk")?.checked;
    const studentGroup = document._selectedGroup || "";
    
    const juzList = getActiveJuzList();
    const multiJuz = juzList.length > 1;
    let juzLine = "", pageLine = "";
    
    if (!multiJuz) {
    const juz = juzList[0] || "—";
    const pages = AppState.juzRows[0]?.pages.filter(p => p.trim()).join(", ") || "—";
    juzLine = `Juz Number: ${juz}`;
    pageLine = `Page: ${pages}`;
    } else {
    juzLine = `Juz Number: ${juzList.join(", ")}`;
    const firstPages = AppState.juzRows[0]?.pages.filter(p => p.trim()).join(", ") || "—";
    pageLine = `Page: ${AppState.juzRows[0]?.juz || ""}: ${firstPages}`;
    AppState.juzRows.slice(1).forEach(r => {
        if (r.juz) {
        const pages = r.pages.filter(p => p.trim()).join(", ") || "—";
        pageLine += `\n           ${r.juz}: ${pages}`;
        }
    });
    }
    
    const lines = [
    "Student Daily Progress Report",
    `Date: ${date}`,
    `Student Name: ${name}`,
    "",
    juzLine,
    pageLine,
    "",
    "Session Summary",
    `Session Name: ${sess}`,
    `Mistake: ${mc}`,
    `Stuck: ${sc}`
    ];
    
    if (mt) { lines.push("", "Mistake", mt); }
    if (st) { lines.push("", "Stuck", st); }
    if (comm) { lines.push("", "Comment", comm); }
    if (includeGroup && studentGroup) {
    lines.push("", `@ He's Student of ${studentGroup}'s Group.`);
    }
    
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    });
    
    showToast("✓ Report copied!");
    const copyBtn = document.getElementById("copy-btn");
    if (copyBtn) {
    copyBtn.textContent = "✓ Copied!";
    setTimeout(() => { copyBtn.innerHTML = "📋 Copy Report"; }, 2000);
    }
};

// Reset Form
window.resetForm = () => {
    document.getElementById("student-name").value = "";
    document._selectedGroup = "";
    document.getElementById("group-display-row").style.display = "none";
    AppState.juzRows = [];
    window.addJuzRow();
    AppState.selectedSession = "";
    const selSpan = document.getElementById("cs-selected");
    if (selSpan) {
    selSpan.textContent = "Select session…";
    selSpan.style.color = "var(--text-light)";
    selSpan.style.fontStyle = "italic";
    }
    document.getElementById("comment-ta").value = "";
    document.getElementById("mistake-list").innerHTML = "";
    document.getElementById("stuck-list").innerHTML = "";
    window.addEntry("mistake");
    window.addEntry("stuck");
    showToast("↺ Form reset");
};

// Settings Functions
const renderNamesList = () => {
    const c = document.getElementById("s-names-list");
    if (!c) return;
    if (!AppState.savedNames.length) {
    c.innerHTML = '<div style="color:var(--text-light);padding:4px 0">None saved</div>';
    return;
    }
    const vis = AppState.showAllNames ? AppState.savedNames : AppState.savedNames.slice(0, 5);
    c.innerHTML = vis.map((n, i) => `
    <div class="settings-item" id="name-item-${i}">
        <div style="flex:1">
        <div class="settings-item-text">${n.name}</div>
        <div class="settings-item-sub">${n.group ? `${n.group}'s Group` : '<span style="color:var(--danger)">⚠ No group</span>'}</div>
        </div>
        <button class="settings-edit" onclick="window.editName(${i})">✎</button>
        <button class="settings-del" onclick="window.delName(${i})">✕</button>
    </div>
    `).join("");
    if (AppState.savedNames.length > 5) {
    c.innerHTML += `<button class="show-toggle" onclick="window.toggleNames()">${AppState.showAllNames ? "▲ Show less" : "▼ Show more (" + (AppState.savedNames.length - 5) + " more)"}</button>`;
    }
};

window.editName = (i) => {
    const item = document.getElementById(`name-item-${i}`);
    if (!item) return;
    const n = AppState.savedNames[i];
    item.innerHTML = `<div class="edit-inline-wrap" style="flex:1;gap:4px">
    <input class="edit-inline-input" id="edit-name-inp" value="${n.name}" style="flex:1">
    <input class="edit-inline-input" id="edit-group-inp" value="${n.group}" style="width:100px" placeholder="Group">
    <button class="edit-inline-btn" onclick="window.saveEditName(${i})">✓</button>
    <button class="edit-inline-btn cancel" onclick="window.renderNamesList()">✕</button>
    </div>`;
    document.getElementById("edit-name-inp")?.focus();
};

window.saveEditName = (i) => {
    const name = document.getElementById("edit-name-inp")?.value.trim();
    const group = document.getElementById("edit-group-inp")?.value.trim() || "";
    if (!name) return;
    if (!group) { showToast("⚠ Group name is required!"); return; }
    AppState.savedNames[i] = { name, group };
    persist();
    renderNamesList();
};

window.delName = (i) => { AppState.savedNames.splice(i, 1); persist(); renderNamesList(); };
window.toggleNames = () => { AppState.showAllNames = !AppState.showAllNames; renderNamesList(); };

window.addSavedName = () => {
    const name = document.getElementById("s-name-input")?.value.trim();
    const group = document.getElementById("s-group-input")?.value.trim();
    if (!name) { showToast("⚠ Student name required"); return; }
    if (!group) { showToast("⚠ Group name required"); return; }
    if (AppState.savedNames.some(n => n.name === name)) { showToast("Name already exists"); return; }
    AppState.savedNames.push({ name, group });
    persist();
    renderNamesList();
    document.getElementById("s-name-input").value = "";
    document.getElementById("s-group-input").value = "";
};

const renderSessionsList = () => {
    const c = document.getElementById("s-sessions-list");
    if (!c) return;
    const vis = AppState.showAllSessions ? AppState.savedSessions : AppState.savedSessions.slice(0, 5);
    c.innerHTML = vis.map((s, i) => `
    <div class="settings-item" id="sess-item-${i}">
        <span class="settings-item-text">${s}</span>
        <button class="settings-edit" onclick="window.editSession(${i})">✎</button>
        <button class="settings-del" onclick="window.delSession(${i})">✕</button>
    </div>
    `).join("");
    if (AppState.savedSessions.length > 5) {
    c.innerHTML += `<button class="show-toggle" onclick="window.toggleSessions()">${AppState.showAllSessions ? "▲ Show less" : "▼ Show more"}</button>`;
    }
};

window.editSession = (i) => {
    const item = document.getElementById(`sess-item-${i}`);
    if (!item) return;
    item.innerHTML = `<div class="edit-inline-wrap"><input class="edit-inline-input" id="edit-sess-inp" value="${AppState.savedSessions[i]}"><button class="edit-inline-btn" onclick="window.saveEditSession(${i})">✓</button><button class="edit-inline-btn cancel" onclick="window.renderSessionsList()">✕</button></div>`;
    document.getElementById("edit-sess-inp")?.focus();
};

window.saveEditSession = (i) => {
    const val = document.getElementById("edit-sess-inp")?.value.trim();
    if (val) { AppState.savedSessions[i] = val; persist(); renderSessionsList(); renderCS(); }
};

window.delSession = (i) => { AppState.savedSessions.splice(i, 1); persist(); renderSessionsList(); renderCS(); };
window.toggleSessions = () => { AppState.showAllSessions = !AppState.showAllSessions; renderSessionsList(); };

window.addSavedSession = () => {
    const val = document.getElementById("s-session-input")?.value.trim();
    if (val && !AppState.savedSessions.includes(val)) {
    AppState.savedSessions.push(val);
    persist();
    renderSessionsList();
    renderCS();
    document.getElementById("s-session-input").value = "";
    }
};

const renderCommentsList = () => {
    const c = document.getElementById("s-comments-list");
    if (!c) return;
    const vis = AppState.showAllComments ? AppState.savedComments : AppState.savedComments.slice(0, 5);
    c.innerHTML = vis.map((cm, i) => `
    <div class="settings-item" id="comm-item-${i}">
        <span class="settings-item-text">${cm}</span>
        <button class="settings-edit" onclick="window.editComment(${i})">✎</button>
        <button class="settings-del" onclick="window.delComment(${i})">✕</button>
    </div>
    `).join("");
    if (AppState.savedComments.length > 5) {
    c.innerHTML += `<button class="show-toggle" onclick="window.toggleCommentsAll()">${AppState.showAllComments ? "▲ Show less" : "▼ Show more"}</button>`;
    }
};

window.editComment = (i) => {
    const item = document.getElementById(`comm-item-${i}`);
    if (!item) return;
    item.innerHTML = `<div class="edit-inline-wrap"><input class="edit-inline-input" id="edit-comm-inp" value="${AppState.savedComments[i]}"><button class="edit-inline-btn" onclick="window.saveEditComment(${i})">✓</button><button class="edit-inline-btn cancel" onclick="window.renderCommentsList()">✕</button></div>`;
    document.getElementById("edit-comm-inp")?.focus();
};

window.saveEditComment = (i) => {
    const val = document.getElementById("edit-comm-inp")?.value.trim();
    if (val) { AppState.savedComments[i] = val; persist(); renderCommentsList(); renderSM(); }
};

window.delComment = (i) => { AppState.savedComments.splice(i, 1); persist(); renderCommentsList(); renderSM(); };
window.toggleCommentsAll = () => { AppState.showAllComments = !AppState.showAllComments; renderCommentsList(); };

window.addSavedComment = () => {
    const val = document.getElementById("s-comment-input")?.value.trim();
    if (val && !AppState.savedComments.includes(val)) {
    AppState.savedComments.push(val);
    persist();
    renderCommentsList();
    renderSM();
    document.getElementById("s-comment-input").value = "";
    }
};

window.openSettings = () => {
    document.getElementById("settings-modal")?.classList.add("open");
    document.getElementById("tz-select").value = AppState.timezone;
    renderNamesList();
    renderSessionsList();
    renderCommentsList();
};

window.closeSettings = () => {
    document.getElementById("settings-modal")?.classList.remove("open");
};

window.onOverlayClick = (e) => {
    if (e.target === document.getElementById("settings-modal")) window.closeSettings();
};

// FAB Functions
window.toggleFab = () => {
    document.getElementById("fab-menu")?.classList.toggle("open");
};

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "c") { e.preventDefault(); window.copyReport(); }
    if (e.altKey && e.key === "r") { e.preventDefault(); window.resetForm(); }
    if (e.altKey && e.key === "s") { e.preventDefault(); window.openSettings(); }
    if (e.altKey && e.key === "j") { e.preventDefault(); window.addJuzRow(); }
    if (e.altKey && e.key === "m") { e.preventDefault(); window.addEntry("mistake"); }
    if (e.altKey && e.key === "u") { e.preventDefault(); window.addEntry("stuck"); }
    if (e.altKey && e.key === "d") { e.preventDefault(); window.toggleDark(); }
    if (e.key === "Escape") { window.closeSettings(); }
});

// Initialize App
const init = () => {
    loadStorage();
    applyTheme();
    updateDate();
    setInterval(updateDate, 30000);
    document.getElementById("copy-year").textContent = new Date().getFullYear();
    AppState.juzRows = [{ juz: "", pages: [""] }];
    renderJuzRows();
    window.addEntry("mistake");
    window.addEntry("stuck");
    renderCS();
    renderSM();
};

init();
