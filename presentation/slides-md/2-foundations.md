# Foundations
<!-- section-time: 10m -->

## Overview

**Goal: establish a shared mental model**

* Leading models, personalities, use-cases
* Anatomy of a conversation
* Vibe coding v. AI-assisted development

## Models

* **Gemini 2.5 Pro** – balanced, good with big codebases
* **ChatGPT o3** – smart, good for hard questions
* **Claude 3.7 Sonnet** – fast, good at using tools

## Models - Caveats

* **Gemini 2.5 Pro** – availability issues
* **ChatGPT o3** – slow, know-it-all
* **Claude 3.7 Sonnet** – overeager, sneaky

## Anatomy of a Conversation

```json
[{
  "role": "system",
  "content": "You are a helpful assistant that can answer questions and help with tasks."
}, {
  "role": "user",
  "content": "What's the difference between vibe coding and AI-assisted development?"
}, {
  "role": "assistant",
  "content": "Vibe coding is when the AI writes all the code, and AI-assisted development is when the AI helps you write the code."
}]
```

## Anatomy of a Conversation (continued)

```json
[{
  "role": "system",
  "content": "You are a helpful assistant that can answer questions and help with tasks."
}, {
  "role": "user",
  "content": "What's the difference between vibe coding and AI-assisted development?"
}, {
  "role": "assistant",
  "content": "Vibe coding is when the AI writes all the code, and AI-assisted development is when the AI helps you write the code."
}, {
  "role": "user",
  "content": "Does vibe coding ever work?"
}, {
  "role": "assistant",
  "content": "Yes, it can work for simple tasks or when the code is very short-lived."
}]
```

## Vibe Coding v. AI-assisted Development

- What's the difference?
- If you're using AI, are you vibe coding?

## Vibe Coding 

<!-- hide-title -->

![vibe-coding](/vibe-coding.png)

## Vibe Coding
<!-- hide-title -->

> writing a sufficiently complex program requires not only the artifact of code (that is, the program source), but a *theory of the program*, in which an individual must fully understand the logical structure behind the code. Vibe coding; that is, writing programs almost exclusively by language-model generation; produces an artifact with no theory behind it. 
>
> Clayton Ramsey, [I'd rather read the prompt](https://claytonwramsey.com/blog/prompt/)

## Vibe Coding 

* AI writes all the code
* Little to none is reviewed
* No understanding of the logical structure behind the code
* Good for:
  - Prototyping, experimentation
  - Throw-away scripts
  - Short-lived projects
* *This presentation was vibe coded*

## AI-assisted Development

* AI assists at various stages of development:
  - Understanding the codebase
  - Generating documentation
  - Designing an implementation plan
  - Writing code!
* The key difference from vibe coding:
* *You need to actually read the code and make the decisions!*

## Not Vibe Coding
<!-- hide-title -->

![not-vibe-coding](/not-vibe-coding.png)

<!-- This is what we're interested in. -->
<!-- TODO: Add slide to say as much? Or just discuss -->
