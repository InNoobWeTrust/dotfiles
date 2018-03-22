" Vim-plug configurations
if empty(glob('~/.config/nvim/autoload/plug.vim'))
  silent !curl -fLo ~/.config/nvim/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
  autocmd VimEnter * PlugInstall --sync | source '~/.config/nvim/init.vim'
endif

call plug#begin('~/.local/share/nvim/plugged')
" Language Client
Plug 'autozimu/LanguageClient-neovim', { 'do': ':UpdateRemotePlugins' }
" Fuzzy selection
Plug 'junegunn/fzf'
" IDE-like autocompletion without
Plug 'roxma/nvim-completion-manager'
Plug 'mileszs/ack.vim'
Plug 'corntrace/bufexplorer'
Plug 'ctrlpvim/ctrlp.vim'
Plug 'scrooloose/nerdtree'
Plug 'scrooloose/snipmate-snippets'
Plug 'scrooloose/syntastic'
Plug 'ryanoasis/vim-devicons'
Plug 'amix/open_file_under_cursor.vim'
Plug 'altercation/vim-colors-solarized'
Plug 'michaeljsmith/vim-indent-object'
Plug 'groenewege/vim-less'
Plug 'tpope/vim-markdown', { 'for': 'markdown' }
Plug 'tpope/vim-commentary'
Plug 'terryma/vim-multiple-cursors'
Plug 'fatih/vim-go', { 'for': 'go' }
Plug 'airblade/vim-gitgutter'
Plug 'nvie/vim-flake8', { 'for': 'python' }
Plug 'maxbrunsfeld/vim-yankstack'
Plug 'itchyny/lightline.vim'
Plug 'udalov/kotlin-vim', { 'for': 'kotlin' }
Plug 'davidhalter/jedi-vim', { 'for': 'python'}
Plug 'dart-lang/dart-vim-plugin', { 'for': 'dart' }
Plug 'mhartington/oceanic-next'
call plug#end()

if (has("termguicolors"))
 set termguicolors
endif
" Theme
syntax enable
colorscheme OceanicNext
syntax on
let g:oceanic_next_terminal_bold = 1
let g:oceanic_next_terminal_italic = 1

set number
set binary
set list
set listchars=eol:$,tab:▷␣,trail:…,extends:»,precedes:«,space:␣,nbsp:☠

""" Language servers
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
let g:LanguageClient_serverCommands.python = ['pyls']
autocmd FileType python nnoremap <buffer>
    \ <leader>lr :call LanguageClient_textDocument_rename()<cr>
