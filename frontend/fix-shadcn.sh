#!/bin/bash
# Fix for shadcn CLI on Windows 11 with Git Bash
# The issue: COMSPEC environment variable points to Git Bash instead of cmd.exe
# Solution: Temporarily set COMSPEC to Windows cmd.exe before running shadcn

export COMSPEC="C:\\Windows\\System32\\cmd.exe"
echo "Fixed COMSPEC for shadcn CLI"
echo "You can now run: npx shadcn@latest add <component>"
echo "Or run this script followed by your shadcn command"

# If arguments provided, run shadcn with them
if [ $# -gt 0 ]; then
    npx shadcn@latest "$@"
fi