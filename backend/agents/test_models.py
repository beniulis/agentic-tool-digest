"""
Quick test script to verify model registry integration
"""

from model_registry import (
    AVAILABLE_MODELS,
    get_code_research_model,
    get_default_model,
    resolve_model_id,
    DEFAULT_MODEL_KEY,
    CODE_RESEARCH_MODEL_KEY
)

def test_model_registry():
    """Test that model registry is properly configured"""

    print("=" * 60)
    print("Testing Model Registry")
    print("=" * 60)

    # Test 1: Check available models
    print(f"\nFound {len(AVAILABLE_MODELS)} available models:")
    for key, meta in AVAILABLE_MODELS.items():
        print(f"   - {key}: {meta['id']}")

    # Test 2: Check default models
    print(f"\nDefault model key: {DEFAULT_MODEL_KEY}")
    print(f"   Model ID: {get_default_model()}")

    print(f"\nCode research model key: {CODE_RESEARCH_MODEL_KEY}")
    print(f"   Model ID: {get_code_research_model()}")

    # Test 3: Verify GPT-5 models are present
    assert "GPT-5" in AVAILABLE_MODELS, "GPT-5 model not found!"
    assert "GPT-5-Codex" in AVAILABLE_MODELS, "GPT-5-Codex model not found!"

    print("\n[PASS] All tests passed!")
    print("\n" + "=" * 60)
    print("Model Configuration Summary")
    print("=" * 60)
    print(f"Default research model: {get_default_model()}")
    print(f"Code-focused model: {get_code_research_model()}")
    print("\nThese models will be used in:")
    print("  - research_agent.py (discovery, enrichment, curation)")
    print("  - enhanced_research_agent.py (web search analysis)")

if __name__ == "__main__":
    test_model_registry()
