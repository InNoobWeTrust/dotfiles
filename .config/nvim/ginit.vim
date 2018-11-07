if exists('g:GtkGuiLoaded')
    call rpcnotify(1, 'Gui', 'Font', 'Iosevka Nerd Font Mono 13') 
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
    if has('gui_win32')
        set guifont=Iosevka_Nerd_Font_Mono:h13
    else
        set guifont=Iosevka\ Nerd\ Font\ Mono\ 13
    endif
else
    GuiFont! Iosevka Nerd Font Mono:h13
    GuiTabline 0
endif