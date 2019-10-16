themes=(
	casper
	casper-dark
	attila
	london
	massively
	bleak
	the-shell
	vapor
)

for theme in "${themes[@]}"
do
	cp -Rf "node_modules/$theme" content/themes
done
