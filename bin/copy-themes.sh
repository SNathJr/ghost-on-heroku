themes=(
	casper
	attila
	london
	massively
	bleak
	the-shell
	vapor
        pico
        lyra
	liebling
)

for theme in "${themes[@]}"
do
	cp -Rf "node_modules/$theme" content/themes
done
