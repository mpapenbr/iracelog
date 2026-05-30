# this script is supposed to be executed as postCreateCommand of the devcontainer
# Note: back to 11.3.0 until issues with tarball integrity is fixed
# see https://github.com/pnpm/pnpm/issues/12067 
# produces way to many additional issues to handle right now
corepack prepare pnpm@11.3.0 --activate
pnpm config set @buf:registry  https://buf.build/gen/npm/v1/
pnpm install
if [ -f setuplinks.sh ]; then
    . ./setuplinks.sh
fi