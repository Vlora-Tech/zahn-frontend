import React from "react";

const MaterialIcon: React.FC<React.SVGProps<SVGSVGElement>> = () => (
<svg
                              width="33"
                              height="35"
                              viewBox="0 0 33 35"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g filter="url(#filter0_dig_217_9973)">
                                <path
                                  d="M16.0723 4.52637C22.7435 4.52637 28.1514 9.93433 28.1514 16.6055C28.1513 23.2765 22.7434 28.6846 16.0723 28.6846C9.40126 28.6846 3.99333 23.2765 3.99323 16.6055C3.99323 9.93433 9.40119 4.52637 16.0723 4.52637Z"
                                  fill="#E8EAE7"
                                />
                              </g>
                              <defs>
                                <filter
                                  id="filter0_dig_217_9973"
                                  x="-0.0067749"
                                  y="0.526367"
                                  width="38.1582"
                                  height="34.1582"
                                  filterUnits="userSpaceOnUse"
                                  color-interpolation-filters="sRGB"
                                >
                                  <feFlood
                                    flood-opacity="0"
                                    result="BackgroundImageFix"
                                  />
                                  <feColorMatrix
                                    in="SourceAlpha"
                                    type="matrix"
                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                    result="hardAlpha"
                                  />
                                  <feOffset dx="1" dy="4" />
                                  <feGaussianBlur stdDeviation="1" />
                                  <feComposite in2="hardAlpha" operator="out" />
                                  <feColorMatrix
                                    type="matrix"
                                    values="0 0 0 0 0.0673077 0 0 0 0 0.0673077 0 0 0 0 0.0673077 0 0 0 0.25 0"
                                  />
                                  <feBlend
                                    mode="normal"
                                    in2="BackgroundImageFix"
                                    result="effect1_dropShadow_217_9973"
                                  />
                                  <feBlend
                                    mode="normal"
                                    in="SourceGraphic"
                                    in2="BackgroundImageFix"
                                    result="shape"
                                  />
                                  <feColorMatrix
                                    in="SourceAlpha"
                                    type="matrix"
                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                    result="hardAlpha"
                                  />
                                  <feOffset dx="10" />
                                  <feGaussianBlur stdDeviation="10" />
                                  <feComposite
                                    in2="hardAlpha"
                                    operator="arithmetic"
                                    k2="-1"
                                    k3="1"
                                  />
                                  <feColorMatrix
                                    type="matrix"
                                    values="0 0 0 0 0.543269 0 0 0 0 0.543269 0 0 0 0 0.543269 0 0 0 0.25 0"
                                  />
                                  <feBlend
                                    mode="normal"
                                    in2="shape"
                                    result="effect2_innerShadow_217_9973"
                                  />
                                  <feBlend
                                    mode="normal"
                                    in="effect2_innerShadow_217_9973"
                                    in2="effect1_dropShadow_217_9973"
                                    result="effect2_innerShadow_217_9973"
                                  />
                                  <feTurbulence
                                    type="fractalNoise"
                                    baseFrequency="10 10"
                                    numOctaves="3"
                                    seed="9325"
                                    result="displacementX"
                                  />
                                  <feTurbulence
                                    type="fractalNoise"
                                    baseFrequency="10 10"
                                    numOctaves="3"
                                    seed="9326"
                                    result="displacementY"
                                  />
                                  <feColorMatrix
                                    in="displacementX"
                                    type="matrix"
                                    values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
                                    result="displacementXRed"
                                  />
                                  <feColorMatrix
                                    in="displacementY"
                                    type="matrix"
                                    values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
                                  />
                                  <feComposite
                                    in="displacementXRed"
                                    operator="arithmetic"
                                    k1="0"
                                    k2="1"
                                    k3="1"
                                    k4="0"
                                  />
                                  <feDisplacementMap
                                    in="effect2_innerShadow_217_9973"
                                    scale="8"
                                    xChannelSelector="R"
                                    yChannelSelector="G"
                                    width="100%"
                                    height="100%"
                                  />
                                  <feColorMatrix
                                    type="matrix"
                                    values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                                  />
                                  <feComponentTransfer result="sourceDisplacedAlpha">
                                    <feFuncA type="gamma" exponent="0.2" />
                                  </feComponentTransfer>
                                  <feColorMatrix
                                    in="effect2_innerShadow_217_9973"
                                    type="matrix"
                                    values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                                  />
                                  <feComponentTransfer result="inputSourceAlpha">
                                    <feFuncA type="gamma" exponent="0.2" />
                                  </feComponentTransfer>
                                  <feComposite
                                    in="sourceDisplacedAlpha"
                                    operator="arithmetic"
                                    k1="1"
                                    k2="0"
                                    k3="0"
                                    k4="0"
                                    result="displacementAlphasMultiplied"
                                  />
                                  <feComposite
                                    in="displacementAlphasMultiplied"
                                    operator="arithmetic"
                                    k1="0"
                                    k2="0"
                                    k3="-0.5"
                                    k4="0.5"
                                    result="centeringAdjustment"
                                  />
                                  <feComposite
                                    in="displacementX"
                                    in2="displacementAlphasMultiplied"
                                    operator="arithmetic"
                                    k1="1"
                                    k2="0"
                                    k3="0"
                                    k4="0"
                                  />
                                  <feComposite
                                    in="centeringAdjustment"
                                    operator="arithmetic"
                                    k1="0"
                                    k2="1"
                                    k3="1"
                                    k4="0"
                                  />
                                  <feColorMatrix
                                    type="matrix"
                                    values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
                                    result="displacementXFinal"
                                  />
                                  <feComposite
                                    in="displacementY"
                                    in2="displacementAlphasMultiplied"
                                    operator="arithmetic"
                                    k1="1"
                                    k2="0"
                                    k3="0"
                                    k4="0"
                                  />
                                  <feComposite
                                    in="centeringAdjustment"
                                    operator="arithmetic"
                                    k1="0"
                                    k2="1"
                                    k3="1"
                                    k4="0"
                                  />
                                  <feColorMatrix
                                    type="matrix"
                                    values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
                                    result="displacementYFinal"
                                  />
                                  <feComposite
                                    in="displacementXFinal"
                                    in2="displacementYFinal"
                                    operator="arithmetic"
                                    k1="0"
                                    k2="1"
                                    k3="1"
                                    k4="0"
                                  />
                                  <feComposite
                                    in2="displacementAlphasMultiplied"
                                    operator="in"
                                    result="displacementMap"
                                  />
                                  <feFlood
                                    flood-color="rgb(127, 127, 127)"
                                    flood-opacity="1"
                                  />
                                  <feComposite
                                    in2="displacementAlphasMultiplied"
                                    operator="out"
                                  />
                                  <feComposite
                                    in2="displacementMap"
                                    operator="over"
                                    result="displacementMapWithBg"
                                  />
                                  <feDisplacementMap
                                    in="effect2_innerShadow_217_9973"
                                    scale="8"
                                    xChannelSelector="R"
                                    yChannelSelector="G"
                                    width="100%"
                                    height="100%"
                                    result="displacedImage"
                                  />
                                  <feColorMatrix
                                    in="effect2_innerShadow_217_9973"
                                    type="matrix"
                                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 127 0"
                                    result="imageOpaque"
                                  />
                                  <feDisplacementMap
                                    in="imageOpaque"
                                    in2="displacementMapWithBg"
                                    scale="8"
                                    xChannelSelector="R"
                                    yChannelSelector="G"
                                    width="100%"
                                    height="100%"
                                    result="displacedImageOpaque"
                                  />
                                  <feColorMatrix
                                    in="displacedImage"
                                    type="matrix"
                                    values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
                                    result="displacedImageRed"
                                  />
                                  <feColorMatrix
                                    in="effect2_innerShadow_217_9973"
                                    type="matrix"
                                    values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
                                  />
                                  <feComposite
                                    in="displacedImageRed"
                                    operator="atop"
                                    result="transparencyRedMap"
                                  />
                                  <feColorMatrix
                                    in="transparencyRedMap"
                                    type="matrix"
                                    values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
                                    result="transparencyAlphaMap"
                                  />
                                  <feComposite
                                    in="displacedImageOpaque"
                                    in2="imageOpaque"
                                    operator="over"
                                  />
                                  <feComposite
                                    in2="transparencyAlphaMap"
                                    operator="in"
                                    result="effect3_texture_217_9973"
                                  />
                                </filter>
                              </defs>
                            </svg>
)

export default MaterialIcon;