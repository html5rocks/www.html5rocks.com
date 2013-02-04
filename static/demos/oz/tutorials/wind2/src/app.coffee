class App
    container       : null
    stats           : null
    camera          : null
    scene           : null
    renderer        : null
    controls        : null
    clock           : null
    # noise
    noiseMap        : null
    noiseShader     : null
    noiseScene      : null
    noiseMaterial   : null
    noiseCameraOrtho  : null
    noiseQuadTarget   : null
    noiseRenderTarget : null
    noiseSpeed        : 0.046
    noiseOffsetSpeed  : 0.11
    # wind
    windDirection: new THREE.Vector3(0.8,0.1,0.1)

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
        @initNoiseShader()
        @initGrass()
        @initTerrain()
        @initGui()

        # Stats
        @stats = new Stats();
        @stats.domElement.style.position = 'absolute';
        @stats.domElement.style.top = '0px';
        @container.appendChild( @stats.domElement );
        window.addEventListener( 'resize', @onWindowResize, false );
        @animate()

    getWindMaterial:()->   
        shader = new WindMeshShader
        uniforms = shader.uniforms

        params = {}
        params.fragmentShader = shader.fragmentShader
        params.vertexShader   = shader.vertexShader
        params.uniforms       = shader.uniforms
        params.attributes     = { windFactor: { type: 'f', value: [] } }
        params.lights         = true

        material = new THREE.ShaderMaterial( params );

        uniforms[ "diffuse" ].value            = new THREE.Color( 0xFFFFFF )
        uniforms[ "ambient" ].value            = new THREE.Color( 0xCCCCCC )
        uniforms[ "specular" ].value           = new THREE.Color( 0xFFFFFF )
        uniforms[ "map" ].value = material.map = THREE.ImageUtils.loadTexture("textures/grass.png");
        uniforms[ "tWindForce" ].value         = @noiseMap
        uniforms[ "windScale" ].value          = 1
        uniforms[ "windMin" ].value            = new THREE.Vector2(-30,-30 )
        uniforms[ "windSize" ].value           = new THREE.Vector2( 60, 60 )
        uniforms[ "windDirection" ].value      = @windDirection

        return material

    initNoiseShader:->
        @noiseMap  = new THREE.WebGLRenderTarget( 256, 256, { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat } );
        @noiseShader = new NoiseShader()
        @noiseShader.uniforms.vScale.value.set(0.3,0.3)
        @noiseScene = new THREE.Scene()
        @noiseCameraOrtho = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
        @noiseCameraOrtho.position.z = 100
        @noiseScene.add( @noiseCameraOrtho )

        @noiseMaterial = new THREE.ShaderMaterial
            fragmentShader: @noiseShader.fragmentShader
            vertexShader: @noiseShader.vertexShader
            uniforms: @noiseShader.uniforms
            lights:false

        @noiseQuadTarget = new THREE.Mesh( new THREE.PlaneGeometry(window.innerWidth,window.innerHeight,100,100), @noiseMaterial )
        @noiseQuadTarget.position.z = -500
        @noiseScene.add( @noiseQuadTarget )

    initGrass:->
        NUM = 15
        for i in [0..NUM] by 1
            for j in [0..NUM] by 1
                x = ((i/NUM) - 0.5) * 50 + THREE.Math.randFloat(-1,1)
                y = ((j/NUM) - 0.5) * 50 + THREE.Math.randFloat(-1,1)
                @scene.add( @instanceGrass( x, 2.5, y, 5.0 ) )

    instanceGrass:(x,y,z,height)->
        material = @getWindMaterial()
        geometry = new THREE.CylinderGeometry( 0.9, 0.0, height, 3, 5 )
        for i in [0..geometry.vertices.length-1] by 1
            v = geometry.vertices[i]
            r = (v.y / height) + 0.5
            material.attributes.windFactor.value[i] = r * r * r
        # Create mesh
        mesh = new THREE.Mesh( geometry, material )
        mesh.position.set( x, y, z )
        return mesh

    initTerrain:->
        @plane = new THREE.Mesh( new THREE.PlaneGeometry(60, 60, 2, 2), new THREE.MeshPhongMaterial( { map: @noiseMap, lights: false } ) )
        @plane.rotation.x = -Math.PI/2
        @scene.add( @plane )

    initGui:->
        @gui = new dat.GUI( { width: 400 } )
        @gui.add(@plane,"visible").name("Show Turbulence Plane")
        @gui.add(@noiseShader.uniforms.vScale.value,"x",0,1).name("Wind Turbulence Scale X")
        @gui.add(@noiseShader.uniforms.vScale.value,"y",0,1).name("Wind Turbulence Scale Y")
        @gui.add(@,"noiseSpeed",0,1).name("Wind Turbolence Speed")
        @gui.add(@,"noiseOffsetSpeed",0,1).name("Wind Offset Speed")
        @gui.add({value:1},"value",0,10).name("Wind Power").onChange (value)=> 
            for elem in @scene.children when elem?.material?.uniforms?.windScale?
                elem.material.uniforms.windScale.value = value
            return

        @xcont = @gui.add(@windDirection,"x",-1,1).step(0.01).name("Wind Direction X").onChange @onWindDirectionChange
        @ycont = @gui.add(@windDirection,"y",-1,1).step(0.01).name("Wind Direction Y").onChange @onWindDirectionChange
        @zcont = @gui.add(@windDirection,"z",-1,1).step(0.01).name("Wind Direction Z").onChange @onWindDirectionChange

        @windDirection.x = 1
        @windDirection.y = 0
        @windDirection.z = 0
        @onWindDirectionChange()

    onWindDirectionChange:(value)=>
        @windDirection.normalize();
        @xcont.updateDisplay();
        @ycont.updateDisplay();
        @zcont.updateDisplay();

    animate: =>
        window.requestAnimationFrame( @animate )
        @render()
        @stats.update()
        return

    render: =>
        delta = @clock.getDelta()

        if @windDirection
            @noiseShader.uniforms[ "fTime" ].value += delta * @noiseSpeed
            @noiseShader.uniforms[ "vOffset" ].value.x -= (delta * @noiseOffsetSpeed) * @windDirection.x
            @noiseShader.uniforms[ "vOffset" ].value.y += (delta * @noiseOffsetSpeed) * @windDirection.z

        @controls.update()

        @renderer.render( @noiseScene, @noiseCameraOrtho, @noiseMap, true )
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
