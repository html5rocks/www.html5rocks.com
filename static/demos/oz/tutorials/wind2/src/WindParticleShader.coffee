class WindParticleShader

    uniforms : null

    constructor:->
        @uniforms =  THREE.UniformsUtils.merge( [

            THREE.UniformsLib[ "particle" ]
            THREE.UniformsLib[ "shadowmap" ]
            {
                "diffuseMultiplier": { type: "f", value: 2 }
                "alphaMultiplier": { type: "f", value: 0.3 }
                "windMin": { type: "v2", value: new THREE.Vector2(-30,-30) }
                "windSize": { type: "v2", value: new THREE.Vector2(60,60) }
                "windDirection": { type: "v3", value: new THREE.Vector3(1,0,0) }
                "tWindForce": { type: "t", value: null }
                "windScale": { type: "f", value: 10.0 }       
                "time": { type: "f", value: 0.0 }
            }

        ] )



    vertexShader: [

        "uniform float size;"
        "uniform float scale;"

        "uniform vec2 windMin;"
        "uniform vec2 windSize;"
        "uniform vec3 windDirection;"
        "uniform sampler2D tWindForce;"
        "uniform float windScale;"
        "uniform float time;"

        "attribute float speed;"
        "varying float fSpeed;"

        THREE.ShaderChunk[ "color_pars_vertex" ]
        THREE.ShaderChunk[ "shadowmap_pars_vertex" ]

        "void main() {"


            "vec4 mvPosition;"
            "vec4 wpos = modelMatrix * vec4( position, 1.0 );"
            "wpos.z = -wpos.z;"
            "vec2 totPos = wpos.xz - windMin;"
            "vec2 windUV = totPos / windSize;"
            "float vWindForce = texture2D(tWindForce,windUV).x;"
            "float windMod = (1.0 - vWindForce) * windScale;"
            "vec4 pos = vec4(position , 1.0);"
            "pos.x += windMod * windDirection.x;"
            "pos.y += windMod * windDirection.y;"
            "pos.z += windMod * windDirection.z;"

            "mvPosition = modelViewMatrix *  pos;"

            "fSpeed = speed;"
            "float fSize = size * (1.0 + sin(time * speed));"

            "#ifdef USE_SIZEATTENUATION"
                "gl_PointSize = fSize * ( scale / length( mvPosition.xyz ) );"
            "#else",
                "gl_PointSize = fSize;"
            "#endif"

            "gl_Position = projectionMatrix * mvPosition;"

            THREE.ShaderChunk[ "worldpos_vertex" ]
            THREE.ShaderChunk[ "shadowmap_vertex" ]

        "}"

    ].join("\n")

    fragmentShader: [

        "uniform vec3 psColor;"
        "uniform float opacity;"
        "uniform float diffuseMultiplier;"
        "uniform float alphaMultiplier;"
        "varying float fSpeed;"

        "uniform float time;"

        THREE.ShaderChunk[ "color_pars_fragment" ]
        THREE.ShaderChunk[ "map_particle_pars_fragment" ]
        THREE.ShaderChunk[ "fog_pars_fragment" ]
        THREE.ShaderChunk[ "shadowmap_pars_fragment" ]

        "void main() {"

            "gl_FragColor = vec4( psColor, opacity );"

            "#ifdef USE_MAP",

                "gl_FragColor = texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) ) * diffuseMultiplier;",
                "gl_FragColor.w = alphaMultiplier * (1.0 + sin(time * fSpeed));"

            "#endif"            
            THREE.ShaderChunk[ "alphatest_fragment" ]
            THREE.ShaderChunk[ "color_fragment" ]
            THREE.ShaderChunk[ "shadowmap_fragment" ]
            THREE.ShaderChunk[ "fog_fragment" ]

        "}"

    ].join("\n")