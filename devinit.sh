# this script is supposed to be executed as postCreateCommand of the devcontainer
corepack prepare pnpm@11.5.0 --activate
pnpm config set @buf:registry  https://buf.build/gen/npm/v1/
pnpm install
if [ -f setuplinks.sh ]; then
    . ./setuplinks.sh
fi