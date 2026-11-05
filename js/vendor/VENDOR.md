# Vendored libraries (T-031 turn B, 2026-11-05)

Both files are copied unchanged from the npm registry (fetched 2026-11-05) and loaded only when a QR screen opens.

| File | Library | Version | Licence | Source | Size |
|---|---|---|---|---|---|
| `qrcode.js` | qrcode-generator, Kazuhiko Arase (draws QR codes) | 2.0.4 | MIT (header kept at the top of the file) | https://registry.npmjs.org/qrcode-generator/-/qrcode-generator-2.0.4.tgz, file `package/dist/qrcode.js` | 56,694 bytes |
| `jsQR.js` | jsQR, Cosmo Wolfe (reads QR codes from camera frames) | 1.4.0 | Apache-2.0 (full text in `jsQR-LICENSE.txt`) | https://registry.npmjs.org/jsqr/-/jsqr-1.4.0.tgz, file `package/dist/jsQR.js` | 256,885 bytes |

Package integrity (sha512 from the registry, matches the downloaded tarballs): qrcode-generator `mZSiP6RnbHl4xL2Ap5HfkjLnmxfKcPWpWe/c+5XxCuetEenqmNFf1FH/ftXPCtFG5/TDobjsjz6sSNL0Sr8Z9g==`; jsqr `dxLob7q65Xg2DvstYkRpkYtmKm2sPJ9oFhrhmudT1dZvNFFTlroai3AWSpLey/w5vMcLBXRgOJsbXpdN9HzU/A==`.
SHA-256 of the files here: qrcode.js `79ec86f82856005b1c887905cfccfcfbec3821ca61c7fd5a952faa5f778f791c`, jsQR.js `bc40c8a15196236b2314db0856f72ca0b49980cd5413b8c852a7349f5fee0859`.
To update: download the new tarball, compare, copy over, bump the cache number in `sw.js`.
