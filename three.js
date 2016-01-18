var BlazeLuminous = function BlazeLuminous() {
	this.box = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 8), new THREE.MeshPhongMaterial({ color: 0xcc0000 }));
	scene.add(this.box);
	this.torus1 = new THREE.Mesh(new THREE.TorusGeometry(16, 2, 25, 25), new THREE.MeshPhongMaterial({ color: 0x22cc00 }));
	scene.add(this.torus1);
	this.torus2 = new THREE.Mesh(new THREE.TorusGeometry(20, 2, 25, 25), new THREE.MeshPhongMaterial({ color: 0x44cc00 }));
	scene.add(this.torus2);
	this.torus3 = new THREE.Mesh(new THREE.TorusGeometry(24, 2, 25, 25), new THREE.MeshPhongMaterial({ color: 0x66cc00 }));
	scene.add(this.torus3);
}
BlazeLuminous.prototype = {
	update: function() {
		this.box.rotation.x += 0.1795;
		this.box.rotation.y += 0.1915;
		this.box.rotation.z -= 0.1875;
		this.torus1.rotation.x -= 0.0175;
		this.torus1.rotation.y += 0.0125;
		this.torus1.rotation.z += 0.0155;
		this.torus2.rotation.x += 0.0135;
		this.torus2.rotation.y -= 0.0195;
		this.torus2.rotation.z -= 0.0205;
		this.torus3.rotation.x += 0.0115;
		this.torus3.rotation.y += 0.0145;
		this.torus3.rotation.z -= 0.0185;
	}
}

var Starlight = function Starlight(x, y, z, speed) {
	this.light = new THREE.DirectionalLight(0xffffff, 0.5);
	this.light.position.set(x, y, z);
	scene.add(this.light);
	this.sphere = new THREE.Mesh(new THREE.SphereGeometry(400, 40, 40), new THREE.MeshPhongMaterial({ color: 0xccee22 }));
	this.sphere.position.set(x, y, z);
	scene.add(this.sphere);
	this.euler = new THREE.Euler(speed, 0, 0, 'XYZ');
}
Starlight.prototype = {
	update: function() {
		this.light.position.applyEuler(this.euler);
		this.sphere.position.applyEuler(this.euler);
	}
}

var Earth = function Earth() {
	this.sphere = new THREE.Mesh(new THREE.SphereGeometry(160, 50, 50), new THREE.MeshPhongMaterial({ color: 0x2266cc }));
	this.sphere.position.set(400, 0, 0);
	scene.add(this.sphere);
	this.boids = new Array();
	for (var i = 0; i < 256; i++)
		this.boids[i] = new Boid();
}
Earth.prototype = {
	update: function() {
		this.sphere.position.applyEuler(new THREE.Euler(0, 0.0001, 0, 'XYZ'));
		this.sphere.rotation.y += 0.0005;
		for (var i = 0; i < this.boids.length; i++) {
			this.boids[i].update();
			this.boids[i].drawOnSphere(this.sphere, 160);
		}
	}
}

var Boid = function() {
	this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20),
		new THREE.MeshLambertMaterial({ color: 0xccaa66 }));
	scene.add(this.mesh);
	this.pos = new THREE.Vector3(1 - Math.random() * 2, 1 - Math.random() * 2, 1 - Math.random() * 2);
	this.pos.normalize();
}
Boid.prototype = {
	drawOnSphere: function(sphere, radius) {
		var c = this.pos.clone();
		c.setLength(radius);
		var r = sphere.rotation;
		c.applyEuler(new THREE.Euler(r.x, r.y, r.z, 'XYZ'));
		c.add(sphere.position);
		this.mesh.position.set(c.x, c.y, c.z);
	},
	update: function() {
	},
}

var scene, camera, renderer;
var blazeLuminous, earth, foo, bar;
var cameraTarget;

function initialize(cx, cy) {
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(75, cx / cy, 0.5, 8000);
	camera.position.set(0, 0, 600);

	blazeLuminous = new BlazeLuminous();
	earth = new Earth();

	foo = new Starlight(-6400, 0, 1600,  0.0175);
	bar = new Starlight( 6400, 0, 1600, -0.0125);
	scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.5));
	scene.add(new THREE.HemisphereLight(0x222222, 0xffffff, 0.5));

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(cx, cy);

	var mousepos = function (e) {
		var r = e.target.getBoundingClientRect();
		return new THREE.Vector2(e.clientX - r.left, r.top - e.clientY);
	}

	var canvas = renderer.domElement;
	document.getElementById('canvas').appendChild(canvas);
	canvas.onmousedown = function (e1) {
		var cr = camera.rotation.clone();
		var p1 = mousepos(e1);
		canvas.onmousemove = function (e2) {
			var d = mousepos(e2);
			d.sub(p1);
			if (camera.position.x == 0 && camera.position.y == 0 && camera.position.z == 0)
				camera.rotation.y = cr.y + d.x / 800;
			else if (camera.position.x == 0 && camera.position.y == 0 && camera.position.z == 600)
				camera.rotation.y = cr.y - d.x / 800;
			else
				;
		}
		canvas.onmouseup = function (e2) {
			canvas.onmousemove = null;
			canvas.onmouseup = null;
		}
	}

	requestAnimationFrame(animate);
}

function animate() {
	requestAnimationFrame(animate);

	blazeLuminous.update();
	earth.update();
	foo.update();
	bar.update();

	if (cameraTarget) {
		var c = cameraTarget.pos.clone();
		c.setLength(162);
		var r = earth.sphere.rotation;
		c.applyEuler(new THREE.Euler(r.x, r.y, r.z, 'XYZ'));
		c.add(earth.sphere.position);
		camera.position.set(c.x, c.y, c.z);
	}

	renderer.render(scene, camera);
}