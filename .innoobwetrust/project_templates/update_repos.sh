#!/usr/bin/env sh

for repo in `find . -path '*/.git' -d 2 | cut -d '/' -f 2`; do
    pushd "./$repo"
    git fetch --all --prune &
    popd
done

wait
echo "Done updating repos!"
