const root = document.getElementById('slideshow_container');

function h(tag, attrs={}, children=[]){
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if(k === 'class') el.className = v;
    else el.setAttribute(k, v);
  });
  children.forEach(c => el.append(c));
  return el;
}

function buildShell(){
  const controls = h('div', {class:'controls', 'aria-label':'Slideshow controls'}, [
    h('div', {class:'ctrl-left'}, [
      h('button', {class:'btn', id:'prev', 'aria-label':'Previous slide'}, ['◀']),
      h('button', {class:'btn', id:'next', 'aria-label':'Next slide'}, ['▶']),
      h('span', {class:'pill', id:'count'}, ['0 / 0'])
    ]),
    h('div', {class:'ctrl-right'}, [
      h('button', {class:'btn', id:'play', 'aria-pressed':'false', 'aria-label':'Toggle autoplay'}, ['Play']),
      h('span', {class:'pill'}, ['Data: PokéAPI'])
    ])
  ]);

  const viewport = h('section', {
    class:'viewport', role:'region', 'aria-roledescription':'carousel',
    'aria-label':'API slideshow', 'aria-live':'polite'
  }, [
    h('div', {class:'track', id:'track'}),
    h('div', {class:'empty', id:'empty'}, ['Preparing…'])
  ]);

  const dots = h('div', {class:'dots', id:'dots', 'aria-label':'Slide positions'});

  root.replaceChildren(controls, viewport, dots);
}

buildShell();
