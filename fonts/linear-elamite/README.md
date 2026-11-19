# Luma Linear Elamite

A font of the 348 Linear Elamite signs, LE001 to LE348, numbered after the sign list of
Desset et al. 2022 (*The Decipherment of Linear Elamite Writing*, Zeitschrift für
Assyriologie 112, fig. 3a–b). Drawn by Joachim Piguet in Inkscape, one sign per file in
`svg/`, on a 1000 × 1000 page. Licensed under the SIL Open Font License 1.1 (`OFL.txt`).

## Encoding

Linear Elamite is not yet in Unicode (a proposal, L2/21-233, awaits revision). Until it
is, sign LE*nnn* sits in the Private Use Area at **U+E000 + *nnn***: LE001 is U+E001,
LE348 is U+E15C. Nothing else in Luma uses that area. When the script is encoded, only
this mapping changes (`build.py`, `ELAMITE` in `shared/lessons/grade.ts`, the course).

## Readings

`readings.csv` gives, for the 144 signs with a phonetic value:

- `reading`: the value of Desset's latest table, which Luma teaches (vowels a e i o u,
  and the long ů: *he*, *ko*, *rů*…);
- `reading_2025`: the value on plate II of *Linear Elamite Inscriptions* (OLSM 10, 2025),
  where the same signs carry numbered values (*hi*, *ku₂*, *ru*…);
- `region`: the plate's colour: general (black), south-west (blue, Susa and Fars),
  south-east (red, Kerman and the metal vessels).

The other 204 signs have no agreed value and are drawn but not read.

## Building

```sh
pip install --break-system-packages potracer fonttools brotli numpy pillow
python3 build/trace.py svg out          # each sign rendered at 2000 px and traced
python3 build/build.py out LumaLinearElamite
cp LumaLinearElamite.woff2 ../../src/fonts/
```

Tracing makes strokes, circles and filled paths alike into outlines, so a drawing can
be saved from Inkscape as it is. `rsvg-convert` must be installed. An `<image>` left in a
drawing (a tracing template) is removed beforehand.
