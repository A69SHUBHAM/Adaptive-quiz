window.studentApp = (function(){
  const storage = localStorage;
  function saveUser(u){ 
    storage.setItem('quizeng_user', JSON.stringify(u)); 
  }
  function getUser(){
     return JSON.parse(storage.getItem('quizeng_user') || 'null');
  }

  const banks = {
    beginner: '../questions/beginner.json',
    intermediate: '../questions/intermediate.json',
    advanced: '../questions/advanced.json'
  };

  function initQuizPage(){
    const user = getUser();
    if(!user){
       location.href = 'login.html'; return;
      }
    document.getElementById('greet').textContent = 'Hello, ' + user.name;
    document.querySelectorAll('.level-btn').forEach(b=>b.onclick = ()=> startQuiz(b.dataset.level));
  }

 
  window.addEventListener('DOMContentLoaded', ()=>{
    const start = document.getElementById('startBtn');
    if(start){
      start.onclick = ()=>{
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        if(!name){ alert('Enter your name'); return; }
        saveUser({ name, email });
        location.href = 'quiz.html';
      };
    }
  });

  function startQuiz(level){
    fetch(banks[level]).then(r=>r.json()).then(questions=>{
      runFixedQuiz(level, questions);
    }).catch(err=>{ alert('Failed to load questions for ' + level); });
  }

  function runFixedQuiz(level, questions){
    let wrongQuestions = [];

    const pool = questions.slice();
    const selected = [];
    while(selected.length < 8 && pool.length) selected.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    let idx = 0, score = 0;
    const area = document.getElementById('quizArea');
    const choose = document.getElementById('choose');
    const thank = document.getElementById('thankyouArea');
    const result = document.getElementById('resultArea');
    choose.style.display = 'none';
    result.style.display = 'none';
    area.style.display = 'block';

    function render(){
      area.innerHTML = '';
      const q = selected[idx];
      const qDiv = document.createElement('div'); qDiv.className='question';
      qDiv.innerHTML = '<div><strong>Q'+(idx+1)+'.</strong> '+escapeHtml(q.question)+'</div>';
      q.options.forEach((opt,i)=>{
        const optEl = document.createElement('div'); optEl.className='option'; optEl.textContent=opt;
        optEl.onclick = ()=>{
          Array.from(area.querySelectorAll('.option')).forEach(x=>x.classList.remove('selected'));
          optEl.classList.add('selected');
          const chosen = i;
          setTimeout(() => {

    if (chosen === q.answer) {
        score++;
    } else {
        wrongQuestions.push({
            question: q.question,
            options: q.options,
            correct: q.answer,
            selected: chosen
        });
    }

    idx++;

    if (idx >= selected.length) finish(); 
    else render();

}, 250);

        };
        qDiv.appendChild(optEl);
      });
      area.appendChild(qDiv);
    }

    function finish(){
      area.style.display='none';
      thank.style.display='block';
      const user = getUser() || {name:'Student'};
      document.getElementById('thankName').textContent = user.name;
      document.getElementById('submitTime').textContent = new Date().toLocaleString();
      
      const report = { 
    name: user.name, 
    email: user.email || '', 
    level, 
    score, 
    total: selected.length, 
    date: new Date().toLocaleString(),
    wrong: wrongQuestions
};

      const all = JSON.parse(localStorage.getItem('quizeng_reports') || '[]');
      all.push(report);
      localStorage.setItem('quizeng_reports', JSON.stringify(all));
      sessionStorage.setItem('last_report', JSON.stringify(report));

      document.getElementById('viewResultBtn').onclick = ()=>{
        thank.style.display='none';
        showResult(report);
      };
    }

    function showResult(report){
      const res = document.getElementById('resultArea');
      res.style.display = 'block';
      const pct = Math.round((report.score/report.total)*100);
      res.innerHTML = '<h3>Quiz Completed!</h3><div class="report-grid"><div class="stat"><strong>Level</strong><div class="badge">'+report.level+'</div></div><div class="stat"><strong>Score</strong><div style="font-size:22px">'+report.score+' / '+report.total+'</div></div><div class="stat"><strong>Percentage</strong><div style="font-size:18px">'+pct+'%</div></div><div class="stat"><strong>Date</strong><div class="small muted">'+report.date+'</div></div></div>' +
        '<div style="margin-top:12px"><canvas id="resultChart" width="400" height="200"></canvas></div>' +
        '<div class="row" style="margin-top:12px"><button id="retake" class="link-btn" style="margin-right:8px">Retake Quiz</button><a class="link-btn" href="../index.html">Back to Portal</a></div>';
      const ctx = document.getElementById('resultChart').getContext('2d');
      new Chart(ctx, { type:'doughnut', data:{ labels:['Correct','Wrong'], datasets:[{ data:[report.score, report.total-report.score] }] }, options:{plugins:{legend:{labels:{color:'#e6eef6'}}}} });

      document.getElementById('retake').onclick = ()=>{ location.href='login.html'; };
    }

    render();
  }

  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  return { initQuizPage };
})();