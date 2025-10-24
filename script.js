const root = document.getElementById("slideshow_container");

function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") el.className = v;
    else el.setAttribute(k, v);
  });
  children.forEach((c) => el.append(c));
  return el;
}

function buildShell() {
  const controls = h(
    "div",
    { class: "controls", "aria-label": "Slideshow controls" },
    [
      h("div", { class: "ctrl-left" }, [
        h(
          "button",
          { class: "btn", id: "prev", "aria-label": "Previous slide" },
          ["◀"]
        ),
        h("button", { class: "btn", id: "next", "aria-label": "Next slide" }, [
          "▶",
        ]),
        h("span", { class: "pill", id: "count" }, ["0 / 0"]),
      ]),
      h("div", { class: "ctrl-right" }, [
        h(
          "button",
          {
            class: "btn",
            id: "play",
            "aria-pressed": "false",
            "aria-label": "Toggle autoplay",
          },
          ["Play"]
        ),
        h("span", { class: "pill" }, ["Data: PokéAPI"]),
      ]),
    ]
  );

  const viewport = h(
    "section",
    {
      class: "viewport",
      role: "region",
      "aria-roledescription": "carousel",
      "aria-label": "API slideshow",
      "aria-live": "polite",
    },
    [
      h("div", { class: "track", id: "track" }),
      h("div", { class: "empty", id: "empty" }, ["Preparing…"]),
    ]
  );

  const dots = h("div", {
    class: "dots",
    id: "dots",
    "aria-label": "Slide positions",
  });

  root.replaceChildren(controls, viewport, dots);
}

buildShell();
const LIST_URL = "https://pokeapi.co/api/v2/pokemon?limit=12";

function pickImage(s) {
  return (
    s?.other?.["official-artwork"]?.front_default || s?.front_default || ""
  );
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

let slides = [];
let index = 0;
const els = {
  track: () => document.getElementById("track"),
  dots: () => document.getElementById("dots"),
  empty: () => document.getElementById("empty"),
  count: () => document.getElementById("count"),
};

async function loadData() {
  els.empty().textContent = "Fetching data…";
  try {
    const list = await getJSON(LIST_URL);
    const details = await Promise.all(list.results.map((p) => getJSON(p.url)));
    slides = details.map((d, i) => ({
      id: d.id,
      name: d.name.replace(/^./, (c) => c.toUpperCase()),
      img: pickImage(d.sprites),
      types: d.types.map((t) => t.type.name),
      weight: d.weight,
      i: i + 1,
    }));
    renderSlides(slides);
    els.empty().remove();
    updateUI();
  } catch (e) {
    els.empty().textContent = "Failed to load. Refresh to retry.";
    console.error(e);
  }
}

function renderSlides(items) {
  const track = els.track();
  const dots = els.dots();
  track.innerHTML = "";
  dots.innerHTML = "";
  items.forEach((p, i) => {
    const slide = h(
      "article",
      {
        class: "slide",
        role: "group",
        "aria-roledescription": "slide",
        "aria-label": `${p.name} (${i + 1} of ${items.length})`,
      },
      [
        h("div", { class: "card" }, [
          h("div", { class: "media" }, [
            h("img", { src: p.img, alt: p.name, loading: "lazy" }),
          ]),
          h("div", { class: "meta" }, [
            h("div", { class: "eyebrow" }, [`Pokémon #${p.id}`]),
            h("h2", { class: "title" }, [p.name]),
            h(
              "div",
              { class: "types" },
              p.types.map((t) => h("span", { class: "tag" }, [t]))
            ),
            h("p", { class: "desc" }, [
              `Approx. weight: ${p.weight}. Use arrows or swipe.`,
            ]),
            h("div", { class: "idx" }, [`Slide ${i + 1} of ${items.length}`]),
          ]),
        ]),
      ]
    );
    track.appendChild(slide);

    const dot = h(
      "button",
      { class: "dot", "aria-label": `Go to slide ${i + 1}` },
      []
    );
    dot.addEventListener("click", () => go(i));
    dots.appendChild(dot);
  });
}

loadData();
function updateUI() {
  const total = slides.length;
  document.getElementById("count").textContent = `${index + 1} / ${total}`;
  els.track().style.transform = `translateX(${-index * 100}%)`;
  Array.from(els.dots().children).forEach((d, i) => {
    d.setAttribute("aria-current", String(i === index));
  });
  const main = document.querySelector(".viewport");
  main?.setAttribute(
    "aria-label",
    `API slideshow — slide ${index + 1} of ${total}`
  );
}

function go(i) {
  index = (i + slides.length) % slides.length;
  updateUI();
}
function next() {
  go(index + 1);
}
function prev() {
  go(index - 1);
}

document.getElementById("next").addEventListener("click", next);
document.getElementById("prev").addEventListener("click", prev);

// keyboard
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});

// for swipe
let startX = null;
els.track().addEventListener(
  "touchstart",
  (e) => {
    startX = e.touches[0].clientX;
  },
  { passive: true }
);
els.track().addEventListener(
  "touchmove",
  (e) => {
    if (startX === null) return;
    const dx = e.touches[0].clientX - startX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
      startX = null;
    }
  },
  { passive: true }
);
// auto play
let timer = null,
  playing = false;
function start() {
  stop();
  timer = setInterval(next, 4000);
  playing = true;
  syncPlayBtn();
}
function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  playing = false;
  syncPlayBtn();
}
function toggle() {
  playing ? stop() : start();
}

function syncPlayBtn() {
  const b = document.getElementById("play");
  b.textContent = playing ? "Pause" : "Play";
  b.setAttribute("aria-pressed", String(playing));
}

document.getElementById("play").addEventListener("click", toggle);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    toggle();
  }
});
