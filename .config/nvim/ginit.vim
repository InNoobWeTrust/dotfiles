if exists('g:GtkGuiLoaded')
    call rpcnotify(1, 'Gui', 'Font', 'Iosevka Nerd Font Mono 14') 
    " To enable cmdline popup (disabled by default)
    " This function currently have some limitations.
    call rpcnotify(1, 'Gui', 'Option', 'Cmdline', 1)
    " To disable external autocompletion popup menu (enabled by default)
    "call rpcnotify(1, 'Gui', 'Option', 'Popupmenu', 0)
    " To disable external tabline (enabled by default)
    call rpcnotify(1, 'Gui', 'Option', 'Tabline', 0)
    " Open each buffer in its own tab
    "au BufAdd,BufNewFile * nested tab sball
    let g:GuiInternalClipboard = 1
elseif exists('g:gui_oni')
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
elseif has('gui_running')
    set t_Co=256
    " set guioptions-=m  "remove menu bar
    set guioptions-=T   "remove toolbar
    set guioptions-=r   "remove right-hand scroll bar
    set guioptions-=L   "remove left-hand scroll bar
    set guioptions-=e   "Use tabline from configs instead of GUI
    "set guifont=Iosevka\ Nerd\ Font\ Mono:h13
else
    GuiFont Iosevka Nerd Font Mono:h14
    GuiTabline 0
endif