"""" Vim-plug configurations
"if empty(glob('$HOME/.config/nvim/autoload/plug.vim'))
"  silent !curl -fLo $HOME/.config/nvim/autoload/plug.vim --create-dirs
"    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
"  autocmd VimEnter * PlugInstall --sync | source '$HOME/.config/nvim/init.vim'
"endif

"" Register minconda's python when running on Windows
"if has("win16") || has("win32") || has("win64")
"    let g:python3_host_prog = "python"
"endif

call plug#begin('$HOME/AppData/Local/nvim/plugged')
"" Language Client
Plug 'natebosch/vim-lsc'
"" Asynchronous lint engine
Plug 'w0rp/ale'
"" Autocomplete
if has('nvim')
  Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
else
  Plug 'Shougo/deoplete.nvim'
  Plug 'roxma/nvim-yarp'
  Plug 'roxma/vim-hug-neovim-rpc'
endif
"" Fuzzy selection
Plug 'junegunn/fzf'
"" Searching
"Plug 'mileszs/ack.vim'
"Plug 'corntrace/bufexplorer'
"Plug 'ctrlpvim/ctrlp.vim'
"" Tree explorer
Plug 'scrooloose/nerdtree'
"" Text object per indent level
Plug 'michaeljsmith/vim-indent-object'
"" Code commenting
Plug 'tpope/vim-commentary'
"" Sublime-text alike multiple cursors
Plug 'terryma/vim-multiple-cursors'
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
Plug 'ryanoasis/vim-devicons'
"" Themes
"Plug 'mhartington/oceanic-next'
"Plug 'altercation/vim-colors-solarized'
Plug 'morhetz/gruvbox'
call plug#end()

if (has("termguicolors"))
 set termguicolors
endif

"""" Theme section
syntax enable
syntax on
"" Oceanic
"colorscheme OceanicNext
"let g:oceanic_next_terminal_bold = 1
"let g:oceanic_next_terminal_italic = 1
"" GruvBox
highlight Normal ctermbg=black ctermfg=white
set background=dark
if !exists('g:gui_oni')
    let g:gruvbox_italic=1
endif
colorscheme gruvbox
let g:gruvbox_contrast_dark = 'hard'
"""" End theme section

"""" Misc section
if has('gui_running')
    set t_Co=256
endif
set encoding=utf-8
set mouse=a
set guifont=FuraCodeNerdFont
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
    call rpcnotify(1, 'Gui', 'Font', 'Fira Code Retina 18') 
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

"""" Autoclose brackets section
inoremap " ""<left>
inoremap ' ''<left>
inoremap ( ()<left>
inoremap [ []<left>
inoremap { {}<left>
inoremap {<CR> {<CR>}<ESC>0
"""" End autoclose brackets section

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
autocmd FileType dart setlocal shiftwidth=2 tabstop=2 expandtab
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
let g:lightline.active = { 'right': [[ 'linter_checking', 'linter_errors', 'linter_warnings', 'linter_ok' ]] }
let g:lightline#ale#indicator_checking = "\uf110"
let g:lightline#ale#indicator_warnings = "\uf071"
let g:lightline#ale#indicator_errors = "\uf05e"
let g:lightline#ale#indicator_ok = "\uf00c"
"""" End status line section

"""" Linting section
" Disable completion to use deoplete instead
let g:ale_completion_enabled = 0
" Keep the sign gutter open at all times
let g:ale_sign_column_always = 1
" Key mapping for navigating between errors
nnoremap <silent> <C-k> <Plug>(ale_previous_wrap)
nnoremap <silent> <C-j> <Plug>(ale_next_wrap)
" Don't lint on text change
let g:ale_lint_on_text_changed = 'never'
" Don't lint on opening a file
let g:ale_lint_on_enter = 0
"""" End linting section

"""" Autocomplete section
let g:deoplete#enable_at_startup = 1
"""" End autocomplete section

"""" Language specific plugin section
"" Dart
let dart_html_in_string=v:true
let dart_style_guide = 2
let dart_format_on_save = 1
"""" End language specific plugin section

"""" Language client section
let g:lsc_server_commands = {'dart': 'dart_language_server'}
" Default key mapping
let g:lsc_auto_map = v:true
"""" End language client section
