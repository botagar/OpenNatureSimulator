struct DirectionalLight {
    vec3 direction;
    vec3 color;

    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
};

uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHTS ];
uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
uniform float time;

varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];
varying vec2 vUv;
varying vec3 vNormal;

const float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)
const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)

const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );

float unpackRGBAToDepth( const in vec4 v ) {
    return dot( v, UnpackFactors );
}

float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
    return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
}

float texture2DShadowLerp( sampler2D depths, vec2 size, vec2 uv, float compare ) {

    const vec2 offset = vec2( 0.0, 1.0 );

    vec2 texelSize = vec2( 1.0 ) / size;
    vec2 centroidUV = floor( uv * size + 0.5 ) / size;

    float lb = texture2DCompare( depths, centroidUV + texelSize * offset.xx, compare );
    float lt = texture2DCompare( depths, centroidUV + texelSize * offset.xy, compare );
    float rb = texture2DCompare( depths, centroidUV + texelSize * offset.yx, compare );
    float rt = texture2DCompare( depths, centroidUV + texelSize * offset.yy, compare );

    vec2 f = fract( uv * size + 0.5 );

    float a = mix( lb, lt, f.y );
    float b = mix( rb, rt, f.y );
    float c = mix( a, b, f.x );

    return c;

}

float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {

    float shadow = 1.0;

    shadowCoord.xyz /= shadowCoord.w;
    shadowCoord.z += shadowBias;

    // if ( something && something ) breaks ATI OpenGL shader compiler
    // if ( all( something, something ) ) using this instead

    bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
    bool inFrustum = all( inFrustumVec );

    bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );

    bool frustumTest = all( frustumTestVec );

    if ( frustumTest ) {

    #if defined( SHADOWMAP_TYPE_PCF )
    vec2 texelSize = vec2( 1.0 ) / shadowMapSize;

    float dx0 = - texelSize.x * shadowRadius;
    float dy0 = - texelSize.y * shadowRadius;
    float dx1 = + texelSize.x * shadowRadius;
    float dy1 = + texelSize.y * shadowRadius;

    shadow = (
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
        texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
    ) * ( 1.0 / 9.0 );

    #elif defined( SHADOWMAP_TYPE_PCF_SOFT )
    vec2 texelSize = vec2( 1.0 ) / shadowMapSize;

    float dx0 = - texelSize.x * shadowRadius;
    float dy0 = - texelSize.y * shadowRadius;
    float dx1 = + texelSize.x * shadowRadius;
    float dy1 = + texelSize.y * shadowRadius;

    shadow = (
        texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
        texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
        texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
        texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
        texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy, shadowCoord.z ) +
        texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
        texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
        texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
        texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
    ) * ( 1.0 / 9.0 );

    #else // no percentage-closer filtering:
    shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
    #endif
    }
    return shadow;
}

float getShadowMask() {
    float shadow = 1.0;

    DirectionalLight directionalLight;
    #pragma unroll_loop
    for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
        directionalLight = directionalLights[ i ];
        shadow *= bool( directionalLight.shadow ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
    }

    return shadow;
}

void main() {
    vec3 lightDir = directionalLights[0].direction;
    vec3 lightColor = directionalLights[0].color;
    float dProd = max(0.0, dot(vNormal, lightDir));
    vec3 effectiveLight = vec3(1, 1, 1) * dProd;

    vec2 position = -1.0 + 2.0 * vUv;
    float red = abs(sin(position.x * position.y + time / 5.0)) * dProd;
    float green = abs(sin(position.x * position.y + time / 4.0)) * dProd;
    float blue = abs(sin(position.x * position.y + time / 3.0 )) * dProd;

    vec3 maskedLight = vec3(effectiveLight * getShadowMask());
    gl_FragColor = vec4(maskedLight, 1);
}