# this script is supposed to be executed as postCreateCommand of the devcontainer
yarn install
if [ -f setuplinks.sh ]; then
    . ./setuplinks.sh
fi