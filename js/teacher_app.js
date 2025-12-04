
window.teacherApp = (function () {
  const PASS = "teach123";

  function init() {
    const loginBtn = document.getElementById("tlogin");

    document.addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    const loginBtn = document.getElementById("tlogin");
    if(loginBtn){
      loginBtn.click();
    }
  }
});


    if (loginBtn) {
      loginBtn.onclick = () => {
        const val = document.getElementById("tpass").value;

        if (val === PASS) {
          sessionStorage.setItem("teacher_auth", "1");

          
          let newPath = window.location.pathname.replace(
            "login.html",
            "dashboard.html"
          );
          location.href = newPath;
        } else {
          alert("Wrong password");
        }
      };

      
      return;
    }

    
    const auth = sessionStorage.getItem("teacher_auth");
    if (!auth) {
      location.href = "login.html";
      return;
    }

    
    const uploadInput = document.getElementById("upload");
    if (uploadInput) {
      uploadInput.onchange = handleUpload;
    }

    renderStudents();
  }

  
  function handleUpload(e) {
    const f = e.target.files[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        let level =
          data.level || (data.length && data[0].level) || null;

        if (!level)
          level = prompt(
            "Enter level for this bank (beginner/intermediate/advanced):",
            "beginner"
          );

        localStorage.setItem(
          "quizeng_bank_" + level,
          JSON.stringify(data)
        );
        alert("Bank uploaded for " + level);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(f);
  }

 
  function renderStudents() {
  const list = JSON.parse(localStorage.getItem("quizeng_reports") || "[]");
  const tbody = document.getElementById("studentsList");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="small muted">No student results yet.</td></tr>`;
    return;
  }

  const reports = list.slice().reverse();

  reports.forEach((r, index) => {
    const pct = Math.round((r.score / r.total) * 100);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.name}</td>
      <td>${r.level}</td>
      <td>${r.score}</td>
      <td>${r.total}</td>
      <td>${pct}%</td>
      <td>${r.date}</td>
      <td>${
         r.wrong && r.wrong.length > 0 
         ? `<button class="link-btn small" onclick="viewWrong(${index})">View</button>`
         : `<span class="small muted">All correct</span>`
       }</td>
    `;
    tbody.appendChild(row);
  });
}



  return { init };
})();

window.viewWrong = function(index) {

  const reports = JSON.parse(localStorage.getItem("quizeng_reports") || "[]").slice().reverse();
  const wrongList = reports[index].wrong;

  let html = `
    <h2 style="margin-bottom:12px;color:#05f6c6">Wrong Questions</h2>
  `;

  wrongList.forEach((q, i) => {
    html += `
      <div style="
         margin-bottom:12px;
         padding:12px;
         border-radius:10px;
         background:rgba(255,255,255,0.05);
      ">
        <div><strong style="color:#fff;">Q${i+1}.</strong> ${q.question}</div>
        <div class="small muted">Correct: <span style="color:#34d399;">${q.options[q.correct]}</span></div>
        <div class="small muted">You selected: <span style="color:#ff6b6b;">${q.options[q.selected]}</span></div>
      </div>
    `;
  });

  
  const modal = document.createElement("div");
  modal.id = "wrongModal";
  modal.style.cssText = `
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.6);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:9999;
  `;

  
  const box = document.createElement("div");
  box.style.cssText = `
    position:relative;
    background:#0f172a;
    padding:20px;
    border-radius:14px;
    width:90%;
    max-width:500px;
    max-height:80vh;
    overflow-y:auto;
    box-shadow:0 0 20px rgba(0,0,0,0.8);
  `;

  
  const closeBtn = document.createElement("div");
  closeBtn.innerHTML = "✖";
  closeBtn.style.cssText = `
    position:absolute;
    top:10px;
    right:12px;
    font-size:20px;
    cursor:pointer;
    color:#ff7777;
  `;
  closeBtn.onclick = () => modal.remove();

  box.innerHTML += html;

  box.appendChild(closeBtn);
  modal.appendChild(box);
  document.body.appendChild(modal);
};


