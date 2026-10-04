(function () {
  // ----- things you can edit -----
  var CONFIG = {
    code: "2521",
    answer: "HOUSE",
    winTitle: "You got it.",
    winText: "The word is HOUSE. Hold on to it, it's your next clue."
  };
  var TRACKS = [
    {
      title: "The first hello",
      album: "0.1 Flaws and All",
      artist: "Wave to Earth",
      cover: "images/covers/cover-01-0-1-flaws-and-all.jpg"
    },
    {
      title: "Late night talks",
      album: "Malcolm Todd",
      artist: "Malcolm Todd",
      cover: "images/covers/cover-02-malcolm-todd.jpg"
    },
    {
      title: "Our favorite place",
      album: "The Art of Loving",
      artist: "Olivia Dean",
      cover: "images/covers/cover-03-the-art-of-loving.jpg"
    },
    {
      title: "Inside Knowledge",
      album: "echo",
      artist: "dosii",
      cover: "images/covers/cover-04-echo.jpg"
    },
    {
      title: "Whatever comes next",
      album: "you seem pretty sad for a girl so in love",
      artist: "Olivia Rodrigo",
      cover: "images/covers/cover-05-you-seem-pretty-sad-for-a-girl-s.jpg"
    }
  ];
  // --------------------------------

  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HEART = '<svg viewBox="0 0 32 30" aria-hidden="true"><use href="#heart-flat"/></svg>';

  // floating hearts
  (function () {
    var box = $("floaters"), html = "";
    var colors = ["#ff8fb7", "#ffb3cf", "#ff6fa0", "#e6d4ff"];
    for (var i = 0; i < 16; i++) {
      var s = 14 + Math.random() * 26;
      html += '<span class="float" style="--x:' + (Math.random() * 96).toFixed(1) + '%;--s:' + s.toFixed(0) + 'px;--d:' + (16 + Math.random() * 16).toFixed(1) + 's;--delay:-' + (Math.random() * 28).toFixed(1) + 's;--y:' + (8 + Math.random() * 85).toFixed(0) + 'vh;color:' + colors[i % colors.length] + '">' + HEART + '</span>';
    }
    box.innerHTML = html;
  })();

  function burst(x, y) {
    if (reduce) return;
    var colors = ["#d4326f", "#ff8fb7", "#ffd166", "#ffb3cf", "#e6d4ff"];
    for (var i = 0; i < 24; i++) {
      var el = document.createElement("span");
      var a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 170;
      el.className = "burst";
      el.style.cssText = "left:" + x + "px;top:" + y + "px;--dx:" + (Math.cos(a) * d).toFixed(0) + "px;--dy:" + (Math.sin(a) * d - 60).toFixed(0) + "px;--s:" + (14 + Math.random() * 18).toFixed(0) + "px;color:" + colors[i % colors.length];
      el.innerHTML = HEART;
      document.body.appendChild(el);
      (function (n) { setTimeout(function () { n.remove(); }, 1500); })(el);
    }
  }

  // ----- gate -----
  var form = $("codeForm"), input = $("code"), err = $("codeErr"), gate = $("gate"), site = $("site");
  input.addEventListener("input", function () {
    input.value = input.value.replace(/\D/g, "").slice(0, 4);
    err.textContent = "";
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (input.value === CONFIG.code) {
      var r = $("unlock").getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
      gate.classList.add("leaving");
      setTimeout(function () {
        gate.hidden = true;
        site.hidden = false;
        window.scrollTo(0, 0);
      }, reduce ? 0 : 450);
    } else {
      err.textContent = "That code isn't right. Check your last clue and try again.";
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
      input.select();
    }
  });

  // ----- CD player -----
  var cur = 0, playing = false, sec = 0, timer = null;
  var ICON_PLAY = '<path d="M8 5v14l11-7z"/>', ICON_PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function drawPlayer() {
    $("lcdTrk").textContent = "TRK " + pad(cur + 1) + "/" + pad(TRACKS.length);
    $("lcdTitle").textContent = TRACKS[cur].title;
    var cv = $("cover");
    if (cv.getAttribute("data-i") !== String(cur)) {
      cv.src = TRACKS[cur].cover;
      cv.alt = "Album cover: " + TRACKS[cur].album + " by " + TRACKS[cur].artist;
      cv.setAttribute("data-i", String(cur));
    }
    $("lcdState").textContent = playing ? "PLAY" : "STOP";
    $("lcdTime").textContent = Math.floor(sec / 60) + ":" + pad(sec % 60);
    $("disc").classList.toggle("playing", playing);
    $("playIcon").innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    $("play").setAttribute("aria-label", playing ? "Pause" : "Play");
    Array.prototype.forEach.call($("tracks").children, function (li, i) {
      li.firstChild.setAttribute("aria-current", i === cur ? "true" : "false");
    });
  }
  function goTo(i) { cur = (i + TRACKS.length) % TRACKS.length; sec = 0; drawPlayer(); }
  function setPlaying(on) {
    playing = on;
    clearInterval(timer);
    if (on) timer = setInterval(function () { sec++; if (sec >= 180) goTo(cur + 1); else drawPlayer(); }, 1000);
    drawPlayer();
  }
  $("tracks").innerHTML = TRACKS.map(function (t, i) {
    return '<li><button class="track" type="button" data-i="' + i + '"><img class="art" src="' + t.cover + '" alt=""><span class="meta"><span class="t">' + t.title + '</span><span class="sub">' + t.album + ' \u00b7 ' + t.artist + '</span></span></button></li>';
  }).join("");
  $("tracks").addEventListener("click", function (e) {
    var b = e.target.closest(".track");
    if (!b) return;
    goTo(+b.getAttribute("data-i"));
    setPlaying(true);
  });
  $("play").addEventListener("click", function () { setPlaying(!playing); });
  $("prev").addEventListener("click", function () { goTo(cur - 1); });
  $("next").addEventListener("click", function () { goTo(cur + 1); });
  drawPlayer();

  // ----- word puzzle -----
  var ANSWER = CONFIG.answer.toUpperCase(), ROWS = 6, COLS = ANSWER.length;
  var board = $("board"), kb = $("kb"), msg = $("msg"), tiles = [];
  var r = 0, c = 0, locked = false, done = false, keyState = {}, msgTimer = null;

  for (var i = 0; i < ROWS; i++) {
    var row = document.createElement("div");
    row.className = "row";
    tiles[i] = [];
    for (var j = 0; j < COLS; j++) {
      var t = document.createElement("div");
      t.className = "tile";
      row.appendChild(t);
      tiles[i].push(t);
    }
    board.appendChild(row);
  }

  var BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="M12 9l6 6M18 9l-6 6"/></svg>';
  var layout = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  layout.forEach(function (letters, idx) {
    var rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    if (idx === 1) rowEl.insertAdjacentHTML("beforeend", '<span class="spacer"></span>');
    if (idx === 2) rowEl.insertAdjacentHTML("beforeend", '<button class="key wide" type="button" data-key="ENTER">Enter</button>');
    letters.split("").forEach(function (ch) {
      rowEl.insertAdjacentHTML("beforeend", '<button class="key" type="button" data-key="' + ch + '">' + ch + '</button>');
    });
    if (idx === 1) rowEl.insertAdjacentHTML("beforeend", '<span class="spacer"></span>');
    if (idx === 2) rowEl.insertAdjacentHTML("beforeend", '<button class="key wide" type="button" data-key="BACK" aria-label="Backspace">' + BACK + '</button>');
    kb.appendChild(rowEl);
  });
  kb.addEventListener("mousedown", function (e) { e.preventDefault(); });
  kb.addEventListener("click", function (e) {
    var b = e.target.closest(".key");
    if (!b) return;
    var k = b.getAttribute("data-key");
    if (k === "ENTER") submit();
    else if (k === "BACK") delLetter();
    else addLetter(k);
  });

  document.addEventListener("keydown", function (e) {
    if (site.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") {
      if (e.target.closest && e.target.closest("button")) return;
      e.preventDefault();
      submit();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      delLetter();
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      addLetter(e.key.toUpperCase());
    }
  });

  function say(text, keep) {
    msg.textContent = text;
    clearTimeout(msgTimer);
    if (text && !keep) msgTimer = setTimeout(function () { msg.textContent = ""; }, 1800);
  }
  function addLetter(ch) {
    if (done || locked || c >= COLS) return;
    var t = tiles[r][c];
    t.textContent = ch;
    t.setAttribute("data-filled", "1");
    t.classList.remove("pop");
    void t.offsetWidth;
    t.classList.add("pop");
    c++;
  }
  function delLetter() {
    if (done || locked || c === 0) return;
    c--;
    var t = tiles[r][c];
    t.textContent = "";
    t.removeAttribute("data-filled");
  }
  function evaluate(guess) {
    var res = [], counts = {}, k;
    for (k = 0; k < COLS; k++) {
      if (guess[k] === ANSWER[k]) res[k] = "correct";
      else { res[k] = "absent"; counts[ANSWER[k]] = (counts[ANSWER[k]] || 0) + 1; }
    }
    for (k = 0; k < COLS; k++) {
      if (res[k] !== "correct" && counts[guess[k]] > 0) { res[k] = "present"; counts[guess[k]]--; }
    }
    return res;
  }
  function updateKeys(guess, res) {
    var rank = { absent: 1, present: 2, correct: 3 };
    for (var k = 0; k < COLS; k++) {
      var ch = guess[k];
      if (!keyState[ch] || rank[res[k]] > rank[keyState[ch]]) keyState[ch] = res[k];
    }
    Array.prototype.forEach.call(kb.querySelectorAll(".key[data-key]"), function (b) {
      var s = keyState[b.getAttribute("data-key")];
      if (s) b.setAttribute("data-state", s);
    });
  }
  function submit() {
    if (done || locked) return;
    if (c < COLS) {
      var rowEl = board.children[r];
      rowEl.classList.remove("shake");
      void rowEl.offsetWidth;
      rowEl.classList.add("shake");
      say("Not enough letters");
      return;
    }
    var rowIndex = r;
    var guess = tiles[rowIndex].map(function (t) { return t.textContent; }).join("");
    var res = evaluate(guess);
    locked = true;
    tiles[rowIndex].forEach(function (t, k) {
      var delay = reduce ? 0 : k * 300;
      if (!reduce) { t.style.animationDelay = delay + "ms"; t.classList.add("flip"); }
      setTimeout(function () {
        t.setAttribute("data-state", res[k]);
        t.setAttribute("aria-label", t.textContent + ", " + (res[k] === "correct" ? "right spot" : res[k] === "present" ? "wrong spot" : "not in the word"));
      }, delay + (reduce ? 0 : 250));
    });
    setTimeout(function () {
      updateKeys(guess, res);
      locked = false;
      if (guess === ANSWER) win(rowIndex);
      else if (rowIndex === ROWS - 1) lose();
      else { r = rowIndex + 1; c = 0; }
    }, reduce ? 0 : COLS * 300 + 300);
  }
  function win(rowIndex) {
    done = true;
    say("");
    if (!reduce) tiles[rowIndex].forEach(function (t, k) { t.classList.remove("flip"); t.style.animationDelay = k * 100 + "ms"; t.classList.add("hop"); });
    $("foundTitle").textContent = CONFIG.winTitle;
    $("foundText").textContent = CONFIG.winText;
    $("found").hidden = false;
    var b = board.getBoundingClientRect();
    burst(b.left + b.width / 2, b.top + b.height / 2);
    $("found").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }
  function lose() {
    done = true;
    say("Out of tries. Give it another go.", true);
    $("again").hidden = false;
  }
  $("again").addEventListener("click", function () {
    tiles.forEach(function (rowTiles) {
      rowTiles.forEach(function (t) {
        t.textContent = "";
        t.removeAttribute("data-filled");
        t.removeAttribute("data-state");
        t.removeAttribute("aria-label");
        t.classList.remove("flip", "hop", "pop");
        t.style.animationDelay = "";
      });
    });
    Array.prototype.forEach.call(kb.querySelectorAll(".key"), function (b) { b.removeAttribute("data-state"); });
    keyState = {};
    r = 0; c = 0; done = false;
    say("");
    $("again").hidden = true;
  });
})();
