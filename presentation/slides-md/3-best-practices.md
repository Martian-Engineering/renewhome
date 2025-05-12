# Best Practices 

## Overview

* Don't offload thinking
* Git is your friend
* Put in work to reduce friction

## Don't offload thinking

* **Planning:** Engage with AI like a colleague
* **Design:** Write detailed technical specifications
* **Implementation:** Review AI-generated code thoroughly

## Rubber Duck
<!-- hide-title -->

![rubber-duck](/rubber-duck.avif)

* Talk through your problem step by step
* Often you'll find the solution just by explaining it
* If not, at least you'll clarify your thinking

## Planning

> I've got an idea I'm trying to work out. I don't want you to write any code yet, just help me think through the design. If anything seems unclear, please ask me clarifying questions. Look for gaps in my thinking and help me fill them in. 
>

<!-- * It's okay to start with a vague idea
* AI's are great at unblocking ideas -->

## Planning

> I've got an idea I'm trying to work out. I don't want you to write any code yet, just help me think through the design. If anything seems unclear, please ask me clarifying questions. Look for gaps in my thinking and help me fill them in. 
>
> ...
> 
> **Look at `src/some/file.ts` and `src/some/other/file.ts` as a reference for our implementation -- these represent idiomatic uses of `some-library-or-framework-or-pattern` that we use in this project.**

## Planning

> I've got an idea I'm trying to work out. I don't want you to write any code yet, just help me think through the design. If anything seems unclear, please ask me clarifying questions. Look for gaps in my thinking and help me fill them in. 
>
> ...
> 
> **Let's capture a summary of what we discussed in a markdown file in the `notes/` directory of the project. Make sure to include code samples, references to relevant files, and context for our decisions.**

## Design

* Write a specification describing the work to be completed
* Include:
  * Context
  * Relevant files
  * Code samples
  * Step-by-step instructions
* Write like you're delegating to more junior engineer

## Sample specification

> **Concatenate Search Fields**
>
> There's a significant amount of overhead incurred in embedding search by embedding multiple fields in search schema documents.
>
> The specific search schema in question is `USASpendingAwardSearchSchemaBase` in repo/search/search/v2/schemas/usaspending.py. Three groups of fields could benefit from being concatenated into a single logical field:
>
> \- `recipient_location_*`: These fields could all be one logical `recipient_location_address` field, which contains a string that's been preconstructed.
>
> \- `place_of_performance_*`: Same idea as `recipient_location_*`
>
> \- `officer_name_*`: A single "officers" field with all officers comma-separated would suffice
>
> Your task is to amend the search schema and document such that these fields are collapsed, and ensure that the instantiation of any of these records populates these fields appropriately.

## Design: involve the AI

1. Write an outline of a spec with relevant context
2. Reference other documentation by path to markdown files
  - e.g. output from planning phase
3. Ask AI to review and enrich the spec

## Implementation: real-time code review

> Review the specification for the task at tasks/some-task.md and begin.

* Constantly review AI-generated code
* Question decisions
* Ask for changes

## Don't offload thinking

* Stay involved throughout the development process
* LLMs are great at writing consistently good code, but require guidance
* Use AI to help you think; not in place of thinking

## Git is your friend

* Make it easy to throw away AI-generated code
  * Code is cheap: throw it away and start over when stuck
* ALWAYS create a new branch before letting the AI make edits
* Commit frequently when code works
* Use the git log as context

## LLMs are good at git!

* Forgot how to do an interactive rebase? 
* Need to clean up history, or run a bisect?
* Work with the AI to understand git commands, feed it terminal output, provide context

## LLMs are good at git!

* Use Sourcegraph Cody to write commit messages from within VS Code

![cody-commit](/cody-commit.png)

## Put in work to reduce friction

* Take the time to define system prompts:
  * At the user level
  * At the repository level
* Let's walk through how to do this in VS Code

## Defining a user-level system prompt

![system-prompt-1](/system-prompt-1.png)
![user-system-prompt1](/user-system-prompt-1.png)
![user-system-prompt2](/user-system-prompt-2.png)

## Defining a repo-level system prompt

![system-prompt-1](/system-prompt-1.png)
![repository-system-prompt1](/repository-system-prompt.png)
![repository-system-prompt2](/repository-system-prompt-2.png)

## System prompts

* Elements of a good system prompt:
  * About the user and nature of their work
  * Coding preferences
  * Preferred toolchain
  * Common patterns
  * Repo-level: Reference relevant documentation to include in context
* `applyTo:` Use to apply special prompts to specific types of files