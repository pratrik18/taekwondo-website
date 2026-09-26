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
// PLASMA BACKGROUND
// Optimized WebGL2 implementation
// ══════════════════════════════════════════════════════════════

(function () {

  const container =
    document.getElementById('hero-plasma');

  if (!container) return;


  // ── Performance settings
  const prefersReducedMotion =
    window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;


  const color = '#A32620';

  const speed = 0.6;

  const scale = 1.1;

  const opacity = 0.8;

  const mouseInteractive = true;


  /*
   * Lower render resolution dramatically reduces
   * GPU workload while keeping the visual effect smooth.
   */
  const renderScale = 0.50;


  /*
   * Maximum DPR prevents extremely high-density
   * displays from multiplying GPU workload.
   */
  const maxDpr = 1.5;


  /*
   * The original shader used 60 raymarching iterations.
   * 36 gives a much better performance/quality balance.
   */
  const iterations = 36;


  /*
   * Mouse smoothing strength.
   * Higher = faster response.
   * Lower = smoother movement.
   */
  const mouseSmoothness = 12;


  // ── Color conversion
  function hexToRgb(hex) {

    const result =
      /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
        .exec(hex);

    if (!result) {
      return [1, 0.5, 0.2];
    }

    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ];
  }


  // ── Vertex shader
  const vertexSource = `#version 300 es

    precision highp float;

    in vec2 position;
    in vec2 uv;

    out vec2 vUv;

    void main() {

      vUv = uv;

      gl_Position =
        vec4(
          position,
          0.0,
          1.0
        );

    }

  `;


  // ── Fragment shader
  const fragmentSource = `#version 300 es

    precision highp float;

    uniform vec2 iResolution;
    uniform float iTime;

    uniform vec3 uCustomColor;

    uniform float uSpeed;
    uniform float uScale;
    uniform float uOpacity;

    uniform vec2 uMouse;
    uniform float uMouseInteractive;

    uniform float uQuality;
    uniform float uStepScale;

    out vec4 fragColor;


    void mainImage(
      out vec4 o,
      vec2 C
    ) {

      vec2 center =
        iResolution.xy * 0.5;


      C =
        (C - center)
        / uScale
        + center;


      vec2 mouseOffset =
        (uMouse - center)
        * 0.0002;


      C +=
        mouseOffset
        *
        length(C - center)
        *
        step(
          0.5,
          uMouseInteractive
        );


      float i;
      float d;
      float z;

      float T =
        iTime * uSpeed;


      vec3 O =
        vec3(0.0);

      vec3 p;
      vec3 S;

      vec2 Q;


      /*
       * Maximum loop remains 60 so the shader stays
       * compatible with the original algorithm.
       *
       * uQuality controls the actual number of
       * iterations performed.
       */
      for (
        float stepIndex = 0.0;
        stepIndex < 60.0;
        stepIndex += 1.0
      ) {

        i = stepIndex;


        if (i >= uQuality) {
          break;
        }


        p =
          z *
          normalize(
            vec3(
              C -
              0.5 *
              iResolution.xy,

              iResolution.y
            )
          );


        p.z -= 4.0;

        S = p;

        d =
          p.y -
          T;


        p.x +=
          0.4 *
          (1.0 + p.y)
          *
          sin(
            d +
            p.x *
            0.1
          )
          *
          cos(
            0.34 *
            d +
            p.x *
            0.05
          );


        Q =
          p.xz *=
          mat2(
            cos(
              p.y +
              vec4(
                0.0,
                11.0,
                33.0,
                0.0
              ) -
              T
            )
          );


        z +=
          d =
            (
              abs(
                sqrt(
                  dot(
                    Q,
                    Q
                  )
                )
                -
                0.25 *
                (
                  5.0 +
                  S.y
                )
              )
              /
              3.0
              +
              8.0e-4
            )
            *
            uStepScale;


        o =
          1.0 +
          sin(
            S.y
            +
            p.z *
            0.5
            +
            S.z
            -
            length(
              S - p
            )
            +
            vec4(
              2.0,
              1.0,
              0.0,
              8.0
            )
          );


        O +=
          o.w /
          d *
          o.xyz;

      }


      o.xyz =
        tanh(
          O /
          1.0e4
        );

    }


    bool finite1(float x) {

      return !(
        isnan(x) ||
        isinf(x)
      );

    }


    vec3 sanitize(vec3 c) {

      return vec3(

        finite1(c.r)
          ? c.r
          : 0.0,

        finite1(c.g)
          ? c.g
          : 0.0,

        finite1(c.b)
          ? c.b
          : 0.0

      );

    }


    void main() {

      vec4 o =
        vec4(0.0);


      mainImage(
        o,
        gl_FragCoord.xy
      );


      vec3 rgb =
        sanitize(
          o.rgb
        );


      float intensity =
        (
          rgb.r +
          rgb.g +
          rgb.b
        )
        /
        3.0;


      vec3 customColor =
        intensity *
        uCustomColor;


      float alpha =
        length(rgb) *
        uOpacity;


      fragColor =
        vec4(
          customColor,
          alpha
        );

    }

  `;


  // ── Canvas
  const canvas =
    document.createElement(
      'canvas'
    );

  canvas.className =
    'plasma-canvas';

  canvas.setAttribute(
    'aria-hidden',
    'true'
  );

  container.appendChild(
    canvas
  );


  // ── WebGL2 context
  const gl =
    canvas.getContext(
      'webgl2',
      {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        powerPreference: 'high-performance'
      }
    );


  if (!gl) {

    container.classList.add(
      'plasma-fallback'
    );

    return;

  }


  // ── Shader compiler
  function compileShader(
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
    compileShader(
      gl.VERTEX_SHADER,
      vertexSource
    );


  const fragmentShader =
    compileShader(
      gl.FRAGMENT_SHADER,
      fragmentSource
    );


  if (
    !vertexShader ||
    !fragmentShader
  ) {

    container.classList.add(
      'plasma-fallback'
    );

    return;

  }


  // ── Program
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


    container.classList.add(
      'plasma-fallback'
    );

    return;

  }


  gl.useProgram(
    program
  );


  // ── Fullscreen triangle pair
  const vertices =
    new Float32Array([

      -1, -1, 0, 0,

       1, -1, 1, 0,

      -1,  1, 0, 1,


      -1,  1, 0, 1,

       1, -1, 1, 0,

       1,  1, 1, 1

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


  const positionLocation =
    gl.getAttribLocation(
      program,
      'position'
    );


  const uvLocation =
    gl.getAttribLocation(
      program,
      'uv'
    );


  gl.enableVertexAttribArray(
    positionLocation
  );


  gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    16,
    0
  );


  gl.enableVertexAttribArray(
    uvLocation
  );


  gl.vertexAttribPointer(
    uvLocation,
    2,
    gl.FLOAT,
    false,
    16,
    8
  );


  // ── Uniform locations
  const uniforms = {

    resolution:
      gl.getUniformLocation(
        program,
        'iResolution'
      ),

    time:
      gl.getUniformLocation(
        program,
        'iTime'
      ),

    customColor:
      gl.getUniformLocation(
        program,
        'uCustomColor'
      ),

    speed:
      gl.getUniformLocation(
        program,
        'uSpeed'
      ),

    scale:
      gl.getUniformLocation(
        program,
        'uScale'
      ),

    opacity:
      gl.getUniformLocation(
        program,
        'uOpacity'
      ),

    mouse:
      gl.getUniformLocation(
        program,
        'uMouse'
      ),

    mouseInteractive:
      gl.getUniformLocation(
        program,
        'uMouseInteractive'
      ),

    quality:
      gl.getUniformLocation(
        program,
        'uQuality'
      ),

    stepScale:
      gl.getUniformLocation(
        program,
        'uStepScale'
      )

  };


  // ── Static uniforms
  const customColor =
    hexToRgb(color);


  gl.uniform3fv(
    uniforms.customColor,
    customColor
  );


  gl.uniform1f(
    uniforms.speed,
    speed * 0.4
  );


  gl.uniform1f(
    uniforms.scale,
    scale
  );


  gl.uniform1f(
    uniforms.opacity,
    opacity
  );


  gl.uniform1f(
    uniforms.mouseInteractive,
    mouseInteractive
      ? 1.0
      : 0.0
  );


  gl.uniform1f(
    uniforms.quality,
    iterations
  );


  /*
   * Compensates for the reduced iteration count
   * so the plasma does not become visually compressed.
   */
  gl.uniform1f(
    uniforms.stepScale,
    60 / iterations
  );


  // ── Mouse state
  let targetMouseX = 0;
  let targetMouseY = 0;

  let mouseX = 0;
  let mouseY = 0;


  let hasMousePosition =
    false;


  const handleMouseMove =
    (e) => {

      if (!mouseInteractive) {
        return;
      }


      const rect =
        container.getBoundingClientRect();


      targetMouseX =
        (
          e.clientX -
          rect.left
        );


      targetMouseY =
        rect.height -
        (
          e.clientY -
          rect.top
        );


      hasMousePosition =
        true;

    };


  container.addEventListener(
    'pointermove',
    handleMouseMove,
    {
      passive: true
    }
  );


  // ── Render state
  let resizePending =
    false;


  let animationFrame =
    0;


  let isVisible =
    true;


  let tabVisible =
    document.visibilityState !==
    'hidden';


  let contextLost =
    false;


  let lastFrameTime =
    0;


  let lastRenderWidth =
    0;


  let lastRenderHeight =
    0;


  let lastTimestamp =
    performance.now();


  const startTime =
    performance.now();


  /*
   * We intentionally render at 60 FPS.
   * The optimization happens inside the shader
   * and through reduced render resolution.
   */
  const targetFrameInterval =
    1000 / 60;


  // ── Resize
  function setSize() {

    const rect =
      container.getBoundingClientRect();


    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        maxDpr
      );


    const width =
      Math.max(
        1,
        Math.floor(
          rect.width *
          dpr *
          renderScale
        )
      );


    const height =
      Math.max(
        1,
        Math.floor(
          rect.height *
          dpr *
          renderScale
        )
      );


    /*
     * Avoid reallocating the WebGL framebuffer
     * when the dimensions have not actually changed.
     */
    if (
      width === lastRenderWidth &&
      height === lastRenderHeight
    ) {

      return;

    }


    lastRenderWidth =
      width;

    lastRenderHeight =
      height;


    canvas.width =
      width;

    canvas.height =
      height;


    canvas.style.width =
      '100%';

    canvas.style.height =
      '100%';


    gl.viewport(
      0,
      0,
      width,
      height
    );


    gl.uniform2f(
      uniforms.resolution,
      width,
      height
    );


    if (
      !hasMousePosition
    ) {

      mouseX =
        width *
        0.5;

      mouseY =
        height *
        0.5;


      targetMouseX =
        mouseX;

      targetMouseY =
        mouseY;

    }

  }


  // ── Render loop
  function drawFrame(
    timestamp
  ) {

    if (
      contextLost ||
      !isVisible ||
      !tabVisible
    ) {

      return;

    }


    const elapsed =
      timestamp -
      lastFrameTime;


    if (
      elapsed <
      targetFrameInterval
    ) {

      animationFrame =
        requestAnimationFrame(
          drawFrame
        );

      return;

    }


    lastFrameTime =
      timestamp;


    /*
     * Frame-rate independent mouse smoothing.
     *
     * Instead of:
     *
     * mouse = target
     *
     * we gradually approach the target.
     *
     * This removes the visible stepping caused
     * by mousemove events arriving irregularly.
     */
    const deltaSeconds =
      Math.min(
        (
          timestamp -
          lastTimestamp
        ) / 1000,
        0.05
      );


    lastTimestamp =
      timestamp;


    const smoothing =
      1 -
      Math.exp(
        -mouseSmoothness *
        deltaSeconds
      );


    mouseX +=
      (
        targetMouseX -
        mouseX
      ) *
      smoothing;


    mouseY +=
      (
        targetMouseY -
        mouseY
      ) *
      smoothing;


    gl.uniform2f(
      uniforms.mouse,
      mouseX *
      renderScale *
      (
        window.devicePixelRatio || 1
      ),

      mouseY *
      renderScale *
      (
        window.devicePixelRatio || 1
      )
    );


    gl.uniform1f(
      uniforms.time,
      (
        timestamp -
        startTime
      ) *
      0.001
    );


    gl.clearColor(
      0,
      0,
      0,
      0
    );


    gl.clear(
      gl.COLOR_BUFFER_BIT
    );


    gl.drawArrays(
      gl.TRIANGLES,
      0,
      6
    );


    animationFrame =
      requestAnimationFrame(
        drawFrame
      );

  }


  // ── Static frame
  function renderStaticFrame() {

    gl.uniform1f(
      uniforms.time,
      0
    );


    gl.clearColor(
      0,
      0,
      0,
      0
    );


    gl.clear(
      gl.COLOR_BUFFER_BIT
    );


    gl.drawArrays(
      gl.TRIANGLES,
      0,
      6
    );

  }


  // ── Resize handler
  const handleResize =
    () => {

      if (resizePending) {
        return;
      }


      resizePending =
        true;


      requestAnimationFrame(
        () => {

          resizePending =
            false;

          setSize();

        }
      );

    };


  const resizeObserver =
    new ResizeObserver(
      handleResize
    );


  resizeObserver.observe(
    container
  );


  setSize();


  // ── Visibility observer
  const visibilityObserver =
    new IntersectionObserver(
      ([entry]) => {

        const wasVisible =
          isVisible;


        isVisible =
          entry.isIntersecting;


        if (
          isVisible &&
          !wasVisible &&
          !contextLost &&
          tabVisible &&
          !prefersReducedMotion
        ) {

          cancelAnimationFrame(
            animationFrame
          );


          lastFrameTime =
            performance.now();


          lastTimestamp =
            performance.now();


          animationFrame =
            requestAnimationFrame(
              drawFrame
            );

        }

      },
      {
        threshold: 0
      }
    );


  visibilityObserver.observe(
    container
  );


  // ── Browser tab visibility
  const handleVisibilityChange =
    () => {

      tabVisible =
        document.visibilityState !==
        'hidden';


      if (
        tabVisible &&
        isVisible &&
        !contextLost &&
        !prefersReducedMotion
      ) {

        cancelAnimationFrame(
          animationFrame
        );


        lastFrameTime =
          performance.now();


        lastTimestamp =
          performance.now();


        animationFrame =
          requestAnimationFrame(
            drawFrame
          );

      } else {

        cancelAnimationFrame(
          animationFrame
        );

      }

    };


  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange
  );


  // ── WebGL context lost
  canvas.addEventListener(
    'webglcontextlost',
    (e) => {

      e.preventDefault();


      contextLost =
        true;


      cancelAnimationFrame(
        animationFrame
      );

    }
  );


  // ── WebGL context restored
  canvas.addEventListener(
    'webglcontextrestored',
    () => {

      contextLost =
        false;


      setSize();


      if (
        isVisible &&
        tabVisible &&
        !prefersReducedMotion
      ) {

        cancelAnimationFrame(
          animationFrame
        );


        lastFrameTime =
          performance.now();


        lastTimestamp =
          performance.now();


        animationFrame =
          requestAnimationFrame(
            drawFrame
          );

      }

    }
  );


  // ── Start
  if (
    prefersReducedMotion
  ) {

    renderStaticFrame();

  } else {

    animationFrame =
      requestAnimationFrame(
        drawFrame
      );

  }

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


// ══════════════════════════════════════════════════════════════
// MAGIC BENTO — ACHIEVEMENTS
// ══════════════════════════════════════════════════════════════

(function initMagicBentoAchievements() {

  const cards =
    document.querySelectorAll(
      '.magic-bento-card'
    );


  if (!cards.length) {
    return;
  }


  const reducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;


  const mobile =
    window.matchMedia(
      '(max-width: 768px)'
    ).matches;


  if (
    reducedMotion ||
    mobile
  ) {
    return;
  }


  cards.forEach(
    (card) => {

      const particles = [];

      const particleAnimations = [];

      const particleCount = 8;

      let hovering = false;


      const stopParticles =
        () => {

          particleAnimations.forEach(
            (animation) => {
              animation.cancel();
            }
          );


          particleAnimations.length =
            0;


          particles.forEach(
            (particle) => {

              particle.style.opacity =
                '0';


              particle.style.transform =
                'scale(0)';

            }
          );

        };


      const createParticles =
        () => {

          if (particles.length) {
            return;
          }


          for (
            let i = 0;
            i < particleCount;
            i += 1
          ) {

            const particle =
              document.createElement(
                'span'
              );


            particle.className =
              'magic-bento-particle';


            particle.style.left =
              `${Math.random() * 100}%`;


            particle.style.top =
              `${Math.random() * 100}%`;


            particle.style.opacity =
              '0';


            particle.style.transform =
              'scale(0)';


            card.appendChild(
              particle
            );


            particles.push(
              particle
            );

          }

        };


      const startParticles =
        () => {

          createParticles();

          stopParticles();


          particles.forEach(
            (
              particle,
              index
            ) => {

              const angle =
                Math.random() *
                Math.PI *
                2;


              const distance =
                35 +
                Math.random() *
                45;


              const x =
                Math.cos(angle) *
                distance;


              const y =
                Math.sin(angle) *
                distance;


              const duration =
                1300 +
                Math.random() *
                1000;


              const animation =
                particle.animate(
                  [

                    {
                      opacity: 0,
                      transform:
                        'translate(0, 0) scale(0)'
                    },

                    {
                      opacity: 0.85,
                      transform:
                        `translate(${x}px, ${y}px) scale(1)`
                    },

                    {
                      opacity: 0,
                      transform:
                        `translate(${x * 0.35}px, ${y * 0.35}px) scale(0)`
                    }

                  ],
                  {

                    duration,

                    delay:
                      index * 70,

                    easing:
                      'ease-in-out',

                    iterations:
                      Infinity

                  }
                );


              particleAnimations.push(
                animation
              );

            }
          );

        };


      const resetCard =
        () => {

          card.style.transform =
            'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';


          card.style.setProperty(
            '--glow-intensity',
            '0'
          );


          stopParticles();

        };


      card.addEventListener(
        'mouseenter',
        () => {

          hovering =
            true;


          startParticles();


          card.style.setProperty(
            '--glow-intensity',
            '1'
          );

        }
      );


      card.addEventListener(
        'mouseleave',
        () => {

          hovering =
            false;


          resetCard();

        }
      );


      card.addEventListener(
        'mousemove',
        (event) => {

          if (!hovering) {
            return;
          }


          const rect =
            card.getBoundingClientRect();


          const x =
            event.clientX -
            rect.left;


          const y =
            event.clientY -
            rect.top;


          const centerX =
            rect.width /
            2;


          const centerY =
            rect.height /
            2;


          card.style.setProperty(
            '--glow-x',
            `${(x / rect.width) * 100}%`
          );


          card.style.setProperty(
            '--glow-y',
            `${(y / rect.height) * 100}%`
          );


          card.style.setProperty(
            '--glow-intensity',
            '1'
          );


          const rotateX =
            (
              (y - centerY) /
              centerY
            ) *
            -6;


          const rotateY =
            (
              (x - centerX) /
              centerX
            ) *
            6;


          const translateX =
            (
              x - centerX
            ) *
            0.018;


          const translateY =
            (
              y - centerY
            ) *
            0.018;


          card.style.transform =
            `
              perspective(1000px)
              translate3d(
                ${translateX}px,
                ${translateY}px,
                0
              )
              rotateX(${rotateX}deg)
              rotateY(${rotateY}deg)
            `;

        }
      );


      card.addEventListener(
        'click',
        (event) => {

          const rect =
            card.getBoundingClientRect();


          const x =
            event.clientX -
            rect.left;


          const y =
            event.clientY -
            rect.top;


          const size =
            Math.max(
              rect.width,
              rect.height
            ) *
            1.5;


          const ripple =
            document.createElement(
              'span'
            );


          ripple.className =
            'magic-bento-ripple';


          ripple.style.width =
            `${size}px`;


          ripple.style.height =
            `${size}px`;


          ripple.style.left =
            `${x - size / 2}px`;


          ripple.style.top =
            `${y - size / 2}px`;


          card.appendChild(
            ripple
          );


          const animation =
            ripple.animate(
              [

                {
                  transform:
                    'scale(0)',
                  opacity: 1
                },

                {
                  transform:
                    'scale(1)',
                  opacity: 0
                }

              ],
              {

                duration: 700,

                easing:
                  'ease-out'

              }
            );


          animation.onfinish =
            () => {

              ripple.remove();

            };

        }
      );

    }
  );

})();