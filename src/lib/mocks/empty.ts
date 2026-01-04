export default {
    editor: {
        create: () => ({
            dispose: () => { },
            onDidChangeModelContent: () => { },
            getValue: () => '',
            setValue: () => { },
            layout: () => { },
            updateOptions: () => { },
            getModel: () => ({ dispose: () => { } })
        }),
        defineTheme: () => { },
        setTheme: () => { }
    },
    languages: {
        register: () => { },
        setMonarchTokensProvider: () => { },
        registerCompletionItemProvider: () => { }
    },
    Uri: { parse: () => { } }
};
export const BlockNoteView = () => null;
export const useCreateBlockNote = () => ({});
export const SuggestionMenuController = () => null;
export const filterSuggestionItems = () => [];
export const getDefaultReactSlashMenuItems = () => [];
export const useBlockNote = () => ({});
export const getBlockNote = () => ({});

// XTerm Mocks
export class Terminal {
    loadAddon() { }
    open() { }
    onData() { }
    dispose() { }
    write() { }
    clear() { }
    reset() { }
    resize() { }
    onResize() { }
}
export class FitAddon { fit() { } }

// Monaco Mocks (Named exports)
export const editor = {
    create: () => ({
        dispose: () => { },
        onDidChangeModelContent: () => { },
        getValue: () => '',
        setValue: () => { },
        layout: () => { },
        updateOptions: () => { },
        getModel: () => ({ dispose: () => { } })
    }),
    defineTheme: () => { },
    setTheme: () => { }
};
export const languages = {
    register: () => { },
    setMonarchTokensProvider: () => { },
    registerCompletionItemProvider: () => { }
};
export const Uri = { parse: () => { } };
export const KeyMod = { CtrlCmd: 0, Shift: 0, Alt: 0, WinCtrl: 0 };
export const KeyCode = { Enter: 0, KeyS: 0 };

// WebContainer Mock
export class WebContainer {
    static async boot() { return new WebContainer(); }
    fs = {
        readdir: async () => [],
        readFile: async () => new Uint8Array(),
        writeFile: async () => { },
        mkdir: async () => { },
        rm: async () => { },
    };
    spawn() {
        return {
            exit: Promise.resolve(0),
            output: { pipeTo: () => { } },
        };
    }
    mount() { }
    on() { }
    teardown() { }
}

// Cytoscape Mock
export const cytoscape = () => ({
    add: () => { },
    remove: () => { },
    nodes: () => ({ length: 0 }),
    edges: () => ({ length: 0 }),
    layout: () => ({ run: () => { } }),
    destroy: () => { },
    on: () => { },
    fit: () => { },
    center: () => { },
});
cytoscape.use = () => { };

// D3 Mocks
export const select = () => ({
    append: () => select(),
    attr: () => select(),
    style: () => select(),
    text: () => select(),
    on: () => select(),
    selectAll: () => select(),
    data: () => select(),
    enter: () => select(),
    exit: () => ({ remove: () => { } }),
    call: () => select(),
    node: () => null,
});
export const scaleLinear = () => ({ domain: () => scaleLinear(), range: () => scaleLinear() });
export const scaleBand = () => ({ domain: () => scaleBand(), range: () => scaleBand(), bandwidth: () => 0 });
export const line = () => ({ x: () => line(), y: () => line(), curve: () => line() });
export const arc = () => ({ innerRadius: () => arc(), outerRadius: () => arc() });
export const pie = () => ({ value: () => pie() });
export const hierarchy = () => ({ sum: () => hierarchy(), sort: () => hierarchy() });
export const treemap = () => ({ size: () => treemap(), padding: () => treemap() });
export const zoom = () => ({ on: () => zoom(), scaleExtent: () => zoom() });
export const drag = () => ({ on: () => drag() });

// React Flow Mocks
export const ReactFlow = () => null;
export const useReactFlow = () => ({});
export const useNodes = () => [];
export const useEdges = () => [];
export const Background = () => null;
export const Controls = () => null;
export const MiniMap = () => null;
export const Handle = () => null;
export const Position = { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' };

// Sharp Mock
export const sharp = () => ({
    resize: () => sharp(),
    toBuffer: async () => Buffer.from([]),
    metadata: async () => ({}),
});

// KaTeX Mock
export const katex = {
    render: () => { },
    renderToString: () => '',
};
export const renderToString = () => '';
export const render = () => { };

