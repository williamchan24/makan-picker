/**
 * Makan Picker — plain TypeScript, no framework.
 * Pattern: one `state` object → `render()` redraws the UI from it → event handlers
 * change state, call save() + render(). Same idea React uses, done by hand.
 */
import './style.css';
import type { Budget, Place } from './types';
import { BUDGET_LABELS, SHORT_BUDGET, SLICE_COLOURS } from './data';
import { applyFilters, cuisinesOf } from './lib/filter';
import { indexAtPointer, slicePath, sliceSize, targetRotation } from './lib/wheel';
import { random, randomInt } from './lib/random';
import { defaultState, load, save } from './store';

const state = load();
let rotation = 0;
let spinning = false;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const wheelEl = $('wheel');
const spinBtn = $<HTMLButtonElement>('spin');
const noteEl = $('wheel-note');
const resultEl = $('result');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Tiny helper to create elements safely (textContent, never innerHTML for user data). */
function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> & Record<string, unknown> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('aria-') || key.startsWith('data-')) el.setAttribute(key, String(value));
    else (el as unknown as Record<string, unknown>)[key] = value;
  }
  el.append(...children);
  return el;
}

const visiblePlaces = () => applyFilters(state.places, state.filters);

function commit() {
  save(state);
  render();
}

// ---------- Wheel (SVG) ----------
const SVG_NS = 'http://www.w3.org/2000/svg';
const svg = (tag: string, attrs: Record<string, string | number>) => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};

function renderWheel(places: Place[]) {
  const size = 400;
  const c = size / 2;
  const r = c - 6;
  const root = svg('svg', { viewBox: `0 0 ${size} ${size}`, class: 'wheel-svg' });
  root.style.transform = `rotate(${rotation}deg)`;

  if (places.length === 0) {
    root.append(svg('circle', { cx: c, cy: c, r, class: 'wheel-empty' }));
  } else {
    const step = sliceSize(places.length);
    const fontSize = Math.max(11, Math.min(18, 260 / places.length));
    places.forEach((p, i) => {
      const fill = SLICE_COLOURS[i % SLICE_COLOURS.length];
      const shape =
        places.length === 1
          ? svg('circle', { cx: c, cy: c, r, fill })
          : svg('path', { d: slicePath(c, c, r, i * step, (i + 1) * step), fill });
      shape.setAttribute('class', 'slice');
      root.append(shape);

      // Label runs along the slice's centre line, from the rim inward.
      const mid = i * step + step / 2;
      const label = svg('text', {
        x: c + r - 16,
        y: c,
        'font-size': fontSize,
        'text-anchor': 'end',
        'dominant-baseline': 'middle',
        transform: `rotate(${mid - 90} ${c} ${c})`,
        class: 'slice-label',
      });
      label.textContent = `${p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name} ${p.emoji}`;
      root.append(label);
    });
  }

  const hub = svg('circle', { cx: c, cy: c, r: 26, class: 'hub' });
  root.append(hub);
  wheelEl.replaceChildren(root);
}

// ---------- Filters ----------
function renderFilters() {
  const budgetBox = $('budget-chips');
  budgetBox.replaceChildren(
    ...([1, 2, 3] as Budget[]).map((b) => {
      const on = state.filters.budgets.includes(b);
      return h(
        'button',
        {
          type: 'button',
          className: `chip toggle ${on ? 'on' : ''}`,
          'aria-pressed': on,
          onclick: () => {
            state.filters.budgets = on ? state.filters.budgets.filter((x) => x !== b) : [...state.filters.budgets, b];
            commit();
          },
        },
        BUDGET_LABELS[b],
      );
    }),
  );

  const cuisineBox = $('cuisine-chips');
  cuisineBox.replaceChildren(
    ...cuisinesOf(state.places).map((cuisine) => {
      const on = state.filters.cuisines.includes(cuisine);
      return h(
        'button',
        {
          type: 'button',
          className: `chip toggle ${on ? 'on' : ''}`,
          'aria-pressed': on,
          onclick: () => {
            state.filters.cuisines = on
              ? state.filters.cuisines.filter((x) => x !== cuisine)
              : [...state.filters.cuisines, cuisine];
            commit();
          },
        },
        cuisine,
      );
    }),
  );

  $<HTMLInputElement>('halal').checked = state.filters.halalOnly;
  $('cuisine-list').replaceChildren(...cuisinesOf(state.places).map((c) => h('option', { value: c })));
}

// ---------- Custom places + history ----------
function renderCustom() {
  const custom = state.places.filter((p) => p.custom);
  $('custom-list').replaceChildren(
    ...custom.map((p) =>
      h(
        'li',
        {},
        h('span', {}, `${p.emoji} ${p.name}`),
        h('span', { className: 'muted small' }, `${p.cuisine} · ${SHORT_BUDGET[p.budget]}`),
        h(
          'button',
          {
            type: 'button',
            className: 'icon-btn small-btn',
            'aria-label': `Remove ${p.name}`,
            onclick: () => {
              state.places = state.places.filter((x) => x.id !== p.id);
              commit();
            },
          },
          '×',
        ),
      ),
    ),
  );
}

function renderHistory() {
  const list = $('history');
  list.replaceChildren(
    ...(state.history.length
      ? state.history.map((name) => h('li', {}, name))
      : [h('li', { className: 'muted' }, 'Nothing yet — give it a spin!')]),
  );
}

// ---------- Result ----------
function showResult(place: Place) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' near me')}`;
  resultEl.replaceChildren(
    h('p', { className: 'muted small' }, "Today we're eating"),
    h('p', { className: 'result-name' }, `${place.emoji} ${place.name}`),
    h('p', { className: 'muted small' }, `${place.cuisine} · ${BUDGET_LABELS[place.budget]}${place.halal ? ' · Halal-friendly' : ''}`),
    h(
      'div',
      { className: 'result-actions' },
      h('a', { className: 'btn', href: mapsUrl, target: '_blank', rel: 'noopener' }, 'Find nearby ↗'),
      h('button', { className: 'btn btn-ghost', type: 'button', onclick: spin }, 'Spin again'),
    ),
  );
  resultEl.hidden = false;
}

// ---------- Spin ----------
function spin() {
  const places = visiblePlaces();
  if (spinning || places.length < 2) return;
  spinning = true;
  resultEl.hidden = true;
  spinBtn.disabled = true;

  const winner = randomInt(places.length);
  rotation = targetRotation(rotation, winner, places.length, random(), 5 + randomInt(3));

  const wheelSvg = wheelEl.querySelector<SVGElement>('svg')!;
  const finish = () => {
    spinning = false;
    // Double-check using the same maths as the tests: which slice is actually under the pointer?
    const landed = places[indexAtPointer(rotation, places.length)];
    state.history = [`${landed.emoji} ${landed.name}`, ...state.history].slice(0, 5);
    save(state);
    renderHistory();
    updateSpinButton();
    showResult(landed);
  };

  if (reducedMotion.matches) {
    wheelSvg.style.transform = `rotate(${rotation}deg)`;
    finish();
    return;
  }
  wheelSvg.classList.add('spinning');
  wheelSvg.style.transform = `rotate(${rotation}deg)`;
  wheelSvg.addEventListener('transitionend', () => {
    wheelSvg.classList.remove('spinning');
    finish();
  }, { once: true });
}

function updateSpinButton() {
  const count = visiblePlaces().length;
  spinBtn.disabled = spinning || count < 2;
  noteEl.textContent =
    count < 2 ? 'Need at least 2 options — loosen your filters or add a spot.' : `${count} options on the wheel`;
}

// ---------- Render everything ----------
function render() {
  const places = visiblePlaces();
  renderWheel(places);
  renderFilters();
  renderCustom();
  renderHistory();
  updateSpinButton();
}

// ---------- Event wiring ----------
spinBtn.addEventListener('click', spin);
wheelEl.addEventListener('click', spin);

$<HTMLInputElement>('halal').addEventListener('change', (e) => {
  state.filters.halalOnly = (e.target as HTMLInputElement).checked;
  commit();
});

$<HTMLFormElement>('add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const data = new FormData(form);
  const name = String(data.get('name')).trim();
  const cuisine = String(data.get('cuisine')).trim();
  if (!name || !cuisine) return;
  state.places.push({
    id: crypto.randomUUID(),
    name,
    cuisine: cuisine[0].toUpperCase() + cuisine.slice(1),
    emoji: String(data.get('emoji')).trim() || '🍽️',
    budget: Number(data.get('budget')) as Budget,
    halal: data.get('halal') === 'on',
    custom: true,
  });
  form.reset();
  commit();
});

$('reset').addEventListener('click', () => {
  if (!window.confirm('Remove your spots, filters and history?')) return;
  Object.assign(state, defaultState());
  resultEl.hidden = true;
  commit();
});

// Theme toggle
const themeBtn = $<HTMLButtonElement>('theme-toggle');
const currentTheme = () =>
  document.documentElement.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const syncThemeBtn = () => {
  const dark = currentTheme() === 'dark';
  themeBtn.textContent = dark ? '☀' : '☾';
  themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
};
themeBtn.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    /* ignore */
  }
  syncThemeBtn();
});
syncThemeBtn();

render();
