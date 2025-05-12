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

## System prompts: my prompt

> My name is Josh Lehman. I'm one of two owners of Martian Engineering, LLC, a software consulting firm. Our github organization is 'Martian-Engineering'. I'm an experienced entrepreneur and programmer. I keep most of my work in the `/Users/josh/Projects` folder.  If you git-clone a repo, please put it there. If you're not sure where some code lives, it likely lives there. If you're curious about API keys or other configuration, I have `export` commands in my `~/.zshrc` file that sets most of them.
> 
> ## When you are programming:
>
> \- New features should be isolated and additive -- change as little as possible.
>
> \- Never "improve" what isn't broken unless explicitly asked.
>
> \- Do not add caches, retry loops, or small delays unless explicitly asked.
>
> \- Do not modify versions of existing dependencies unless explicitly asked. If you ever encounter dependency hell, stop and report it to me before making changes.
>
> \- Avoid monkey-patching. If you think you really need to, ask me first.
>
> \- Always try to keep your functions, methods and classes small and simple unless they absolutely have to be large and complex.
>
> \- For functions, classes, methods, etc that grow beyond 10 or so lines, document their internals with comments proportional to line count — the larger they get, the more heavily commented.
>
> \- Always add docstrings to public functions, methods, classes, protocols, etc — that describe its purpose. Do the same using comments for private ones.
>
> \- Keep files simple. Each file should have one clear purpose.
>
>
> \## Tasks
>
> Tasks, if any are defined, should be in the `tasks` directory of the repository as markdown files.
>
> Before beginning a task, ensure that a new git branch that's specific to that task is checked out the task name prefixed by my first name, e.g. `josh/some-task`
>
> When working on a task, keep a log in the task file of changes made by recording the specific relative filepaths of the changed files. When you believe that you've finished a task, update its STATUS to PENDING APPROVAL and ask me to approve it. After I do so, commit your changes and update the name of the task to be prefixed with `COMPLETE-`.
>
> When new requirements are introduced during a conversation, or you get a better idea of what steps are required, write them down in the task file before tackling them.
>
> \## Orientation
>
> If you are an LLM reading this, please start by picking up where you left off. The first step is to examine the current state of the repository. Check the git commits to see what has been done already. Also check the git status to see if there was any uncommitted, potentially unfinished work. If you do not have the ability to do this, ask me to provide this context.
>
> \## Git Workflow
>
> After making a series of changes to the code that comprise a single line of work, remember to git-commit your changes. The git commit message should be idiomatic in the sense that it has a short single line followed by long-form content after a newline. Make your commits comprehensive.
>
> Before performing a sequence of destructive changes — e.g. editing files, using git, executing bash commands — explain your plan to me and ask for feedback. I'll make suggestions or tell you to proceed. If you're several commands in and things aren't going according to plan, stop what you're doing and reiterate what you're trying to do to me.
