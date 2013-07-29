class WindMeshShader
	attributes: {
		"windFactor" : { type: "f", value: [] }
	}

	uniforms: THREE.UniformsUtils.merge( [
		THREE.UniformsLib[ "common" ]
		THREE.UniformsLib[ "bump" ]
		THREE.UniformsLib[ "normalmap" ]
		THREE.UniformsLib[ "fog" ]
		THREE.UniformsLib[ "lights" ]
		THREE.UniformsLib[ "shadowmap" ]

		{
			"ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) }
			"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) }
			"specular" : { type: "c", value: new THREE.Color( 0x111111 ) }
			"shininess": { type: "f", value: 30 }
			"wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },


			"windMin": { type: "v2", value: new THREE.Vector2() }
			"windSize": { type: "v2", value: new THREE.Vector2() }
			"windDirection": { type: "v3", value: new THREE.Vector3(1,0,0) }
			"tWindForce": { type: "t", value: null }
			"windScale": { type: "f", value: 1.0 }
		}

	] ),

	vertexShader: [

		"#define PHONG"

		"varying vec3 vViewPosition;"
		"varying vec3 vNormal;"

		

		THREE.ShaderChunk[ "map_pars_vertex" ]
		THREE.ShaderChunk[ "lightmap_pars_vertex" ]
		THREE.ShaderChunk[ "envmap_pars_vertex" ]
		
		"attribute float windFactor;"

		"uniform vec2 windMin;"
		"uniform vec2 windSize;"
		"uniform vec3 windDirection;"
		"uniform sampler2D tWindForce;"
		"uniform float windScale;"
		"varying vec3 vWorldPosition;"
		"varying float vWindForce;"

	
		THREE.ShaderChunk[ "lights_phong_pars_vertex" ]
		THREE.ShaderChunk[ "color_pars_vertex" ]
		THREE.ShaderChunk[ "morphtarget_pars_vertex" ]
		THREE.ShaderChunk[ "skinning_pars_vertex" ]
		THREE.ShaderChunk[ "shadowmap_pars_vertex" ]

		"void main() {",

			THREE.ShaderChunk[ "map_vertex" ]
			THREE.ShaderChunk[ "lightmap_vertex" ]
			THREE.ShaderChunk[ "color_vertex" ]

			THREE.ShaderChunk[ "morphnormal_vertex" ]
			THREE.ShaderChunk[ "skinbase_vertex" ]
			THREE.ShaderChunk[ "skinnormal_vertex" ]
			THREE.ShaderChunk[ "defaultnormal_vertex" ]

			"vNormal = transformedNormal;"

			THREE.ShaderChunk[ "morphtarget_vertex" ]
			THREE.ShaderChunk[ "skinning_vertex" ]
			# THREE.ShaderChunk[ "default_vertex" ]
			
			"vec4 mvPosition;"
			"#ifdef USE_SKINNING"
				"mvPosition = modelViewMatrix * skinned;"
			"#endif"

			"#if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS )"
				"mvPosition = modelViewMatrix * vec4( morphed, 1.0 );"
			"#endif"

			"#if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS )"
				

				"vec4 wpos = modelMatrix * vec4( position, 1.0 );"
				"wpos.z = -wpos.z;"
				# wpos - windmin : windmax - windmin = x : 1
				"vec2 totPos = wpos.xz - windMin;"
				"vec2 windUV = totPos / windSize;"
				"vWindForce = texture2D(tWindForce,windUV).x;"

				"float windMod = ((1.0 - vWindForce)* windFactor ) * windScale;"
				"vec4 pos = vec4(position , 1.0);"
				"pos.x += windMod * windDirection.x;"
				"pos.y += windMod * windDirection.y;"
				"pos.z += windMod * windDirection.z;"

				"mvPosition = modelViewMatrix *  pos;"


			"#endif"

			"gl_Position = projectionMatrix * mvPosition;"


			"vViewPosition = -mvPosition.xyz;"

			THREE.ShaderChunk[ "worldpos_vertex" ]
			THREE.ShaderChunk[ "envmap_vertex" ]				
			THREE.ShaderChunk[ "lights_phong_vertex" ]
			"vWorldPosition = mPosition.xyz;"
			THREE.ShaderChunk[ "shadowmap_vertex" ]


		"}"

	].join("\n")

	fragmentShader: [

		"uniform vec3 diffuse;",
		"uniform float opacity;",

		"uniform vec3 ambient;",
		"uniform vec3 emissive;",
		"uniform vec3 specular;",
		"uniform float shininess;",

		THREE.ShaderChunk[ "color_pars_fragment" ],
		THREE.ShaderChunk[ "map_pars_fragment" ],
		THREE.ShaderChunk[ "lightmap_pars_fragment" ],
		THREE.ShaderChunk[ "envmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
		THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
		THREE.ShaderChunk[ "bumpmap_pars_fragment" ],
		THREE.ShaderChunk[ "normalmap_pars_fragment" ],
		THREE.ShaderChunk[ "specularmap_pars_fragment" ],

		"void main() {",

			"gl_FragColor = vec4( vec3 ( 1.0 ), opacity );",

			THREE.ShaderChunk[ "map_fragment" ],
			THREE.ShaderChunk[ "alphatest_fragment" ],
			THREE.ShaderChunk[ "specularmap_fragment" ],

			THREE.ShaderChunk[ "lights_phong_fragment" ],

			THREE.ShaderChunk[ "lightmap_fragment" ],
			THREE.ShaderChunk[ "color_fragment" ],
			THREE.ShaderChunk[ "envmap_fragment" ],
			THREE.ShaderChunk[ "shadowmap_fragment" ],

			THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

			THREE.ShaderChunk[ "fog_fragment" ],

		"}"

	].join("\n")