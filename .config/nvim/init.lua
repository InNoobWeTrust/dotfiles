---------------------------------------------------------------------- No-plugin
---------------------------------------------------- Aliases
local execute = vim.api.nvim_command
local opt  = vim.opt   -- global
local api = vim.api    -- access vim api
local o  = vim.o       -- global
local g  = vim.g       -- global for let options
local wo = vim.wo      -- window local
local bo = vim.bo      -- buffer local
local fn = vim.fn      -- access vim functions
local cmd = vim.cmd    -- vim commands
------------------------------------------------ End aliases
---------------------------------------------------- General
--o.nocompatible = true
cmd 'filetype plugin on'
-- Display all matching files when we tab complete
o.wildmenu = true
o.wildignorecase = true
-- Auto reload file on changes outside editor
o.autoread = true
o.hidden = true
o.cmdheight = 2
--set encoding=utf-8
o.mouse = 'a'
--o.guifont = 'Iosevka Nerd Font Mono:h13'
o.linespace = 4
o.ignorecase = true
o.smartcase = true
o.smartindent = true
o.confirm = true
o.signcolumn = 'yes'
o.number = true
o.relativenumber = true
o.cursorline = true
o.scrolloff = 10
o.wrap = true
o.colorcolumn = '80,100,120,140,160,180,200'
o.binary = true
o.list = true
o.listchars = 'eol:$,tab:>-,trail:_,extends:>,precedes:<'
o.backspace = 'indent,eol,start'
o.spell = true
o.completeopt = 'menu,preview,menuone,longest'
if fn.executable('pyenv') then
    g.python_host_prog = fn.system('pyenv shims | grep "/python2$" | tr -d "\n"')
    g.python3_host_prog = fn.system('pyenv shims | grep "/python3$" | tr -d "\n"')
end
------------------------------------------------ End General
----------------------------------------------- Highlighting
cmd 'syntax enable'
cmd 'syntax on'
------------------------------------------- End Highlighting
------------------------------------------------ Indentation
o.tabstop = 4
o.shiftwidth = 4
o.softtabstop = 4
o.expandtab = true
-------------------------------------------- End indentation
------------------------------------------------------ Netrw
g.netrw_banner = 0        -- disable annoying banner
g.netrw_browse_split = 4  -- open in prior window
g.netrw_altv = 1          -- open splits to the right
g.netrw_liststyle = 3     -- tree view
g.netrw_list_hide = {fn['netrw_gitignore#Hide()'], ',\\(^\\|\\s\\s\\)\\zs\\.\\S\\+'}
-------------------------------------------------- End Netrw
--------------------------------------------------- Keyboard
-- Change leader key
g.mapleader = ' '
-- Visual indication of leader key timeout
o.showcmd = true
-- map helper
local function map(mode, lhs, rhs, opts)
    local options = {noremap = true}
    if opts then options = vim.tbl_extend('force', options, opts) end
    api.nvim_set_keymap(mode, lhs, rhs, options)
end

-- Copy and paste
map('v', '<C-c>', '"+yi')
map('v', '<C-x>', '"+c')
map('v', '<S-Insert>', 'c<ESC>"+p')
map('i', '<S-Insert>', '<ESC>"+pa')
-- Map Ctrl-Del to delete word
map('i', '<C-Delete>', '<ESC>bdwa')
-- Use ESC to exit insert mode in :term
--map('t', '<Esc>', '<C-\><C-n>')
-- Tab to autocomplete if in middle of line
---------------------------------------------------- Autocmd
-------- This function is taken from https://github.com/norcalli/nvim_utils
local function nvim_create_augroups(definitions)
    for group_name, definition in pairs(definitions) do
        execute('augroup '..group_name)
        execute('autocmd!')
        for _, def in ipairs(definition) do
            local command = table.concat(vim.tbl_flatten{'autocmd', def}, ' ')
            execute(command)
        end
        execute('augroup END')
    end
end

-- https://neovim.discourse.group/t/reload-init-lua-and-all-require-d-scripts/971/11
function _G.ReloadConfig()
    local hls_status = vim.v.hlsearch
    for name,_ in pairs(package.loaded) do
        if name:match('^cnull') then
            package.loaded[name] = nil
        end
    end
    dofile(vim.env.MYVIMRC)
    if hls_status == 0 then
        vim.opt.hlsearch = false
    end
end

local autocmds = {
    reload_vimrc = {
        -- Reload vim config automatically
        -- {'BufWritePost',[[$VIM_PATH/{*.vim,*.yaml,vimrc} nested source $MYVIMRC | redraw]]};
        {'BufWritePre', '$MYVIMRC', 'lua ReloadConfig()'};
    };
    packer = {
        { 'BufWritePost', 'plugins.lua', 'PackerCompile' };
    };
    terminal_job = {
        --{ 'TermOpen', '*', [[tnoremap <buffer> <Esc> <c-\><c-n>]] };
        { 'TermOpen', '*', 'startinsert' };
        { 'TermOpen', '*', 'setlocal listchars= nonumber norelativenumber' };
    };
    save_shada = {
        {'VimLeave', '*', 'wshada!'};
    };
    resize_windows_proportionally = {
        { 'VimResized', '*', ':wincmd =' };
    };
    --toggle_search_highlighting = {
    --    { 'InsertEnter', '*', 'setlocal nohlsearch' };
    --};
    lua_highlight = {
        { 'TextYankPost', '*', [[silent! lua vim.highlight.on_yank() {higroup='IncSearch', timeout=400}]] };
    };
    --ansi_esc_log = {
    --    { 'BufEnter', '*.log', ':AnsiEsc' };
    --};
    file_type = {
        { 'FileType', 'html', 'setlocal shiftwidth=2 tabstop=2 expandtab'};
        { 'FileType', 'xml', 'setlocal shiftwidth=2 tabstop=2 expandtab'};
        { 'FileType', 'javascript', 'setlocal shiftwidth=2 tabstop=2 expandtab'};
        { 'FileType', 'json', 'setlocal shiftwidth=2 tabstop=2 expandtab'};
        { 'FileType', 'dart', 'setlocal shiftwidth=2 tabstop=2 expandtab'};
        { 'FileType', 'markdown', 'setlocal shiftwidth=2 tabstop=2 noexpandtab'};
    }
}

nvim_create_augroups(autocmds)
------------------------------------------------ End autocmd
------------------------------------------------------- Misc
--------------------------------------------------- End Misc
------------------------------------------- Custom functions
--------------------------------------- End custom functions
-------------------------------------------- External config
-- exrc allows loading local config files.
o.exrc = true
o.secure = true
----------------------------------------------------------------- End No-plugins

-- Install packer
local install_path = fn.stdpath('data')..'/site/pack/packer/opt/packer.nvim'
local first_time_packer = false

if fn.empty(vim.fn.glob(install_path)) > 0 then
    execute('!git clone https://github.com/wbthomason/packer.nvim '..install_path)
    first_time_packer = true
end

cmd [[packadd packer.nvim]]
local packer_autocmds = {
    packer = {
        { 'BufWritePost', 'plugins.lua', 'PackerCompile' };
    };
}

nvim_create_augroups(packer_autocmds)

local use = require('packer').use
require('packer').startup(function()
    use {'wbthomason/packer.nvim', opt = true}
    -- Language client
    use 'neovim/nvim-lspconfig'
    use 'glepnir/lspsaga.nvim'
    use 'kabouzeid/nvim-lspinstall'
    use 'Shadorain/shadovim'
    -- Completion engine plugin for neovim written in Lua
    use {
        'hrsh7th/nvim-cmp',
        requires = {
            'hrsh7th/vim-vsnip',
            'hrsh7th/cmp-buffer',
            'hrsh7th/cmp-nvim-lsp',
            'hrsh7th/cmp-path',
            'hrsh7th/cmp-emoji',
            'f3fora/cmp-spell',
            'quangnguyen30192/cmp-nvim-tags',
        }
    }
    use { 'Saecki/crates.nvim', requires = { 'nvim-lua/plenary.nvim' } }
    -- Asynchronous lint engine
    g.ale_completion_enabled = 0
    use {'dense-analysis/ale', {branch = 'v3.0.x'}}
    --o.omnifunc = fn['ale#completion#OmniFunc']
    -- Symbol map using language server
    use 'liuchengxu/vista.vim'
    g.vista_default_executive = 'ale'
    -- Add surrounding brackets, quotes, xml tags,...
    use 'tpope/vim-surround'
    -- Extended matching for the % operator
    use 'adelarsq/vim-matchit'
    -- Autocompletion for pairs
    use 'Raimondi/delimitMate'
    -- Multiple cursor
    use 'terryma/vim-multiple-cursors'
    -- Edit a region in new buffer
    use 'chrisbra/NrrwRgn'
    -- Run shell command asynchromously
    use 'skywind3000/asyncrun.vim'
    -- REPL alike
    use 'thinca/vim-quickrun'
    g.quickrun_no_default_key_mappings = 1
    -- Text object per indent level
    use {'michaeljsmith/vim-indent-object', ft = {'python'}}
    -- Code commenting
    use 'scrooloose/nerdcommenter'
    -- Git wrapper
    use 'tpope/vim-fugitive'
    -- Git management inside vim
    use 'jreybert/vimagit'
    -- REST console
    use 'diepm/vim-rest-console'
    -- Automatically toggle relative line number
    use 'jeffkreeftmeijer/vim-numbertoggle'
    -- Use registers as stack for yank and delete
    use 'maxbrunsfeld/vim-yankstack'
    -- Status line
    use {
        'hoob3rt/lualine.nvim',
        requires = {'kyazdani42/nvim-web-devicons', opt = true}
    }
    -- Delete buffers without messing window layout
    use 'moll/vim-bbye'
    -- Maintain coding style per project
    use 'editorconfig/editorconfig-vim'
    ---- Language specific plugins
    -- Language packs
    use 'sheerun/vim-polyglot'
    -- HTML helper (same as Emmet)
    use {
        'rstacruz/sparkup',
        ft = {'html', 'htmldjango', 'javascript.jsx'}
    }
    -- Rust
    use 'mattn/webapi-vim'
    if fn.executable('racer') then
        use {
            'racer-rust/vim-racer',
            ft = {'rust'}
        }
    end
    -- Enhanced C and C++ syntax highlighting
    use 'bfrg/vim-cpp-modern'
    -- C/C++/Cuda/ObjC semantic highlighting using the language server protocol
    use 'jackguo380/vim-lsp-cxx-highlight'
    ---- Framework specific plugins
    -- Flutter
    use 'thosakwe/vim-flutter'
    -- Detect file encoding
    use 's3rvac/AutoFenc'
    -- Indent line
    use 'Yggdroot/indentLine'
    -- Theme
    use 'morhetz/gruvbox'
    use 'ayu-theme/ayu-vim'

    ---------------------------------------- Custom commands
    cmd 'command! Reload source $MYVIMRC'
    ------------------------------------ End custom commands

    -------------------------------------------------- Theme
    -- GruvBox
    cmd 'highlight Normal ctermbg=black ctermfg=white'
    g.gruvbox_italic = 1
    g.gruvbox_contrast_dark = 'hard'
    g.gruvbox_invert_tabline = 1
    g.gruvbox_invert_indent_guides = 1
    -- Ayu
    --o.ayucolor = 'mirage'
    cmd 'colorscheme gruvbox'
    --cmd 'colorscheme ayu'
    ---------------------------------------------- End theme

    --------------------------------------Keyboard shortcuts
    -- Expand CR when autocomplete pairs
    g.delimitMate_expand_cr = 2
    g.delimitMate_expand_space = 1
    g.delimitMate_expand_inside_quotes = 1
    g.delimitMate_jump_expansion = 1
    -- Delete buffer without messing layout
    map('n', '<Leader>x', ':Bd<CR>', {noremap = false})
    -- Key mapping for navigating between errors
    map('n', '<C-k>', '<Plug>(ale_previous_wrap)', {noremap = false, silent = true})
    map('n', '<C-j>', '<Plug>(ale_next_wrap)', {noremap = false, silent = true})
    ---- Key mapping for ALE
    map('i', '<C-Space>', '<Plug>(ale_complete)', {noremap = false, silent = true})
    map('n', '<Leader>h', '<Plug>(ale_hover)', {noremap = false})
    map('n', '<Leader>doc', '<Plug>(ale_documentation)', {noremap = false})
    map('n', '<Leader>df', '<Plug>(ale_go_to_definition)', {noremap = false})
    map('n', '<Leader>dft', '<Plug>(ale_go_to_definition_in_tab)', {noremap = false})
    map('n', '<Leader>dfs', '<Plug>(ale_go_to_definition_in_split)', {noremap = false})
    map('n', '<Leader>dfv', '<Plug>(ale_go_to_definition_in_vsplit)', {noremap = false})
    map('n', '<Leader>tdf', '<Plug>(ale_go_to_type_definition)', {noremap = false})
    map('n', '<Leader>tdft', '<Plug>(ale_go_to_type_definition_in_tab)', {noremap = false})
    map('n', '<Leader>tdfs', '<Plug>(ale_go_to_type_definition_in_split)', {noremap = false})
    map('n', '<Leader>tdfv', '<Plug>(ale_go_to_type_definition_in_vsplit)', {noremap = false})
    map('n', '<Leader>rf', '<Plug>(ale_find_references)', {noremap = false})
    map('n', '<Leader><Leader>rn', ':ALERename<Return>', {noremap = false})
    map('n', '<Leader>import', ':ALEImport<Return>', {noremap = false})
    map('n', '<Leader>or', ':ALEOrganizeImports<Return>', {noremap = false})
    map('n', '<Leader>dtl', '<Plug>(ale_detail)', {noremap = false})
    map('n', '<Leader>fx', '<Plug>(ale_fix)', {noremap = false})
    map('n', '<Leader>lnt', '<Plug>(ale_lint)', {noremap = false})
    map('n', '<Leader>ifo', ':ALEInfo<Return>', {noremap = false})
    map('n', '<Leader>rst', '<Plug>(ale_reset)', {noremap = false})
    ---- Key mapping for nvim-lsp
    map('n', '<Leader>dcl', '<Plug>(lsp-declaration)', {noremap = false})
    map('n', '<Leader>impl', '<Plug>(lsp-implementation)', {noremap = false})
    map('n', '<Leader>rn', '<Plug>(lsp-rename)', {noremap = false})
    map('n', '<Leader>fmt', '<Plug>(lsp-document-format)', {noremap = false})
    map('v', '<Leader>fmt', ':LspDocumentRangeFormat<CR>', {noremap = false})
    map('n', '<Leader>act', '<Plug>(lsp-code-action)', {noremap = false})
    ---- Key mapping for lsp-saga
    -- lsp provider to find the cursor word definition and reference
    map('n', 'gh', ':Lspsaga lsp_finder<CR>', {noremap = true, silent = true})
    -- code action
    map('n', '<Leader>act', ':Lspsaga code_action<CR>', {noremap = true, silent = true})
    map('v', '<Leader>act', ':<C-U>Lspsaga range_code_action<CR>', {noremap = true, silent = true})
    -- show hover doc
    map('n', 'K', ':Lspsaga hover_doc<CR>', {noremap = true, silent = true})
    -- scroll down hover doc or scroll in definition preview
    map('n', '<C-f>', '<cmd>lua require("lspsaga.action").smart_scroll_with_saga(1)<CR>', {noremap = true, silent = true})
    -- scroll up hover doc
    map('n', '<C-b>', '<cmd>lua require("lspsaga.action").smart_scroll_with_saga(-1)<CR>', {noremap = true, silent = true})
    -- show signature help
    map('n', 'gs', 'signature_help<CR>', {noremap = true, silent = true})
    -- rename
    map('n', 'gr', ':Lspsaga rename<CR>', {noremap = true, silent = true})
    -- close rename win use <C-c> in insert mode or `q` in noremal mode or `:q`
    -- preview definition
    map('n', 'gd', ':Lspsaga preview_definition<CR>', {noremap = true, silent = true})
    -- show diagnostics
    map('n', '<Leader>diag', ':Lspsaga show_line_diagnostics<CR>', {noremap = true, silent = true})
    -- only show diagnostic if cursor is over the area
    map('n', '<Leader>cdiag', '<cmd>lua require("lspsaga.diagnostic").show_cursor_diagnostics()<CR>', {noremap = true, silent = true})
    -- jump diagnostic
    map('n', '[e', ':Lspsaga diagnostic_jump_next<CR>', {noremap = true, silent = true})
    map('n', ']e', ':Lspsaga diagnostic_jump_prev<CR>', {noremap = true, silent = true})
    -- float terminal also you can pass the cli command in open_float_terminal function
    map('n', '<A-d>', ':Lspsaga open_floaterm<CR>', {noremap = true, silent = true})
    map('t', '<A-d>', '<C-\\><C-n>:Lspsaga close_floaterm<CR>', {noremap = true, silent = true})
    -- Flutter keys binding
    map('n', '<Leader>fa', ':FlutterRun<cr>')
    map('n', '<Leader>fq', ':FlutterQuit<cr>')
    map('n', '<Leader>fr', ':FlutterHotReload<cr>')
    map('n', '<Leader>fR', ':FlutterHotRestart<cr>')
    --------------------------------- End keyboard shortcuts

    ------------------------------------- Statusline/tabline
    require('lualine').setup {
        options = {
            theme = 'gruvbox',
            --component_separators = {'', ''},
            --section_separators = {'', ''},
            --disabled_filetypes = {}
        },
        --sections = {
        --    lualine_a = {'mode'},
        --    lualine_b = {'branch'},
        --    lualine_c = {'filename'},
        --    lualine_x = {'encoding', 'fileformat', 'filetype'},
        --    lualine_y = {'progress'},
        --    lualine_z = {'location'}
        --},
        --inactive_sections = {
        --    lualine_a = {},
        --    lualine_b = {},
        --    lualine_c = {'filename'},
        --    lualine_x = {'location'},
        --    lualine_y = {},
        --    lualine_z = {}
        --},
        --tabline = {},
        --extensions = {}
    }
    --------------------------------- End statusline/tabline

    ------------------------------------------------ Linting
    -- Keep the sign gutter open at all times
    g.ale_sign_column_always = 1
    g.ale_sign_error = '✗'
    g.ale_sign_warning = '▲'
    g.ale_sign_info = 'i'
    -- Lint on text change
    --g.ale_lint_on_text_changed = 'never'
    --g.ale_lint_on_text_changed = 'normal'
    -- Lint on opening a file
    --g.ale_lint_on_enter = 1
    -- Fix files when you saving
    --g.ale_fix_on_save = 0
    -- Show 3 lines of errors (default: 10)
    g.ale_list_window_size = 3
    -- Speed up executable checks
    g.ale_cache_executable_check_failures = 1
    -- Disable certain features
    g.ale_virtualenv_dir_names = {}
    -- Explicitly enable linters
    g.ale_linters = {
        rust = {
            'analyzer',
            'rls',
            'cargo',
        },
        c = {
            'clangd',
            'clangtidy',
            'clangcheck',
            'cppcheck',
            'flawfinder',
            'clazy',
            'cpplint',
        },
        cpp = {
            'clangd',
            'clangtidy',
            'clangcheck',
            'cppcheck',
            'flawfinder',
            'clazy',
            'cpplint',
        },
    }
    -- Explicitly enable fixers
    g.ale_fixers = {
        rust = {
            'rustfmt',
            'remove_trailing_lines',
            'trim_whitespace',
        },
        c = {
            'clang-format',
            'remove_trailing_lines',
            'trim_whitespace',
            'uncrustify',
        },
        cpp = {
            'clang-format',
            'remove_trailing_lines',
            'trim_whitespace',
            'uncrustify',
        },
        javascript = {
            'eslint',
            'fecs',
            'importjs',
            'prettier',
            'prettier_eslint',
            'standard',
            'xo',
            'remove_trailing_lines',
            'trim_whitespace',
        },
        python = {
            'add_blank_lines_for_python_control_statements',
            'autopep8',
            'black',
            'isort',
            'yapf',
            'remove_trailing_lines',
            'trim_whitespace',
        },
        java = {
            'google_java_format',
            'remove_trailing_lines',
            'trim_whitespace',
            'uncrustify',
        },
    }
    g.ale_rust_rls_toolchain = 'stable'
    g.ale_rust_rls_config = {
        rust = {
            clippy_preference = 'on',
        }
    }
    g.ale_rust_rustc_options = ''
    g.ale_rust_cargo_check_all_targets = 1
    g.ale_rust_cargo_check_tests = 1
    g.ale_rust_cargo_check_examples = 1
    g.ale_rust_cargo_use_clippy = fn.executable('cargo-clippy')
    -------------------------------------------- End linting

    -------------------------------------- Language specific
    -- Dart
    g.dart_html_in_string = true
    g.dart_style_guide = 2
    g.dart_format_on_save = 0
    -- Rust
    g.rustfmt_autosave = 1
    g.racer_experimental_completer = 1
    g.racer_insert_paren = 1
    if (fn.has('win16') or fn.has('win32') or fn.has('win64')) then
        g.rust_clip_command = 'win32yank'
    elseif fn.has('unix') then
        local uname = fn.system('uname -s')
        if o.uname == 'Darwin' then
            g.rust_clip_command = 'pbcopy'
        else
            g.rust_clip_command = 'xclip -selection clipboard'
        end
    end
    ---------------------------------- End language specific

    ---------------------------------------- Language server
    --- lspsaga
    local saga = require 'lspsaga'
    saga.init_lsp_saga()
    ------------------------------------ End language server
    ------------------------------------------- Autocomplete
    local cmp = require('cmp')
    cmp.setup({
            snippet = {
                expand = function(args)
                    fn['vsnip#anonymous'](args.body)
                end,
            },
            mapping = {
                --['<C-y>'] = cmp.mapping.confirm({ select = true }),
                ['<Tab>'] = cmp.mapping(cmp.mapping.select_next_item(), { 'i', 's' }),
                ['<C-d>'] = cmp.mapping.scroll_docs(-4),
                ['<C-f>'] = cmp.mapping.scroll_docs(4),
                ['<C-Space>'] = cmp.mapping.complete(),
                ['<C-e>'] = cmp.mapping.close(),
                ['<CR>'] = cmp.mapping.confirm({
                        behavior = cmp.ConfirmBehavior.Replace,
                        select = true,
                    })
            },
            sources = {
                { name = 'path' },
                { name = 'buffer' },
                { name = 'nvim_lsp' },
                { name = 'crates' },
                { name = 'emoji' },
                { name = 'spell' },
                { name = 'tags' },
            }
        })
    -- The nvim-cmp almost supports LSP's capabilities so You should advertise it to LSP servers..
    local capabilities = vim.lsp.protocol.make_client_capabilities()
    capabilities = require('cmp_nvim_lsp').update_capabilities(capabilities)

    local servers = {
        'angularls',
        --'arduino_language_server',
        --'bashls',
        --'ccls',
        'clangd',
        'cmake',
        --'cssls',
        --'dartls',
        --'denols',
        --'dockerls',
        'efm',
        --'flow',
        --'gdscript',
        'gopls',
        'html',
        --'java_language_server',
        --'jdtls',
        --'jedi_language_server',
        'jsonls',
        --'kotlin_language_server',
        'powershell_es',
        --'pylsp',
        'pyright',
        'rls',
        'rust_analyzer',
        --'sqlls',
        'sumneko_lua',
        'svelte',
        --'tailwindcss',
        --'texlab',
        'tsserver',
        'vimls',
        --'volar',
        --'vuels',
        'yamlls',
    }
    for _,server in pairs(servers) do
        require('lspconfig')[server].setup{
            -- advertise capabilities to language servers.
            capabilities = capabilities,
        }
    end
    --------------------------------------- End Autocomplete
end)

if first_time_packer then
    cmd 'PackerSync'
end
