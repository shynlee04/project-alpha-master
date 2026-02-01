# Schema and data types vs flow:

So these are issues are you can see with the recent hiccups when designing architectural refactor for the current codebase → and there are certain concerns here  that really require critical thinking deep research and expert viewpoints of best practice and corporate-level growth - if these are  not clear up there will be blockings after blockings, confusions stacked up.

## Terminologies purification does not resolve the complete root-cause (the before vs. now still in confusion vs. how it should)

Ok let’t have a table to clear things up → these are just what I think it should; but you then must always be expert of the field → so be straight forward but analytical; and you must also deeply understand the scopes of the project.  The recent [new-fundamental-truth.md](http://new-fundamental-truth.md) I think also was created under this shallow thinking narrow-mindedness. As a community-project but I do not compromise the following visions:

1. **Client-side as for privacy:**  unless it is from AI-related services → no client data should be sent to my server. And as also for the stacks used in this project, they are allow to make CRUD operations as long as they stay within the client’s environments and with their clear permissions.
2. **Optimal user experience**: there will be these areas to look into as to weight your  reasoning of balancing between “this is a community project” vs. “over complications” vs. “extensibility” vs. “sustainability” vs. “common senses” vs.  “maintainability”. The below examples show clear what these mean:
    1. The 7-day Safari browser’s policy stuff → People can download Chrome even using Mac (it is a common sense and people are not that retarded to demand for everything gets to be served)
    2. The “I want them all though I am using a smartphone” → do not compromise anything as stuttering services to try offering what not performant (like IDE features) to Non-PC users → that’s why decisions for clear path between 2 types of devices
    3. The over-security that  block → such as vault of key → do not because of over-security  compromise reactive, persistent across layers. This kind of overcomplicated stuff block user experience to an extent that key is not able to be activated when needed or having users to input it every time → users understand that if their devices’ browser got compromise because they are before any key leak is not because of the project itself)
    4. that similar annoying things in  can also be seen when permissions to file system get asked every time the browser refreshed
    5. a project file sync gets resynchronize from beginning every time the browser reloads is unacceptable
    6. Again the “I want them all features work miraculously synchronously though I load all 5 plugins in” → no you can’t (logics and boundaries → and for real-life use cases there are rare cases for such combination and some are just too demanding) → Because the project now loads plugins, if unclear data flow nor clear responsibilities nor clear pipelines → will crash, will difficult and cause confusion to AI agents developing this
    7.  trying to stuff features all at once to make data schema spaghetti → the plugins’ mindset and project-centric  (starting and managing users’ storage and assets and data flow) will no longer sustain nor extended up to a point in time. 
3. **Agentic features and usable RAG:** yes that is  core values and promises of the project → no agentic executions of tools (as users allow  agents’ permissions) and must get permissions every time will be out of the list; as for future roadmap if RAG is not able to retrieve text-based embedding files, no matter what devices → fail, so out of the list too   

### Briefing:  still many things to concern so load the package.json plus what I said above as for research

- Project runs on 100% client-side browser (except AI related - as for BYOK through vault - but making call to AI providers) and through browser - via a deployment to Vercel
- Architecture of storage types → PC = file system (with dexiedb as layer to persist snapshot) + browserDB for other non-PC (as also using Dexiedb). The may cause confusion
- The project framework is Tanstack Start
- I am using Tanstack AI SDK as for client-side toolings support → though Vercel AI SDK is alluring for agentic features → but consider extensibility and sustainability as for not offering mix of two there will be so many concerns → if Vercel AI SDK can’t complete its job for client-side visions then don’t

| **Field of concerns** | **Before** | **Now** | **what should be (as for what I think → your suggestions?)** | **Note** |
| --- | --- | --- | --- | --- |
| the id and terminologies cause confusion when shifting from work-space centric to project-centric | routing and id of the project  bind to workspaces → fragmented, unclear, hard to manage | though practicing this there are still routing confusion - wanting clear contracts as for starting point is always from the project hence id of the project  → still finding confusing contracts and logics  | What is your suggestion as this should be → this is caused by not clear understanding and as for relationship of this entity and data flow toward plugins as I show below  |  |
| Schema and types interfaces as for the confusion designs of what called “plugins”  | as said above it was workspace-specific so this is not very cleaned as for same-feature get appears in multiple spaces as these grow  | get to plugins offering features → think they are cleaner but they don’t really as for not engineer the plugins’ schema, define data pipelines and not clear boundaries and these plugins coordination.  Another thing is that what is a plugin is very much a mess → take `Note plugin` for example. this use `block note` and in this there are individual multimodality AI features as both input and output | For me getting clear boundaries, coordination between plugins , data pipelines, define plugins’ responsibilities as for coordination are all good but not enough → this is for the understanding that for extensibility, sustainability and maintainability if every plugin has all sort of different schema interfaces and not engineering toward schema relationships → this is still an uncleaned approach   | This needs a really look into as the below grows in complexity |
| The devices’ architecture differences (PC and Non-PC)  | letting too many fallback and temporary resolution patches | trying to stay clear but as for all of the above confusion → still absolutely dirty | the regulation, logics and permissions to allow client load which plugins based on their device → but then this will go with many adjustment and must be done altogether as for decisions need to be made to complete refactor not accepting any apologetic patches just because the project has progressed to XYZ stages |  |
| Agentic features + RAG → these features (Agentic toolings and tools execution CRUD permissions)  most take place around the chat cascade and chat thread management → though look like so but not truly as for `threads` are the indexed and relationships to per project; whatever show on chat cascade are more rendering >>> true CRUD are to the project’s storage asset. | as this chat platform appears multiple and unregulated in workspaces → I started to feel something is not very sound here | Want to regulate this as for the complexity grows of plugins and for clearer and less confusing when set up plugins coordination as said in above part →  I want to set the starting point for “file-tree as also for project management” as starting point → so this is always loaded when user enter to their project (projectid routing). And to handle clean as for how close-knit this and the `chat-cascade-and-thread-management` seem to be → this chat should also a plugin to load always   | but now it is still get confused by AI agents developer for this project >>> as you can see through EPIC-UXUI-03- and EPIC-UXUI-04 trying to design the `drag-and-drop` layout to load plugins into → but all fails desperately  causing more trash (redundancy and conflict rather than anything) and as for this with what I mentioned above) though trying to regulate things like not allowing same plugin loaded or no more than plugins loaded, and make activity bar as plugins toggle but all no use |  |
| Efforts of staying cleaned architecture require me to regulate and refactor AI-related endpoints  | very fragmented and spontaneous as making all sort of endpoints everywhere | trying to but has not done anything yet as my mindset of isolate concerns to gradually process | What is your suggestion here → because as Tanstack AI SDK centralization is my approach which means this is must be structured  to handle different AI provider endpoints (not making direct AI-provider using their SDK  which causes to many concerns) | again unless the above stuff gets their set up, this can obtain with cleaned conditions |
| Other stuff like states, persistent, database models, file system eventbus, etc are pretty much the consequences of the above  |  |  |  |  |

 what about the terminologies that may cause confusion of `plugins` >>> because not all plugins are lenses. As, for examples, notes, terminal of webcontainer, and even the filetree that I bundle it to the interface that user will then hot load between projects, CRUD project creations and operations and as for how filetree can also CRUD operate files that synchronized and saved to client’s file system; as so the chat-cascade ones though it is as said “Agentic features + RAG → these features (Agentic toolings and tools execution CRUD permissions)  most take place around the chat cascade and chat thread management → though look like so but not truly as for `threads` are the indexed and relationships to per project; whatever show on chat cascade are more rendering >>> true CRUD are to the project’s storage asset.” >>> still make new files or move files in project  >>>  and as I have mentioned  them all above these `two` plugins are loaded always 

Ok though I know that getting all over complicated can be harsh but are there any fail-safe or early notice as so not getting into to oops-I-did-fuck-up latter. However there are these few other concerns and I think would also impact the architecture and these schema relationships if not foresee and be much thoughtful. That are:

- the RAG area → as for when allowing user embedding and index their asset in project → and as the AI agents are given agentic permissions CRUD and RAG retrieve these → the chat cascade plugin will “show” this → but then how about the database
- at as this scope to `thread management` of the same plugin (this is also bundled interface into that chat-cascade plugin) → as thread is indexed and is having relationship per project → as for given RAG AI agent can retrieve past chat session of the project → again another database schema

oh then another thing is (this is my unknown zone) → the tools as for giving agentic features and CRUD for AI agents they are another set of schema too? are they have any sort of relationships here.
---
So before really can do anything with this project I need you to base on my following events description and get all research, and core governance documents as well as the controlled entities validated, checked across one another as well as the issues I mentioned → prevent total context poisoning (as for this project is highly and concerning context polluted).

1. At first when intend to plan for this project cleaned architecture refactor → I have planned these phases and the AI agent has completed a few → From few hiccups of still there are poisoned context causing legacy architecture still get in implementation → I paused and try to do correction by telling the AI agent → the phase planning 02-03-REVISED → However, I recognize this is not simply just terminologies clear up, a few clean up phases would help. Evidences are AI agent still not getting the larger picture here from the perspective of these schema relationships

```markdown
## These are planning and implementation up to the point above I said 

/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/01-state-architecture-contracts
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/01-state-architecture-contracts/01-01-PLAN.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/01-state-architecture-contracts/01-01-SUMMARY.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/01-state-architecture-contracts/01-02-PLAN.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/01-state-architecture-contracts/01-02-SUMMARY.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/02-schema-definitions
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/02-schema-definitions/02-01-PLAN.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/02-schema-definitions/02-01-SUMMARY.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/02-schema-definitions/02-02-PLAN.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/02-schema-definitions/02-02-SUMMARY.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/02-schema-definitions/02-03-A-SUMMARY.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/02-schema-definitions/02-03-PLAN-ORIGINAL-ARCHIVED.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/02-schema-definitions/02-03-PLAN-REVISED.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/02-schema-definitions/02-04-PLAN.md
/Users/apple/Documents/coding-projects/project-alpha-master/.planning/phases/02-schema-definitions/02-VERIFICATION.md
```

1. Then I draft this  up .planning/root-cause/root-cause-concerns-2026-01-31.md  to try to explain to the AI agent → conducting research → ok from now it is getting generation after generation without any backward checking , making point 3 and 4 below effort just adding more unconsolidated, conflicts with shallow understanding between these documents 

```markdown
.planning/research/ARCHITECTURE-2026-01-31.md
.planning/research/DOMAIN-MODEL-2026-01-31.md
.planning/research/FEATURES-2026-01-31.md
.planning/research/PITFALLS-2026-01-31.md
.planning/research/PLUGIN-CONTRACTS-2026-01-31.md
.planning/research/PLUGIN-GOVERNANCE-2026-01-31.md
.planning/research/RAG-TOOLS-FAILSAFE-2026-01-31.md
.planning/research/ROADMAP-REVISED-2026-01-31.md
.planning/research/SCHEMA-ARCHITECTURE-2026-01-31.md
.planning/research/STACK-2026-01-31.md
.planning/research/SUMMARY-2026-01-31.md
```

1. As said above this step 3 is when I mentioned this is still not enough → so I made this to remind it and ask for research → more research append into above list (and there are some other updated to core governance documents too after this >>> but they are totally untrusworthy)

```markdown
what about the terminologies that may cause confusion of `plugins` >>> because not all plugins are lenses. As, for examples, notes, terminal of webcontainer, and even the filetree that I bundle it to the interface that user will then hot load between projects, CRUD project creations and operations and as for how filetree can also CRUD operate files that synchronized and saved to client’s file system; as so the chat-cascade ones though it is as said “Agentic features + RAG → these features (Agentic toolings and tools execution CRUD permissions)  most take place around the chat cascade and chat thread management → though look like so but not truly as for `threads` are the indexed and relationships to per project; whatever show on chat cascade are more rendering >>> true CRUD are to the project’s storage asset.” >>> still make new files or move files in project  >>>  and as I have mentioned  them all above these `two` plugins are loaded always 

Ok though I know that getting all over complicated can be harsh but are there any fail-safe or early notice as so not getting into to oops-I-did-fuck-up latter. However there are these few other concerns and I think would also impact the architecture and these schema relationships if not foresee and be much thoughtful. That are:

- the RAG area → as for when allowing user embedding and index their asset in project → and as the AI agents are given agentic permissions CRUD and RAG retrieve these → the chat cascade plugin will “show” this → but then how about the database
- at as this scope to `thread management` of the same plugin (this is also bundled interface into that chat-cascade plugin) → as thread is indexed and is having relationship per project → as for given RAG AI agent can retrieve past chat session of the project → again another database schema

oh then another thing is (this is my unknown zone) → the tools as for giving agentic features and CRUD for AI agents they are another set of schema too? are they have any sort of relationships here.
```

1. After 3 I made another point of concern → making it added more to research and revision of ROAD → but these are just more unconsolidated, overlapping, and conflicts pieces without cross checks and more of the poison. Point I made was

```markdown
Ok though I know that getting all over complicated can be harsh but are there any fail-safe or early notice as so not getting into to oops-I-did-fuck-up latter. However there are these few other concerns and I think would also impact the architecture and these schema relationships if not foresee and be much thoughtful. That are:

- the RAG area → as for when allowing user embedding and index their asset in project → and as the AI agents are given agentic permissions CRUD and RAG retrieve these → the chat cascade plugin will “show” this → but then how about the database
- at as this scope to `thread management` of the same plugin (this is also bundled interface into that chat-cascade plugin) → as thread is indexed and is having relationship per project → as for given RAG AI agent can retrieve past chat session of the project → again another database schema

oh then another thing is (this is my unknown zone) → the tools as for giving agntic features and CRUD for AI agents they are another set of schema too? are they have any sort of relationships here.

```