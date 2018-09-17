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
"" Language Client
" Plug 'natebosch/vim-lsc'
" if (has("win16") || has("win32") || has("win64"))
"     Plug 'autozimu/LanguageClient-neovim', {
"                 \ 'branch': 'next',
"                 \ 'do': 'Powershell.exe -File install.ps1',
"                 \ }
" else
"     Plug 'autozimu/LanguageClient-neovim', {
"                 \ 'branch': 'next',
"                 \ 'do': 'bash install.sh',
"                 \ }
" endif
"" Autocompletion
" if has('nvim')
"     Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
" else
"     Plug 'Shougo/deoplete.nvim'
"     Plug 'roxma/nvim-yarp'
"     Plug 'roxma/vim-hug-neovim-rpc'
" endif
" let g:deoplete#enable_at_startup = 1
" Plug 'villainy/deoplete-dart', { 'for': 'dart' }
"" Asynchronous lint engine
Plug 'w0rp/ale', {'branch': 'v2.0.x'}
"" Fuzzy selection
Plug 'junegunn/fzf'
"" Add surrounding brackets, quotes, xml tags,...
Plug 'tpope/vim-surround'
"" Tree explorer
Plug 'scrooloose/nerdtree'
Plug 'Xuyuanp/nerdtree-git-plugin'
"" Enhanced terminal
Plug 'Shougo/deol.nvim'
"" Text object per indent level
Plug 'michaeljsmith/vim-indent-object'
"" Code commenting
Plug 'tpope/vim-commentary'
"" Git gutter
Plug 'airblade/vim-gitgutter'
"" Automatically toggle relative line number
Plug 'jeffkreeftmeijer/vim-numbertoggle'
"" Use registers as stack for yank and delete
Plug 'maxbrunsfeld/vim-yankstack'
"" Status line
Plug 'itchyny/lightline.vim'
"" Show buffer in tabline
Plug 'mgee/lightline-bufferline'
"" Show lint errors and warnings on status line
Plug 'maximbaz/lightline-ale'
"" Language specific plugins
" Markdown
Plug 'tpope/vim-markdown', { 'for': 'markdown' }
" Python
Plug 'nvie/vim-flake8', { 'for': 'python' }
Plug 'davidhalter/jedi-vim', { 'for': 'python'}
" Kotlin
Plug 'udalov/kotlin-vim', { 'for': 'kotlin' }
" Dart
Plug 'dart-lang/dart-vim-plugin', { 'for': 'dart' }
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
let g:autofmt_autosave = 1
if (has("win16") || has("win32") || has("win64"))
    let g:rust_clip_command = 'win32yank'
else
    let g:rust_clip_command = 'xclip -selection clipboard'
endif
" Plug 'mattn/webapi-vim'
"" Detect file encoding
Plug 's3rvac/AutoFenc'
"" Indent line
Plug 'Yggdroot/indentLine'
"" Start screen
Plug 'mhinz/vim-startify'
"" File icons
Plug 'ryanoasis/vim-devicons'
"" Theme
Plug 'morhetz/gruvbox'
" Plug 'ayu-theme/ayu-vim'
call plug#end()

"""" Theme section
syntax enable
syntax on
"" GruvBox
highlight Normal ctermbg=black ctermfg=white
try
    colorscheme gruvbox
catch
endtry
let ayucolor="dark"
let g:gruvbox_italic=1
let g:gruvbox_contrast_dark = 'hard'
let g:gruvbox_invert_tabline = 1
let g:gruvbox_invert_indent_guides=1
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
" set cmdheight=2
" set encoding=utf-8
set mouse=a
" set guifont=FuraCode\ Nerd\ Font\ Mono:h12
set smartcase
set number relativenumber
set cursorline
set nowrap
set colorcolumn=80
set binary
set list
set listchars=eol:$,tab:>-,trail:_,extends:>,precedes:<
set backspace=indent,eol,start
set tabstop=4
set shiftwidth=4
set softtabstop=4
set expandtab
if exists('g:GtkGuiLoaded')
    call rpcnotify(1, 'Gui', 'Font', 'FuraCode Nerd Font Mono 12') 
    call rpcnotify(1, 'Gui', 'Option', 'Cmdline', 1)
    " To disable external autocompletion popup menu (enabled by default)
    " call rpcnotify(1, 'Gui', 'Option', 'Popupmenu', 0)
    " To disable external tabline (enabled by default)
    call rpcnotify(1, 'Gui', 'Option', 'Tabline', 0)
    let g:GuiInternalClipboard = 1 
endif
if exists('g:gui_oni')
    set noswapfile
    set smartcase
    set splitright
    set splitbelow
    " Turn off statusbar, because it is externalized
    set noshowmode
    set noruler
    set laststatus=0
    set noshowcmd
    " All config settings after this point 
    " can be removed, once an Oni config option is added.
endif
"""" End misc section

"""" Keyboard shortcuts section
" Copy and paste
vnoremap <C-c> "+yi
vnoremap <C-x> "+c
vnoremap <S-Insert> c<ESC>"+p
inoremap <S-Insert> <ESC>"+pa
" Map Ctrl-Del to delete word
inoremap <C-Delete> <ESC>dwi
" Use ESC to exit insert mode in :term
tnoremap <Esc> <C-\><C-n>
" Toggle NERDTree
map <C-n> :NERDTreeToggle<CR>
"""" End keyboard shortcuts section

""" Indentation config section
autocmd FileType html setlocal shiftwidth=2 tabstop=2 expandtab
autocmd FileType javascript setlocal shiftwidth=2 tabstop=2 expandtab
autocmd FileType json setlocal shiftwidth=2 tabstop=2 expandtab
" autocmd FileType dart setlocal shiftwidth=2 tabstop=2 expandtab
""" End indentation config section

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
let g:lightline.active = { 'right':
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
"" Enable autocomplete
let g:ale_completion_enabled = 1
" Keep the sign gutter open at all times
let g:ale_sign_column_always = 1
" Key mapping for navigating between errors
nnoremap <silent> <C-k> <Plug>(ale_previous_wrap)
nnoremap <silent> <C-j> <Plug>(ale_next_wrap)
" Lint on text change
" let g:ale_lint_on_text_changed = 'never'
" let g:ale_lint_on_text_changed = 'normal'
" Lint on opening a file
" let g:ale_lint_on_enter = 0
" Fix files when you saving
" let g:ale_fix_on_save = 0
" Show 3 lines of errors (default: 10)
let g:ale_list_window_size = 3
"" Key mapping for IDE-like behaviour
nnoremap <silent> K :ALEHover<CR>
"" Enable all linters for rust
let g:ale_linters = { 'rust': ['rustc', 'cargo', 'rls'] }
"" Enable all fixers for rust
let g:ale_fixers = { 'rust': [
            \                   'rustfmt',
            \                   'remove_trailing_lines',
            \                   'trim_whitespace'
            \                ]
            \      }
let g:ale_rust_rls_toolchain = 'stable'
let g:ale_rust_rustc_options = ''
"""" End linting section

"""" Language specific plugin section
"" Dart
let dart_html_in_string=v:true
let dart_style_guide = 2
" let dart_format_on_save = 1
"""" End language specific plugin section

"""" Language client section
"" vim-lsc
" let g:lsc_server_commands = {'dart': 'dart_language_server'}
" Default key mapping
" let g:lsc_auto_map = v:true
" Autoclose documentation window
" autocmd CompleteDone * silent! pclose
"" LanguageClient-neovim
" Required for operations modifying multiple buffers like rename.
" set hidden
" if (has("win16") || has("win32") || has("win64"))
"     let g:LanguageClient_serverCommands = {
"                 \ 'javascript': ['javascript-typescript-langserver.cmd'],
"                 \ 'python': ['pyls.exe'],
"                 \ 'dart': ['dart_language_server.bat'],
"                 \ }
" else
"     let g:LanguageClient_serverCommands = {
"                 \ 'rust': ['rustup', 'run', 'stable', 'rls'],
"                 \ 'javascript': ['javascript-typescript-langserver'],
"                 \ 'python': ['pyls'],
"                 \ 'dart': ['dart_language_server'],
"                 \ }
" endif
" nnoremap <F5> :call LanguageClient_contextMenu()<CR>
" Or map each action separately
" nnoremap <silent> K :call LanguageClient#textDocument_hover()<CR>
" nnoremap <silent> gd :call LanguageClient#textDocument_definition()<CR>
" nnoremap <silent> <F2> :call LanguageClient#textDocument_rename()<CR>
"""" End language client section
