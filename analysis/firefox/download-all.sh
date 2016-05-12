#!/bin/bash
TARGET="$1"


function unzip_and_rm {
    find "$1" -iname "$2" -type f -execdir sh -c '
        ZIPFILE="{}";
        ZIPNAME="${ZIPFILE%.*}"
        echo $ZIPFILE
        mkdir -p "$ZIPNAME"
        echo Unzipping $(basename "$ZIPFILE")
        unzip -q -n -d "$ZIPNAME" "$ZIPFILE"
        rm "$ZIPFILE"
    ' \;
}


./download-all.py "$TARGET"


# uncompress all .xpi files
unzip_and_rm "$TARGET" '*.xpi'

# each theme directory can have jar files in it - we need to extract them, too
unzip_and_rm "$TARGET" '*.jar'
