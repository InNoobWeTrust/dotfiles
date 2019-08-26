""""""" The code to check and download Vim-Plug is found here:
""""""" https://github.com/yous/dotfiles/blob/e6f1e71b6106f6953874c6b81f0753663f901578/vimrc#L30-L81
if !empty(&rtp)
    let s:vimfiles = split(&rtp, ',')[0]
else
    echohl ErrorMsg
    echomsg 'Unable to determine runtime path for Vim.'
    echohl NONE
endif

" Install vim-plug if it isn't installed and call plug#begin() out of box
function! s:DownloadVimPlug()
    if !exists('s:vimfiles')
        return
    endif
    if empty(glob(s:vimfiles . '/autoload/plug.vim'))
        let plug_url = 'https://github.com/junegunn/vim-plug.git'
        let tmp = tempname()
        let new = tmp . '/plug.vim'
        try
            let out = system(printf('git clone --depth 1 %s %s', plug_url, tmp))
            if v:shell_error
                echohl ErrorMsg
                echomsg 'Error downloading vim-plug: ' . out
                echohl NONE
                return
            endif
            if !isdirectory(s:vimfiles . '/autoload')
                call mkdir(s:vimfiles . '/autoload', 'p')
            endif
            call rename(new, s:vimfiles . '/autoload/plug.vim')
            " Install plugins at first
            autocmd VimEnter * PlugInstall | quit
        finally
            if isdirectory(tmp)
                let dir = '"' . escape(tmp, '"') . '"'
                silent call system((has('win32') ? 'rmdir /S /Q ' : 'rm -rf ') . dir)
            endif
        endtry
    endif
    call plug#begin(s:vimfiles . '/plugged')
    "" Asynchronous lint engine
    let g:ale_completion_enabled = 1 | Plug 'dense-analysis/ale', {'branch': 'v2.5.x'}
    set omnifunc=ale#completion#OmniFunc
    "" Language server autocompletion with coc.nvim
    " Plug 'neoclide/coc.nvim', {'tag': '*', 'do': { -> coc#util#install()}}
    "" Language server
    " Plug 'prabirshrestha/asyncomplete.vim'
    Plug 'prabirshrestha/async.vim'
    Plug 'prabirshrestha/vim-lsp'
    " Plug 'prabirshrestha/asyncomplete-lsp.vim'
    "" Fuzzy finder
    Plug 'mhinz/vim-grepper', {'on': ['Grepper', '<plug>(GrepperOperator)']}
    "" Add surrounding brackets, quotes, xml tags,...
    Plug 'tpope/vim-surround'
    "" Extended matching for the % operator
    Plug 'adelarsq/vim-matchit'
    " Autocompletion for pairs
    Plug 'Raimondi/delimitMate'
    "" Edit a region in new buffer
    Plug 'chrisbra/NrrwRgn'
    "" Tree explorer
    " Plug 'scrooloose/nerdtree', {'on': ['NERDTreeToggle', 'NERDTreeFind']} | Plug 'Xuyuanp/nerdtree-git-plugin' | Plug 'ryanoasis/vim-devicons'
    Plug 'scrooloose/nerdtree', {'on': ['NERDTreeToggle', 'NERDTreeFind']} | Plug 'Xuyuanp/nerdtree-git-plugin'
    "" Tag tree
    Plug 'majutsushi/tagbar'
    "" Run shell command asynchromously
    Plug 'skywind3000/asyncrun.vim'
    "" REPL alike
    Plug 'thinca/vim-quickrun'
    "" Text object per indent level
    Plug 'michaeljsmith/vim-indent-object'
    "" Code commenting
    Plug 'tpope/vim-commentary'
    "" Git gutter
    Plug 'airblade/vim-gitgutter'
    "" Git wrapper
    Plug 'tpope/vim-fugitive'
    "" Git management inside vim
    Plug 'jreybert/vimagit'
    "" Automatically toggle relative line number
    Plug 'jeffkreeftmeijer/vim-numbertoggle'
    "" Use registers as stack for yank and delete
    Plug 'maxbrunsfeld/vim-yankstack'
    "" Status line
    Plug 'itchyny/lightline.vim'
    "" Delete buffers without messing window layout
    Plug 'moll/vim-bbye'
    "" Show lint errors and warnings on status line
    Plug 'maximbaz/lightline-ale'
    "" Maintain coding style per project
    Plug 'editorconfig/editorconfig-vim'
    "" Language specific plugins
    " Ctags supported languages
    Plug 'ludovicchabant/vim-gutentags'
    " Markdown
    Plug 'tpope/vim-markdown', {'for': 'markdown'}
    " Arduino syntax
    Plug 'sudar/vim-arduino-syntax'
    " Godot syntax
    Plug 'calviken/vim-gdscript3'
    " Love2d syntax
    Plug 'davisdude/vim-love-docs', {'branch': 'build', 'for': 'lua'}
    " JS
    Plug 'pangloss/vim-javascript'
    Plug 'mxw/vim-jsx'
    " Python
    Plug 'nvie/vim-flake8', {'for': 'python'}
    Plug 'davidhalter/jedi-vim', {'for': 'python'}
    " Kotlin
    Plug 'udalov/kotlin-vim', {'for': 'kotlin'}
    " Java
    Plug 'udalov/javap-vim'
    " Dart
    Plug 'dart-lang/dart-vim-plugin', {'for': 'dart'}
    Plug 'thosakwe/vim-flutter'
    " Enable Flutter menu
    try
        call FlutterMenu()
    catch
    endtry
    " HTML helper (same as Emmet)
    Plug 'rstacruz/sparkup', {
                \ 'rtp': 'vim',
                \ 'for': [
                \           'html',
                \           'htmldjango',
                \           'javascript.jsx'
                \ ]}
    " Rust
    Plug 'rust-lang/rust.vim'
    "Plug 'racer-rust/vim-racer', {'for': 'rust'}
    "Plug 'mattn/webapi-vim'
    " Syslog
    Plug 'mtdl9/vim-log-highlighting', {'for': 'messages'}
    "" Detect file encoding
    Plug 's3rvac/AutoFenc'
    "" Indent line
    Plug 'Yggdroot/indentLine'
    "" Start screen
    Plug 'mhinz/vim-startify'
    "" Theme
    Plug 'morhetz/gruvbox'
    Plug 'ayu-theme/ayu-vim'
    call plug#end()
endfunction

call s:DownloadVimPlug()

"""" Custom commands section
command! PlugSync PlugUpgrade <bar> PlugUpdate <bar> UpdateRemotePlugins
"""" End custom commands section

"""" Theme section
syntax enable
syntax on
"" GruvBox
highlight Normal ctermbg=black ctermfg=white
let g:gruvbox_italic=1
let g:gruvbox_contrast_dark = 'hard'
let g:gruvbox_invert_tabline = 1
let g:gruvbox_invert_indent_guides=1
"" Ayu
let ayucolor="mirage"
try
    colorscheme gruvbox
    " colorscheme ayu
catch
endtry
"""" End theme section

"""" Misc section
" if (has("termguicolors"))
"     set termguicolors
" endif
if has('gui_running')
    set t_Co=256
    " set guioptions-=m  "remove menu bar
    set guioptions-=T   "remove toolbar
    set guioptions-=r   "remove right-hand scroll bar
    set guioptions-=L   "remove left-hand scroll bar
    set guioptions-=e   "Use tabline from configs instead of GUI
endif
set hidden
set cmdheight=2
"set encoding=utf-8
set mouse=a
"set guifont=Iosevka\ Nerd\ Font\ Mono:h13
set linespace=4
set ignorecase
set smartcase
set smartindent
set confirm
set autoread
set number
set relativenumber
set cursorline
set scrolloff=10
set wrap
set colorcolumn=80,100,120,140
set binary
set list
set listchars=eol:$,tab:>-,trail:_,extends:>,precedes:<
set backspace=indent,eol,start
set tabstop=4
set shiftwidth=4
set softtabstop=4
set expandtab
set spell
set completeopt+=preview
set completeopt+=menuone
set completeopt+=longest
"""" End misc section

"""" Keyboard shortcuts section
"" Change leader key
let mapleader = " "
"" Visual indication of leader key timeout
set showcmd
"" Copy and paste
vnoremap <C-c> "+yi
vnoremap <C-x> "+c
vnoremap <S-Insert> c<ESC>"+p
inoremap <S-Insert> <ESC>"+pa
"" Map Ctrl-Del to delete word
inoremap <C-Delete> <ESC>bdwa
"" Use ESC to exit insert mode in :term
" tnoremap <Esc> <C-\><C-n>
"" Tab to autocomplete if in middle of line
function! InsertTabWrapper()
    let col = col('.') - 1
    if !col || getline('.')[col - 1] !~ '\k'
        return "\<tab>"
    else
        return "\<c-n>"
    endif
endfunction
inoremap <expr> <tab> InsertTabWrapper()
inoremap <expr> <s-tab> <c-p>"
"" Expand CR when autocomplete pairs
let g:delimitMate_expand_cr = 2
let g:delimitMate_expand_space = 1
let g:delimitMate_expand_inside_quotes = 1
let g:delimitMate_jump_expansion = 1
"" Toggle NERDTree
map <Leader>f :NERDTreeToggle<CR>
nnoremap <silent> <Leader>v :NERDTreeFind<CR>
"" Delete buffer without messing layout
nmap <Leader>x :Bd<CR>
"" Key mapping for navigating between errors
nmap <silent> <C-k> <Plug>(ale_previous_wrap)
nmap <silent> <C-j> <Plug>(ale_next_wrap)
"" Key mapping for IDE-like behaviour
imap <C-Space> <Plug>(ale_complete)
" imap <expr> <Tab> pumvisible() ? "\<C-n>" : "\<Tab>"
" imap <expr> <S-Tab> pumvisible() ? "\<C-p>" : "\<S-Tab>"
" imap <expr> <cr> pumvisible() ? "\<C-y>\<cr>" : "\<cr>"
" autocmd! CompleteDone * if pumvisible() == 0 | pclose | endif
nmap <Leader>h <Plug>(ale_hover)
nmap <Leader>doc <Plug>(ale_documentation)
nmap <Leader>def <Plug>(ale_go_to_definition)
nmap <Leader>deft <Plug>(ale_go_to_definition_in_tab)
nmap <Leader>defs <Plug>(ale_go_to_definition_in_split)
nmap <Leader>defv <Plug>(ale_go_to_definition_in_vsplit)
nmap <Leader>tdef <Plug>(ale_go_to_type_definition)
nmap <Leader>tdeft <Plug>(ale_go_to_type_definition_in_tab)
nmap <Leader>tdefs <Plug>(ale_go_to_type_definition_in_split)
nmap <Leader>tdefv <Plug>(ale_go_to_type_definition_in_vsplit)
nmap <Leader>ref <Plug>(ale_find_references)
nmap <Leader>detail <Plug>(ale_detail)
nmap <Leader>fix <Plug>(ale_fix)
nmap <Leader>lint <Plug>(ale_lint)
nmap <Leader>info :ALEInfo<CR>
nmap <Leader>reset <Plug>(ale_reset)
nmap <Leader>decl <Plug>(lsp-declaration)
nmap <Leader>impl <Plug>(lsp-implementation)
nmap <Leader>rn <Plug>(lsp-rename)
nmap <Leader>fmt <Plug>(lsp-document-format)
vmap <Leader>fmt :LspDocumentRangeFormat<CR>
nmap <Leader>act <Plug>(lsp-code-action)
"" Flutter keys binding
nnoremap <Leader>fa :FlutterRun<cr>
nnoremap <Leader>fq :FlutterQuit<cr>
nnoremap <Leader>fr :FlutterHotReload<cr>
nnoremap <Leader>fR :FlutterHotRestart<cr>
"""" End keyboard shortcuts section

"""" Indentation config section
autocmd FileType html setlocal shiftwidth=2 tabstop=2 expandtab
autocmd FileType xml setlocal shiftwidth=2 tabstop=2 expandtab
autocmd FileType javascript setlocal shiftwidth=2 tabstop=2 expandtab
autocmd FileType json setlocal shiftwidth=2 tabstop=2 expandtab
"autocmd FileType dart setlocal shiftwidth=2 tabstop=2 expandtab
"""" End indentation config section

"""" Directory tree browser section
" let NERDTreeQuitOnOpen = 1
let NERDTreeAutoDeleteBuffer = 1
let NERDTreeMinimalUI = 1
let NERDTreeDirArrows = 1
"""" End directory tree browser section

"""" Statusline/tabline section
let g:lightline = {
            \ 'colorscheme': 'seoul256',
            \ }
let g:lightline.enable = {
            \ 'statusline': 1,
            \ 'tabline': 1
            \ }
" let g:lightline.separator = {
"             \ 'left': '', 'right': ''
"             \ }
" let g:lightline.subseparator = {
"             \ 'left': '', 'right': ''
"             \ }
function! LightLinePercent()
    if &ft !=? 'nerdtree'
        return line('.') * 100 / line('$') . '%'
    else
        return ''
    endif
endfunction
function! LightLineLineInfo()
    if &ft !=? 'nerdtree'
        return line('.').':'. col('.')
    else
        return ''
    endif
endfunction
function! Filetype()
    " return winwidth(0) > 70 ? (strlen(&filetype) ? &filetype . ' ' . WebDevIconsGetFileTypeSymbol() : 'no ft') : ''
    return winwidth(0) > 70 ? (strlen(&filetype) ? &filetype : 'no ft') : ''
endfunction

function! Fileformat()
    " return winwidth(0) > 70 ? (&fileformat . ' ' . WebDevIconsGetFileFormatSymbol()) : ''
    return winwidth(0) > 70 ? (&fileformat) : ''
endfunction
let g:lightline.component_expand = {
            \ 'linter_checking': 'lightline#ale#checking',
            \ 'linter_warnings': 'lightline#ale#warnings',
            \ 'linter_errors': 'lightline#ale#errors',
            \ 'linter_ok': 'lightline#ale#ok',
            \ }
let g:lightline.component_type = {
            \ 'linter_checking': 'left',
            \ 'linter_warnings': 'warning',
            \ 'linter_errors': 'error',
            \ 'linter_ok': 'left',
            \ }
let g:lightline.component_function = {
            \ 'percent': 'LightLinePercent',
            \ 'lineinfo': 'LightLineLineInfo',
            \ 'filetype': 'Filetype',
            \ 'fileformat': 'Fileformat',
            \ }
"" Statusline
set noshowmode
let g:lightline.active = {
            \   'right':
            \       [
            \           [ 'lineinfo' ],
            \           [ 'percent' ],
            \           [
            \               'linter_checking',
            \               'linter_errors',
            \               'linter_warnings',
            \               'linter_ok',
            \           ],
            \       ],
            \}
"" Tabline
set showtabline=2
let g:lightline.tabline = {
            \ 'right': [
            \   ['close'],
            \   ['fileformat',
            \    'fileencoding',
            \    'filetype'],
            \ ]}
"" Linting options
" let g:lightline#ale#indicator_checking = "\uf110"
" let g:lightline#ale#indicator_warnings = "\uf071"
" let g:lightline#ale#indicator_errors = "\uf05e"
" let g:lightline#ale#indicator_ok = "\uf00c"
let g:lightline#ale#indicator_checking = "∵"
let g:lightline#ale#indicator_warnings = "▲"
let g:lightline#ale#indicator_errors = "✗"
let g:lightline#ale#indicator_ok = "✓"
"""" End status line section

"""" Linting section
" Keep the sign gutter open at all times
let g:ale_sign_column_always = 1
let g:ale_sign_error = '✗'
let g:ale_sign_warning = '▲'
let g:ale_sign_info = 'i'
" Lint on text change
"let g:ale_lint_on_text_changed = 'never'
"let g:ale_lint_on_text_changed = 'normal'
" Lint on opening a file
" let g:ale_lint_on_enter = 1
" Fix files when you saving
let g:ale_fix_on_save = 0
" Show 3 lines of errors (default: 10)
let g:ale_list_window_size = 3
"" Explicitly enable linters
let g:ale_linters = {   'rust': [
            \               'rls',
            \               'cargo',
            \               'rustc',
            \               'rustfmt',
            \           ],
            \           'python': [
            \               'pyls',
            \               'flake8',
            \               'mypy',
            \               'prospector',
            \               'pycodestyle',
            \               'pyflakes',
            \               'pylint',
            \               'pyre',
            \               'vulture',
            \           ],
            \       }
"" Explicitly enable fixers
let g:ale_fixers = {    'rust': [
            \               'rustfmt',
            \               'remove_trailing_lines',
            \               'trim_whitespace',
            \           ],
            \           'c': [
            \               'clang-format',
            \               'remove_trailing_lines',
            \               'trim_whitespace',
            \               'uncrustify',
            \           ],
            \           'cpp': [
            \               'clang-format',
            \               'remove_trailing_lines',
            \               'trim_whitespace',
            \               'uncrustify',
            \           ],
            \           'javascript': [
            \               'eslint',
            \               'fecs',
            \               'importjs',
            \               'prettier_eslint',
            \               'standard',
            \               'xo',
            \               'remove_trailing_lines',
            \               'trim_whitespace',
            \           ],
            \           'python': [
            \               'add_blank_lines_for_python_control_statements',
            \               'autopep8',
            \               'black',
            \               'isort',
            \               'yapf',
            \               'remove_trailing_lines',
            \               'trim_whitespace',
            \           ],
            \           'java': [
            \               'google_java_format',
            \               'remove_trailing_lines',
            \               'trim_whitespace',
            \               'uncrustify',
            \           ],
            \      }
let g:ale_rust_rls_toolchain = 'stable'
let g:ale_rust_rustc_options = ''
"""" End linting section

"""" Language specific plugin section
"" Dart
let dart_html_in_string=v:true
let dart_style_guide = 2
let dart_format_on_save = 0
"" Rust
let g:autofmt_autosave = 1
let g:racer_experimental_completer = 1
if (has("win16") || has("win32") || has("win64"))
    let g:rust_clip_command = 'win32yank'
else
    let g:rust_clip_command = 'xclip -selection clipboard'
endif
"""" End language specific plugin section

"""" Language server section
""" vim-lsp
if executable('clangd')
    au User lsp_setup call lsp#register_server({
        \ 'name': 'clangd',
        \ 'cmd': {server_info->['clangd', '-background-index']},
        \ 'whitelist': ['c', 'cpp', 'objc', 'objcpp'],
        \ })
endif
if executable('pyls')
    au User lsp_setup call lsp#register_server({
        \ 'name': 'pyls',
        \ 'cmd': {server_info->['pyls']},
        \ 'whitelist': ['python'],
        \ 'workspace_config': {'pyls': {'plugins': {'pydocstyle': {'enabled': v:true}}}}
        \ })
endif
if executable('java') && filereadable(expand('~/.local/bin/eclipse.jdt.ls/plugins/org.eclipse.equinox.launcher_*.jar'))
    au User lsp_setup call lsp#register_server({
        \ 'name': 'eclipse.jdt.ls',
        \ 'cmd': {server_info->[
        \     'java',
        \     '-Declipse.application=org.eclipse.jdt.ls.core.id1',
        \     '-Dosgi.bundles.defaultStartLevel=4',
        \     '-Declipse.product=org.eclipse.jdt.ls.core.product',
        \     '-Dlog.level=ALL',
        \     '-noverify',
        \     '-Dfile.encoding=UTF-8',
        \     '-Xmx1G',
        \     '-jar',
        \     expand('~/.local/bin/eclipse.jdt.ls/plugins/org.eclipse.equinox.launcher_*.jar'),
        \     '-configuration',
        \     expand('~/.local/bin/eclipse.jdt.ls/config_linux'),
        \     '-data',
        \     getcwd()
        \ ]},
        \ 'whitelist': ['java'],
        \ })
endif
""" coc.nvim
" " Smaller updatetime for CursorHold & CursorHoldI
" set updatetime=300
" " don't give |ins-completion-menu| messages.
" set shortmess+=c
" " always show signcolumns
" set signcolumn=yes
" " Use tab for trigger completion with characters ahead and navigate.
" " Use command ':verbose imap <tab>' to make sure tab is not mapped by other plugin.
" inoremap <silent><expr> <TAB>
"       \ pumvisible() ? "\<C-n>" :
"       \ <SID>check_back_space() ? "\<TAB>" :
"       \ coc#refresh()
" inoremap <expr><S-TAB> pumvisible() ? "\<C-p>" : "\<C-h>"
" function! s:check_back_space() abort
"   let col = col('.') - 1
"   return !col || getline('.')[col - 1]  =~# '\s'
" endfunction
" " Use <c-space> for trigger completion.
" inoremap <silent><expr> <c-space> coc#refresh()
" " Use <cr> for confirm completion, `<C-g>u` means break undo chain at current position.
" " Coc only does snippet and additional edit on confirm.
" inoremap <expr> <cr> pumvisible() ? "\<C-y>" : "\<C-g>u\<CR>"
" " Use `[c` and `]c` for navigate diagnostics
" nmap <silent> [c <Plug>(coc-diagnostic-prev)
" nmap <silent> ]c <Plug>(coc-diagnostic-next)
" " Remap keys for gotos
" nmap <silent> gd <Plug>(coc-definition)
" nmap <silent> gy <Plug>(coc-type-definition)
" nmap <silent> gi <Plug>(coc-implementation)
" nmap <silent> gr <Plug>(coc-references)
" " Use K for show documentation in preview window
" nnoremap <silent> K :call <SID>show_documentation()<CR>
" function! s:show_documentation()
"   if &filetype == 'vim'
"     execute 'h '.expand('<cword>')
"   else
"     call CocAction('doHover')
"   endif
" endfunction
" " Highlight symbol under cursor on CursorHold
" autocmd CursorHold * silent call CocActionAsync('highlight')
" " Remap for rename current word
" nmap <leader>rn <Plug>(coc-rename)
" " Remap for format selected region
" vmap <leader>f  <Plug>(coc-format-selected)
" nmap <leader>f  <Plug>(coc-format-selected)
" augroup mygroup
"   autocmd!
"   " Setup formatexpr specified filetype(s).
"   autocmd FileType typescript,json setl formatexpr=CocAction('formatSelected')
"   " Update signature help on jump placeholder
"   autocmd User CocJumpPlaceholder call CocActionAsync('showSignatureHelp')
" augroup end
" " Remap for do codeAction of selected region, ex: `<leader>aap` for current paragraph
" vmap <leader>a  <Plug>(coc-codeaction-selected)
" nmap <leader>a  <Plug>(coc-codeaction-selected)
" " Remap for do codeAction of current line
" nmap <leader>ac  <Plug>(coc-codeaction)
" " Fix autofix problem of current line
" nmap <leader>qf  <Plug>(coc-fix-current)
" " Use `:Format` for format current buffer
" command! -nargs=0 Format :call CocAction('format')
" " Use `:Fold` for fold current buffer
" command! -nargs=? Fold :call     CocAction('fold', <f-args>)
" " Using CocList
" " Show all diagnostics
" nnoremap <silent> <space>a  :<C-u>CocList diagnostics<cr>
" " Manage extensions
" nnoremap <silent> <space>e  :<C-u>CocList extensions<cr>
" " Show commands
" nnoremap <silent> <space>c  :<C-u>CocList commands<cr>
" " Find symbol of current document
" nnoremap <silent> <space>o  :<C-u>CocList outline<cr>
" " Search workspace symbols
" nnoremap <silent> <space>s  :<C-u>CocList -I symbols<cr>
" " Do default action for next item.
" nnoremap <silent> <space>j  :<C-u>CocNext<CR>
" " Do default action for previous item.
" nnoremap <silent> <space>k  :<C-u>CocPrev<CR>
" " Resume latest coc list
" nnoremap <silent> <space>p  :<C-u>CocListResume<CR>
"""" End language server section

"""" Load external config per project
" exrc allows loading local executing local rc files.
set exrc
