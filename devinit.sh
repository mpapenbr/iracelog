# this script is supposed to be executed as postCreateCommand of the devcontainer
pnpm config set @buf:registry  https://buf.build/gen/npm/v1/
pnpm install
if [ -f setuplinks.sh ]; then
    . ./setuplinks.sh
fi