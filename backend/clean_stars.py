"""
Clean up arbitrary stars from tools.json
Only keep stars if they're from GitHub API (githubStars field)
"""
import json
from pathlib import Path

# Load tools
tools_path = Path("data/tools.json")
with open(tools_path, 'r', encoding='utf-8') as f:
    tools = json.load(f)

print(f"Cleaning {len(tools)} tools...")

for tool in tools:
    # If tool has arbitrary "stars" field but NOT githubStars, remove it
    if "stars" in tool and "githubStars" not in tool:
        # Check if URL is a GitHub repo
        url = tool.get("url", "")
        if "github.com" in url and "/repos/" not in url and "/features/" not in url and "/docs." not in url:
            # It's a GitHub repo URL, keep stars for now (will be replaced by real stars later)
            print(f"  WARNING: {tool['title']}: GitHub repo with old stars format")
        else:
            # Not a GitHub repo, remove stars
            print(f"  REMOVED stars from {tool['title']} ({url})")
            del tool["stars"]

    # If tool has both stars and githubStars, remove old stars field
    if "stars" in tool and "githubStars" in tool:
        print(f"  REMOVED redundant stars field from {tool['title']}")
        del tool["stars"]

# Save cleaned tools
with open(tools_path, 'w', encoding='utf-8') as f:
    json.dump(tools, f, indent=2, ensure_ascii=False)

print("\nDone! Cleaned tools saved.")
