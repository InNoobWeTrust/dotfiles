"""" Vim-plug configurations
"if empty(glob('$HOME/.config/nvim/autoload/plug.vim'))
"  silent !curl -fLo $HOME/.config/nvim/autoload/plug.vim --create-dirs
"    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
"  autocmd VimEnter * PlugInstall --sync | source '$HOME/.config/nvim/init.vim'
"endif

if (has("win16") || has("win32") || has("win64"))
    let nvim_root = "$HOME/AppData/Local/nvim/"
    let vim_root = "$HOME/vimfiles/"
else
    let nvim_root = "$HOME/.config/nvim/"
    let vim_root = "$HOME/.vim/"
endif

if has("nvim")
    let user_root = nvim_root
else
    let user_root = vim_root
endif

"" Set path for plugins based on platform
if (has("win16") || has("win32") || has("win64"))
    let plugged_path = user_root . "plugged"
else
    let plugged_path = user_root . "plugged"
endif

call plug#begin(plugged_path)
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
"" Use registers as stack for yank and delete
Plug 'maxbrunsfeld/vim-yankstack'
"" Status line
Plug 'itchyny/lightline.vim'
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
Plug 'rstacruz/sparkup', {'rtp': 'vim', 'for': ['html', 'htmldjango', 'javascript.jsx']}
"" File icons
" Plug 'ryanoasis/vim-devicons'
"" Theme
Plug 'morhetz/gruvbox'
call plug#end()

"""" Theme section
syntax enable
syntax on
"" GruvBox
highlight Normal ctermbg=black ctermfg=white
set background=dark
if !exists('g:gui_oni')
    let g:gruvbox_italic=1
endif
try
    colorscheme gruvbox
catch
endtry
let g:gruvbox_contrast_dark = 'hard'
"""" End theme section

"""" Misc section
if (has("termguicolors"))
    set termguicolors
endif
if has('gui_running')
    set t_Co=256
endif
set encoding=utf-8
set mouse=a
set guifont=FuraCode\ Nerd\ Font:h11
set smartcase
set number
set binary
set list
set listchars=eol:$,tab:↣—,trail:…,extends:»,precedes:«,space:·,nbsp:☠
set tabstop=4
set shiftwidth=4
set softtabstop=4
set expandtab
if exists('g:GtkGuiLoaded')
    call rpcnotify(1, 'Gui', 'Font', 'FuraCode Nerd Font 12') 
    call rpcnotify(1, 'Gui', 'Option', 'Cmdline', 1)
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
    " Use ESC to exit insert mode in :term
    tnoremap <Esc> <C-\><C-n>
endif
"""" End misc section

"""" Keyboard shortcuts section
" copy and paste
vnoremap <C-c> "+yi
vnoremap <C-x> "+c
vnoremap <S-Insert> c<ESC>"+p
inoremap <S-Insert> <ESC>"+pa
"""" End keyboard shortcuts section

""" Indentation config section
autocmd FileType html setlocal shiftwidth=2 tabstop=2 expandtab
autocmd FileType javascript setlocal shiftwidth=2 tabstop=2 expandtab
" autocmd FileType dart setlocal shiftwidth=2 tabstop=2 expandtab
""" End indentation config section

"""" Status line section
set noshowmode
let g:lightline = {
            \ 'colorscheme': 'wombat',
            \ }
"" Linting information on status line
let g:lightline.component_expand = {
            \  'linter_checking': 'lightline#ale#checking',
            \  'linter_warnings': 'lightline#ale#warnings',
            \  'linter_errors': 'lightline#ale#errors',
            \  'linter_ok': 'lightline#ale#ok',
            \ }
let g:lightline.component_type = {
            \     'linter_checking': 'left',
            \     'linter_warnings': 'warning',
            \     'linter_errors': 'error',
            \     'linter_ok': 'left',
            \ }
let g:lightline.active = { 'right': [
            \                                 [ 'lineinfo' ],
            \                                 [ 'percent' ],
            \                                 [ 'fileformat', 'fileencoding', 'filetype', 'charvaluehex' ],
            \                                 [ 'linter_checking', 'linter_errors', 'linter_warnings', 'linter_ok' ]
            \                             ] }
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
