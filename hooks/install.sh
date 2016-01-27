DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

ln -s "$DIR/pre-commit" "$DIR/../.git/hooks"
