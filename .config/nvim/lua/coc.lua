vim.api.nvim_exec(
[[
let g:vista_default_executive = 'coc'

" Use `:Format` to format current buffer
command! -nargs=0 Format :call CocAction('format')
" Use `:Fold` to fold current buffer
command! -nargs=? Fold :call CocAction('fold', <f-args>)
" use `:OR` for organize import of current buffer
command! -nargs=0 OR :call CocAction('runCommand', 'editor.action.organizeImport')

" Smaller updatetime for CursorHold & CursorHoldI
set updatetime=300
autocmd CursorHold * checktime
" Highlight symbol under cursor on CursorHold
autocmd CursorHold * silent call CocActionAsync('highlight')

function! Check_back_space() abort
    let col = col('.') - 1
    return !col || getline('.')[col - 1]  =~# '\\s'
endfunction
" Use tab for trigger completion with characters ahead and navigate.
" Use command ':verbose imap <tab>' to make sure tab is not mapped by other plugin.
inoremap <silent><expr> <TAB> pumvisible() ? "\\<C-n>" : Check_back_space() ? "\\<TAB>" : coc#refresh()
inoremap <expr> <S-TAB> pumvisible() ? "\\<C-p>" : "\\<C-h>"

" Use <c-space> to trigger completion.
imap <silent> <expr> <c-space> coc#refresh()
" Use <cr> to confirm completion, `<C-g>u` means break undo chain at current position.
" Coc only does snippet and additional edit on confirm.
inoremap <expr> <cr> pumvisible() ? "\\<C-y>" : "\\<C-g>u\\<CR>"
" Or use `complete_info` if your vim support it, like:
" inoremap <expr> <cr> complete_info()["selected"] != "-1" ? "\\<C-y>" : "\\<C-g>u\\<CR>"
" Use `[g` and `]g` to navigate diagnostics
nmap <silent> [g <Plug>(coc-diagnostic-prev)
nmap <silent> ]g <Plug>(coc-diagnostic-next)
" Remap keys for gotos
nmap <silent> <Leader>df <Plug>(coc-definition)
nmap <silent> <Leader>tdf <Plug>(coc-type-definition)
nmap <silent> <Leader>impl <Plug>(coc-implementation)
nmap <silent> <Leader>rf <Plug>(coc-references)

function! Show_documentation()
    if (index(['vim','help'], &filetype) >= 0)
        execute 'h '.expand('<cword>')
    else
        call CocAction('doHover')
        endif
endfunction
" Use show documentation in preview window
nnoremap <silent> <Leader>h :call Show_documentation()<CR>

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
nnoremap <silent> ,f :<C-u>CocList grep <C-r><C-w><cr>
" Interactive search with ripgrep
nnoremap <silent> ,fi :<C-u>CocList grep<cr>
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
" Some servers have issues with backup files
set nobackup
set nowritebackup
" don't give |ins-completion-menu| messages.
set shortmess+=c
]],
true)
