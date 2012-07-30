There is a build script to build the assets from source.

cd to aquarium and type "build"

(*) It assumes it's on Windows.

    I'm not sure if there are any true Windowisms but it hasn't been run anywhere else.

(*) It assumes you have Maya installed

(*) It has hard coded paths to Maya, the ColladaMaya plugin from http://opencollada.org
    and to the o3dConverter.

    These paths are defined at the top of build.py

(*) It requires python 2.6 or greater but less than 3.0 (since 3.0 is not backward
    compatible). Mostly for the json library.

(*) It assumes all the textures are in aquarium/source_assets/sourceimages.

(*) It assumes textures are either .png or .jpg and they are lowercase.

(*) It assumes textures always have the suffixes _DM (diffuseMap), _NM (normalMap) or
    _RM (reflection map)





