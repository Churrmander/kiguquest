#!/bin/bash
# Spark Cellar Kigu (76-83): each view starts from a house AutoSprite Kigu with a similar shape (recoloured), img2img at 0.8.
R=../kiguquest/art/autosprite/kigu
SEEDS=${SEEDS:-"71 72 73 74"}
gen() { # id ref "recolour args or -" "description"
  id=$1; ref=$2; rc=$3; desc=$4
  for v in base pose back; do
    if [ "$rc" = "-" ]; then cp $R/$ref-$v.png refs/$id-$v.png; else python recolour_ref.py $R/$ref-$v.png refs/$id-$v.png $rc >/dev/null; fi
  done
  for s in $SEEDS; do for v in base pose back; do
    case $v in base) V="front view, standing";; pose) V="dynamic action pose";; back) V="seen from behind, back view";; esac
    python make_kigu.py "$desc" --seed $s --prefix $id-$v-s$s --view "$V" --ref refs/$id-$v.png --denoise 0.8 >/dev/null
  done; done
  python -c "from snap import snap; import glob; [snap(f,grid=6,colours=32) for f in glob.glob('out/$id-*-s*_.png')]"
  echo "$id done"
}
[ -z "$ONLY" -o "$ONLY" = glowmira ] && gen glowmira spectrina "--from 230 300 --to 215 --sat 1.2 --keep-skin" "girl in a flowing navy blue lantern-cape with a twinkling starry hem over a pale green gown, long moon-pale white hair, sheer gauze sleeves, holding a glowing pale yellow lantern, small glowing star hair ornaments, calm gentle face"
[ -z "$ONLY" -o "$ONLY" = boingo ] && gen boingo buzzlet "--from 40 62 --to 25 --sat 0.9 --keep-skin" "girl in an orange copper coil-spring onesie with ribbed spring rings around the body, copper-wire hair in springy spirals, round silver bell-toy hood with a small bell on top, grey mitts, brown boots, bouncy cheerful smile"
[ -z "$ONLY" -o "$ONLY" = teslaria ] && gen teslaria arcorn "--from 40 62 --to 25 --sat 0.9 --keep-skin" "girl in a copper-coil cape over an orange and cream outfit with brass buttons, copper spiral hair, a tuning-fork hairpin, small blue electric sparks, brown boots, confident smile"
[ -z "$ONLY" -o "$ONLY" = batnap ] && gen batnap dozala "--from 0 0 --to 280 --grey 0.3 --keep-skin" "girl in a dark plum bat onesie with a lilac belly, bat hood with big pointed ears with pink insides, folded bat wing sleeves, short black hair, big sleepy half-closed eyes, dark purple boots"
[ -z "$ONLY" -o "$ONLY" = noctura ] && gen noctura somnia "-" "girl in a dark navy moon-wing cloak shaped like bat wings with gold star stitches, purple velvet nightcap with a crescent moon, short black hair, a small glowing yellow lantern on one wrist, lilac dress, calm smile"
[ -z "$ONLY" -o "$ONLY" = dripstone ] && gen dripstone pebblump "-" "girl in a cave grey onesie with darker grey drip stripes, stalactite cap hood with pointed stone drips hanging from the rim, short dark grey hair, a hanging rope tail, quiet face, grey boots"
[ -z "$ONLY" -o "$ONLY" = stalaghost ] && gen stalaghost geodrusa "--from 250 310 --to 210 --sat 0.4 --keep-skin" "ghostly girl in a pale white and lavender calcite drape cape, crown of hanging icy crystals, long pale grey hair, glowing pale blue lantern drops floating around her, grey boots, serene face"
echo all done
