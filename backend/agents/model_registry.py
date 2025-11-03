"""
Central registry of supported OpenAI models for the research tooling.

Copied from migration_agent_UI_v1 for consistency across projects.
Each entry includes metadata describing which parameters are supported by
specific models.
"""

from typing import Dict, Any

AVAILABLE_MODELS: Dict[str, Dict[str, Any]] = {
    "GPT-5-Codex": {
        "id": "gpt-5-codex",
        "supports_temperature": False,
        "supports_top_p": False,
        "description": "Latest GPT-5 model optimized for code generation and analysis"
    },
    "GPT-5": {
        "id": "gpt-5-2025-08-07",
        "supports_temperature": False,
        "supports_top_p": False,
        "description": "Latest GPT-5 general-purpose model"
    },
    "GPT-5-Nano": {
        "id": "gpt-5-nano-2025-08-07",
        "supports_temperature": True,
        "supports_top_p": True,
        "description": "Lightweight GPT-5 model for fast inference"
    },
    "GPT-5-Mini": {
        "id": "gpt-5-mini-2025-08-07",
        "supports_temperature": True,
        "supports_top_p": True,
        "description": "Balanced GPT-5 model with good speed and quality"
    },
    "GPT-4.1": {
        "id": "gpt-4.1-2025-04-14",
        "supports_temperature": True,
        "supports_top_p": True,
        "description": "Enhanced GPT-4 with improved capabilities"
    },
    "GPT-OSS-120B": {
        "id": "gpt-oss-120b",
        "supports_temperature": False,
        "supports_top_p": False,
        "description": "Large open-source model (120B parameters)"
    },
    "GPT-OSS-20B": {
        "id": "gpt-oss-20b",
        "supports_temperature": False,
        "supports_top_p": False,
        "description": "Smaller open-source model (20B parameters)"
    },
}

# Default model for research tasks
# Using GPT-5 for enhanced research capabilities
DEFAULT_MODEL_KEY = "GPT-5"

# Recommended model for code-focused research
CODE_RESEARCH_MODEL_KEY = "GPT-5"


def get_model_entry(model_key: str) -> Dict[str, Any]:
    """Get model metadata by key"""
    if model_key not in AVAILABLE_MODELS:
        raise KeyError(
            f"Unknown model '{model_key}'. Valid options: {list(AVAILABLE_MODELS.keys())}"
        )
    return AVAILABLE_MODELS[model_key]


def resolve_model_id(model_key: str) -> str:
    """Get the OpenAI model ID for a given key"""
    return get_model_entry(model_key)["id"]


def model_supports_temperature(model_key: str) -> bool:
    """Check if model supports temperature parameter"""
    return get_model_entry(model_key).get("supports_temperature", True)


def model_supports_top_p(model_key: str) -> bool:
    """Check if model supports top_p parameter"""
    return get_model_entry(model_key).get("supports_top_p", True)


def get_default_model() -> str:
    """Get the default model ID for research tasks"""
    return resolve_model_id(DEFAULT_MODEL_KEY)


def get_code_research_model() -> str:
    """Get the recommended model ID for code-focused research"""
    return resolve_model_id(CODE_RESEARCH_MODEL_KEY)
