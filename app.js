import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
 

import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'

import {SSRPass} from 'three/examples/jsm/postprocessing/SSRPass'
import {GammaCorrectionShader} from 'three/examples/jsm/shaders/GammaCorrectionShader'
import { ReflectorForSSRPass } from 'three/examples/jsm/objects/ReflectorForSSRPass'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'

import ob1 from './one.glb'

import matcap from './texture3.png'


export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		this.dummy = new THREE.Object3D()
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0xeeeeee, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 
		const fs = 15
		const aspect = this.width / this.height

		// this.camera = new THREE.OrthographicCamera(fs * aspect / - 2, fs * aspect / 2, fs / 2, fs / -2, -1000, 1000)
 
		this.camera = new THREE.PerspectiveCamera(25, this.width / this.height, 1, 100)

		this.camera.position.set(1, 3, 10) 
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0


		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.isPlaying = true
		// this.initPost()
		this.addObjects()		 
		this.resize()
		this.render()
		this.setupResize()
 
		// this.addLights()
 
	}
	initPost() {
		this.composer = new EffectComposer(this.renderer)
		this.ssrPass = new SSRPass({
			renderer: this.renderer,
			scene: this.scene,
			camera: this.camera,
			width: this.width,
			height: this.height,
			groundReflector: null,
			selects: null
		})

		this.composer.addPass(this.ssrPass)
	}
	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


		this.imageAspect = 853/1280
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) * this.imageAspect
		} 


		// this.material.uniforms.resolution.value.x = this.width
		// this.material.uniforms.resolution.value.y = this.height
		// this.material.uniforms.resolution.value.z = a1
		// this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}


	async addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				uMatcap: {value: new THREE.TextureLoader().load(matcap)},
				resolution: {value: new THREE.Vector4()}
			},
			vertexShader,
			fragmentShader
		})
		
		this.geometry = new THREE.PlaneGeometry(1,1,1,1)


		//use this code for add more objects for scene
		let {scene: children} = await this.gltf.loadAsync(ob1)
	 
		let geo1 = children.children[0].geometry
		//
 
		let mat = new THREE.MeshMatcapMaterial({
			matcap: new THREE.TextureLoader().load(matcap)
		})
		
		
		let rows = 50
		this.count = rows * rows

		let random = new Float32Array(this.count)



		this.instanced = new THREE.InstancedMesh(geo1, this.material, this.count)

 

		let index = 0

		for (let i = 0; i < rows; i +=2 ) {
			for (let j = 0; j < rows; j += 2) {
				random[index] = Math.random()

				this.dummy.position.set(i - rows / 2, -10  , j - rows / 2)
				this.dummy.updateMatrix()
				this.instanced.setMatrixAt(++index, this.dummy.matrix)

			}
			
		}

		this.instanced.instanceMatrix.needsUpdate = true


		this.instanced.geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(
			random, 1
		))

		this.scene.add(this.instanced)

 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		this.material.uniforms.time.value = this.time / 10
		requestAnimationFrame(this.render.bind(this))

		this.renderer.render(this.scene, this.camera)

	
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 