import GPUManager from './gpu.js'
import GUIManager from './gui.js';
import FPSCounter from '../utility/fps.js';
import Camera from './camera.js';
import LocalStorage from '../utility/storage.js';
import Vector2D from '../math/vector2d.js';
import Vector3D from '../math/vector3d.js';
import Matrix from '../math/matrix.js';

class Renderer {
    static async initialize() {
        window.addEventListener("error", (event) => {
            document.getElementById("popup-error").classList.remove("hidden");
            document.getElementById("output-fail").innerText = event.error;
        });
        const gpu = await GPUManager.initialize(document.getElementById("canvas"));
        return new Renderer(gpu);
    }

    constructor(gpu) {
        this.gpu = gpu;
        this.fps = new FPSCounter(document.getElementById("output-fps"), undefined, " fps");
        this.camera = new Camera(document.getElementById("canvas"), new Vector3D(4.0), new Vector2D(-135.0, 35.0), 0.5, 0.05, 0.2, false, true);
        this.storage = new LocalStorage("renderer-raymarcher");
        this.gui = new GUIManager(document.getElementById("canvas"), this.gpu, this.camera, this.storage);

        this.storage.load();
        this.save_handler = setInterval(() => { this.storage.save(); }, 5000);
        this.fps_handler = setInterval(() => this.fps.set(), 1000);
    }

    update() {
        this.camera.update();
        this.fps.update();
        if (this.gui.isKeyPressed() && this.gui.auto_refresh)
            this.gpu.refresh();
        
        this.gpu.uniforms.sun_direction = Matrix.rot2dir(this.gpu.sun_rotation.x, this.gpu.sun_rotation.y);
        this.gpu.uniforms.camera_rotation = this.camera.getRotationMatrix();
        this.gpu.uniforms.camera_position = this.camera.position;
        this.gpu.uniforms.fov = this.camera.fov;
    }

    render() {
        this.gpu.render();
        this.gpu.uniforms.temporal_counter += 1;
    }
}

const engine = await Renderer.initialize();
let animation_id = requestAnimationFrame(animate);

async function animate() {
    engine.update();
    engine.render();
    animation_id = requestAnimationFrame(animate);
}
