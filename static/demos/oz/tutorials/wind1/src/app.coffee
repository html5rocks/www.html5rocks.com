class App
    container       : null
    stats           : null
    camera          : null
    scene           : null
    renderer        : null
    controls        : null
    clock           : null

    constructor: ->

        @clock =  new THREE.Clock()

        @container = document.createElement( 'div' );
        document.body.appendChild( @container );

        @renderer = new THREE.WebGLRenderer();
        @renderer.setSize( window.innerWidth, window.innerHeight );
        @renderer.setClearColorHex( 0x808080, 1 )
        @container.appendChild(@renderer.domElement);

        @camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
        @camera.position.x = 5;
        @camera.position.y = 10;
        @camera.position.z = 40;

        @controls = new THREE.OrbitControls( @camera, @renderer.domElement );
        @controls.enabled = true

        @scene = new THREE.Scene();
        @scene.add( new THREE.AmbientLight 0xFFFFFF )

        
        directional = new THREE.DirectionalLight 0xFFFFFF
        directional.position.set( 10,10,10)
        @scene.add( directional )

        # Demo data
        @grassTex = THREE.ImageUtils.loadTexture("textures/grass.png");
        @initGrass()
        @initTerrain()

        # Stats
        @stats = new Stats();
        @stats.domElement.style.position = 'absolute';
        @stats.domElement.style.top = '0px';
        @container.appendChild( @stats.domElement );
        window.addEventListener( 'resize', @onWindowResize, false );
        @animate()

    initGrass:->
        mat = new THREE.MeshPhongMaterial( { map: @grassTex } )
        NUM = 15
        for i in [0..NUM] by 1
            for j in [0..NUM] by 1
                x = ((i/NUM) - 0.5) * 50 + THREE.Math.randFloat(-1,1)
                y = ((j/NUM) - 0.5) * 50 + THREE.Math.randFloat(-1,1)
                @scene.add( @instanceGrass( x, 2.5, y, 5.0, mat ) )

    instanceGrass:(x,y,z,height,mat)->
        geometry = new THREE.CylinderGeometry( 0.9, 0.0, height, 3, 5 )
        mesh = new THREE.Mesh( geometry, mat )
        mesh.position.set( x, y, z )
        return mesh

    initTerrain:->
        @plane = new THREE.Mesh( new THREE.PlaneGeometry(60, 60, 2, 2), new THREE.MeshPhongMaterial( { map: @grassTex, diffuse: 0xFFFFFF, ambient: 0xCCCCCC } ) )
        @plane.rotation.x = -Math.PI/2
        @scene.add( @plane )

    animate: =>
        window.requestAnimationFrame( @animate )
        @render()
        @stats.update()
        return

    render: =>
        delta = @clock.getDelta()

        @controls.update()

        @renderer.render( @scene, @camera )

    onWindowResize: =>
        @camera.aspect = window.innerWidth / window.innerHeight
        @camera.updateProjectionMatrix()
        @renderer.setSize( window.innerWidth, window.innerHeight )

    # bootstrap
    $ ->
    $(document).ready ->
        if !Detector.webgl or !Detector.workers
            Detector.addGetWebGLMessage()
        else
            new App
