THREE.ShaderGrass = {	
	'shader' : {

		uniforms: THREE.UniformsUtils.merge( [

			{

			}

		] ),

		vertexShader: [

			// built in (?)

			// vec4 position	: POSITION
			// vec3 normal		: NORMAL
			// vec2 texCoord	: TEXCOORD0
			// vec2 texCoord2 	: TEXCOORD1
			// vec3 tangent   	: TEXCOORD2
			// vec4 vertColor 	: COLOR  	//In this implementation a per vertex lightmap is used

			//out vec4 oPosition	   		: POSITION


			// out vec4 oVertColor      	: COLOR
			"varying vec2 vColor;",
			// out vec2 oTexCoord	  		: TEXCOORD0
			"varying vec2 vUv;",
			// out vec2 oTexCoord2	  		: TEXCOORD1
			"varying vec2 vUv2;",
			// out vec3 oEyeDirTan      	: TEXCOORD2
			"varying vec2 vEyeDirTan;",

			// out vec4 oPositionViewProj	: TEXCOORD3
			"varying vec2 vPositionViewProj;",

			//uniform float4x4 worldViewProj,
			uniform vec3 eyePositionO,
			uniform float time //Runs from 0 to 10 per second.

			"void main() {",

				//oPosition = mul(worldViewProj, position); //oPosition must be output to satisy pipeline.
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				// oPositionViewProj = oPosition;
				"vPositionViewProj = gl_Position",
				// oTexCoord = texCoord;
				"vUv = uv;",
				// oTexCoord2 = float2((texCoord2.x+time*0.2)/2,(texCoord2.y+time*0.2)/2); 	// offset second texture coordinate
																							// according to time for wind texture
				
				"vUv2 = uv;",

				// oVertColor = vertColor;
				"vColor = color;",

				vec3 eyeDirO = -(eyePositionO-position) ; //eye vector in object space
				
				vec3 binormal = cross(tangent,normal);
				float3x3 TBNMatrix = float3x3(tangent,binormal,normal); 

				oEyeDirTan = normalize( mul(TBNMatrix,eyeDirO) ); // eye vector in tangent space

			"}"
			

		].join("\n"),

		fragmentShader: [

			"#define MAX_RAYDEPTH 5", //Number of iterations.
			"#define PLANE_NUM 16.0", //Number of grass slice grid planes per unit in tangent space.
			"#define PLANE_NUM_INV (1.0/PLANE_NUM)",
			"#define PLANE_NUM_INV_DIV2 (PLANE_NUM_INV/2)",
			"#define GRASS_SLICE_NUM 8", // Number of grass slices in texture grassblades.
			"#define GRASS_SLICE_NUM_INV (1.0/GRASS_SLICE_NUM)",
			"#define GRASS_SLICE_NUM_INV_DIV2 (GRASS_SLICE_NUM_INV/2)",
			"#define GRASSDEPTH GRASS_SLICE_NUM_INV", //Depth set to inverse of number of grass slices so no stretching occurs.
			"#define TC1_TO_TC2_RATIO 8", //Ratio of texture coordinate set 1 to texture coordinate set 2, used for the animation lookup.
			"#define PREMULT (GRASS_SLICE_NUM_INV*PLANE_NUM)", //Saves a multiply in the shader.
			"#define AVERAGE_COLOR float4(0.32156,0.513725,0.0941176,1.0)", //Used to fill remaining opacity, can be replaced by a texture lookup.

			// in float4 vertColor      	: COLOR,
			// in float2 texCoord       	: TEXCOORD0,
			in float2 texCoord2      	: TEXCOORD1,
			in float3 eyeDirTan      	: TEXCOORD2,
			in float4 positionViewProj  : TEXCOORD3,
			
			// out float4 color			: COLOR,
			// out float depth			: DEPTH, 

			uniform float4x4 worldViewProj,
			uniform sampler2D grassblades,
			uniform sampler2D ground,
			uniform sampler2D windnoise

			"void main() {",

				//Initialize increments/decrements and per fragment constants
				gl_FragColor = vec4(0.0,0.0,0.0,0.0);

			 	vec2 plane_offset = vec2(0.0,0.0);					
			 	vec3 rayEntry = vec3(texCoord.xy,0.0);
				float zOffset = 0.0;
				bool zFlag = 1;


			 	//The signs of eyeDirTan determines if we increment or decrement along the tangent space axis
				//plane_correct, planemod and pre_dir_correct are used to avoid unneccessary if-conditions. 
				
			 	vec2 sign = vec2(sign(eyeDirTan.x),sign(eyeDirTan.y));	
			 	vec2 plane_correct = vec2((sign.x+1)*GRASS_SLICE_NUM_INV_DIV2, (sign.y+1)*GRASS_SLICE_NUM_INV_DIV2);
			 	vec2 planemod = vec2(floor(rayEntry.x*PLANE_NUM)/PLANE_NUM, floor(rayEntry.y*PLANE_NUM)/PLANE_NUM);
				vec2 pre_dir_correct = vec2((sign.x+1)*PLANE_NUM_INV_DIV2, (sign.y+1)*PLANE_NUM_INV_DIV2);


				int hitcount;
			 	for(hitcount = 0; hitcount < MAX_RAYDEPTH % (MAX_RAYDEPTH+1); hitcount++) 	// %([MAX_RAYDEPTH]+1) speeds up compilation.
													 										// It may proof to be faster to early exit this loop
													 										// depending on the hardware used.
			 	{

					//Calculate positions of the intersections with the next grid planes on the u,v tangent space axis independently.

			 		float2 dir_correct = float2(sign.x*plane_offset.x+pre_dir_correct.x, sign.y*plane_offset.y+pre_dir_correct.y);

					float2 distance = float2((planemod.x + dir_correct.x - rayEntry.x)/(eyeDirTan.x), (planemod.y + dir_correct.y - rayEntry.y)/(eyeDirTan.y));
			 					
			 		float3 rayHitpointX = rayEntry + eyeDirTan *distance.x;   
			  		float3 rayHitpointY = rayEntry + eyeDirTan *distance.y;
					
					//Check if we hit the ground. If so, calculate the intersection and look up the ground texture and blend colors.

			  		if ((rayHitpointX.z <= -GRASSDEPTH)&& (rayHitpointY.z <= -GRASSDEPTH)) 	
			  		{
			  			float distanceZ = (-GRASSDEPTH)/eyeDirTan.z; // rayEntry.z is 0.0 anyway 

			  			float3 rayHitpointZ = rayEntry + eyeDirTan *distanceZ;
						float2 orthoLookupZ = float2(rayHitpointZ.x,rayHitpointZ.y);
									
			  			gl_FragColor = (gl_FragColor)+((1.0-gl_FragColor.w) * tex2D(ground,orthoLookupZ));
			  			if(zFlag ==1) 
			  				zOffset = distanceZ; // write the distance from rayEntry to intersection
			  			zFlag = 0; //Early exit here if faster.		
			  		}  
			  		else
			 		{
			 			
			 			float2 orthoLookup; //Will contain texture lookup coordinates for grassblades texture.

			 			//check if we hit a u or v plane, calculate lookup accordingly with wind shear displacement.
						if(distance.x <= distance.y)
			 			{
			 				float4 windX = (tex2D(windnoise,texCoord2+rayHitpointX.xy/TC1_TO_TC2_RATIO)-0.5)/2;
							
							float lookupX = -(rayHitpointX.z+(planemod.x+sign.x*plane_offset.x)*PREMULT)-plane_correct.x;
							
							orthoLookup = float2(rayHitpointX.y+windX.x*(GRASSDEPTH+rayHitpointX.z),lookupX); 
							
							plane_offset.x += PLANE_NUM_INV; // increment/decrement to next grid plane on u axis
							
							if(zFlag==1) 
								zOffset = distance.x;
						}
						else 
						{
							float4 windY = (tex2D(windnoise,texCoord2+rayHitpointY.xy/TC1_TO_TC2_RATIO)-0.5)/2;
			 			
							float lookupY = -(rayHitpointY.z+(planemod.y+sign.y*plane_offset.y)*PREMULT)-plane_correct.y;
							
							orthoLookup = float2(rayHitpointY.x+windY.y*(GRASSDEPTH+rayHitpointY.z) ,lookupY);
			 			
							plane_offset.y += PLANE_NUM_INV;  // increment/decrement to next grid plane on v axis
							
							if(zFlag==1) 
								zOffset = distance.y;
								
			  			}
			  			 
			 	 		gl_FragColor += (1.0-gl_FragColor.w)*tex2D(grassblades,orthoLookup);
			 	
			 	 		if(gl_FragColor.w >= 0.49)
			 	 		{
			 	 			zFlag = 0;
			 	 		}	//Early exit here if faster.
			  		}
				}	

			     gl_FragColor += (1.0-gl_FragColor.w)*AVERAGE_COLOR; 	//Fill remaining transparency in case there is some left. Can be replaced by a texture lookup
								   										//into a fully opaque grass slice using orthoLookup.


			     gl_FragColor.xyz *= (vertColor.xyz); // Modulate with per vertex lightmap,as an alternative, modulate with N*L for dynamic lighting.

			     //zOffset is along eye direction, transform and add to vertex position to get correct z-value.
			     positionViewProj += mul(worldViewProj,eyeDirTan.xzy*zOffset); 

			     //Divide by homogenous part.
			     depth = positionView.z/positionView.w;				

			"}"			

		].join("\n")
	}
}