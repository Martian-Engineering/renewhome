New: AI-Assisted Development in Practice

* **Welcome (5m):** AI’s role in daily development work  
  * Quick intros  
    * What we’ve used AI for  
  * Talk outline  
  * This presentation was built with AI  
* **Foundations (10m):** Build a mental model for effective AI-assisted development  
  * Models: overview of the characters, show stats like context windows  
    * As of today, we use these  
      * Gemini 2.5 Pro  
      * Claude 3.7 Sonnet  
      * o3  
  * Anatomy of a conversation  
    * System prompts  
    * User v. Assistant flow  
    * Managing context  
      * Keep the conversation focused — too much context \= bad  
      * LLMs get confused the further into the context you go, even when they’re supposed to be able to handle it  
  * System prompts  
    * Walk through our prompts  
      * About the user  
      * General programming guidelines  
      * General sysadmin guidelines  
      * Tools & shell  
      * Git workflow  
* **Extending with MCP (10m):** Learn to equip your workflow with tools and see some in action  
  * Brief overview of Model Context Protocol: plugin system for LLMs  
    * Servers v. Clients  
    * **Tools**, resources, prompts  
  * Useful MCP Servers  
  * Demo  
* **Best Practices (10m):** Concrete lessons that save time and avoid pain  
  * Don’t offload your thinking  
    * Write detailed specifications  
    * Workshop your ideas with AI before writing code  
      * AI is an excellent rubber duck  
    * For serious work, constantly review AI-generated code  
  * Git is essential  
    * Don’t let AI mangle your code  
      * Use branches  
      * Commit frequently  
    * Leverage AI to git effectively  
      * Writing commits  
      * Interactive rebases  
      * Reviewing diffs  
    * AI generates code fast — don’t be afraid to throw it away and start over  
  * Put in work to reduce friction  
    * Instruct the LLM to run verification scripts, like linting  
    * Instead of copying and pasting error messages, use Cursor agent mode or Claude Code  
    * Keep important docs in context, maybe even in the repo  
    * Get the AI to run shell commands for you  
    * Set up MCP Servers  
  * Get AI to do your grunt work  
    * Don’t like writing documentation?   
    * Can’t remember all the flags for `tar`?  
    * Large refactoring  
    * Lots of boilerplate  
* **Live Demo (10m):** Tie everything together and build something  
  * Combine everything we’ve learned so far by building a new feature into the presentation  
* **Hands-on Lab (15m):** Configure your environment (VS Code)  
  * Define a system prompt  
  * Add some MCP servers  
  * Experiment\!  
* **Wrap up, Q\&A (15m):** Q\&A, Next steps, resources.

* Brain Dump of AI development-related topics  
  * AI 101  
    * System prompts  
    * Overview of models: strengths & weaknesses  
      * 3.7 Sonnet: some personality flaws, great at tool use  
      * Gemini 2.5 Pro: super smart, big context, not as good at tools  
    * Using tools  
    * MCP  
  * Working with MCP  
    * [https://github.com/makenotion/notion-mcp-server](https://github.com/makenotion/notion-mcp-server)  
    * [https://github.com/github/github-mcp-server](https://github.com/github/github-mcp-server)  
    * [https://github.com/awslabs/Log-Analyzer-with-MCP](https://github.com/awslabs/Log-Analyzer-with-MCP)  
    * [https://github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)  
  * Philosophy of How to Use AI Effectively  
    * Don’t offload the thinking – think harder  
    * Context Management – everything relevant, nothing irrelevant  
    * Write detailed specifications, offload execution  
      * Converse with AI like a colleague  
      * When presented with gruntwork, reach for the AI first; for something difficult or nuanced, treat it as a rubber duck  
    * Remember AIs are often wrong, so check their output  
    * Don’t be afraid to start over — code is cheap  
      * Git is your friend  
    * AI is a good starting point for many tasks  
      * Get a skeleton of an app 
      * Get a document outline  
      * First draft of a report  
    * Don’t lose the theory of the program  
    * Constantly be reviewing  
      * It’s tempting to turn on “auto-accept” in agent mode and let it blitz through massive chunks of code  
      * For more difficult work, be in a constant code review loop  
      * Read every line of code, offer granular comments  
      * Keep in mind the AI’s character flaws:  
        * Often overengineers problems  
        * Can latch on to some little thing you mentioned offhandedly  
        * Loves to add timeouts, retries, and caches instead of solving a problem  
    * Put in work to reduce friction  
      * Take the time to define good system prompts
      * Instruct the LLM to run verification scripts, like linting  
      * Instead of copying and pasting error messages, use Cursor agent mode or Claude Code  
      * Keep important docs in context, maybe even in the repo  
      * Get the AI to run shell commands for you  
      * Consider building or using an MCP server for repeated access to any service  
        * Search logs  
        * Construct and run database queries  
        * Make API requests (or have it use curl)  
    * Harm reduction  
      * Use sandboxed environments for agentic AI  
        * Git  
        * Docker  
        * Python virtualenvs  
      * Modify the system prompt  
        * Tell it what not to do  
        * Keep it a living document; adjust it whenever the AI pisses you off or you wish it knew something  
        * Personalize it  
          * Tell it what you like and don’t like  
          * Tell it where your files are and any other relevant development practices  
          * Tell it how you prefer it to use (or not use) its tools  
      * Tell the AI not to perform any irreversible commands without checking with the user first  
        * Yell at it in all caps. This helps.  
  * Tips & Tricks  
    * Git  
      * Make it easy to throw away AI-generated code  
        * Use branches or worktrees  
        * Commit early and often  
          * Commit when it works, before refactoring  
      * Have the AI write the commit messages  
      * Use agentic AI (especially claude code) to set up development environments  
      * Consider feeding the git log to the AI for context, especially in case of a regression  
    * Cursor:   
      * Write a comment explaining what you want the AI to do  
      * Write a function with a type signature  
      * Pull in documentation and examples with ‘@’ and a URL  
  * Links for future reference  
    * [https://youtu.be/NMmDnYKD0fE?si=UwQgnIzAz3COVIp2](https://youtu.be/NMmDnYKD0fE?si=UwQgnIzAz3COVIp2)