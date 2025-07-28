#!/bin/bash
# Living Codebase System - Setup Script
# This script initializes the .claude-mind directory structure

set -e

echo "🧠 Living Codebase System Setup"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Warning: Not in a git repository. Some features will be limited.${NC}"
    echo "Initialize git repository? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        git init
        echo -e "${GREEN}✓ Git repository initialized${NC}"
    fi
fi

# Create directory structure
echo -e "${BLUE}Creating .claude-mind directory structure...${NC}"

mkdir -p .claude-mind/{consciousness,memory,predictions,patterns,emotional-map,pulse}
mkdir -p .claude-mind/consciousness/decisions
mkdir -p .claude-mind/memory/{short-term/daily-snapshots,long-term,muscle-memory}
mkdir -p .claude-mind/patterns/{recognized,preferred,anti-patterns}

echo -e "${GREEN}✓ Directory structure created${NC}"

# Create initial NOW file
echo -e "${BLUE}Creating NOW file...${NC}"
cat > .claude-mind/now.md << 'EOF'
# NOW - Current Development Context

Last Updated: $(date '+%Y-%m-%d %H:%M:%S')

## 🎯 Current Focus
Building [DESCRIBE YOUR CURRENT FEATURE/TASK]

## 🧭 North Star
"[ONE SENTENCE THAT GUIDES THIS WORK]"

## 📍 Where We Are
- ✅ [Completed task]
- 🚧 [Current task] (X% done)
- ⏳ [Next task]
- ❌ [Future task]

## 🤔 Current Thinking
[What decisions are you wrestling with?]

## 😟 Current Concerns
- [What might go wrong?]
- [What's unclear?]

## 💡 Next Actions
1. [Concrete next step]
2. [Concrete next step]
3. [Concrete next step]

## 🔄 Recent Decisions
- $(date '+%Y-%m-%d'): [Decision made today]

## 📊 Current Metrics
- Code Health: ?/100
- Test Coverage: ?%
- Bundle Size: ?kb
- Mood: [How are you feeling?]

## 🗣️ Context for Claude
- Focus on: [what to prioritize]
- Avoid: [what not to suggest]
- Style: [how to communicate]
EOF

echo -e "${GREEN}✓ NOW file created${NC}"

# Create Intent Map
echo -e "${BLUE}Creating Intent Map...${NC}"
cat > .claude-mind/consciousness/intent-map.md << 'EOF'
# Master Intent Map

## Core Product Intent
**In one sentence:** [What are you building and why?]