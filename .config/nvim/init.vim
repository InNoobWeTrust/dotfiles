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
    let g:ale_completion_enabled = 0 | Plug 'dense-analysis/ale', {'branch': 'v2.6.x'}
    "set omnifunc=ale#completion#OmniFunc
    "" Native neovim language server config plugin
    Plug 'neovim/nvim-lsp'
    "" Full language server with coc.nvim
    Plug 'neoclide/coc.nvim', {'branch': 'release'}
    " Install coc extensions on first run
    try
        call CocInstall()
    catch
    endtry
    "" Symbol map using language server
    Plug 'liuchengxu/vista.vim'
    let g:vista_default_executive = 'coc'
    "" Add surrounding brackets, quotes, xml tags,...
    Plug 'tpope/vim-surround'
    "" Extended matching for the % operator
    Plug 'adelarsq/vim-matchit'
    " Autocompletion for pairs
    Plug 'Raimondi/delimitMate'
    "" Edit a region in new buffer
    Plug 'chrisbra/NrrwRgn'
    "" Run shell command asynchromously
    Plug 'skywind3000/asyncrun.vim'
    "" REPL alike
    Plug 'thinca/vim-quickrun'
    let g:quickrun_no_default_key_mappings = 1
    "" Text object per indent level
    Plug 'michaeljsmith/vim-indent-object'
    "" Code commenting
    Plug 'scrooloose/nerdcommenter'
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
    " Kotlin
    Plug 'udalov/kotlin-vim', {'for': 'kotlin'}
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
    Plug 'mattn/webapi-vim'
    if executable('racer')
        Plug 'racer-rust/vim-racer', {'for': 'rust'}
    endif
    " Syslog
    Plug 'mtdl9/vim-log-highlighting', {'for': 'messages'}
    "" Detect file encoding
    Plug 's3rvac/AutoFenc'
    "" Indent line
    Plug 'Yggdroot/indentLine'
    "" Theme
    Plug 'morhetz/gruvbox'
    Plug 'ayu-theme/ayu-vim'
    call plug#end()
endfunction

call s:DownloadVimPlug()

" Floating Term
let s:float_term_border_win = 0
let s:float_term_win = 0
function! s:FloatTerm()
  " Configuration
  let height = float2nr((&lines - 2) * 0.6)
  let row = float2nr((&lines - height) / 2)
  let width = float2nr(&columns * 0.6)
  let col = float2nr((&columns - width) / 2)
  " Border Window
  let border_opts = {
        \ 'relative': 'editor',
        \ 'row': row - 1,
        \ 'col': col - 2,
        \ 'width': width + 4,
        \ 'height': height + 2,
        \ 'style': 'minimal'
        \ }
  let border_buf = nvim_create_buf(v:false, v:true)
  let s:float_term_border_win = nvim_open_win(border_buf, v:true, border_opts)
  " Terminal Window
  let opts = {
        \ 'relative': 'editor',
        \ 'row': row,
        \ 'col': col,
        \ 'width': width,
        \ 'height': height,
        \ 'style': 'minimal'
        \ }
  let buf = nvim_create_buf(v:false, v:true)
  let s:float_term_win = nvim_open_win(buf, v:true, opts)
  " Styling
  hi FloatTermNormal term=None guibg=#2d3d45
  call setwinvar(s:float_term_border_win, '&winhl', 'Normal:FloatTermNormal')
  call setwinvar(s:float_term_win, '&winhl', 'Normal:FloatTermNormal')
  terminal
  startinsert
  " Close border window when terminal window close
  autocmd TermClose * ++once :q | call nvim_win_close(s:float_term_border_win, v:true)
endfunction

"""" Custom commands section
command! PlugSync PlugUpgrade <bar> PlugUpdate <bar> UpdateRemotePlugins
command! Reload source $MYVIMRC
command! FloatTerm call s:FloatTerm()
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
au CursorHold * checktime
set number
set relativenumber
set cursorline
set scrolloff=10
set wrap
set colorcolumn=80,100,120,140,160,180,200
set binary
set list
set listchars=eol:$,tab:>-,trail:_,extends:>,precedes:<
set backspace=indent,eol,start
set tabstop=4
set shiftwidth=4
set softtabstop=4

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
imap <expr> <tab> InsertTabWrapper()
imap <expr> <s-tab> <c-p>"
"" Expand CR when autocomplete pairs
let g:delimitMate_expand_cr = 2
let g:delimitMate_expand_space = 1
let g:delimitMate_expand_inside_quotes = 1
let g:delimitMate_jump_expansion = 1
"" Delete buffer without messing layout
nmap <Leader>x :Bd<CR>
"" Key mapping for navigating between errors
nmap <silent> <C-k> <Plug>(ale_previous_wrap)
nmap <silent> <C-j> <Plug>(ale_next_wrap)
"" Key mapping for IDE-like behaviour
nmap <Leader>h <Plug>(ale_hover)
nmap <Leader>doc <Plug>(ale_documentation)
nmap <Leader>df <Plug>(ale_go_to_definition)
nmap <Leader>dft <Plug>(ale_go_to_definition_in_tab)
nmap <Leader>dfs <Plug>(ale_go_to_definition_in_split)
nmap <Leader>dfv <Plug>(ale_go_to_definition_in_vsplit)
nmap <Leader>tdf <Plug>(ale_go_to_type_definition)
nmap <Leader>tdft <Plug>(ale_go_to_type_definition_in_tab)
nmap <Leader>tdfs <Plug>(ale_go_to_type_definition_in_split)
nmap <Leader>tdfv <Plug>(ale_go_to_type_definition_in_vsplit)
nmap <Leader>rf <Plug>(ale_find_references)
nmap <Leader>dtl <Plug>(ale_detail)
nmap <Leader>fx <Plug>(ale_fix)
nmap <Leader>lnt <Plug>(ale_lint)
nmap <Leader>ifo :ALEInfo<CR>
nmap <Leader>arst <Plug>(ale_reset)
nmap <Leader>dcl <Plug>(lsp-declaration)
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
    if (&ft ==? 'nerdtree' || &ft ==? 'coc-explorer')
        return ''
    else
        return line('.') * 100 / line('$') . '%'
    endif
endfunction
function! LightLineLineInfo()
    if (&ft ==? 'nerdtree' || &ft ==? 'coc-explorer')
        return ''
    else
        return line('.').':'. col('.')
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
function! CocCurrentFunction()
    return get(b:, 'coc_current_function', '')
endfunction
function! CocStatusDiagnostic() abort
    let info = get(b:, 'coc_diagnostic_info', {})
    if empty(info) | return '' | endif
    let msgs = []
    if get(info, 'error', 0)
        call add(msgs, 'E' . info['error'])
    endif
    if get(info, 'warning', 0)
        call add(msgs, 'W', info['warning'])
    endif
    return join(msgs, ' ') . ' ' . get(g:, 'coc_status', '')
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
            \ 'cocstatus': 'CocStatusDiagnostic',
            \ 'currentfunction': 'CocCurrentFunction',
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
            \               'cocstatus',
            \               'currentfunction',
            \           ],
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
" Speed up executable checks
let g:ale_cache_executable_check_failures = 1
" Disable certain features
let g:ale_virtualenv_dir_names = []
"" Explicitly enable linters
let g:ale_linters = {   'rust': [
            \               'cargo',
            \               'rustc',
            \               'rustfmt',
            \           ],
            \           'python': [],
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
            \               'prettier',
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
let g:ale_rust_rls_config = {   'rust': {
            \                       'clippy_preference': 'on',
            \                   }
            \               }
let g:ale_rust_rustc_options = ''
let g:ale_rust_cargo_check_all_targets = 1
let g:ale_rust_cargo_check_tests = 1
let g:ale_rust_cargo_check_examples = 1
let g:ale_rust_cargo_use_clippy = executable('cargo-clippy')
"""" End linting section

"""" Language specific plugin section
"" Dart
let dart_html_in_string=v:true
let dart_style_guide = 2
let dart_format_on_save = 0
"" Rust
let g:rustfmt_autosave = 1
let g:racer_experimental_completer = 1
let g:racer_insert_paren = 1
if (has("win16") || has("win32") || has("win64"))
    let g:rust_clip_command = 'win32yank'
elseif has("unix")
    let s:uname = system("uname -s")
    if s:uname == "Darwin"
        let g:rust_clip_command = 'pbcopy'
    else
        let g:rust_clip_command = 'xclip -selection clipboard'
    endif
endif
"""" End language specific plugin section

"""" Language server section
""" coc.nvim
" Some servers have issues with backup files
set nobackup
set nowritebackup
" Smaller updatetime for CursorHold & CursorHoldI
set updatetime=300
" don't give |ins-completion-menu| messages.
set shortmess+=c
" always show signcolumns
set signcolumn=yes
" Use tab for trigger completion with characters ahead and navigate.
" Use command ':verbose imap <tab>' to make sure tab is not mapped by other plugin.
inoremap <silent><expr> <TAB>
      \ pumvisible() ? "\<C-n>" :
      \ <SID>check_back_space() ? "\<TAB>" :
      \ coc#refresh()
inoremap <expr> <S-TAB> pumvisible() ? "\<C-p>" : "\<C-h>"
function! s:check_back_space() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction
" Use <c-space> to trigger completion.
inoremap <silent> <expr> <c-space> coc#refresh()
" Use <cr> to confirm completion, `<C-g>u` means break undo chain at current position.
" Coc only does snippet and additional edit on confirm.
inoremap <expr> <cr> pumvisible() ? "\<C-y>" : "\<C-g>u\<CR>"
" Or use `complete_info` if your vim support it, like:
" inoremap <expr> <cr> complete_info()["selected"] != "-1" ? "\<C-y>" : "\<C-g>u\<CR>"
" Use `[g` and `]g` to navigate diagnostics
nmap <silent> [g <Plug>(coc-diagnostic-prev)
nmap <silent> ]g <Plug>(coc-diagnostic-next)
" Remap keys for gotos
nmap <silent> <Leader>df <Plug>(coc-definition)
nmap <silent> <Leader>tdf <Plug>(coc-type-definition)
nmap <silent> <Leader>impl <Plug>(coc-implementation)
nmap <silent> <Leader>rf <Plug>(coc-references)
" Use show documentation in preview window
nnoremap <silent> <Leader>h :call <SID>show_documentation()<CR>
function! s:show_documentation()
  if (index(['vim','help'], &filetype) >= 0)
    execute 'h '.expand('<cword>')
  else
    call CocAction('doHover')
  endif
endfunction
" Highlight symbol under cursor on CursorHold
autocmd CursorHold * silent call CocActionAsync('highlight')
" Remap for rename current word
nmap <Leader>rn <Plug>(coc-rename)
" Remap for format selected region
xmap <Leader>fmt <Plug>(coc-format-selected)
nmap <Leader>fmt <Plug>(coc-format-selected)
augroup cocgroup
  autocmd!
  " Setup formatexpr specified filetype(s).
  autocmd FileType typescript,json setl formatexpr=CocAction('formatSelected')
  " Update signature help on jump placeholder
  autocmd User CocJumpPlaceholder call CocActionAsync('showSignatureHelp')
augroup end
" Remap for do codeAction of selected region, ex: `<Leader>aap` for current paragraph
xmap <Leader>a <Plug>(coc-codeaction-selected)
nmap <Leader>a <Plug>(coc-codeaction-selected)
" Remap for do codeAction of current line
nmap <Leader>ac <Plug>(coc-codeaction)
" Fix autofix problem of current line
nmap <Leader>qf <Plug>(coc-fix-current)
" Create mappings for function text object, requires document symbols feature of languageserver.
xmap if <Plug>(coc-funcobj-i)
xmap af <Plug>(coc-funcobj-a)
omap if <Plug>(coc-funcobj-i)
omap af <Plug>(coc-funcobj-a)
" Use <C-d> for select selections ranges, needs server support, like: coc-tsserver, coc-python
nmap <silent> <C-d> <Plug>(coc-range-select)
xmap <silent> <C-d> <Plug>(coc-range-select)
" Use `:Format` to format current buffer
command! -nargs=0 Format :call CocAction('format')
" Use `:Fold` to fold current buffer
command! -nargs=? Fold :call CocAction('fold', <f-args>)
" use `:OR` for organize import of current buffer
command! -nargs=0 OR :call CocAction('runCommand', 'editor.action.organizeImport')
" Add status line support, for integration with other plugin, checkout `:h coc-status`
set statusline^=%{coc#status()}%{get(b:,'coc_current_function','')}
" Using CocList
" Show all diagnostics
nnoremap <silent> ,a :<C-u>CocList diagnostics<cr>
" Manage extensions
nnoremap <silent> ,e :<C-u>CocList extensions<cr>
" Show commands
nnoremap <silent> ,c :<C-u>CocList commands<cr>
" Find symbol of current document
nnoremap <silent> ,o :<C-u>CocList outline<cr>
" Search workspace symbols
nnoremap <silent> ,s :<C-u>CocList -I symbols<cr>
" Search with ripgrep
nnoremap <silent> ,f :<C-u>CocList grep<cr>
" Open all lists
nnoremap <silent> ,l :<C-u>CocList<cr>
" Do default action for next item.
nnoremap <silent> ,j :<C-u>CocNext<CR>
" Do default action for previous item.
nnoremap <silent> ,k :<C-u>CocPrev<CR>
" Resume latest coc list
nnoremap <silent> ,p :<C-u>CocListResume<CR>
" Using CocExplorer
" Toggle
nmap <silent> <Leader>f :CocCommand explorer<CR>
" Expand to current file
nmap <silent> <Leader>v :CocCommand explorer --reveal<CR>
"""" End language server section

"""" Load external config per project
" exrc allows loading local config files.
set exrc
