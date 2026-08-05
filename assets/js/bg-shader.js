/**
 * Wallpaper shader layer — progressive enhancement over CSS vignette.
 * Uses Paper Shaders (vanilla) when WebGL2 is available.
 * Modes via #bg-shader[data-shader]: paper | wash | vignette | none
 */
const SHADER_CDN = 'https://esm.sh/@paper-design/shaders@0.0.78';

const sizingUniforms = {
    u_fit: 2, // cover
    u_scale: 1,
    u_rotation: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_offsetX: 0,
    u_offsetY: 0,
    u_worldWidth: 0,
    u_worldHeight: 0,
};

let mount = null;
let activeMode = null;

function canUseWebGL() {
    if (window.matchMedia('(prefers-reduced-data: reduce)').matches) return false;
    try {
        const c = document.createElement('canvas');
        return Boolean(c.getContext('webgl2'));
    } catch {
        return false;
    }
}

async function createMount(mode) {
    const host = document.getElementById('bg-shader-mount');
    if (!host) return null;

    const {
        ShaderMount,
        paperTextureFragmentShader,
        staticRadialGradientFragmentShader,
        getShaderColorFromString,
        getShaderNoiseTexture,
        emptyPixel,
    } = await import(SHADER_CDN);

    const color = (value, fb) => {
        try {
            return getShaderColorFromString(value) || fb;
        } catch {
            return fb;
        }
    };

    if (mode === 'paper') {
        return new ShaderMount(
            host,
            paperTextureFragmentShader,
            {
                ...sizingUniforms,
                u_image: emptyPixel,
                u_noiseTexture: getShaderNoiseTexture(),
                u_colorFront: color('#e8eef7', [0.91, 0.93, 0.97, 0.55]),
                u_colorBack: color('#00212f', [0, 0.13, 0.18, 0.15]),
                u_contrast: 0.32,
                u_roughness: 0.48,
                u_fiber: 0.28,
                u_fiberSize: 0.45,
                u_crumples: 0.18,
                u_crumpleSize: 0.4,
                u_folds: 0.12,
                u_foldCount: 4,
                u_fade: 0.55,
                u_drops: 0.08,
                u_seed: 17,
            },
            { alpha: true, antialias: false, powerPreference: 'low-power' },
            0,
            0,
            1,
            1280 * 720
        );
    }

    if (mode === 'wash') {
        return new ShaderMount(
            host,
            staticRadialGradientFragmentShader,
            {
                ...sizingUniforms,
                u_colorBack: color('#00212f', [0, 0.13, 0.18, 0.2]),
                u_colors: [
                    color('#9ec5ff', [0.62, 0.77, 1, 0.55]),
                    color('#e8b4a4', [0.91, 0.71, 0.64, 0.35]),
                    color('#00212f', [0, 0.13, 0.18, 0.15]),
                ],
                u_colorsCount: 3,
                u_radius: 1.15,
                u_focalDistance: 0.18,
                u_focalAngle: 210,
                u_falloff: 0.35,
                u_mixing: 0.85,
                u_distortion: 0.22,
                u_distortionShift: 0.1,
                u_distortionFreq: 4,
                u_grainMixer: 0.25,
                u_grainOverlay: 0.18,
            },
            { alpha: true, antialias: false, powerPreference: 'low-power' },
            0,
            0,
            1,
            1280 * 720
        );
    }

    return null;
}

async function applyShader(mode) {
    const layer = document.getElementById('bg-shader');
    if (!layer) return;

    const next = (mode || layer.getAttribute('data-shader') || 'paper').toLowerCase();
    layer.setAttribute('data-shader', next);

    if (mount) {
        mount.dispose();
        mount = null;
    }
    activeMode = next;

    if (next === 'none' || next === 'vignette' || !canUseWebGL()) return;

    try {
        mount = await createMount(next);
    } catch (err) {
        console.warn('Shader layer unavailable, CSS vignette only.', err);
        mount = null;
    }
}

function init() {
    const layer = document.getElementById('bg-shader');
    if (!layer) return;

    applyShader(layer.getAttribute('data-shader'));

    const mo = new MutationObserver(() => {
        const mode = layer.getAttribute('data-shader');
        if (mode !== activeMode) applyShader(mode);
    });
    mo.observe(layer, { attributes: true, attributeFilter: ['data-shader'] });

    window.setShaderMode = function setShaderMode(mode) {
        if (!mode) return;
        layer.setAttribute('data-shader', String(mode).toLowerCase());
    };

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && mount) mount.setSpeed(0);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
