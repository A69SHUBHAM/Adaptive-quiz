
window.teacherApp = (function () {
  const PASS = "teach123";

  function init() {
    const loginBtn = document.getElementById("tlogin");

    
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
    const container = document.getElementById("studentsList");

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<p class="small muted">No student results yet.</p>`;
      return;
    }

    container.innerHTML = "<h3>Student Results</h3>";

    const table = document.createElement("div");
    table.className = "small";

    list
      .slice()
      .reverse()
      .forEach((r) => {
        const el = document.createElement("div");
        el.innerHTML = `<strong>${r.name}</strong> • ${r.level} • ${r.score}/${r.total} • <span class='small muted'>${r.date}</span>`;
        table.appendChild(el);
      });

    container.appendChild(table);
  }

  return { init };
})();
