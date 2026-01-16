1. 
    1. are of the core and centralized groups: aka the managing and directing most flows and journeys of the users
        1. The BYOK - the vault of key will get to persist and conditionally used to different endpoints of providers and of the use cases
        2. the `project space` → this must be make very clear boundaries - routing - naming ID - flow and redirecting vs other components states and stores too as the concern of tjhe infrastructure differences → this is going to be the first unbinding knot to resolve everything else → so making any scan (for this I am going to pass to architect first then analyst for research confirming the best-in-class not just because you or I think it works) → these are entrance the use get into the workspaces (ide, note offering them features that they expected)
            1. From entry of homepage we have these matrix → user of desktops vs. other devices vs new or returned (with created project) → they can entry from any from the homepage but all must satisfy the following
                1. there is no entering workspace - note or ide if not having at least a project → show toast conditionally and correctly per the above matrix → for example I returned I am using my desktop choices for me are  → create a new or select from a list of project -aka as for other devices user → there is no list selected but they got to create a project first → show them the creation wizard 
                2. ide is not the route for any devices but desktop → show the toast saying they must use desktop
                3. From the entry → list of project created → choice of entering the space type → dexiedb will  not enter ide (must make this clear) 
                4. at once both id (project) and workspace are both met → users expected to get to the intended workspace must make a direct land, no other second step needed
                5. project selection when within workspace must hoatload and reactive
                6. The no compromise between devices (except for NOT-desktop device NO entry to IDE with clear note)
            
            as above said this involves the CRUD permissions to both human and AI agent → and as they are synced to filesystem →  unstable state as now will collapse all bellow level features as just now your back and forth struggling and we handle this as this - but the thing is we lack addressing this the whole project level
            
        3. The agents Vs. LLMs → as these are centralized for managements but when under the following factors and under certain workspaces , as these concepts activated → agents will behave, gain certain permissions, interact with users through out putting to those different environment
            1. system instruction prompts → two layers the orchestrator layer that conversational and detecting the user intention + workspace-specific → auto switch to `mode` → mode though naturally converse with user it will decide executing tools on focus groups (tools are described below) → not that it is unable to use other tools (if explicitly requested but it will more focus on the 5-6 targets)
            2. tools - these are a lot and connected to various parts → as `AI agents` (YOU as i will refer to not to be mistaken with the concepts of the project) encounter these → you must make logic of their intricate relationship for the above mentioned → tools also get to me as the concerns for its actual CRUD if given permissions →  and if they are able to execute agentic multi-step using tool and thinking on the tools’ errors (to facilitate one-shot app building ai agent for example)
            3. The RAG → this is also my concerns as for the infrastructure and use cases → as for both browser vector db and as for local embedding and chunking models (of different types of resources) vs the gemini gema3 etc
            4. the multimodality for in and out put → these also major concerns as they output to different features across workspaces and they also consume (input) by either features (like commands of notebook) and also by ai agents
        4. is it of the cascade and thread managed chat flow → this is like the gate to agents and we use it across workspace it is verstile as it has threads to be managed and later RAG
    2. of which workspace - is it cross-workspace  → their current mapping, entry points - routing → perpetuate the users use cases
    3. as for the rest of the other work-space specific features I think they are more like the environment to the above to either manage or output  renderer → to manage, show, sort data of all sorts that presentable to end-users 

===

## Keywords as checklist for the project’s fundamental truths

1. Client-side 100% - server call is only from llms and other API providers as services  - access through browser 
2. BYOK → Tanstack AI SDK , Framework Tanstack Start → key are passed to agent → reactive at space key saved at vault
3. project id , multiple projects → across workspaces (ide, notes - knowledge and study are disabled for MVP)
4. desktops = fsa ; indexdb (dexie) = the other devices >> NO IDE FOR OTHER DEVICES
5. The thread managements - chat cascade → threads and conversation are managed for RAG purposes and they are tied to project as for which space the conversation is used → this needs both id project and space for references
6.  similar user experiences (states, hotload, persistence) - 
    1. For FSA —+ not too much compromise (waiting to resync all over everytime, no reload or lose state for fsa - as permissions must persist) - also as now for FSA when using block notes render dot md files → what about other file types
    2. For other devices → any RAG, agentic, tools uses conflict
    3. CRUD permissions from agents → Both any conflict 
    4. RAG → both any conflict? 
    5. muti-modality → both input and output → access conflict too
7. Permissions to agents through tools (CRUD toggle, on files)
8. Rendering on workspaces and the chat cascade of different types (file types and generation from AI agent)
9. clear boundaries between when Zustand - when Dexie - pretty much stores are created without any clear boundaries nor connection
10. all the hooks, hydration rerouting with id and reactive -persistence
11. NEED research = if there are needs to use dexiedb to assist fsa for persistence or reactive → if yes refactor and reorganize with stores
12. Addressing edge cases - one example agent CRUD when human edit on file
13. Any gaps detected

====