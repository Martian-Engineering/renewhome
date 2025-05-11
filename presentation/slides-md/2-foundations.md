# Foundations

<!-- TIME: 10 minutes total -->

## Overview

**Goal: establish a shared mental model**

* Leading models, personalities, use-cases
* Anatomy of a conversation
* Context management

## Models: Personalities
<!-- hide-title --> 

![](/personalities.png)

## Models: Personalities

* **Gemini 2.5 Pro** – smart, TODO: Ted
* **o3** – slow, very smart, requires lots of context
* **Claude 3.7 Sonnet** – fast, excels at tool use, may rewrite React from scratch if you don't watch it closely

## Models: Use Cases

* **Gemini 2.5 Pro** - Day-to-day work with complex codebases
* **o3** - Solving tough problems given copious context
* **Claude 3.7 Sonnet** - Vibe coding, agentic workflows

## Anatomy of a Conversation

<!-- A mermaid diagram showing a richer conversation flow -->

```mermaid
graph TD
    SP["System Prompt"] --> UI1["User Input"]
    UI1 --> AO1["Assistant Output"]
    AO1 --> UI2["User Follow-up"]
    UI2 --> AO2["Assistant Response"]
    
    EXT["External Tools/Knowledge"]
    MEM["Conversation Memory"]
    
    AO1 --- EXT
    AO2 --- MEM
```

## Context Management

```mermaid
graph TD
    A[LLM Model]
    
    SP[System Prompt]
    UI1[Current Query]
    H1[Recent History]
    H2[Older History...]
    
    T1[External Tools]
    K1[Knowledge Base]
    
    SP --> A
    UI1 --> A
    H1 --> A
    H2 --> A
    
    A --> T1
    A --> K1
    
    A --> Response
```