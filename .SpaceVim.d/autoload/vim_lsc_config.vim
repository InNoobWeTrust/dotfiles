func! vimm_lsc_config#after() abort
    let g:lsc_server_commands = {'dart': 'dart_language_server'}
    let g:lsc_auto_map = v:true " Use defaults
    " ... or set only the keys you want mapped, defaults are:
    " let g:lsc_auto_map = {
        " \ 'GoToDefinition': '<C-]>',
        " \ 'FindReferences': 'gr',
        " \ 'NextReference': '<C-n>',
        " \ 'PreviousReference': '<C-p>',
        " \ 'FindImplementations': 'gI',
        " \ 'FindCodeActions': 'ga',
        " \ 'DocumentSymbol': 'go',
        " \ 'WorkspaceSymbol': 'gS',
        " \ 'ShowHover': 'K',
        " \ 'Completion': 'completefunc',
        " \}
    autocmd CompleteDone * silent! pclose
endf
