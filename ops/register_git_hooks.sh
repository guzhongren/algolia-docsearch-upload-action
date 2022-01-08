#!/bin/sh
set -eu
cd .git/hooks || exit
ln -s ../../.hooks/pre-commit pre-commit &>/dev/null
