themes=(
	casper
	attila
	london
	massively
	official-blog
)

for theme in "${themes[@]}"
do
	cp -Rf "node_modules/$theme" content/themes
done
