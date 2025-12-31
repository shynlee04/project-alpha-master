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
