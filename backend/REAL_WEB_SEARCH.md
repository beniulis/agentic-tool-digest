# Real Web Search Integration Guide

## The Distinction: LLM Knowledge vs. Web Browsing

### ❌ What the Original Agent Does (Knowledge-Based)
- **Uses LLM's training data** to suggest tools
- No real-time web access
- Limited to what LLM learned during training (cutoff: ~Oct 2023 for GPT-4)
- Can't discover brand new tools

### ✅ What the Enhanced Agent Does (Web-Browsing)
- **Actually searches the web** using APIs
- Gets real-time results from DuckDuckGo, GitHub, Google, etc.
- Discovers tools released after LLM's training cutoff
- Verifies tool existence by fetching actual URLs

---

## How LLM + Web Search Combine

```python
# Step 1: Real web search (no LLM)
web_results = duckduckgo.search("AI coding tools 2024")
# Returns: [{title, url, snippet}, ...]

# Step 2: LLM analyzes the search results
llm_prompt = f"""
Here are REAL search results I just fetched:
{web_results}

Extract tool information from these results...
"""

tools = gpt4.analyze(llm_prompt)
# LLM parses/structures the web data
```

**The LLM doesn't search—it analyzes what we searched for it!**

---

## Setup Real Web Search

### Option 1: DuckDuckGo (FREE, Recommended)

**No API key required!**

```bash
pip install duckduckgo-search
```

```python
from duckduckgo_search import DDGS

ddg = DDGS()
results = ddg.text("AI code completion", max_results=10)
```

### Option 2: GitHub Search (FREE)

**No API key required** (but higher limits with token)

```python
import requests

url = "https://api.github.com/search/repositories"
params = {"q": "AI coding assistant", "sort": "stars"}
response = requests.get(url, params=params)
```

Optional: Add GitHub token for higher rate limits (5000/hour vs 60/hour)

### Option 3: Google Custom Search

**Requires API key** (100 free queries/day)

1. Get API key: https://developers.google.com/custom-search
2. Create Search Engine ID: https://cse.google.com/cse/
3. Add to `.env`:
   ```env
   GOOGLE_SEARCH_API_KEY=your_key
   GOOGLE_SEARCH_ENGINE_ID=your_id
   ```

### Option 4: Bing Web Search

**Requires Azure subscription** (1000 free queries/month)

1. Get API key: https://portal.azure.com
2. Add to `.env`:
   ```env
   BING_SEARCH_API_KEY=your_key
   ```

---

## Using the Enhanced Agent

### Test Web Search Capability

```bash
cd backend/agents

# Install dependency
pip install duckduckgo-search

# Test web search
python enhanced_research_agent.py
```

Expected output:
```
🌐 Searching the web for: AI code completion tools 2024
   Found 10 web results, 5 GitHub repos
   ✅ Extracted 3 tools from web results
   ✅ Extracted 5 tools from GitHub

📊 Discovered 8 Tools (from REAL web search):

1. GitHub Copilot
   AI-powered code completion from GitHub...
   URL: https://github.com/features/copilot
   Source: web_search
   ...
```

### Integrate with API

Update `api.py` to use enhanced agent:

```python
from agents.enhanced_research_agent import EnhancedResearchAgent

# In run_research_pipeline():
agent = EnhancedResearchAgent()  # Uses real web search!
discovered_tools = agent.research_tools_with_web_search(
    query="agentic coding tools",
    max_tools=max_tools
)
```

---

## Comparison Table

| Feature | Original Agent | Enhanced Agent |
|---------|---------------|----------------|
| **Data Source** | LLM training data | Real-time web |
| **API Key Required** | OpenAI only | OpenAI + (optional) search APIs |
| **Finds New Tools** | Only if in training data | Yes, discovers latest tools |
| **Cost** | ~$0.03 per research run | ~$0.03 + search API costs |
| **Accuracy** | Can hallucinate URLs | Verifies real URLs |
| **Speed** | Fast (~30 seconds) | Slower (~60 seconds) |

---

## Best Practices

### 1. **Use DuckDuckGo for Free Tier**
- No API key required
- Good coverage
- Rate limits are reasonable

### 2. **Combine Multiple Sources**
```python
# Search web + GitHub + existing knowledge
web_tools = agent.search_web("AI tools")
github_tools = agent.search_github("AI assistant")
llm_tools = agent.synthesize_from_knowledge()

all_tools = web_tools + github_tools + llm_tools
```

### 3. **Cache Search Results**
```python
# Don't search same query multiple times
import hashlib
import json

query_hash = hashlib.md5(query.encode()).hexdigest()
cache_file = f"cache/{query_hash}.json"

if os.path.exists(cache_file):
    return json.load(open(cache_file))
```

### 4. **Respect Rate Limits**
```python
import time

for query in queries:
    results = search(query)
    time.sleep(1)  # Avoid rate limiting
```

---

## Costs

### DuckDuckGo
- ✅ **FREE**
- No API key
- ~1000 searches/day (rough estimate)

### GitHub
- ✅ **FREE** (with limits)
- 60 requests/hour (no auth)
- 5000 requests/hour (with token)

### Google Custom Search
- 💰 **$5/1000 queries** after free tier
- 100 free queries/day

### Bing Web Search
- 💰 **$3/1000 queries** after free tier
- 1000 free queries/month

---

## Testing Different Providers

```bash
# Test DuckDuckGo (free)
python web_search.py

# Test GitHub (free)
GITHUB_TOKEN=ghp_your_token python web_search.py

# Test Google (requires API key)
GOOGLE_SEARCH_API_KEY=your_key \
GOOGLE_SEARCH_ENGINE_ID=your_id \
python web_search.py
```

---

## When to Use Each Approach

### Use Knowledge-Based (Original Agent)
- ✅ Testing/demo purposes
- ✅ Budget constraints
- ✅ Researching well-known tools
- ✅ Fast prototyping

### Use Web-Browsing (Enhanced Agent)
- ✅ Production deployment
- ✅ Need latest tools (post-training cutoff)
- ✅ Verify tool existence
- ✅ Higher accuracy requirements

---

## Next Steps

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Test web search:**
   ```bash
   python backend/agents/enhanced_research_agent.py
   ```

3. **Switch to enhanced agent** in `api.py`

4. **Monitor costs** if using paid APIs

---

## Summary

**Original Agent:**
- LLM generates tool suggestions from memory
- No real web access
- Fast and cheap
- May include outdated/hallucinated tools

**Enhanced Agent:**
- Actually searches the web
- LLM analyzes real search results
- Slower but more accurate
- Discovers truly new tools

**Both are useful!** Choose based on your needs.

---

## GPT Model Updates

The research agents now use **GPT-4.1** (`gpt-4.1-2025-04-14`) from OpenAI:

**Why GPT-4.1?**
- Compatible with the `chat.completions` API used by the research agents
- Excellent performance for code research and tool discovery
- Proven reliability and stability

**Future GPT-5 Support:**
The model registry includes GPT-5 models (GPT-5-Codex, GPT-5) for future use. However, these models currently require the `v1/responses` API endpoint which is not yet supported by the OpenAI Python SDK's chat completions interface.

These models provide:
- Improved accuracy for discovering coding tools
- Better understanding of technical documentation
- Reliable JSON generation
- Enhanced code analysis capabilities

Models are defined in `backend/agents/model_registry.py` for easy updates.
