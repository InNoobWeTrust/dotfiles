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
endfunction

call s:DownloadVimPlug()

call plug#begin(s:vimfiles . "/plugged")
"" Asynchronous lint engine
" Enable autocomplete
let g:ale_completion_enabled = 1 | Plug 'w0rp/ale', {'branch': 'v2.2.x'}
"" More autocomplete
if has('nvim')
  Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
else
  Plug 'Shougo/deoplete.nvim'
  Plug 'roxma/nvim-yarp'
  Plug 'roxma/vim-hug-neovim-rpc'
endif
let g:deoplete#enable_at_startup = 1
Plug 'wokalski/autocomplete-flow'
" Func argument completion
Plug 'Shougo/neosnippet'
Plug 'Shougo/neosnippet-snippets'
let g:neosnippet#enable_completed_snippet = 1
"" Fuzzy finder
Plug 'mhinz/vim-grepper', {'on': ['Grepper', '<plug>(GrepperOperator)']}
"" Add surrounding brackets, quotes, xml tags,...
Plug 'tpope/vim-surround'
"" Extended matching for the % operator
Plug 'adelarsq/vim-matchit'
" Autocompletion for pairs
Plug 'Raimondi/delimitMate'
"" Tree explorer
Plug 'scrooloose/nerdtree', {'on': ['NERDTreeToggle', 'NERDTreeFind']} | Plug 'Xuyuanp/nerdtree-git-plugin' | Plug 'ryanoasis/vim-devicons'
"" Run shell command asynchromously
Plug 'skywind3000/asyncrun.vim'
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
"" Show buffer in tabline
Plug 'mgee/lightline-bufferline'
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
" Python
Plug 'nvie/vim-flake8', {'for': 'python'}
Plug 'davidhalter/jedi-vim', {'for': 'python'}
" Kotlin
Plug 'udalov/kotlin-vim', {'for': 'kotlin'}
" Dart
Plug 'dart-lang/dart-vim-plugin', {'for': 'dart'}
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
Plug 'racer-rust/vim-racer', {'for': 'rust'}
"Plug 'mattn/webapi-vim'
"" Detect file encoding
Plug 's3rvac/AutoFenc'
"" Indent line
Plug 'Yggdroot/indentLine'
"" Start screen
Plug 'mhinz/vim-startify'
"" Theme
Plug 'morhetz/gruvbox'
"Plug 'ayu-theme/ayu-vim'
call plug#end()

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
let ayucolor="dark"
try
    colorscheme gruvbox
catch
endtry
"""" End theme section

"""" Misc section
if (has("termguicolors"))
    set termguicolors
endif
if has('gui_running')
    set t_Co=256
    " set guioptions-=m  "remove menu bar
    set guioptions-=T   "remove toolbar
    set guioptions-=r   "remove right-hand scroll bar
    set guioptions-=L   "remove left-hand scroll bar
    set guioptions-=e   "Use tabline from configs instead of GUI
endif
set hidden
"set cmdheight=2
"set encoding=utf-8
set mouse=a
"set guifont=Iosevka\ Nerd\ Font\ Mono:h13
set smartcase
set number relativenumber
set cursorline
set wrap
set colorcolumn=80
set binary
set list
set listchars=eol:$,tab:>-,trail:_,extends:>,precedes:<
set backspace=indent,eol,start
set tabstop=4
set shiftwidth=4
set softtabstop=4
set expandtab
set completeopt+=preview
set completeopt+=menuone
set completeopt+=longest
"""" End misc section

"""" Keyboard shortcuts section
"" Change leader key
let mapleader = " "
"" Visual indication of leader key timeout
set showcmd
" Copy and paste
vnoremap <C-c> "+yi
vnoremap <C-x> "+c
vnoremap <S-Insert> c<ESC>"+p
inoremap <S-Insert> <ESC>"+pa
" Map Ctrl-Del to delete word
inoremap <C-Delete> <ESC>dwi
" Use ESC to exit insert mode in :term
" tnoremap <Esc> <C-\><C-n>
" Toggle NERDTree
map <Leader>f :NERDTreeToggle<CR>
nnoremap <silent> <Leader>v :NERDTreeFind<CR>
" Quickly switch between buffers
nmap <Leader>1 <Plug>lightline#bufferline#go(1)
nmap <Leader>2 <Plug>lightline#bufferline#go(2)
nmap <Leader>3 <Plug>lightline#bufferline#go(3)
nmap <Leader>4 <Plug>lightline#bufferline#go(4)
nmap <Leader>5 <Plug>lightline#bufferline#go(5)
nmap <Leader>6 <Plug>lightline#bufferline#go(6)
nmap <Leader>7 <Plug>lightline#bufferline#go(7)
nmap <Leader>8 <Plug>lightline#bufferline#go(8)
nmap <Leader>9 <Plug>lightline#bufferline#go(9)
nmap <Leader>0 <Plug>lightline#bufferline#go(10)
" Key mapping for navigating between errors
nnoremap <silent> <C-k> <Plug>(ale_previous_wrap)
nnoremap <silent> <C-j> <Plug>(ale_next_wrap)
" Key :apping for IDE-like behaviour
nnoremap <silent> K :ALEHover<CR>
nnoremap <silent> gd :ALEGoToDefinition<CR>
nnoremap <silent> gr :ALEFindReferences<CR>
" Racer (Rust) keys binding
au FileType rust nmap gd <Plug>(rust-def)
au FileType rust nmap gs <Plug>(rust-def-split)
au FileType rust nmap gx <Plug>(rust-def-vertical)
au FileType rust nmap <leader>gd <Plug>(rust-doc)
"""" End keyboard shortcuts section

"""" Indentation config section
autocmd FileType html setlocal shiftwidth=2 tabstop=2 expandtab
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
let g:lightline.separator = {
            \ 'left': '', 'right': ''
            \ }
let g:lightline.subseparator = {
            \ 'left': '', 'right': ''
            \ }
function! MyLightLinePercent()
    if &ft !=? 'nerdtree'
        return line('.') * 100 / line('$') . '%'
    else
        return ''
    endif
endfunction
function! MyLightLineLineInfo()
    if &ft !=? 'nerdtree'
        return line('.').':'. col('.')
    else
        return ''
    endif
endfunction
function! MyFiletype()
    return winwidth(0) > 70 ? (strlen(&filetype) ? &filetype . ' ' . WebDevIconsGetFileTypeSymbol() : 'no ft') : ''
endfunction

function! MyFileformat()
    return winwidth(0) > 70 ? (&fileformat . ' ' . WebDevIconsGetFileFormatSymbol()) : ''
endfunction
let g:lightline.component_expand = {
            \ 'buffers': 'lightline#bufferline#buffers',
            \ 'linter_checking': 'lightline#ale#checking',
            \ 'linter_warnings': 'lightline#ale#warnings',
            \ 'linter_errors': 'lightline#ale#errors',
            \ 'linter_ok': 'lightline#ale#ok',
            \ }
let g:lightline.component_type = {
            \ 'buffers': 'tabsel',
            \ 'linter_checking': 'left',
            \ 'linter_warnings': 'warning',
            \ 'linter_errors': 'error',
            \ 'linter_ok': 'left',
            \ }
let g:lightline.component_function = {
            \ 'percent': 'MyLightLinePercent',
            \ 'lineinfo': 'MyLightLineLineInfo',
            \ 'filetype': 'MyFiletype',
            \ 'fileformat': 'MyFileformat',
            \ }
"" Statusline
set noshowmode
let g:lightline.active = {'right':
            \ [[ 'lineinfo' ],
            \  [ 'percent' ],
            \  [ 'linter_checking',
            \    'linter_errors',
            \    'linter_warnings',
            \    'linter_ok']
            \ ]}
"" Tabline
set showtabline=2
let g:lightline#bufferline#enable_devicons = 1
let g:lightline#bufferline#unicode_symbols = 1
let g:lightline#bufferline#show_number = 0
let g:lightline#bufferline#number_map = {
            \ 0: '⁰', 1: '¹', 2: '²',
            \ 3: '³', 4: '⁴', 5: '⁵',
            \ 6: '⁶', 7: '⁷', 8: '⁸',
            \ 9: '⁹'}
let g:lightline.tabline = {
            \ 'left': [['buffers']],
            \ 'right': [
            \   ['close'],
            \   ['fileformat',
            \    'fileencoding',
            \    'filetype']
            \ ]}
"" Linting options
let g:lightline#ale#indicator_checking = "\uf110"
let g:lightline#ale#indicator_warnings = "\uf071"
let g:lightline#ale#indicator_errors = "\uf05e"
let g:lightline#ale#indicator_ok = "\uf00c"
"""" End status line section

"""" Linting section
" Keep the sign gutter open at all times
let g:ale_sign_column_always = 1
let g:ale_sign_error = 'X'
let g:ale_sign_warning = 'i'
" Lint on text change
"let g:ale_lint_on_text_changed = 'never'
"let g:ale_lint_on_text_changed = 'normal'
" Lint on opening a file
let g:ale_lint_on_enter = 0
" Fix files when you saving
let g:ale_fix_on_save = 0
" Show 3 lines of errors (default: 10)
let g:ale_list_window_size = 3
"" Enable all linters for rust
let g:ale_linters = {'rust': ['rls','cargo','rustc','rustfmt']}
"" Enable all fixers for rust
let g:ale_fixers = {'rust': [
            \                   'rustfmt',
            \                   'remove_trailing_lines',
            \                   'trim_whitespace'
            \                ],
            \        'javascript': ['eslint']
            \      }
let g:ale_rust_rls_toolchain = 'stable'
let g:ale_rust_rustc_options = ''
"""" End linting section

"""" Language specific plugin section
"" Dart
let dart_html_in_string=v:true
let dart_style_guide = 2
let dart_format_on_save = 1
"" Rust
let g:autofmt_autosave = 1
let g:racer_experimental_completer = 1
if (has("win16") || has("win32") || has("win64"))
    let g:rust_clip_command = 'win32yank'
else
    let g:rust_clip_command = 'xclip -selection clipboard'
endif
"""" End language specific plugin section
