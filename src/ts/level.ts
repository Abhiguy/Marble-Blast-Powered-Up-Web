import { Interior } from "./interior";
import { Marble, bounceParticleOptions } from "./marble";
import { Shape, SharedShapeData } from "./shape";
import { MissionElementSimGroup, MissionElementType, MissionElementStaticShape, MissionElementItem, MisParser, MissionElementTrigger, MissionElementInteriorInstance, MissionElementTSStatic, MissionElementParticleEmitterNode, MissionElementSky } from "./parsing/mis_parser";
import { StartPad } from "./shapes/start_pad";
import { SignFinish } from "./shapes/sign_finish";
import { DummySignFinish } from "./shapes/sign_finish_dummy";
import { SignPlain } from "./shapes/sign_plain";
import { EndPad, fireworkSmoke, redSpark, redTrail, blueSpark, blueTrail } from "./shapes/end_pad";
import { MusicPad } from "./shapes/music_pad";
import { Gem } from "./shapes/gem";
import { DummyGem } from "./shapes/gem_dummy";
import { SuperJump, superJumpParticleOptions } from "./shapes/super_jump";
import { Doubler } from "./shapes/doubler";
import { SignCaution } from "./shapes/sign_caution";
import { SuperBounce } from "./shapes/super_bounce";
import { RoundBumper } from "./shapes/round_bumper";
import { LavaFloor } from "./shapes/lavafloor";
import { Helicopter } from "./shapes/helicopter";
import { Oil } from "./shapes/oil";
import { Glue } from "./shapes/glue";
import { DuctFan } from "./shapes/duct_fan";
import { Television } from "./shapes/television";
import { AntiGravity } from "./shapes/anti_gravity";
import { LandMine, landMineSmokeParticle, landMineSparksParticle } from "./shapes/land_mine";
import { SkyMine, skyMineSmokeParticle, skyMineSparksParticle } from "./shapes/sky_mine";
import { FishMine, FishMineSmokeParticle, FishMineSparksParticle } from "./shapes/fish_mine";
import { ShockAbsorber } from "./shapes/shock_absorber";
import { SuperSpeed, superSpeedParticleOptions } from "./shapes/super_speed";
import { TimeTravel } from "./shapes/time_travel";
import { Tornado } from "./shapes/tornado";
import { SpecialTornado } from "./shapes/specialtornado";
import { TrapDoor } from "./shapes/trap_door";
import { TriangleBumper } from "./shapes/triangle_bumper";
import { Oilslick } from "./shapes/oilslick";
import { KaitenSupport } from "./shapes/kaitensupport";
import { RotatingPlatform1 } from "./shapes/rotating_platforms1";
import { RotatingPlatform2 } from "./shapes/rotating_platforms2";
import { DisappearPlatform } from "./shapes/disappearplatform";
import { LegitPlatform } from "./shapes/legitplatform";
import { AppearPlatform } from "./shapes/appearplatform";
import { SimPlatform } from "./shapes/sim_platform";
import { SimBox } from "./shapes/sim_box";
import { Planet } from "./shapes/planet";
import { Util, Scheduler } from "./util";
import { PowerUp } from "./shapes/power_up";
import { isPressed, releaseAllButtons, gamepadAxes, getPressedFlag, resetPressedFlag, hideTouchControls, maybeShowTouchControls, setTouchControlMode } from "./input";
import { SmallDuctFan } from "./shapes/small_duct_fan";
import { PathedInterior } from "./pathed_interior";
import { Trigger } from "./triggers/trigger";
import { InBoundsTrigger } from "./triggers/in_bounds_trigger";
import { HelpTrigger } from "./triggers/help_trigger";
import { NoJumpTrigger } from "./triggers/no_jump_trigger";
import { OutOfBoundsTrigger } from "./triggers/out_of_bounds_trigger";
import { ResourceManager } from "./resources";
import { AudioManager, AudioSource, mainAudioManager } from "./audio";
import { ParticleManager, ParticleEmitterOptions, particleNodeEmittersEmitterOptions, ParticleEmitter, RainLocal, BubbleLocal, SnowLocal } from "./particles";
import { StorageManager } from "./storage";
import { Replay } from "./replay";
import { Mission } from "./mission";
import { PushButton } from "./shapes/push_button";
import { StopWatch } from "./shapes/stop_watch";
import { Revealer } from "./shapes/revealer";
import { Metal } from "./shapes/metal";
import { Paper } from "./shapes/paper";
import { Lightning } from "./shapes/lightning";
import { state } from "./state";
import { Sign } from "./shapes/sign";
import { Magnet } from "./shapes/magnet";
import { Nuke, nukeSmokeParticle, nukeSparksParticle } from "./shapes/nuke";
import { TeleportTrigger } from "./triggers/teleport_trigger";
import { DestinationTrigger } from "./triggers/destination_trigger";
import { SeamlessMotionTrigger } from "./triggers/seamless_motion_trigger";
import { Checkpoint } from "./shapes/checkpoint";
import { CheckpointTrigger } from "./triggers/checkpoint_trigger";
import { EasterEgg } from "./shapes/easter_egg";
import { SkillPointItem } from "./shapes/skillpoint";
import { Airplane } from "./shapes/airplane";
import { RandomPowerUp } from "./shapes/random_power_up";
import { MbpPauseScreen } from "./ui/pause_screen_mbp";
import { MbpHud } from "./ui/hud_mbp";
import { Sky } from "./shapes/sky";
import { Glass } from "./shapes/glass";
import { Blast } from "./shapes/blast";
import { MegaMarble } from "./shapes/mega_marble";
import { Scene } from "./rendering/scene";
import { CubeTexture } from "./rendering/cube_texture";
import { Material } from "./rendering/material";
import { Mesh } from "./rendering/mesh";
import { Geometry } from "./rendering/geometry";
import { AmbientLight } from "./rendering/ambient_light";
import { DirectionalLight } from "./rendering/directional_light";
import { mainCanvas, mainRenderer, resize, SCALING_RATIO } from "./ui/misc";
import { FRAME_RATE_OPTIONS } from "./ui/options_mbp";
import { World } from "./physics/world";
import { CollisionShape } from "./physics/collision_shape";
import { Vector3 } from "./math/vector3";
import { Quaternion } from "./math/quaternion";
import { Euler } from "./math/euler";
import { OrthographicCamera, PerspectiveCamera } from "./rendering/camera";
import { Plane } from "./math/plane";
import { CollisionDetection } from "./physics/collision_detection";
import { MissionLibrary } from "./mission_library";
import hxDif from './parsing/hx_dif';
import { TTTPad, TTTState, fireworkSmoke2, redSpark2, redTrail2, blueSpark2, blueTrail2 } from "./shapes/tttpad";
import { SpringBoard } from "./shapes/springboard";
import { Grass } from "./shapes/grass";
import { Monsoon } from "./shapes/monsoon";
import { Firework, Trail } from "./shapes/end_pad";
import { Tricks, TrickTrigger } from "./triggers/trick_trigger";
import { TrololoTrigger } from "./triggers/trolololo_trigger";
import { CornerTrigger } from "./triggers/corner_trigger";
import { Iceslick } from "./shapes/iceslick";
import { IcePane } from "./shapes/icepane";
import { IglooItem } from "./shapes/igloo";
import { WhirliTrigger } from "./triggers/whirli_trigger";

/** How often the physics will be updated, per second. */
export const PHYSICS_TICK_RATE = 120;
const PLAYBACK_SPEED = 1; // Major attack surface for cheaters here 😟

/** The vertical offsets of overlay shapes to get them all visually centered. */
const SHAPE_OVERLAY_OFFSETS = {
	"shapes/images/helicopter.dts": -67,
	"shapes/items/superjump.dts": -70,
	"shapes/items/superbounce.dts": -55,
	"shapes/items/superspeed.dts": -53,
	"shapes/items/shockabsorber.dts": -53,
	"shapes/items/megamarble.dts": -70,
	"shapes/items/oil.dts": -53,
	"shapes/items/glue.dts": -63,
	"shapes/items/stopwatch.dts": -65,
	"shapes/items/magnifying.dts": -53
};
const SHAPE_OVERLAY_SCALES = {
	"shapes/items/megamarble.dts": 60,
	"shapes/items/oil.dts": 40,
	"shapes/items/glue.dts": 40,
	"shapes/items/stopwatch.dts": 40,
	"shapes/items/magnifying.dts": 40
};
/** The time in milliseconds when the marble is released from the start pad. */
export const GO_TIME = 3500;
/** Default camera pitch */
export const DEFAULT_PITCH = 0.45;
const BLAST_CHARGE_TIME = 25000;
export const MAX_TIME = 999 * 60 * 1000 + 59 * 1000 + 999; // 999:59.99, should be large enough
const MBP_SONGS = ['astrolabe.ogg', 'endurance.ogg', 'flanked.ogg', 'grudge.ogg', 'mbp old shell.ogg', 'quiet lab.ogg', 'rising temper.ogg', 'seaside revisited.ogg', 'the race.ogg'];

// Used for frame rate limiting working correctly
const decoyCanvas = document.querySelector('#decoy-canvas') as HTMLCanvasElement;
const decoyCtx = decoyCanvas.getContext('2d');

/** The map used to get particle emitter options for a ParticleEmitterNode. */
const particleEmitterMap: Record<string, ParticleEmitterOptions> = {
	MarbleBounceEmitter: bounceParticleOptions,
	MarbleTrailEmitter: particleNodeEmittersEmitterOptions.MarbleTrailEmitter,
	MarbleSuperJumpEmitter: Object.assign(ParticleEmitter.cloneOptions(superJumpParticleOptions), {
		emitterLifetime: 5000,
		ambientVelocity: new Vector3(-0.3, 0, -0.5)
	}),
	MarbleSuperSpeedEmitter: Object.assign(ParticleEmitter.cloneOptions(superSpeedParticleOptions), {
		emitterLifetime: 5000,
		ambientVelocity: new Vector3(-0.5, 0, -0.5)
	}),
	LandMineEmitter: particleNodeEmittersEmitterOptions.LandMineEmitter,
	LandMineSmokeEmitter: landMineSmokeParticle,
	LandMineSparkEmitter: landMineSparksParticle,
	SkyMineEmitter: particleNodeEmittersEmitterOptions.SkyMineEmitter,
	SkyMineSmokeEmitter: skyMineSmokeParticle,
	SkyMineSparkEmitter: skyMineSparksParticle,
	FishMineEmitter: particleNodeEmittersEmitterOptions.FishMineEmitter,
	FishMineSmokeEmitter: FishMineSmokeParticle,
	FishMineSparkEmitter: FishMineSparksParticle,
	NukeEmitter: particleNodeEmittersEmitterOptions.LandMineEmitter, // It ain't any different
	NukeSmokeEmitter: nukeSmokeParticle,
	NukeSparkEmitter: nukeSparksParticle,
	FireWorkSmokeEmitter: fireworkSmoke,
	fireworkSmokeEmitter2: fireworkSmoke2,
	RainLocalEmitter: RainLocal,
	BubbleLocalEmitter: BubbleLocal,
	SnowLocalEmitter: SnowLocal,
	RedFireWorkSparkEmitter: redSpark,
	RedFireWorkTrailEmitter: redTrail,
	BlueFireWorkSparkEmitter: blueSpark,
	BlueFireWorkTrailEmitter: blueTrail,

	RedFireWorkSparkEmitter2: redSpark2,
	RedFireWorkTrailEmitter2: redTrail2,
	BlueFireWorkSparkEmitter2: blueSpark2,
	BlueFireWorkTrailEmitter2: blueTrail2
};

export interface TimeState {
	/** The time since the level was loaded, this ticks up continuously. */
	timeSinceLoad: number,
	/** The time of the current attempt, this also ticks up continuously but is reset to 0 on restart. */
	currentAttemptTime: number,
	/** The gameplay time, affected by time travels and what not. */
	gameplayClock: number,
	/** A value in [0, 1], representing how far in between two physics ticks we are. */
	physicsTickCompletion: number,
	/** Which tick the simulation is currently on. */
	tickIndex: number
}

interface LoadingState {
	/** How many things have loaded */
	loaded: number,
	/** How many things are going to be loaded */
	total: number
}

interface OfflineSettings {
	duration: number,
	musicVolume: number,
	soundVolume: number,
	marbleTexture?: Blob,
	reflectiveMarble?: boolean
}

/** The central control unit of gameplay. Handles loading, simulation and rendering. */
export class Level extends Scheduler {
	mission: Mission;
	/** Whether or not this level has the classic additional features of MBU levels, such as a larger marble and the blast functionality. */
	loadingState: LoadingState;

	scene: Scene;
	camera: PerspectiveCamera;
	envMap: CubeTexture;
	world: World;
	particles: ParticleManager;
	marble: Marble;
	interiors: Interior[] = [];
	sharedInteriorData = new Map<hxDif.Interior, any>();
	triggers: Trigger[] = [];

	shapes: Shape[] = [];
	/** Holds data shared between multiple shapes with the same constructor and .dts path. */
	sharedShapeData = new Map<string, Promise<SharedShapeData>>();
	/** The shapes used for drawing HUD overlay (powerups in the corner) */
	overlayShapes: Shape[] = [];
	overlayScene: Scene;
	overlayCamera: OrthographicCamera;
	/** The last end pad element in the mission file. */
	endPadElement: MissionElementStaticShape;

	/** Holds the setInterval id */
	tickInterval: number;
	timeState: TimeState;
	/** The last performance.now() time the physics were ticked. */
	lastPhysicsTick: number = null;
	lastFrameTime: number = null;
	/** Offline levels are meant for video rendering, not real-time play. */
	offline = false;
	offlineSettings: OfflineSettings = null;
	started = false;
	paused = true;
	pausedAt: number = null;
	/** If the level is stopped, it shouldn't be used anymore. */
	stopped = false;
	/** The timestate at the moment of finishing. */
	finishTime: TimeState = null;
	finishYaw: number;
	finishPitch: number;
	/** The maximum time that has been displayed in the current attempt. */
	maxDisplayedTime = 0;

	pitch = 0;
	yaw = 0;

	/** For handling Fake Gems Illusion */
	catchReal = false;

	/** For handling death chase player */
	dead = false;

	/** For handling the sting sounds */
	levelFinished = false;

	/** For handling Stop Watch */
	stopWatchActive = false;

	/** for handling the finish fireworks at random marble's position */
	finishFireworks: Firework[] = [];

	/** For handling special jump effect...*/
	enableCustomJumpAndDash = false;

	/** For Handling The Music Pads Musical Code Sequence */
	musicCodeSequence: number[] = [];
	correctMusicCode: number[] = [4, 5, 3, 1, 2];
	/** Only if the Player cracked the special Musical Code. */
	crackedMusicCode = false;

	/** Where the camera was when the marble went OOB. */
	oobCameraPosition: Vector3;
	lastVerticalTranslation = new Vector3();
	currentUp = new Vector3(0, 0, 1);
	/** The last time the orientation was changed (by a gravity modifier) */
	orientationChangeTime = -Infinity;
	/** The old camera orientation quat */
	oldOrientationQuat = new Quaternion();
	/** The new target camera orientation quat  */
	newOrientationQuat = new Quaternion();
	/** See usage. */
	previousMouseMovementDistance = 0;

	defaultGravity = 20;
	currentTimeTravelBonus = 0;
	heldPowerUp: PowerUp = null;
	totalGems = 0;
	gemCount = 0;
	score = 0;
	blastAmount = 0;
	outOfBounds = false;
	outOfBoundsTime: TimeState;
	/** When the jump button was pressed, remember that it was pressed until the next tick to execute the jump. */
	jumpQueued = false;
	useQueued = false;
	blastQueued = false;
	/** Whether or not the player is currently pressing the restart button. */
	pressingRestart = false;
	restartPressTime: number = null;

	/** Stores the shape that is the destination of the current checkpoint. */
	currentCheckpoint: Shape = null;
	/** If the checkpoint was triggered by a trigger, this field stores that trigger. */
	currentCheckpointTrigger: CheckpointTrigger = null;
	checkpointCollectedGems = new Set<Gem>();
	checkpointHeldPowerUp: PowerUp = null;
	/** Up vector at the point of checkpointing */
	checkpointUp: Vector3 = null;
	checkpointBlast: number = null;

	audio: AudioManager;
	timeTravelSound: AudioSource;
	/** The alarm that plays in MBP when the player is about to pass the "par time". */
	alarmSound: AudioSource;
	music: AudioSource;
	/** Used for jukebox stuff */
	originalMusicName: string;
	replay: Replay;

	/**TTT*/
	tttState: TTTState = null;

	// Tricks
	trickState: Tricks = null;

	// for handling tricks
	floorZ = 0;
	canDoAirTrick = true;
	maxHeight = 0;
	bigAirDone = false;
	hugeAirDone = false;
	leftPad = false; // Whether the marble left the main startpad or not (for competency levels)
	padIndex = 0; // tracks current StartPad in competency levels

	analytics = {
		missionPath: null as string,
		startTime: Date.now(),
		tries: 0,
		finishes: 0,
		outOfBoundsCount: 0,
		timePaused: 0,
		endTime: null as number,
		userRandomId: StorageManager.data.randomId
	};

	constructor(mission: Mission, offline: OfflineSettings = null) {
		super();

		this.mission = mission;
		this.loadingState = { loaded: 0, total: 0 };

		this.offline = !!offline;
		this.offlineSettings = offline;

		this.analytics.missionPath = mission.path;
	}

	/** Loads all necessary resources and builds the mission. */
	async init() {
		// Scan the mission for elements to determine required loading effort
		for (let element of this.mission.allElements) {
			if ([MissionElementType.InteriorInstance, MissionElementType.Item, MissionElementType.PathedInterior, MissionElementType.StaticShape, MissionElementType.TSStatic].includes(element._type)) {
				this.loadingState.total++;

				// Override the end pad element. We do this because only the last finish pad element will actually do anything.
				if (
					element._type === MissionElementType.StaticShape &&
					['endpad', 'endpad_mbg', 'endpad_mbp', 'specialendpad', 'tttpad'].includes(element.datablock?.toLowerCase())
				) {
					this.endPadElement = element;
				}
			}
		}
		this.loadingState.total += 6 + 1 + 3 + 6 + 1; // For the scene, marble, UI, sounds (includes music!), and scene compile

		this.timeState = {
			timeSinceLoad: -1000 / PHYSICS_TICK_RATE, // Will become 0 with first tick
			currentAttemptTime: 0,
			gameplayClock: 0,
			physicsTickCompletion: 0,
			tickIndex: 0
		};

		// Apply overridden gravity
		if (this.mission.misFile.marbleAttributes["gravity"] !== undefined) {
			this.defaultGravity = MisParser.parseNumber(this.mission.misFile.marbleAttributes["gravity"]);
		}

		if (!this.offline) {
			this.audio = mainAudioManager;
		} else {
			this.audio = new AudioManager();
			this.audio.init({ duration: this.offlineSettings.duration });
			this.audio.setAssetPath(mainAudioManager.assetPath);
			this.audio.soundGain.gain.value = this.offlineSettings.soundVolume ** 2;
			this.audio.musicGain.gain.value = this.offlineSettings.musicVolume ** 2;
			this.audio.currentTimeOverride = 0;
		}

		this.world = new World();
		await this.initScene();
		await this.initMarble(); this.loadingState.loaded += 1;
		this.particles = new ParticleManager(this);
		await this.particles.init(mainRenderer);
		this.scene.particleManager = this.particles;
		let soundPromise = this.initSounds();
		await this.addSimGroup(this.mission.root);
		await this.initUi(); this.loadingState.loaded += 3;
		await soundPromise; this.loadingState.loaded += 6;
		this.scene.compile(); this.loadingState.loaded += 1;

		this.replay = new Replay(this);

		if (this.mission.title === "Tic-Tac-Toe")
			this.tttState = new TTTState(this);

		this.trickState = new Tricks();
	}


	async start() {
		if (this.stopped) return;

		this.started = true;
		this.paused = false;
		this.restart(true);
		for (let interior of this.interiors) await interior.onLevelStart();
		for (let shape of this.shapes) await shape.onLevelStart();
		this.audio.normalizePositionalAudioVolume();
		this.music.play();


		resize(false); // To update renderer
		this.updateCamera(this.timeState); // Ensure that the camera is positioned correctly before the first tick for correct positional audio playback

		if (!this.offline) {
			this.tryRender();
			this.tickInterval = setInterval(this.tick.bind(this)) as unknown as number;
			this.lastPhysicsTick = performance.now(); // First render usually takes longer (JIT moment), so reset the last physics tick back to now
			mainCanvas.classList.remove('hidden');
		}
	}

	async initScene() {
		this.scene = new Scene(mainRenderer);

		let addedShadow = false;
		// There could be multiple suns, so do it for all of them
		for (let element of this.mission.allElements) {
			if (element._type !== MissionElementType.Sun) continue;

			let directionalColor = MisParser.parseVector4(element.color);
			let ambientColor = MisParser.parseVector4(element.ambient);
			let sunDirection = MisParser.parseVector3(element.direction);

			// Create the ambient light
			this.scene.addAmbientLight(new AmbientLight(new Vector3(ambientColor.x, ambientColor.y, ambientColor.z)));

			// Create the sunlight
			let directionalLight = new DirectionalLight(
				mainRenderer,
				new Vector3(directionalColor.x, directionalColor.y, directionalColor.z),
				sunDirection.clone()
			);
			this.scene.addDirectionalLight(directionalLight);

			if (!addedShadow) {
				addedShadow = true;

				let shadowCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 10);
				directionalLight.enableShadowCasting(256, shadowCamera);
			}
		}

		let skyElement = this.mission.allElements.find((element) => element._type === MissionElementType.Sky) as MissionElementSky;

		let fogColor = MisParser.parseVector4(skyElement.fogcolor);
		let skySolidColor = MisParser.parseVector4(skyElement.skysolidcolor);
		// This is kind of a weird situation here. It seems as if when the skysolidcolor isn't the default value, it's used as the skycolor; otherwise, fog color is used. Strange.
		if (skySolidColor.x !== 0.6 || skySolidColor.y !== 0.6 || skySolidColor.z !== 0.6) fogColor = skySolidColor;

		// Uber strange way Torque maps these values:
		if (fogColor.x > 1) fogColor.x = 1 - (fogColor.x - 1) % 256 / 256;
		if (fogColor.y > 1) fogColor.y = 1 - (fogColor.y - 1) % 256 / 256;
		if (fogColor.z > 1) fogColor.z = 1 - (fogColor.z - 1) % 256 / 256;

		mainRenderer.setClearColor(fogColor.x, fogColor.y, fogColor.z, 1);

		this.camera = new PerspectiveCamera(
			StorageManager.data.settings.fov,
			window.innerWidth / window.innerHeight,
			0.01,
			MisParser.parseNumber(skyElement.visibledistance)
		);

		if (skyElement.useskytextures === "1") {
			// Create the skybox
			let skyboxCubeTexture = await this.createSkyboxCubeTexture(skyElement.materiallist.slice(skyElement.materiallist.indexOf('data/') + 'data/'.length), true);
			if (skyboxCubeTexture) {
				let material = new Material();
				material.isSky = true;
				material.envMap = skyboxCubeTexture;
				material.depthWrite = false;
				material.renderOrder = -1000; // Render before everything else

				let geometry = new Geometry();
				geometry.positions.push(-1, -1, 0);
				geometry.positions.push(3, -1, 0);
				geometry.positions.push(-1, 3, 0);
				geometry.materials.push(0, 0, 0);
				geometry.indices.push(0, 1, 2);
				geometry.fillRest();

				let mesh = new Mesh(geometry, [material]);
				this.scene.add(mesh);
			}
		}

		let envmapCubeTexture = await this.createSkyboxCubeTexture('skies/sky_day.dml', false, 128); // Always the default MBG skybox
		// Use the skybox as the environment map. Don't use the actual envmap image file because its projection requires like three PhDs in mathematics.
		this.envMap = envmapCubeTexture;
	}

	async createSkyboxCubeTexture(dmlPath: string, increaseLoading: boolean, resampleTo?: number) {
		let dmlDirectoryPath = dmlPath.slice(0, dmlPath.lastIndexOf('/'));
		let dmlFile = await this.mission.getResource(dmlPath);
		if (dmlFile) {
			// Get all skybox images
			let lines = (await ResourceManager.readBlobAsText(dmlFile)).split('\n').map(x => x.trim().toLowerCase());

			let promises = lines.slice(0, 6).map(async (line) => {
				let filename = this.mission.getFullNamesOf(dmlDirectoryPath + '/' + line)[0];
				let result: HTMLImageElement;

				if (!filename) {
					result = new Image();
				} else {
					try {
						result = await this.mission.getImage(dmlDirectoryPath + '/' + filename);
					} catch (e) {
						console.error("Error loading skybox image:", e, "Defaulting to empty image.");
						result = new Image();
					}
				}

				if (increaseLoading) this.loadingState.loaded++;
				return result;
			});
			let skyboxImages = await Promise.all(promises);

			// Reorder them to the proper order
			skyboxImages = Util.remapIndices(skyboxImages, [1, 3, 4, 5, 0, 2]);
			if (resampleTo !== undefined) {
				skyboxImages = await Promise.all(skyboxImages.map(x => Util.resampleImage(x, resampleTo, resampleTo)));
			}

			let sizes = skyboxImages.flatMap(x => [x.width, x.height]);
			if (new Set(sizes).size > 1) {
				// Skybox images have different sizes: Let's bring them in line.
				let maxSize = Math.max(...sizes);
				skyboxImages = await Promise.all(skyboxImages.map(x => Util.resampleImage(x, maxSize, maxSize)));
			}

			let skyboxTexture = new CubeTexture(mainRenderer, skyboxImages);
			return skyboxTexture;
		} else {
			if (increaseLoading) this.loadingState.loaded += 6;
			return null;
		}
	}

	async initMarble() {
		this.marble = new Marble(this);
		await this.marble.init();

		this.scene.add(this.marble.group);
		this.world.add(this.marble.body);
	}

	async initUi() {
		// Load all necessary UI image elements
		await state.menu.hud.load();

		// Set up the HUD overlay

		let hudOverlayShapePaths = new Set<string>();
		for (let shape of this.shapes) {
			if (shape instanceof PowerUp || shape instanceof Gem ||
				shape.constructor.name === "Oil" ||
				shape.constructor.name === "Glue" ||
				shape.constructor.name === "StopWatch" ||
				shape.constructor.name === "Revealer"
			) {
				if (shape instanceof PowerUp && shape.autoUse) continue; // Can't collect these aye

				// We need to display the gem and powerup shapes in the HUD
				if (shape instanceof RandomPowerUp) {
					for (let path of shape.getAllDtsPaths()) hudOverlayShapePaths.add(path);
				} else {
					hudOverlayShapePaths.add(shape.dtsPath);
				}
			}
		}

		this.overlayShapes = [];

		this.overlayScene = new Scene(mainRenderer);
		let overlayLight = new AmbientLight(new Vector3().setScalar(1));
		this.overlayScene.addAmbientLight(overlayLight);

		this.overlayCamera = new OrthographicCamera(
			-window.innerWidth / 2,
			window.innerWidth / 2,
			-window.innerHeight / 2,
			window.innerHeight / 2,
			1,
			1000
		);
		this.overlayCamera.up.set(0, 0, -1);
		this.overlayCamera.lookAt(new Vector3(1, 0, 0));

		for (let path of hudOverlayShapePaths) {
			let shape = new Shape();
			shape.dtsPath = path;
			shape.ambientRotate = true;
			shape.showSequences = false;
			// MBP's UI gem color is randomized
			if (path.includes("gem") && state.menu.hud instanceof MbpHud) shape.matNamesOverride['base.gem'] = Gem.pickRandomColor() + '.gem';

			try {
				await shape.init();

				this.overlayShapes.push(shape);
				this.overlayScene.add(shape.group);

				if (path.includes("gem")) {
					shape.ambientSpinFactor /= -2; // Gems spin the other way apparently
				} else {
					shape.ambientSpinFactor /= 2;
					shape.setOpacity(0);
				}
			}
			catch (e) {
				console.error("Failed to load overlay shape:", path, e);
				// Don't add this shape to overlayShapes or overlayScene
			}
		}

		this.overlayScene.compile();

		if (state.menu.pauseScreen instanceof MbpPauseScreen)
			state.menu.pauseScreen.jukebox.reset();
	}

	async initSounds() {
		let musicFileName: string;
		if (this.mission.modification === 'ultra') {
			musicFileName = 'tim trance.ogg'; // ALWAYS play this banger
			this.originalMusicName = musicFileName;
		} else if (this.mission.missionInfo.music && this.mission.missionInfo.music.toLowerCase() !== 'pianoforte.ogg') {
			musicFileName = this.mission.missionInfo.music.toLowerCase();
			this.originalMusicName = musicFileName;
		} else {
			if (this.mission.modification === 'gold') {
				// Play the song based on the level index
				let missionArray = MissionLibrary.allCategories.find(x => x.includes(this.mission));
				let levelIndex = missionArray.indexOf(this.mission);
				switch ((levelIndex % 6) + 1) {
					case 1:
						musicFileName = 'low key.ogg';
						this.originalMusicName = 'low key.ogg';
						break;
					case 2:
						musicFileName = 'groove police.ogg';
						this.originalMusicName = 'groove police.ogg';
						break;
					case 3:
						musicFileName = 'cookout.ogg';
						this.originalMusicName = 'cookout.ogg';
						break;
					case 4:
						musicFileName = 'classic vibe.ogg';
						this.originalMusicName = 'classic vibe.ogg';
						break;
					case 5:
						musicFileName = 'beach party.ogg';
						this.originalMusicName = 'beach party.ogg';
						break;
					case 6:
						musicFileName = 'summer gathering.ogg';
						this.originalMusicName = 'summer gathering.ogg';
						break;
				}
			} else {
				// Play a random *MBP* song
				musicFileName = Util.randomFromArray(MBP_SONGS);
				this.originalMusicName = musicFileName;
			}
		}
		if (state.modification === 'platinum') musicFileName = 'music/' + musicFileName;
		else if (state.modification === 'gold') musicFileName = 'music/' + musicFileName;

		let toLoad = ["spawn.wav", "ready.wav", "set.wav", "go.wav", "whoosh.wav", musicFileName];
		if (isFinite(this.mission.qualifyTime) && state.modification === 'platinum') toLoad.push("alarm.wav", "alarm_timeout.wav", "infotutorial.wav");

		try {
			await this.audio.loadBuffers(toLoad);
		} catch (e) {
			// Something died, maybe it was the music, try replacing it with a song we know exists
			let newMusic = Util.randomFromArray(MBP_SONGS);
			this.originalMusicName = newMusic;
			toLoad[toLoad.indexOf(musicFileName)] = 'music/' + newMusic;
			musicFileName = 'music/' + newMusic;
			await this.audio.loadBuffers(toLoad);
		}

		this.music = this.audio.createAudioSource(musicFileName, this.audio.musicGain);
		this.music.setLoop(true);
		await this.music.promise;
	}

	/** Adds all elements within a sim group. */
	async addSimGroup(simGroup: MissionElementSimGroup) {
		// Check if it's a pathed interior group
		if (simGroup.elements.find((element) => element._type === MissionElementType.PathedInterior)) {
			// Create the pathed interior
			let pathedInterior = await PathedInterior.createFromSimGroup(simGroup, this);
			if (!pathedInterior) return;

			this.scene.add(pathedInterior.mesh);
			if (pathedInterior.hasCollision) this.world.add(pathedInterior.body);

			for (let trigger of pathedInterior.triggers) {
				this.world.add(trigger.body);
				this.triggers.push(trigger);
			}

			return;
		}

		let promises: Promise<any>[] = [];

		for (let element of simGroup.elements) {
			switch (element._type) {
				case MissionElementType.SimGroup:
					promises.push(this.addSimGroup(element));
					break;
				case MissionElementType.InteriorInstance:
					promises.push(this.addInterior(element));
					break;
				case MissionElementType.StaticShape: case MissionElementType.Item:
					promises.push(this.addShape(element));
					break;
				case MissionElementType.Trigger:
					promises.push(this.addTrigger(element));
					break;
				case MissionElementType.TSStatic:
					promises.push(this.addTSStatic(element));
					break;
				case MissionElementType.ParticleEmitterNode:
					this.addParticleEmitterNode(element);
					break;
			}
		}

		await Promise.all(promises);
	}

	async addInterior(element: MissionElementInteriorInstance) {
		let { dif: difFile, path } = await this.mission.getDif(element.interiorfile);
		if (!difFile) return;

		let interior = new Interior(difFile, path, this);
		this.interiors.push(interior);

		await Util.wait(10); // See shapes for the meaning of this hack
		await interior.init(element._id);

		this.scene.add(interior.mesh);

		let interiorPosition = MisParser.parseVector3(element.position);
		let interiorRotation = MisParser.parseRotation(element.rotation);
		let interiorScale = MisParser.parseVector3(element.scale);
		let hasCollision = interiorScale.x !== 0 && interiorScale.y !== 0 && interiorScale.z !== 0; // Don't want to add buggy geometry

		// Fix zero-volume interiors so they receive correct lighting
		if (interiorScale.x === 0) interiorScale.x = 0.0001;
		if (interiorScale.y === 0) interiorScale.y = 0.0001;
		if (interiorScale.z === 0) interiorScale.z = 0.0001;

		// Set the position, rotation and scale of the interior
		interior.originalPosition = interiorPosition.clone();
		interior.originalRotation = interiorRotation.clone();
		interior.originalScale = interiorScale.clone();

		interior.setTransform(interiorPosition, interiorRotation, interiorScale);

		if (hasCollision) this.world.add(interior.body);
	}

	async addShape(element: MissionElementStaticShape | MissionElementItem) {
		let shape: Shape;

		// Add the correct shape based on type
		let dataBlockLowerCase = element.datablock?.toLowerCase();
		if (!dataBlockLowerCase) { /* Make sure we don't do anything if there's no data block */ }
		else if (["startpad", "startpad_mbg", "startpad_mbp"].includes(dataBlockLowerCase)) shape = new StartPad(element as MissionElementStaticShape, false);
		else if (["endpad", "endpad_mbg", "endpad_mbp"].includes(dataBlockLowerCase)) shape = new EndPad(element === this.endPadElement, false);
		else if (dataBlockLowerCase === "musicpad") shape = new MusicPad(element as MissionElementStaticShape);
		else if (["specialstartpad"].includes(dataBlockLowerCase)) shape = new StartPad(element as MissionElementStaticShape, true);
		else if (["specialendpad"].includes(dataBlockLowerCase)) shape = new EndPad(element === this.endPadElement, true);
		else if (dataBlockLowerCase === "signfinish") shape = new SignFinish();
		else if (dataBlockLowerCase === "dummysignfinish") shape = new DummySignFinish();
		else if (dataBlockLowerCase.startsWith("signplain")) shape = new SignPlain(element as MissionElementStaticShape);
		else if (dataBlockLowerCase.startsWith("gemitem")) shape = new Gem(element as MissionElementItem), this.totalGems++;
		else if (dataBlockLowerCase.startsWith("dummygemitem")) shape = new DummyGem(element as MissionElementItem);
		else if (dataBlockLowerCase === "superjumpitem") shape = new SuperJump(element as MissionElementItem);
		else if (dataBlockLowerCase === "doubleritem") shape = new Doubler(element as MissionElementItem);
		else if (dataBlockLowerCase.startsWith("signcaution")) shape = new SignCaution(element as MissionElementStaticShape);
		else if (dataBlockLowerCase === "superbounceitem") shape = new SuperBounce(element as MissionElementItem);
		else if (dataBlockLowerCase === "roundbumper") shape = new RoundBumper();
		else if (dataBlockLowerCase === "lavafloor") shape = new LavaFloor();
		else if (dataBlockLowerCase === "trianglebumper") shape = new TriangleBumper();
		else if (dataBlockLowerCase === "helicopteritem") shape = new Helicopter(element as MissionElementItem);
		else if (dataBlockLowerCase === "airplaneground") shape = new Airplane(element as MissionElementItem);
		else if (dataBlockLowerCase === "oilitem") shape = new Oil(element as MissionElementItem);
		else if (dataBlockLowerCase === "glueitem") shape = new Glue(element as MissionElementItem);
		else if (dataBlockLowerCase === "revealeritem") shape = new Revealer(element as MissionElementItem);
		else if (dataBlockLowerCase === "ductfan") shape = new DuctFan();
		else if (dataBlockLowerCase === "grass") shape = new Grass();
		else if (dataBlockLowerCase === "television") shape = new Television();
		else if (dataBlockLowerCase === "smallductfan") shape = new SmallDuctFan();
		else if (dataBlockLowerCase === "antigravityitem") shape = new AntiGravity(element as MissionElementItem);
		else if (dataBlockLowerCase === "norespawnantigravityitem") shape = new AntiGravity(element as MissionElementItem, true);
		else if (dataBlockLowerCase === "landmine") shape = new LandMine(false);
		else if (dataBlockLowerCase === "skymine") shape = new SkyMine(element as MissionElementStaticShape);
		else if (dataBlockLowerCase === "fishmine") shape = new FishMine(element as MissionElementStaticShape);
		else if (dataBlockLowerCase === "stopwatchitem") shape = new StopWatch(element as MissionElementItem);
		else if (dataBlockLowerCase === "metalitem") shape = new Metal(element as MissionElementItem);
		else if (dataBlockLowerCase === "paperitem") shape = new Paper(element as MissionElementItem);
		else if (dataBlockLowerCase === "landminespecial") shape = new LandMine(true);
		else if (dataBlockLowerCase === "shockabsorberitem") shape = new ShockAbsorber(element as MissionElementItem);
		else if (dataBlockLowerCase === "superspeeditem") shape = new SuperSpeed(element as MissionElementItem);
		else if (["timetravelitem", "timepenaltyitem"].includes(dataBlockLowerCase)) shape = new TimeTravel(element as MissionElementItem);
		else if (dataBlockLowerCase === "tornado") shape = new Tornado(element as MissionElementStaticShape);
		else if (dataBlockLowerCase === "specialtornado") shape = new SpecialTornado(element as MissionElementStaticShape);
		else if (dataBlockLowerCase === "trapdoor") shape = new TrapDoor(element as MissionElementStaticShape);
		else if (dataBlockLowerCase === "oilslick") shape = new Oilslick();
		else if (dataBlockLowerCase === "iceslick") shape = new Iceslick();
		else if (dataBlockLowerCase === "icepane") shape = new IcePane();
		else if (dataBlockLowerCase === "iglooitem") shape = new IglooItem();
		else if (dataBlockLowerCase === "kaitensupport") shape = new KaitenSupport();
		else if (dataBlockLowerCase === "lightning") shape = new Lightning();
		else if (dataBlockLowerCase === "monsoon") shape = new Monsoon();
		else if (dataBlockLowerCase === "rotatingplatform1") shape = new RotatingPlatform1();
		else if (dataBlockLowerCase === "rotatingplatform2") shape = new RotatingPlatform2(element as MissionElementStaticShape);
		else if (dataBlockLowerCase === "disappearplatform") shape = new DisappearPlatform();
		else if (dataBlockLowerCase === "legitplatform") shape = new LegitPlatform();
		else if (dataBlockLowerCase === "appearplatform") shape = new AppearPlatform();
		else if (dataBlockLowerCase === "simplatform") shape = new SimPlatform();
		else if (dataBlockLowerCase === "simbox") shape = new SimBox();
		else if (dataBlockLowerCase === "springboard") shape = new SpringBoard();
		else if (dataBlockLowerCase === "planet") shape = new Planet();
		else if (dataBlockLowerCase === "pushbutton") shape = new PushButton();
		else if (dataBlockLowerCase.startsWith("sign") || dataBlockLowerCase === "arrow") shape = new Sign(element as MissionElementStaticShape);
		else if (dataBlockLowerCase === "magnet") shape = new Magnet();
		else if (dataBlockLowerCase === "nuke") shape = new Nuke();
		else if (dataBlockLowerCase === "checkpoint") shape = new Checkpoint();
		else if (dataBlockLowerCase === "easteregg") shape = new EasterEgg(element as MissionElementItem);
		else if (dataBlockLowerCase === "skillpointitem") shape = new SkillPointItem(element as MissionElementItem);
		else if (dataBlockLowerCase === "randompowerupitem") shape = new RandomPowerUp(element as MissionElementItem);
		else if (["clear", "cloudy", "dusk", "wintry"].includes(dataBlockLowerCase)) shape = new Sky(dataBlockLowerCase);
		else if (/glass_\d+shape/.test(dataBlockLowerCase)) shape = new Glass(dataBlockLowerCase);
		else if (dataBlockLowerCase === "blastitem") shape = new Blast(element as MissionElementItem);
		else if (dataBlockLowerCase === "megamarbleitem") shape = new MegaMarble(element as MissionElementItem);
		else if (dataBlockLowerCase === "tttpad") shape = new TTTPad(element as MissionElementStaticShape);

		if (!shape) return;

		this.shapes.push(shape);
		// This is a bit hacky, but wait a short amount so that all shapes will have been created by the time this codepath continues. This is necessary for correct sharing of data between shapes.
		await Util.wait(10);
		await shape.init(this, element);

		// Set the shape's transform
		let shapePosition = MisParser.parseVector3(element.position);
		let shapeRotation = MisParser.parseRotation(element.rotation);
		let shapeScale = MisParser.parseVector3(element.scale);

		// Apparently we still do collide with zero-volume shapes
		if (shapeScale.x === 0) shapeScale.x = 0.0001;
		if (shapeScale.y === 0) shapeScale.y = 0.0001;
		if (shapeScale.z === 0) shapeScale.z = 0.0001;

		shape.setTransform(shapePosition, shapeRotation, shapeScale);

		this.scene.add(shape.group);

		for (let body of shape.bodies) this.world.add(body);
		for (let collider of shape.colliders) this.world.add(collider.body);
	}

	async addTrigger(element: MissionElementTrigger) {
		let trigger: Trigger;

		// Create a trigger based on type
		let dataBlockLowerCase = element.datablock?.toLowerCase();
		if (dataBlockLowerCase === "outofboundstrigger") {
			trigger = new OutOfBoundsTrigger(element, this);
		} else if (dataBlockLowerCase === "inboundstrigger") {
			trigger = new InBoundsTrigger(element, this);
		} else if (dataBlockLowerCase === "helptrigger") {
			trigger = new HelpTrigger(element, this);
		} else if (dataBlockLowerCase === "nojumptrigger") {
			trigger = new NoJumpTrigger(element, this);
		} else if (dataBlockLowerCase === "teleporttrigger") {
			trigger = new TeleportTrigger(element, this);
		} else if (dataBlockLowerCase === "destinationtrigger") {
			trigger = new DestinationTrigger(element, this);
		} else if (dataBlockLowerCase === "seamlessmotiontrigger") {
			trigger = new SeamlessMotionTrigger(element, this);
		} else if (dataBlockLowerCase === "checkpointtrigger") {
			trigger = new CheckpointTrigger(element, this);
		} else if (dataBlockLowerCase === "tricktrigger") {
			trigger = new TrickTrigger(element, this);
		} else if (dataBlockLowerCase === "trololotrigger") {
			trigger = new TrololoTrigger(element, this);
		} else if (dataBlockLowerCase === "cornertrigger") {
			trigger = new CornerTrigger(element, this);
		} else if (dataBlockLowerCase === "whirlitrigger") {
			trigger = new WhirliTrigger(element, this);
		}

		if (!trigger) return;

		this.triggers.push(trigger);
		this.world.add(trigger.body);

		await trigger.init();
	}

	/** Adds a TSStatic (totally static shape) to the world. */
	async addTSStatic(element: MissionElementTSStatic) {
		let shape = new Shape();
		let shapeName = element.shapename.toLowerCase();
		let index = shapeName.indexOf('data/');
		if (index === -1) return null;

		shape.dtsPath = shapeName.slice(index + 'data/'.length);
		shape.isTSStatic = true;
		shape.shareId = 1;
		if (shapeName.includes('colmesh')) shape.receiveShadows = false; // Special case for colmesh

		this.shapes.push(shape);
		await Util.wait(10); // Same hack as for regular shapes
		try {
			await shape.init(this, element);
		} catch (e) {
			console.error("Error in creating TSStatic, skipping it for now.", e);
			Util.removeFromArray(this.shapes, shape);
			return null;
		}

		shape.setTransform(MisParser.parseVector3(element.position), MisParser.parseRotation(element.rotation), MisParser.parseVector3(element.scale));

		this.scene.add(shape.group);
		if (shape.worldScale.x !== 0 && shape.worldScale.y !== 0 && shape.worldScale.z !== 0) {
			// Only add the shape if it actually has any volume
			for (let body of shape.bodies) this.world.add(body);
			for (let collider of shape.colliders) this.world.add(collider.body);
		}
		return shape;
	}

	removeShape(shape: Shape) {
		// Remove the shape from the world
		this.world.bodies = this.world.bodies.filter((body) => !shape.bodies.includes(body));
		for (let collider of shape.bodies)
			for (let shape of collider.shapes)
				this.world.octree.remove(shape);

		for (let collider of shape.colliders) {
			for (let body of collider.body.shapes)
				this.world.octree.remove(body);
			this.world.bodies = this.world.bodies.filter((body) => body !== collider.body);
		}

		// Remove the shape from the scene
		this.scene.remove(shape.group);

		// Remove the shape from the shapes array
		Util.removeFromArray(this.shapes, shape);
	}

	/** Adds a ParticleEmitterNode to the world. */
	addParticleEmitterNode(element: MissionElementParticleEmitterNode) {
		let emitterOptions = particleEmitterMap[element.emitter];
		if (!emitterOptions) return;

		this.particles.createEmitter(emitterOptions, MisParser.parseVector3(element.position));
	}

	/** Restarts and resets the level. */
	restart(forceHardRestart: boolean) {
		if (!forceHardRestart && this.mission.backwardClock && this.replay.mode !== "playback") {
			let startPad = Util.findLast(this.shapes, (shape) => shape instanceof StartPad);
			this.saveCheckpointState(startPad);
			this.loadCheckpointState();
			return;
		}

		if (!forceHardRestart && this.currentCheckpoint && this.replay.mode !== 'playback') {
			// There's a checkpoint, so load its state instead of restarting the whole level
			this.loadCheckpointState();
			return;
		}

		let hud = state.menu.hud;
		hud.setPowerupButtonState(false, true);

		this.timeState.gameplayClock = 0;

		if (this.replay && this.replay.version <= 4) {
			// In older versions, the first tick would immediately advance the entire simulation to a non-zero time instead of correctly keeping it at 0 for a while.
			this.timeState.currentAttemptTime = 0;
			this.timeState.tickIndex = 0;
		} else {
			// Both of these will become zero after the first tick:
			this.timeState.currentAttemptTime = -1000 / PHYSICS_TICK_RATE;
			this.timeState.tickIndex = -1;
		}

		this.tttState?.reset();
		this.trickState.resetCombo();

		this.music.setPlaybackRate(1);

		this.currentTimeTravelBonus = 0;
		this.outOfBounds = false;
		this.lastPhysicsTick = null;
		this.maxDisplayedTime = 0;
		this.blastAmount = 0;
		this.gemCount = 0;
		this.score = 0;
		this.leftPad = false;
		this.padIndex = 0;

		this.currentCheckpoint = null;
		this.currentCheckpointTrigger = null;
		this.checkpointCollectedGems.clear();
		this.checkpointHeldPowerUp = null;
		this.checkpointUp = null;
		this.checkpointBlast = null;
		this.restartPressTime = null;

		this.finishTime = null;
		this.levelFinished = false;
		this.dead = false;
		this.crackedMusicCode = false;
		this.bigAirDone = false;
		this.hugeAirDone = false;

		let { position: startPosition, euler } = this.getStartPositionAndOrientation();

		// Place the marble a bit above the start pad position
		this.marble.body.position.set(startPosition.x, startPosition.y, startPosition.z + 3);
		this.marble.body.syncShapes();
		this.marble.group.position.copy(this.marble.body.position);
		this.marble.group.recomputeTransform();
		this.marble.reset();
		this.marble.calculatePredictiveTransforms();

		// Determine starting camera orientation based on the start pad
		this.yaw = euler.z + Math.PI / 2;
		this.pitch = DEFAULT_PITCH;

		let missionInfo = this.mission.missionInfo;
		if (missionInfo.starthelptext) state.menu.hud.displayHelp(missionInfo.starthelptext); // Show the start help text

		for (let shape of this.shapes) shape.reset();
		for (let interior of this.interiors) interior.reset();
		for (let trigger of this.triggers) trigger.reset();

		// Reset the physics
		this.currentUp.set(0, 0, 1);
		this.orientationChangeTime = -Infinity;
		this.oldOrientationQuat = new Quaternion();
		this.newOrientationQuat = new Quaternion();
		this.setGravityIntensity(this.defaultGravity);

		this.deselectPowerUp();
		hud.setCenterText('none');
		maybeShowTouchControls();
		setTouchControlMode((this.replay.mode === 'playback') ? 'replay' : 'normal');

		this.timeTravelSound?.stop();
		this.timeTravelSound = null;
		this.alarmSound?.stop();
		this.alarmSound = null;

		this.replay.init();

		this.analytics.tries++;

		// Queue the ready-set-go events

		this.audio.play('spawn.wav');

		this.clearSchedule();
		this.schedule(500, () => {
			hud.setCenterText('ready');
			this.audio.play('ready.wav');
		});
		this.schedule(2000, () => {
			hud.setCenterText('set');
			this.audio.play('set.wav');
		});
		this.schedule(GO_TIME, () => {
			hud.setCenterText('go');
			this.audio.play('go.wav');
		});
		this.schedule(5500, () => {
			if (!this.outOfBounds) hud.setCenterText('none');
		});
	}

	/** Instantly respawns the marble when went OOB...but not erasing the stats */
	fastRespawnPlayer() {
		// Cancel any OOB schedules or pending state resets
		this.clearScheduleId('oobRestart');

		// Reset OOB state
		this.outOfBounds = false;
		this.dead = false;
		this.audio.play('spawn.wav');
		let startPosition: Vector3;
		let euler: Euler;

		if (this.mission.competency && this.currentCheckpoint) {
			// Competency: use the checkpoint set by pickUpGem()
			startPosition = this.currentCheckpoint.group.position.clone(); // There could be multiple startPads..spawning on all of them
			euler = new Euler();
		} else {
			// In non competency levels...spawning on a single startPad
			({ position: startPosition, euler } = this.getStartPositionAndOrientation());
		}

		// Respawn immediately
		({ position: startPosition, euler } = this.getStartPositionAndOrientation());
		// Position the marble
		this.marble.body.position.set(startPosition.x, startPosition.y, startPosition.z + 3);
		this.marble.body.linearVelocity.setScalar(0);
		this.marble.body.angularVelocity.setScalar(0);
		this.marble.body.syncShapes();
		this.marble.group.position.copy(this.marble.body.position);
		this.marble.group.recomputeTransform();
		this.marble.reset();
		this.marble.calculatePredictiveTransforms();
		// Restore orientation
		this.yaw = euler.z + Math.PI / 2;
		this.pitch = DEFAULT_PITCH;

		// Reset camera text
		state.menu.hud.setCenterText('none');

		// Re-enable powerup UI....a sweet spot
		state.menu.hud.setPowerupButtonState(true);

		// Record respawn in replay
		this.replay.recordCheckpointRespawn();

		// Reset the physics
		this.currentUp.set(0, 0, 1);
		this.orientationChangeTime = -Infinity;
		this.oldOrientationQuat = new Quaternion();
		this.newOrientationQuat = new Quaternion();
		this.setGravityIntensity(this.defaultGravity);

		// No air tricks popping on respawn...but can do them again....
		this.bigAirDone = false;
		this.hugeAirDone = false;
		this.maxHeight = 0;
		this.canDoAirTrick = false;
		this.floorZ = this.marble.body.position.z; // VERY IMPORTANT
	}

	tryRender() {
		if (this.stopped) return;
		requestAnimationFrame(this.tryRender.bind(this));

		let time = performance.now();
		if (this.lastFrameTime === null) {
			this.lastFrameTime = time;
		} else {
			let cap = FRAME_RATE_OPTIONS[StorageManager.data.settings.frameRateCap];

			// When FPS is unlocked in the browser but limited in-game, for some browser frames, the game won't draw anything. This makes the browser think it's okay to slow down the rate of requestAnimationFrame, which is not desirable in this case. Therefore we trick the browser into thinking the GPU is doing something by continuously clearing a 1x1 canvas each frame.
			if (isFinite(cap)) decoyCtx.clearRect(0, 0, 1, 1);

			// Take care of frame rate limiting:
			let elapsed = time - this.lastFrameTime;
			let required = 1000 / cap;
			if (elapsed < required) return;

			this.lastFrameTime += required;
			this.lastFrameTime = Math.max(this.lastFrameTime, time - 2 * required); // To avoid the last frame time from lagging behind
		}

		this.render(time);
	}

	render(time: number) {
		if (this.stopped) return;

		this.tick(time);

		if (this.stopped) return; // Check it again here 'cuz the tick might've changed it

		let physicsTickLength = 1000 / PHYSICS_TICK_RATE;
		let completion = Util.clamp((time - this.lastPhysicsTick) / physicsTickLength * PLAYBACK_SPEED, 0, 1);
		// Set up an intermediate time state for smoother rendering
		let tempTimeState: TimeState = {
			timeSinceLoad: this.timeState.timeSinceLoad + completion * physicsTickLength,
			currentAttemptTime: this.timeState.currentAttemptTime + completion * physicsTickLength,
			gameplayClock: (this.currentTimeTravelBonus || this.timeState.currentAttemptTime < GO_TIME) ? this.timeState.gameplayClock : this.timeState.gameplayClock + completion * physicsTickLength,
			physicsTickCompletion: completion,
			tickIndex: this.timeState.tickIndex + completion
		};

		this.marble.render(tempTimeState);
		for (let interior of this.interiors) interior.render(tempTimeState);
		for (let shape of this.shapes) shape.render(tempTimeState);
		this.particles.render(tempTimeState.timeSinceLoad);

		this.updateCamera(tempTimeState);
		this.camera.updateMatrixWorld();

		// Update the shadow camera
		this.scene.directionalLights[0]?.updateCamera(this.marble.group.position.clone(), -1);

		// Render the scene
		this.scene.prepareForRender(this.camera);
		this.marble.renderReflection();
		mainRenderer.render(this.scene, this.camera);

		// Update the overlay
		for (let overlayShape of this.overlayShapes) {
			overlayShape.group.position.x = 500; // Make sure the shape is between the near and far planes of the camera
			overlayShape.render(this.timeState);

			if (overlayShape.dtsPath.includes("gem")) {
				overlayShape.group.scale.setScalar(45 / SCALING_RATIO);
				overlayShape.group.position.y = 25 / SCALING_RATIO;
				overlayShape.group.position.z = -35 / SCALING_RATIO;
			} else {
				overlayShape.group.scale.setScalar((SHAPE_OVERLAY_SCALES[overlayShape.dtsPath as keyof typeof SHAPE_OVERLAY_SCALES] ?? 40) / SCALING_RATIO);
				overlayShape.group.position.y = this.overlayCamera.right - 55 / SCALING_RATIO;
				overlayShape.group.position.z = SHAPE_OVERLAY_OFFSETS[overlayShape.dtsPath as keyof typeof SHAPE_OVERLAY_OFFSETS] / SCALING_RATIO;
			}

			overlayShape.group.recomputeTransform();
		}

		// Render the overlay
		this.overlayCamera.updateMatrixWorld();
		this.overlayScene.prepareForRender(this.overlayCamera);
		mainRenderer.render(this.overlayScene, this.overlayCamera, null, false);

		let hud = state.menu.hud;
		hud.renderHud(tempTimeState);
		hud.displayFps();
	}

	/** Updates the position of the camera based on marble position and orientation. */
	updateCamera(timeState: TimeState) {
		let marblePosition = this.marble.group.position;
		let orientationQuat = this.getOrientationQuat(timeState);
		let up = new Vector3(0, 0, 1).applyQuaternion(orientationQuat);
		let directionVector = new Vector3(1, 0, 0);
		// The camera is translated up a bit so it looks "over" the marble
		let cameraVerticalTranslation = new Vector3(0, 0, 0.3);

		if (this.replay.mode === 'playback') {
			let indexLow = Math.max(0, this.replay.currentTickIndex - 1);
			let indexHigh = this.replay.currentTickIndex;

			// Smoothly interpolate pitch and yaw between the last two keyframes
			this.pitch = Util.lerp(this.replay.cameraOrientations[indexLow].pitch, this.replay.cameraOrientations[indexHigh].pitch, timeState.physicsTickCompletion);
			this.pitch = Math.max(-Math.PI / 2 + Math.PI / 4, Math.min(Math.PI / 2 - 0.0001, this.pitch)); // This bounds thing might have gotten inaccurate in the conversion from float64 to float32, so do it here again
			this.yaw = Util.lerp(this.replay.cameraOrientations[indexLow].yaw, this.replay.cameraOrientations[indexHigh].yaw, timeState.physicsTickCompletion);
		}

		if (this.finishTime) {
			// Make the camera spin around slowly
			if (this.mission.title === "Tic-Tac-Toe") return; // Don't spin the camera if won in tic tac toe
			this.pitch = Util.lerp(this.finishPitch, DEFAULT_PITCH, Util.clamp((timeState.currentAttemptTime - this.finishTime.currentAttemptTime) / 333, 0, 1));
			this.yaw = this.finishYaw - (timeState.currentAttemptTime - this.finishTime.currentAttemptTime) / 1000 * 0.6;
		}

		if (!this.outOfBounds) {
			directionVector.applyAxisAngle(new Vector3(0, 1, 0), this.pitch);
			directionVector.applyAxisAngle(new Vector3(0, 0, 1), this.yaw);
			directionVector.applyQuaternion(orientationQuat);

			cameraVerticalTranslation.applyAxisAngle(new Vector3(0, 1, 0), this.pitch);
			cameraVerticalTranslation.applyAxisAngle(new Vector3(0, 0, 1), this.yaw);
			cameraVerticalTranslation.applyQuaternion(orientationQuat);

			this.camera.up = up;
			this.camera.position.copy(marblePosition).sub(directionVector.clone().multiplyScalar(2.5));
			this.camera.lookAt(marblePosition);
			this.camera.position.add(cameraVerticalTranslation);

			// Handle wall intersections:
			const closeness = 0.1;
			let rayCastOrigin = marblePosition;

			let processedShapes = new Set<CollisionShape>();
			for (let i = 0; i < 3; i++) {
				// Shoot rays from the marble to the postiion of the camera
				let rayCastDirection = this.camera.position.clone().sub(rayCastOrigin);
				rayCastDirection.addScaledVector(rayCastDirection.clone().normalize(), 2);

				let length = rayCastDirection.length();
				let hits = this.world.castRay(rayCastOrigin, rayCastDirection.normalize(), length);
				let firstHit = hits.find(x => x.shape !== this.marble.shape && !processedShapes.has(x.shape));

				if (firstHit) {
					processedShapes.add(firstHit.shape);

					// Construct a plane at the point of ray impact based on the normal
					let plane = new Plane();
					let normal = firstHit.normal;
					let position = firstHit.point;
					plane.setFromNormalAndCoplanarPoint(normal, position);

					// Project the camera position onto the plane
					let target = new Vector3();
					let projected = plane.projectPoint(this.camera.position, target);

					// If the camera is too far from the plane anyway, break
					let dist = plane.distanceToPoint(this.camera.position);
					if (dist >= closeness) break;

					// Go the projected point and look at the marble
					this.camera.position.copy(projected).addScaledVector(normal, closeness);
					Util.cameraLookAtDirect(this.camera, marblePosition);

					let rotationAxis = new Vector3(1, 0, 0);
					rotationAxis.applyQuaternion(this.camera.orientation);

					let theta = Math.atan(0.3 / 2.5); // 0.3 is the vertical translation, 2.5 the distance away from the marble.

					// Rotate the camera back upwards such that the marble is in the same visual location on screen as before
					let rot = new Quaternion().setFromAxisAngle(rotationAxis, theta);
					this.camera.orientation.premultiply(rot);
					continue;
				}

				break;
			}

			this.lastVerticalTranslation = cameraVerticalTranslation;
		} else {
			// Simply look at the marble
			this.camera.position.copy(this.oobCameraPosition);
			this.camera.position.sub(this.lastVerticalTranslation);
			this.camera.lookAt(marblePosition);
			this.camera.position.add(this.lastVerticalTranslation);
		}
	}

	tick(time?: number) {
		if (this.stopped) return;
		if (this.paused) return;

		if (time === undefined) time = performance.now();
		let playReplay = this.replay.mode === 'playback';

		if (!playReplay && !state.menu.finishScreen.showing && (isPressed('use') || this.useQueued) && getPressedFlag('use')) {
			if (this.outOfBounds && !this.finishTime) {
				// Skip the out of bounds "animation" and restart immediately
				this.restart(false);
				return;
			}
		}

		state.menu.finishScreen.handleGamepadInput();

		// Handle pressing of the gamepad pause button
		if (isPressed('pause') && getPressedFlag('pause')) {
			resetPressedFlag('pause');
			resetPressedFlag('jump');
			resetPressedFlag('use');
			resetPressedFlag('restart');
			this.pause();
		}

		let forcePhysicsTick = false;
		if (this.lastPhysicsTick === null) {
			// If there hasn't been a physics tick yet, ensure there is one now
			this.lastPhysicsTick = time - 1000 / PHYSICS_TICK_RATE / PLAYBACK_SPEED;
			forcePhysicsTick = true;
		}

		/** Time since the last physics tick */
		let elapsed = time - this.lastPhysicsTick;
		elapsed *= PLAYBACK_SPEED;
		if (elapsed >= 1000) {
			elapsed = 1000;
			this.lastPhysicsTick = time - 1000;
		}

		let tickDone = false;
		// Make sure to execute the correct amount of ticks
		while (elapsed >= 1000 / PHYSICS_TICK_RATE || forcePhysicsTick) {
			let prevGameplayClock = this.timeState.gameplayClock;

			// Update gameplay clock, taking into account the Time Travel state
			if (this.timeState.currentAttemptTime >= GO_TIME) {
				if (this.currentTimeTravelBonus > 0) {
					// Subtract remaining time travel time
					this.currentTimeTravelBonus -= 1000 / PHYSICS_TICK_RATE;

					if (!this.timeTravelSound) {
						this.timeTravelSound = this.audio.createAudioSource('timetravelactive.wav');
						this.timeTravelSound.setLoop(true);
						this.timeTravelSound.play();
					}
				} else {
					// Increase the gameplay time
					this.timeState.gameplayClock += 1000 / PHYSICS_TICK_RATE;

					this.timeTravelSound?.stop();
					this.timeTravelSound = null;
				}

				if (this.currentTimeTravelBonus < 0) {
					// If we slightly undershot the zero mark of the remaining time travel bonus, add the "lost time" back onto the gameplay clock:
					this.timeState.gameplayClock += -this.currentTimeTravelBonus;
					this.currentTimeTravelBonus = 0;
					// Take heed though....the Time Travels shouldnt be affected since we are doing the stopwatch....
					// Release the objects after the watch effect is over
					if (this.stopWatchActive) {
						this.music.setPlaybackRate(1); // Play back the music...
						this.stopWatchActive = false;
					}
				}
			}

			this.timeState.timeSinceLoad += 1000 / PHYSICS_TICK_RATE;
			this.timeState.currentAttemptTime += 1000 / PHYSICS_TICK_RATE;
			this.timeState.tickIndex++;
			this.lastPhysicsTick += 1000 / PHYSICS_TICK_RATE / PLAYBACK_SPEED;
			elapsed -= 1000 / PHYSICS_TICK_RATE;
			forcePhysicsTick = false;

			this.tickSchedule(this.timeState.currentAttemptTime);

			if (this.offline) this.audio.currentTimeOverride = this.timeState.currentAttemptTime / 1000;

			if (this.mission.hasBlast && this.blastAmount < 1) this.blastAmount = Util.clamp(this.blastAmount + 1000 / BLAST_CHARGE_TIME / PHYSICS_TICK_RATE, 0, 1);

			for (let interior of this.interiors) interior.tick(this.timeState);
			for (let trigger of this.triggers) trigger.tick(this.timeState);
			for (let shape of this.shapes) if (!shape.isTSStatic) shape.tick(this.timeState);
			this.marble.tick(this.timeState);

			if (!playReplay) {
				let gravityBefore = this.world.gravity.clone();
				if (this.finishTime) this.world.gravity.setScalar(0);
				this.world.step(1 / PHYSICS_TICK_RATE);
				this.world.gravity.copy(gravityBefore);
			}

			this.jumpQueued = false;
			this.useQueued = false;
			this.blastQueued = false;

			let yawChange = 0.0;
			let pitchChange = 0.0;
			let freeLook = StorageManager.data.settings.alwaysFreeLook || isPressed('freeLook');
			let amount = Util.lerp(1, 6, StorageManager.data.settings.keyboardSensitivity);
			if (isPressed('cameraLeft')) yawChange += amount;
			if (isPressed('cameraRight')) yawChange -= amount;
			if (isPressed('cameraUp')) pitchChange -= amount;
			if (isPressed('cameraDown')) pitchChange += amount;

			yawChange -= gamepadAxes.cameraX * Util.lerp(0.5, 10, StorageManager.data.settings.mouseSensitivity);
			if (freeLook) pitchChange += gamepadAxes.cameraY * Util.lerp(0.5, 10, StorageManager.data.settings.mouseSensitivity);

			this.yaw += yawChange / PHYSICS_TICK_RATE;
			this.pitch += pitchChange / PHYSICS_TICK_RATE;

			this.particles.tick();
			tickDone = true;

			// Handle alarm warnings (that the user is about to exceed the par time)
			if (this.timeState.currentAttemptTime >= GO_TIME && isFinite(this.mission.qualifyTime) && state.modification === 'platinum' && !this.finishTime) {
				let alarmStart = this.mission.computeAlarmStartTime();

				if (prevGameplayClock <= alarmStart && this.timeState.gameplayClock >= alarmStart && !this.alarmSound) {
					// Start the alarm
					this.alarmSound = this.audio.createAudioSource('alarm.wav');
					this.alarmSound.setLoop(true);
					this.alarmSound.play();
					state.menu.hud.displayHelp(`You have ${(this.mission.qualifyTime - alarmStart) / 1000} seconds remaining.`, true);
				}
				if (prevGameplayClock < this.mission.qualifyTime && this.timeState.gameplayClock >= this.mission.qualifyTime) {
					// Stop the alarm
					this.alarmSound?.stop();
					this.alarmSound = null;
					state.menu.hud.displayHelp("The clock has passed the Par Time.", true);
					this.audio.play('alarm_timeout.wav');
				}
			}

			// Record or playback the replay
			if (!playReplay) {
				this.replay.record();
			} else {
				this.replay.playBack();
				if (this.replay.isPlaybackComplete()) {
					this.stopAndExit();
					return;
				}
			}
		}

		this.audio.updatePositionalAudio(this.timeState, this.camera.position, this.yaw);
		this.pitch = Math.max(-Math.PI / 2 + Math.PI / 4, Math.min(Math.PI / 2 - 0.0001, this.pitch)); // The player can't look straight up
		if (tickDone) this.marble.calculatePredictiveTransforms();

		// Handle pressing of the restart button
		if (!this.finishTime && isPressed('restart') && !this.pressingRestart) {
			if (this.mission.backwardClock || this.mission.competency) {
				// For backwardClock or Competency levels, R should fully restart (hard respawn)
				this.restart(true);
			} else {
				this.restart(false);
			}
			if (this.currentCheckpoint) this.restartPressTime = performance.now();
			this.pressingRestart = true;
		} else if (!isPressed('restart')) {
			this.pressingRestart = false;
		}

		// Holding down the restart button for 1 second will force a hard restart
		if (!this.finishTime && isPressed('restart') && this.restartPressTime !== null) {
			if (this.restartPressTime !== null && performance.now() - this.restartPressTime >= 1000)
				this.restart(true);
		}

		// The FlashLight Effect for interiors in slendernado level...
		// Visibility of the interiors will change with respect to marble's proximity to them.
		if (this.mission.title === "Slendernado") {
			for (const interior of this.interiors) {
				interior.updateVisibility(this.marble.body.position);
			}
		}

		// for handling finish fireworks at random marble position in backwardClock levels per frame
		for (let firework of this.finishFireworks.slice()) {
			firework.tick(this.timeState.timeSinceLoad);
			if (this.timeState.timeSinceLoad - firework.spawnTime >= 10000)
				Util.removeFromArray(this.finishFireworks, firework);
		}

		// for handling the air tricks
		if (this.mission.backwardClock) {
			const pos = this.marble.body.position;
			const vel = this.marble.body.linearVelocity;
			const airborne = pos.z > this.floorZ + 0.5;

			if (!airborne) {
				// Update floorZ when grounded (reset point for next airtime)
				this.floorZ = pos.z;
				this.canDoAirTrick = true; // Allow air tricks again now that grounded
				this.maxHeight = 0;
			}
			if (!this.canDoAirTrick) return; // Prevent trick activation in first few frames after spawn/restart
			// Airborne: trigger tricks only if Z is high above last known floor
			const height = pos.z - this.floorZ;
			// The max height determines what trick will be evaluated and based upon the trick the score will increase.
			this.maxHeight = Math.max(this.maxHeight, height);

			// Free Fall state....gone too high in air and falling back..
			if (this.maxHeight > 75) {
				this.score += 5000;
				state.menu.hud.displayAlert("Free Falling\n5000", "#ffff00");
				this.floorZ = pos.z + 50;
				return;
			}

			// Went high above but not too high....
			if (vel.z < -0.5 && this.maxHeight > 13 && this.hugeAirDone) {
				this.score += 5000;
				state.menu.hud.displayAlert("Mega Air\n5000", "#00ff2fff");
				this.floorZ = pos.z + 50;
				this.hugeAirDone = false;
				return;
			}

			// Huge air evaluates if both the downward velocity and height are at the required level...
			// Fall from huge above to Huge Air.....
			if (vel.z < -0.1 && !this.hugeAirDone && this.maxHeight > 11 && this.bigAirDone) {
				this.score += 2000;
				state.menu.hud.displayAlert("Huge Air\n2000", "#001effff");
				this.floorZ = pos.z + 50;
				this.bigAirDone = false;
				this.hugeAirDone = true;
				return;
			}

			// Big Air evaluates if smaller downward velocity and not too high...
			// probably the lowest region of air tricks atmosphere
			// Only allow Big Air if it hasn't already been done this jump
			if (vel.z < 0.5 && !this.bigAirDone && this.maxHeight > 6) {
				this.score += 1000;
				state.menu.hud.displayAlert("Big Air\n1000", "#ffff00");
				this.floorZ = pos.z + 50;
				this.bigAirDone = true;
				return;
			}
		}

		// For handling the automatic respawn to array of startpads in Competency levels
		if (this.mission.competency) {
			const COMPETENCY_LIMIT = 30000; // 30 seconds window for each attempt. Do your best to get up there!

			// If leftPad was triggered, skip the wait and teleport instantly....from starting pad to first index pad
			if (this.leftPad) {
				this.timeState.gameplayClock = COMPETENCY_LIMIT; // force instant trigger to first pad of the array of startpads
			}

			// Gee...time's up!..Move on to next stage!
			if (this.timeState.gameplayClock >= COMPETENCY_LIMIT) {
				this.timeState.gameplayClock = 0;

				this.padIndex++;

				// Get all StartPads sorted by padIndex
				const startPads = this.shapes.filter(s => s instanceof StartPad)
					.sort((a, b) => (a as StartPad).padIndex - (b as StartPad).padIndex) as StartPad[];

				// Wrap around if padIndex exceeds total pads
				if (this.padIndex > startPads.length) this.padIndex = 1;

				// Set the next checkpoint
				const nextPad = startPads.find(p => p.padIndex === this.padIndex);
				if (nextPad) this.currentCheckpoint = nextPad;

				// Fast respawning the player to next successive checkpoints.
				// This call is happened once per the cycle.
				this.fastRespawnPlayer();
				this.leftPad = false; // Reset Left Pad state..
			}
		}
	}

	/** Get the current interpolated orientation quaternion. */
	getOrientationQuat(time: TimeState) {
		let completion = Util.clamp((time.currentAttemptTime - this.orientationChangeTime) / 300, 0, 1);
		return this.oldOrientationQuat.clone().slerp(this.newOrientationQuat, completion).normalize();
	}

	/** Sets the current up vector and gravity with it. */
	setUp(newUp: Vector3, instant = false) {
		let time = this.timeState;

		newUp.normalize(); // We never know 👀
		this.currentUp.copy(newUp);
		let gravityStrength = this.world.gravity.length();
		this.world.gravity.copy(newUp).multiplyScalar(-1 * gravityStrength);

		let currentQuat = this.getOrientationQuat(time);
		let oldUp = new Vector3(0, 0, 1);
		oldUp.applyQuaternion(currentQuat).normalize();

		let quatChange = new Quaternion();
		let dot = newUp.dot(oldUp);
		if (dot <= -(1 - 1e-15) && !(this.replay.version < 3)) { // If the old and new up are exact opposites, there are infinitely many possible rotations we could do. So choose the one that maintains the current look vector the best. Replay check so we don't break old stuff.
			let lookVector = new Vector3(0, 0, 1).applyQuaternion(this.camera.orientation);
			let intermediateVector = oldUp.clone().cross(lookVector).normalize();

			// First rotation to the intermediate vector, then rotate from there to the new up
			quatChange.setFromUnitVectors(oldUp, intermediateVector);
			quatChange.premultiply(new Quaternion().setFromUnitVectors(intermediateVector, newUp));
		} else {
			// Instead of calculating the new quat from nothing, calculate it from the last one to guarantee the shortest possible rotation.
			quatChange.setFromUnitVectors(oldUp, newUp);
		}

		this.newOrientationQuat = quatChange.multiply(currentQuat).normalize();
		this.oldOrientationQuat = currentQuat;
		this.orientationChangeTime = instant ? -Infinity : time.currentAttemptTime;
	}

	/** Spawns Fireworks at marble's position wherever finished..probably for BackwardClock levels */
	spawnFinishFireworksAtMarble(time: TimeState, pos: Vector3) {
		const upDir = new Vector3(0, 0, 1).applyQuaternion(this.oldOrientationQuat).normalize();
		let firework = new Firework(this, pos.clone(), time.timeSinceLoad, upDir);
		this.finishFireworks.push(firework);
	}

	/** Gets the position and orientation of the player spawn point. */
	getStartPositionAndOrientation() {
		// The player is spawned at the last start pad in the mission file.
		let startPad = Util.findLast(this.shapes, (shape) => shape instanceof StartPad);
		let position: Vector3;
		let euler = new Euler();

		// On Competency level, if first spawn (no checkpoint yet), pick the unindexed StartPoint
		if (this.mission.competency && !this.currentCheckpoint) {
			startPad = this.shapes.find(s => s instanceof StartPad && s.padIndex === -1) as StartPad;
		}

		// In Competency levels which consists of multiple checkpoints...every startpad is treated as main pad till the duration window completes.
		// This means the player is spawned at array of startpads in mis file followed by the indexes cascadingly.
		if (this.mission.competency && this.currentCheckpoint instanceof StartPad) {
			startPad = this.currentCheckpoint;
		}

		if (startPad && startPad.worldPosition && Number.isFinite(startPad.worldPosition.x) &&
			Number.isFinite(startPad.worldPosition.y) && Number.isFinite(startPad.worldPosition.z)) {
			// If there's a start pad, start there
			position = startPad.worldPosition.clone();
			euler.setFromQuaternion(startPad.worldOrientation, "ZXY");
		} else {
			// Search for spawn points used for multiplayer
			let spawnPoints = this.mission.allElements.find(x => x._name === "SpawnPoints") as MissionElementSimGroup;
			if (spawnPoints) {
				let first = spawnPoints.elements[0] as MissionElementTrigger;
				position = MisParser.parseVector3(first.position);
			} else {
				// If there isn't anything, start at this weird point
				position = new Vector3(0, 0, 300);
			}
		}

		return { position, euler };
	}

	setGravityIntensity(intensity: number) {
		let gravityVector = this.currentUp.clone().multiplyScalar(-1 * intensity);
		this.world.gravity.copy(gravityVector);
	}

	getCurrentTime() {
		return this.timeState.currentAttemptTime;
	}

	onResize(width: number, height: number, hudPixelRatio: number) {
		if (!this.camera || !this.overlayCamera) return;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.overlayCamera.left = 0;
		this.overlayCamera.right = width;
		this.overlayCamera.top = 0;
		this.overlayCamera.bottom = height;
		this.overlayCamera.updateProjectionMatrix();

		state.menu.hud.setSize(width, height, hudPixelRatio);
	}

	onMouseMove(e: MouseEvent) {
		if (!this.started || !document.pointerLockElement || this.finishTime || this.paused || this.replay.mode === 'playback') return;

		let totalDistance = Math.hypot(e.movementX, e.movementY);

		// Strangely enough, Chrome really bugs out sometimes and flings the mouse into a random direction quickly. We try to catch that here and ignore the mouse movement if we detect it.
		if (totalDistance > 350 && this.previousMouseMovementDistance * 4 < totalDistance) {
			this.previousMouseMovementDistance *= 1.5; // Make the condition harder to hit the next time
			return;
		}
		this.previousMouseMovementDistance = totalDistance;

		let factor = Util.lerp(1 / 2500, 1 / 100, StorageManager.data.settings.mouseSensitivity);
		let xFactor = (StorageManager.data.settings.invertMouse & 0b01) ? -1 : 1;
		let yFactor = (StorageManager.data.settings.invertMouse & 0b10) ? -1 : 1;
		let freeLook = StorageManager.data.settings.alwaysFreeLook || isPressed('freeLook');

		if (freeLook) this.pitch += e.movementY * factor * yFactor;
		this.yaw -= e.movementX * factor * xFactor;
	}

	pickUpPowerUp(powerUp: PowerUp, playPickUpSound = true) {
		if (!powerUp) return false;
		if (this.heldPowerUp && powerUp.constructor === this.heldPowerUp.constructor) return false;
		this.heldPowerUp = powerUp;
		state.menu.hud.setPowerupButtonState(true);

		for (let overlayShape of this.overlayShapes) {
			if (overlayShape.dtsPath.includes("gem")) continue;

			// Show the corresponding icon in the HUD
			overlayShape.setOpacity(Number(overlayShape.dtsPath === powerUp.dtsPath));
		}

		for (let overlayShape of this.overlayShapes) {
			if (overlayShape.dtsPath.includes("gem")) continue;
			overlayShape.setOpacity(Number(overlayShape.dtsPath === powerUp.dtsPath));
		}

		if (playPickUpSound) this.audio.play(powerUp.sounds[0]);

		return true;
	}

	deselectPowerUp() {
		if (!this.heldPowerUp) {
			state.menu.hud.setPowerupButtonState(false);
			return;
		}
		this.heldPowerUp = null;
		state.menu.hud.setPowerupButtonState(false);

		for (let overlayShape of this.overlayShapes) {
			if (overlayShape.dtsPath.includes("gem")) continue;
			overlayShape.setOpacity(0);
		}
	}

	pickUpGem(gem: Gem, t: number) {
		this.gemCount++;
		// Award score based on gem color
		if (gem.gemColor === 'red') this.score += 10000;
		else if (gem.gemColor === 'yellow') this.score += 20000;
		else if (gem.gemColor === 'blue') this.score += 50000;
		let string: string;
		let gemWord = (state.modification === 'gold') ? 'gem' : 'diamond';

		// Show a notification (and play a sound) based on the gems remaining
		if (this.gemCount === this.totalGems) {
			string = `You have all the ${gemWord}s, head for the finish!`;
			this.audio.play('gotallgems.wav');

			// Some levels with this package end immediately upon collection of all gems
			if (this.mission.misFile.activatedPackages.includes('endWithTheGems')) {
				this.touchFinish(t);
			}
		} else {
			let showRemaining = true;
			// Custom alert for backwardClock levels and colored gems
			if (this.mission.backwardClock) {
				if (gem.gemColor === 'red') {
					string = "Red Gem\n10,000";
					showRemaining = false;
				} else if (gem.gemColor === 'yellow') {
					string = "Yellow Gem\n20,000";
					showRemaining = false;
				} else if (gem.gemColor === 'blue') {
					string = "Blue Gem\n50,000";
					showRemaining = false;
				} else {
					string = `You picked up a ${gemWord}${state.modification === 'gold' ? '.' : '!'}`;
				}
			} else if (this.mission.competency) {
				// Increment pad index BEFORE respawning
				this.timeState.gameplayClock = 0;
				this.padIndex++;
				this.score += this.timeState.currentAttemptTime / 1000;
				this.score += 20;
				// Find all StartPads and sort by padIndex
				const startPads = this.shapes.filter(s => s instanceof StartPad)
					.sort((a, b) => (a as StartPad).padIndex - (b as StartPad).padIndex) as StartPad[];

				// Wrap around if padIndex exceeds the number of pads
				if (this.padIndex > startPads.length) this.padIndex = 1;

				// Find the next pad by padIndex
				const nextPad = startPads.find(p => p.padIndex === this.padIndex);

				if (nextPad) {
					// respawn player at next successive start pads
					this.currentCheckpoint = nextPad;
				}

				// Calling the fast respawn
				this.fastRespawnPlayer();
				string = `You picked up a ${gemWord}${state.modification === 'gold' ? '.' : '!'}`;
			} else {
				string = `You picked up a ${gemWord}${state.modification === 'gold' ? '.' : '!'}`;
			}

			if (showRemaining) {
				let remaining = this.totalGems - this.gemCount;
				if (remaining === 1) {
					string += ` Only one ${gemWord} to go!`;
				} else if (remaining > 1) {
					string += ` ${remaining} ${gemWord}s to go!`;
				}
			}
			this.audio.play('gotgem.wav');
		}
		state.menu.hud.displayAlert(string, '#ffff00');
	}

	addTimeTravelBonus(bonus: number, timeToRevert: number) {
		if (this.currentTimeTravelBonus === 0) {
			this.timeState.gameplayClock -= timeToRevert;
			if (this.timeState.gameplayClock < 0) this.timeState.gameplayClock = 0;
			bonus -= timeToRevert;
		}

		this.currentTimeTravelBonus += bonus;

		// Take heed though....the Time Travels shouldnt be affected since we are doing the stopwatch....
		if (this.stopWatchActive) {
			this.stopWatchActive = true;
			this.music.setPlaybackRate(0);
		}

		// Reschedule freeze end exactly at the total paused time..In order to avoid any shabbys...
		if (this.schedule) {
			let freezeEndTime = this.timeState.currentAttemptTime + this.currentTimeTravelBonus;

			this.schedule(freezeEndTime, () => {
				// Only execute unfreeze logic if watch's effect time has fully expired
				if (this.currentTimeTravelBonus <= 0) {
					this.music.setPlaybackRate(1);
					this.stopWatchActive = false;
				}
			});
		}
	}

	touchSkyMine() {
		// Retard score if player touched the skymine
		if (this.mission.backwardClock) this.score = Math.max(0, this.score - 50000); // Prevent negative score
		let string: string;
		// Custom alert for backwardClock levels if player collided with skymine and score decreases...beware..
		string = "SKYMINE\n50000";
		state.menu.hud.displayAlert(string, '#ff2222'); // Show red alert message when collided with the skymine
	}

	/** Triggers the out-of-bounds state. */
	goOutOfBounds() {
		if (this.outOfBounds || this.finishTime) return;

		state.menu.hud.setPowerupButtonState(true);
		this.updateCamera(this.timeState); // Update the camera at the point of OOB-ing
		this.outOfBounds = true;
		this.outOfBoundsTime = Util.jsonClone(this.timeState);
		this.oobCameraPosition = this.camera.position.clone();
		state.menu.hud.setCenterText('outofbounds');
		this.audio.play('whoosh.wav');
		this.analytics.outOfBoundsCount++;

		// If Player Goes OOB in BackwardClock levels...they will be respawned with all saved stats (gems score,timestate,etc) but the score will be reducted
		if (this.mission.backwardClock) {
			state.menu.hud.displayAlert("OUT OF BOUNDS\n50000", "#ff2222");
			this.score = Math.max(0, this.score - 50000); // Prevent negative score
		}

		if (this.replay.mode !== 'playback') this.schedule(this.timeState.currentAttemptTime + 2000, () => this.restart(false), 'oobRestart');
		if (this.mission.backwardClock) this.schedule(this.timeState.currentAttemptTime + 2, () => this.restart(false), 'oobRestart'); // respawn marble immediately in backwardClock levels!
		if (this.mission.competency) this.schedule(this.timeState.currentAttemptTime + 2, () => this.fastRespawnPlayer(), 'oobRestart'); // respawn marble immediately in competency levels!
	}

	/** Sets a new active checkpoint. */
	saveCheckpointState(shape: Shape, trigger?: CheckpointTrigger) {
		if (this.currentCheckpoint === shape && !this.mission.backwardClock) return;
		if (this.currentCheckpoint?.worldPosition.equals(shape.worldPosition) && !this.mission.backwardClock) return; // Some levels have identical overlapping checkpoints, which can cause an infinite checkpointing loop.

		let disableOob = (shape.srcElement as any)?.disableOob || trigger?.element.disableOob;
		if (MisParser.parseBoolean(disableOob) && this.outOfBounds) return; // The checkpoint is configured to not work when the player is already OOB

		this.currentCheckpoint = shape;
		this.currentCheckpointTrigger = trigger;
		this.checkpointCollectedGems.clear();
		this.checkpointUp = this.currentUp.clone();
		this.checkpointBlast = this.blastAmount;

		// Remember all gems that were collected up to this point
		for (let shape of this.shapes) {
			if (!(shape instanceof Gem)) continue;
			if (shape.pickedUp) this.checkpointCollectedGems.add(shape);
		}

		this.checkpointHeldPowerUp = this.heldPowerUp;

		if (!this.mission.backwardClock) {
			state.menu.hud.displayAlert("Checkpoint reached!", '#ffff00');
			this.audio.play('checkpoint.wav');
		}
	}

	/** Resets to the last stored checkpoint state. */
	loadCheckpointState() {

		if (!this.currentCheckpoint) return;

		let marble = this.marble;

		// Quite note: Checkpoints have slightly different behavior in Ultra, that's why there's some checks

		let gravityField = (this.currentCheckpoint.srcElement as any)?.gravity || this.currentCheckpointTrigger?.element.gravity;
		if (MisParser.parseBoolean(gravityField) || this.mission.modification === 'ultra') {
			// In this case, we set the gravity to the relative "up" vector of the checkpoint shape.
			let up = new Vector3(0, 0, 1);
			up.applyQuaternion(this.currentCheckpoint.worldOrientation);
			this.setUp(up, true);
		} else {
			// Otherwise, we restore gravity to what was stored.
			this.setUp(this.checkpointUp, true);
		}

		// Determine where to spawn the marble
		let offset = new Vector3();
		let add = (this.currentCheckpoint.srcElement as any)?.add || this.currentCheckpointTrigger?.element.add;
		if (add) offset.add(MisParser.parseVector3(add));
		let sub = (this.currentCheckpoint.srcElement as any)?.sub || this.currentCheckpointTrigger?.element.sub;
		if (sub) offset.sub(MisParser.parseVector3(sub));
		if (!add && !sub) {
			offset.z = 3; // Defaults to (0, 0, 3)

			if (this.mission.modification === 'ultra')
				offset.applyQuaternion(this.currentCheckpoint.worldOrientation); // weird <3
		}

		marble.body.position.copy(this.currentCheckpoint.worldPosition).add(offset);
		marble.body.linearVelocity.setScalar(0);
		marble.body.angularVelocity.setScalar(0);
		marble.calculatePredictiveTransforms();

		// Set camera orienation
		let euler = new Euler();
		euler.setFromQuaternion(this.currentCheckpoint.worldOrientation, "ZXY");
		this.yaw = euler.z + Math.PI / 2;
		this.pitch = DEFAULT_PITCH;

		// Restore gem states
		for (let shape of this.shapes) {
			if (!(shape instanceof Gem)) continue;
			if (shape.pickedUp && !this.checkpointCollectedGems.has(shape)) {
				shape.reset();
				this.gemCount--;
			}
		}
		state.menu.hud.setCenterText('none');

		// Turn all of these off
		marble.superBounceEnableTime = -Infinity;
		marble.shockAbsorberEnableTime = -Infinity;
		marble.helicopterEnableTime = -Infinity;
		marble.helicopterEnableTimex2 = -Infinity;
		marble.megaMarbleEnableTime = -Infinity;

		this.clearSchedule();
		this.outOfBounds = false;
		this.blastAmount = this.checkpointBlast;
		this.finishTime = null; // For those very, very rare cases where the player touched the finish while OOB, but not fast enough, so they get respawned at the checkpoint and we need to remove the "finish lock".
		// No air tricks popping on respawn...but can do them again....
		this.bigAirDone = false;
		this.hugeAirDone = false;
		this.maxHeight = 0;
		this.canDoAirTrick = false;
		this.floorZ = this.marble.body.position.z; // VERY IMPORTANT

		this.deselectPowerUp(); // Always deselect first
		// Wait a bit to select the powerup to prevent immediately using it incase the user skipped the OOB screen by clicking
		if (this.checkpointHeldPowerUp) this.schedule(this.timeState.currentAttemptTime + 500, () => this.pickUpPowerUp(this.checkpointHeldPowerUp, false));

		this.audio.play('spawn.wav');
		this.replay.recordCheckpointRespawn();
	}

	touchFinish(completionOfImpact?: number) {
		if (this.finishTime !== null) return;

		// Big Check for those who want to cheat in requireGravity levels....hehehe.....
		if (this.mission.requireGravity) {
			let gravityDown = this.world.gravity.clone().normalize();
			let finishUp = new Vector3(0, 0, 1); // adjust if needed
			let angleDeg = gravityDown.angleTo(finishUp) * (180 / Math.PI);
			if (angleDeg > 60) return;  // Get your best to unlock the finish..
		}

		this.replay.recordTouchFinish();
		// In Backward Clock or Competency levels a player can always finish.
		if (!this.mission.backwardClock && !this.mission.competency && this.gemCount < this.totalGems) {
			this.audio.play('missinggems.wav');
			state.menu.hud.displayAlert((state.modification === 'gold') ? "You can't finish without all the gems!!" : "You may not finish without all the diamonds!!", '#ffff00');
		} else {
			if (completionOfImpact === undefined) completionOfImpact = 1;

			let toSubtract = (1 - completionOfImpact) * 1000 / PHYSICS_TICK_RATE;

			this.finishTime = Util.jsonClone(this.timeState);
			// Compute the precise finish time here
			this.finishTime.timeSinceLoad -= toSubtract;
			this.finishTime.currentAttemptTime -= toSubtract;
			if (this.currentTimeTravelBonus === 0) this.finishTime.gameplayClock -= toSubtract;
			this.finishTime.gameplayClock = Util.clamp(this.finishTime.gameplayClock, 0, MAX_TIME); // Apply the time cap
			this.finishTime.physicsTickCompletion = completionOfImpact;
			this.currentTimeTravelBonus = 0;
			this.alarmSound?.stop();

			if (this.replay.mode === 'playback') this.finishTime = this.replay.finishTime;

			this.finishYaw = this.yaw;
			this.finishPitch = this.pitch;

			let endPad = Util.findLast(this.shapes, (shape) => shape instanceof EndPad) as EndPad;
			endPad?.spawnFirework(this.timeState); // EndPad *might* not exist, in that case no fireworks lol
			let tttPad = Util.findLast(this.shapes, (shape) => shape instanceof TTTPad) as TTTPad;
			tttPad?.spawnFirework(this.timeState); // EndPad *might* not exist, in that case no fireworks lol

			state.menu.hud.displayAlert("Congratulations! You've finished!", '#ffff00');

			// Check if the player is OOB, but still allow finishing with less than half a second of having been OOB
			if (this.outOfBounds && this.timeState.currentAttemptTime - this.outOfBoundsTime.currentAttemptTime >= 500) return;

			// When we reach this point, the player has actually successfully completed the level.

			this.clearScheduleId('oobRestart'); // Make sure we don't restart the level now
			// Schedule the finish screen to be shown
			if (this.replay.mode !== 'playback') this.schedule(this.timeState.currentAttemptTime + 2000, () => {
				// Show the finish screen
				document.exitPointerLock?.();
				state.menu.finishScreen.show();
				hideTouchControls();

				resetPressedFlag('use');
				resetPressedFlag('jump');
				resetPressedFlag('restart');
			});

			this.analytics.finishes++;
			this.levelFinished = true;
		}
	}

	/** Pauses the level. */
	pause() {
		if (this.paused || (state.level.finishTime && state.level.replay.mode === 'record')) return;

		this.paused = true;
		this.pausedAt = Date.now();
		document.exitPointerLock?.();
		releaseAllButtons(); // Safety measure to prevent keys from getting stuck
		state.menu.pauseScreen.show();
		hideTouchControls();
	}

	/** Unpauses the level. */
	unpause() {
		this.paused = false;
		if (!Util.isTouchDevice) Util.requestPointerLock();
		state.menu.pauseScreen.hide();
		this.lastPhysicsTick = performance.now();
		maybeShowTouchControls();

		if (this.pausedAt !== null) {
			this.analytics.timePaused += Date.now() - this.pausedAt;
			this.pausedAt = null;
		}
	}

	/** Ends the level irreversibly. */
	stop() {
		this.stopped = true;
		clearInterval(this.tickInterval);
		this.dispose();
		CollisionDetection.clearReferences();

		this.music.stop();
		for (let interior of this.interiors) {
			if (interior instanceof PathedInterior) interior.soundSource?.stop();
		}
		for (let shape of this.shapes) {
			if (shape instanceof Tornado || shape instanceof DuctFan) shape.soundSource?.stop();
		}

		this.marble.rollingSound?.stop();
		this.marble.slidingSound?.stop();
		this.marble.helicopterSound?.stop();
		this.marble.shockAbsorberSound?.stop();
		this.marble.superBounceSound?.stop();

		this.audio.stopAllAudio();
	}

	/** Stops and destroys the current level and returns back to the menu. */
	stopAndExit() {
		this.stop();
		state.level = null;
		mainCanvas.classList.add('hidden');

		state.menu.pauseScreen.hide();
		state.menu.levelSelect.show();
		state.menu.levelSelect.displayBestTimes(); // Potentially update best times having changed
		state.menu.finishScreen.hide();
		state.menu.hideGameUi();
		state.menu.show();

		document.exitPointerLock?.();

		if (this.replay.mode !== 'playback') {
			// Send some analytics to the server
			if (this.pausedAt !== null) this.analytics.timePaused += Date.now() - this.pausedAt;
			this.analytics.endTime = Date.now();
			ResourceManager.retryFetch('/api/statistics', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain'
				},
				body: btoa(JSON.stringify(this.analytics))
			});
		}
	}

	/** Returns how much percent the level has finished loading. */
	getLoadingCompletion() {
		return this.loadingState.total ? this.loadingState.loaded / this.loadingState.total : 0;
	}

	/** Disposes the GPU assets used by the level. */
	dispose() {
		this.scene.dispose();
		this.marble.dispose();
		mainRenderer.cleanUp();
	}
}