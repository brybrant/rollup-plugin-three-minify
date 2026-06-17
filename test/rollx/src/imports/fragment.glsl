uniform vec3 diffuse;
uniform float opacity;

varying vec3 vViewPosition;

#include <common>
#include <dithering_pars_fragment>
#include <normal_pars_fragment>

void main() {

  vec4 diffuseColor = vec4( diffuse, opacity );

  float rimGlow = 1.0 - max( 0.0, dot( vNormal, normalize( vViewPosition ) ) );
  rimGlow = pow( rimGlow, 10.0 );
  diffuseColor.rgb += vec3( 1.0 ) * rimGlow;

  gl_FragColor = diffuseColor;

  #include <encodings_fragment>
  #include <colorspace_fragment>
  #include <dithering_fragment>

}
