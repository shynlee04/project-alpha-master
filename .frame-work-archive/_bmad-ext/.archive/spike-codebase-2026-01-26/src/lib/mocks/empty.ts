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
    Uri: { parse: () => { } },
    // Mermaid mock methods
    initialize: () => { },
    render: async () => ({ svg: '' }),
};
export const BlockNoteView = () => null;
export const useCreateBlockNote = () => ({});
export const SuggestionMenuController = () => null;
export const SideMenuController = () => null;
export const useSelectedBlocks = () => ({});
export const DragHandleMenu = () => null; // preemptive addition
export const filterSuggestionItems = () => [];
export const getDefaultReactSlashMenuItems = () => [];
export const useBlockNote = () => ({});
export const getBlockNote = () => ({});
export const createReactBlockSpec = () => (() => ({}));
export const defaultProps = { textAlignment: 'left' };
export const BlockNoteSchema = { create: () => ({}) };
export const defaultBlockSpecs = {};

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
export const ReactFlowProvider = ({ children }: { children?: React.ReactNode }) => children;
export const useReactFlow = () => ({});
export const useNodes = () => [];
export const useEdges = () => [];
export const useStoreApi = () => ({});
export const Background = () => null;
export const Controls = () => null;
export const MiniMap = () => null;
export const Panel = ({ children }: { children?: React.ReactNode }) => children;
export const Handle = () => null;
export const BaseEdge = () => null;
export const EdgeLabelRenderer = ({ children }: { children?: React.ReactNode }) => children;
export const Position = { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' };
export const applyNodeChanges = () => [];
export const applyEdgeChanges = () => [];
export const addEdge = () => [];
export const NodeResizer = () => null; // Mock for removed v12 component (SSR compatibility)
export const MarkerType = { Arrow: 'arrow', ArrowClosed: 'arrowclosed' };
export const BackgroundVariant = { Dots: 'dots', Lines: 'lines' };

// React Flow utility function mocks (SSR compatibility)
export const getBezierPath = () => ['', '', ''];
export const getSmoothStepPath = () => ['', '', ''];
export const getMarkerEnd = () => undefined;
export const getEdgeCenter = () => ({ x: 0, y: 0 });
export const calcNextPosition = () => ({ x: 0, y: 0 });

// React Flow type mocks (SSR compatibility)
export type Node = any;
export type Edge = any;
export type Viewport = any;
export type NodeTypes = any;
export type EdgeTypes = any;
export type NodeProps = any;
export type EdgeProps = any;
export type OnNodesChange = any;
export type OnEdgesChange = any;
export type OnConnect = any;

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
// D3-shape symbols (for recharts compatibility)
export const symbol = () => ({ size: () => symbol(), type: () => symbol() });
export const symbolCircle = { draw: () => { } };
export const symbolCross = { draw: () => { } };
export const symbolDiamond = { draw: () => { } };
export const symbolSquare = { draw: () => { } };
export const symbolStar = { draw: () => { } };
export const symbolTriangle = { draw: () => { } };
export const symbolWye = { draw: () => { } };
export const curveBasis = () => { };
export const curveLinear = () => { };
export const curveStep = () => { };

// Recharts mocks
export const LineChart = () => null;
export const Line = () => null;
export const BarChart = () => null;
export const Bar = () => null;
export const PieChart = () => null;
export const Pie = () => null;
export const Cell = () => null;
export const Sector = () => null;
export const XAxis = () => null;
export const YAxis = () => null;
export const CartesianGrid = () => null;
export const Tooltip = () => null;
export const Legend = () => null;
export const ResponsiveContainer = () => null;
export const AreaChart = () => null;
export const Area = () => null;
export const ScatterChart = () => null;
export const Scatter = () => null;

// Transformers.js Mock
export const pipeline = async () => (() => []);
export const env = { allowLocalModels: false, useBrowserCache: false };
export const AutoModel = { from_pretrained: async () => ({}) };
export const AutoTokenizer = { from_pretrained: async () => ({}) };

// ONNX Runtime Mock
export const InferenceSession = {
    create: async () => ({
        run: async () => ({}),
    }),
};
export const Tensor = class {
    constructor() { }
};

// PDF.js Mock
export const getDocument = () => ({
    promise: Promise.resolve({
        numPages: 0,
        getPage: async () => ({
            getTextContent: async () => ({ items: [] }),
            getViewport: () => ({ width: 0, height: 0 }),
            render: () => ({ promise: Promise.resolve() }),
        }),
    }),
});
export const GlobalWorkerOptions = { workerSrc: '' };
