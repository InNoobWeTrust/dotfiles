"""" Vim-plug configurations
"if empty(glob('$HOME/.config/nvim/autoload/plug.vim'))
"  silent !curl -fLo $HOME/.config/nvim/autoload/plug.vim --create-dirs
"    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
"  autocmd VimEnter * PlugInstall --sync | source '$HOME/.config/nvim/init.vim'
"endif

call plug#begin('$HOME/.local/share/nvim/plugged')
"" Language Client
if has('nvim')
    Plug 'autozimu/LanguageClient-neovim', {
        \ 'branch': 'next',
        \ 'do': 'bash install.sh',
        \ }
    Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
else
  Plug 'Shougo/deoplete.nvim'
  Plug 'roxma/nvim-yarp'
  Plug 'roxma/vim-hug-neovim-rpc'
endif
let g:deoplete#enable_at_startup = 1
" Required for operations modifying multiple buffers like rename.
set hidden
nnoremap <silent> K :call LanguageClient#textDocument_hover()<CR>
nnoremap <silent> gd :call LanguageClient#textDocument_definition()<CR>
nnoremap <silent> <F2> :call LanguageClient#textDocument_rename()<CR>
"" Fuzzy selection
Plug 'junegunn/fzf'
"" Searching
"Plug 'mileszs/ack.vim'
"Plug 'corntrace/bufexplorer'
"Plug 'ctrlpvim/ctrlp.vim'
"" Tree explorer
Plug 'scrooloose/nerdtree'
"" Syntax checking
Plug 'vim-syntastic/syntastic'
set statusline+=%#warningmsg#
set statusline+=%{SyntasticStatuslineFlag()}
set statusline+=%*
let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0
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
set noshowmode
let g:lightline = {
      \ 'colorscheme': 'wombat',
      \ }
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
let dart_html_in_string=v:true
let dart_style_guide = 2
let dart_format_on_save = 1
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

"""" Keyboard shortcuts section
" copy and paste
vmap <C-c> "+yi
vmap <C-x> "+c
vmap <S-Insert> c<ESC>"+p
imap <S-Insert> <ESC>"+pa
"""" End keyboard shortcuts section

""" Indentation config section
autocmd FileType html setlocal shiftwidth=2 tabstop=2 expandtab
autocmd FileType javascript setlocal shiftwidth=2 tabstop=2 expandtab
autocmd FileType dart setlocal shiftwidth=2 tabstop=2 expandtab
""" End indentation config section

"""" Language servers section
" Automatically start language servers.
let g:LanguageClient_autoStart = 1
let g:LanguageClient_serverCommands = {}

" Minimal LSP configuration for JavaScript
if executable('javascript-typescript-stdio')
  let g:LanguageClient_serverCommands.javascript = ['javascript-typescript-stdio']
  " Use LanguageServer for omnifunc completion
  autocmd FileType javascript setlocal omnifunc=LanguageClient#complete
  " <leader>lf to fuzzy find the symbols in the current document
  autocmd FileType javascript nnoremap <buffer>
    \ <leader>lf :call LanguageClient_textDocument_documentSymbol()<cr>
  " <leader>ld to go to definition
  autocmd FileType javascript nnoremap <buffer>
    \ <leader>ld :call LanguageClient_textDocument_definition()<cr>
  " <leader>lh for type info under cursor
  autocmd FileType javascript nnoremap <buffer>
    \ <leader>lh :call LanguageClient_textDocument_hover()<cr>
  " <leader>lr to rename variable under cursor
  autocmd FileType javascript nnoremap <buffer>
    \ <leader>lr :call LanguageClient_textDocument_rename()<cr>
endif

" Language Server configuration for python
if executable('pyls')
  let g:LanguageClient_serverCommands.python = ['pyls']
  autocmd FileType python setlocal omnifunc=LanguageClient#complete
  " <leader>lf to fuzzy find the symbols in the current document
  autocmd FileType python nnoremap <buffer>
    \ <leader>lf :call LanguageClient_textDocument_documentSymbol()<cr>
  " <leader>ld to go to definition
  autocmd FileType python nnoremap <buffer>
    \ <leader>ld :call LanguageClient_textDocument_definition()<cr>
  " <leader>lh for type info under cursor
  autocmd FileType python nnoremap <buffer>
    \ <leader>lh :call LanguageClient_textDocument_hover()<cr>
  " <leader>lr to rename variable under cursor
  autocmd FileType python nnoremap <buffer>
    \ <leader>lr :call LanguageClient_textDocument_rename()<cr>
endif

" Language Server configuration for dart
if executable('dart_language_server')
  let g:LanguageClient_serverCommands.dart = ['dart_language_server']
  autocmd FileType dart setlocal omnifunc=LanguageClient#complete
  " <leader>lf to fuzzy find the symbols in the current document
  autocmd FileType dart nnoremap <buffer>
    \ <leader>lf :call LanguageClient_textDocument_documentSymbol()<cr>
  " <leader>ld to go to definition
  autocmd FileType dart nnoremap <buffer>
    \ <leader>ld :call LanguageClient_textDocument_definition()<cr>
  " <leader>lh for type info under cursor
  autocmd FileType dart nnoremap <buffer>
    \ <leader>lh :call LanguageClient_textDocument_hover()<cr>
  " <leader>lr to rename variable under cursor
  autocmd FileType dart nnoremap <buffer>
    \ <leader>lr :call LanguageClient_textDocument_rename()<cr>
endif
