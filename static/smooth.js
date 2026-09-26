(function () {

  // ── Page loader
  const loader = document.getElementById('page-loader');

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) {
        loader.classList.add('hidden');
      }
    }, 850);
  });


  // ── Hero spotlight
  const spotlight = document.querySelector('.global-spotlight');

  document.addEventListener('mousemove', (e) => {

    if (!spotlight) return;

    const x =
      (e.clientX / window.innerWidth * 100)
        .toFixed(1);

    const y =
      (e.clientY / window.innerHeight * 100)
        .toFixed(1);

    spotlight.style.setProperty(
      '--mx',
      x + '%'
    );

    spotlight.style.setProperty(
      '--my',
      y + '%'
    );

    spotlight.style.opacity = '1';

  });


  document.addEventListener('mouseleave', () => {

    if (!spotlight) return;

    spotlight.style.opacity = '0';

  });


  // ── Header scrolled class
  const header =
    document.querySelector('.site-header');


  window.addEventListener(
    'scroll',
    () => {

      if (!header) return;

      header.classList.toggle(
        'scrolled',
        window.scrollY > 40
      );

    },
    {
      passive: true
    }
  );


  // ── Scroll reveal
  const revealEls =
    document.querySelectorAll('.reveal');


  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(e => {

          if (e.isIntersecting) {

            e.target.classList.add(
              'visible'
            );

            observer.unobserve(
              e.target
            );

          }

        });

      },
      {
        threshold: 0.0005,
        rootMargin: '0px 0px -5px 0px'
      }
    );


  revealEls.forEach(
    el => observer.observe(el)
  );

})();


// ══════════════════════════════════════════════════════════════
// PLASMA HERO BACKGROUND
// ══════════════════════════════════════════════════════════════

(function () {

  const hero =
  document.querySelector('.hero');

  const container =
  document.getElementById('hero-plasma');

  if (!hero || !container) return;


  // ── Create canvas
  const canvas =
    document.createElement('canvas');


  canvas.className =
    'plasma-canvas';


  canvas.style.position =
    'absolute';

  canvas.style.inset =
    '0';

  canvas.style.width =
    '100%';

  canvas.style.height =
    '100%';

  canvas.style.display =
    'block';

  canvas.style.pointerEvents =
    'none';

  canvas.style.zIndex =
    '0';


  container.appendChild(canvas);

  console.log('PLASMA: canvas created');
  console.log('PLASMA: hero:', hero);
  console.log('PLASMA: container:', container);
  console.log('PLASMA: canvas:', canvas);

  // ── Create WebGL2 context
  const gl =
    canvas.getContext(
      'webgl2',
      {
        alpha: true,
        antialias: false
      }
    );

  console.log('PLASMA: WebGL2:', gl);


  if (!gl) {

    console.warn(
      'WebGL2 nie je podporované.'
    );

    canvas.remove();

    return;
  }


  // ══════════════════════════════════════════════════════════
  // SETTINGS
  // ══════════════════════════════════════════════════════════

  const SPEED =
    0.6;

  const RENDER_SCALE =
    0.7;

  const MAX_DPR =
    1.5;

  const TARGET_FPS =
    60;


  // ══════════════════════════════════════════════════════════
  // VERTEX SHADER
  // ══════════════════════════════════════════════════════════

  const vertexShaderSource = `#version 300 es

    precision highp float;

    in vec2 position;

    void main() {

      gl_Position =
        vec4(
          position,
          0.0,
          1.0
        );

    }

  `;


  // ══════════════════════════════════════════════════════════
  // FRAGMENT SHADER
  // ══════════════════════════════════════════════════════════

  const fragmentShaderSource = `#version 300 es

    precision highp float;

    uniform vec2 iResolution;
    uniform float iTime;
    uniform vec2 iMouse;

    out vec4 fragColor;


    void main() {

      // ─────────────────────────────────────────────
      // UV coordinates
      // ─────────────────────────────────────────────

      vec2 uv =
        gl_FragCoord.xy /
        iResolution.xy;


      // ─────────────────────────────────────────────
      // Centered coordinates
      // ─────────────────────────────────────────────

      vec2 p =
        (
          gl_FragCoord.xy -
          0.5 * iResolution.xy
        )
        /
        iResolution.y;


      // ─────────────────────────────────────────────
      // Mouse interaction
      // ─────────────────────────────────────────────

      vec2 mouse =
        (
          iMouse -
          0.5 * iResolution.xy
        )
        /
        iResolution.y;


      p +=
        (
          mouse -
          p
        )
        *
        0.035;


      // ─────────────────────────────────────────────
      // Time
      // ─────────────────────────────────────────────

      float t =
        iTime *
        0.6;


      // ─────────────────────────────────────────────
// Plasma
// ─────────────────────────────────────────────

float v =
  0.0;


v +=
  sin(
    p.x * 5.0 +
    sin(
      p.y * 3.5 +
      t
    )
  );


v +=
  sin(
    p.y * 6.0 +
    cos(
      p.x * 3.0 -
      t * 1.2
    )
  );


v +=
  sin(
    (
      p.x +
      p.y
    )
    *
    6.5 +
    t
  );


v +=
  sin(
    length(p) * 12.0 -
    t * 1.5
  );


v *=
  0.25;


// ─────────────────────────────────────────────
// Normalize
// ─────────────────────────────────────────────

v =
  v *
  0.5 +
  0.5;


// ─────────────────────────────────────────────
// Contrast
// ─────────────────────────────────────────────

v =
  smoothstep(
    0.46,
    0.54,
    v
  );


      // ─────────────────────────────────────────────
      // Colors
      // ─────────────────────────────────────────────

      vec3 dark =
        vec3(
          0.1059,
          0.0902,
          0.0706
        );


      vec3 red =
      vec3(
          0.8784,
          0.6471,
          0.1490
        );


      vec3 gold =
        vec3(
          0.88,
          0.42,
          0.04
        );


      vec3 color =
        mix(
          dark,
          red,
          v
        );


      color =
        mix(
          color,
          gold,
          pow(
            v,
            3.0
          )
          *
          0.25
        );


      // ─────────────────────────────────────────────
      // Vignette
      // ─────────────────────────────────────────────

      float vignette =
        1.0 -
        smoothstep(
          0.35,
          0.85,
          length(p)
        );


      color *=
        0.65 +
        vignette *
        0.35;


      // ─────────────────────────────────────────────
      // Output
      // ─────────────────────────────────────────────

      fragColor =
        vec4(
          color,
          1.0
        );

    }

  `;


  // ══════════════════════════════════════════════════════════
  // SHADER COMPILATION
  // ══════════════════════════════════════════════════════════

  function createShader(
    type,
    source
  ) {

    const shader =
      gl.createShader(type);


    gl.shaderSource(
      shader,
      source
    );


    gl.compileShader(
      shader
    );


    if (
      !gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS
      )
    ) {

      console.error(
        'Plasma shader error:',
        gl.getShaderInfoLog(
          shader
        )
      );


      gl.deleteShader(
        shader
      );


      return null;
    }


    return shader;
  }


  const vertexShader =
    createShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    );


  const fragmentShader =
    createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );


  if (
    !vertexShader ||
    !fragmentShader
  ) {

    canvas.remove();

    return;
  }


  // ══════════════════════════════════════════════════════════
  // PROGRAM
  // ══════════════════════════════════════════════════════════

  const program =
    gl.createProgram();


  gl.attachShader(
    program,
    vertexShader
  );


  gl.attachShader(
    program,
    fragmentShader
  );


  gl.linkProgram(
    program
  );


  if (
    !gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    )
  ) {

    console.error(
      'Plasma program error:',
      gl.getProgramInfoLog(
        program
      )
    );


    canvas.remove();

    return;
  }


  gl.useProgram(
    program
  );


  // ══════════════════════════════════════════════════════════
  // FULLSCREEN TRIANGLE
  // ══════════════════════════════════════════════════════════

  const vertices =
    new Float32Array([

      -1, -1,
       3, -1,
      -1,  3

    ]);


  const buffer =
    gl.createBuffer();


  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
  );


  gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
  );


  const position =
    gl.getAttribLocation(
      program,
      'position'
    );


  gl.enableVertexAttribArray(
    position
  );


  gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );


  // ══════════════════════════════════════════════════════════
  // UNIFORMS
  // ══════════════════════════════════════════════════════════

  const resolution =
    gl.getUniformLocation(
      program,
      'iResolution'
    );


  const time =
    gl.getUniformLocation(
      program,
      'iTime'
    );


  const mouse =
    gl.getUniformLocation(
      program,
      'iMouse'
    );


  // ══════════════════════════════════════════════════════════
  // MOUSE
  // ══════════════════════════════════════════════════════════

  let mouseX = 0;

  let mouseY = 0;


  hero.addEventListener(
    'mousemove',
    (e) => {

      const rect =
        hero.getBoundingClientRect();


      mouseX =
        e.clientX -
        rect.left;


      mouseY =
        rect.height -
        (
          e.clientY -
          rect.top
        );

    },
    {
      passive: true
    }
  );


  // ══════════════════════════════════════════════════════════
  // RESIZE
  // ══════════════════════════════════════════════════════════

  function resize() {

    const rect =
      hero.getBoundingClientRect();


    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        MAX_DPR
      );


    canvas.width =
      Math.max(
        1,
        Math.floor(
          rect.width *
          dpr *
          RENDER_SCALE
        )
      );


    canvas.height =
      Math.max(
        1,
        Math.floor(
          rect.height *
          dpr *
          RENDER_SCALE
        )
      );


    gl.viewport(
      0,
      0,
      canvas.width,
      canvas.height
    );


    gl.uniform2f(
      resolution,
      canvas.width,
      canvas.height
    );

  }


  window.addEventListener(
    'resize',
    resize
  );


  resize();


  // ══════════════════════════════════════════════════════════
  // ANIMATION
  // ══════════════════════════════════════════════════════════

  let animationFrame = 0;

  let lastFrameTime = 0;


  const frameInterval =
    1000 /
    TARGET_FPS;


  const startTime =
    performance.now();


  function animate(now) {

    const delta =
      now -
      lastFrameTime;


    if (
      delta >=
      frameInterval
    ) {

      lastFrameTime =
        now -
        (
          delta %
          frameInterval
        );


      const elapsed =
        (
          now -
          startTime
        )
        /
        1000;


      gl.uniform1f(
        time,
        elapsed
      );


      gl.uniform2f(
        mouse,
        mouseX,
        mouseY
      );


      gl.drawArrays(
        gl.TRIANGLES,
        0,
        3
      );

    }


    animationFrame =
      requestAnimationFrame(
        animate
      );

  }


  animationFrame =
    requestAnimationFrame(
      animate
    );


  // ══════════════════════════════════════════════════════════
  // WEBGL CONTEXT
  // ══════════════════════════════════════════════════════════

  canvas.addEventListener(
    'webglcontextlost',
    (e) => {

      e.preventDefault();

      cancelAnimationFrame(
        animationFrame
      );

    }
  );


  canvas.addEventListener(
    'webglcontextrestored',
    () => {

      animationFrame =
        requestAnimationFrame(
          animate
        );

    }
  );


})();


// ══════════════════════════════════════════════════════════════
// SCROLLBAR — BELT ACCORDING TO SCROLL POSITION
// ══════════════════════════════════════════════════════════════

const beltStages = [

  {
    color: '#ffffff',
    stripe: null
  },

  {
    color: '#ffffff',
    stripe: '#f4d900'
  },

  {
    color: '#f4d900',
    stripe: null
  },

  {
    color: '#f4d900',
    stripe: '#0e7a3c'
  },

  {
    color: '#0e7a3c',
    stripe: null
  },

  {
    color: '#0e7a3c',
    stripe: '#1c2f6e'
  },

  {
    color: '#1c2f6e',
    stripe: null
  },

  {
    color: '#1c2f6e',
    stripe: '#d0202a'
  },

  {
    color: '#d0202a',
    stripe: null
  },

  {
    color: '#d0202a',
    stripe: '#0a0a0a'
  },

  {
    color: '#0a0a0a',
    stripe: null
  }

];


function interpolateColor(
  a,
  b,
  t
) {

  const r1 =
    parseInt(
      a.slice(1, 3),
      16
    );

  const g1 =
    parseInt(
      a.slice(3, 5),
      16
    );

  const b1 =
    parseInt(
      a.slice(5, 7),
      16
    );


  const r2 =
    parseInt(
      b.slice(1, 3),
      16
    );

  const g2 =
    parseInt(
      b.slice(3, 5),
      16
    );

  const b2 =
    parseInt(
      b.slice(5, 7),
      16
    );


  const r =
    Math.round(
      r1 +
      (
        r2 -
        r1
      ) *
      t
    );


  const g =
    Math.round(
      g1 +
      (
        g2 -
        g1
      ) *
      t
    );


  const bl =
    Math.round(
      b1 +
      (
        b2 -
        b1
      ) *
      t
    );


  return `rgb(${r},${g},${bl})`;
}


const beltThumb =
  document.getElementById(
    'belt-thumb'
  );


const beltTrack =
  document.getElementById(
    'belt-track'
  );


function updateBeltScrollbar() {

  if (
    !beltThumb ||
    !beltTrack
  ) {
    return;
  }


  const scrollTop =
    window.scrollY;


  const scrollHeight =
    document.body.scrollHeight -
    window.innerHeight;


  const pct =
    scrollHeight > 0
      ? Math.min(
          Math.max(
            scrollTop /
            scrollHeight,
            0
          ),
          1
        )
      : 0;


  const trackH =
    beltTrack.clientHeight;


  const thumbH =
    Math.max(
      trackH * 0.14,
      60
    );


  const top =
    pct *
    (
      trackH -
      thumbH
    );


  beltThumb.style.height =
    thumbH + 'px';


  beltThumb.style.top =
    top + 'px';


  const stageCount =
    beltStages.length;


  const index =
    Math.min(
      Math.floor(
        pct *
        stageCount
      ),
      stageCount - 1
    );


  const next =
    Math.min(
      index + 1,
      stageCount - 1
    );


  const localPct =
    (
      pct *
      stageCount
    ) -
    index;


  const stage =
    beltStages[index];


  const nextStage =
    beltStages[next];


  const color =
    interpolateColor(
      stage.color,
      nextStage.color,
      localPct
    );


  document.documentElement.style.setProperty(
    '--belt-color',
    color
  );


  if (stage.stripe) {

    document.documentElement.style.setProperty(
      '--stripe-color',
      stage.stripe
    );


    document.documentElement.style.setProperty(
      '--stripe-opacity',
      '1'
    );

  } else {

    document.documentElement.style.setProperty(
      '--stripe-opacity',
      '0'
    );

  }

}


window.addEventListener(
  'scroll',
  updateBeltScrollbar,
  {
    passive: true
  }
);


window.addEventListener(
  'resize',
  updateBeltScrollbar
);


updateBeltScrollbar();


// ══════════════════════════════════════════════════════════════
// CONTACT FORM — VALIDATION + SUBMISSION
// ══════════════════════════════════════════════════════════════

const contactForm =
  document.getElementById(
    'contactForm'
  );


if (contactForm) {

  contactForm.addEventListener(
    'submit',
    function (e) {

      e.preventDefault();


      let valid = true;


      this
        .querySelectorAll(
          'input[required]'
        )
        .forEach(field => {

          const errorEl =
            this.querySelector(
              `.form-error[data-for="${field.id}"]`
            );


          const isValid =
            field.type === 'checkbox'
              ? field.checked
              : field.value.trim();


          if (!isValid) {

            field.classList.add(
              'invalid'
            );


            if (errorEl) {

              errorEl.classList.add(
                'visible'
              );

            }


            valid = false;

          } else {

            field.classList.remove(
              'invalid'
            );


            if (errorEl) {

              errorEl.classList.remove(
                'visible'
              );

            }

          }

        });


      if (valid) {

        this.submit();

      }

    }
  );

}


// ══════════════════════════════════════════════════════════════
// PUNCHING BAG — INTERACTIVE SWINGING
// ══════════════════════════════════════════════════════════════

(function () {

  const hero =
    document.querySelector(
      '.hero'
    );


  const bag =
    document.getElementById(
      'punchingBag'
    );


  if (
    !hero ||
    !bag
  ) {
    return;
  }


  let angle = 0;

  let angularVel = 0;

  let targetAngle = 0;


  const stiffness =
    0.06;


  const damping =
    0.90;


  const maxAngle =
    18;


  const influenceRadius =
    260;


  hero.addEventListener(
    'mousemove',
    (e) => {

      const rect =
        bag.getBoundingClientRect();


      const bagCenterX =
        rect.left +
        rect.width /
        2;


      const dx =
        e.clientX -
        bagCenterX;


      if (
        Math.abs(dx) <
        influenceRadius
      ) {

        const strength =
          1 -
          Math.abs(dx) /
          influenceRadius;


        targetAngle =
          Math.max(
            -maxAngle,
            Math.min(
              maxAngle,
              (
                dx /
                influenceRadius
              ) *
              maxAngle *
              (
                0.5 +
                strength
              )
            )
          );

      } else {

        targetAngle =
          0;

      }

    }
  );


  hero.addEventListener(
    'mouseleave',
    () => {

      targetAngle =
        0;

    }
  );


  function animate() {

    angularVel +=
      (
        targetAngle -
        angle
      )
      *
      stiffness;


    angularVel *=
      damping;


    angle +=
      angularVel;


    bag.style.transform =
      `rotate(${angle}deg)`;


    requestAnimationFrame(
      animate
    );

  }


  animate();

})();