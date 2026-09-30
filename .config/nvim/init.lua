---------------------------------------------------------------------- No-plugin

---------------------------------------------------- Aliases
local execute = vim.api.nvim_command
--local opt = vim.opt -- global
local api = vim.api -- access vim api
local o = vim.o -- global
local g = vim.g -- global for let options
--local wo = vim.wo -- window local
--local bo = vim.bo -- buffer local
local fn = vim.fn -- access vim functions
local cmd = vim.cmd -- vim commands
--local diagnostic = vim.diagnostic -- vim diagnostic
--local lsp = vim.lsp -- vim lsp
local win = fn.has("win16") or fn.has("win32") or fn.has("win64")
local linux = fn.has("unix") and not (fn.system("uname -s"):gsub("\n", "") == "Darwin")
local mac = fn.has("unix") and fn.system("uname -s"):gsub("\n", "") == "Darwin"
------------------------------------------------ End aliases

---------------------------------------------------- General
--o.nocompatible = true
cmd("filetype plugin on")
-- Display all matching files when we tab complete
o.wildmenu = true
o.wildignorecase = true
-- Auto reload file on changes outside editor
o.autoread = true
o.hidden = true
o.cmdheight = 2
--set encoding=utf-8
o.mouse = "a"
if g.neovide then
    -- Put anything you want to happen only in Neovide here
    o.guifont = "Iosevka Nerd Font:h14"
    g.neovide_cursor_animation_length = 0
    -- Helper function for transparency formatting
    -- g:neovide_transparency should be 0 if you want to unify transparency of content and title bar.
    g.neovide_opacity = 0.8
    g.transparency = 0.8
    g.neovide_floating_blur_amount_x = 2.0
    g.neovide_floating_blur_amount_y = 2.0
end
o.linespace = 4
o.ignorecase = true
o.smartcase = true
o.smartindent = true
o.confirm = true
o.signcolumn = "yes"
o.number = true
--o.relativenumber = true
o.cursorline = true
o.scrolloff = 10
o.wrap = true
--o.colorcolumn = '80,100,120,140,160,180,200'
o.binary = true
--o.list = true
--o.listchars = 'eol:$,tab:>-,trail:_,extends:>,precedes:<'
o.concealcursor = ""
o.conceallevel = 1
o.backspace = "indent,eol,start"
o.spell = true
o.completeopt = "menu,preview,menuone,longest"
if fn.executable("pyenv") then
    g.python_host_prog = fn.system('pyenv shims | grep "/python2$" | tr -d "\n"')
    g.python3_host_prog = fn.system('pyenv shims | grep "/python3$" | tr -d "\n"')
end
if not vim.env.PUPPETEER_EXECUTABLE_PATH then
    local chrome_candidates = mac
            and {
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "/Applications/Chromium.app/Contents/MacOS/Chromium",
                "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            }
        or linux and {
            "/usr/bin/google-chrome-stable",
            "/usr/bin/google-chrome",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
        }
        or {}
    for _, path in ipairs(chrome_candidates) do
        if fn.executable(path) == 1 then
            vim.env.PUPPETEER_EXECUTABLE_PATH = path
            break
        end
    end
end
------------------------------------------------ End General

----------------------------------------------- Highlighting
cmd("syntax enable")
cmd("syntax on")
------------------------------------------- End Highlighting

------------------------------------------------------ Netrw
g.netrw_banner = 0 -- disable annoying banner
g.netrw_browse_split = 4 -- open in prior window
g.netrw_altv = 1 -- open splits to the right
g.netrw_liststyle = 3 -- tree view
g.netrw_list_hide = { fn["netrw_gitignore#Hide()"], ",\\(^\\|\\s\\s\\)\\zs\\.\\S\\+" }
-------------------------------------------------- End Netrw

----------------------------------------- Keyboard shortcuts
-- Change leader key
g.mapleader = " "
g.maplocalleader = "\\"
-- Visual indication of leader key timeout
o.showcmd = true
-- map helper
local function map(mode, lhs, rhs, opts)
    local options = { noremap = true }
    if opts then
        options = vim.tbl_extend("force", options, opts)
    end
    api.nvim_set_keymap(mode, lhs, rhs, options)
end

-- Save
map("n", "<C-s>", "<cmd>w<CR>", { desc = "general save file" })
-- Copy and paste
map("n", "<C-c>", "<cmd>%y+<CR>", { desc = "copy whole file" })
map("v", "<C-c>", '"+y', { desc = "copy selected" })
map("v", "<C-x>", '"+c', { desc = "cut selected" })
map("v", "<S-Insert>", 'c<ESC>"+p')
map("i", "<S-Insert>", '<ESC>"+pa')
-- Map Ctrl-Del to delete word
map("i", "<C-Delete>", "<ESC>bdwi")
-- Tab switching (buffers)
map("n", "<tab>", ":bn<cr>", { desc = "buffer goto next" })
map("n", "<S-tab>", ":bp<cr>", { desc = "buffer goto prev" })
--map('n', '<c-tab>', ':tabnext<cr>', { noremap = false })
--map('n', '<leader><tab>', ':tabnext<cr>', { noremap = false })
--map('n', '<c-s-tab>', ':tabprevious<cr>', { noremap = false })
--map('n', '<leader><leader><tab>', ':tabprevious<cr>', { noremap = false })
-- Key mapping for native LSP
--map('n', 'ff', '<cmd>lua vim.lsp.buf.format()<cr>')
-- Misc
map("i", "<C-b>", "<ESC>^i", { desc = "move beginning of line" })
map("i", "<C-e>", "<End>", { desc = "move end of line" })
map("i", "<C-h>", "<Left>", { desc = "move left" })
map("i", "<C-l>", "<Right>", { desc = "move right" })
map("i", "<C-j>", "<Down>", { desc = "move down" })
map("i", "<C-k>", "<Up>", { desc = "move up" })
-- Windows
map("n", "<C-h>", "<C-w>h", { desc = "switch window left" })
map("n", "<C-l>", "<C-w>l", { desc = "switch window right" })
map("n", "<C-j>", "<C-w>j", { desc = "switch window down" })
map("n", "<C-k>", "<C-w>k", { desc = "switch window up" })
-- Highlight
map("n", "<Esc>", "<cmd>noh<CR>", { desc = "clear highlights" })
------------------------------------- End keyboard shortcuts

---------------------------------------------------- Autocmd
-------- This function is taken from https://github.com/norcalli/nvim_utils
local function nvim_create_augroups(definitions)
    for group_name, definition in pairs(definitions) do
        execute("augroup " .. group_name)
        execute("autocmd!")
        for _, def in ipairs(definition) do
            local parts = vim.iter({ "autocmd", def }):flatten():totable()
            local command = table.concat(parts, " ")
            execute(command)
        end
        execute("augroup END")
    end
end

-- https://neovim.discourse.group/t/reload-init-lua-and-all-require-d-scripts/971/11
function _G.ReloadConfig()
    local hls_status = vim.v.hlsearch
    for name, _ in pairs(package.loaded) do
        if name:match("^cnull") then
            package.loaded[name] = nil
        end
    end
    dofile(vim.env.MYVIMRC)
    if hls_status == 0 then
        vim.opt.hlsearch = false
    end
end

local autocmds = {
    -- reload_vimrc = {
    --     -- Reload vim config automatically (incompatible with lazy.nvim)
    --     { "BufWritePost", [[$VIM_PATH/{*.vim,*.yaml,vimrc} nested source $MYVIMRC | redraw]] },
    --     { "BufWritePre", "$MYVIMRC", "lua ReloadConfig()" },
    -- },
    terminal_job = {
        --{ 'TermOpen', '*', [[tnoremap <buffer> <Esc> <c-\><c-n>]] };
        { "TermOpen", "*", "startinsert" },
        { "TermOpen", "*", "setlocal listchars= nonumber norelativenumber" },
    },
    save_shada = {
        { "VimLeave", "*", "wshada!" },
    },
    resize_windows_proportionally = {
        { "VimResized", "*", ":wincmd =" },
    },
    --toggle_search_highlighting = {
    --    { 'InsertEnter', '*', 'setlocal nohlsearch' };
    --};
    lua_highlight = {
        { "TextYankPost", "*", [[silent! lua vim.highlight.on_yank({higroup='IncSearch', timeout=400})]] },
    },
    --ansi_esc_log = {
    --    { 'BufEnter', '*.log', ':AnsiEsc' };
    --};
    --file_type = {
    --  { 'FileType', 'html',       'setlocal shiftwidth=2 tabstop=2 expandtab' },
    --  { 'FileType', 'xml',        'setlocal shiftwidth=2 tabstop=2 expandtab' },
    --  { 'FileType', 'javascript', 'setlocal shiftwidth=2 tabstop=2 expandtab' },
    --  { 'FileType', 'typescript', 'setlocal shiftwidth=2 tabstop=2 expandtab' },
    --  { 'FileType', 'json',       'setlocal shiftwidth=2 tabstop=2 expandtab' },
    --  { 'FileType', 'dart',       'setlocal shiftwidth=2 tabstop=2 expandtab' },
    --  { 'FileType', 'markdown',   'setlocal shiftwidth=2 tabstop=2 noexpandtab' },
    --  { 'FileType', 'go', 'setlocal nolist'};
    --}
}

nvim_create_augroups(autocmds)
------------------------------------------------ End autocmd

------------------------------------------------------- Misc
--------------------------------------------------- End Misc

------------------------------------------- Custom functions
-- How long a discovered model list stays fresh, in seconds.
local LLM_MODELS_TTL = 600
-- Model lists discovered from OpenAI/Anthropic-compatible endpoints, keyed by
-- base URL: llm_models_cache[base_url] = { models = {...}, fetched_at = <epoch>, auth = <sha256> }
local llm_models_cache = {}

-- Accept a plain value or a thunk returning it, without ever raising.
local function resolve_value(value)
    if type(value) == "function" then
        local ok, resolved = pcall(value)
        return ok and resolved or nil
    end
    return value
end

--- List the models exposed by an OpenAI/Anthropic-compatible endpoint.
--- Never errors; an unreachable or unauthorized endpoint degrades to `opts.fallback`.
--- The request uses `opts.timeout` milliseconds, with a short wait allowance.
---@param base_url string Endpoint root, e.g. "http://127.0.0.1:8317". "/v1/models"
---   is appended internally and trailing slashes are ignored.
---@param opts table|nil Optional fields:
---   api_key  string|fun():string  Sent as "Authorization: Bearer" and "x-api-key"
---                                  so OpenAI- and Anthropic-style gateways both accept it.
---   headers  table|fun():table    Extra request headers, applied first.
---   timeout  number               Milliseconds, default 3000.
---   fallback string[]             Model list used when the endpoint cannot be read.
---@return string[] # Sorted and deduplicated model IDs.
local function get_llm_models(base_url, opts)
    opts = opts or {}
    local root = (resolve_value(base_url) or ""):gsub("/+$", "")
    local fallback = opts.fallback or {}
    if root == "" then
        return fallback
    end

    -- Model lists are per-account, so a rotated API key must invalidate the cache.
    local api_key = resolve_value(opts.api_key)
    local auth = api_key and vim.fn.sha256(api_key) or ""
    local cached = llm_models_cache[root]
    if cached and cached.auth == auth and (os.time() - cached.fetched_at) < LLM_MODELS_TTL then
        return cached.models
    end

    if fn.executable("curl") ~= 1 then
        return fallback
    end

    local headers = {}
    local extra = resolve_value(opts.headers)
    if type(extra) == "table" then
        headers = vim.tbl_extend("force", headers, extra)
    end
    if api_key and api_key ~= "" then
        -- Both auth conventions are in the wild, and unknown headers are ignored.
        headers["Authorization"] = "Bearer " .. api_key
        headers["x-api-key"] = api_key
    end

    local timeout_ms = opts.timeout or 3000
    -- Delimit the status so a body-ending newline cannot be mistaken for the separator.
    local argv = {
        "curl",
        "--silent",
        "--max-time",
        tostring(math.ceil(timeout_ms / 1000)),
        "--write-out",
        "\\n<<HTTP:%{http_code}>>",
    }
    for key, value in pairs(headers) do
        argv[#argv + 1] = "--header"
        argv[#argv + 1] = key .. ": " .. value
    end
    argv[#argv + 1] = root .. "/v1/models"

    local requested, res = pcall(function()
        return vim.system(argv, { text = true, timeout = timeout_ms }):wait(timeout_ms + 500)
    end)
    if not (requested and type(res) == "table" and res.code == 0 and type(res.stdout) == "string") then
        return fallback
    end
    local body, status = res.stdout:match("^(.*)\n<<HTTP:(%d+)>>%s*$")
    if not (type(body) == "string" and type(status) == "string" and tonumber(status) == 200) then
        return fallback
    end

    local decoded_ok, data = pcall(vim.json.decode, body)
    if not (decoded_ok and type(data) == "table") then
        return fallback
    end

    -- OpenAI-style gateways nest the list under "data"; some proxies use "models".
    local entries = type(data.data) == "table" and data.data or data
    if type(data.models) == "table" then
        entries = data.models
    end

    local seen, models = {}, {}
    for _, item in ipairs(entries) do
        local id = type(item) == "table" and (item.id or item.name) or item
        if type(id) == "string" and id ~= "" and not seen[id] then
            seen[id] = true
            models[#models + 1] = id
        end
    end
    if #models == 0 then
        return fallback
    end
    table.sort(models)

    llm_models_cache[root] = { models = models, fetched_at = os.time(), auth = auth }
    return models
end

-- LLM provider endpoints. get_llm_models appends "/v1/models" to these.
local CLIPROXY_BASE_URL = "http://127.0.0.1:8317"
local CKEY_BASE_URL = "https://api.xah.io"
local KILO_BASE_URL = "https://api.kilo.ai/api/gateway"

-- Looked up lazily so a key exported after startup is picked up, and shared by the
-- adapter and its model discovery so the two can never disagree on credentials.
local function env_key(name, placeholder)
    return function()
        return os.getenv(name) or placeholder
    end
end
--------------------------------------- End custom functions

-------------------------------------------- External config
-- exrc allows loading local config files.
o.exrc = true
o.secure = true
---------------------------------------- End external config

----------------------------------------------------------------- End No-plugins

-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
    local lazyrepo = "https://github.com/folke/lazy.nvim.git"
    local out = vim.fn.system({ "git", "clone", "--filter=blob:none", "--branch=stable", lazyrepo, lazypath })
    if vim.v.shell_error ~= 0 then
        vim.api.nvim_echo({
            { "Failed to clone lazy.nvim:\n", "ErrorMsg" },
            { out, "ErrorMsg" },
            { "\nPress any key to exit..." },
        }, true, {})
        vim.fn.getchar()
        os.exit(1)
    end
end
vim.opt.rtp:prepend(lazypath)

-- Setup lazy.nvim
require("lazy").setup({
    -- Configure any other settings here. See the documentation for more details.
    -- colorscheme that will be used when installing plugins.
    install = { colorscheme = { "gruvbox" } },
    -- automatically check for plugin updates
    checker = { enabled = true },
    spec = {
        -- add your plugins here
        -- Showing keybindings with descriptions
        { "folke/which-key.nvim" },
        -- Fuzzy finder and file browser
        {
            "nvim-telescope/telescope-project.nvim",
            dependencies = {
                "nvim-telescope/telescope.nvim",
                "nvim-lua/plenary.nvim",
                "nvim-telescope/telescope-file-browser.nvim",
            },
            config = function()
                require("telescope").setup({
                    extensions = {
                        file_browser = {
                            theme = "ivy",
                            -- disables netrw and use telescope-file-browser in its place
                            hijack_netrw = false,
                            collapse_dirs = true,
                            auto_depth = false,
                        },
                    },
                })
                -- To get telescope-file-browser loaded and working with telescope,
                -- you need to call load_extension, somewhere after setup function:
                require("telescope").load_extension("file_browser")
                require("telescope").load_extension("project")

                local original_select = vim.ui.select
                -- These untagged prompts are CodeCompanion call sites at the pinned version;
                -- keep this version-coupled list explicit, not based on item count or stack inspection.
                local codecompanion_untagged_prompts = {
                    ["Select a rule"] = true,
                    ["Approval mode for this chat"] = true,
                    ["Select an image source"] = true,
                }
                rawset(vim.ui, "select", function(items, select_opts, on_choice)
                    if
                        not select_opts
                        or (
                            select_opts.kind ~= "codecompanion.nvim"
                            and not (select_opts.kind == nil and codecompanion_untagged_prompts[select_opts.prompt])
                        )
                    then
                        return original_select(items, select_opts, on_choice)
                    end

                    local pickers = require("telescope.pickers")
                    local finders = require("telescope.finders")
                    local actions = require("telescope.actions")
                    local action_state = require("telescope.actions.state")
                    local selected_item, selected_index, done
                    local picker = pickers.new({}, {
                        prompt_title = select_opts.prompt,
                        finder = finders.new_table({
                            results = items,
                            entry_maker = function(item)
                                local display = select_opts.format_item and select_opts.format_item(item)
                                    or tostring(item)
                                return { value = item, display = display, ordinal = display }
                            end,
                        }),
                        sorter = require("telescope.config").values.generic_sorter({}),
                        attach_mappings = function(prompt_bufnr)
                            vim.api.nvim_create_autocmd("BufWipeout", {
                                buffer = prompt_bufnr,
                                once = true,
                                callback = function()
                                    vim.schedule(function()
                                        if not done then
                                            done = true
                                            on_choice(selected_item, selected_index)
                                        end
                                    end)
                                end,
                            })
                            actions.select_default:replace(function()
                                local entry = action_state.get_selected_entry()
                                if entry then
                                    selected_item, selected_index = entry.value, entry.index
                                end
                                actions.close(prompt_bufnr)
                            end)
                            return true
                        end,
                    })
                    picker:find()
                end)

                map("n", "<leader><leader>", "<cmd>Telescope<cr>")
                map(
                    "n",
                    "<leader><leader>f",
                    '<cmd>lua require"telescope.builtin".find_files({ find_command = {"rg", "--files", "--hidden", "-g", "!.git" }})<cr>'
                )
                map("n", "<leader><leader>br", "<cmd>Telescope file_browser<cr>")
                map("n", "<leader><leader>pj", "<cmd>Telescope project<cr>")
                map("n", "<leader><leader>s", "<cmd>Telescope grep_string<cr>")
                map("n", "<leader><leader>g", "<cmd>Telescope live_grep<cr>")
                map("n", "<leader><leader>bu", "<cmd>Telescope buffers<cr>")
                map("n", "<leader><leader>h", "<cmd>Telescope help_tags<cr>")
            end,
        },
        -- File explorer with Miller columns
        {
            "echasnovski/mini.files",
            version = false,
            dependencies = { "kyazdani42/nvim-web-devicons" },
            config = function()
                local MiniFiles = require("mini.files")
                MiniFiles.setup({
                    mappings = {
                        go_in_plus = "<CR>",
                    },
                    windows = {
                        preview = true,
                        width_focus = 30,
                        width_preview = 40,
                    },
                    options = {
                        use_as_default_explorer = true,
                    },
                })

                local toggle_files = function()
                    if not MiniFiles.close() then
                        local bufname = vim.api.nvim_buf_get_name(0)
                        if vim.fn.filereadable(bufname) == 1 then
                            MiniFiles.open(bufname, true)
                        else
                            MiniFiles.open(vim.uv.cwd(), true)
                        end
                    end
                end

                vim.keymap.set("n", "<leader>e", toggle_files, { desc = "explorer toggle mini.files (current file)" })
                vim.keymap.set("n", "<leader>E", function()
                    if not MiniFiles.close() then
                        MiniFiles.open(vim.uv.cwd(), true)
                    end
                end, { desc = "explorer open mini.files (cwd)" })
            end,
        },
        -- Floating notifications manager
        {
            "echasnovski/mini.notify",
            version = false,
            config = function()
                local notify = require("mini.notify")
                notify.setup({
                    window = {
                        config = {
                            border = "rounded",
                        },
                    },
                })
                vim.notify = notify.make_notify()
            end,
        },
        -- Intercept unhandled errors and messages to floating notifications
        {
            "folke/noice.nvim",
            event = "VeryLazy",
            dependencies = {
                "MunifTanjim/nui.nvim",
            },
            opts = {
                -- Keep the classic bottom command-line
                cmdline = {
                    enabled = true,
                    view = "cmdline",
                },
                -- Route all messages, warnings, and unhandled errors to mini.notify
                messages = {
                    enabled = true,
                    view = "notify",
                    view_error = "notify",
                    view_warn = "notify",
                },
                popupmenu = { enabled = false },
                notify = { enabled = false },
                lsp = {
                    progress = { enabled = false },
                    signature = { enabled = false },
                    hover = { enabled = false },
                    override = {
                        ["vim.lsp.util.convert_input_to_markdown_lines"] = false,
                        ["vim.lsp.util.stylize_markdown"] = false,
                        ["cmp.entry.get_documentation"] = false,
                    },
                },
            },
        },
        -- Editor toolings
        {
            "williamboman/mason.nvim",
            dependencies = {
                { "williamboman/mason-lspconfig.nvim" },
                { "neovim/nvim-lspconfig" },
            },
            config = function()
                require("mason").setup()
                require("mason-lspconfig").setup({
                    ensure_installed = {
                        --- LLM
                        "copilot",
                        --- Code quality/security
                        "codebook",
                        "sourcery",
                        --- DB
                        "sqlls",
                        --- Neovim
                        "lua_ls",
                        "vimls",
                        --- DevOps
                        "bashls",
                        "docker_compose_language_service",
                        "dockerls",
                        "terraformls",
                        "tflint",
                        "yamlls",
                        --- HTML/CSS/JS/TS/JSON
                        "cssls",
                        "cssmodules_ls",
                        "emmet_ls",
                        "eslint",
                        "html",
                        "jsonls",
                        "stylelint_lsp",
                        "ts_ls",
                        "tailwindcss",
                        "vue_ls",
                        "vuels",
                        --- Python
                        "pyrefly",
                        "ty",
                    },
                    --automatic_installation = true,
                    handlers = {
                        -- The first entry (without a key) will be the default handler
                        -- and will be called for each installed server that doesn't have
                        -- a dedicated handler.
                        function(server_name) -- default handler (optional)
                            -- Prevent some LSP servers from autostart
                            local no_autostart = { deno = true, denols = true }
                            local no_single_file_support = { rust_analyzer = true }
                            vim.lsp.config(server_name, {
                                autostart = not no_autostart[server_name],
                                single_file_support = not no_single_file_support[server_name],
                            })
                        end,
                        -- Next, you can provide a dedicated handler for specific servers.
                        ["copilot"] = function()
                            vim.lsp.config("copilot", {
                                autostart = true,
                                single_file_support = true,
                            })
                        end,
                        ["lua_ls"] = function()
                            vim.lsp.config("lua_ls", {
                                settings = {
                                    Lua = {
                                        format = {
                                            enable = false,
                                        },
                                    },
                                },
                            })
                        end,
                        -- For example, a handler override for the `rust_analyzer`:
                        ["rust_analyzer"] = function()
                            vim.lsp.config("rust_analyzer", {
                                settings = {
                                    ["rust-analyzer"] = {
                                        checkOnSave = {
                                            enable = false,
                                        },
                                        diagnostics = {
                                            enable = false,
                                        },
                                    },
                                },
                            })
                        end,
                    },
                })

                -- LSP Attach configurations
                vim.api.nvim_create_autocmd("LspAttach", {
                    group = vim.api.nvim_create_augroup("LspCustomAttach", { clear = true }),
                    callback = function(args)
                        local client = vim.lsp.get_client_by_id(args.data.client_id)
                        if not client then
                            return
                        end

                        -- Disable lua_ls formatting to avoid conflict with stylua
                        if client.name == "lua_ls" then
                            client.server_capabilities.documentFormattingProvider = false
                            client.server_capabilities.documentRangeFormattingProvider = false
                        end

                        -- Inline ghost text for Copilot
                        if client:supports_method(vim.lsp.protocol.Methods.textDocument_inlineCompletion, args.buf) then
                            vim.lsp.inline_completion.enable(true)

                            -- Accept ghost text with Ctrl-f (non-conflicting with Zellij)
                            vim.keymap.set("i", "<C-f>", vim.lsp.inline_completion.get, {
                                desc = "LSP: accept inline completion",
                                buffer = args.buf,
                            })
                        end
                    end,
                })
            end,
        },
        -- Language clients
        --{'neoclide/coc.nvim', branch = 'release'}
        {
            "ray-x/navigator.lua",
            dependencies = {
                {
                    "ray-x/guihua.lua",
                    run = "cd lua/fzy && make",
                },
                { "neovim/nvim-lspconfig" },
                { "nvim-treesitter/nvim-treesitter" },
            },
            config = function()
                require("navigator").setup({
                    mason = true,
                    lsp = {
                        format_on_save = false,
                        disable_format_cap = { "lua_ls" },
                        diagnostic = {
                            virtual_text = true,
                            underline = true,
                            signs = false,
                        },
                    },
                })

                -- Setup LSP servers not included by default in navigator.lua
                vim.lsp.config("bacon_ls", {
                    init_options = {
                        updateOnSave = true,
                        updateOnSaveWaitMillis = 1000,
                        updateOnChange = true,
                    },
                })
            end,
        },
        -- Linters
        {
            "nvimdev/guard.nvim",
            -- Builtin configuration, optional
            dependencies = {
                "nvimdev/guard-collection",
            },
            config = function()
                local ft = require("guard.filetype")

                -- Codespell
                if fn.executable("codespell") == 1 then
                    ft("*"):lint("codespell")
                end
                -- Format c, cpp, cs, java, cuda, proto
                if fn.executable("clang-format") == 1 then
                    ft("c,cpp,cs,java,cuda,proto"):fmt("clang-format")
                end
                -- Eslint for js, jsx, ts, tsx, vue
                if fn.executable("eslint") == 1 then
                    ft("js,jsx,ts,tsx,vue"):fmt({
                        cmd = "eslint",
                        args = { "--fix" },
                    }):lint("eslint")
                end
                -- Prettier format html, css, json, etc..
                if fn.executable("prettier") == 1 then
                    ft("typescript,javascript,typescriptreact,html,css,scss,json,yaml,markdown,graphql,md,txt"):fmt(
                        "prettier"
                    )
                end
                -- Golang
                if fn.executable("gofmt") == 1 then
                    ft("go"):fmt("gofmt")
                end
                -- Rust
                if fn.executable("rustfmt") == 1 then
                    ft("rust"):fmt("rustfmt")
                end
                -- Python
                if fn.executable("uvx") == 1 then
                    ft("python"):fmt({
                        cmd = "uvx",
                        args = { "ruff", "format", fn.expand("%") },
                    })
                end
                -- Lua
                if fn.executable("stylua") == 1 then
                    ft("lua"):fmt("stylua")
                end
                -- Lint protobuf
                if fn.executable("buf") == 1 then
                    ft("proto"):lint({
                        cmd = "buf",
                        args = { "lint" },
                    })
                end

                -- Call setup() LAST!
                -- change this anywhere in your config (or not), these are the defaults
                g.guard_config = {
                    -- format on write to buffer
                    fmt_on_save = false,
                    -- use lsp if no formatter was defined for this filetype
                    lsp_as_default_formatter = true,
                    -- whether or not to save the buffer after formatting
                    save_on_fmt = false,
                    -- automatic linting
                    auto_lint = true,
                    -- how frequently can linters be called
                    lint_interval = 1000,
                    -- show diagnostic after format done
                    refresh_diagnostic = true,
                    -- always save file after call Guard fmt
                    always_save = false,
                }

                -- Key mapping for guard.nvim
                map("n", "ff", "<cmd>Guard fmt<cr>")
            end,
        },
        -- Debugger
        {
            "rcarriga/nvim-dap-ui",
            dependencies = {
                "mfussenegger/nvim-dap",
                "nvim-neotest/nvim-nio",
            },
            config = function()
                local dap, dapui = require("dap"), require("dapui")
                dap.listeners.before.attach.dapui_config = function()
                    dapui.open()
                end
                dap.listeners.before.launch.dapui_config = function()
                    dapui.open()
                end
                dap.listeners.before.event_terminated.dapui_config = function()
                    dapui.close()
                end
                dap.listeners.before.event_exited.dapui_config = function()
                    dapui.close()
                end
                dapui.setup()
            end,
        },
        -- AI code completion
        -- Github Copilot
        --{
        --  "zbirenbaum/copilot.lua",
        --  cmd = "Copilot",
        --  event = "InsertEnter",
        --  config = function()
        --    require("copilot").setup({})
        --  end,
        --},
        ---- TODO: Self-hosted LLM backend
        {
            "olimorris/codecompanion.nvim",
            keys = {
                { "<leader>aa", "<cmd>CodeCompanionActions<cr>", mode = { "n", "v" }, desc = "AI Actions Palette" },
                { "<leader>ac", "<cmd>CodeCompanionChat Toggle<cr>", mode = { "n", "v" }, desc = "AI Chat Toggle" },
                { "<leader>ae", "<cmd>CodeCompanion<cr>", mode = { "n", "v" }, desc = "AI Inline Edit" },
                { "<leader>af", "<cmd>CodeCompanion /fix<cr>", mode = { "v" }, desc = "AI Fix Selected Code" },
                { "<leader>ap", "<cmd>CodeCompanionChat Add<cr>", mode = { "v" }, desc = "AI Add Selection to Chat" },
            },
            opts = {
                adapters = {
                    http = {
                        cliproxyapi = function()
                            return require("codecompanion.adapters").extend("anthropic", {
                                name = "cliproxyapi",
                                formatted_name = "CLIProxyAPI",
                                url = CLIPROXY_BASE_URL .. "/v1/messages",
                                env = {
                                    api_key = env_key("CLIPROXYAPI_API_KEY", "cliproxyapi"),
                                },
                                schema = {
                                    model = {
                                        default = "sonnet",
                                        choices = function()
                                            return get_llm_models(CLIPROXY_BASE_URL, {
                                                api_key = env_key("CLIPROXYAPI_API_KEY", "cliproxyapi"),
                                                timeout = 1000, -- loopback: fail fast when the proxy is down
                                                fallback = { "sonnet" },
                                            })
                                        end,
                                    },
                                },
                            })
                        end,
                        ckey = function()
                            return require("codecompanion.adapters").extend("anthropic", {
                                name = "ckey",
                                formatted_name = "CKey",
                                url = CKEY_BASE_URL .. "/v1/messages",
                                env = {
                                    api_key = env_key("CKEY_API_KEY", "CKEY_API_KEY"),
                                },
                                schema = {
                                    model = {
                                        default = "forbiddengun/deepseek",
                                        choices = function()
                                            return get_llm_models(CKEY_BASE_URL, {
                                                api_key = env_key("CKEY_API_KEY", "CKEY_API_KEY"),
                                                fallback = { "forbiddengun/deepseek" },
                                            })
                                        end,
                                    },
                                },
                            })
                        end,
                        kilo = function()
                            return require("codecompanion.adapters").extend("anthropic", {
                                name = "kilo",
                                formatted_name = "Kilo",
                                url = KILO_BASE_URL .. "/v1/messages",
                                env = {
                                    api_key = env_key("KILO_API_KEY", "KILO_API_KEY"),
                                },
                                headers = {
                                    Authorization = "Bearer ${api_key}",
                                },
                                schema = {
                                    model = {
                                        default = "kilo-auto/free",
                                        choices = function()
                                            return get_llm_models(KILO_BASE_URL, {
                                                api_key = env_key("KILO_API_KEY", "KILO_API_KEY"),
                                                fallback = { "kilo-auto/free" },
                                            })
                                        end,
                                    },
                                },
                            })
                        end,
                    },
                },
                strategies = {
                    chat = {
                        adapter = "cliproxyapi",
                        model = "sonnet",
                    },
                    inline = {
                        adapter = "cliproxyapi",
                        model = "haiku",
                    },
                },
                opts = {
                    log_level = "DEBUG",
                },
            },
            dependencies = {
                "nvim-lua/plenary.nvim",
                "nvim-treesitter/nvim-treesitter",
            },
        },
        -- Completion engine plugin for neovim written in Lua
        {
            "hrsh7th/nvim-cmp",
            dependencies = {
                "hrsh7th/cmp-buffer",
                "hrsh7th/cmp-nvim-lsp",
                "hrsh7th/cmp-nvim-lsp-signature-help",
                "hrsh7th/cmp-emoji",
                "hrsh7th/cmp-vsnip",
                "hrsh7th/vim-vsnip",
                "FelipeLema/cmp-async-path",
            },
            config = function()
                --local has_words_before = function()
                --    unpack = unpack or table.unpack
                --    local line, col = unpack(api.nvim_win_get_cursor(0))
                --    return col ~= 0
                --        and api.nvim_buf_get_lines(0, line - 1, line, true)[1]:sub(col, col):match("%s") == nil
                --end

                local cycle_inline_completion = function(delta)
                    local ok, cap = pcall(require, "vim.lsp._capability")
                    if not ok then
                        return false
                    end
                    local inline_comp = cap.all and cap.all["inline_completion"]
                    -- The private inline-completion state exposes methods absent from Neovim's public types.
                    ---@type {current: any, count_items: fun(self: any): integer}|nil
                    local completor = inline_comp
                        and inline_comp.active
                        and inline_comp.active[api.nvim_get_current_buf()]
                    if not (completor and completor.current) then
                        return false
                    end

                    if completor:count_items() > 1 then
                        vim.lsp.inline_completion.select({ count = delta })
                    else
                        local request = rawget(completor, "request")
                        if type(request) == "function" then
                            pcall(request, completor, vim.lsp.protocol.InlineCompletionTriggerKind.Invoked)
                        end
                        vim.lsp.inline_completion.select({ count = delta })
                    end
                    return true
                end

                local cmp = require("cmp")
                cmp.setup({
                    completion = {
                        autocomplete = false,
                    },
                    snippet = {
                        -- REQUIRED - you must specify a snippet engine
                        expand = function(args)
                            fn["vsnip#anonymous"](args.body) -- For `vsnip` users.
                            -- vim.snippet.expand(args.body) -- For native neovim snippets (Neovim v0.10+)
                        end,
                    },
                    mapping = cmp.mapping.preset.insert({
                        --['<C-y>'] = cmp.mapping.confirm({ select = true }),
                        ["<Tab>"] = cmp.mapping(function(fallback)
                            if cmp.visible() then
                                cmp.select_next_item()
                            elseif cycle_inline_completion(1) then
                                -- cycled inline completion candidate
                            else
                                fallback()
                            end
                        end, { "i", "s" }),
                        ["<S-Tab>"] = cmp.mapping(function(fallback)
                            if cmp.visible() then
                                cmp.select_prev_item()
                            elseif cycle_inline_completion(-1) then
                                -- cycled inline completion candidate
                            else
                                fallback()
                            end
                        end, { "i", "s" }),
                        ["<C-b>"] = cmp.mapping.scroll_docs(-4),
                        ["<C-f>"] = cmp.mapping(function(fallback)
                            if cmp.visible() then
                                cmp.scroll_docs(4)
                            elseif not vim.lsp.inline_completion.get() then
                                fallback()
                            end
                        end, { "i", "s" }),
                        ["<C-Space>"] = cmp.mapping.complete(),
                        ["<C-e>"] = cmp.mapping.abort(),
                        ["<CR>"] = cmp.mapping.confirm({
                            select = true,
                        }),
                    }),
                    sources = {
                        { name = "async_path" },
                        { name = "buffer" },
                        { name = "nvim_lsp" },
                        { name = "nvim_lsp_signature_help" },
                        { name = "emoji" },
                    },
                })
                -- The nvim-cmp almost supports LSP's capabilities so You should advertise it to LSP servers..
                local capabilities = vim.lsp.protocol.make_client_capabilities()
                capabilities = require("cmp_nvim_lsp").default_capabilities(capabilities)
            end,
        },
        --{
        --  "zbirenbaum/copilot-cmp",
        --  after = { "copilot.lua" },
        --  config = function()
        --    require("copilot_cmp").setup()
        --  end
        --},
        -- Add surrounding brackets, quotes, xml tags,...
        { "tpope/vim-surround" },
        -- Extended matching for the % operator
        { "adelarsq/vim-matchit" },
        -- Autocompletion for pairs
        --{
        --  'Raimondi/delimitMate',
        --  config = function()
        --    -- Expand CR when autocomplete pairs
        --    g.delimitMate_expand_cr = 2
        --    g.delimitMate_expand_space = 1
        --    g.delimitMate_expand_inside_quotes = 1
        --    g.delimitMate_jump_expansion = 1
        --  end
        --},
        -- Multiple cursor
        -- { 'terryma/vim-multiple-cursors' },
        -- Edit a region in new buffer
        { "chrisbra/NrrwRgn" },
        -- Run shell command asynchronously
        { "skywind3000/asyncrun.vim" },
        -- REPL alike
        {
            "thinca/vim-quickrun",
            init = function()
                g.quickrun_no_default_key_mappings = 1
            end,
        },
        -- Toggle terminal
        {
            "akinsho/toggleterm.nvim",
            config = function()
                require("toggleterm").setup()
                local Terminal = require("toggleterm.terminal").Terminal

                -- Keyboard shortcuts
                -- toggleable
                vim.keymap.set(
                    { "n", "t" },
                    "<A-v>",
                    "<cmd>ToggleTerm direction=vertical size=50<CR>",
                    { desc = "terminal toggleable vertical term" }
                )

                vim.keymap.set(
                    { "n", "t" },
                    "<A-h>",
                    "<cmd>ToggleTerm direction=horizontal size=12<CR>",
                    { desc = "terminal toggleable horizontal term" }
                )

                vim.keymap.set(
                    { "n", "t" },
                    "<A-i>",
                    "<cmd>ToggleTerm direction=float<CR>",
                    { desc = "terminal toggle floating term" }
                )

                -- Cli tools
                if fn.executable("pkgx") then
                    local lazygit = Terminal:new({ cmd = "pkgx lazygit", direction = "float", hidden = true })
                    local lazydocker = Terminal:new({ cmd = "pkgx lazydocker", direction = "float", hidden = true })
                    local btm = Terminal:new({ cmd = "pkgx btm", direction = "float", hidden = true })

                    api.nvim_create_user_command("Lazygit", function()
                        if lazygit then
                            lazygit:toggle()
                        end
                    end, { nargs = 0 })
                    api.nvim_create_user_command("Lazydocker", function()
                        if lazydocker then
                            lazydocker:toggle()
                        end
                    end, { nargs = 0 })
                    api.nvim_create_user_command("Btm", function()
                        if btm then
                            btm:toggle()
                        end
                    end, { nargs = 0 })
                end
            end,
        },
        -- Text object per indent level
        { "michaeljsmith/vim-indent-object", ft = { "python" } },
        -- Code commenting
        { "scrooloose/nerdcommenter" },
        -- Git wrapper
        { "tpope/vim-fugitive" },
        -- Git signs in gutter
        {
            "lewis6991/gitsigns.nvim",
            config = function()
                require("gitsigns").setup()
                ---- Key mapping for git signs
                -- Navigation
                map("n", "]c", "&diff ? ']c' : '<cmd>Gitsigns next_hunk<CR>'", { expr = true })
                map("n", "[c", "&diff ? '[c' : '<cmd>Gitsigns prev_hunk<CR>'", { expr = true })

                -- Actions
                map("n", "<leader>hs", ":Gitsigns stage_hunk<CR>")
                map("v", "<leader>hs", ":Gitsigns stage_hunk<CR>")
                map("n", "<leader>hr", ":Gitsigns reset_hunk<CR>")
                map("v", "<leader>hr", ":Gitsigns reset_hunk<CR>")
                map("n", "<leader>hS", "<cmd>Gitsigns stage_buffer<CR>")
                map("n", "<leader>hu", "<cmd>Gitsigns undo_stage_hunk<CR>")
                map("n", "<leader>hR", "<cmd>Gitsigns reset_buffer<CR>")
                map("n", "<leader>hp", "<cmd>Gitsigns preview_hunk<CR>")
                map("n", "<leader>hb", '<cmd>lua require"gitsigns".blame_line{full=true}<CR>')
                map("n", "<leader>tb", "<cmd>Gitsigns toggle_current_line_blame<CR>")
                map("n", "<leader>hd", "<cmd>Gitsigns diffthis<CR>")
                map("n", "<leader>hD", '<cmd>lua require"gitsigns".diffthis("~")<CR>')
                map("n", "<leader>td", "<cmd>Gitsigns toggle_deleted<CR>")

                -- Text object
                map("o", "ih", ":<C-U>Gitsigns select_hunk<CR>")
                map("x", "ih", ":<C-U>Gitsigns select_hunk<CR>")
            end,
        },
        -- Interact with databases
        {
            "kristijanhusak/vim-dadbod-ui",
            dependencies = { "tpope/vim-dadbod" },
        },
        -- Automatically toggle relative line number
        --{ 'jeffkreeftmeijer/vim-numbertoggle' },
        -- Use registers as stack for yank and delete
        { "maxbrunsfeld/vim-yankstack" },
        -- Status line
        {
            "hoob3rt/lualine.nvim",
            dependencies = { "kyazdani42/nvim-web-devicons", opt = true },
            config = function()
                require("lualine").setup({
                    options = {
                        theme = "gruvbox",
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
                    tabline = {
                        lualine_a = { "buffers" },
                        lualine_b = { "branch" },
                        lualine_c = { "filename" },
                        lualine_x = {},
                        lualine_y = {},
                        lualine_z = { "tabs" },
                    },
                    winbar = {
                        lualine_a = {},
                        lualine_b = {},
                        lualine_c = { "filename" },
                        lualine_x = {},
                        lualine_y = {},
                        lualine_z = {},
                    },
                    inactive_winbar = {
                        lualine_a = {},
                        lualine_b = {},
                        lualine_c = { "filename" },
                        lualine_x = {},
                        lualine_y = {},
                        lualine_z = {},
                    },
                    --extensions = {}
                })
            end,
        },
        -- Delete buffers without messing window layout
        {
            "moll/vim-bbye",
            config = function()
                -- Delete buffer without messing layout
                map("n", "<Leader>x", ":Bd<cr>", { noremap = false })
            end,
        },
        -- Maintain coding style per project
        { "editorconfig/editorconfig-vim" },
        -- Language packs
        {
            "sheerun/vim-polyglot",
            init = function()
                g.polyglot_disabled = { "markdown" }
            end,
            config = function()
                -- Dart
                g.dart_html_in_string = true
                g.dart_style_guide = 2
                g.dart_format_on_save = 0
                -- Rust
                g.rustfmt_autosave = 0
                g.racer_experimental_completer = 0
                g.racer_insert_paren = 0
                if win then
                    g.rust_clip_command = "win32yank"
                elseif linux then
                    g.rust_clip_command = "xclip -selection clipboard"
                elseif mac then
                    g.rust_clip_command = "pbcopy"
                end
            end,
        },
        --{ "jidn/vim-dbml" },
        {
            "saecki/crates.nvim",
            event = { "BufRead Cargo.toml" },
            config = function()
                require("crates").setup()
            end,
        },
        -- Highlight using language servers
        {
            "nvim-treesitter/nvim-treesitter",
            branch = "main",
            lazy = false,
            build = ":TSUpdate",
            config = function()
                vim.api.nvim_create_autocmd("FileType", {
                    pattern = "*",
                    callback = function()
                        pcall(vim.treesitter.start)
                    end,
                })
            end,
        },
        { "nvim-treesitter/nvim-treesitter-locals" },
        -- Render preview for Markdown
        {
            "MeanderingProgrammer/render-markdown.nvim",
            dependencies = {
                "nvim-treesitter/nvim-treesitter",
                "kyazdani42/nvim-web-devicons",
            },
            ft = { "markdown", "codecompanion" },
            opts = {
                anti_conceal = {
                    enabled = true,
                },
            },
        },
        -- Image rendering in Neovim (Kitty graphics protocol supported by Zellij 0.45+ and iTerm2 3.5+)
        {
            "3rd/image.nvim",
            build = false,
            opts = {
                backend = "kitty",
                processor = "magick_cli",
                integrations = {
                    markdown = {
                        enabled = true,
                        clear_in_insert_mode = false,
                        download_remote_images = true,
                        only_render_image_at_cursor = false,
                        filetypes = { "markdown", "vimwiki" },
                    },
                },
                max_width = 210,
                max_height = 32,
                max_width_window_percentage = math.huge,
                max_height_window_percentage = math.huge,
                -- Render images in terminal-cell units.
                scale_factor = 1,
                window_overlap_clear_enabled = false,
            },
        },
        -- Inline diagram rendering (Mermaid, PlantUML, D2) powered by image.nvim
        {
            "3rd/diagram.nvim",
            dependencies = {
                "3rd/image.nvim",
            },
            ft = { "markdown", "norg" },
            opts = {
                -- Manual rendering only to avoid textlock (E565) during plugin setup.
                events = { render_buffer = {}, clear_buffer = { "BufLeave" } },
                renderer_options = {
                    mermaid = {
                        background = "transparent",
                        theme = "dark",
                        -- Keep labels readable in moderately complex LR/TD diagrams.
                        scale = 2,
                    },
                    plantuml = {
                        charset = "utf-8",
                    },
                    d2 = {
                        theme_id = 1,
                    },
                },
            },
            config = function(_, opts)
                -- diagram.nvim's cache key only contains the diagram source, not Mermaid
                -- renderer options. Remove stale renders so changes to `scale` take effect.
                vim.fn.delete(vim.fn.stdpath("cache") .. "/diagram-cache/mermaid", "rf")
                vim.fn.mkdir(vim.fn.stdpath("cache") .. "/diagram-cache/mermaid", "p")
                require("diagram").setup(opts)
                local supported_fts = { markdown = true, norg = true }
                local function schedule_render(buf)
                    vim.schedule(function()
                        if not vim.api.nvim_buf_is_valid(buf) then
                            return
                        end
                        if not supported_fts[vim.bo[buf].filetype] then
                            return
                        end
                        for _, window in ipairs(vim.fn.win_findbuf(buf)) do
                            if vim.api.nvim_win_is_valid(window) then
                                vim.api.nvim_win_call(window, function()
                                    require("diagram").render()
                                end)
                                return
                            end
                        end
                    end)
                end
                local group = vim.api.nvim_create_augroup("DiagramInlineRender", { clear = true })
                vim.api.nvim_create_autocmd({ "BufWinEnter", "InsertLeave", "TextChanged" }, {
                    group = group,
                    callback = function(args)
                        schedule_render(args.buf)
                    end,
                })
                schedule_render(vim.api.nvim_get_current_buf())
            end,
            keys = {
                {
                    "<leader>md",
                    function()
                        require("diagram").show_diagram_hover()
                    end,
                    mode = "n",
                    ft = { "markdown" },
                    desc = "Diagram: View diagram under cursor in new tab",
                },
            },
        },
        -- Detect file encoding
        { "s3rvac/AutoFenc" },
        -- Indent line for code wrapping
        -- { "Yggdroot/indentLine" },
        -- Theme
        {
            "morhetz/gruvbox",
            lazy = false,
            priority = 1000,
            config = function()
                g.gruvbox_italic = 1
                g.gruvbox_contrast_dark = "hard"
                g.gruvbox_invert_tabline = 1
                g.gruvbox_invert_indent_guides = 1
                g.gruvbox_transparent_bg = 1
                cmd([[colorscheme gruvbox]])
                cmd([[highlight Normal ctermbg=none ctermfg=white guibg=none]])
                -- LSP inline completion ghost text (Gruvbox NonText defaults to #504945 which has poor contrast)
                api.nvim_set_hl(0, "ComplHint", { fg = "#a89984", ctermfg = 246, italic = true })
                api.nvim_set_hl(0, "ComplHintMore", { fg = "#b8bb26", ctermfg = 142, bold = true })
            end,
        },
    },
})
