---
name: living-context
description: Check living codebase context before executing commands
---

# Living Context Check

Before running any command, check if the project has a `.claude-mind` directory.

## Integration Points

### 1. Pre-Command Check
```bash
if [ -d ".claude-mind" ]; then
  echo "🧠 Living context detected"
  echo "Current focus: $(grep -A1 "Current Focus" .claude-mind/now.md | tail -1)"
fi
```

### 2. Drift Warning
Before major commands like `/plan-product` or `/refactor-smart`:
- Check `.claude-mind/consciousness/drift-report.json`
- Warn if drift > 0.4
- Suggest reviewing intent-map first

### 3. Decision Integration
When making technical decisions:
- Check `.claude-mind/consciousness/decisions/` for similar past decisions
- Suggest creating decision record after choosing

### 4. Context Update
After commands that change code:
- Remind to update NOW file
- Flag if changes might increase drift

## Usage

This acts as a bridge between:
- **Commands** (discrete actions)
- **Consciousness** (continuous context)

Both systems work better together!